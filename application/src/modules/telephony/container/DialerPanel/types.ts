export type DialerPanelProps = {};

export type DialerPanelViewProps = {
  makeCall: (phoneNumber: string) => void;
  isTransferPage: boolean;
  onAfterDialerOpen: () => void;
  displayCallerIdSelector: boolean;
  backToDialerFromTransferPage: () => void;
};
