/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-25 09:10:00
 * Copyright © RingCentral. All rights reserved.
 */
import { RTCSipUserAgent } from '../RTCSipUserAgent';
import { ProvisionDataOptions, UA_EVENT } from '../../signaling/types';
import { RTCCallOptions } from '../../api/types';
import { EventEmitter2 } from 'eventemitter2';
import { opusModifier } from './../../utils/utils';

class MockUserAgent extends EventEmitter2 {
  public transport: any;
  public configuration: any;
  constructor(provisionData: any, mockOptions: any) {
    super();
    this.transport = new EventEmitter2();
    this.transport.disconnect = jest.fn();
    this.transport.isSipErrorCode = jest
      .fn()
      .mockImplementation((message: string) => {
        return false;
      });
    let modifiers: any = [];
    if (mockOptions && mockOptions.modifiers) {
      modifiers = mockOptions.modifiers;
    }
    this.configuration = {
      sessionDescriptionHandlerFactoryOptions: { modifiers },
    };
  }
  invite = jest.fn();
}
class MockWebPhone {
  constructor(provisionData: any, mockOptions: any) {
    this.userAgent = new MockUserAgent(provisionData, mockOptions);
    this.Options = mockOptions;
  }
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
    this._userAgent.on(UA_EVENT.SWITCH_BACK_PROXY, () => {
      this.switchBackProxy();
    });
  }
  registerSuccess = jest.fn();
  registerFailed = jest.fn();
  switchBackProxy = jest.fn();
}

jest.mock('ringcentral-web-phone', () => {
  return {
    default: (provisionData: any, mockOptions: any) => {
      return new MockWebPhone(provisionData, mockOptions);
    },
  };
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

  it('should emit registerFailed event with cause and response when webphone tells register is failed. [JPT-600]', () => {
    const userAgent = new RTCSipUserAgent();
    userAgent._createWebPhone(provisionData, options);
    const eventReceiver = new MockEventReceiver(userAgent);
    userAgent._webphone.userAgent.emit(
      'registrationFailed',
      { data: '500' },
      500,
    );
    expect(eventReceiver.registerFailed).toBeCalledWith({ data: '500' }, 500);
  });

  it('should emit switchBackProxy when webphone notify switchBackProxy in [1, 3] min. [JPT-2305]', () => {
    jest.useFakeTimers();
    const userAgent = new RTCSipUserAgent();
    userAgent._createWebPhone(provisionData, options);
    const eventReceiver = new MockEventReceiver(userAgent);
    userAgent._webphone.userAgent.transport.emit('switchBackProxy');
    jest.advanceTimersByTime(3 * 60 * 1000);
    expect(eventReceiver.switchBackProxy).toBeCalled();
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

    it('Should add one opusModifier into the webphone if there is no any opusModifier', () => {
      const userAgent = new RTCSipUserAgent();
      userAgent._createWebPhone(provisionData, options);
      expect(
        userAgent._webphone.userAgent.configuration.sessionDescriptionHandlerFactoryOptions.modifiers.find(
          opusModifier,
        ),
      ).not.toBeNull();
    });

    it('Should not add another opusModifier into the webphone if there is an existing one', () => {
      const userAgent = new RTCSipUserAgent();
      options.modifiers = [opusModifier];
      userAgent._createWebPhone(provisionData, options);
      let count = 0;
      userAgent._webphone.userAgent.configuration.sessionDescriptionHandlerFactoryOptions.modifiers.forEach(
        (element: any) => {
          if (element == opusModifier) {
            count++;
          }
        },
      );
      expect(count).toBe(1);
    });

    it('Should Enable Hold/Resume on FireFox', () => {
      const userAgent = new RTCSipUserAgent();
      options.enableMidLinesInSDP = true;
      userAgent._createWebPhone(provisionData, options);
      expect(userAgent._webphone.Options.enableMidLinesInSDP).toBe(true);
    });

    it('Should Disable Hold/Resume on FireFox', () => {
      const userAgent = new RTCSipUserAgent();
      options.enableMidLinesInSDP = false;
      userAgent._createWebPhone(provisionData, options);
      expect(userAgent._webphone.Options.enableMidLinesInSDP).toBe(false);
    });
  });
});
