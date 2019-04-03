/*
 * @Author: Paynter Chen
 * @Date: 2019-03-24 11:06:23
 * Copyright © RingCentral. All rights reserved.
 */
export type LogConsumerConfig = {
  uploadEnabled: boolean;
  memoryCountThreshold: number;
  memorySizeThreshold: number;
  uploadQueueLimit: number;
  autoFlushTimeCycle: number;
  combineSizeThreshold: number;
  persistentLimit: number;
  memoryCacheSizeThreshold: number;
};

type onAccessibleChange = (accessible: boolean) => void;
export interface IAccessor {
  isAccessible(): boolean;
  subscribe(onChange: onAccessibleChange): void;
}
