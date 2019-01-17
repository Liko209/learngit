/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-17 21:34:25
 * Copyright © RingCentral. All rights reserved.
 */

import { IEntitySourceController } from '../../../../../../framework/controller/interface/IEntitySourceController';
import { Item } from '../../../../entity';
import { FileItemUtils } from '../../utils';
import { daoManager, AuthDao } from '../../../../../../dao';
import { AUTH_GLIP_TOKEN } from '../../../../../../dao/auth/constants';
import { Api } from '../../../../../../api';
import { FileActionController } from '../FileActionController';
import { BaseSubItemService } from '../../../base/service';

jest.mock('../../../../../../dao');
jest.mock(
  '../../../../../../framework/controller/interface/IEntitySourceController',
);
jest.mock('../../../../../../api');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('FileActionController', () => {
  const entitySourceController = {
    getEntity: jest.fn(),
  };
  const fileActionController = new FileActionController(entitySourceController);
  const authDao = new AuthDao();

  function setUp() {
    Object.defineProperty(Api, 'httpConfig', {
      get: () => {
        return {
          glip: { cacheServer: 'cacheServer.com' },
        };
      },
      configurable: true,
    });
    daoManager.getKVDao = jest.fn().mockReturnValue(authDao);
    authDao.get = jest.fn().mockReturnValue('token');
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('getThumbsUrlWithSize', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    function setUpData() {
      const fileItemA = {
        id: 10,
        type: 'jpg',
        source: 'upload',
        versions: [
          {
            creator_id: 7307267,
            date: 1547729155396,
            download_url:
              'https://glipasialabnet-xmnup.s3-ap-southeast-nse-content-disposition=attachment',
            size: 613850,
            stored_file_id: 852746252,
            url: 'https://glipasialabnet-xmnup.s3-ap-sout',
          },
        ],
      };

      const fileItemB = {
        id: 10,
        type: 'gif',
        versions: [{ url: 'b.com' }],
      };

      const fileItemC = {
        id: 10,
        source: 'giphy',
        url: 'c.com',
        versions: [],
      };

      const fileItemD = {
        id: 10,
        type: 'jpg',
        source: 'upload',
        versions: [
          {
            creator_id: 7307267,
            date: 1547729155396,
            download_url:
              'https://glipasialabnet-xmnup.s3-ap-southeast-nse-content-disposition=attachment',
            size: 613850,
            url: 'https://glipasialabnet-xmnup.s3-ap-sout',
          },
        ],
      };

      const fileItemE = {
        id: 10,
        type: 'pppt',
        versions: [{ url: 'e.com' }],
      };

      return { fileItemA, fileItemB, fileItemC, fileItemD, fileItemE };
    }

    it('should return empty when can not get file item', async () => {
      entitySourceController.getEntity = jest.fn().mockResolvedValue(undefined);
      const res = await fileActionController.getThumbsUrlWithSize(11, 1, 2);
      expect(res).toBe('');
      expect(entitySourceController.getEntity).toBeCalledWith(11);
    });

    it('should return download url when is from giphy', async () => {
      const { fileItemC } = setUpData();
      entitySourceController.getEntity = jest.fn().mockResolvedValue(fileItemC);
      const res = await fileActionController.getThumbsUrlWithSize(11, 1, 2);
      expect(res).toBe(fileItemC.url);
      expect(entitySourceController.getEntity).toBeCalledWith(11);
    });

    it('should return url when is from gif file', async () => {
      const { fileItemB } = setUpData();
      entitySourceController.getEntity = jest.fn().mockResolvedValue(fileItemB);
      const res = await fileActionController.getThumbsUrlWithSize(11, 1, 2);
      expect(res).toBe(fileItemB.versions[0].url);
      expect(entitySourceController.getEntity).toBeCalledWith(11);
    });

    it('should return url when is not image', async () => {
      const { fileItemE } = setUpData();
      entitySourceController.getEntity = jest.fn().mockResolvedValue(fileItemE);
      const res = await fileActionController.getThumbsUrlWithSize(11, 1, 2);
      expect(res).toBe(fileItemE.versions[0].url);
      expect(entitySourceController.getEntity).toBeCalledWith(11);
    });

    it('should return url when has no cache server', async () => {
      Object.defineProperty(Api, 'httpConfig', {
        get: () => {
          return { glip: { cacheServer: undefined } };
        },
        configurable: true,
      });

      const { fileItemE } = setUpData();
      entitySourceController.getEntity = jest.fn().mockResolvedValue(fileItemE);
      const res = await fileActionController.getThumbsUrlWithSize(11, 1, 2);
      expect(res).toBe(fileItemE.versions[0].url);
      expect(entitySourceController.getEntity).toBeCalledWith(11);
    });

    it('should return empty when has no store file id', async () => {
      const { fileItemD } = setUpData();
      entitySourceController.getEntity = jest.fn().mockResolvedValue(fileItemD);
      const res = await fileActionController.getThumbsUrlWithSize(11, 1, 2);
      expect(res).toBe('');
      expect(entitySourceController.getEntity).toBeCalledWith(11);
    });

    it('should return empty when has no auth token', async () => {
      const { fileItemA } = setUpData();
      entitySourceController.getEntity = jest.fn().mockResolvedValue(fileItemA);
      authDao.get = jest.fn().mockReturnValue('');
      const res = await fileActionController.getThumbsUrlWithSize(11, 1, 2);
      expect(res).toBe('');
      expect(entitySourceController.getEntity).toBeCalledWith(11);
      expect(authDao.get).toBeCalledWith(AUTH_GLIP_TOKEN);
    });

    it('should return expected url', async () => {
      const { fileItemA } = setUpData();
      entitySourceController.getEntity = jest.fn().mockResolvedValue(fileItemA);
      const res = await fileActionController.getThumbsUrlWithSize(11, 1, 2);
      expect(res).toBe(
        'cacheServer.com/modify-image?size=1x2&id=852746252&source_type=files&source_id=10&t=token',
      );
      expect(entitySourceController.getEntity).toBeCalledWith(11);
      expect(authDao.get).toBeCalledWith(AUTH_GLIP_TOKEN);
    });
  });
});
