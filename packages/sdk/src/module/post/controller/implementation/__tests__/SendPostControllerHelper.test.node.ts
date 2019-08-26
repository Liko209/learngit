/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-08 15:16:53
 * Copyright © RingCentral. All rights reserved.
 */

import SendPostControllerHelper from '../SendPostControllerHelper';
import { versionHash } from '../../../../../utils/mathUtils';
import { GlipTypeUtil } from '../../../../../utils';

jest.mock('../../../../../utils/mathUtils');
jest.mock('../../../../../utils');

describe('PostActionControllerHelper', () => {
  let helper: SendPostControllerHelper;
  beforeEach(() => {
    versionHash.mockReturnValueOnce('10');
    GlipTypeUtil.generatePseudoIdByType.mockReturnValueOnce(4);
    helper = new SendPostControllerHelper();
  });
  describe('buildLinksInfo', () => {
    it.each`
      text                              | expectLength
      ${'123'}                          | ${0}
      ${'user@g.com'}                   | ${0}
      ${'user @g.com'}                  | ${1}
      ${'user @ g.com'}                 | ${1}
      ${'user@ g.com'}                  | ${1}
      ${'aa www.g.com aa'}              | ${1}
      ${'www.g.com'}                    | ${1}
      ${'www.g.com and g.cn '}          | ${2}
      ${'www.g.com and g.cn and c.cn '} | ${3}
    `('should return count of url , $text', ({ text, expectLength }) => {
      const result = helper.buildLinksInfo(text);
      expect(result.length).toBe(expectLength);
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
      const result = helper.buildRawPostInfo(params, {
        uniqueIds: [],
        ids: [],
      });
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
      expect(result['source']).toEqual('Jupiter');
    });
    it('should not build activity_data for post if there is not activity [FIJI-2740]', async () => {
      const ret = helper.buildRawPostInfo(
        {
          userId: 3,
          groupId: 2,
          companyId: 1,
          text: 'FIJI-2740',
        },
        { uniqueIds: [], ids: [] },
      );
      expect(ret.text).toEqual('FIJI-2740');
      expect(ret['activity_data']).toBe(undefined);
    });
    it('should get unique version and pseudo id', async () => {
      jest.clearAllMocks();
      jest.resetAllMocks();
      versionHash.mockReturnValueOnce('10');
      GlipTypeUtil.generatePseudoIdByType.mockReturnValueOnce(4);
      versionHash.mockReturnValueOnce(11);
      GlipTypeUtil.generatePseudoIdByType(8);
      helper.buildRawPostInfo(
        {
          userId: 3,
          groupId: 2,
          companyId: 1,
          text: 'FIJI-2740',
        },
        { uniqueIds: ['10'], ids: [4] },
      );
      expect(versionHash).toHaveBeenCalledTimes(2);
      expect(GlipTypeUtil.generatePseudoIdByType).toHaveBeenCalledTimes(2);
    });
  });
  describe('buildShareItemPost()', () => {
    it('should build share item post correctly', async () => {
      GlipTypeUtil.isExpectedType.mockReturnValue(false);
      const result = await helper.buildShareItemPost(
        {
          fromPost: {
            company_id: 1,
            group_id: 2,
            item_data: {
              version_map: {
                3: {},
              },
            },
          } as any,
          itemIds: [2],
          targetGroupId: 123,
        },
        jest.fn(),
      );
      expect(result).toEqual(
        expect.objectContaining({
          is_new: true,
          source: 'Jupiter',
          group_id: 123,
          from_company_id: 1,
          from_group_id: 2,
          links: [],
          item_ids: [2],
          item_data: {
            version_map: {
              3: {},
            },
          },
        }),
      );
    });
    it('should build share item post correctly when contain links', async () => {
      GlipTypeUtil.isExpectedType.mockReturnValue(true);
      // itemService.getById.mockResolvedValue({
      //   url: 'testUrl',
      // });
      // const ss = ServiceLoader.getInstance<ItemService>(
      //   ServiceConfig.ITEM_SERVICE,
      // );
      // console.log('323', ServiceLoader.getInstance());
      // console.log('444', ServiceLoader);
      const result = await helper.buildShareItemPost(
        {
          fromPost: {
            company_id: 1,
            group_id: 2,
            item_data: {
              version_map: {
                3: {},
              },
            },
          } as any,
          itemIds: [2],
          targetGroupId: 123,
        },
        jest.fn().mockResolvedValue({
          url: 'testUrl',
        }),
      );
      expect(result).toEqual(
        expect.objectContaining({
          is_new: true,
          source: 'Jupiter',
          group_id: 123,
          from_company_id: 1,
          from_group_id: 2,
          links: [
            {
              url: 'testUrl',
              source: 'streamPostLink',
              history: [{ url: 'testUrl' }],
              do_not_render: false,
            },
          ],
          item_ids: [],
          item_data: {
            version_map: {
              3: {},
            },
          },
        }),
      );
    });
  });
});
