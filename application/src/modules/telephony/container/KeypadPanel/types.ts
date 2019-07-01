export type KeypadPanelProps = {};

export type KeypadPanelViewProps = {
  dtmfThroughKeypad: (digit: string) => void;
  dtmfThroughKeyboard: (digit: string) => void;
  playAudio: (digit: string) => void;
  dialerFocused: boolean;
};
