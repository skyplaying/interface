import { SharedEventName } from '@uniswap/analytics-events'
import React, { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { navigate } from 'src/app/navigation/rootNavigation'
import { openModal } from 'src/features/modals/modalSlice'
import { Flex, HapticFeedback, ImpactFeedbackStyle, Text, TouchableArea } from 'ui/src'
import { CopyAlt, Settings } from 'ui/src/components/icons'
import { ElementName, ModalName } from 'uniswap/src/features/telemetry/constants'
import { sendAnalyticsEvent } from 'uniswap/src/features/telemetry/send'
import { MobileUserPropertyName, setUserProperty } from 'uniswap/src/features/telemetry/user'
import { TestID } from 'uniswap/src/test/fixtures/testIDs'
import { MobileScreens } from 'uniswap/src/types/screens/mobile'
import { sanitizeAddressText, shortenAddress } from 'uniswap/src/utils/addresses'
import { setClipboard } from 'uniswap/src/utils/clipboard'
import { isDevEnv } from 'utilities/src/environment'
import { AccountIcon } from 'wallet/src/components/accounts/AccountIcon'
import { AnimatedUnitagDisplayName } from 'wallet/src/components/accounts/AnimatedUnitagDisplayName'
import { pushNotification } from 'wallet/src/features/notifications/slice'
import { AppNotificationType, CopyNotificationType } from 'wallet/src/features/notifications/types'
import { AccountType } from 'wallet/src/features/wallet/accounts/types'
import { useAvatar, useDisplayName } from 'wallet/src/features/wallet/hooks'
import { selectActiveAccount, selectActiveAccountAddress } from 'wallet/src/features/wallet/selectors'
import { DisplayNameType } from 'wallet/src/features/wallet/types'

export function AccountHeader(): JSX.Element {
  const activeAddress = useSelector(selectActiveAccountAddress)
  const account = useSelector(selectActiveAccount)
  const dispatch = useDispatch()

  const { avatar } = useAvatar(activeAddress)
  const displayName = useDisplayName(activeAddress)

  // Log ENS and Unitag ownership for user usage stats
  useEffect(() => {
    switch (displayName?.type) {
      case DisplayNameType.ENS:
        setUserProperty(MobileUserPropertyName.HasLoadedENS, true)
        return
      case DisplayNameType.Unitag:
        setUserProperty(MobileUserPropertyName.HasLoadedUnitag, true)
        return
      default:
        return
    }
  }, [displayName?.type])

  const onPressAccountHeader = useCallback(() => {
    dispatch(openModal({ name: ModalName.AccountSwitcher }))
  }, [dispatch])

  const onPressSettings = (): void => {
    navigate(MobileScreens.SettingsStack, { screen: MobileScreens.Settings })
  }

  const onPressCopyAddress = async (): Promise<void> => {
    if (activeAddress) {
      await HapticFeedback.impact()
      await setClipboard(activeAddress)
      dispatch(
        pushNotification({
          type: AppNotificationType.Copied,
          copyType: CopyNotificationType.Address,
        }),
      )
      sendAnalyticsEvent(SharedEventName.ELEMENT_CLICKED, {
        element: ElementName.CopyAddress,
        screen: MobileScreens.Home,
      })
    }
  }

  const walletHasName = displayName && displayName?.type !== DisplayNameType.Address
  const iconSize = 52

  return (
    <Flex gap="$spacing12" overflow="scroll" pt="$spacing8" px="$spacing12" testID="account-header" width="100%">
      {activeAddress && (
        <Flex alignItems="flex-start" gap="$spacing12" width="100%">
          <Flex row justifyContent="space-between" width="100%">
            <TouchableArea
              hapticFeedback
              alignItems="center"
              flexDirection="row"
              hapticStyle={ImpactFeedbackStyle.Medium}
              hitSlop={20}
              testID={TestID.AccountHeaderAvatar}
              onLongPress={async (): Promise<void> => {
                if (isDevEnv()) {
                  await HapticFeedback.selection()
                  dispatch(openModal({ name: ModalName.Experiments }))
                }
              }}
              onPress={onPressAccountHeader}
            >
              <AccountIcon
                address={activeAddress}
                avatarUri={avatar}
                showBackground={true}
                showViewOnlyBadge={account?.type === AccountType.Readonly}
                size={iconSize}
              />
            </TouchableArea>
            <TouchableArea
              hapticFeedback
              hitSlop={20}
              testID="account-header/settings-button"
              onPress={onPressSettings}
            >
              <Settings color="$neutral2" opacity={0.8} size="$icon.24" />
            </TouchableArea>
          </Flex>
          {walletHasName ? (
            <Flex
              row
              alignItems="center"
              gap="$spacing8"
              justifyContent="space-between"
              testID="account-header/display-name"
            >
              <TouchableArea hapticFeedback flexShrink={1} hitSlop={20} onPress={onPressAccountHeader}>
                <AnimatedUnitagDisplayName address={activeAddress} displayName={displayName} />
              </TouchableArea>
            </Flex>
          ) : (
            <TouchableArea
              hapticFeedback
              hitSlop={20}
              testID={TestID.AccountHeaderCopyAddress}
              onPress={onPressCopyAddress}
            >
              <Flex centered row shrink gap="$spacing4">
                <Text adjustsFontSizeToFit color="$neutral1" numberOfLines={1} variant="subheading2">
                  {sanitizeAddressText(shortenAddress(activeAddress))}
                </Text>
                <CopyAlt color="$neutral1" size="$icon.16" />
              </Flex>
            </TouchableArea>
          )}
        </Flex>
      )}
    </Flex>
  )
}
