import { AnyAction } from '@reduxjs/toolkit'
import { getNativeAddress } from 'uniswap/src/constants/addresses'
import { AssetType, CurrencyAsset } from 'uniswap/src/entities/assets'
import { CurrencyField, TransactionState } from 'uniswap/src/features/transactions/transactionState/types'
import { UniverseChainId } from 'uniswap/src/types/chains'
import {
  INITIAL_TRANSACTION_STATE,
  selectCurrency,
  switchCurrencySides,
  transactionStateReducer,
  updateExactAmountFiat,
  updateExactAmountToken,
} from 'wallet/src/features/transactions/transactionState/transactionState'

const chainId = UniverseChainId.Goerli
const ethAddress = getNativeAddress(UniverseChainId.Goerli)
const daiTradeableAsset: CurrencyAsset = { address: 'DAI', chainId, type: AssetType.Currency }
const ethTradeableAsset: CurrencyAsset = { address: ethAddress, chainId, type: AssetType.Currency }

const testInitialState: Readonly<TransactionState> = {
  [CurrencyField.INPUT]: {
    address: ethAddress,
    chainId: UniverseChainId.Goerli,
    type: AssetType.Currency,
  },
  [CurrencyField.OUTPUT]: null,
  exactCurrencyField: CurrencyField.INPUT,
  exactAmountToken: '',
  exactAmountFiat: '',
}

test('should return the initial state', () => {
  expect(transactionStateReducer(undefined, {} as AnyAction)).toEqual(INITIAL_TRANSACTION_STATE)
})

describe(selectCurrency, () => {
  test('should handle a selected input currency', () => {
    const previousState = { ...testInitialState }
    expect(
      transactionStateReducer(
        previousState,
        selectCurrency({
          field: CurrencyField.INPUT,
          tradeableAsset: ethTradeableAsset,
        }),
      ),
    ).toEqual({
      ...previousState,
      [CurrencyField.INPUT]: ethTradeableAsset,
    })
  })

  test('should handle a selected output currency', () => {
    const previousState = { ...testInitialState }
    expect(
      transactionStateReducer(
        previousState,
        selectCurrency({
          field: CurrencyField.OUTPUT,
          tradeableAsset: daiTradeableAsset,
        }),
      ),
    ).toEqual({
      ...previousState,
      [CurrencyField.OUTPUT]: daiTradeableAsset,
    })
  })

  test('should set other currency to null when selecting the other one', () => {
    const previousState = {
      ...testInitialState,
      [CurrencyField.INPUT]: ethTradeableAsset,
    }
    expect(
      transactionStateReducer(
        previousState,
        selectCurrency({
          field: CurrencyField.OUTPUT,
          tradeableAsset: ethTradeableAsset,
        }),
      ),
    ).toEqual({
      ...previousState,
      exactCurrencyField: CurrencyField.OUTPUT,
      [CurrencyField.INPUT]: null,
      [CurrencyField.OUTPUT]: ethTradeableAsset,
    })
  })

  test('should swap currencies when selecting the other one', () => {
    const previousState = {
      ...testInitialState,
      [CurrencyField.INPUT]: ethTradeableAsset,
      [CurrencyField.OUTPUT]: daiTradeableAsset,
    }
    expect(
      transactionStateReducer(
        previousState,
        selectCurrency({
          field: CurrencyField.OUTPUT,
          tradeableAsset: ethTradeableAsset,
        }),
      ),
    ).toEqual({
      ...previousState,
      exactCurrencyField: CurrencyField.OUTPUT,
      [CurrencyField.INPUT]: daiTradeableAsset,
      [CurrencyField.OUTPUT]: ethTradeableAsset,
    })
  })

  test('should reset other currency when network changes', () => {
    const otherChainId = chainId + 1
    const previousState = {
      ...testInitialState,
      [CurrencyField.INPUT]: ethTradeableAsset,
      [CurrencyField.OUTPUT]: daiTradeableAsset,
    }
    expect(
      transactionStateReducer(
        previousState,
        selectCurrency({
          field: CurrencyField.OUTPUT,
          tradeableAsset: {
            address: ethAddress,
            chainId: otherChainId,
            type: AssetType.Currency,
          },
        }),
      ),
    ).toEqual({
      ...previousState,
      exactCurrencyField: CurrencyField.OUTPUT,
      [CurrencyField.INPUT]: null,
      [CurrencyField.OUTPUT]: {
        address: ethAddress,
        chainId: otherChainId,
        type: AssetType.Currency,
      },
    })
  })
})

describe(switchCurrencySides, () => {
  it('should switch currencies', () => {
    const previousState = {
      ...testInitialState,
      exactCurrencyField: CurrencyField.INPUT,
      focusOnCurrencyField: CurrencyField.INPUT,
      [CurrencyField.INPUT]: daiTradeableAsset,
      [CurrencyField.OUTPUT]: ethTradeableAsset,
    }

    expect(transactionStateReducer(previousState, switchCurrencySides())).toEqual({
      ...previousState,
      exactCurrencyField: CurrencyField.OUTPUT,
      focusOnCurrencyField: CurrencyField.OUTPUT,
      [CurrencyField.INPUT]: ethTradeableAsset,
      [CurrencyField.OUTPUT]: daiTradeableAsset,
      exactAmountFiat: '',
      exactAmountToken: '',
    })
  })
})

describe(updateExactAmountToken, () => {
  it('should set typed value on token amount updates', () => {
    const previousState = { ...testInitialState }

    expect(
      transactionStateReducer(previousState, updateExactAmountToken({ field: CurrencyField.INPUT, amount: '1' })),
    ).toEqual({
      ...previousState,
      exactCurrencyField: CurrencyField.INPUT,
      exactAmountToken: '1',
    })
  })

  it('should set typed value on usd amount updates', () => {
    const previousState = { ...testInitialState }

    expect(
      transactionStateReducer(previousState, updateExactAmountFiat({ field: CurrencyField.INPUT, amount: '1' })),
    ).toEqual({
      ...previousState,
      exactCurrencyField: CurrencyField.INPUT,
      exactAmountFiat: '1',
    })
  })

  it('should set independent field when dependent receives typed input', () => {
    const previousState = { ...testInitialState }

    expect(
      transactionStateReducer(previousState, updateExactAmountToken({ field: CurrencyField.OUTPUT, amount: '5' })),
    ).toEqual({
      ...previousState,
      exactCurrencyField: CurrencyField.OUTPUT,
      exactAmountToken: '5',
    })
  })
})
