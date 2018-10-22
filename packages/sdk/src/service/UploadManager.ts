/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-04-09 15:46:40
 * Copyright © RingCentral. All rights reserved.
 */
import { EventEmitter2 } from 'eventemitter2';

/**
 * Class UploadManager
 * Conversation's files management
 */
export class UploadManager extends EventEmitter2 {
  constructor() {
    super({ wildcard: true });
  }
}

const uploadManager = new UploadManager();

export default uploadManager;
