import { GroupService } from 'sdk/module/group';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { SearchService } from 'sdk/module/search';
import { itForSdk } from 'sdk/__tests__/SdkItFramework';
import { PersonService } from 'sdk/module/person';
import { PostService } from 'sdk/module/post';
jest.mock('sdk/utils/phoneParser');
jest.mock('sdk/framework/account/helper', () => {
  return {
    fetchWhiteList: jest.fn().mockReturnValue({}),
  };
});
jest.mock('foundation/src/network/client/http/Http');
jest.mock('foundation/src/network/client/socket/Socket');

itForSdk('Service Integration test', ({ server, models }) => {
  let groupService: GroupService;
  let personService: PersonService;
  let searchService: SearchService;
  let postService: PostService;
  beforeAll(() => {
    groupService = ServiceLoader.getInstance(ServiceConfig.GROUP_SERVICE);
    personService = ServiceLoader.getInstance(ServiceConfig.PERSON_SERVICE);
    searchService = ServiceLoader.getInstance(ServiceConfig.SEARCH_SERVICE);
    postService = ServiceLoader.getInstance(ServiceConfig.POST_SERVICE);
  });
  describe('GroupService', () => {
    it('search group', async () => {
      const searchResult = await groupService.doFuzzySearchALlGroups('u');

      expect(searchResult.terms).toEqual(['u']);
      console.log('TCL: result', JSON.stringify(searchResult, null, 2));
      expect(searchResult.sortableModels.length).toEqual(1);
    });
  });
  describe('SearchService', () => {
    it('search person', async () => {
      const searchResult = await searchService.doFuzzySearchPersons({
        searchKey: 'Thomas',
      });
      console.log('TCL: result', JSON.stringify(searchResult, null, 2));
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
      // console.log('TCL: post', result);
      expect(result.posts.length).toEqual(1);
      expect(result.posts[0].text).toEqual('xx');
    });
    it('getPosts', async () => {
      jest
        .spyOn(models.post, 'getPostsByGroupId')
        .mockImplementationOnce((id: number) => {
          console.log('TCL: getPostsByGroupId', id);
          return MOCK_POSTS;
        });
      const result = await postService.getPostsByGroupId({ groupId: 43114502 });
      expect(result.posts).toEqual(MOCK_POSTS);
    });
  });
});
