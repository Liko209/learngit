/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-06-26 14:55:18
 * Copyright © RingCentral. All rights reserved.
 */
import { RecentCallsViewModel } from '../RecentCalls.ViewModel';
import * as RecentCallLogsHandlerModule from '../RecentCallLogsHandler';

jest.mock('../RecentCallLogsHandler');
let vm: RecentCallsViewModel;

const recentCallLogsHandler = {
  dispose: jest.fn(),
  init: jest.fn().mockResolvedValue(true),
  foc: jest.fn().mockReturnValue({}),
};

describe('RecentCallsViewModel', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest
      .spyOn(RecentCallLogsHandlerModule, 'RecentCallLogsHandler')
      .mockImplementation(() => recentCallLogsHandler);
  });

  it('dispose()', done => {
    recentCallLogsHandler.init.mockResolvedValue(true);
    vm = new RecentCallsViewModel();
    setTimeout(() => {
      vm.dispose();
      expect(recentCallLogsHandler.dispose).toHaveBeenCalled();
      done();
    });
  });
});
