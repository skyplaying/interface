import { MismatchToastItem } from 'components/Popups/MismatchToastItem'
import {
  FORTransactionPopupContent,
  FailedNetworkSwitchPopup,
  TransactionPopupContent,
  UniswapXOrderPopupContent,
} from 'components/Popups/PopupContent'
import { ToastRegularSimple } from 'components/Popups/ToastRegularSimple'
import { PopupContent, PopupType, SwitchNetworkAction } from 'components/Popups/types'
import { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { Flex, Text } from 'ui/src'
import { Shuffle } from 'ui/src/components/icons/Shuffle'
import { NetworkLogo } from 'uniswap/src/components/CurrencyLogo/NetworkLogo'
import { getChainInfo } from 'uniswap/src/features/chains/chainInfo'
import { UniverseChainId } from 'uniswap/src/features/chains/types'

export function PopupItem({ content, onClose }: { content: PopupContent; popKey: string; onClose: () => void }) {
  const { t } = useTranslation()

  switch (content.type) {
    case PopupType.Transaction: {
      return <TransactionPopupContent hash={content.hash} onClose={onClose} />
    }
    case PopupType.Order: {
      return <UniswapXOrderPopupContent orderHash={content.orderHash} onClose={onClose} />
    }
    case PopupType.FailedSwitchNetwork: {
      return <FailedNetworkSwitchPopup chainId={content.failedSwitchNetwork} onClose={onClose} />
    }
    case PopupType.SwitchNetwork: {
      return (
        <ToastRegularSimple
          onDismiss={onClose}
          icon={<NetworkLogo chainId={content.chainId} />}
          text={getSwitchNetworkTitle({
            t,
            action: content.action,
            chainId: content.chainId,
          })}
        />
      )
    }
    case PopupType.Bridge: {
      return (
        <ToastRegularSimple
          onDismiss={onClose}
          icon={<BridgeToast inputChainId={content.inputChainId} outputChainId={content.outputChainId} />}
        />
      )
    }
    case PopupType.Mismatch: {
      return <MismatchToastItem onDismiss={onClose} />
    }
    case PopupType.FORTransaction: {
      return <FORTransactionPopupContent transaction={content.transaction} onClose={onClose} />
    }
  }
}

function getSwitchNetworkTitle({
  t,
  action,
  chainId,
}: {
  t: TFunction
  action: SwitchNetworkAction
  chainId: UniverseChainId
}) {
  const { label } = getChainInfo(chainId)

  switch (action) {
    case SwitchNetworkAction.Swap:
      return t('notification.swap.network', { network: label })
    case SwitchNetworkAction.Send:
      return t('notification.send.network', { network: label })
    case SwitchNetworkAction.Buy:
      return t('notification.buy.network', { network: label })
    case SwitchNetworkAction.Sell:
      return t('notification.sell.network', { network: label })
    case SwitchNetworkAction.LP:
      return t('notification.lp.network', { network: label })
    case SwitchNetworkAction.Limit:
      return t('notification.limit.network', { network: label })
    case SwitchNetworkAction.PoolFinder:
      return t('notification.poolFinder.network', { network: label })
    default:
      return ''
  }
}

function BridgeToast({
  inputChainId,
  outputChainId,
}: {
  inputChainId: UniverseChainId
  outputChainId: UniverseChainId
}): JSX.Element {
  const originChain = getChainInfo(inputChainId)
  const targetChain = getChainInfo(outputChainId)
  return (
    <Flex row gap="$gap8">
      <Flex row gap="$gap4">
        <NetworkLogo chainId={inputChainId} />
        <Text variant="body2" lineHeight={20}>
          {originChain.label}
        </Text>
      </Flex>
      <Shuffle color="$neutral2" size="$icon.20" />
      <Flex row gap="$gap4">
        <NetworkLogo chainId={outputChainId} />
        <Text variant="body2" lineHeight={20}>
          {targetChain.label}
        </Text>
      </Flex>
    </Flex>
  )
}
