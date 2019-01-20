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
    const file = (await this._sourceController.get(itemId)) as FileItem;
    let url = '';
    do {
      if (!file) {
        break;
      }

      if (!FileItemUtils.isSupportPreview(file)) {
        break;
      }

      if (FileItemUtils.isFromGiphy(file)) {
        url = this._replaceHostWithProxy(FileItemUtils.getDownloadUrl(file));
        break;
      }

      if (!FileItemUtils.isImageResizable(file)) {
        url = this._replaceHostWithProxy(FileItemUtils.getUrl(file));
        break;
      }

      const storageId = FileItemUtils.getStorageId(file);
      if (storageId === 0) {
        break;
      }

      const autoDao = daoManager.getKVDao(AuthDao);
      const glipAccessToken = autoDao.get(AUTH_GLIP_TOKEN);
      if (!glipAccessToken) {
        break;
      }

      const cacheServer = Api.httpConfig['glip'].cacheServer;
      if (!cacheServer) {
        break;
      }

      url = `${cacheServer}/modify-image?size=${width}x${height}&id=${storageId}&source_type=files&source_id=${
        file.id
      }&t=${glipAccessToken}`;
    } while (false);

    return url;
  }

  private _replaceHostWithProxy(url: string) {
    return url.replace('s3.amazonaws.com', 's3-accelerate.amazonaws.com');
  }
}

export { FileActionController };
