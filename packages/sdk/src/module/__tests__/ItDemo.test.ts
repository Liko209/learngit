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
  // beforeEach(() => {});
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
    });
  });
  describe('PostService', () => {
    const MOCK_POSTS = [
      {
        created_at: 1559963449975,
        creator_id: 187875331,
        version: 3026637464985615,
        model_size: 0,
        is_new: true,
        item_ids: [],
        post_ids: [],
        modified_at: 1559963449975,
        unique_id: '-1774460932',
        text: '测试',
        group_id: 43638790,
        at_mention_item_ids: [],
        at_mention_non_item_ids: [],
        company_id: 401409,
        deactivated: false,
        source: 'Jupiter',
        function_id: 'post',
        items: [],
        id: 2723848196,
      },
    ];
    it('getPosts', async () => {
      jest
        .spyOn(models.post, 'getPostsByGroupId')
        .mockImplementationOnce((id: number) => {
          console.log('TCL: getPostsByGroupId', id);
          return MOCK_POSTS;
        });
      const result = await postService.getPostsByGroupId({ groupId: 1 });
      expect(result.posts).toEqual(MOCK_POSTS);
    });
    it('send post', async () => {
      await postService.sendPost({
        text: 'xx',
        groupId: 1,
      });
      const posts = await postService.getPostsByGroupId({ groupId: 1 });
      console.log('TCL: post', posts);
      expect(posts.posts.findIndex(it => it.text === 'xx') > -1).toBeTruthy();
    });
  });
});
