import { SignerMnemonicAccountMeta } from 'uniswap/src/features/accounts/types'
import { signTypedData as signTypedDataFunction } from 'uniswap/src/features/transactions/signing'
import { isAddress } from 'utilities/src/addresses/index'
import { PublicClient } from 'viem'
import { DelegationCheckResult } from 'wallet/src/features/smartWallet/delegation/types'
import {
  convertToEIP7702,
  createSignedAuthorization,
  signAndSerializeEIP7702Transaction,
} from 'wallet/src/features/transactions/executeTransaction/eip7702Utils'
import type { TransactionSigner } from 'wallet/src/features/transactions/executeTransaction/services/TransactionSignerService/transactionSignerService'
import type { Provider } from 'wallet/src/features/transactions/executeTransaction/services/providerService'
import { NativeSigner } from 'wallet/src/features/wallet/signing/NativeSigner'
import type { SignerManager } from 'wallet/src/features/wallet/signing/SignerManager'

export function createTransactionSignerService(ctx: {
  getAccount: () => SignerMnemonicAccountMeta
  getProvider: () => Promise<Provider>
  getSignerManager: () => SignerManager
}): TransactionSigner {
  // private method
  const getSigner = async (): Promise<NativeSigner> => {
    const signerManager = ctx.getSignerManager()
    const signer = await signerManager.getSignerForAccount(ctx.getAccount())
    return signer.connect(await ctx.getProvider())
  }

  // public methods
  const prepareTransaction: TransactionSigner['prepareTransaction'] = async (input) => {
    const signer = await getSigner()
    const populatedRequest = await signer.populateTransaction(input.request)
    return populatedRequest
  }

  const signTransaction: TransactionSigner['signTransaction'] = async (input) => {
    const signer = await getSigner()
    const signedTx = await signer.signTransaction(input)
    return signedTx
  }

  const signTypedData: TransactionSigner['signTypedData'] = async (input) => {
    const signer = await getSigner()
    const signedData = await signTypedDataFunction({
      domain: input.domain,
      types: input.types,
      value: input.value,
      signer,
    })
    return signedData
  }

  const sendTransaction: TransactionSigner['sendTransaction'] = async (input) => {
    const provider = await ctx.getProvider()
    const transactionResponse = await provider.sendTransaction(input.signedTx)
    return transactionResponse.hash
  }

  const sendTransactionSync: TransactionSigner['sendTransactionSync'] = async (input) => {
    const jsonRpcProvider = await ctx.getProvider()

    // Send the transaction using the sync method via direct JSON-RPC call, since ethers doesn't support it yet
    // This method returns the receipt directly, not just the transaction hash
    const rawReceipt = await jsonRpcProvider.send('eth_sendRawTransactionSync', [input.signedTx])

    // Format the raw JSON response into a proper ethers TransactionReceipt object
    return jsonRpcProvider.formatter.receipt(rawReceipt)
  }

  const signAndSendTransaction = getSignAndSendTransaction({
    prepareTransaction,
    signTransaction,
    signTypedData,
    sendTransaction,
  })

  return {
    prepareTransaction,
    signTransaction,
    signTypedData,
    sendTransaction,
    sendTransactionSync,
    signAndSendTransaction,
  }
}

export function createBundledDelegationTransactionSignerService(ctx: {
  getAccount: () => SignerMnemonicAccountMeta
  getProvider: () => Promise<Provider>
  getSignerManager: () => SignerManager
  getViemClient: () => Promise<PublicClient>
  getDelegationInfo: () => Promise<DelegationCheckResult>
}): TransactionSigner {
  const baseTransactionSignerService = createTransactionSignerService(ctx)

  // private method
  const getSigner = async (): Promise<NativeSigner> => {
    const signerManager = ctx.getSignerManager()
    const signer = await signerManager.getSignerForAccount(ctx.getAccount())
    return signer.connect(await ctx.getProvider())
  }

  const signTransaction: TransactionSigner['signTransaction'] = async (input) => {
    const signer = await getSigner()
    const delegationInfo = await ctx.getDelegationInfo()
    const account = await ctx.getAccount()
    const chainId = input.chainId

    if (!chainId) {
      throw new Error('Chain ID is required')
    }
    if (!delegationInfo.contractAddress) {
      throw new Error('Delegation contract address is required')
    }
    const delegationContractAddress = isAddress(delegationInfo.contractAddress)
    if (!delegationContractAddress) {
      throw new Error('Delegation contract address is invalid')
    }

    const walletAddress = isAddress(account.address)
    if (!walletAddress) {
      throw new Error('Wallet address is invalid')
    }

    // Authorization nonce needs to be +1 of the nonce of the transaction
    const authorizationNonce = Number(input.nonce) + 1
    const signedAuthorization = await createSignedAuthorization({
      signer,
      walletAddress,
      chainId,
      contractAddress: delegationContractAddress,
      nonce: authorizationNonce,
    })

    // Convert to EIP-7702 transaction format
    const viemTxRequest = convertToEIP7702({
      ethersTx: input,
      walletAddress,
      signedAuthorization,
    })
    const signedTx = await signAndSerializeEIP7702Transaction({
      signer,
      tx: viemTxRequest,
      address: account.address,
      chainId,
    })

    return signedTx
  }

  const signTypedData: TransactionSigner['signTypedData'] = async (input) => {
    const signer = await getSigner()
    const signedData = await signTypedDataFunction({
      domain: input.domain,
      types: input.types,
      value: input.value,
      signer,
    })
    return signedData
  }

  const sendTransaction: TransactionSigner['sendTransaction'] = async (input) => {
    const viemClient = await ctx.getViemClient()
    const transactionHash = await viemClient.sendRawTransaction({
      serializedTransaction: input.signedTx,
    })
    return transactionHash
  }

  const sendTransactionSync: TransactionSigner['sendTransactionSync'] = async (input) => {
    // For bundled delegation transactions, we fall back to the base implementation
    // since the sync behavior is handled at the provider level
    // Once Viem exposes the sync method, we can remove this and use it directly
    return baseTransactionSignerService.sendTransactionSync(input)
  }

  return {
    prepareTransaction: baseTransactionSignerService.prepareTransaction,
    signTransaction,
    signTypedData,
    sendTransaction,
    sendTransactionSync,
    signAndSendTransaction: getSignAndSendTransaction({
      prepareTransaction: baseTransactionSignerService.prepareTransaction,
      signTransaction,
      signTypedData,
      sendTransaction,
    }),
  }
}

function getSignAndSendTransaction(ctx: {
  prepareTransaction: TransactionSigner['prepareTransaction']
  signTransaction: TransactionSigner['signTransaction']
  signTypedData: TransactionSigner['signTypedData']
  sendTransaction: TransactionSigner['sendTransaction']
}): TransactionSigner['signAndSendTransaction'] {
  return async (input) => {
    const populatedRequest = await ctx.prepareTransaction(input)
    const timestampBeforeSign = Date.now()
    const signedTx = await ctx.signTransaction(populatedRequest)
    const timestampBeforeSend = Date.now()
    const transactionHash = await ctx.sendTransaction({ signedTx })
    return { transactionHash, populatedRequest, timestampBeforeSign, timestampBeforeSend }
  }
}
