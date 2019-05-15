/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-03-06 19:56:02
 * Copyright © RingCentral. All rights reserved.
 */

import ItemModel from '../Item';

describe('ItemModel', () => {
  describe('newItem', () => {
    const itemModel = ItemModel.fromJS({
      type_id: 1,
      modified_at: 1000,
      creator_id: 1000,
      name: '1',
      at_mentioning_post_ids: 1,
      versions: [],
    } as any);
    expect(itemModel.typeId).toBe(1);
    expect(itemModel.modifiedAt).toBe(1000);
    expect(itemModel.creatorId).toBe(1000);
    expect(itemModel.name).toBe('1');
    expect(itemModel.atMentionPostIds).toBe(1);
    expect(itemModel.versions).toEqual([]);
  });
  describe('hasVersions()', () => {
    it('should return true if has versions', () => {
      const itemModel = ItemModel.fromJS({
        versions: [{}],
      });
      expect(itemModel.hasVersions()).toBeTruthy();
    });
  });
  describe('newestCreatorId()', () => {
    it('should return newestCreatorId if creator_id exist', () => {
      const itemModel = ItemModel.fromJS({
        versions: [
          {
            creator_id: 1,
          },
        ],
      } as any);
      expect(itemModel.newestCreatorId).toEqual(1);
    });

    it('should return null if creator_id not exist', () => {
      const itemModel = ItemModel.fromJS({
        versions: [{}],
      } as any);
      expect(itemModel.newestCreatorId).toBeNull();
    });

    it('should return null if versions not exist', () => {
      const itemModel = ItemModel.fromJS({} as any);
      expect(itemModel.newestCreatorId).toBeNull();
    });
  });
});
