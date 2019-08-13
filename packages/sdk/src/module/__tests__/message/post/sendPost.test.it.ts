/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:25:48
 * Copyright © RingCentral. All rights reserved.
 */
import { GroupService } from 'sdk/module/group';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { jit } from 'shield/sdk/SdkItFramework';
import { PostService } from 'sdk/module/post';
import { StateService } from 'sdk/module/state';
import { Post } from 'sdk/module/post/entity';
import { IGlipPostPost } from 'shield/sdk/mocks/glip/api/post/post.post.contract';
import { wait } from 'shield/utils/asyncTest';
import dataDispatcher from 'sdk/component/DataDispatcher';
import { SOCKET } from 'sdk/service/eventKey';

jit('Send post test', ({ helper, sdk, userContext, template }) => {
  let groupService: GroupService;
  let postService: PostService;
  let stateService: StateService;

  const glipInitialDataHelper = helper.useInitialData(template.BASIC);
  const team1 = helper
    .glipDataHelper()
    .team.createTeam('Test Team with thomas', [123], { post_cursor: 0 });
  glipInitialDataHelper.teams.insertOrUpdate(team1);
  const waitSocketIncoming = async (eventKey: string) => {
    await new Promise(resolve => {
      dataDispatcher.once(eventKey, async () => {
        resolve();
      });
    });
    await wait();
  };
  beforeAll(async () => {
    await sdk.setup('glip');
    groupService = ServiceLoader.getInstance(ServiceConfig.GROUP_SERVICE);
    postService = ServiceLoader.getInstance(ServiceConfig.POST_SERVICE);
    stateService = ServiceLoader.getInstance(ServiceConfig.STATE_SERVICE);
  });

  describe('PostService', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetModules();
      jest.restoreAllMocks();
    });
    it('send post 1: success', async () => {
      // jest.spyOn(postService, 'sendPost').mock
      await postService.sendPost({
        text: 'test post 1',
        groupId: team1._id,
      });
      const result = await postService.getPostsByGroupId({
        groupId: team1._id,
      });
      await waitSocketIncoming(SOCKET.GROUP);
      const groupConfig = await stateService.getById(team1._id);
      expect(result.posts.length).toEqual(1);
      expect(result.posts[0].id > 0).toBeTruthy();
      expect(result.posts[0].text).toEqual('test post 1');
      expect(groupConfig!.group_post_cursor).toEqual(1);
    });
    let sendFailedPost: Post;
    it('send post 2: failed', async () => {
      helper.mockApi(IGlipPostPost, {
        status: 401,
      });
      await expect(
        postService.sendPost({
          text: 'test post 2',
          groupId: team1._id,
        }),
      ).rejects.not.toBeUndefined();
      const result = await postService.getPostsByGroupId({
        groupId: team1._id,
      });
      sendFailedPost = result.posts[1];
      const groupConfig = await stateService.getById(team1._id);
      expect(result.posts.length).toEqual(2);
      expect(sendFailedPost.id < 0).toBeTruthy();
      expect(groupConfig!.group_post_cursor).toEqual(1);
    });
    it('resend post successfully', async () => {
      await postService.reSendPost(sendFailedPost.id);
      const result = await postService.getPostsByGroupId({
        groupId: team1._id,
      });

      await waitSocketIncoming(SOCKET.GROUP);
      expect(result.posts.length).toEqual(2);
      expect(result.posts[1].text).toEqual(sendFailedPost.text);
      expect(result.posts[1].id > 0).toBeTruthy();
    });
    it('send post 3', async () => {
      await postService.sendPost({
        text: 'test post 3',
        groupId: team1._id,
      });
      const result = await postService.getPostsByGroupId({
        groupId: team1._id,
      });
      await waitSocketIncoming(SOCKET.GROUP);
      const groupConfig = await stateService.getById(team1._id);
      expect(result.posts.length).toEqual(3);
      expect(result.posts[2].text).toEqual('test post 3');
      expect(groupConfig!.group_post_cursor).toEqual(3);
    });
    it('partialUpdateState', async () => {
      await stateService.updateReadStatus(team1._id, true, false);
      const groupConfig = await stateService.getById(team1._id);
      expect(groupConfig!.marked_as_unread).toBeTruthy();
    });
    it('create a new group then send post', async () => {
      const result = await groupService.getOrCreateGroupByMemberList([
        userContext.glipUserId(),
        667,
      ]);
      expect(result.id > 0).toBeTruthy();
      await postService.sendPost({
        text: 'haaaaaa',
        groupId: result.id,
      });
      await waitSocketIncoming(SOCKET.GROUP);
      expect(
        (await stateService.getById(result.id))!.group_post_cursor,
      ).toEqual(1);
    });
  });
});
