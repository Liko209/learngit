import ConfigChangeNotifier from '../configChangeNotifier';
import FeatureFlag from '../FeatureFlag';
import FlagCalculator from '../FlagCalculator';
import { BETA_FEATURE, IFlag } from '../interface';
import { ServiceLoader } from '../../../module/serviceLoader';
import { RCInfoApi } from '../../../api/ringcentral';

jest.mock('../FlagCalculator');
jest.mock('../configChangeNotifier');

describe('FeatureFlag', () => {
  let featureFlag: FeatureFlag;
  let mockedNotifier: ConfigChangeNotifier;
  let mockedCalc: FlagCalculator;
  let oldFlags: IFlag;
  const mockRCInfoService = {
    getRCExtensionInfo: jest.fn(),
  };
  beforeEach(() => {
    oldFlags = { log: 'false', phone: '2,3,4' };
    jest
      .spyOn(window.localStorage, 'getItem')
      .mockReturnValue(JSON.stringify(oldFlags));
    mockedNotifier = new ConfigChangeNotifier();
    mockedCalc = new FlagCalculator(oldFlags);
    featureFlag = new FeatureFlag(mockedNotifier, mockedCalc);
    ServiceLoader.getInstance = jest.fn().mockReturnValue(mockRCInfoService);
  });

  it('isFeatureEnabled called once', () => {
    featureFlag.isFeatureEnabled(BETA_FEATURE.LOG);
    expect(mockedCalc.isFeatureEnabled).toHaveBeenCalledWith(
      oldFlags,
      BETA_FEATURE.LOG,
    );
  });

  it('getFlagValue called once', () => {
    featureFlag.getFlagValue('beta_log');
    expect(mockedCalc.getFlagValue).toHaveBeenCalledWith(oldFlags, 'beta_log');
  });
  it('handleData called once', () => {
    const newer_config = { log: 'true', sms: 'true', phone: '1,2,3' };
    featureFlag.handleData(newer_config);
    expect(mockedNotifier.broadcast).toHaveBeenCalledWith({
      log: 'true',
      sms: 'true',
      phone: '1,2,3',
    });
  });

  it('should save index config to db', () => {
    const indexData = { log: 'true' };
    localStorage.setItem = jest.fn();
    featureFlag.handleData(indexData);
    expect(localStorage.setItem).toBeCalledWith(
      'Client_Config',
      JSON.stringify(indexData),
    );
  });

  it('get flag value', () => {
    featureFlag.getFlagValue('log');
    expect(mockedCalc.getFlagValue).toHaveBeenCalledTimes(1);
  });

  describe('getServicePermission()', () => {
    it('should get correct permission when dao has extension info', async () => {
      mockRCInfoService.getRCExtensionInfo.mockReturnValue({
        serviceFeatures: [
          { featureName: 'log', enabled: true },
          { featureName: 'call', enabled: false },
        ],
      });
      RCInfoApi.requestRCExtensionInfo = jest.fn();
      featureFlag.handleData = jest.fn();
      await featureFlag.getServicePermission();
      expect(RCInfoApi.requestRCExtensionInfo).toBeCalledTimes(0);
      expect(featureFlag.handleData).toBeCalledWith(
        { log: true, call: false },
        'RC_PERMISSION',
      );
    });

    it('should get correct permission when dao does not have extension info', async () => {
      mockRCInfoService.getRCExtensionInfo.mockReturnValue(undefined);
      RCInfoApi.requestRCExtensionInfo = jest.fn().mockReturnValue({
        serviceFeatures: [],
      });
      featureFlag.handleData = jest.fn();
      await featureFlag.getServicePermission();
      expect(RCInfoApi.requestRCExtensionInfo).toBeCalledTimes(1);
      expect(featureFlag.handleData).toBeCalledWith({}, 'RC_PERMISSION');
    });
  });
});
