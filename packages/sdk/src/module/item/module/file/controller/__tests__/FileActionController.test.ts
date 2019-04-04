/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-17 21:34:25
 * Copyright © RingCentral. All rights reserved.
 */

import { Api } from '../../../../../../api';
import { FileActionController } from '../FileActionController';
import { GlobalConfigService } from '../../../../../config';
import { AuthUserConfig } from '../../../../../account/config';

jest.mock('../../../../../config');
jest.mock('../../../../../account/config');
GlobalConfigService.getInstance = jest.fn();

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
    get: jest.fn(),
  };
  const fileActionController = new FileActionController(entitySourceController);

  function setUp() {
    Object.defineProperty(Api, 'httpConfig', {
      get: () => {
        return {
          glip: { cacheServer: 'cacheServer.com' },
        };
      },
      configurable: true,
    });
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
        type: 'giphy',
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
      entitySourceController.get = jest.fn().mockResolvedValue(undefined);
      const res = await fileActionController.getThumbsUrlWithSize(11, 1, 2);
      expect(res).toBe('');
      expect(entitySourceController.get).toBeCalledWith(11);
    });

    it('should return download url when is from giphy', async () => {
      const { fileItemC } = setUpData();
      entitySourceController.get = jest.fn().mockResolvedValue(fileItemC);
      const res = await fileActionController.getThumbsUrlWithSize(11, 1, 2);
      expect(res).toBe(fileItemC.url);
      expect(entitySourceController.get).toBeCalledWith(11);
    });

    it('should return url when is from gif file', async () => {
      const { fileItemB } = setUpData();
      entitySourceController.get = jest.fn().mockResolvedValue(fileItemB);
      const res = await fileActionController.getThumbsUrlWithSize(11, 1, 2);
      expect(res).toBe(fileItemB.versions[0].url);
      expect(entitySourceController.get).toBeCalledWith(11);
    });

    it('should return empty when is not support preview', async () => {
      const { fileItemE } = setUpData();
      entitySourceController.get = jest.fn().mockResolvedValue(fileItemE);
      const res = await fileActionController.getThumbsUrlWithSize(11, 1, 2);
      expect(res).toBe('');
      expect(entitySourceController.get).toBeCalledWith(11);
    });

    it('should return empty when has no cache server', async () => {
      Object.defineProperty(Api, 'httpConfig', {
        get: () => {
          return { glip: { cacheServer: undefined } };
        },
        configurable: true,
      });

      const { fileItemE } = setUpData();
      entitySourceController.get = jest.fn().mockResolvedValue(fileItemE);
      const res = await fileActionController.getThumbsUrlWithSize(11, 1, 2);
      expect(res).toBe('');
      expect(entitySourceController.get).toBeCalledWith(11);
    });

    it('should return empty when has no store file id', async () => {
      const { fileItemD } = setUpData();
      entitySourceController.get = jest.fn().mockResolvedValue(fileItemD);
      const res = await fileActionController.getThumbsUrlWithSize(11, 1, 2);
      expect(res).toBe('');
      expect(entitySourceController.get).toBeCalledWith(11);
    });

    it('should return empty when has no auth token', async () => {
      const { fileItemA } = setUpData();
      entitySourceController.get = jest.fn().mockResolvedValue(fileItemA);

      const res = await fileActionController.getThumbsUrlWithSize(11, 1, 2);
      expect(res).toBe('');
      expect(entitySourceController.get).toBeCalledWith(11);
    });

    it('should return expected url', async () => {
      const { fileItemA } = setUpData();
      entitySourceController.get = jest.fn().mockResolvedValue(fileItemA);
      AuthUserConfig.prototype.getGlipToken = jest
        .fn()
        .mockReturnValue('token');
      const res = await fileActionController.getThumbsUrlWithSize(11, 1, 2);
      expect(res).toBe(
        'cacheServer.com/modify-image?size=1x2&id=852746252&source_type=files&source_id=10&t=token',
      );
      expect(entitySourceController.get).toBeCalledWith(11);
    });
    it('should return expected url', async () => {
      const { fileItemA } = setUpData();
      AuthUserConfig.prototype.getGlipToken = jest
        .fn()
        .mockReturnValue('token');
      entitySourceController.get = jest.fn().mockResolvedValue(fileItemA);
      const res = await fileActionController.getThumbsUrlWithSize(11);
      expect(res).toBe(
        'cacheServer.com/modify-image?id=852746252&source_type=files&source_id=10&t=token',
      );
      expect(entitySourceController.get).toBeCalledWith(11);
    });
  });
});
