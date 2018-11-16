/*
 * @Author: steven.zhuang
 * @Date: 2018-11-13 20:39:34
 * Copyright © RingCentral. All rights reserved.
 */

import { SplitIOClient } from '../splitioClient';
import { SplitIOSdkClient } from '../__mocks__/splitioSdkClient';

const mockedUpdatedHandler = jest.fn(
  (identity: string, featureName: string, status: string) => {},
);

const sdkClient = new SplitIOSdkClient();
const mockedFactorySplitClient = jest.fn(
  (settings: SplitIO.IBrowserSettings) => {
    return sdkClient;
  },
);
SplitIOClient.prototype = {
  ...SplitIOClient.prototype,
  factorySplitClient: mockedFactorySplitClient,
};

describe('SplitIO client', async () => {
  const splictIO = new SplitIOClient(
    'auth',
    'test_id',
    { companyId: 123 },
    ['flagA'],
    mockedUpdatedHandler,
  );

  afterEach(() => {
    mockedUpdatedHandler.mockClear();
    mockedUpdatedHandler.mockClear();
  });

  it('instance', () => {
    expect(splictIO).toBeInstanceOf(SplitIOClient);
  });

  it('ready', () => {
    sdkClient.emit(sdkClient.Event.SDK_READY, {});
    expect(mockedUpdatedHandler).toBeCalledTimes(1);
  });

  it('update', () => {
    sdkClient.emit(sdkClient.Event.SDK_UPDATE, {});
    expect(mockedUpdatedHandler).toBeCalledTimes(1);
  });
});
