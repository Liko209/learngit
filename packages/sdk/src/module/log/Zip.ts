// import ZipWorker, { IZip } from './zip.worker';
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
