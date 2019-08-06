/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-09 15:00:47
 * Copyright © RingCentral. All rights reserved.
 */
import { ProgressService } from '../../../progress';
import notificationCenter from '../../../../service/notificationCenter';
import {
  GlipTypeUtil,
  TypeDictionary,
} from '../../../../utils/glip-type-dictionary';
import { buildRequestController } from '../../../../framework/controller';
import { ItemActionController } from '../ItemActionController';
import { PartialModifyController } from '../../../../framework/controller/impl/PartialModifyController';
import { EntitySourceController } from '../../../../framework/controller/impl/EntitySourceController';
import { Item } from '../../entity';
import { RequestController } from '../../../../framework/controller/impl/RequestController';
import { ItemDao } from '../../dao';
import { daoManager } from '../../../../dao';
import { ServiceLoader } from '../../../serviceLoader';
import { PartialUpdateParams } from 'sdk/framework/controller/interface/IPartialModifyController';

jest.mock('../../../../dao');
jest.mock('../../dao');
jest.mock('../../../../api');
jest.mock('../../../../framework/controller');
jest.mock('../../../progress');
jest.mock('../../../../service/notificationCenter');
jest.mock('../../service/IItemService');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('ItemActionController', () => {
  const itemDao = new ItemDao(null);
  const requestController = new RequestController<Item>(null);
  const partialUpdateController = new PartialModifyController<Item>(null);
  const entitySourceController = new EntitySourceController<Item>(
    null,
    null,
    null,
  );
  const itemActionController = new ItemActionController(
    partialUpdateController,
    entitySourceController,
  );
  const progressService = new ProgressService();

  function setUp() {
    ServiceLoader.getInstance = jest.fn().mockReturnValue(progressService);
    buildRequestController.mockReturnValue(requestController);
    daoManager.getDao = jest.fn().mockReturnValue(itemDao);
    entitySourceController.delete = jest.fn();
  }

  beforeEach(() => {
    clearMocks();
  });

  describe('deleteItem()', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
      itemDao.delete = jest.fn();
      requestController.put = jest.fn();
      progressService.deleteProgress = jest.fn();
      notificationCenter.emitEntityDelete = jest.fn();
      partialUpdateController.updatePartially = jest.fn();
    });

    it('should call partialUpdateController and send request to update item when item id > 0', async () => {
      const normalId = Math.abs(
        GlipTypeUtil.generatePseudoIdByType(TypeDictionary.TYPE_ID_FILE),
      );
      partialUpdateController.updatePartially = jest
        .fn()
        .mockImplementation((params: PartialUpdateParams<any>) => {
          const { entityId, preHandlePartialEntity, doUpdateEntity } = params;
          expect(entityId).toBe(normalId);
          expect(
            preHandlePartialEntity!(
              { id: normalId, deactivated: true },
              { id: normalId, deactivated: false, name: 'name' },
            ),
          ).toEqual({ id: normalId, deactivated: true });
          doUpdateEntity!({ id: normalId, deactivated: true });
        });
      await itemActionController.deleteItem(normalId);
      expect(partialUpdateController.updatePartially).toHaveBeenCalledWith({
        entityId: normalId,
        preHandlePartialEntity: expect.anything(),
        doUpdateEntity: expect.anything(),
      });
      expect(requestController.put).toHaveBeenCalledWith({
        id: normalId,
        deactivated: true,
      });
      expect(progressService.deleteProgress).not.toHaveBeenCalled();
      expect(notificationCenter.emitEntityDelete).not.toHaveBeenCalled();
    });

    it('should just delete item when item id < 0', async () => {
      const negativeId = GlipTypeUtil.generatePseudoIdByType(
        TypeDictionary.TYPE_ID_FILE,
      );
      entitySourceController.get = jest.fn();
      entitySourceController.get.mockImplementationOnce(() => {
        return { id: TypeDictionary.TYPE_ID_FILE, group_ids: [1] };
      });
      await itemActionController.deleteItem(negativeId);
      expect(entitySourceController.delete).toHaveBeenCalledWith(negativeId);
      expect(requestController.put).not.toHaveBeenCalled();
      expect(notificationCenter.emitEntityDelete).toHaveBeenCalled();
      expect(progressService.deleteProgress).toHaveBeenCalled();
    });
  });
});
