/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-27 15:22:58
 * Copyright © RingCentral. All rights reserved.
 */

// import { service } from 'sdk';
// import ServiceCommonErrorType from 'sdk/service/errors/ServiceCommonErrorType';
import { getEntity } from '../../../../store/utils';
import { PrivacyViewModel } from '../Privacy.ViewModel';
import { PrivacyProps } from '../types';

jest.mock('../../../../store/utils');

// const { GroupService } = service;
// const groupService = {
//   getLocalGroup: jest.fn().mockResolvedValue(mockGroup),
//   markGroupAsFavorite: jest.fn().mockResolvedValue(ServiceCommonErrorType.NONE),
// };
// GroupService.getInstance = jest.fn().mockReturnValue(groupService);

const mockEntity = {
  isTeam: true,
  privacy: 'private',
};
const props: PrivacyProps = {
  id: 1,
  size: 'medium',
};
const vm = new PrivacyViewModel(props);

describe('Privacy view model', () => {
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

  // it('request service for handler privacy', async () => {
  //   const result = await vm.handlePrivacy();
  //   expect(result).toEqual(ServiceCommonErrorType.NONE);
  // });
});
