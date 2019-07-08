import { GroupService } from 'sdk/module/group';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { itForSdk } from 'shield/sdk/SdkItFramework';
import { PostService } from 'sdk/module/post';
import { createResponse } from 'shield/sdk/mocks/server/utils';
import { StateService } from 'sdk/module/state';
import { Post } from 'sdk/module/post/entity';

// todo
itForSdk(
  'Send post test',
  ({ server, data, sdk, mockJsonResponse: mockResponse }) => {
    let groupService: GroupService;
    let postService: PostService;
    let stateService: StateService;
    // read from json
    // const glipData = data.useInitialData(require('./SEND_POST_INIT.json'));
    const glipData = data.useInitialData(data.template.BASIC);
    // const
    const team1 = data.helper().team.createTeam('Test Team with thomas', [123]);
    glipData.teams.push(team1);
    data.apply();
    mockResponse(require('./SEND_POST.SUCCESS.json'));

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
      it('send post 1: success', async () => {
        // mock reponse
        await postService.sendPost({
          text: 'test post 1',
          groupId: team1._id,
        });
        server.glip.socketServer.emit('message', 'post');
        const result = await postService.getPostsByGroupId({
          groupId: team1._id,
        });
        const groupConfig = await stateService.getById(team1._id);
        expect(result.posts.length).toEqual(1);
        expect(result.posts[0].text).toEqual('test post 1');
        expect(groupConfig!.group_post_cursor).toEqual(1);
      });
    });
  },
);
