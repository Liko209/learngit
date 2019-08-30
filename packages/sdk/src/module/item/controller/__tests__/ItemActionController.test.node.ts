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
import { IItemService } from '../../service/IItemService';
import ItemAPI from 'sdk/api/glip/item';

jest.mock('../../../../dao');
jest.mock('../../dao');
jest.mock('../../../../api');
jest.mock('../../../../framework/controller');
jest.mock('../../../progress');
jest.mock('../../../../service/notificationCenter');
jest.mock('../../service/IItemService');
jest.mock('sdk/api/glip/item');

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
  const itemService = { handleIncomingData: jest.fn() } as IItemService;
  const itemActionController = new ItemActionController(
    partialUpdateController,
    entitySourceController,
    itemService,
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

  describe('startConference', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });
    it('should throw error if request failed', async (done: jest.DoneCallback) => {
      const error = new Error();
      ItemAPI.startRCConference.mockRejectedValueOnce(error);
      expect(itemActionController.startConference(12)).rejects.toThrow(error);
      done();
    });
    it('should throw error if request success but handle data error', async (done: jest.DoneCallback) => {
      const error = new Error();
      ItemAPI.startRCConference.mockResolvedValueOnce({});
      itemService.handleIncomingData.mockRejectedValueOnce(error);
      expect(itemActionController.startConference(12)).rejects.toThrow(error);
      done();
    });
    it('should throw error if request success but could not get conference item', async (done: jest.DoneCallback) => {
      ItemAPI.startRCConference.mockResolvedValueOnce({});
      itemService.handleIncomingData.mockResolvedValueOnce([]);
      expect(itemActionController.startConference(12)).rejects.toThrow();
      done();
    });
    it('should return conference item if every thing works well', async () => {
      const conference = {
        group_ids: [167247874],
        type_id: 41,
        rc_data: {
          allowJoinBeforeHost: false,
          hostCode: '298062755',
          mode: 'RCC',
          participantCode: '415440708',
          phoneNumber: '+12679304000',
        },
      };
      ItemAPI.startRCConference.mockResolvedValueOnce(conference);
      itemService.handleIncomingData.mockResolvedValueOnce([conference]);
      const a = await itemActionController.startConference(12);
      expect(a).toEqual(conference);
    });
  });
  describe('cancelZoomMeeting', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
      requestController.put = jest.fn();
      progressService.deleteProgress = jest.fn();
      notificationCenter.emitEntityDelete = jest.fn();
      partialUpdateController.updatePartially = jest.fn();
    });
    it('cancelZoomMeeting', async () => {
      const normalId = Math.abs(
        GlipTypeUtil.generatePseudoIdByType(TypeDictionary.TYPE_ID_MEETING),
      );
      partialUpdateController.updatePartially = jest
        .fn()
        .mockImplementation((params: PartialUpdateParams<any>) => {
          const { entityId, preHandlePartialEntity, doUpdateEntity } = params;
          expect(entityId).toBe(normalId);
          expect(
            preHandlePartialEntity!(
              { id: normalId, status: 'cancelled' },
              { id: normalId, status: 'not_start', name: 'name' },
            ),
          ).toEqual({ id: normalId, status: 'cancelled' });
          doUpdateEntity!({ id: normalId, status: 'cancelled' });
        });
      await itemActionController.cancelZoomMeeting(normalId);
      expect(partialUpdateController.updatePartially).toHaveBeenCalledWith({
        entityId: normalId,
        preHandlePartialEntity: expect.anything(),
        doUpdateEntity: expect.anything(),
      });
      expect(requestController.put).toHaveBeenCalledWith({
        id: normalId,
        status: 'cancelled',
      });
    })
  })
});
