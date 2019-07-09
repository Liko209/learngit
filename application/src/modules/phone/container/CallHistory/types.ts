import { IJuiChangePhoneFilter } from 'jui/pattern/Phone/Filter';

enum CallHistoryTypes {
  All,
  Missed,
}

type CallHistoryViewProps = {
  clearUMI: () => void;
};

interface IUseFilter {
  (initial: string): [string, IJuiChangePhoneFilter];
}

export { CallHistoryTypes, CallHistoryViewProps, IUseFilter };
