import { combineReducers } from '@reduxjs/toolkit'
import application from 'state/application/reducer'
import fiatOnRampTransactions from 'state/fiatOnRampTransactions/reducer'
import lists from 'state/lists/reducer'
import logs from 'state/logs/slice'
import mint from 'state/mint/reducer'
import mintV3 from 'state/mint/v3/reducer'
import { routingApi } from 'state/routing/slice'
import signatures from 'state/signatures/reducer'
import user from 'state/user/reducer'
import walletCapabilities from 'state/walletCapabilities/reducer'
import wallets from 'state/wallets/reducer'
import { uniswapPersistedStateList, uniswapReducers } from 'uniswap/src/state/uniswapReducer'

const interfaceReducers = {
  ...uniswapReducers,
  user,
  signatures,
  lists,
  fiatOnRampTransactions,
  application,
  wallets,
  walletCapabilities,
  mint,
  mintV3,
  logs,
  [routingApi.reducerPath]: routingApi.reducer,
} as const

export const interfaceReducer = combineReducers(interfaceReducers)

export const interfacePersistedStateList: Array<keyof typeof interfaceReducers> = [
  ...uniswapPersistedStateList,
  'user',
  'signatures',
  'lists',
  'fiatOnRampTransactions',
  'walletCapabilities',
]

export type InterfaceState = ReturnType<typeof interfaceReducer>
