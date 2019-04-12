/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-01 10:49:44
 */
import { ProfileController } from '../ProfileController';
import { MockEntitySourceController } from './MockEntitySourceController';
import { ProfileActionController } from '../ProfileActionController';
import { ProfileDataController } from '../ProfileDataController';
import { SettingsActionController } from '../SettingsActionController';

jest.mock('../../../../framework/controller');

describe('ProfileController', () => {
  let profileController: ProfileController;
  let mockEntitySourceController: MockEntitySourceController;

  beforeEach(() => {
    mockEntitySourceController = new MockEntitySourceController();
    profileController = new ProfileController(mockEntitySourceController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfileActionController()', () => {
    it('should return ProfileActionController controller', () => {
      profileController.getProfileDataController = jest.fn();
      const result = profileController.getProfileActionController();
      expect(result instanceof ProfileActionController).toBe(true);
    });
  });

  describe('getProfileDataController()', () => {
    it('should return ProfileDataController controller', () => {
      const result = profileController.getProfileDataController();
      expect(result instanceof ProfileDataController).toBe(true);
    });
  });

  describe('getSettingsActionController()', () => {
    it('should return SettingsActionController controller', () => {
      profileController.getProfileDataController = jest.fn();
      const result = profileController.getSettingsActionController();
      expect(result instanceof SettingsActionController).toBe(true);
    });
  });
});
