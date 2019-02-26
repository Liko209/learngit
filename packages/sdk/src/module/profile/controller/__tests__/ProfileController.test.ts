/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-01 10:49:44
 */
import { ProfileController } from '../ProfileController';
import Api from '../../../../api/api';
import { MockEntitySourceController } from './MockEntitySourceController';
import {
  buildEntitySourceController,
  buildPartialModifyController,
  buildRequestController,
} from '../../../../framework/controller';
import { ProfileActionController } from '../ProfileActionController';

jest.mock('../../../../framework/controller');
jest.mock('../../../../api/api');
jest.mock('../../../../dao');
jest.mock('../../../progress');

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
    it('should call partial modify controller', async () => {
      Object.assign(Api, {
        glipNetworkClient: null,
      });
      buildPartialModifyController.mockImplementationOnce(() => {
        return undefined;
      });

      buildRequestController.mockImplementationOnce(() => {
        return undefined;
      });
      buildEntitySourceController.mockImplementationOnce(() => {
        return undefined;
      });
      const result = profileController.getProfileActionController();
      expect(result instanceof ProfileActionController).toBe(true);
      expect(buildEntitySourceController).toBeCalledTimes(1);
      expect(buildPartialModifyController).toBeCalledTimes(1);
      expect(buildRequestController).toBeCalledTimes(1);
    });
  });
});
