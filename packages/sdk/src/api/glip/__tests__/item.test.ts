/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-05-17 18:11:46
 * Copyright © RingCentral. All rights reserved.
 */
import ItemAPI from '../item';
import { GlipTypeUtil, TypeDictionary } from '../../../utils/glip-type-dictionary';

jest.mock('../../api');

describe('ItemAPI', () => {
  describe('sendFileItem()', () => {
    it('glipNetworkClient.post() should be called with specific path', () => {
      ItemAPI.sendFileItem({ file: {} });
      expect(ItemAPI.glipNetworkClient.post).toHaveBeenCalledWith('/file', { file: {} });
    });
  });
  describe('uploadFileItem()', () => {
    it('uploadNetworkClient.http() should be called with specific path', () => {
      ItemAPI.uploadFileItem(new FormData(), () => { });
      expect(ItemAPI.uploadNetworkClient.http).toHaveBeenCalled();
    });
  });
  describe('requestById()', () => {
    it('glipNetworkClient.get() should be called with specific path', () => {
      ItemAPI.requestById(9);
      expect(ItemAPI.glipNetworkClient.get).toHaveBeenCalledWith('/task/9');
    });

    it('glipNetworkClient.get() should be called with default path', () => {
      jest.spyOn(GlipTypeUtil, 'extractTypeId').mockReturnValue(-1);
      ItemAPI.requestById(9);
      expect(ItemAPI.glipNetworkClient.get).toHaveBeenCalledWith('/item/9');
    });

    it('glipNetworkClient.get() should be called with integration_item as path', () => {
      jest.spyOn(GlipTypeUtil, 'extractTypeId').mockReturnValue(100);
      TypeDictionary.TYPE_ID_CUSTOM_ITEM = 1;
      ItemAPI.requestById(9);
      expect(ItemAPI.glipNetworkClient.get).toHaveBeenCalledWith('/integration_item/9');
    });
  });
  describe('requestRightRailItems()', () => {
    it('glipNetworkClient.get() should be called with specific path', () => {
      (ItemAPI.glipNetworkClient.get as jest.Mock).mockClear();
      ItemAPI.requestRightRailItems(1);
      expect(ItemAPI.glipNetworkClient.get)
        .toHaveBeenCalledWith('/web_client_right_rail_items', { group_id: 1 });
    });
  });

  describe('getNote()', () => {
    it('glipNetworkClient.get() should be called with specific path', () => {
      (ItemAPI.glipNetworkClient.get as jest.Mock).mockClear();
      ItemAPI.getNote(1);
      expect(ItemAPI.glipNetworkClient.get).toHaveBeenCalledWith('/pages_body/1');
    });
  });
});
