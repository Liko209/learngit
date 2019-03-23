export type UploadConsumerConfig = {
  enabled: boolean;
  memoryCountThreshold: number;
  memorySizeThreshold: number;
  uploadQueueLimit: number;
  autoFlushTimeCycle: number;
  combineSizeThreshold: number;
};

type onAccessibleChange = (accessible: boolean) => void;
export interface IAccessor {
  isAccessible(): boolean;
  subscribe(onChange: onAccessibleChange): void;
}

// export type UploadConsumerConfig = {
//   consumer: {
//     enabled: boolean;
//     memoryCountThreshold: number;
//     memorySizeThreshold: number;
//     uploadQueueLimit: number;
//     autoFlushTimeCycle: number;
//     combineSizeThreshold: number;
//   };
//   // logUploader: ILogUploader | null;
//   // persistence: ILogPersistence | null;
//   // uploadAccessor: IAccessor | null;
// };
