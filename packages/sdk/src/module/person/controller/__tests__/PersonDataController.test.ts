/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-01-23 13:23:00
 * Copyright © RingCentral. All rights reserved.
 */

import { transform, baseHandleData } from '../../../../service/utils';
import { PersonDataController } from '../PersonDataController';
import { rawPersonFactory } from '../../../../__tests__/factories';

jest.mock('../../../../service/notificationCenter');

jest.mock('../../../../dao', () => ({
  daoManager: {
    getDao: jest.fn(),
  },
}));

jest.mock('../../../../service/utils', () => ({
  transform: jest.fn(),
  baseHandleData: jest.fn(),
}));

describe('PersonDataController', () => {
  let personDataController: PersonDataController;

  function setUp() {
    personDataController = new PersonDataController();
  }

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    setUp();
  });

  it('empty array', async () => {
    await personDataController.handleIncomingData([]);
    expect(transform).toHaveBeenCalledTimes(0);
    expect(baseHandleData).not.toHaveBeenCalled();
  });

  it('pass params type error', async () => {
    await personDataController.handleIncomingData([
      rawPersonFactory.build({ _id: 1 }),
    ]);
    expect(transform).toHaveBeenCalledTimes(1);
    expect(baseHandleData).toHaveBeenCalled();
  });
});
