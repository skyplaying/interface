/**
 * Experiment parameter names
 *
 * These must match parameter names on Statsig within an experiment
 */
export enum Experiments {
  PriceUxUpdate = 'price_ux_update',
  PrivateRpc = 'private_rpc',
  NativeTokenPercentageBuffer = 'lp_native_buffer',
  SwapConfirmation = 'swap-confirmation',
  UnichainFlashblocksModal = 'unichain_flashblocks_modal',
}

export enum Layers {
  SwapPage = 'swap-page',
}

// experiment groups

export enum NativeTokenPercentageBufferExperimentGroup {
  Control = 'Control',
  Buffer1 = 'Buffer1',
}

// experiment properties

export enum ArbitrumXV2SamplingProperties {
  RoutingType = 'routingType',
}

export enum PriceUxUpdateProperties {
  UpdatedPriceUX = 'updatedPriceUX',
}

export enum PrivateRpcProperties {
  FlashbotsEnabled = 'flashbots_enabled',
  RefundPercent = 'refund_percent',
}

export enum NativeTokenPercentageBufferProperties {
  BufferSize = 'bufferSize',
}

export enum SwapConfirmationProperties {
  WaitTimes = 'wait_times',
}

export enum UnichainFlashblocksProperties {
  FlashblocksModalEnabled = 'flashblocksModalEnabled',
}

export type ExperimentProperties = {
  [Experiments.PriceUxUpdate]: PriceUxUpdateProperties
  [Experiments.PrivateRpc]: PrivateRpcProperties
  [Experiments.NativeTokenPercentageBuffer]: NativeTokenPercentageBufferProperties
  [Experiments.SwapConfirmation]: SwapConfirmationProperties
  [Experiments.UnichainFlashblocksModal]: UnichainFlashblocksProperties
}

// will be a spread of all experiment properties in that layer
export const LayerProperties: Record<Layers, string[]> = {
  [Layers.SwapPage]: Object.values({
    ...PriceUxUpdateProperties,
    ...UnichainFlashblocksProperties,
  }),
}
