/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-25 09:10:00
 * Copyright © RingCentral. All rights reserved.
 */
import { RTCSipUserAgent } from '../RTCSipUserAgent';
import { ProvisionDataOptions, UA_EVENT } from '../../signaling/types';
import { RTCCallOptions } from '../../api/types';
import { EventEmitter2 } from 'eventemitter2';

class MockUserAgent extends EventEmitter2 {
  constructor() {
    super();
  }
  invite = jest.fn();
}
class MockWebPhone {
  public userAgent: MockUserAgent = new MockUserAgent();
}

class MockEventReceiver {
  public _userAgent: RTCSipUserAgent;
  constructor(userAgent: RTCSipUserAgent) {
    this._userAgent = userAgent;
    this._userAgent.on(UA_EVENT.REG_SUCCESS, () => {
      this.registerSuccess();
    });
    this._userAgent.on(UA_EVENT.REG_FAILED, (response: any, cause: any) => {
      this.registerFailed(response, cause);
    });
  }
  registerSuccess = jest.fn();
  registerFailed = jest.fn();
}

jest.mock('ringcentral-web-phone', () => {
  return jest.fn().mockImplementation(() => {
    return new MockWebPhone();
  });
});

const provisionData = 'provisionData';
const options: ProvisionDataOptions = {};
const phoneNumber = 'phoneNumber';

describe('RTCSipUserAgent', () => {
  it('should emit registered event when web-phone tells register is successful. [JPT-599]', () => {
    const userAgent = new RTCSipUserAgent();
    userAgent._createWebPhone(provisionData, options);
    const eventReceiver = new MockEventReceiver(userAgent);
    userAgent._webphone.userAgent.emit('registered');
    expect(eventReceiver.registerSuccess).toBeCalled();
  });

  it('should emit registerFailed event withe cause and response when webphone tells register is failed. [JPT-600]', () => {
    const userAgent = new RTCSipUserAgent();
    userAgent._createWebPhone(provisionData, options);
    const eventReceiver = new MockEventReceiver(userAgent);
    userAgent._webphone.userAgent.emit(
      'registrationFailed',
      { text: 'mockFailed' },
      500,
    );
    expect(eventReceiver.registerFailed).toBeCalledWith(
      { text: 'mockFailed' },
      500,
    );
  });

  describe('reRegister()', () => {
    it('Should reRegister has been called', () => {
      const userAgent = new RTCSipUserAgent();
      userAgent._createWebPhone(provisionData, options);
      jest.spyOn(userAgent, 'reRegister').mockImplementation(() => {});
      userAgent.reRegister();
      expect(userAgent.reRegister).toHaveBeenCalled();
    });
  });

  describe('makeCall', () => {
    let userAgent = null;
    function setupMakeCall() {
      userAgent = new RTCSipUserAgent();
      userAgent._createWebPhone(provisionData, options);
      jest.spyOn(userAgent, 'makeCall');
    }

    it('Should call the invite function of WebPhone with default homeCountryId when UserAgent makeCall [JPT-973] [JPT-975]', async () => {
      setupMakeCall();
      const options: RTCCallOptions = {};
      userAgent.makeCall(phoneNumber, options);
      expect(userAgent._webphone.userAgent.invite).toHaveBeenCalledWith(
        phoneNumber,
        { homeCountryId: '1' },
      );
    });

    it('Should call the invite function of WebPhone with homeCountryId param when UserAgent makeCall [JPT-972]', async () => {
      setupMakeCall();
      const options: RTCCallOptions = { homeCountryId: '100' };
      userAgent.makeCall(phoneNumber, options);
      expect(userAgent._webphone.userAgent.invite).toHaveBeenCalledWith(
        phoneNumber,
        { homeCountryId: '100' },
      );
    });

    it('Should call the invite function of WebPhone with homeCountryId param when UserAgent makeCall [JPT-974]', async () => {
      setupMakeCall();
      const options: RTCCallOptions = { fromNumber: '100' };
      userAgent.makeCall(phoneNumber, options);
      expect(userAgent._webphone.userAgent.invite).toHaveBeenCalledWith(
        phoneNumber,
        { fromNumber: '100', homeCountryId: '1' },
      );
    });
  });
});
