import { MONAD_LOGO } from 'ui/src/assets'
import { Chain as BackendChainId } from 'uniswap/src/data/graphql/uniswap-data-api/__generated__/types-and-hooks'
import { DEFAULT_NATIVE_ADDRESS_LEGACY, getQuicknodeEndpointUrl } from 'uniswap/src/features/chains/evm/rpc'
import { buildChainTokens } from 'uniswap/src/features/chains/evm/tokens'
import {
  GqlChainId,
  NetworkLayer,
  RPCType,
  UniverseChainId,
  UniverseChainInfo,
} from 'uniswap/src/features/chains/types'
import { Platform } from 'uniswap/src/features/platforms/types/Platform'
import { ElementName } from 'uniswap/src/features/telemetry/constants'
import { buildUSDT } from 'uniswap/src/features/tokens/stablecoin'

const tokens = buildChainTokens({
  stables: {
    USDT: buildUSDT('0xfBC2D240A5eD44231AcA3A9e9066bc4b33f01149', UniverseChainId.MonadTestnet),
  },
})

export const MONAD_CHAIN_INFO = {
  id: UniverseChainId.MonadTestnet,
  platform: Platform.EVM,
  testnet: true,
  assetRepoNetworkName: undefined,
  backendChain: {
    chain: BackendChainId.MonadTestnet as GqlChainId,
    backendSupported: true,
    nativeTokenBackendAddress: undefined,
  },
  bridge: undefined,
  docs: 'https://docs.monad.xyz/',
  label: 'Monad Testnet',
  logo: MONAD_LOGO,
  name: 'Monad Testnet',
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MON',
    decimals: 18,
    address: DEFAULT_NATIVE_ADDRESS_LEGACY,
    logo: MONAD_LOGO,
  },
  networkLayer: NetworkLayer.L1,
  pendingTransactionsRetryOptions: undefined,
  statusPage: undefined,
  supportsV4: false,
  urlParam: 'monad_testnet',
  rpcUrls: {
    [RPCType.Public]: {
      http: [getQuicknodeEndpointUrl(UniverseChainId.MonadTestnet)],
    },
    [RPCType.Default]: {
      http: [getQuicknodeEndpointUrl(UniverseChainId.MonadTestnet)],
    },
    [RPCType.Interface]: {
      http: [getQuicknodeEndpointUrl(UniverseChainId.MonadTestnet)],
    },
  },
  wrappedNativeCurrency: {
    name: 'Wrapped Monad',
    symbol: 'WMON',
    decimals: 18,
    address: '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701',
  },
  blockPerMainnetEpochForChainId: 1,
  blockWaitMsBeforeWarning: undefined,
  elementName: ElementName.ChainMonadTestnet,
  explorer: {
    name: 'Monad Explorer',
    url: 'https://testnet.monadexplorer.com/',
  },
  interfaceName: 'monad',
  tokens,
  tradingApiPollingIntervalMs: 200,
} as const satisfies UniverseChainInfo
