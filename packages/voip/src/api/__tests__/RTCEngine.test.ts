import { RTCEngine } from '../RTCEngine';
import { RTCMediaDeviceManager } from '../RTCMediaDeviceManager';
import { kRTCProvisioningOptions } from '../../account/constants';
import _ from 'lodash';

describe('Engine', () => {
  describe('getInstance', () => {
    it('Should create instance', async () => {
      const engine = RTCEngine.getInstance();
      expect(engine).not.toBeNull();
    });

    it('Create account without listener', async () => {
      const account = RTCEngine.getInstance().createAccount(null);
      expect(account).not.toBeNull();
    });

    it('should read audio device when engine start. [JPT-1277]', async () => {
      RTCEngine.getInstance().destroy();
      jest.spyOn(RTCMediaDeviceManager.instance(), 'updateMediaDevices');
      const engine = RTCEngine.getInstance();
      expect(RTCMediaDeviceManager.instance().updateMediaDevices).toBeCalled();
    });

    it("should subscribe 'ondevicechange' when engine start. [JPT-1278]", async () => {
      RTCEngine.getInstance().destroy();
      jest.spyOn(RTCMediaDeviceManager.instance(), 'subscribeDeviceChange');
      const engine = RTCEngine.getInstance();
      expect(
        RTCMediaDeviceManager.instance().subscribeDeviceChange,
      ).toBeCalled();
    });

    it('should use customize user agent info when upper layer call setUserAgentInfo API. [JPT-1913]', async () => {
      RTCEngine.getInstance().destroy();
      RTCEngine.getInstance().setUserAgentInfo({
        endpointId: 'endpointId',
        userAgent: 'userAgent',
      });
      const account = RTCEngine.getInstance().createAccount(null);
      expect(account).not.toBeNull();
      jest
        .spyOn(account._regManager._userAgent, 'restartUA')
        .mockImplementation(() => {});
      account._regManager._restartUA(
        {
          device: {},
          sipInfo: [],
          sipFlags: {},
        },
        kRTCProvisioningOptions,
      );
      const expectedResult = _.cloneDeep(kRTCProvisioningOptions);
      expectedResult.uuid = 'endpointId';
      expectedResult.appName = 'userAgent';
      expect(account._regManager._userAgent.restartUA).toBeCalledWith(
        {
          device: {},
          sipInfo: [],
          sipFlags: {},
        },
        expectedResult,
      );
    });

    it("should use 'RingCentral Jupiter' as user agent when upper layer doesn't call setUserAgentInfo API. [JPT-1912]", async () => {
      RTCEngine.getInstance().destroy();
      const account = RTCEngine.getInstance().createAccount(null);
      expect(account).not.toBeNull();
      jest
        .spyOn(account._regManager._userAgent, 'restartUA')
        .mockImplementation(() => {});
      account._regManager._restartUA(
        {
          device: {},
          sipInfo: [],
          sipFlags: {},
        },
        kRTCProvisioningOptions,
      );
      expect(account._regManager._userAgent.restartUA).toBeCalledWith(
        {
          device: {},
          sipInfo: [],
          sipFlags: {},
        },
        kRTCProvisioningOptions,
      );
    });
  });
});
