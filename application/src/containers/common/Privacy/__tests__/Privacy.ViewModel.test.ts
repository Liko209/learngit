/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-27 15:22:58
 * Copyright © RingCentral. All rights reserved.
 */

import { service, JSdkError, ERROR_CODES_SDK } from 'sdk';
import { getEntity } from '../../../../store/utils';
import { PrivacyViewModel } from '../Privacy.ViewModel';
import { PrivacyProps } from '../types';

jest.mock('../../../../store/utils');
const mockGroup = {
  id: 123,
};
const { GroupService } = service;
const groupService = {
  getLocalGroup: jest.fn().mockResolvedValue(mockGroup),
  updateGroupPrivacy: jest
    .fn()
    .mockResolvedValue(new JSdkError(ERROR_CODES_SDK.INVALID_MODEL_ID, '')),
};
GroupService.getInstance = jest.fn().mockReturnValue(groupService);

const mockEntity = {
  isTeam: true,
  privacy: 'private',
  isAdmin: true,
};
const props: PrivacyProps = {
  id: 1,
  size: 'medium',
};

describe('Privacy view model', () => {
  const vm = new PrivacyViewModel(props);
  beforeAll(() => {
    (getEntity as jest.Mock).mockReturnValue(mockEntity);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('computed size', () => {
    vm.props.size = 'small';
    expect(vm.size).toEqual('small');
    vm.props.size = 'medium';
    expect(vm.size).toEqual('medium');
    vm.props.size = 'large';
    expect(vm.size).toEqual('large');
  });

  it('computed isPublic', () => {
    mockEntity.privacy = 'protect';
    expect(vm.isPublic).toEqual(true);
    mockEntity.privacy = 'private';
    expect(vm.isPublic).toEqual(false);
  });

  describe('isAdmin', () => {
    it('should isAdmin equal', () => {
      mockEntity.isAdmin = true;
      expect(vm.isAdmin).toBe(true);
      mockEntity.isAdmin = false;
      expect(vm.isAdmin).toBe(false);
    });
  });

  describe('privacy', () => {
    it('should return error when service error', async () => {
      try {
        await vm.handlePrivacy();
      } catch (error) {
        expect(error instanceof JSdkError).toBeTruthy();
        expect(error.code).toEqual(ERROR_CODES_SDK.INVALID_MODEL_ID);
      }
    });
  });
});
