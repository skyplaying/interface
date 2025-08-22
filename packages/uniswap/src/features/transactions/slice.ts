/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* helpful when dealing with deeply nested state objects */
import { Draft, PayloadAction, createAction, createSlice } from '@reduxjs/toolkit'
import { providers } from 'ethers/lib/ethers'
import { UniverseChainId } from 'uniswap/src/features/chains/types'
import { FORTransactionDetails } from 'uniswap/src/features/fiatOnRamp/types'
import { isUniswapX } from 'uniswap/src/features/transactions/swap/utils/routing'
import {
  BridgeTransactionInfo,
  ChainIdToTxIdToDetails,
  FinalizedTransactionDetails,
  InterfaceTransactionDetails,
  TransactionDetails,
  TransactionId,
  TransactionStatus,
  TransactionType,
  TransactionTypeInfo,
} from 'uniswap/src/features/transactions/types/transactionDetails'
import {
  getInterfaceTransaction,
  getWalletTransaction,
  isBridgeTypeInfo,
} from 'uniswap/src/features/transactions/types/utils'
import { assert } from 'utilities/src/errors'

export interface TransactionsState {
  [address: Address]: ChainIdToTxIdToDetails
}

export const initialTransactionsState: TransactionsState = {}

// Shared function to get interface transaction from state with proper error handling
function getInterfaceTransactionFromState({
  state,
  address,
  chainId,
  id,
  actionName,
}: {
  state: Draft<TransactionsState>
  address: string
  chainId: UniverseChainId
  id: string
  actionName: string
}): InterfaceTransactionDetails {
  const tx = state[address]?.[chainId]?.[id]
  assert(tx, `${actionName}: Attempted to access a missing transaction with id ${id}`)
  const interfaceTransaction = getInterfaceTransaction(tx as TransactionDetails | InterfaceTransactionDetails)
  assert(interfaceTransaction, `${actionName}: Attempted to access a non-interface transaction with id ${id}`)
  return interfaceTransaction as InterfaceTransactionDetails
}

// Shared function to get interface transaction from state with proper error handling
function getWalletTransactionFromState({
  state,
  address,
  chainId,
  id,
  actionName,
}: {
  state: Draft<TransactionsState>
  address: string
  chainId: UniverseChainId
  id: string
  actionName: string
}): TransactionDetails {
  const tx = state[address]?.[chainId]?.[id]
  assert(tx, `${actionName}: Attempted to access a missing transaction with id ${id}`)
  const walletTransaction = getWalletTransaction(tx as TransactionDetails | InterfaceTransactionDetails)
  assert(walletTransaction, `${actionName}: Attempted to access a non-wallet transaction with id ${id}`)
  return walletTransaction as TransactionDetails
}

const slice = createSlice({
  name: 'transactions',
  initialState: initialTransactionsState,
  reducers: {
    addTransaction: (
      state,
      { payload: transaction }: PayloadAction<TransactionDetails | InterfaceTransactionDetails>,
    ) => {
      const { chainId, id, from } = transaction
      assert(!state[from]?.[chainId]?.[id], `addTransaction: Attempted to overwrite tx with id ${id}`)
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      state[from] ??= {}
      state[from]![chainId] ??= {}
      state[from]![chainId]![id] = transaction
    },
    updateTransaction: (
      state,
      { payload: transaction }: PayloadAction<TransactionDetails | InterfaceTransactionDetails>,
    ) => {
      const { chainId, id, from } = transaction
      assert(state[from]?.[chainId]?.[id], `updateTransaction: Attempted to update a missing tx with id ${id}`)
      state[from]![chainId]![id] = transaction
    },
    updateTransactionWithoutWatch: (
      state,
      { payload: transaction }: PayloadAction<TransactionDetails | InterfaceTransactionDetails>,
    ) => {
      const { chainId, id, from } = transaction
      assert(
        state[from]?.[chainId]?.[id],
        `updateTransactionWithoutWatch: Attempted to update a missing tx with id ${id}`,
      )
      state[from]![chainId]![id] = transaction
    },
    finalizeTransaction: (state, { payload: transaction }: PayloadAction<FinalizedTransactionDetails>) => {
      const { chainId, id, status, receipt, from, hash, networkFee } = transaction

      const walletTransaction = getWalletTransactionFromState({
        state,
        address: from,
        chainId,
        id,
        actionName: 'finalizeTransaction',
      })

      assert(walletTransaction, `finalizeTransaction: Attempted to finalize a non-wallet transaction with id ${id}`)

      walletTransaction.status = status

      // Set receipt and networkFee - these properties exist on wallet transaction types
      if (receipt) {
        walletTransaction.receipt = receipt
      }

      if (networkFee) {
        walletTransaction.networkFee = networkFee
      }

      if (isUniswapX(transaction) && status === TransactionStatus.Success) {
        assert(hash, `finalizeTransaction: Attempted to finalize an order without providing the fill tx hash`)
        state[from]![chainId]![id]!.hash = hash
      }
    },
    interfaceFinalizeTransaction(
      state,
      {
        payload: { chainId, hash, address, status, info },
      }: {
        payload: {
          chainId: UniverseChainId
          hash: string
          address: Address
          status: TransactionStatus.Success | TransactionStatus.Failed | TransactionStatus.Pending
          info?: TransactionTypeInfo
        }
      },
    ) {
      const tx = state[address]?.[chainId]?.[hash]
      if (!tx) {
        return
      }
      state[address]![chainId]![hash] = {
        ...tx,
        status,
        confirmedTime: Date.now(),
        typeInfo: info ?? tx.typeInfo,
      }
    },
    deleteTransaction: (
      state,
      { payload: { chainId, id, address } }: PayloadAction<TransactionId & { address: string }>,
    ) => {
      assert(
        state[address]?.[chainId]?.[id],
        `deleteTransaction: Attempted to delete a tx that doesn't exist with id ${id}`,
      )
      delete state[address]![chainId]![id]
    },
    cancelTransaction: (
      state,
      {
        payload: { chainId, id, address, cancelRequest },
      }: PayloadAction<TransactionId & { address: string; cancelRequest: providers.TransactionRequest }>,
    ) => {
      const walletTransaction = getWalletTransactionFromState({
        state,
        address,
        chainId,
        id,
        actionName: 'cancelTransaction',
      })

      walletTransaction.status = TransactionStatus.Cancelling
      walletTransaction.cancelRequest = cancelRequest
    },
    replaceTransaction: (
      state,
      {
        payload: { chainId, id, address },
      }: PayloadAction<
        TransactionId & {
          newTxParams: providers.TransactionRequest
        } & { address: string }
      >,
    ) => {
      assert(
        state[address]?.[chainId]?.[id],
        `replaceTransaction: Attempted to replace a tx that doesn't exist with id ${id}`,
      )
      state[address]![chainId]![id]!.status = TransactionStatus.Replacing
    },
    resetTransactions: () => initialTransactionsState,
    // FOR transactions re-use this slice to store (off-chain) pending txs
    upsertFiatOnRampTransaction: (state, { payload: transaction }: PayloadAction<FORTransactionDetails>) => {
      const {
        chainId,
        id,
        from,
        typeInfo: { type },
      } = transaction

      assert(
        type === TransactionType.LocalOnRamp ||
          type === TransactionType.LocalOffRamp ||
          type === TransactionType.OnRampPurchase ||
          type === TransactionType.OnRampTransfer ||
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          type === TransactionType.OffRampSale,
        `only FOR transactions can be upserted`,
      )

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      state[from] ??= {}
      state[from]![chainId] ??= {}
      state[from]![chainId]![id] = {
        ...transaction,
        typeInfo: { ...transaction.typeInfo },
      }
    },
    interfaceCancelTransactionWithHash: (
      state,
      {
        payload: { chainId, id, address, cancelHash },
      }: PayloadAction<{ chainId: UniverseChainId; id: string; address: string; cancelHash: string }>,
    ) => {
      const interfaceTransaction = getInterfaceTransactionFromState({
        state,
        address,
        chainId,
        id,
        actionName: 'interfaceCancelTransactionWithHash',
      })
      delete state[address]![chainId]![id]
      state[address]![chainId]![cancelHash] = {
        ...interfaceTransaction,
        id: cancelHash,
        hash: cancelHash,
        cancelled: true,
      }
    },
    interfaceClearAllTransactions: (
      state,
      { payload: { chainId, address } }: PayloadAction<{ chainId: UniverseChainId; address: string }>,
    ) => {
      if (state[address]?.[chainId]) {
        state[address]![chainId] = {}
      }
    },
    interfaceCheckedTransaction: (
      state,
      {
        payload: { chainId, id, address, blockNumber },
      }: PayloadAction<{ chainId: UniverseChainId; id: string; address: string; blockNumber: number }>,
    ) => {
      const interfaceTransaction = getInterfaceTransactionFromState({
        state,
        address,
        chainId,
        id,
        actionName: 'interfaceCheckedTransaction',
      })
      assert(
        interfaceTransaction.status === TransactionStatus.Pending,
        `interfaceCheckedTransaction: Attempted to check a non-pending transaction with id ${id}`,
      )

      if (!interfaceTransaction.lastCheckedBlockNumber) {
        interfaceTransaction.lastCheckedBlockNumber = blockNumber
      } else {
        interfaceTransaction.lastCheckedBlockNumber = Math.max(blockNumber, interfaceTransaction.lastCheckedBlockNumber)
      }
    },
    interfaceConfirmBridgeDeposit: (
      state,
      { payload: { chainId, id, address } }: PayloadAction<{ chainId: UniverseChainId; id: string; address: string }>,
    ) => {
      const interfaceTransaction = getInterfaceTransactionFromState({
        state,
        address,
        chainId,
        id,
        actionName: 'interfaceConfirmBridgeDeposit',
      })
      assert(
        isBridgeTypeInfo(interfaceTransaction.typeInfo),
        `interfaceConfirmBridgeDeposit: Attempted to confirm a non-bridge transaction with id ${id}`,
      )
      ;(interfaceTransaction.typeInfo as BridgeTransactionInfo).depositConfirmed = true
    },
    interfaceUpdateTransactionInfo: (
      state,
      {
        payload: { chainId, id, address, typeInfo },
      }: PayloadAction<{ chainId: UniverseChainId; id: string; address: string; typeInfo: TransactionTypeInfo }>,
    ) => {
      const interfaceTransaction = getInterfaceTransactionFromState({
        state,
        address,
        chainId,
        id,
        actionName: 'interfaceUpdateTransactionInfo',
      })
      assert(
        interfaceTransaction.typeInfo.type === typeInfo.type,
        `interfaceUpdateTransactionInfo: Attempted to update a non-matching transaction with id ${id}`,
      )
      interfaceTransaction.typeInfo = typeInfo
    },
    interfaceApplyTransactionHashToBatch: (
      state,
      {
        payload: { batchId, hash, chainId, address },
      }: PayloadAction<{ batchId: string; hash: string; chainId: UniverseChainId; address: string }>,
    ) => {
      const hashlessTx = state[address]?.[chainId]?.[batchId]
      if (!hashlessTx) {
        return
      }
      const txWithHash = { ...hashlessTx, id: hash, hash }

      // rm tx that was referenced by batchId
      delete state[address]![chainId]![batchId]

      // replaces with tx references by hash
      state[address]![chainId]![hash] = txWithHash
    },
  },
})

// This action is fired, when user has come back from Moonpay flow using Return to Uniswap button
export const forceFetchFiatOnRampTransactions = createAction('transactions/forceFetchFiatOnRampTransactions')

export const {
  addTransaction,
  cancelTransaction,
  deleteTransaction,
  finalizeTransaction,
  replaceTransaction,
  resetTransactions,
  upsertFiatOnRampTransaction,
  updateTransaction,
  updateTransactionWithoutWatch,
  interfaceClearAllTransactions,
  interfaceCheckedTransaction,
  interfaceConfirmBridgeDeposit,
  interfaceFinalizeTransaction,
  interfaceUpdateTransactionInfo,
  interfaceApplyTransactionHashToBatch,
  interfaceCancelTransactionWithHash,
} = slice.actions

export const { reducer: transactionReducer } = slice
export const transactionActions = { ...slice.actions, forceFetchFiatOnRampTransactions }
