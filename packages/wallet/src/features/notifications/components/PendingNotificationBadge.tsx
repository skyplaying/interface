import { useSelector } from 'react-redux'
import { Flex, SpinningLoader, useSporeColors } from 'ui/src'
import AlertCircle from 'ui/src/assets/icons/alert-circle.svg'
import { CheckmarkCircle } from 'ui/src/components/icons'
import { iconSizes } from 'ui/src/theme'
import { TransactionStatus } from 'uniswap/src/features/transactions/types/transactionDetails'
import { useSelectAddressHasNotifications } from 'wallet/src/features/notifications/hooks'
import { selectActiveAccountNotifications } from 'wallet/src/features/notifications/selectors'
import { AppNotificationType } from 'wallet/src/features/notifications/types'
import { useSortedPendingTransactions } from 'wallet/src/features/transactions/hooks'
import { selectActiveAccountAddress } from 'wallet/src/features/wallet/selectors'

const PENDING_TX_TIME_LIMIT = 60_000 * 5 // 5 mins
const LOADING_SPINNER_SIZE = iconSizes.icon20

interface Props {
  size?: number
}

export function PendingNotificationBadge({ size = LOADING_SPINNER_SIZE }: Props): JSX.Element | null {
  const colors = useSporeColors()
  const activeAccountAddress = useSelector(selectActiveAccountAddress)
  const notifications = useSelector(selectActiveAccountNotifications)
  const sortedPendingTransactions = useSortedPendingTransactions(activeAccountAddress)
  const hasNotifications = useSelectAddressHasNotifications(activeAccountAddress)

  /*************** In-app txn confirmed  **************/

  const currentNotification = notifications?.[0]
  if (currentNotification?.type === AppNotificationType.Transaction) {
    const { txStatus } = currentNotification
    if (txStatus === TransactionStatus.Success) {
      return <CheckmarkCircle size={size} />
    }

    return <AlertCircle color={colors.DEP_accentWarning.val} height={size} width={size} />
  }

  /*************** Pending in-app txn  **************/

  const swapPendingNotificationActive = currentNotification?.type === AppNotificationType.SwapPending
  const pendingTransactionCount = (sortedPendingTransactions ?? []).length
  const txPendingLongerThanLimit =
    sortedPendingTransactions?.[0] && Date.now() - sortedPendingTransactions[0].addedTime > PENDING_TX_TIME_LIMIT

  // If a transaction has been pending for longer than 5 mins, then don't show the pending icon anymore
  // Dont show the loader if the swap pending toast is on screen
  if (
    !swapPendingNotificationActive &&
    pendingTransactionCount >= 1 &&
    pendingTransactionCount <= 99 &&
    !txPendingLongerThanLimit
  ) {
    return <SpinningLoader color="$accent1" size={LOADING_SPINNER_SIZE} />
  }

  /**
   Has unchecked notification status (triggered by Transaction history updater or transaction watcher saga).
   Aka, will flip status to true when any local or remote transaction is confirmed.
  **/

  if (hasNotifications) {
    return (
      <Flex backgroundColor="$accent1" borderRadius="$roundedFull" height={iconSizes.icon8} width={iconSizes.icon8} />
    )
  }

  return null
}
