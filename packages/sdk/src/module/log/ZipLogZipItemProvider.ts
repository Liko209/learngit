/*
 * @Author: Paynter Chen
 * @Date: 2019-05-04 17:12:00
 * Copyright © RingCentral. All rights reserved.
 */
import {
  IZipItemProvider,
  ZipItem,
  LocalZip,
  UploadedZip,
  IZipProducer,
  ZipItemLevel,
  IZip,
} from './types';
import { LogEntity, SessionManager } from 'foundation/log';
import { ZipConsumer } from './ZipConsumer';
import { Zip } from './Zip';

const DEFAULT_LIMIT = 5;

export class ZipLogZipItemProvider implements IZipItemProvider, IZipProducer {
  level: ZipItemLevel = ZipItemLevel.NORMAL;
  zips: LocalZip[] = [];
  index: number = 0;
  uploaded: UploadedZip[] = [];
  zipConsumer: ZipConsumer;
  worker: IZip = new Zip();
  limit: number = DEFAULT_LIMIT;

  constructor() {
    this.zipConsumer = new ZipConsumer(this, result => {
      this.uploaded.push(result);
    });
  }

  getZipItems = async () => {
    const zipItems: ZipItem[] = [
      ...this.zipConsumer.getUploading(),
      ...this.zips,
    ].map(zip => ({
      type: '.zip',
      name: zip.name,
      folder: 'zip',
      content: zip.blob,
    }));
    const uploadedContent = this.uploaded
      .map(
        item =>
          `index: ${item.index}\nfileId: ${item.fileId}\nurl: ${item.url}`,
      )
      .join('\n');
    uploadedContent &&
      zipItems.push({
        type: '.txt',
        name: 'UploadedZip',
        folder: 'zip',
        content: uploadedContent,
      });
    return zipItems;
  };

  produce() {
    return this.zips.shift() || null;
  }

  addZip = async (logs: LogEntity[]) => {
    const index = this.index;
    this.index += 1;
    const zipName = `RC_LOG_${SessionManager.getInstance().getSession()}_${index}`;
    const logContent = logs.map(log => log.message).join('\n');
    const zipItems: ZipItem[] = [
      {
        type: '.txt',
        name: `RecentLogs-${index}`,
        content: logContent,
      },
    ];

    const zipBlob = await this.worker.zip(zipItems);
    this.zips.push({
      index,
      name: zipName,
      blob: zipBlob,
    });
    if (this.zips.length > this.limit) {
      this.zips.shift();
    }
    this.zipConsumer.consume();
  };
}
