interface IRTCAccount {
  isReady(): boolean;
  createOutCallSession(toNum: String): any;
}

export { IRTCAccount };
