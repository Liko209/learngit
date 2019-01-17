import { LogEntity } from '../../types';
interface ILogApi {
  upload(logs: LogEntity[]): Promise<any>;
}

export {
  ILogApi,
};
