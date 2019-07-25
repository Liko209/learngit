/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-15 14:27:28
 * Copyright © RingCentral. All rights reserved.
 */
import { SendPostType, EditPostType } from '../../types';

interface ISendPostController {
  sendPost(params: SendPostType): void;
  reSendPost(id: number): void;
  editFailedPost(params: EditPostType): Promise<void>;
}

export { ISendPostController };
