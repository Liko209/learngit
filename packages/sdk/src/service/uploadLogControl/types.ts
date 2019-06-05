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
  zipLogAutoUpload: boolean;
};

type ZipItem = {
  type: '.txt' | '.zip';
  name: string;
  content: string | Blob;
  folder?: string;
};

enum ZipItemLevel {
  NORMAL,
  DEBUG_ALL,
}

interface IZipItemProvider {
  level: ZipItemLevel;
  getZipItems(): Promise<ZipItem[]>;
}

type LocalZip = {
  index: number;
  name: string;
  blob: Blob;
};

type UploadedZip = {
  index: number;
  fileId: string;
  url: string;
};

type Nullable<T> = T | null;

interface IZipProducer {
  produce(): Nullable<LocalZip>;
}

export {
  ZipItemLevel,
  IZipItemProvider,
  ZipItem,
  LogControlConfig,
  LocalZip,
  UploadedZip,
  IZipProducer,
};
