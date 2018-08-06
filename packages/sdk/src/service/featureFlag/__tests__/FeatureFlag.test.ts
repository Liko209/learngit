import ConfigChangeNotifier from '../configChangeNotifier';
import FeatureFlag from '../FeatureFlag';
import FlagCalculator from '../FlagCalculator';
import { BETA_FEATURE, Flag } from '../utils';
jest.mock('../FlagCalculator');
jest.mock('../configChangeNotifier');
describe('FeatureFlag', () => {
  let featureFlag: FeatureFlag;
  let mockedNotifier;
  let mockedCalc: FlagCalculator;
  let oldFlags: Flag;

  beforeEach(() => {
    oldFlags = { log: 'false', phone: '2,3,4' };
    jest.spyOn(window.localStorage, 'getItem').mockReturnValue(JSON.stringify(oldFlags));
    mockedNotifier = new ConfigChangeNotifier();
    mockedCalc = new FlagCalculator(oldFlags, { userId: 1, companyId: 1 });
    featureFlag = new FeatureFlag(mockedNotifier, mockedCalc);
  });

  it('isFeatureEnabled called once', () => {
    featureFlag.isFeatureEnabled(BETA_FEATURE.LOG);
    expect(mockedCalc.isFeatureEnabled).toHaveBeenCalledWith(oldFlags, BETA_FEATURE.LOG);
  });

  it('getFlagValue called once', () => {
    featureFlag.getFlagValue('beta_log');
    expect(mockedCalc.getFlagValue).toHaveBeenCalledWith(oldFlags, 'beta_log');
  });

  it('handleData called once', () => {
    const newer_config = { log: 'true', sms: 'true', phone: '1,2,3' };
    featureFlag.handleData(newer_config);

    expect(mockedNotifier.broadcast)
      .toHaveBeenCalledWith({
        log: 'true',
        sms: 'true',
        phone: '1,2,3',
      });
  });

  it('should save index config to db', () => {
    const indexData = { log: 'true' };
    localStorage.setItem = jest.fn();
    featureFlag.handleInitConfig(indexData);
    expect(localStorage.setItem).toBeCalledWith('Client_Config', JSON.stringify(indexData));
  });

  it('get flag value', () => {
    featureFlag.getFlagValue('log');
    expect(mockedCalc.getFlagValue).toHaveBeenCalledTimes(1);
  });
});
