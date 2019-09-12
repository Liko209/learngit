/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-05-17 18:11:46
 * Copyright © RingCentral. All rights reserved.
 */
import ItemAPI from '../item';
import {
  GlipTypeUtil,
  TypeDictionary,
} from '../../../utils/glip-type-dictionary';
import {
  NETWORK_METHOD,
  NETWORK_VIA,
  TEN_MINUTE_TIMEOUT,
} from 'foundation/network';

jest.mock('../../api');

describe('ItemAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('sendFileItem()', () => {
    it('glipNetworkClient.post() should be called with specific path', () => {
      ItemAPI.sendFileItem({ file: {} });
      expect(ItemAPI.glipNetworkClient.post).toHaveBeenCalledWith({
        path: '/file',
        data: {
          file: {},
        },
      });
    });
  });
  describe('requestById()', () => {
    it('glipNetworkClient.get() should be called with specific path', () => {
      ItemAPI.requestById(9);
      expect(ItemAPI.glipNetworkClient.get).toHaveBeenCalledWith({
        path: '/task/9',
      });
    });

    it('glipNetworkClient.get() should be called with default path', () => {
      jest.spyOn(GlipTypeUtil, 'extractTypeId').mockReturnValue(-1);
      ItemAPI.requestById(9);
      expect(ItemAPI.glipNetworkClient.get).toHaveBeenCalledWith({
        path: '/item/9',
      });
    });

    it('glipNetworkClient.get() should be called with integration_item as path', () => {
      jest.spyOn(GlipTypeUtil, 'extractTypeId').mockReturnValue(100);
      TypeDictionary.TYPE_ID_CUSTOM_ITEM = 1;
      ItemAPI.requestById(9);
      expect(ItemAPI.glipNetworkClient.get).toHaveBeenCalledWith({
        path: '/integration_item/9',
      });
    });
  });
  describe('requestRightRailItems()', () => {
    it('glipNetworkClient.get() should be called with specific path', () => {
      (ItemAPI.glipNetworkClient.get as jest.Mock).mockClear();
      ItemAPI.requestRightRailItems(1);
      expect(ItemAPI.glipNetworkClient.get).toHaveBeenCalledWith({
        path: '/web_client_right_rail_items',
        params: { group_id: 1 },
      });
    });
  });

  describe('getNote()', () => {
    it('glipNetworkClient.get() should be called with specific path', () => {
      (ItemAPI.glipNetworkClient.get as jest.Mock).mockClear();
      ItemAPI.getNoteBody(1);
      expect(ItemAPI.glipNetworkClient.get).toHaveBeenCalledWith({
        path: '/pages_body/1',
      });
    });
  });

  describe('putItem', () => {
    it('should pass expected parameters to glipNetworkClient', () => {
      (ItemAPI.glipNetworkClient.put as jest.Mock).mockClear();
      const type = 'file';
      const id = 123;
      const data = { name: 'name1' };
      ItemAPI.putItem(id, type, data);
      expect(ItemAPI.glipNetworkClient.put).toHaveBeenCalledWith({
        data,
        path: `/${type}/${id}`,
      });
    });
  });

  describe('cancelUploadRequest', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    function setupCancelUploadRequest() {
      const mockUploadClient = {
        cancelRequest: jest.fn(),
      };
      ItemAPI.uploadNetworkClient = jest
        .fn()
        .mockReturnValueOnce(mockUploadClient);

      return { mockUploadClient };
    }

    it('should pass parameters to uploadNetworkClient ', () => {
      (ItemAPI.uploadNetworkClient.cancelRequest as jest.Mock).mockClear();

      const requestHolder = { request: { path: '123' } };
      ItemAPI.cancelUploadRequest(requestHolder);
      expect(ItemAPI.uploadNetworkClient.cancelRequest).toHaveBeenCalled();
    });

    it('should not pass parameters to uploadNetworkClient when input is invalid', () => {
      const { mockUploadClient } = setupCancelUploadRequest();

      const requestHolder: { request: undefined };
      ItemAPI.cancelUploadRequest(requestHolder);
      expect(mockUploadClient.cancelRequest).not.toHaveBeenCalled();
    });
  });

  describe('requestAmazonFilePolicy()', () => {
    it('should pass expected parameters to glipNetworkClient', () => {
      (ItemAPI.glipNetworkClient.post as jest.Mock).mockClear();
      const data = {
        size: 123123,
        filename: 'filenName',
        for_file_type: true,
        filetype: 'js',
      };
      ItemAPI.requestAmazonFilePolicy(data);
      expect(ItemAPI.glipNetworkClient.post).toHaveBeenCalledWith({
        data,
        path: '/s3/v1/post-policy',
      });
    });
  });

  describe('uploadFileToAmazonS3()', () => {
    it('should pass expected parameters to custom network client', () => {
      const params = {
        host: 'www.host.com',
        formFile: new FormData(),
        callback: (e: ProgressEvent) => { },
        requestHolder: { request: undefined },
      };
      const { host, formFile, callback, requestHolder } = params;
      const mockNetworkClient = {
        http: jest.fn(),
      };
      ItemAPI.customNetworkClient = jest
        .fn()
        .mockReturnValueOnce(mockNetworkClient);
      ItemAPI.uploadFileToAmazonS3(host, formFile, callback, requestHolder);
      expect(mockNetworkClient.http).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '',
          method: NETWORK_METHOD.POST,
          via: NETWORK_VIA.HTTP,
          data: formFile,
          requestConfig: expect.anything(),
          timeout: TEN_MINUTE_TIMEOUT,
        }),
        requestHolder,
      );
    });
  });

  describe('startRCConference', () => {
    it('should pass expected parameters to glipNetworkClient', () => {
      (ItemAPI.glipNetworkClient.post as jest.Mock).mockClear();

      const data = {
        email: "11@gmail.com",
        first_name: '',
        last_name: '',
        status: 'not_started',
        type_id: TypeDictionary.TYPE_ID_MEETING,
        group_ids: [2],
      }
      ItemAPI.startZoomMeeting(data);
      expect(ItemAPI.glipNetworkClient.post).toHaveBeenCalledWith({
        data,
        path: `/meeting`,
        via: NETWORK_VIA.SOCKET
      });
    });
  });
  describe('startZoomMeeting', () => {
    it('should pass expected parameters to glipNetworkClient', () => {
      (ItemAPI.glipNetworkClient.post as jest.Mock).mockClear();
      const data = { group_ids: [1], };
      ItemAPI.startRCConference(data);
      expect(ItemAPI.glipNetworkClient.post).toHaveBeenCalledWith({
        data,
        path: `/conference`,
        via: NETWORK_VIA.SOCKET
      });
    });
  })
});
