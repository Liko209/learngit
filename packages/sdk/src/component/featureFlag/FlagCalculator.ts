import {
  IFlag,
  IFeatureConfig,
  BETA_FEATURE,
  AccountInfo,
  PERMISSION,
  IFlagCalculator,
  Middleware,
  Next,
} from './interface';

class FlagCalculator implements IFlagCalculator {
  featureConfig: IFeatureConfig;
  accountInfo: AccountInfo;
  _flags: IFlag | {};
  _permissionKeys: string[];
  constructor(featureConfig: IFeatureConfig, accountInfo: AccountInfo) {
    this.accountInfo = accountInfo;
    this.featureConfig = featureConfig;
    this._flags = {};
    this._permissionKeys = Object.values(PERMISSION);
  }

  isFeatureEnabled(flags: IFlag, feature: BETA_FEATURE) {
    const flagsToCheck = this.featureConfig[feature] as string[];
    if (!flagsToCheck) {
      return false;
    }
    const permissionFlags = flagsToCheck.filter(flag =>
      this._permissionKeys.includes(flag),
    );
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
      isInBeta = flagsToCheck.reduce<boolean>(
        (prev: boolean, curr: string) => prev || this.getFlagValue(flags, curr),
        false,
      );
    }
    return isInBeta && hasPermission;
  }

  getFlagValue(flags: IFlag, flagName: string): boolean {
    this._flags = flags;
    return this.pipeLiner(
      props => true,
      this.checkFeatureStatus.bind(this),
      this.isInBetaDomainList.bind(this),
      this.isInBetaEmailList.bind(this),
      this.hasPermission.bind(this),
    )(flagName);
  }

  private pipeLiner(...middleWares: Middleware[]) {
    return middleWares.reduce((pre, curr) => (flagName: string) =>
      curr(flagName, pre),
    );
  }

  private checkFeatureStatus(statusName: string, next: Next) {
    if (this._flags.hasOwnProperty(statusName)) {
      return this._flags[statusName];
    }
    return next(statusName);
  }

  private isInBetaEmailList(flagName: string, next: Next): boolean {
    if (/email/gi.test(flagName)) {
      const list = this._flags[flagName];
      const { userId } = this.accountInfo;
      return this.isInList(list, userId);
    }
    return next(flagName);
  }

  private isInBetaDomainList(flagName: string, next: Next): boolean {
    if (/domain/gi.test(flagName)) {
      const list = this._flags[flagName];
      const { userId } = this.accountInfo;
      return this.isInList(list, userId);
    }
    return next(flagName);
  }

  private isInList(listStr: string, valToCheck: number) {
    if (listStr && valToCheck) {
      const list: number[] = listStr.split(',').map(Number);
      return list.includes(valToCheck);
    }
    return false;
  }
  private hasPermission(permissionName: string, next: Next): boolean {
    if (this._permissionKeys.includes(permissionName)) {
      return !!this._flags[permissionName];
    }
    return next(permissionName);
  }
}

export default FlagCalculator;
