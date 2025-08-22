import {
  OnChainTransaction,
  OnChainTransactionLabel,
  OnChainTransactionStatus,
} from '@uniswap/client-data-api/dist/data/v1/types_pb'
import { Routing } from 'uniswap/src/data/tradingApi/__generated__/index'
import { parseRestApproveTransaction } from 'uniswap/src/features/activity/parse/parseApproveTransaction'
import { parseRestBridgeTransaction } from 'uniswap/src/features/activity/parse/parseBridgingTransaction'
import { parseRestLiquidityTransaction } from 'uniswap/src/features/activity/parse/parseLiquidityTransaction'
import { parseRestNFTMintTransaction } from 'uniswap/src/features/activity/parse/parseMintTransaction'
import { parseRestReceiveTransaction } from 'uniswap/src/features/activity/parse/parseReceiveTransaction'
import { parseRestSendTransaction } from 'uniswap/src/features/activity/parse/parseSendTransaction'
import {
  parseRestSwapTransaction,
  parseRestWrapTransaction,
} from 'uniswap/src/features/activity/parse/parseTradeTransaction'
import { parseRestUnknownTransaction } from 'uniswap/src/features/activity/parse/parseUnknownTransaction'
import {
  TransactionDetails,
  TransactionOriginType,
  TransactionStatus,
  TransactionTypeInfo,
} from 'uniswap/src/features/transactions/types/transactionDetails'

/**
 * Maps REST API transaction status to local transaction status
 */
function mapRestStatusToLocal(status: OnChainTransactionStatus, isCancel: boolean): TransactionStatus {
  switch (status) {
    case OnChainTransactionStatus.FAILED:
      return isCancel ? TransactionStatus.FailedCancel : TransactionStatus.Failed
    case OnChainTransactionStatus.PENDING:
      return isCancel ? TransactionStatus.Cancelling : TransactionStatus.Pending
    case OnChainTransactionStatus.CONFIRMED:
      return isCancel ? TransactionStatus.Canceled : TransactionStatus.Success
    default:
      return TransactionStatus.Unknown
  }
}

/**
 * Extract transaction details from an onChain transaction in the REST format
 */
export default function extractRestOnChainTransactionDetails(
  transaction: OnChainTransaction,
): TransactionDetails | null {
  const { chainId, transactionHash, timestampMillis, from, label, status, fee } = transaction

  const isCancel = label === OnChainTransactionLabel.CANCEL
  let typeInfo: TransactionTypeInfo | undefined

  switch (label) {
    case OnChainTransactionLabel.SEND:
      typeInfo = parseRestSendTransaction(transaction)
      break
    case OnChainTransactionLabel.RECEIVE:
      typeInfo = parseRestReceiveTransaction(transaction)
      break
    case OnChainTransactionLabel.SWAP:
    case OnChainTransactionLabel.UNISWAP_X:
      typeInfo = parseRestSwapTransaction(transaction)
      break
    case OnChainTransactionLabel.WRAP:
    case OnChainTransactionLabel.UNWRAP:
    case OnChainTransactionLabel.WITHDRAW:
    case OnChainTransactionLabel.LEND:
      typeInfo = parseRestWrapTransaction(transaction)
      break
    case OnChainTransactionLabel.APPROVE:
      typeInfo = parseRestApproveTransaction(transaction)
      break
    case OnChainTransactionLabel.BRIDGE:
      typeInfo = parseRestBridgeTransaction(transaction)
      break
    case OnChainTransactionLabel.MINT:
      typeInfo = parseRestNFTMintTransaction(transaction)
      break
    case OnChainTransactionLabel.CLAIM:
    case OnChainTransactionLabel.CREATE_PAIR:
    case OnChainTransactionLabel.CREATE_POOL:
    case OnChainTransactionLabel.INCREASE_LIQUIDITY:
    case OnChainTransactionLabel.DECREASE_LIQUIDITY:
      typeInfo = parseRestLiquidityTransaction(transaction)
      break
  }

  if (!typeInfo) {
    typeInfo = parseRestUnknownTransaction(transaction)
  }

  const networkFee = fee
    ? {
        quantity: String(fee.amount?.amount),
        tokenSymbol: fee.symbol,
        tokenAddress: fee.address,
        chainId,
      }
    : undefined

  const routing = label === OnChainTransactionLabel.UNISWAP_X ? Routing.DUTCH_V2 : Routing.CLASSIC

  return {
    routing,
    id: transactionHash,
    hash: transactionHash,
    chainId,
    status: mapRestStatusToLocal(status, isCancel),
    addedTime: Number(timestampMillis),
    from,
    typeInfo,
    options: { request: {} },
    networkFee,
    transactionOriginType: TransactionOriginType.Internal,
  }
}
