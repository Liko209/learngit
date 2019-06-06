class TelephonyService {
  ignore = jest.fn();
  sendToVoiceMail = jest.fn();
  replyWithPattern = jest.fn();
  replyWithMessage = jest.fn();
  startReply = jest.fn();
  hangUp = jest.fn();
  forward = jest.fn();
  getForwardingNumberList = jest.fn();
  getForwardPermission = jest.fn();
}

export { TelephonyService };
