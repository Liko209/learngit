/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-05-04 16:33:01
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../__tests__/types.d.ts" />
import { daoManager, AccountDao, PostDao } from '../../../dao';
import PostServiceHandler from '../postServiceHandler';
import { randomInt, versionHash } from '../../../utils/mathUtils';
import { postFactory } from '../../../__tests__/factories';
import { POST_STATUS } from '../../constants';

jest.mock('../../../dao');
jest.mock('../../../utils/mathUtils');

const mockPostDao = new PostDao(null);
daoManager.getDao.mockReturnValue(mockPostDao);
const mockAccountDao = new AccountDao(null);
daoManager.getKVDao.mockReturnValue(mockAccountDao);
describe('PostServiceHandler', () => {
  describe('buildAtMentionsPeopleInfo()', () => {
    it('atMentions = true', () => {
      const ret = PostServiceHandler.buildAtMentionsPeopleInfo({
        atMentions: true,
        text: '@[display (xxx)]:1:',
        users: [
          {
            display: 'display (xxx)',
            id: 1,
          },
        ],
      });
      expect(ret).toEqual({
        text:
          "<a class='at_mention_compose' rel='{\"id\":1}'>@display (xxx)</a>",
        at_mention_non_item_ids: [1],
      });
    });
    it('atMentions = false', () => {
      const ret = PostServiceHandler.buildAtMentionsPeopleInfo({
        atMentions: false,
        text: 'text',
      });
      expect(ret).toEqual({
        text: 'text',
        at_mention_non_item_ids: [],
      });
    });
  });

  describe('buildPostInfo()', () => {
    beforeEach(() => {
      versionHash.mockReturnValue('versionHash');
      randomInt.mockReturnValue(1000);
    });
    const expectData = (hasItemIds: boolean) => ({
      id: 'versionHash',
      created_at: 123123,
      modified_at: 123123,
      creator_id: 123,
      version: 'versionHash',
      new_version: 'versionHash',
      is_new: true,
      model_size: 0,
      text: 'text',
      group_id: 123,
      from_group_id: 123,
      item_ids: hasItemIds ? [1, 2] : [],
      post_ids: [],
      at_mention_item_ids: [],
      at_mention_non_item_ids: [1],
      links: [],
      company_id: 123,
      deactivated: false,
      status: 2,
      activity_data: {},
    });
    beforeEach(() => {
      Date.now = jest.fn().mockReturnValue(123123);
    });

    it('params has itemsIds', () => {
      mockAccountDao.get.mockReturnValue(123);
      const ret = PostServiceHandler.buildPostInfo({
        atMentions: true,
        text: 'text',
        groupId: 123,
        itemIds: [1, 2],
        users: [
          {
            display: 'display',
            id: 1,
          },
        ],
      });
      expect(ret).toEqual(expectData(true));
    });
    it('params not itemsIds', () => {
      const retNotItemsIds = PostServiceHandler.buildPostInfo({
        atMentions: true,
        text: 'text',
        groupId: 123,
        users: [
          {
            display: 'display',
            id: 1,
          },
        ],
      });
      expect(retNotItemsIds).toMatchObject(expectData(false));
    });
  });

  describe('buildModifiedPostInfo()', () => {
    it('has oldpost & has users', async () => {
      mockPostDao.get.mockReturnValue({
        id: 1,
        text: 'old text',
      });
      const ret = await PostServiceHandler.buildModifiedPostInfo({
        postId: 1,
        text: 'new text',
        atMentions: true,
        users: [
          {
            display: 'display',
            id: 1,
          },
        ],
      });
      expect(ret).toEqual({
        _id: 1,
        text: 'new text',
        new_version: 'versionHash',
        is_new: false,
        at_mention_non_item_ids: [1],
      });
    });

    it('has oldpost & not users', async () => {
      mockPostDao.get.mockReturnValue({
        id: 1,
      });
      const ret = await PostServiceHandler.buildModifiedPostInfo({
        postId: 1,
        text: 'text',
        atMentions: true,
      });

      expect(ret).toEqual({
        _id: 1,
        new_version: 'versionHash',
        is_new: false,
        text: 'text',
      });
    });
    it('not oldPost', async () => {
      mockPostDao.get.mockReturnValue(null);
      const ret = await PostServiceHandler.buildModifiedPostInfo({
        postId: 1,
        text: 'text',
      });
      expect(ret).toBeNull();
    });

    it('should throw error when postId is not given', async () => {
      expect.assertions(1);
      try {
        await PostServiceHandler.buildModifiedPostInfo({
          text: 'text',
          atMentions: true,
          users: [
            {
              dispaly: 'dispaly',
              id: 1,
            },
          ],
        });
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      }
    });
  });

  describe('buildResendPost', () => {
    it('buildResendPost', () => {
      let model = postFactory.build({
        created_at: 0,
        version: 0,
      });

      model = PostServiceHandler.buildResendPostInfo(model);
      expect(model.status).toBe(POST_STATUS.INPROGRESS);
    });
  });
});
