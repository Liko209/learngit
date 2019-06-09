import { GroupService } from '../GroupService';
import { Sdk, sdk } from 'sdk/index';
import { AccountGlobalConfig } from 'sdk/module/account/config/AccountGlobalConfig';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { AccountService } from 'sdk/module/account';
import { notificationCenter } from 'sdk/service';
import { PostService } from 'sdk/module/post';
import { SearchService } from '../../../search';
jest.mock('sdk/utils/phoneParser');
jest.mock('sdk/framework/account/helper', () => {
  return {
    fetchWhiteList: jest.fn().mockReturnValue({}),
  };
});
jest.mock('foundation/src/network/client/http/Http');
jest.mock('foundation/src/network/client/socket/Socket');
// jest.genMockFromModule()
describe('GroupService', () => {
  function clearMocks() {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
  }

  async function initSdk() {
    await Sdk.init({});
  }

  async function login() {
    await ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).unifiedLogin({ code: 'mockCode', token: 'mockToken' });
  }

  async function initEnd() {
    return new Promise(resolve => {
      notificationCenter.once('---l---', () => resolve());
    });
  }

  async function setup() {
    const startTime = Date.now();
    console.log('-=======setup start', startTime);
    await initSdk();
    login();
    await initEnd();
    console.log('-=======end', Date.now(), 'cost:', Date.now() - startTime);
  }

  beforeAll(async () => {
    clearMocks();
    await setup();
  });
  afterAll(async () => {
    const startTime = Date.now();
    console.log('-=======afterAll start', startTime);
    await ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).logout();
    console.log(
      '-=======afterAll end',
      Date.now(),
      'cost:',
      Date.now() - startTime,
    );
  });
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
