import { GroupService } from 'sdk/module/group';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { SearchService } from 'sdk/module/search';
import { itForSdk } from 'sdk/__tests__/SdkItFramework';
import { PersonService } from 'sdk/module/person';
import { PostService } from 'sdk/module/post';
import { createResponse } from 'sdk/__tests__/mockServer/utils';
import * as GlipData from 'sdk/__tests__/mockServer/glip/data/data';
import { debug } from 'sdk/__tests__/utils';

itForSdk('Service Integration test', ({ server, data, sdk }) => {
  let groupService: GroupService;
  let personService: PersonService;
  let searchService: SearchService;
  let postService: PostService;

  // const glipData = data.useInitialData(require('./test-demo-initial.json'));
  const glipData = data.useInitialData(data.template.BASIC);
  data.helper().team.createTeam('Test Team with thomas', [123]),
    glipData.teams.push(
      data.helper().team.createTeam('Test Team with thomas', [123]),
      ...data.helper().team.factory.buildList(2),
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
      // debug('all groups %O', await groupService.getEntities());

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
        groupId: 1,
      });
      const result = await postService.getPostsByGroupId({ groupId: 1 });
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
