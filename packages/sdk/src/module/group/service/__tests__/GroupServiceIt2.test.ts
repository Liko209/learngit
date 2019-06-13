import { GroupService } from '../GroupService';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { SearchService } from '../../../search';
import { itForSdk } from './SdkItFramework.test';

jest.mock('sdk/utils/phoneParser');
jest.mock('sdk/framework/account/helper', () => {
  return {
    fetchWhiteList: jest.fn().mockReturnValue({}),
  };
});
jest.mock('foundation/src/network/client/http/Http');
jest.mock('foundation/src/network/client/socket/Socket');
// import './SdkItFramework.test';
// jest.genMockFromModule()
itForSdk('GroupService It')(() => {
  describe('simple test', () => {
    it('search group', async () => {
      const groupService = ServiceLoader.getInstance<GroupService>(
        ServiceConfig.GROUP_SERVICE,
      );
      // const groups = await groupService.dao!.getAll();
      const searchResult = await groupService.doFuzzySearchALlGroups('u');

      expect(searchResult.terms).toEqual(['u']);
      expect(searchResult.sortableModels.length).toEqual(1);
    });
    it('search person', async () => {
      const service = ServiceLoader.getInstance<SearchService>(
        ServiceConfig.SEARCH_SERVICE,
      );
      const result = await service.doFuzzySearchPersons({
        searchKey: 'mia',
      });
      console.log('TCL: result', result);

      expect(1).toEqual(1);
    });
    // it('send post', async () => {
    //   const service = ServiceLoader.getInstance<PostService>(
    //     ServiceConfig.POST_SERVICE,
    //   );
    //   // const groups = await groupService.dao!.getAll();
    //   console.log(
    //     'TCL: sendPost',
    //     await service.sendPost({
    //       text: 'xx',
    //       groupId: 1,
    //     }),
    //   );
    // });
  });
});
// describe('GroupService', () => {
// });
