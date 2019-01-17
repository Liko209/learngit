/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-16 15:05:16
 * Copyright © RingCentral. All rights reserved.
 */

import { IEntitySourceController } from '../../../../../framework/controller/interface/IEntitySourceController';
import { Item } from '../../../entity';
import { FileItemUtils } from '../utils';
import { daoManager, AuthDao } from '../../../../../dao';
import { AUTH_GLIP_TOKEN } from '../../../../../dao/auth/constants';
import { Api } from '../../../../../api';
import { FileItem } from '../entity';

class FileActionController {
  constructor(private _sourceController: IEntitySourceController<Item>) {}

  async getThumbsUrlWithSize(itemId: number, width: number, height: number) {
    const file = (await this._sourceController.getEntity(itemId)) as FileItem;
    if (!file) {
      return '';
    }

    if (FileItemUtils.isFromGiphy(file)) {
      return this._replaceHostWithProxy(FileItemUtils.getDownloadUrl(file));
    }

    const cacheServer = Api.httpConfig['glip'].cacheServer;
    if (
      !FileItemUtils.isImageItem(file) ||
      FileItemUtils.isGifItem(file) ||
      !cacheServer
    ) {
      return this._replaceHostWithProxy(FileItemUtils.getUrl(file));
    }

    const storageId = FileItemUtils.getStorageId(file);
    if (storageId === 0) {
      return '';
    }

    const autoDao = daoManager.getKVDao(AuthDao);
    const glipAccessToken = autoDao.get(AUTH_GLIP_TOKEN);
    if (!glipAccessToken) {
      return '';
    }

    return `${cacheServer}/modify-image?size=${width}x${height}&id=${storageId}&source_type=files&source_id=${
      file.id
    }&t=${glipAccessToken}`;
  }

  private _replaceHostWithProxy(url: string) {
    return url.replace('s3.amazonaws.com', 's3-accelerate.amazonaws.com');
  }
}

export { FileActionController };
