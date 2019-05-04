/*
 * @Author: Paynter Chen
 * @Date: 2019-03-24 11:06:23
 * Copyright © RingCentral. All rights reserved.
 */

type LogControlConfig = {
  uploadEnabled: boolean;
  memoryCountThreshold: number;
  memorySizeThreshold: number;
  uploadQueueLimit: number;
  autoFlushTimeCycle: number;
  combineSizeThreshold: number;
  persistentLimit: number;
  memoryCacheSizeThreshold: number;
};

type ZipItem = {
  type: '.txt' | '.zip';
  name: string;
  content: string | Blob;
  folder?: string;
};

interface IZipItemProvider {
  getZipItems(): Promise<ZipItem[]>;
}

export { IZipItemProvider, ZipItem, LogControlConfig };
