interface IRTCCallSession {
  setSession(session: any): void;
  hangup(): void;
  answer(): void;
  reject(): void;
  sendToVoicemail(): void;
}

export { IRTCCallSession };
