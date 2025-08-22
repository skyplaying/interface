import { useEffect, useState } from 'react'
import { FeatureFlags } from 'uniswap/src/features/gating/flags'
import { useFeatureFlag } from 'uniswap/src/features/gating/hooks'
import { useSwapTxAndGasInfo as useServiceBasedSwapTxAndGasInfo } from 'uniswap/src/features/transactions/swap/review/services/swapTxAndGasInfoService/hooks'
import { useSwapFormStore } from 'uniswap/src/features/transactions/swap/stores/swapFormStore/useSwapFormStore'
import { SwapTxStoreContext } from 'uniswap/src/features/transactions/swap/stores/swapTxStore/SwapTxStoreContext'
import { createSwapTxStore } from 'uniswap/src/features/transactions/swap/stores/swapTxStore/createSwapTxStore'
import { useSwapTxAndGasInfo as useLegacySwapTxAndGasInfo } from 'uniswap/src/features/transactions/swap/stores/swapTxStore/hooks/useSwapTxAndGasInfo'
import { useWallet } from 'uniswap/src/features/wallet/hooks/useWallet'
import { usePreviousWithLayoutEffect } from 'utilities/src/react/usePreviousWithLayoutEffect'

const LegacySwapTxStoreContextProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const account = useWallet().evmAccount
  const derivedSwapInfo = useSwapFormStore((s) => s.derivedSwapInfo)
  const txState = useLegacySwapTxAndGasInfo({ derivedSwapInfo, account })

  const [{ store, cleanup }] = useState(() => createSwapTxStore(txState))

  useEffect(() => () => cleanup(), [cleanup])

  const previousTxState = usePreviousWithLayoutEffect(txState)

  useEffect(() => {
    if (previousTxState !== txState) {
      store.setState(txState)
    }
  }, [txState, previousTxState, store])

  return <SwapTxStoreContext.Provider value={store}>{children}</SwapTxStoreContext.Provider>
}

const ServiceBasedSwapTxStoreContextProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const txState = useServiceBasedSwapTxAndGasInfo()

  const [{ store, cleanup }] = useState(() => createSwapTxStore(txState))

  useEffect(() => () => cleanup(), [cleanup])

  const previousTxState = usePreviousWithLayoutEffect(txState)

  useEffect(() => {
    if (previousTxState !== txState) {
      store.setState(txState)
    }
  }, [txState, previousTxState, store])

  return <SwapTxStoreContext.Provider value={store}>{children}</SwapTxStoreContext.Provider>
}

export const SwapTxStoreContextProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const serviceBasedSwapTxAndGasInfoEnabled = useFeatureFlag(FeatureFlags.ServiceBasedSwapTransactionInfo)

  const Provider = serviceBasedSwapTxAndGasInfoEnabled
    ? ServiceBasedSwapTxStoreContextProvider
    : LegacySwapTxStoreContextProvider
  return <Provider>{children}</Provider>
}
