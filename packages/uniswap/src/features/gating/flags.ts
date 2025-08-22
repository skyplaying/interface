import { logger } from 'utilities/src/logger/logger'
import { isInterface } from 'utilities/src/platform'

// only disable for this enum
/* eslint-disable @typescript-eslint/prefer-enum-initializers */
/**
 * Feature flag names
 */
export enum FeatureFlags {
  // Shared
  ArbitrumDutchV3,
  BlockaidFotLogging,
  DisableSwap7702,
  GqlToRestBalances,
  GqlToRestTransactions,
  EmbeddedWallet,
  FiatOffRamp,
  InstantTokenBalanceUpdate,
  MonadTestnet,
  MonadTestnetDown,
  PortionFields,
  Soneium,
  TwoSecondSwapQuotePollingInterval,
  UnichainFlashblocks,
  UniquoteEnabled,
  UniswapX,
  UniswapXPriorityOrdersBase,
  UniswapXPriorityOrdersOptimism,
  UniswapXPriorityOrdersUnichain,
  ServiceBasedSwapTransactionInfo,
  SmartWallet,
  Solana,
  ForcePermitTransactions,
  EnablePermitMismatchUX,
  ViemProviderEnabled,
  ForceDisableWalletGetCapabilities,
  SmartWalletDisableVideo,

  // Wallet
  DisableFiatOnRampKorea,
  EnableTransactionSpacingForDelegatedAccounts,
  EnableExportPrivateKeys,
  NotificationOnboardingCard,
  OnboardingKeyring,
  PrivateRpc,
  Scantastic,
  SelfReportSpamNFTs,
  UwULink,
  BlurredLockScreen,
  Eip5792Methods,
  ExecuteTransactionV2,
  EnableRestoreSeedPhrase,
  SmartWalletSettings,
  SwapPreSign,
  TradingApiSwapConfirmation,

  // Web
  AATestWeb,
  ConversionApiMigration,
  ConversionTracking,
  DisableExtensionDeeplinks,
  DummyFlagTest,
  GoogleConversionTracking,
  GqlTokenLists,
  LimitsFees,
  LpIncentives,
  MigrateV2,
  PoolSearch,
  PriceRangeInputV2,
  SharedPortfolioUI,
  SolanaPromo,
  TraceJsonRpc,
  TwitterConversionTracking,
  UniversalSwap,
  BatchedSwaps,
}
/* eslint-enable @typescript-eslint/prefer-enum-initializers */

// These names must match the gate name on statsig
export const SHARED_FEATURE_FLAG_NAMES = new Map<FeatureFlags, string>([
  [FeatureFlags.ArbitrumDutchV3, 'uniswapx_dutchv3_orders_arbitrum'],
  [FeatureFlags.BlockaidFotLogging, 'blockaid_fot_logging'],
  [FeatureFlags.DisableSwap7702, 'disable-swap-7702'],
  [FeatureFlags.EmbeddedWallet, 'embedded_wallet'],
  [FeatureFlags.EnablePermitMismatchUX, 'enable_permit2_mismatch_ux'],
  [FeatureFlags.ExecuteTransactionV2, 'new_execute_transaction_arch'],
  [FeatureFlags.FiatOffRamp, 'fiat_offramp_web'],
  [FeatureFlags.ForceDisableWalletGetCapabilities, 'force_disable_wallet_get_capabilities'],
  [FeatureFlags.ForcePermitTransactions, 'force_permit_transactions'],
  [FeatureFlags.GqlToRestBalances, 'gql-to-rest-balances'],
  [FeatureFlags.GqlToRestTransactions, 'gql-to-rest-transactions'],
  [FeatureFlags.InstantTokenBalanceUpdate, 'instant-token-balance-update'],
  [FeatureFlags.PortionFields, 'portion-fields'],
  [FeatureFlags.SelfReportSpamNFTs, 'self-report-spam-nfts'],
  [FeatureFlags.ServiceBasedSwapTransactionInfo, 'new_swap_transaction_info_arch'],
  [FeatureFlags.SmartWallet, 'smart-wallet'],
  [FeatureFlags.SmartWalletDisableVideo, 'smart_wallet_disable_video'],
  [FeatureFlags.Solana, 'solana'],
  [FeatureFlags.Soneium, 'soneium'],
  [FeatureFlags.TradingApiSwapConfirmation, 'trading_api_swap_confirmation'],
  [FeatureFlags.TwoSecondSwapQuotePollingInterval, 'two_second_swap_quote_polling_interval'],
  [FeatureFlags.UnichainFlashblocks, 'unichain_flashblocks'],
  [FeatureFlags.UniquoteEnabled, 'uniquote_enabled'],
  [FeatureFlags.UniswapX, 'uniswapx'],
  [FeatureFlags.UniswapXPriorityOrdersBase, 'uniswapx_priority_orders_base'],
  [FeatureFlags.UniswapXPriorityOrdersOptimism, 'uniswapx_priority_orders_optimism'],
  [FeatureFlags.UniswapXPriorityOrdersUnichain, 'uniswapx_priority_orders_unichain'],
  [FeatureFlags.ViemProviderEnabled, 'viem_provider_enabled'],
])

// These names must match the gate name on statsig
export const WEB_FEATURE_FLAG_NAMES = new Map<FeatureFlags, string>([
  ...SHARED_FEATURE_FLAG_NAMES,
  [FeatureFlags.AATestWeb, 'aatest_web'],
  [FeatureFlags.BatchedSwaps, 'batched_swaps'],
  [FeatureFlags.ConversionApiMigration, 'conversion_api_migration'],
  [FeatureFlags.ConversionTracking, 'conversion-tracking'],
  [FeatureFlags.DisableExtensionDeeplinks, 'disable_extension_deeplinks'],
  [FeatureFlags.DummyFlagTest, 'dummy_flag_test'],
  [FeatureFlags.GoogleConversionTracking, 'google_conversion_tracking'],
  [FeatureFlags.GqlTokenLists, 'gql_token_lists'],
  [FeatureFlags.LimitsFees, 'limits_fees'],
  [FeatureFlags.LpIncentives, 'lp_incentives'],
  [FeatureFlags.MigrateV2, 'migrate_v2'],
  [FeatureFlags.PoolSearch, 'pool_search'],
  [FeatureFlags.PriceRangeInputV2, 'price_range_input_v2'],
  [FeatureFlags.SharedPortfolioUI, 'shared_portfolio_ui'],
  [FeatureFlags.SolanaPromo, 'solana_promo'],
  [FeatureFlags.TraceJsonRpc, 'traceJsonRpc'],
  [FeatureFlags.TwitterConversionTracking, 'twitter_conversion_tracking'],
  [FeatureFlags.UnichainFlashblocks, 'unichain_flashblocks'],
  [FeatureFlags.UniversalSwap, 'universal_swap'],
])

// These names must match the gate name on statsig
export const WALLET_FEATURE_FLAG_NAMES = new Map<FeatureFlags, string>([
  ...SHARED_FEATURE_FLAG_NAMES,
  [FeatureFlags.BlurredLockScreen, 'blurred_lock_screen'],
  [FeatureFlags.DisableFiatOnRampKorea, 'disable-fiat-onramp-korea'],
  [FeatureFlags.Eip5792Methods, 'eip_5792_methods'],
  [FeatureFlags.EnableExportPrivateKeys, 'enable-export-private-keys'],
  [FeatureFlags.EnableRestoreSeedPhrase, 'enable-restore-seed-phrase'],
  [FeatureFlags.EnableTransactionSpacingForDelegatedAccounts, 'enable_transaction_spacing_for_delegated_accounts'],
  [FeatureFlags.NotificationOnboardingCard, 'notification_onboarding_card'],
  [FeatureFlags.OnboardingKeyring, 'onboarding-keyring'],
  [FeatureFlags.PrivateRpc, 'mev-blocker'],
  [FeatureFlags.Scantastic, 'scantastic'],
  [FeatureFlags.SmartWalletSettings, 'smart_wallet_settings'],
  [FeatureFlags.SwapPreSign, 'swap_pre_sign'],
  [FeatureFlags.UwULink, 'uwu-link'],
])

export enum FeatureFlagClient {
  Web = 0,
  Wallet = 1,
}

const FEATURE_FLAG_NAMES = {
  [FeatureFlagClient.Web]: WEB_FEATURE_FLAG_NAMES,
  [FeatureFlagClient.Wallet]: WALLET_FEATURE_FLAG_NAMES,
}

export function getFeatureFlagName(flag: FeatureFlags, client?: FeatureFlagClient): string {
  const names =
    client !== undefined
      ? FEATURE_FLAG_NAMES[client]
      : isInterface
        ? FEATURE_FLAG_NAMES[FeatureFlagClient.Web]
        : FEATURE_FLAG_NAMES[FeatureFlagClient.Wallet]
  const name = names.get(flag)
  if (!name) {
    const err = new Error(`Feature ${FeatureFlags[flag]} does not have a name mapped for this application`)

    logger.error(err, {
      tags: {
        file: 'flags.ts',
        function: 'getFeatureFlagName',
      },
    })

    throw err
  }

  return name
}
