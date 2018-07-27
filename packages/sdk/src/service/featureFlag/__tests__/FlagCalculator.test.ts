import FlagCalculator from '../FlagCalculator';
import { FeatureConfig, BETA_FEATURE, FLAG_PREFIX, Permission } from '../utils';

describe('FlagCalculator', () => {
  describe('isFeatureEnabled', () => {
    let featureConfig: FeatureConfig = {};
    let calc;
    const accountInfo = {
      userId: 1,
      companyId: 1
    };
    let flags = {};
    describe('should return true if unset', () => {
      it('should return false if user has permission', () => {
        featureConfig = { [BETA_FEATURE.SMS]: [] };
        flags = {};
        calc = new FlagCalculator(featureConfig, accountInfo);
        expect(calc.isFeatureEnabled(flags, BETA_FEATURE.SMS)).toBe(true);
      });
    });
    describe('If beta_log is controlled by email beta flag', () => {
      it('when Flag has no prefix', () => {
        featureConfig = { [BETA_FEATURE.LOG]: ['beta_log'] };
        flags = { beta_log_emails: '1,' };
        calc = new FlagCalculator(featureConfig, accountInfo);
        expect(calc.isFeatureEnabled(flags, BETA_FEATURE.LOG)).toBe(true);
      });
      it('when Flag has prefix', () => {
        featureConfig = { [BETA_FEATURE.LOG]: [`${FLAG_PREFIX.EMAIL}.beta_log`] };
        flags = { beta_log: '1,' };
        calc = new FlagCalculator(featureConfig, accountInfo);
        expect(calc.isFeatureEnabled(flags, BETA_FEATURE.LOG)).toBe(true);
      });
    });

    describe('If beta_log is controlled by domain beta flag', () => {
      it('when Flag has no prefix', () => {
        featureConfig = { [BETA_FEATURE.LOG]: ['beta_log'] };
        flags = { beta_log_domains: '1,' };
        calc = new FlagCalculator(featureConfig, accountInfo);
        expect(calc.isFeatureEnabled(flags, BETA_FEATURE.LOG)).toBe(true);
      });
      it('when Flag has prefix', () => {
        featureConfig = { [BETA_FEATURE.LOG]: [`${FLAG_PREFIX.DOMAIN}.beta_log`] };
        flags = { beta_log: '1,' };
        calc = new FlagCalculator(featureConfig, accountInfo);
        expect(calc.isFeatureEnabled(flags, BETA_FEATURE.LOG)).toBe(true);
      });
    });

    describe('If beta_log is controlled by status beta flag', () => {
      it('should return True if call feature is on', () => {
        featureConfig = { [BETA_FEATURE.LOG]: [`${FLAG_PREFIX.STATUS}.beta_log`] };
        flags = { beta_log: 'true' };
        calc = new FlagCalculator(featureConfig, accountInfo);
        calc.isFeatureEnabled(flags, BETA_FEATURE.LOG);
        expect(calc.isFeatureEnabled(flags, BETA_FEATURE.LOG)).toBe(true);
      });
      it('should return False if call feature is off or null', () => {
        featureConfig = { [BETA_FEATURE.LOG]: [`${FLAG_PREFIX.STATUS}.beta_log`] };
        flags = {};
        calc = new FlagCalculator(featureConfig, accountInfo);
        expect(calc.isFeatureEnabled(flags, BETA_FEATURE.LOG)).toBe(false);
      });
    });

    describe('if SMS feature requires permission of call', () => {
      it('should return false if user has permission', () => {
        featureConfig = { [BETA_FEATURE.SMS]: [Permission.CALL] };
        flags = { call: 'true' };
        calc = new FlagCalculator(featureConfig, accountInfo);
        expect(calc.isFeatureEnabled(flags, BETA_FEATURE.SMS)).toBe(true);
      });
      it('should return true if user has no permission', () => {
        featureConfig = { [BETA_FEATURE.SMS]: [Permission.CALL] };
        flags = {};
        calc = new FlagCalculator(featureConfig, accountInfo);
        expect(calc.isFeatureEnabled(flags, BETA_FEATURE.SMS)).toBe(false);
      });
    });
  });
});
