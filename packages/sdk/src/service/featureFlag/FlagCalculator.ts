import {
  Flag,
  FeatureConfig,
  BETA_FEATURE,
  AccountInfo,
  FLAG_PREFIX,
  FlagStrategies,
  Permission,
} from './utils';

class FlagCalculator implements FlagCalculator {
  featureConfig: FeatureConfig;
  accountInfo: AccountInfo;
  strategies: FlagStrategies;
  _flags: Flag | {};
  _permissionKeys: string[];
  constructor(featureConfig: FeatureConfig, accountInfo: AccountInfo) {
    this.accountInfo = accountInfo;
    this.featureConfig = featureConfig;
    this.strategies = {
      [FLAG_PREFIX.STATUS]: this._checkFeatureStatus,
      [FLAG_PREFIX.EMAIL]: this._isInBetaEmailList,
      [FLAG_PREFIX.DOMAIN]: this._isInBetaDomainList,
    };
    this._flags = {};
    this._permissionKeys = Object.values(Permission);
  }

  isFeatureEnabled(flags: Flag, feature: BETA_FEATURE) {
    const flagsToCheck = this.featureConfig[feature];
    if (!flagsToCheck) {
      return false;
    }
    const permissionFlags = flagsToCheck
      .filter((flag: string) => this._permissionKeys.includes(flag));
    const hasPermission = permissionFlags.reduce(
      (prev: boolean, curr: string) => prev && this.getFlagValue(flags, curr),
      true,
    );
    // without permission
    if (!hasPermission) {
      return false;
    }
    let isInBeta = true;
    // if need to check with beta flag
    if (permissionFlags.length !== flagsToCheck.length) {
      isInBeta = flagsToCheck
        .reduce((prev: boolean, curr: string) => prev || this.getFlagValue(flags, curr), false);
    }
    return isInBeta && hasPermission;
  }

  getFlagValue(flags: Flag, flagName: string) {
    this._flags = flags;
    if (this._permissionKeys.includes(flagName)) {
      return !!this._flags[flagName];
    }
    for (const strategy in Object.keys(this.strategies)) {
      if (flagName.startsWith(strategy)) {
        return !!this.strategies[strategy].call(this, flagName.split(`${strategy}.`)[1]);
      }
    }
    return !!this._isInBetaList(flagName);
  }
  private _checkFeatureStatus(statusName: string) {
    return this._flags[statusName];
  }
  private _isInBetaEmailList(flagName: string): boolean {
    const list = this._flags[flagName];
    const { userId } = this.accountInfo;
    return this._isInList(list, userId);
  }

  private _isInBetaDomainList(flagName: string): boolean {
    const list = this._flags[flagName];
    const { companyId } = this.accountInfo;
    return this._isInList(list, companyId);
  }

  private _isInBetaList(flagName: string): boolean {
    return this._isInBetaEmailList(`${flagName}_emails`)
      || this._isInBetaDomainList(`${flagName}_domains`);
  }

  private _isInList(listStr: string, valToCheck: number) {
    if (listStr && valToCheck) {
      const list: number[] = listStr.split(',').map(Number);
      return list.includes(valToCheck);
    }
    return false;
  }
}
export default FlagCalculator;
