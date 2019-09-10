class TelephonyService {
  ignore = jest.fn();
  sendToVoiceMail = jest.fn();
  replyWithPattern = jest.fn();
  replyWithMessage = jest.fn();
  startReply = jest.fn();
  hangUp = jest.fn();
  flip = jest.fn();
  forward = jest.fn();
  getForwardingNumberList = jest.fn();
  getForwardPermission = jest.fn();
  directCall = jest.fn();
  switchCall = jest.fn();
  getSwitchCall = jest.fn().mockResolvedValue({});
}

export { TelephonyService };
