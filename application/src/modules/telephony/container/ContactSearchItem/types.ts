type ContactSearchItemProps = {
  phoneId?: string;
  personId?: number;
  directDial?: string;
  selected: boolean;
  onClick: () => void;
  phoneNumberType?: string;
  itemIndex: number;
};

type ContactSearchItemViewProps = {
  uid?: number;
  name?: string;
  phoneNumber: string;
  isExt: boolean;
  showDialIcon: boolean;
  selected: boolean;
  onClick: () => void;
  onAfterMount: () => void;
  isTransferPage: boolean;
  selectedCallItemIndex: number;
  itemIndex: number;
};

export { ContactSearchItemProps, ContactSearchItemViewProps };
