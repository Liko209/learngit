type Handler<T> = (data: T[]) => any;
type IFlag = { [key: string]: string };

enum PERMISSION {
  CALL = 'call',
}

type IFeatureConfig = { [key in BETA_FEATURE]?: string[] | PERMISSION[] };
interface INotifier<T> {
  subscribe: (handler: Handler<T>) => any;
  unsubscribe: (handler: Handler<T>) => any;
  broadcast: (data: T) => any;
}
interface AccountInfo {
  userId: number;
  companyId: number;
}
interface IFlagCalculator {
  isFeatureEnabled: (flags: IFlag, feature: BETA_FEATURE) => boolean;
  getFlagValue: (flags: IFlag, flag: string) => boolean;
}

enum BETA_FEATURE {
  LOG,
  SMS,
}
enum FLAG_PREFIX {
  EMAIL,
  DOMAIN,
  STATUS,
}
type Middleware = (props: string, next?: Middleware) => boolean;
type Next = (props: string) => boolean;
export {
  INotifier,
  Next,
  IFlag,
  Handler,
  IFeatureConfig,
  AccountInfo,
  IFlagCalculator,
  BETA_FEATURE,
  FLAG_PREFIX,
  PERMISSION,
  Middleware,
};
