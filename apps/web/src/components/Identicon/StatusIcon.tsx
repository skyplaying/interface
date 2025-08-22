import sockImg from 'assets/svg/socks.svg'
import Identicon from 'components/Identicon'
import { CONNECTOR_ICON_OVERRIDE_MAP } from 'components/Web3Provider/constants'
import { useHasSocks } from 'hooks/useSocksBalance'
import styled from 'lib/styled-components'
import { flexColumnNoWrap } from 'theme/styles'
import { breakpoints } from 'ui/src/theme'
import { useWallet } from 'uniswap/src/features/wallet/hooks/useWallet'

const IconWrapper = styled.div<{ size?: number }>`
  position: relative;
  ${flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  @media only screen and (min-width: ${breakpoints.xl}px) {
    margin-right: 4px;
  }
  & > img,
  span {
    height: ${({ size }) => (size ? size + 'px' : '32px')};
    width: ${({ size }) => (size ? size + 'px' : '32px')};
  }
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    align-items: flex-end;
  `};
`

const MiniIconContainer = styled.div<{ side: 'left' | 'right' }>`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 16px;
  height: 16px;
  bottom: -4px;
  ${({ side }) => `${side === 'left' ? 'left' : 'right'}: -4px;`}
  border-radius: 50%;
  outline: 2px solid ${({ theme }) => theme.surface1};
  outline-offset: -0.1px;
  background-color: ${({ theme }) => theme.surface1};
  overflow: hidden;
  @supports (overflow: clip) {
    overflow: clip;
  }
`

const MiniImg = styled.img`
  width: 16px;
  height: 16px;
`

function Socks() {
  return (
    <MiniIconContainer side="left">
      <MiniImg src={sockImg} />
    </MiniIconContainer>
  )
}

function MiniWalletIcon() {
  const account = useWallet().evmAccount
  if (!account) {
    return null
  }

  // TODO(APPS-8471): this should use useConnectedWallet() which returns connected WalletConnectorMeta, which is post-icon-override-map transformation
  const icon = CONNECTOR_ICON_OVERRIDE_MAP[account.walletMeta.name ?? ''] ?? account.walletMeta.icon

  return (
    <MiniIconContainer side="right" data-testid="MiniIcon">
      <MiniImg src={icon} alt={`${account.walletMeta.name} icon`} />
    </MiniIconContainer>
  )
}

export default function StatusIcon({
  size = 16,
  showMiniIcons = true,
  address,
}: {
  size?: number
  showMiniIcons?: boolean
  address?: string
}) {
  const account = useWallet().evmAccount
  const hasSocks = useHasSocks()
  return (
    <IconWrapper size={size} data-testid="StatusIconRoot">
      <Identicon account={address ?? account?.address} size={size} />
      {showMiniIcons && <MiniWalletIcon />}
      {hasSocks && showMiniIcons && <Socks />}
    </IconWrapper>
  )
}
