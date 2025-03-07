import { NavIcon } from 'components/NavBar/NavIcon'
import { PageType, useIsPage } from 'hooks/useIsPage'
import styled from 'lib/styled-components'
import { BagIcon, HundredsOverflowIcon, TagIcon } from 'nft/components/icons'
import { useBag, useSellAsset } from 'nft/hooks'
import { useCallback } from 'react'

const CounterDot = styled.div`
  background-color: ${({ theme }) => theme.accent1};
  border-radius: 100px;
  color: ${({ theme }) => theme.deprecated_accentTextLightPrimary};
  font-size: 10px;
  line-height: 12px;
  min-height: 16px;
  min-width: 16px;
  padding: 2px 4px;
  position: absolute;
  right: 0px;
  text-align: center;
  top: 4px;
`

export const Bag = () => {
  const itemsInBag = useBag((state) => state.itemsInBag)
  const sellAssets = useSellAsset((state) => state.sellAssets)
  const isProfilePage = useIsPage(PageType.NFTS_PROFILE)

  const { bagExpanded, setBagExpanded } = useBag(({ bagExpanded, setBagExpanded }) => ({ bagExpanded, setBagExpanded }))

  const handleIconClick = useCallback(() => {
    setBagExpanded({ bagExpanded: !bagExpanded })
  }, [bagExpanded, setBagExpanded])

  const bagQuantity = isProfilePage ? sellAssets.length : itemsInBag.length
  const bagHasItems = bagQuantity > 0

  return (
    <NavIcon isActive={bagExpanded} onClick={handleIconClick}>
      {isProfilePage ? (
        <TagIcon viewBox="0 0 24 24" width={24} height={24} />
      ) : (
        <BagIcon viewBox="0 0 24 24" width={24} height={24} strokeWidth="2px" />
      )}
      {bagHasItems && <CounterDot>{bagQuantity > 99 ? <HundredsOverflowIcon /> : bagQuantity}</CounterDot>}
    </NavIcon>
  )
}
