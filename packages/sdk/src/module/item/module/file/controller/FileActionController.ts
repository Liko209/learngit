/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-16 15:05:16
 * Copyright © RingCentral. All rights reserved.
 */

import { IEntitySourceController } from '../../../../../framework/controller/interface/IEntitySourceController';
import { IPartialModifyController } from '../../../../../framework/controller/interface/IPartialModifyController';
import { Raw } from '../../../../../framework/model';
import { Item, ItemFile } from '../../../entity';
import { FileItemUtils } from '../utils';
import { Api } from '../../../../../api';
import { FileItem } from '../entity';
import { AccountService } from '../../../../account/service';
import { ServiceLoader, ServiceConfig } from '../../../../serviceLoader';

class FileActionController {
  constructor(
    private _partialModifyController: IPartialModifyController<Item>,
    private _sourceController: IEntitySourceController<Item>,
  ) {}

  async getThumbsUrlWithSize(itemId: number, width?: number, height?: number) {
    const file = (await this._sourceController.get(itemId)) as FileItem;
    let url = '';
    do {
      if (!file) {
        break;
      }

      if (FileItemUtils.isFromGiphy(file)) {
        url = this._replaceHostWithProxy(FileItemUtils.getDownloadUrl(file));
        break;
      }

      if (!FileItemUtils.isSupportPreview(file)) {
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
      const authConfig = ServiceLoader.getInstance<AccountService>(
        ServiceConfig.ACCOUNT_SERVICE,
      ).authUserConfig;
      const glipAccessToken = authConfig.getGlipToken();
      if (!glipAccessToken) {
        break;
      }

      const cacheServer = Api.httpConfig['glip'].cacheServer;
      if (!cacheServer) {
        break;
      }

      const querys: { key: string; value: string | undefined }[] = [
        {
          key: 'size',
          value: width && height ? `${width}x${height}` : undefined,
        },
        { key: 'id', value: storageId },
        { key: 'source_type', value: 'files' },
        { key: 'source_id', value: file.id },
        { key: 't', value: glipAccessToken },
      ];
      const queryString = querys
        .filter(({ value }) => value !== undefined)
        .map(({ key, value }) => `${key}=${value}`)
        .join('&');
      url = `${cacheServer}/modify-image?${queryString}`;
    } while (false);

    return url;
  }
  async editFileName(itemId: number, newName: string) {
    const preHandlePartial = (
      partialItem: Partial<Raw<ItemFile>>,
      originalItem: ItemFile,
    ): Partial<Raw<ItemFile>> => {
      return {
        ...partialItem,
        name: newName,
      };
    };

    await this._partialModifyController.updatePartially(
      itemId,
      preHandlePartial,
      async (newItem: ItemFile) => {
        const requestController = this._sourceController.getRequestController();
        return await requestController!.put(newItem);
      },
    );
  }

  private _replaceHostWithProxy(url: string) {
    return url.replace('s3.amazonaws.com', 's3-accelerate.amazonaws.com');
  }
}

export { FileActionController };
