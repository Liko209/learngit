import { GroupService } from 'sdk/module/group';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { SearchService } from 'sdk/module/search';
import { itForSdk } from 'shield/sdk/SdkItFramework';
import { PersonService } from 'sdk/module/person';
import { PostService } from 'sdk/module/post';
import { createResponse } from 'shield/sdk/mocks/server/utils';
import { debug } from 'sdk/__tests__/utils';
import { GroupConfigService } from 'sdk/module/groupConfig';
import { StateService } from '../state';
jest.setTimeout(30000);

itForSdk('Service Integration test', ({ server, data, sdk }) => {
  let groupService: GroupService;
  let personService: PersonService;
  let searchService: SearchService;
  let postService: PostService;
  let stateService: StateService;

  // const glipData = data.useInitialData(require('./test-demo-initial.json'));
  const glipData = data.useInitialData(data.template.BASIC);
  // data.helper().team.createTeam('Test Team with thomas', [123]),
  const team1 = data
    .helper()
    .team.createTeam('Test Team with thomas', [123], { post_cursor: 11 });
  glipData.teams.push(team1, ...data.helper().team.factory.buildList(2));
  glipData.groupState.push(
    data.helper().groupState.createGroupState(team1._id, { post_cursor: 8 }),
  );
  glipData.people.push(
    data.helper().person.build({ display_name: 'Special Name +86789' }),
  );
  data.apply();

  beforeAll(async () => {
    await sdk.setup();
    groupService = ServiceLoader.getInstance(ServiceConfig.GROUP_SERVICE);
    personService = ServiceLoader.getInstance(ServiceConfig.PERSON_SERVICE);
    searchService = ServiceLoader.getInstance(ServiceConfig.SEARCH_SERVICE);
    postService = ServiceLoader.getInstance(ServiceConfig.POST_SERVICE);
    stateService = ServiceLoader.getInstance(ServiceConfig.STATE_SERVICE);
  });
  afterAll(async () => {
    await sdk.cleanUp();
  });
  describe('GroupService', () => {
    it('search group', async () => {
      const searchResult = await groupService.doFuzzySearchALlGroups(
        'Test Team with thomas',
      );

      debug('searchGroupResult', searchResult);
      debug('all groups %O', await groupService.getEntities());

      // expect(searchResult.terms).toEqual(['test']);
      expect(searchResult.sortableModels.length).toEqual(1);
    });
  });
  describe('SearchService', () => {
    it('search person', async () => {
      const searchResult = await searchService.doFuzzySearchPersons({
        searchKey: 'Special Name +86789',
      });
      debug('searchPersonResult', searchResult);
      expect(searchResult.sortableModels.length).toEqual(1);
    });
  });
  describe('PostService', () => {
    const MOCK_POSTS = require('./posts.json');
    it('send post', async () => {
      await postService.sendPost({
        text: 'xx',
        groupId: team1._id,
      });
      const result = await postService.getPostsByGroupId({
        groupId: team1._id,
      });
      const newGroup = await groupService.getById(team1._id);
      const groupConfig = await stateService.getById(team1._id);
      expect(groupConfig!.group_post_cursor).toEqual(team1.post_cursor + 1);

      debug('post: %O', result);
      expect(result.posts.length).toEqual(1);
      expect(result.posts[0].text).toEqual('xx');
    });
    it('[getPosts]should mock api work', async () => {
      // should mock api work
      jest
        .spyOn(server.glip.api['/api/posts'], 'get')
        .mockImplementationOnce((request: any) => {
          return createResponse({
            data: { posts: MOCK_POSTS, items: [] },
          });
        });
      const result = await postService.getPostsByGroupId({ groupId: 43114502 });
      expect(result.posts).toEqual(MOCK_POSTS);
    });
  });
});
