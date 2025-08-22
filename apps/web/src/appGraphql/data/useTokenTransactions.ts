import { useCallback, useMemo, useRef } from 'react'
import { normalizeTokenAddressForCache } from 'uniswap/src/data/cache'
import {
  Chain,
  PoolTransaction,
  PoolTransactionType,
  PoolTxFragment,
  useV2TokenTransactionsQuery,
  useV3TokenTransactionsQuery,
  useV4TokenTransactionsQuery,
} from 'uniswap/src/data/graphql/uniswap-data-api/__generated__/types-and-hooks'
import { UniverseChainId } from 'uniswap/src/features/chains/types'
import { toGraphQLChain } from 'uniswap/src/features/chains/utils'
import i18n from 'uniswap/src/i18n'

export enum TokenTransactionType {
  BUY = 'Buy',
  SELL = 'Sell',
}

export const getTokenTransactionTypeTranslation = (type: TokenTransactionType): string => {
  switch (type) {
    case TokenTransactionType.BUY:
      return i18n.t('common.buy.label')
    case TokenTransactionType.SELL:
      return i18n.t('common.sell.label')
    default:
      return ''
  }
}

const TokenTransactionDefaultQuerySize = 25

export function useTokenTransactions({
  address,
  chainId,
  filter = [TokenTransactionType.BUY, TokenTransactionType.SELL],
}: {
  address: string
  chainId: UniverseChainId
  filter?: TokenTransactionType[]
}) {
  const {
    data: dataV4,
    loading: loadingV4,
    fetchMore: fetchMoreV4,
    error: errorV4,
  } = useV4TokenTransactionsQuery({
    variables: {
      address: normalizeTokenAddressForCache(address),
      chain: toGraphQLChain(chainId),
      first: TokenTransactionDefaultQuerySize,
    },
  })
  const {
    data: dataV3,
    loading: loadingV3,
    fetchMore: fetchMoreV3,
    error: errorV3,
  } = useV3TokenTransactionsQuery({
    variables: {
      address: normalizeTokenAddressForCache(address),
      chain: toGraphQLChain(chainId),
      first: TokenTransactionDefaultQuerySize,
    },
  })
  const {
    data: dataV2,
    loading: loadingV2,
    error: errorV2,
    fetchMore: fetchMoreV2,
  } = useV2TokenTransactionsQuery({
    variables: {
      address: normalizeTokenAddressForCache(address),
      first: TokenTransactionDefaultQuerySize,
      chain: toGraphQLChain(chainId),
    },
  })
  const loadingMoreV4 = useRef(false)
  const loadingMoreV3 = useRef(false)
  const loadingMoreV2 = useRef(false)
  const querySizeRef = useRef(TokenTransactionDefaultQuerySize)
  const loadMore = useCallback(
    ({ onComplete }: { onComplete?: () => void }) => {
      if (loadingMoreV4.current || loadingMoreV3.current || loadingMoreV2.current) {
        return
      }
      loadingMoreV4.current = true
      loadingMoreV3.current = true
      loadingMoreV2.current = true
      querySizeRef.current += TokenTransactionDefaultQuerySize
      fetchMoreV4({
        variables: {
          cursor: dataV4?.token?.v4Transactions?.[dataV4.token.v4Transactions.length - 1]?.timestamp,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!loadingMoreV3.current && !loadingMoreV2.current) {
            onComplete?.()
          }
          const mergedData = {
            token: {
              ...prev.token,
              id: prev.token?.id ?? '',
              chain: prev.token?.chain ?? Chain.Ethereum,
              v4Transactions: [...(prev.token?.v4Transactions ?? []), ...(fetchMoreResult.token?.v4Transactions ?? [])],
            },
          }
          loadingMoreV4.current = false
          return mergedData
        },
      })
      fetchMoreV3({
        variables: {
          cursor: dataV3?.token?.v3Transactions?.[dataV3.token.v3Transactions.length - 1]?.timestamp,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!loadingMoreV2.current && !loadingMoreV4.current) {
            onComplete?.()
          }
          const mergedData = {
            token: {
              ...prev.token,
              id: prev.token?.id ?? '',
              chain: prev.token?.chain ?? Chain.Ethereum,
              v3Transactions: [...(prev.token?.v3Transactions ?? []), ...(fetchMoreResult.token?.v3Transactions ?? [])],
            },
          }
          loadingMoreV3.current = false
          return mergedData
        },
      })
      fetchMoreV2({
        variables: {
          cursor: dataV2?.token?.v2Transactions?.[dataV2.token.v2Transactions.length - 1]?.timestamp,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!loadingMoreV3.current && !loadingMoreV4.current) {
            onComplete?.()
          }
          const mergedData = {
            token: {
              ...prev.token,
              id: prev.token?.id ?? '',
              chain: prev.token?.chain ?? Chain.Ethereum,
              v2Transactions: [...(prev.token?.v2Transactions ?? []), ...(fetchMoreResult.token?.v2Transactions ?? [])],
            },
          }
          loadingMoreV2.current = false
          return mergedData
        },
      })
    },
    [
      dataV2?.token?.v2Transactions,
      dataV3?.token?.v3Transactions,
      dataV4?.token?.v4Transactions,
      fetchMoreV2,
      fetchMoreV3,
      fetchMoreV4,
    ],
  )

  const filterTransaction = useCallback(
    (tx: PoolTxFragment | undefined) => {
      if (!tx) {
        return false
      }
      const tokenBeingSold = parseFloat(tx.token0Quantity) > 0 ? tx.token0 : tx.token1
      const isSell = tokenBeingSold.address?.toLowerCase() === address.toLowerCase()
      return (
        tx.type === PoolTransactionType.Swap &&
        filter.includes(isSell ? TokenTransactionType.SELL : TokenTransactionType.BUY)
      )
    },
    [address, filter],
  )

  const transactions = useMemo(
    () =>
      [
        ...(dataV4?.token?.v4Transactions ?? []),
        ...(dataV3?.token?.v3Transactions ?? []),
        ...(dataV2?.token?.v2Transactions ?? []),
      ]
        .filter(filterTransaction)
        .sort((a, b): number => (a?.timestamp && b?.timestamp ? b.timestamp - a.timestamp : 1))
        .slice(0, querySizeRef.current),
    [dataV2?.token?.v2Transactions, dataV3?.token?.v3Transactions, dataV4?.token?.v4Transactions, filterTransaction],
  )

  return useMemo(
    () => ({
      transactions: transactions as PoolTransaction[],
      loading: loadingV4 || loadingV3 || loadingV2,
      loadMore,
      errorV2,
      errorV3,
      errorV4,
    }),
    [transactions, loadingV4, loadingV3, loadingV2, loadMore, errorV2, errorV3, errorV4],
  )
}
