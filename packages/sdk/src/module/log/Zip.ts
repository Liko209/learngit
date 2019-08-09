// import ZipWorker, { IZip } from './zip.worker';
import { workerClientAdapter } from './workerAdapter';
import { createWorker } from './utils';
import { ZipItem, IZip } from './types';

export class Zip implements IZip {
  zipWorker: IZip;

  zip = async (zipItems: ZipItem[]) => {
    if (!this.zipWorker) {
      this.zipWorker = workerClientAdapter(
        createWorker((await import('./zip.worker')).default),
      );
    }
    return this.zipWorker.zip(zipItems);
  };
}
