import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MobileState } from 'src/app/mobileReducer'
import { monitoredSagas } from 'src/app/monitoredSagas'
import { SagaState, SagaStatus } from 'wallet/src/utils/saga'

// Convenience hook to get the status + error of an active saga
export function useSagaStatus(sagaName: string, onSuccess?: () => void, resetSagaOnSuccess = true): SagaState {
  const dispatch = useDispatch()
  const sagaState = useSelector((s: MobileState): SagaState | undefined => s.saga[sagaName])
  if (!sagaState) {
    throw new Error(`No saga state found, is sagaName valid? Name: ${sagaName}`)
  }

  const saga = monitoredSagas[sagaName]
  if (!saga) {
    throw new Error(`No saga found, is sagaName valid? Name: ${sagaName}`)
  }

  const { status, error } = sagaState

  useEffect(() => {
    if (status === SagaStatus.Success) {
      if (resetSagaOnSuccess) {
        dispatch(saga.actions.reset())
      }
      onSuccess?.()
    }
  }, [saga, status, error, onSuccess, resetSagaOnSuccess, dispatch])

  useEffect(() => {
    return () => {
      if (resetSagaOnSuccess) {
        dispatch(saga.actions.reset())
      }
    }
  }, [saga, resetSagaOnSuccess, dispatch])

  return sagaState
}
