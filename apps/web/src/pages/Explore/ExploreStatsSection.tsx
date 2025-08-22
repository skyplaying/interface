import { DeltaArrow } from 'components/Tokens/TokenDetails/Delta'
import { LoadingBubble } from 'components/Tokens/loading'
import { Fragment, memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { use24hProtocolVolume, useDailyTVLWithChange } from 'state/explore/protocolStats'
import { Flex, Popover, Text, isTouchable, useMedia, useShadowPropsMedium } from 'ui/src'
import { zIndexes } from 'ui/src/theme'
import { useLocalizationContext } from 'uniswap/src/features/language/LocalizationContext'
import { NumberType } from 'utilities/src/format/types'

interface ExploreStatSectionData {
  label: string
  value: string
  change: number
  protocolPopoverFormattedData?: {
    label: string
    value?: number
  }[]
}

const ExploreStatsSection = () => {
  const media = useMedia()
  const { t } = useTranslation()
  const { convertFiatAmountFormatted } = useLocalizationContext()

  const {
    protocolVolumes,
    totalVolume,
    totalChangePercent: volume24hChangePercent,
    isLoading: isVolumeLoading,
  } = use24hProtocolVolume()
  const {
    totalTVL,
    protocolTVL,
    totalChangePercent: totalTVL24hrChangePercent,
    protocolChangePercent,
    isLoading: isTVLLoading,
  } = useDailyTVLWithChange()

  const isStatDataLoading = isVolumeLoading || isTVLLoading

  const exploreStatsSectionData = useMemo(() => {
    const formatPrice = (price: number) => convertFiatAmountFormatted(price, NumberType.FiatTokenPrice)

    const stats = [
      {
        label: t('stats.volume.1d.long'),
        value: formatPrice(totalVolume),
        change: volume24hChangePercent,
        protocolPopoverFormattedData: [
          { label: t('common.protocol.v4'), value: protocolVolumes.v4 },
          { label: t('common.protocol.v3'), value: protocolVolumes.v3 },
          { label: t('common.protocol.v2'), value: protocolVolumes.v2 },
        ],
      },
      { label: t('common.totalUniswapTVL'), value: formatPrice(totalTVL), change: totalTVL24hrChangePercent },
      { label: t('explore.v2TVL'), value: formatPrice(protocolTVL.v2), change: protocolChangePercent.v2 },
      { label: t('explore.v3TVL'), value: formatPrice(protocolTVL.v3), change: protocolChangePercent.v3 },
      { label: t('explore.v4TVL'), value: formatPrice(protocolTVL.v4), change: protocolChangePercent.v4 },
    ]

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return stats.filter((state): state is Exclude<typeof state, null> => state !== null)
  }, [
    t,
    convertFiatAmountFormatted,
    totalVolume,
    volume24hChangePercent,
    protocolVolumes.v4,
    protocolVolumes.v3,
    protocolVolumes.v2,
    totalTVL,
    totalTVL24hrChangePercent,
    protocolTVL.v2,
    protocolTVL.v3,
    protocolTVL.v4,
    protocolChangePercent.v2,
    protocolChangePercent.v3,
    protocolChangePercent.v4,
  ])

  return (
    <Flex row width="100%">
      {exploreStatsSectionData.map((data, index) => (
        <Flex
          key={data.label}
          borderLeftWidth={index === 0 ? 0 : '$spacing1'}
          borderColor="$surface3"
          pl={index == 0 ? 0 : '$spacing24'}
          flex={1}
          cursor={data.protocolPopoverFormattedData ? 'pointer' : 'default'}
          transition="opacity 0.3s ease, transform 0.3s ease"
          display={media.md && index > 1 ? 'none' : 'flex'}
        >
          {isTouchable || !data.protocolPopoverFormattedData ? (
            <StatDisplay data={data} isLoading={isStatDataLoading} />
          ) : (
            <StatDisplayWithPopover data={data} isLoading={isStatDataLoading} />
          )}
        </Flex>
      ))}
    </Flex>
  )
}

export default ExploreStatsSection

interface StatDisplayProps {
  data: ExploreStatSectionData
  isLoading?: boolean
  isHoverable?: boolean
}

const StatDisplay = memo(({ data, isLoading, isHoverable }: StatDisplayProps) => {
  const { formatPercent } = useLocalizationContext()

  return (
    <Flex group gap="$spacing4" animation="simple">
      <Text variant="body4" color="$neutral2" $group-hover={{ color: isHoverable ? '$neutral2Hovered' : '$neutral2' }}>
        {data.label}
      </Text>
      {isLoading ? (
        <LoadingBubble height="20px" width="52px" />
      ) : (
        <Text variant="subheading1" color="$neutral1">
          {data.value}
        </Text>
      )}
      <Flex row alignItems="center" gap="$spacing2" style={{ fontSize: 12 }}>
        {isLoading ? (
          <LoadingBubble height="12px" width="30px" />
        ) : (
          <Fragment>
            <DeltaArrow delta={data.change} formattedDelta={formatPercent(Math.abs(data.change))} size={12} />
            <Text variant="body4" color="$neutral1">
              {formatPercent(Math.abs(data.change))}
            </Text>
          </Fragment>
        )}
      </Flex>
    </Flex>
  )
})

StatDisplay.displayName = 'StatDisplay'

const StatDisplayWithPopover = memo(({ data, isLoading }: StatDisplayProps) => {
  const shadowProps = useShadowPropsMedium()
  const { convertFiatAmountFormatted } = useLocalizationContext()

  return (
    <Popover hoverable placement="bottom-start" offset={{ mainAxis: 10 }}>
      <Popover.Trigger>
        <StatDisplay data={data} isLoading={isLoading} isHoverable />
      </Popover.Trigger>
      <Popover.Content
        zIndex={zIndexes.dropdown}
        borderColor="$surface2"
        borderRadius="$rounded16"
        borderWidth="$spacing1"
        enterStyle={{ y: -10, opacity: 0 }}
        exitStyle={{ y: -10, opacity: 0 }}
        animation="simple"
        {...shadowProps}
      >
        <Flex gap="$spacing8" px="$spacing4" py="$spacing6" width={180}>
          {data.protocolPopoverFormattedData?.map((item) => {
            return (
              <Flex key={item.label} row justifyContent="space-between">
                <Text variant="body4" color="neutral2">
                  {item.label}
                </Text>
                <Text variant="body4">{convertFiatAmountFormatted(item.value ?? 0, NumberType.FiatTokenPrice)}</Text>
              </Flex>
            )
          })}
        </Flex>
      </Popover.Content>
    </Popover>
  )
})

StatDisplayWithPopover.displayName = 'StatDisplayWithPopover'
