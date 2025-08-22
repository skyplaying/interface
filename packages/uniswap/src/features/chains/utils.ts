import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import { Token } from '@uniswap/sdk-core'
import { PollingInterval } from 'uniswap/src/constants/misc'
import { Chain } from 'uniswap/src/data/graphql/uniswap-data-api/__generated__/types-and-hooks'
import { ALL_CHAIN_IDS, ORDERED_CHAINS, getChainInfo } from 'uniswap/src/features/chains/chainInfo'
import { EnabledChainsInfo, GqlChainId, NetworkLayer, UniverseChainId } from 'uniswap/src/features/chains/types'
import { Platform } from 'uniswap/src/features/platforms/types/Platform'

// Some code from the web app uses chainId types as numbers
// This validates them as coerces into SupportedChainId
export function toSupportedChainId(chainId?: BigNumberish): UniverseChainId | null {
  if (!chainId || !ALL_CHAIN_IDS.map((c) => c.toString()).includes(chainId.toString())) {
    return null
  }
  return parseInt(chainId.toString(), 10) as UniverseChainId
}

export function getChainLabel(chainId: UniverseChainId): string {
  return getChainInfo(chainId).label
}

/**
 * Return the explorer name for the given chain ID
 * @param chainId the ID of the chain for which to return the explorer name
 */
export function getChainExplorerName(chainId: UniverseChainId): string {
  return getChainInfo(chainId).explorer.name
}

export function isTestnetChain(chainId: UniverseChainId): boolean {
  return Boolean(getChainInfo(chainId).testnet)
}

export function isBackendSupportedChainId(chainId: UniverseChainId): boolean {
  const info = getChainInfo(chainId)
  return info.backendChain.backendSupported
}

export function isBackendSupportedChain(chain: Chain): chain is GqlChainId {
  const chainId = fromGraphQLChain(chain)
  if (!chainId) {
    return false
  }

  return isBackendSupportedChainId(chainId)
}

export function chainIdToHexadecimalString(chainId: UniverseChainId): string {
  return BigNumber.from(chainId).toHexString()
}

export function hexadecimalStringToInt(hex: string): number {
  return parseInt(hex, 16)
}

export function isL2ChainId(chainId?: UniverseChainId): boolean {
  return chainId !== undefined && getChainInfo(chainId).networkLayer === NetworkLayer.L2
}

export function isMainnetChainId(chainId?: UniverseChainId): boolean {
  return chainId === UniverseChainId.Mainnet || chainId === UniverseChainId.Sepolia
}

export function toGraphQLChain(chainId: UniverseChainId): GqlChainId {
  return getChainInfo(chainId).backendChain.chain
}

export function fromGraphQLChain(chain: Chain | string | undefined): UniverseChainId | null {
  switch (chain) {
    case Chain.Ethereum:
      return UniverseChainId.Mainnet
    case Chain.Arbitrum:
      return UniverseChainId.ArbitrumOne
    case Chain.Avalanche:
      return UniverseChainId.Avalanche
    case Chain.Base:
      return UniverseChainId.Base
    case Chain.Bnb:
      return UniverseChainId.Bnb
    case Chain.Blast:
      return UniverseChainId.Blast
    case Chain.Celo:
      return UniverseChainId.Celo
    case Chain.MonadTestnet:
      return UniverseChainId.MonadTestnet
    case Chain.Optimism:
      return UniverseChainId.Optimism
    case Chain.Polygon:
      return UniverseChainId.Polygon
    case Chain.EthereumSepolia:
      return UniverseChainId.Sepolia
    case Chain.Unichain:
      return UniverseChainId.Unichain
    case Chain.Solana:
      return UniverseChainId.Solana
    case Chain.Soneium:
      return UniverseChainId.Soneium
    case Chain.AstrochainSepolia:
      return UniverseChainId.UnichainSepolia
    case Chain.Worldchain:
      return UniverseChainId.WorldChain
    case Chain.Zksync:
      return UniverseChainId.Zksync
    case Chain.Zora:
      return UniverseChainId.Zora
  }

  return null
}

export function getPollingIntervalByBlocktime(chainId?: UniverseChainId): PollingInterval {
  return isMainnetChainId(chainId) ? PollingInterval.Fast : PollingInterval.LightningMcQueen
}

export function fromUniswapWebAppLink(network: string | null): UniverseChainId | null {
  switch (network) {
    case Chain.Ethereum.toLowerCase():
      return UniverseChainId.Mainnet
    case Chain.Arbitrum.toLowerCase():
      return UniverseChainId.ArbitrumOne
    case Chain.Avalanche.toLowerCase():
      return UniverseChainId.Avalanche
    case Chain.Base.toLowerCase():
      return UniverseChainId.Base
    case Chain.Blast.toLowerCase():
      return UniverseChainId.Blast
    case Chain.Bnb.toLowerCase():
      return UniverseChainId.Bnb
    case Chain.Celo.toLowerCase():
      return UniverseChainId.Celo
    case Chain.MonadTestnet.toLowerCase():
      return UniverseChainId.MonadTestnet
    case Chain.Optimism.toLowerCase():
      return UniverseChainId.Optimism
    case Chain.Polygon.toLowerCase():
      return UniverseChainId.Polygon
    case Chain.EthereumSepolia.toLowerCase():
      return UniverseChainId.Sepolia
    case Chain.Unichain.toLowerCase():
      return UniverseChainId.Unichain
    case Chain.Soneium.toLowerCase():
      return UniverseChainId.Soneium
    case Chain.AstrochainSepolia.toLowerCase():
      return UniverseChainId.UnichainSepolia
    case Chain.Worldchain.toLowerCase():
      return UniverseChainId.WorldChain
    case Chain.Zksync.toLowerCase():
      return UniverseChainId.Zksync
    case Chain.Zora.toLowerCase():
      return UniverseChainId.Zora
    default:
      throw new Error(`Network "${network}" can not be mapped`)
  }
}

export function toUniswapWebAppLink(chainId: UniverseChainId): string | null {
  switch (chainId) {
    case UniverseChainId.Mainnet:
      return Chain.Ethereum.toLowerCase()
    case UniverseChainId.ArbitrumOne:
      return Chain.Arbitrum.toLowerCase()
    case UniverseChainId.Avalanche:
      return Chain.Avalanche.toLowerCase()
    case UniverseChainId.Base:
      return Chain.Base.toLowerCase()
    case UniverseChainId.Blast:
      return Chain.Blast.toLowerCase()
    case UniverseChainId.Bnb:
      return Chain.Bnb.toLowerCase()
    case UniverseChainId.Celo:
      return Chain.Celo.toLowerCase()
    case UniverseChainId.MonadTestnet:
      return Chain.MonadTestnet.toLowerCase()
    case UniverseChainId.Optimism:
      return Chain.Optimism.toLowerCase()
    case UniverseChainId.Polygon:
      return Chain.Polygon.toLowerCase()
    case UniverseChainId.Sepolia:
      return Chain.EthereumSepolia.toLowerCase()
    case UniverseChainId.Unichain:
      return Chain.Unichain.toLowerCase()
    case UniverseChainId.Soneium:
      return Chain.Soneium.toLowerCase()
    case UniverseChainId.UnichainSepolia:
      return Chain.AstrochainSepolia.toLowerCase()
    case UniverseChainId.WorldChain:
      return Chain.Worldchain.toLowerCase()
    case UniverseChainId.Zksync:
      return Chain.Zksync.toLowerCase()
    case UniverseChainId.Zora:
      return Chain.Zora.toLowerCase()
    default:
      throw new Error(`ChainID "${chainId}" can not be mapped`)
  }
}

export function filterChainIdsByFeatureFlag(featureFlaggedChainIds: {
  [key in UniverseChainId]?: boolean
}): UniverseChainId[] {
  return ALL_CHAIN_IDS.filter((chainId) => {
    return featureFlaggedChainIds[chainId] ?? true
  })
}

export function getEnabledChains({
  platform,
  /**
   * When `true`, it will return all enabled chains, including testnets.
   */
  includeTestnets = false,
  isTestnetModeEnabled,
  featureFlaggedChainIds,
  connectedWalletChainIds,
}: {
  platform?: Platform
  isTestnetModeEnabled: boolean
  featureFlaggedChainIds: UniverseChainId[]
  connectedWalletChainIds?: UniverseChainId[]
  includeTestnets?: boolean
}): EnabledChainsInfo {
  const enabledChainInfos = ORDERED_CHAINS.filter((chainInfo) => {
    // Filter by platform
    if (platform !== undefined && platform !== chainInfo.platform) {
      return false
    }

    // Filter by testnet mode
    if (!includeTestnets && isTestnetModeEnabled !== isTestnetChain(chainInfo.id)) {
      return false
    }

    // Filter by feature flags
    if (!featureFlaggedChainIds.includes(chainInfo.id)) {
      return false
    }

    // Filter by connected wallet chains if provided
    if (connectedWalletChainIds && !connectedWalletChainIds.includes(chainInfo.id)) {
      return false
    }

    return true
  })

  // Extract chain IDs and GQL chains from filtered results
  const chains = enabledChainInfos.map((chainInfo) => chainInfo.id)
  const gqlChains = enabledChainInfos.map((chainInfo) => chainInfo.backendChain.chain)

  const result = {
    chains,
    gqlChains,
    defaultChainId: getDefaultChainId({ platform, isTestnetModeEnabled }),
    isTestnetModeEnabled,
  }

  return result
}

function getDefaultChainId({
  platform,
  isTestnetModeEnabled,
}: {
  platform?: Platform
  isTestnetModeEnabled: boolean
}): UniverseChainId {
  if (platform === Platform.SVM) {
    // TODO(Solana): is there a Solana testnet we can return here?
    return UniverseChainId.Solana
  }

  return isTestnetModeEnabled ? UniverseChainId.Sepolia : UniverseChainId.Mainnet
}

/** Returns all stablecoins for a given chainId. */
export function getStablecoinsForChain(chainId: UniverseChainId): Token[] {
  return getChainInfo(chainId).tokens.stablecoins
}

/** Returns the primary stablecoin for a given chainId. */
export function getPrimaryStablecoin(chainId: UniverseChainId): Token {
  return getChainInfo(chainId).tokens.stablecoins[0]
}

export function isUniverseChainId(chainId?: number | UniverseChainId | null): chainId is UniverseChainId {
  return !!chainId && ALL_CHAIN_IDS.includes(chainId as UniverseChainId)
}
