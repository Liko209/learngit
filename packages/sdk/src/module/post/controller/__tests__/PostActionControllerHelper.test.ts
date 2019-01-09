/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-08 15:16:53
 * Copyright © RingCentral. All rights reserved.
 */

import PostActionControllerHelper from '../PostActionControllerHelper';
import { localPostJson4UnitTest } from './PostData';
const helper = new PostActionControllerHelper();
describe('PostActionControllerHelper', () => {
  describe('buildAtMentionsPeopleInfo', () => {
    function buildParameter(atMentions: boolean, text: string, users: any[]) {
      return {
        atMentions,
        text,
        users,
        userId: 3,
        groupId: 2,
        companyId: 1,
      };
    }
    it('should return rendered text when atMentions = true', () => {
      const params = buildParameter(true, '@[Lip Wang]:2266292227:', [
        {
          display: 'Lip Wang',
          id: 2266292227,
        },
      ]);
      const result = helper.buildAtMentionsPeopleInfo(params);
      const renderedText =
        "<a class='at_mention_compose' rel='{\"id\":2266292227}'>@Lip Wang</a>";
      expect(result.text).toEqual(renderedText);
      expect(result.at_mention_non_item_ids).toEqual([2266292227]);
    });
    it('should return plain text when atMentions = false', () => {
      const params = buildParameter(false, 'awesome UT', []);
      const result = helper.buildAtMentionsPeopleInfo(params);
      expect(result).toEqual({
        text: 'awesome UT',
        at_mention_non_item_ids: [],
      });
    });
    it('should return back original text when atMentions = false even the text looks like at mention', () => {
      const params = buildParameter(false, '@[Lip Wang]:2266292227:', [
        {
          display: 'Lip Wang',
          id: 2266292227,
        },
      ]);
      const result = helper.buildAtMentionsPeopleInfo(params);
      const renderedText = '@[Lip Wang]:2266292227:';
      expect(result.text).toEqual(renderedText);
      expect(result.at_mention_non_item_ids).toEqual([]);
    });
    it('should not crash when users have invalid parameters', () => {
      const params = buildParameter(true, '@[Lip Wang]:2266292227:', [
        {
          display: 'Lip Wang',
          id: 2266292227,
        },
        {
          display: undefined,
          id: 111111111,
        },
      ]);
      const result = helper.buildAtMentionsPeopleInfo(params);
      const renderedText =
        "<a class='at_mention_compose' rel='{\"id\":2266292227}'>@Lip Wang</a>";
      expect(result.text).toEqual(renderedText);
      expect(result.at_mention_non_item_ids).toEqual([2266292227]);
    });
  });
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
      const params = { userId: 3, groupId: 2, companyId: 1, text: 'good' };
      const result = helper.buildRawPostInfo(params);
      expect(result['deactivated']).toBe(false);
      expect(result['is_new']).toBe(true);
      expect(result['text']).toEqual('good');
      expect(result['links']).toEqual([]);
    });
  });
  describe('buildModifiedPostInfo', () => {
    it('should return a correct modified post info', () => {
      const result = helper.buildModifiedPostInfo(
        { text: 'This is modified Post', groupId: 7848853506 },
        localPostJson4UnitTest,
      );
      expect(result.text).toEqual('This is modified Post');
      expect(result.is_new).toBeFalsy();
    });
  });
});
