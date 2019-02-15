/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-08 15:16:53
 * Copyright © RingCentral. All rights reserved.
 */

import SendPostControllerHelper from '../SendPostControllerHelper';
const helper = new SendPostControllerHelper();
describe('PostActionControllerHelper', () => {
  describe('buildLinksInfo', () => {
    it('should return empty when text does not match url', () => {
      const result = helper.buildLinksInfo('123');
      expect(result.length).toBe(0);
    });
    it('should return empty when text matches url', () => {
      let result = helper.buildLinksInfo('www.google.com');
      expect(result.length).toBe(1);

      result = helper.buildLinksInfo('aa www.google.com aa');
      expect(result.length).toBe(1);
    });
  });
  describe('buildRawPostInfo', () => {
    it('should return a correct raw post info ', () => {
      const params = {
        userId: 3,
        groupId: 2,
        companyId: 1,
        text: 'good',
        parentId: 1,
        mentionNonItemIds: [1],
        mentionItemIds: [3],
        annotation: {
          xPercent: 19,
          yPercent: 18,
          storedFileVersion: 99999999999,
          annoId: '1-1-3',
          page: 1,
        },
      };
      const result = helper.buildRawPostInfo(params);
      expect(result['deactivated']).toBe(false);
      expect(result['is_new']).toBe(true);
      expect(result['text']).toEqual('good');
      expect(result['links']).toEqual([]);
      expect(result['at_mention_non_item_ids']).toEqual(
        params.mentionNonItemIds,
      );
      expect(result['at_mention_item_ids']).toEqual(params.mentionItemIds);
      expect(result['annotation']).toEqual({
        x_percent: params.annotation.xPercent,
        y_percent: params.annotation.yPercent,
        stored_file_version: params.annotation.storedFileVersion,
        anno_id: params.annotation.annoId,
        page: params.annotation.page,
      });
      expect(result['parent_id']).toEqual(params.parentId);
    });
    it('should not build activity_data for post if there is not activity [FIJI-2740]', async () => {
      const ret = helper.buildRawPostInfo({
        userId: 3,
        groupId: 2,
        companyId: 1,
        text: 'FIJI-2740',
      });
      expect(ret.text).toEqual('FIJI-2740');
      expect(ret['activity_data']).toBe(undefined);
    });
  });
});
