import { LogEntity } from '../../types';
interface ILogUploader {
  upload(logs: LogEntity[]): Promise<void>;

  errorHandler(error: Error): 'ignore' | 'retry' | 'abort' | 'abortAll';
}

export { ILogUploader };
