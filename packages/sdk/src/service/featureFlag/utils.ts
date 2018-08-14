type Handler<T> = (data: T[]) => any;
type Flag = { [key: string]: string };

type FeatureConfig = { [key in BETA_FEATURE]?: string[] | Permission[] };
type FlagStrategies = { [key in FLAG_PREFIX]: (flag: string) => boolean };
interface Notifier<T> {
  subscribe: (handler: Handler<T>) => any;
  unsubscribe: (handler: Handler<T>) => any;
  broadcast: (data: T) => any;
}
interface AccountInfo {
  userId: number;
  companyId: number;
}
interface FlagCalculator {
  isFeatureEnabled: (feature: string) => boolean;
  getFlagValue: (flag: string) => boolean;
}

export enum BETA_FEATURE {
  LOG,
  SMS,
}
export enum FLAG_PREFIX {
  EMAIL,
  DOMAIN,
  STATUS,
}

export enum Permission {
  CALL = 'call',
}

export { Notifier, Flag, Handler, FeatureConfig, AccountInfo, FlagStrategies, FlagCalculator };
