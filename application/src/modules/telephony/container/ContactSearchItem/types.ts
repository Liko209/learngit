type ContactSearchItemProps = {
  phoneId?: string;
  personId?: number;
  directDial?: string;
  selected: boolean;
  onClick: () => void;
  phoneNumberType?: string;
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
};

export { ContactSearchItemProps, ContactSearchItemViewProps };
