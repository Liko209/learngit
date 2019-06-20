import { GroupService } from 'sdk/module/group';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { SearchService } from 'sdk/module/search';
import { itForSdk } from 'sdk/__tests__/SdkItFramework';
import { PersonService } from 'sdk/module/person';
import { PostService } from 'sdk/module/post';
import { createResponse } from 'sdk/__tests__/mockServer/utils';
import * as GlipData from 'sdk/__tests__/mockServer/glip/data/data';
jest.mock('sdk/utils/phoneParser');
jest.mock('sdk/framework/account/helper', () => {
  return {
    fetchWhiteList: jest.fn().mockReturnValue({}),
  };
});
jest.mock('foundation/src/network/client/http/Http');
jest.mock('foundation/src/network/client/socket/Socket');

itForSdk('Service Integration test', ({ server, data, sdk }) => {
  let groupService: GroupService;
  let personService: PersonService;
  let searchService: SearchService;
  let postService: PostService;

  const { groupDao } = server.glip;

  // use user
  data.useInitialData(require('./test-demo-initial.json'));
  // should be able to insert initial data here
  groupDao.create({
    ...GlipData.seeds.group('Test Group with thomas', 1),
    is_team: true,
  });

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
        'Test Group with thomas',
      );
      // const searchResult = await groupService.doFuzzySearchALlGroups('test');
      // console.log('TCL: searchResult', searchResult);

      // expect(searchResult.terms).toEqual(['test']);
      expect(searchResult.sortableModels.length).toEqual(1);
    });
  });
  describe('SearchService', () => {
    it('search person', async () => {
      const searchResult = await searchService.doFuzzySearchPersons({
        searchKey: 'thomas yang',
      });
      // console.log('TCL: searchResult', searchResult);
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
      console.log('TCL: post', result);
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
