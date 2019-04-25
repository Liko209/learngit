import { RTCEngine } from '../RTCEngine';
import { RTCMediaDeviceManager } from '../RTCMediaDeviceManager';

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
  });
});
