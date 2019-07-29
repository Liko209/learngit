/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-02-27 15:39:27
 * Copyright © RingCentral. All rights reserved.
 */

import storeManager, { ENTITY_NAME } from '@/store';
import { hasValidEntity } from '../entities';

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('entities', () => {
  const entityName = ENTITY_NAME.POST;
  function setUpData() {
    const validModels = [];
    for (let i = 1; i < 10; i++) {
      validModels.push({ id: i });
    }

    storeManager.dispatchUpdatedDataModels(entityName, validModels);

    const inValidModels = [];
    for (let i = 10; i < 20; i++) {
      inValidModels.push({ id: i, isMocked: true });
    }

    storeManager.dispatchUpdatedDataModels(entityName, inValidModels);
  }

  function setUp() {
    const store = storeManager.getEntityMapStore(entityName);
    storeManager.removeStore(store);
  }

  describe('hasValidEntity', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
      setUpData();
    });

    it('should return true when store has the entity', () => {
      expect(hasValidEntity(entityName, 1)).toBeTruthy();
    });

    it('should return false when store do not have the entity', () => {
      expect(hasValidEntity(entityName, 100)).toBeFalsy();
    });

    it('should return false when entity in store is mocked', () => {
      expect(hasValidEntity(entityName, 11)).toBeFalsy();
    });
  });
});
