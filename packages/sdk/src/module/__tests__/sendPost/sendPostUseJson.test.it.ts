/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:25:48
 * Copyright © RingCentral. All rights reserved.
 */
import { GroupService } from 'sdk/module/group';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { itForSdk } from 'shield/sdk';
import { PostService } from 'sdk/module/post';
import { StateService } from 'sdk/module/state';
import { Post } from 'sdk/module/post/entity';
import { IGlipPostPost } from 'shield/sdk/mocks/server/glip/api/post/post.post.contract';
import { createErrorResponse, readJson } from 'shield/sdk/utils';
import { createResponse } from 'shield/sdk/mocks/server/utils';
jest.setTimeout(30 * 1000);
itForSdk('Send post test', ({ helper, sdk, userContext, template }) => {
  let groupService: GroupService;
  let postService: PostService;
  let stateService: StateService;

  const glipData = helper.useInitialData(template.BASIC);
  const team1 = helper
    .glipDataHelper()
    .team.createTeam('Test Team with thomas', [123], { post_cursor: 0 });
  glipData.teams.push(team1);
  beforeAll(async () => {
    await sdk.setup();
    groupService = ServiceLoader.getInstance(ServiceConfig.GROUP_SERVICE);
    postService = ServiceLoader.getInstance(ServiceConfig.POST_SERVICE);
    stateService = ServiceLoader.getInstance(ServiceConfig.STATE_SERVICE);
  });

  afterAll(async () => {
    // await sdk.cleanUp();
  });

  describe('PostService', () => {
    beforeEach(() => {
      helper.clearMocks()
    });
    it('send post 1: success', async () => {
      const mockInfo = helper.mockResponse(
        readJson<IGlipPostPost>(require('./data/SEND_POST.SUCCESS.json')),
        data => {
          // modify the response
          data.request.data!.group_id = team1._id;
          data.response.data.group_id = team1._id;
          data.response.data._id = helper.glipDataHelper().post.factory.build()._id;
          return {
            text: data.request.data!.text!,
            id: data.response.data._id,
          };
        },
      );
      await postService.sendPost({
        text: mockInfo.text,
        groupId: team1._id,
      });
      const result = await postService.getPostsByGroupId({
        groupId: team1._id,
      });
      expect(result.posts.length).toEqual(1);
      expect(result.posts[0].id).toEqual(mockInfo.id);
      expect(result.posts[0].text).toEqual(mockInfo.text);
    });
    let sendFailedPost: Post;
    it('send post 2: failed', async () => {
      helper.mockResponse(
        createErrorResponse<IGlipPostPost>(
          {
            host: 'glip',
            method: 'post',
            path: '/api/post',
          },
          { status: 400 },
        ),
      );
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
      expect(result.posts.length).toEqual(2);
      expect(sendFailedPost.id < 0).toBeTruthy();
    });
    it('resend post successfully', async () => {
      helper.mockResponse(
        readJson<IGlipPostPost>(require('./data/SEND_POST.SUCCESS.json')),
        data => {
          data.response.data.group_id = team1._id;
          data.response.data.text = 'test post 2';
          data.response.data._id = helper.glipDataHelper().post.factory.build()._id;
        },
        (request, requestResponse) => {
          return createResponse({
            ...requestResponse.response,
            data: {...requestResponse.response.data, unique_id: request.data.unique_id}
          })
        }
      );
      await postService.reSendPost(sendFailedPost.id);
      const result = await postService.getPostsByGroupId({
        groupId: team1._id,
      });

      expect(result.posts.length).toEqual(2);
      expect(result.posts[1].text).toEqual(sendFailedPost.text);
      expect(result.posts[1].id > 0).toBeTruthy();
    });
  });
});
