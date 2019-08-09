/*
 * @Author: Paynter Chen
 * @Date: 2019-08-09 14:13:39
 * Copyright © RingCentral. All rights reserved.
 */
import { workerClientAdapter } from './workerAdapter';
import { createWorker } from './utils';
import { ZipItem, IZip } from './types';

export class Zip implements IZip {
  zipWorker: IZip;

  async getZipWorker() {
    if (!this.zipWorker) {
      this.zipWorker = workerClientAdapter(
        createWorker((await import('./zip.worker')).default),
      );
    }
    return this.zipWorker;
  }

  zip = async (zipItems: ZipItem[]) => {
    return (await this.getZipWorker()).zip(zipItems);
  };
}
