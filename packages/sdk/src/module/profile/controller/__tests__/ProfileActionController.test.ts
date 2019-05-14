/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-02-14 15:55:54
 * Copyright © RingCentral. All rights reserved.
 */
import { Profile } from '../../entity';
import { IPartialModifyController } from '../../../../framework/controller/interface/IPartialModifyController';
import { ProfileDataController } from '../ProfileDataController';
import { Raw } from '../../../../framework/model';
import { ProfileActionController } from '../ProfileActionController';
import { AccountUserConfig } from '../../../../module/account/config';
import { PersonDao } from '../../../person/dao/PersonDao';
import { daoManager } from '../../../../dao';
import { ServiceLoader } from 'sdk/module/serviceLoader';

jest.mock('../ProfileDataController');
jest.mock('../../../../module/account/config');
jest.mock('../../../person/dao/PersonDao');
jest.mock('../../../../dao');

const personDao = new PersonDao(null);
daoManager.getDao.mockReturnValue(personDao);

class TestPartialModifyController implements IPartialModifyController<Profile> {
  partialEntity: Partial<Raw<Profile>>;
  originalEntity: Profile;
  updatePartially(
    entityId: number,
    preHandlePartialEntity?: (
      partialEntity: Partial<Raw<Profile>>,
      originalEntity: Profile,
    ) => Partial<Raw<Profile>>,
    doUpdateEntity?: (updatedEntity: Profile) => Promise<Profile>,
    doPartialNotify?: (
      originalEntities: Profile[],
      updatedEntities: Profile[],
      partialEntities: Partial<Raw<Profile>>[],
    ) => void,
  ): Promise<Profile | null> {
    return preHandlePartialEntity(this.partialEntity, this.originalEntity);
  }
}

const profileDataController = new ProfileDataController(null);
const testPartialModifyController = new TestPartialModifyController();
describe('ProfileActionController', () => {
  beforeEach(() => {
    ServiceLoader.getInstance = jest.fn().mockImplementation(() => {
      return { userConfig: AccountUserConfig.prototype };
    });
  });

  function getActionController() {
    profileDataController.getCurrentProfileId.mockReturnValue(1);
    return new ProfileActionController(
      testPartialModifyController,
      null,
      profileDataController,
    );
  }
  describe('reorderFavoriteGroups', () => {
    it('should render back to forward', async () => {
      testPartialModifyController.partialEntity = { _id: 2 };
      testPartialModifyController.originalEntity = {
        id: 2,
        favorite_group_ids: [1, 2, 3],
      } as Profile;
      const controller = getActionController();
      const result = await controller.reorderFavoriteGroups(
        testPartialModifyController.originalEntity.favorite_group_ids,
        1,
        0,
      );
      expect(result).toEqual({
        _id: 2,
        favorite_group_ids: [2, 1, 3],
      });
    });
    it('should render back to forward', async () => {
      testPartialModifyController.partialEntity = { _id: 2 };
      testPartialModifyController.originalEntity = {
        id: 2,
        favorite_group_ids: [1, 2, 3],
      } as Profile;
      const controller = getActionController();
      const result = await controller.reorderFavoriteGroups(
        testPartialModifyController.originalEntity.favorite_group_ids,
        0,
        2,
      );
      expect(result).toEqual({
        _id: 2,
        favorite_group_ids: [2, 3, 1],
      });
    });
  });
  describe('markGroupAsFavorite', () => {
    it('should mark group as favorite when it is unfavorite', async () => {
      testPartialModifyController.partialEntity = { _id: 2 };
      testPartialModifyController.originalEntity = {
        id: 2,
        favorite_group_ids: [111],
      } as Profile;
      const controller = getActionController();
      const result = await controller.markGroupAsFavorite(222, true);
      expect(result).toEqual({
        _id: 2,
        favorite_group_ids: [222, 111],
      });
    });

    it('should mark group as unfavorite when it is favorite', async () => {
      testPartialModifyController.partialEntity = { _id: 2 };
      testPartialModifyController.originalEntity = {
        id: 2,
        favorite_group_ids: [111, 222],
      } as Profile;
      const controller = getActionController();
      const result = await controller.markGroupAsFavorite(222, false);
      expect(result).toEqual({
        _id: 2,
        favorite_group_ids: [111],
      });
    });

    it('should do nothing when group is favorite and mark it as favorite', async () => {
      testPartialModifyController.partialEntity = { _id: 2 };
      testPartialModifyController.originalEntity = {
        id: 2,
        favorite_group_ids: [111, 222],
      } as Profile;
      const controller = getActionController();
      const result = await controller.markGroupAsFavorite(222, true);
      expect(result).toEqual({
        _id: 2,
        favorite_group_ids: [111, 222],
      });
    });

    it('should do nothing when group is unfavorite and mark it as unfavorite', async () => {
      testPartialModifyController.partialEntity = { _id: 2 };
      testPartialModifyController.originalEntity = {
        id: 2,
        favorite_group_ids: [111, 222],
      } as Profile;
      const controller = getActionController();
      const result = await controller.markGroupAsFavorite(333, false);
      expect(result).toEqual({
        _id: 2,
        favorite_group_ids: [111, 222],
      });
    });
  });
  describe('markMeConversationAsFav', () => {
    it('should do nothing if had ever mark me as favorite', async () => {
      profileDataController.getProfile.mockResolvedValueOnce({
        id: 2,
        me_tab: true,
      });
      const controller = getActionController();
      const result = await controller.markMeConversationAsFav();
      expect(result).toEqual({
        id: 2,
        me_tab: true,
      });
    });
    it('should mark me conversation as favorite if it has never been mark as unfavorite', async () => {
      profileDataController.getProfile.mockResolvedValueOnce({
        id: 2,
        me_tab: false,
      });
      testPartialModifyController.partialEntity = { _id: 2 };
      testPartialModifyController.originalEntity = {
        id: 2,
        favorite_group_ids: [],
      } as Profile;
      AccountUserConfig.prototype.getGlipUserId.mockReturnValueOnce(1);
      personDao.get.mockResolvedValueOnce({
        me_group_id: 111,
      });
      const controller = getActionController();
      const result = await controller.markMeConversationAsFav();
      expect(result).toEqual({
        _id: 2,
        me_tab: true,
        favorite_group_ids: [111],
      });
    });
  });
  describe('putFavoritePost', () => {
    it('should mark post as favorite', async () => {
      profileDataController.getProfile.mockResolvedValueOnce({
        id: 2,
        favorite_post_ids: [111],
      });
      testPartialModifyController.partialEntity = { _id: 2 };
      const controller = getActionController();
      try {
        const result = await controller.putFavoritePost(222, true);
        expect(result).toEqual({ _id: 2, favorite_post_ids: [222, 111] });
      } catch (e) {
        expect(true).toBeFalsy();
      }
    });
    it('should mark post as unfavorite', async () => {
      profileDataController.getProfile.mockResolvedValueOnce({
        id: 2,
        favorite_post_ids: [111],
      });
      testPartialModifyController.partialEntity = { _id: 2 };
      const controller = getActionController();
      try {
        const result = await controller.putFavoritePost(111, false);
        expect(result).toEqual({ _id: 2, favorite_post_ids: [] });
      } catch (e) {
        expect(true).toBeFalsy();
      }
    });

    it('should do nothing when post is unfavorite and mark it as unfavorite', async () => {
      profileDataController.getProfile.mockResolvedValueOnce({
        id: 2,
        favorite_post_ids: [111],
      });
      const controller = getActionController();
      try {
        const result = await controller.putFavoritePost(222, false);
        expect(result).toEqual({ id: 2, favorite_post_ids: [111] });
      } catch (e) {
        expect(true).toBeFalsy();
      }
    });

    it('should do nothing when post is favorite and mark it as favorite', async () => {
      profileDataController.getProfile.mockResolvedValueOnce({
        id: 2,
        favorite_post_ids: [111],
      });
      const controller = getActionController();

      try {
        const result = await controller.putFavoritePost(111, true);
        expect(result).toEqual({ id: 2, favorite_post_ids: [111] });
      } catch (e) {
        expect(true).toBeFalsy();
      }
    });
  });
  describe('reopenConversation', () => {
    it('should reopen group when group is hidden', async () => {
      testPartialModifyController.partialEntity = {
        _id: 2,
      };
      testPartialModifyController.originalEntity = {
        _id: 2,
        hide_group_333: true,
      };
      const controller = getActionController();
      const result = await controller.reopenConversation(333);
      expect(result).toEqual({
        _id: 2,
        hide_group_333: false,
      });
    });

    it('should do nothing when group is not hidden', async () => {
      testPartialModifyController.partialEntity = {
        _id: 2,
        person_id: 3,
      };
      testPartialModifyController.originalEntity = {
        _id: 2,
      };
      const controller = getActionController();
      const result = await controller.reopenConversation(333);
      expect(result).toEqual({
        _id: 2,
        person_id: 3,
      });
    });
  });
  describe('hideConversation', () => {
    it('should hide group', async () => {
      testPartialModifyController.partialEntity = { _id: 2 };
      testPartialModifyController.originalEntity = {
        id: 2,
      } as Profile;
      const controller = getActionController();
      const result = await controller.hideConversation(222, true);
      expect(result).toEqual({
        _id: 2,
        hide_group_222: true,
        favorite_group_ids: [],
      });
    });

    it('should hide group and skip_close_conversation_confirmation', async () => {
      testPartialModifyController.partialEntity = { _id: 2 };
      testPartialModifyController.originalEntity = {
        id: 2,
        favorite_group_ids: [111],
      } as Profile;
      const controller = getActionController();
      const result = await controller.hideConversation(222, true, true);
      expect(result).toEqual({
        _id: 2,
        hide_group_222: true,
        favorite_group_ids: [111],
        skip_close_conversation_confirmation: true,
      });
    });

    it('should remove from favorite groups', async () => {
      testPartialModifyController.partialEntity = { _id: 2 };
      testPartialModifyController.originalEntity = {
        id: 2,
        favorite_group_ids: [222],
      } as Profile;
      const controller = getActionController();
      const result = await controller.hideConversation(222, true, true);
      expect(result).toEqual({
        _id: 2,
        hide_group_222: true,
        favorite_group_ids: [],
        skip_close_conversation_confirmation: true,
      });
    });
  });
  describe('handleGroupIncomesNewPost', () => {
    it('should do nothing when groupIds is empty', async () => {
      const controller = getActionController();
      const result = await controller.handleGroupIncomesNewPost([]);
      expect(result).toEqual(null);
    });

    it('should do nothing when groupIds are not hidden', async () => {
      testPartialModifyController.partialEntity = { _id: 2 };
      testPartialModifyController.originalEntity = {
        id: 2,
        hide_group_222: false,
      } as Profile;
      const controller = getActionController();
      const result = await controller.handleGroupIncomesNewPost([22]);
      expect(result).toEqual({ _id: 2 });
    });

    it('should open group when group is hidden', async () => {
      testPartialModifyController.partialEntity = { _id: 2 };
      testPartialModifyController.originalEntity = {
        id: 2,
        hide_group_222: false,
        hide_group_333: true,
      } as Profile;
      const controller = getActionController();
      const result = await controller.handleGroupIncomesNewPost([333]);
      expect(result).toEqual({ _id: 2, hide_group_333: false });
    });
  });
});
