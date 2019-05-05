/*
 * @Author: Paynter Chen
 * @Date: 2019-05-04 17:12:00
 * Copyright © RingCentral. All rights reserved.
 */
import { IZipItemProvider, ZipItem } from './types';
import { LogEntity } from 'foundation';
import JSZip from 'jszip';
import { init } from 'filestack-js';
import { Nullable } from 'sdk/types';

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

interface IZipProducer {
  produce(): Nullable<LocalZip>;
}

const FILE_STACK_API_KEY = 'AMQqm7fiSTkC6TGrB15Yhz';
const CONSUME_COUNT_LIMIT = 1;

class ZipConsumer {
  count: number = 0;
  uploadClient: ReturnType<typeof init> = init(FILE_STACK_API_KEY);
  uploadMap: Map<number, LocalZip> = new Map();
  constructor(
    public zipProducer: IZipProducer,
    public onUploaded: (result: UploadedZip) => void,
  ) {}

  async consume(zip?: LocalZip) {
    if (this.count >= CONSUME_COUNT_LIMIT) return;
    this.count += 1;
    const localZip = zip || this.zipProducer.produce();
    if (localZip) {
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
        },         2000);
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

export class ZipLogZipItemProvider implements IZipItemProvider, IZipProducer {
  zips: LocalZip[] = [];
  index: number = 0;
  uploaded: UploadedZip[] = [];
  zipConsumer: ZipConsumer;

  constructor() {
    this.zipConsumer = new ZipConsumer(this, result => {
      this.uploaded.push(result);
    });
  }

  getZipItems = async () => {
    const zipItems: ZipItem[] = [
      ...this.zipConsumer.getUploading(),
      ...this.zips,
    ].map(zip => {
      return {
        type: '.zip',
        // name: `zip-${zip.index}`,
        name: zip.name,
        folder: 'zip',
        content: zip.blob,
      };
    });
    const uploadedContent = this.uploaded
      .map(item => {
        return `index: ${item.index}\nfileId: ${item.fileId}\nurl: ${item.url}`;
      })
      .join('\n');
    uploadedContent &&
      zipItems.push({
        type: '.txt',
        name: 'UploadedZip',
        folder: 'zip',
        content: uploadedContent,
      });
    return zipItems;
  }

  produce() {
    return this.zips.shift() || null;
  }

  addZip = async (logs: LogEntity[]) => {
    const index = this.index;
    this.index += 1;
    const zipName = `RC_LOG_${logs[0].sessionId}_${index}`;
    const logContent = logs
      .map(log => {
        return log.message;
      })
      .join('\n');
    // webworker
    const zip = new JSZip();
    zip.file(`RecentLogs-${index}.txt`, logContent);
    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 9,
      },
    });
    this.zips.push({
      index,
      name: zipName,
      blob: zipBlob,
    });
    if (this.zips.length > 5) {
      this.zips.shift();
    }
    this.zipConsumer.consume();
  }
}
