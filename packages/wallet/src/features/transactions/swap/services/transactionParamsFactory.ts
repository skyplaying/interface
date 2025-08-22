import { permit2Address } from '@uniswap/permit2-sdk'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { DutchQuoteV2, DutchQuoteV3, PriorityQuote, Routing } from 'uniswap/src/data/tradingApi/__generated__/index'
import { GasEstimate } from 'uniswap/src/data/tradingApi/types'
import { ValidatedSwapTxContext } from 'uniswap/src/features/transactions/swap/types/swapTxAndGasInfo'
import { tradeToTransactionInfo } from 'uniswap/src/features/transactions/swap/utils/trade'
import {
  ApproveTransactionInfo,
  BridgeTransactionInfo,
  ExactInputSwapTransactionInfo,
  ExactOutputSwapTransactionInfo,
  Permit2ApproveTransactionInfo,
  TransactionOptions,
  TransactionOriginType,
  TransactionType,
  WrapTransactionInfo,
} from 'uniswap/src/features/transactions/types/transactionDetails'
import { SubmitTransactionParams } from 'wallet/src/features/transactions/executeTransaction/services/TransactionService/transactionService'
import { SignedTransactionRequest } from 'wallet/src/features/transactions/executeTransaction/types'
import { SubmitUniswapXOrderParams } from 'wallet/src/features/transactions/swap/submitOrderSaga'
import { SignedPermit } from 'wallet/src/features/transactions/swap/types/preSignedTransaction'
import { BaseTransactionContext } from 'wallet/src/features/transactions/swap/types/transactionExecutor'

export interface ApprovalTransactionData {
  signedTx: SignedTransactionRequest
  gasEstimate?: GasEstimate
  swapTxId?: string
}

export interface PermitTransactionData {
  signedTx: SignedTransactionRequest
}

export interface SwapTransactionData {
  signedTx: SignedTransactionRequest
  swapTxContext: ValidatedSwapTxContext
  transactedUSDValue?: number
  includesDelegation?: boolean
  isSmartWalletTransaction?: boolean
  txId?: string
}

export interface WrapTransactionData {
  signedTx: SignedTransactionRequest
  inputCurrencyAmount: CurrencyAmount<Currency>
  txId?: string
  gasEstimate?: GasEstimate
}

export interface UniswapXOrderTransactionData {
  signedPermit: SignedPermit
  quote: DutchQuoteV2 | DutchQuoteV3 | PriorityQuote
  routing: Routing.DUTCH_V2 | Routing.DUTCH_V3 | Routing.PRIORITY
  swapTxContext: ValidatedSwapTxContext
  transactedUSDValue?: number
  approveTxHash?: string
  txId?: string
  onSuccess: () => void
  onFailure: () => void
}

type TransactionTypeInfo =
  | ApproveTransactionInfo
  | Permit2ApproveTransactionInfo
  | WrapTransactionInfo
  | ExactInputSwapTransactionInfo
  | ExactOutputSwapTransactionInfo
  | BridgeTransactionInfo

interface SubmitTransactionParamsInput {
  request: SignedTransactionRequest
  options: TransactionOptions
  typeInfo: TransactionTypeInfo
  txId?: string
}

/**
 * Interface for creating transaction execution parameters for different transaction types
 */
export interface TransactionParamsFactory {
  createApprovalParams(data: ApprovalTransactionData): SubmitTransactionParams
  createPermitParams(data: PermitTransactionData): SubmitTransactionParams
  createSwapParams(data: SwapTransactionData): SubmitTransactionParams
  createWrapParams(data: WrapTransactionData): SubmitTransactionParams
  createUniswapXOrderParams(data: UniswapXOrderTransactionData): SubmitUniswapXOrderParams
}

/**
 * Factory function to create transaction execution parameters for different transaction types
 */
export function createTransactionParamsFactory(context: BaseTransactionContext): TransactionParamsFactory {
  /**
   * Helper function to build SubmitTransactionParams with common fields
   */
  function buildSubmitTransactionParams({
    request,
    options,
    typeInfo,
    txId,
  }: SubmitTransactionParamsInput): SubmitTransactionParams {
    return {
      txId,
      chainId: context.chainId,
      account: context.account,
      request,
      options,
      typeInfo,
      transactionOriginType: TransactionOriginType.Internal,
      analytics: context.analytics,
    }
  }

  function createApprovalParams(data: ApprovalTransactionData): SubmitTransactionParams {
    const typeInfo: ApproveTransactionInfo = {
      type: TransactionType.Approve,
      tokenAddress: data.signedTx.request.to,
      spender: permit2Address(context.chainId),
      swapTxId: data.swapTxId,
      gasEstimate: data.gasEstimate,
    }

    const options: TransactionOptions = {
      request: data.signedTx.request,
      submitViaPrivateRpc: context.submitViaPrivateRpc,
      userSubmissionTimestampMs: context.userSubmissionTimestampMs,
    }

    return buildSubmitTransactionParams({
      request: data.signedTx,
      options,
      typeInfo,
    })
  }

  function createPermitParams(data: PermitTransactionData): SubmitTransactionParams {
    const typeInfo: Permit2ApproveTransactionInfo = {
      type: TransactionType.Permit2Approve,
      spender: data.signedTx.request.to,
    }

    const options: TransactionOptions = {
      request: data.signedTx.request,
      submitViaPrivateRpc: context.submitViaPrivateRpc,
      userSubmissionTimestampMs: context.userSubmissionTimestampMs,
    }

    return buildSubmitTransactionParams({
      request: data.signedTx,
      options,
      typeInfo,
    })
  }

  function createSwapParams(data: SwapTransactionData): SubmitTransactionParams {
    const { signedTx, swapTxContext, transactedUSDValue } = data
    const gasFeeEstimation = swapTxContext.gasFeeEstimation

    const typeInfo = tradeToTransactionInfo({
      trade: swapTxContext.trade,
      transactedUSDValue,
      gasEstimate: gasFeeEstimation.swapEstimate,
    })

    const options: TransactionOptions = {
      request: signedTx.request,
      submitViaPrivateRpc: context.submitViaPrivateRpc,
      userSubmissionTimestampMs: context.userSubmissionTimestampMs,
      includesDelegation: data.includesDelegation,
      isSmartWalletTransaction: data.isSmartWalletTransaction,
    }

    return buildSubmitTransactionParams({
      request: signedTx,
      options,
      typeInfo,
      txId: data.txId,
    })
  }

  function createWrapParams(data: WrapTransactionData): SubmitTransactionParams {
    const { inputCurrencyAmount, signedTx, gasEstimate } = data

    const typeInfo: WrapTransactionInfo = {
      type: TransactionType.Wrap,
      unwrapped: !inputCurrencyAmount.currency.isNative,
      currencyAmountRaw: inputCurrencyAmount.quotient.toString(),
      gasEstimate,
    }

    const options: TransactionOptions = {
      request: signedTx.request,
      submitViaPrivateRpc: context.submitViaPrivateRpc,
      userSubmissionTimestampMs: context.userSubmissionTimestampMs,
    }

    return buildSubmitTransactionParams({
      request: signedTx,
      options,
      typeInfo,
    })
  }

  function createUniswapXOrderParams(data: UniswapXOrderTransactionData): SubmitUniswapXOrderParams {
    const {
      signedPermit,
      quote,
      routing,
      swapTxContext,
      transactedUSDValue,
      approveTxHash,
      txId,
      onSuccess,
      onFailure,
    } = data

    const gasFeeEstimation = swapTxContext.gasFeeEstimation
    const typeInfo = tradeToTransactionInfo({
      trade: swapTxContext.trade,
      transactedUSDValue,
      gasEstimate: gasFeeEstimation.swapEstimate,
    })

    const submitOrderParams: SubmitUniswapXOrderParams = {
      account: context.account,
      analytics: context.analytics,
      approveTxHash,
      permit: signedPermit,
      quote,
      routing,
      typeInfo,
      chainId: context.chainId,
      txId,
      onSuccess,
      onFailure,
    }

    return submitOrderParams
  }

  return {
    createApprovalParams,
    createPermitParams,
    createSwapParams,
    createWrapParams,
    createUniswapXOrderParams,
  }
}
