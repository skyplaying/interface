import { type TransactionSettingConfig } from 'uniswap/src/features/transactions/components/settings/types'
import { PlatformSplitStubError } from 'utilities/src/errors'

/**
 * Base implementation of the deadline setting.
 * For the swap-specific implementation, see SwapFormSettings.
 */
export const Deadline: TransactionSettingConfig = {
  renderTitle: (t) => t('swap.deadline.settings.title.short'),
  Control() {
    throw new PlatformSplitStubError('Deadline')
  },
  Warning() {
    throw new PlatformSplitStubError('DeadlineWarning')
  },
}
