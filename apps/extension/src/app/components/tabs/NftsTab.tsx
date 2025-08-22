import { SharedEventName } from '@uniswap/analytics-events'
import { memo, useCallback } from 'react'
import { Flex } from 'ui/src'
import { NftsList } from 'uniswap/src/components/nfts/NftsList'
import { NFTItem } from 'uniswap/src/features/nfts/types'
import { ElementName, SectionName } from 'uniswap/src/features/telemetry/constants'
import { sendAnalyticsEvent } from 'uniswap/src/features/telemetry/send'
import { NftViewWithContextMenu } from 'wallet/src/components/nfts/NftViewWithContextMenu'
import { useAccounts } from 'wallet/src/features/wallet/hooks'

export const NftsTab = memo(function _NftsTab({ owner, skip }: { owner: Address; skip?: boolean }): JSX.Element {
  const accounts = useAccounts()

  const renderNFTItem = useCallback(
    (item: NFTItem) => {
      const onPress = (): void => {
        sendAnalyticsEvent(SharedEventName.ELEMENT_CLICKED, {
          element: ElementName.NftItem,
          section: SectionName.HomeNFTsTab,
        })
      }

      return (
        <Flex fill m="$spacing4">
          <NftViewWithContextMenu walletAddresses={Object.keys(accounts)} item={item} owner={owner} onPress={onPress} />
        </Flex>
      )
    },
    [accounts, owner],
  )

  return (
    <NftsList
      emptyStateStyle={defaultEmptyStyle}
      errorStateStyle={defaultEmptyStyle}
      owner={owner}
      renderNFTItem={renderNFTItem}
      skip={skip}
    />
  )
})

const defaultEmptyStyle = {
  minHeight: 100,
  paddingVertical: '$spacing12',
  width: '100%',
}
