import type { Middleware, PreloadedState, Reducer, StoreEnhancer } from '@reduxjs/toolkit'
import { configureStore } from '@reduxjs/toolkit'
import { PersistState } from 'redux-persist'
import createSagaMiddleware, { Saga } from 'redux-saga'
import { walletContextValue } from 'wallet/src/features/wallet/context'
import { sharedRootReducer } from 'wallet/src/state/reducer'
import { rootSaga } from 'wallet/src/state/saga'
import { SagaState } from 'wallet/src/utils/saga'

interface CreateStoreProps {
  reducer: Reducer
  // sagas to load in addition to the shared ones
  // can be used for app-specific sagas
  additionalSagas?: Array<Saga<unknown[]>>
  enhancers?: Array<StoreEnhancer>
  // middlewares to add after the default middleware
  // recommended over `middlewareBefore`
  middlewareAfter?: Array<Middleware<unknown>>
  // middlewares to before after the default middleware
  middlewareBefore?: Array<Middleware<unknown>>
  preloadedState?: PreloadedState<RootState>
}

// Disable eslint rule to infer return type from the returned value
// (it is complex and not worth the effort to type it manually)
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createStore({
  additionalSagas = [],
  middlewareAfter = [],
  middlewareBefore = [],
  preloadedState = {},
  enhancers = [],
  reducer,
}: CreateStoreProps) {
  const sagaMiddleware = createSagaMiddleware({
    context: {
      signers: walletContextValue.signers,
      providers: walletContextValue.providers,
      contracts: walletContextValue.contracts,
    },
  })

  const store = configureStore({
    reducer,
    preloadedState,
    enhancers,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        // required for rtk-query
        thunk: true,
        // turn off since it slows down for dev and also doesn't run in prod
        // TODO: [MOB-641] figure out why this is slow
        serializableCheck: false,
        invariantCheck: {
          warnAfter: 256,
        },
        // slows down dev build considerably
        immutableCheck: false,
      })
        .prepend(middlewareBefore)
        .concat(sagaMiddleware)
        .concat(middlewareAfter),
    devTools: __DEV__,
  })

  sagaMiddleware.run(rootSaga)
  additionalSagas.forEach((saga) => sagaMiddleware.run(saga))

  return store
}

// Utility types and functions to be used inside the wallet shared package
// Apps should re-define those with a more specific `AppState`
export type RootState = ReturnType<typeof sharedRootReducer> & {
  saga: Record<string, SagaState>
} & { _persist?: PersistState }
