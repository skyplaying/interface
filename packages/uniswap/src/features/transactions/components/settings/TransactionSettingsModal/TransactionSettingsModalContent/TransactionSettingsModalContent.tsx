import { PropsWithChildren, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatedPager, Button, Flex, Text, TouchableArea, useMedia } from 'ui/src'
import { RotatableChevron } from 'ui/src/components/icons/RotatableChevron'
import { iconSizes } from 'ui/src/theme'
import { TransactionSettingRow } from 'uniswap/src/features/transactions/components/settings/TransactionSettingsModal/TransactionSettingsModalContent/TransactionSettingsRow'
import type { TransactionSettingsModalProps } from 'uniswap/src/features/transactions/components/settings/TransactionSettingsModal/types'
import { type TransactionSettingConfig } from 'uniswap/src/features/transactions/components/settings/types'
import { isExtension, isInterfaceDesktop, isMobileApp, isMobileWeb, isWeb } from 'utilities/src/platform'

const TopLevelSettings = ({
  settings,
  setSelectedSetting,
}: {
  settings: TransactionSettingConfig[]
  setSelectedSetting: React.Dispatch<React.SetStateAction<TransactionSettingConfig | undefined>>
}): JSX.Element => {
  return (
    <Flex gap={isWeb ? '$spacing4' : '$spacing8'} py={isWeb ? '$spacing8' : '$spacing12'}>
      {settings.map((setting, index) => {
        return (
          <TransactionSettingRow
            key={`swap-setting-${index}`}
            setSelectedSetting={setSelectedSetting}
            setting={setting}
          />
        )
      })}
    </Flex>
  )
}

interface SettingsPageLayoutProps {
  SelectedSetting: TransactionSettingConfig | undefined
  setSelectedSetting: React.Dispatch<React.SetStateAction<TransactionSettingConfig | undefined>>
  initialSelectedSetting: TransactionSettingConfig | undefined
  defaultTitle?: string
  onClose?: () => void
}

const SettingsPageLayout = ({
  children,
  SelectedSetting,
  setSelectedSetting,
  initialSelectedSetting,
  defaultTitle,
  onClose,
}: PropsWithChildren<SettingsPageLayoutProps>): JSX.Element => {
  const { t } = useTranslation()
  const media = useMedia()

  const title = SelectedSetting ? SelectedSetting.renderTitle(t) : defaultTitle ?? t('swap.settings.title')

  // For selected settings, show title on all platforms unless it is explicitly hidden via hideTitle.
  // For top level settings (not selected), show title on mobile + small screen web only.
  const isWebSmallScreen = media.sm && isWeb
  const shouldShowTitle = SelectedSetting
    ? !SelectedSetting.hideTitle
    : isMobileApp || (isWebSmallScreen && !isExtension)

  // Hide close button on desktop web
  const shouldShowCloseButton = !isInterfaceDesktop && onClose
  return (
    <Flex gap="$spacing16">
      {shouldShowTitle && (
        <Flex row justifyContent="space-between" pt={isWeb ? '$spacing8' : 0}>
          <TouchableArea onPress={(): void => setSelectedSetting(undefined)}>
            <RotatableChevron
              color={
                SelectedSetting === undefined || SelectedSetting === initialSelectedSetting
                  ? '$transparent'
                  : '$neutral3'
              }
              height={iconSizes.icon24}
              width={iconSizes.icon24}
            />
          </TouchableArea>
          <Text textAlign="center" variant="body1">
            {title}
          </Text>
          <Flex width={iconSizes.icon24} />
        </Flex>
      )}
      {children}
      {shouldShowCloseButton && (
        <Flex centered row pb={isWebSmallScreen ? '$spacing24' : '$spacing8'}>
          <Button testID="swap-settings-close" emphasis="secondary" onPress={onClose}>
            {t('common.button.save')}
          </Button>
        </Flex>
      )}
    </Flex>
  )
}

export const TransactionSettingsModalContent = ({
  settings,
  defaultTitle,
  initialSelectedSetting,
  onClose,
}: Omit<TransactionSettingsModalProps, 'isOpen'>): JSX.Element => {
  const [SelectedSetting, setSelectedSetting] = useState<TransactionSettingConfig | undefined>(initialSelectedSetting)

  const layoutProps = useMemo(
    () => ({
      defaultTitle,
      SelectedSetting,
      setSelectedSetting,
      initialSelectedSetting,
      onClose,
    }),
    [defaultTitle, SelectedSetting, setSelectedSetting, initialSelectedSetting, onClose],
  )

  const renderContent = useCallback((): JSX.Element => {
    if (SelectedSetting?.Screen) {
      return <SelectedSetting.Screen />
    }
    return <TopLevelSettings settings={settings} setSelectedSetting={setSelectedSetting} />
  }, [SelectedSetting, settings, setSelectedSetting])

  return (
    <Flex gap="$spacing16" px={isWeb ? '$spacing4' : '$spacing24'} py={isWeb ? '$spacing4' : '$spacing12'} width="100%">
      {isMobileApp || isMobileWeb ? (
        // Mobile: Single page with conditional content
        <SettingsPageLayout {...layoutProps}>{renderContent()}</SettingsPageLayout>
      ) : (
        // Desktop: Animated pager with two pages
        <AnimatedPager currentIndex={SelectedSetting?.Screen ? 1 : 0} animation="fast">
          <SettingsPageLayout {...layoutProps}>
            <TopLevelSettings settings={settings} setSelectedSetting={setSelectedSetting} />
          </SettingsPageLayout>
          <SettingsPageLayout {...layoutProps}>
            {SelectedSetting?.Screen && <SelectedSetting.Screen />}
          </SettingsPageLayout>
        </AnimatedPager>
      )}
    </Flex>
  )
}
