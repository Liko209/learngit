interface IRTCAccount {
  isReady(): boolean;
  createOutCallSession(toNum:String): void;
}

export { IRTCAccount };
