export type DialerPanelProps = {};

export type DialerPanelViewProps = {
  makeCall: (phoneNumber: string) => void;
  onAfterDialerOpen: () => void;
};
