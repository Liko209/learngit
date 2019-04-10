import {
  IFlag,
  IFeatureConfig,
  BETA_FEATURE,
  IAccountInfo,
  PERMISSION,
  IFlagCalculator,
  Middleware,
  Next,
} from './interface';
import { AccountUserConfig } from '../../module/account/config';

class FlagCalculator implements IFlagCalculator {
  featureConfig: IFeatureConfig;
  _flags: IFlag | {};
  _permissionKeys: string[];
  constructor(featureConfig: IFeatureConfig) {
    this.featureConfig = featureConfig;
    this._flags = {};
    this._permissionKeys = Object.values(PERMISSION);
  }
  get accountInfo(): IAccountInfo {
    const userConfig = new AccountUserConfig();
    const companyId: number = userConfig.getCurrentCompanyId();
    const userId: number = userConfig.getGlipUserId();
    return { companyId, userId };
  }

  isFeatureEnabled(flags: IFlag, feature: BETA_FEATURE) {
    const flagsToCheck = this.featureConfig[feature] as string[];
    if (!flagsToCheck) {
      return false;
    }
    const permissionFlags = flagsToCheck.filter(flag =>
      this._permissionKeys.includes(flag),
    );
    const _hasPermission = permissionFlags.reduce(
      (prev: boolean, curr: string) => prev && this.getFlagValue(flags, curr),
      true,
    );
    // without permission
    if (!_hasPermission) {
      return false;
    }
    let isInBeta = true;
    // if need to check with beta flag
    if (permissionFlags.length !== flagsToCheck.length) {
      isInBeta = flagsToCheck.reduce<boolean>(
        (prev: boolean, curr: string) => prev || this.getFlagValue(flags, curr),
        false,
      );
    }
    return isInBeta && _hasPermission;
  }

  getFlagValue(flags: IFlag, flagName: string): boolean {
    this._flags = flags;
    return !!this._pipeLiner(
      props => true,
      this._checkFeatureStatus.bind(this),
      this._isInBetaDomainList.bind(this),
      this._isInBetaEmailList.bind(this),
      this._hasPermission.bind(this),
    )(flagName);
  }

  private _pipeLiner(...middleWares: Middleware[]) {
    return middleWares.reduce((pre, curr) => (flagName: string) =>
      curr(flagName, pre),
    );
  }

  private _checkFeatureStatus(statusName: string, next: Next) {
    if (this._flags.hasOwnProperty(statusName)) {
      return this._flags[statusName];
    }
    return next(statusName);
  }

  private _isInBetaEmailList(flagName: string, next: Next): boolean {
    if (/email/gi.test(flagName)) {
      const list = this._flags[flagName];
      const { userId } = this.accountInfo;
      return this._isInList(list, userId);
    }
    return next(flagName);
  }

  private _isInBetaDomainList(flagName: string, next: Next): boolean {
    if (/domain/gi.test(flagName)) {
      const list = this._flags[flagName];
      const { userId } = this.accountInfo;
      return this._isInList(list, userId);
    }
    return next(flagName);
  }

  private _isInList(listStr: string, valToCheck: number) {
    if (listStr && valToCheck) {
      const list: number[] = listStr.split(',').map(Number);
      return list.includes(valToCheck);
    }
    return false;
  }
  private _hasPermission(permissionName: string, next: Next): boolean {
    if (this._permissionKeys.includes(permissionName)) {
      return !!this._flags[permissionName];
    }
    return next(permissionName);
  }
}

export default FlagCalculator;
