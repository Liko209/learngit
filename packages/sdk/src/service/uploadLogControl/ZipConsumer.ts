/*
 * @Author: Paynter Chen
 * @Date: 2019-05-05 18:18:06
 * Copyright © RingCentral. All rights reserved.
 */

import { init } from 'filestack-js';
import { LocalZip, UploadedZip, IZipProducer } from './types';
import { configManager } from './config';

const FILE_STACK_API_KEY = 'AMQqm7fiSTkC6TGrB15Yhz';
const CONSUME_COUNT_LIMIT = 1;
const RETRY_DELAY = 3000;

export class ZipConsumer {
  count: number = 0;
  uploadClient: ReturnType<typeof init> = init(FILE_STACK_API_KEY);
  uploadMap: Map<number, LocalZip> = new Map();
  constructor(
    public zipProducer: IZipProducer,
    public onUploaded: (result: UploadedZip) => void,
  ) {}

  async consume(zip?: LocalZip) {
    if (
      this.count >= CONSUME_COUNT_LIMIT ||
      !configManager.getConfig().zipLogAutoUpload
    ) {
      return;
    }
    const localZip = zip || this.zipProducer.produce();
    if (localZip) {
      this.count += 1;
      this.uploadMap.set(localZip.index, localZip);
      try {
        const result: {
          filename: string;
          handle: string;
          size: number;
          url: string;
        } = await this.uploadClient.upload(localZip.blob, undefined, {
          filename: `${localZip.name}.zip`,
        });
        this.uploadMap.delete(localZip.index);
        this.onUploaded({
          fileId: result.handle,
          index: localZip.index,
          url: result.url,
        });
        this.count -= 1;
        this.consume();
      } catch (error) {
        setTimeout(() => {
          this.count -= 1;
          this.consume(localZip);
        },         RETRY_DELAY);
      }
    }
  }

  getUploading() {
    const uploading: LocalZip[] = [];
    this.uploadMap.forEach(value => {
      uploading.push(value);
    });
    return uploading;
  }
}
