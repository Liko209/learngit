/*
 * @Author: Paynter Chen
 * @Date: 2019-08-09 14:13:39
 * Copyright © RingCentral. All rights reserved.
 */
import { workerClientAdapter } from 'foundation/utils/workerAdapter';
import { createWorker } from './utils';
import { ZipItem, IZip } from './types';

export class Zip implements IZip {
  zipWorker: IZip;

  async ensureZipWorker() {
    if (!this.zipWorker) {
      this.zipWorker = workerClientAdapter(
        createWorker(await import('./zip.worker')),
      );
    }
  }

  zip = async (zipItems: ZipItem[]) => {
    await this.ensureZipWorker();
    return this.zipWorker.zip(zipItems);
  };
}
