enum CallHistoryTypes {
  All,
  Missed,
}

type CallHistoryViewProps = {
  clearUMI: () => void;
};

export { CallHistoryTypes, CallHistoryViewProps };
