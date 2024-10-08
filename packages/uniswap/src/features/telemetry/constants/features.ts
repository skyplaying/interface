// MOB-2816: move these to analytics-events package
export enum UnitagEventName {
  UnitagBannerActionTaken = 'Unitag Banner Action Taken',
  UnitagOnboardingActionTaken = 'Unitag Onboarding Action Taken',
  UnitagClaimAvailabilityDisplayed = 'Unitag Claim Availability Displayed',
  UnitagClaimed = 'Unitag Claimed',
  UnitagMetadataUpdated = 'Unitag Metadata Updated',
  UnitagChanged = 'Unitag Changed',
  UnitagRemoved = 'Unitag Removed',
}

export enum FiatOffRampEventName {
  FORBuySellToggled = 'Fiat OnRamp Buy Sell Toggled',
  FiatOffRampAmountEntered = 'Fiat OffRamp Amount Entered',
  FiatOffRampTransactionUpdated = 'Fiat OffRamp Transaction Updated', // TODO: must implement
  FiatOffRampTokenSelected = 'Fiat OffRamp Token Selected',
  FiatOffRampWidgetOpened = 'Fiat OffRamp Widget Opened',
  FiatOffRampWidgetCompleted = 'Fiat OffRamp Widget Completed', // TODO: must implement
  FiatOffRampFundsSent = 'Fiat OffRamp Funds Sent', // TODO: must implement
}

export enum FiatOnRampEventName {
  FiatOnRampAmountEntered = 'Fiat OnRamp Amount Entered',
  FiatOnRampTransactionUpdated = 'Fiat OnRamp Transaction Updated',
  FiatOnRampTokenSelected = 'Fiat OnRamp Token Selected',
  FiatOnRampWidgetOpened = 'Fiat OnRamp Widget Opened',
}

export enum InstitutionTransferEventName {
  InstitutionTransferTransactionUpdated = 'Institution Transfer Transaction Updated',
  InstitutionTransferWidgetOpened = 'Institution Transfer Widget Opened',
}
