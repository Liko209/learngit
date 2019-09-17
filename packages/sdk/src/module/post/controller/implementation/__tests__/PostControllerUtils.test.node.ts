/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-17 16:52:19
 * Copyright © RingCentral. All rights reserved.
 */

import { PostControllerUtils } from '../PostControllerUtils';
import { Post } from '../../../entity/Post';
import { localPostJson4UnitTest } from './PostData';

describe('PostControllerUtils', () => {
  describe('isValidPost', () => {
    it('should return true if post has text', () => {
      expect(PostControllerUtils.isValidPost(localPostJson4UnitTest)).toBe(
        true,
      );
    });
    it('should return true if post has item_ids', () => {
      expect(
        PostControllerUtils.isValidPost({ text: '', item_ids: [1] } as Post),
      ).toBe(true);
    });
    it('should return false if post neither has text nor item_ids ', () => {
      expect(
        PostControllerUtils.isValidPost({ text: '', item_ids: [] } as Post),
      ).toBe(false);
      const result = !!PostControllerUtils.isValidPost(undefined);
      expect(result).toBe(false);
    });
  });

  describe('isSMSPost', () => {
    it.each`
      post                                     | res
      ${{ text: '123', is_sms: true }}         | ${true}
      ${{ text: '123', is_sms: false }}        | ${false}
      ${{ text: '123', item_ids: [106] }}      | ${true}
      ${{ text: '123', item_ids: [106, 107] }} | ${true}
      ${{ text: '123', item_ids: [107] }}      | ${false}
    `('should return $res when post is $post', ({ post, res }) => {
      const result = PostControllerUtils.isSMSPost(post as Post);
      expect(result).toEqual(res);
    });
  });
});
