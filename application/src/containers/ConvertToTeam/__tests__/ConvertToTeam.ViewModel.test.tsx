/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-03-14 13:23:22
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '../../../store/utils';
import { ConvertToTeamViewModel } from '../ConvertToTeam.ViewModel';
import { GroupService, TeamSetting } from 'sdk/module/group';
import {
  JServerError,
  JNetworkError,
  ERROR_CODES_NETWORK,
  ERROR_CODES_SERVER,
} from 'sdk/error';

jest.mock('../../../store/utils');

const mockEntityGroup = {
  displayName: 'Group name',
  members: [1, 2],
};

const groupService = {
  convertToTeam() {},
};

const props = {
  id: 1,
};

let vm: ConvertToTeamViewModel;

describe('ConvertToTeamViewModel', () => {
  beforeAll(() => {
    (getEntity as jest.Mock).mockReturnValue(mockEntityGroup);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(GroupService, 'getInstance').mockReturnValue(groupService);
    vm = new ConvertToTeamViewModel(props);
    vm.getDerivedProps(props);
  });

  describe('group', () => {
    it('should be get group entity when invoke class instance property group', () => {
      expect(vm.group).toEqual(mockEntityGroup);
    });
  });

  describe('handleNameChange()', () => {
    it('should be get correct value when team name has change [JPT-1390]', () => {
      vm.handleNameChange({
        target: {
          value: '123',
        },
      } as React.ChangeEvent<HTMLInputElement>);
      expect(vm.name).toBe('123');
      expect(vm.disabledOkBtn).toBe(false);
      expect(vm.nameErrorKey).toBe('');
      // chang team name
      vm.handleNameChange({
        target: {
          value: '',
        },
      } as React.ChangeEvent<HTMLInputElement>);
      expect(vm.name).toBe('');
      expect(vm.disabledOkBtn).toBe(true);
      expect(vm.nameErrorKey).toBe('');
    });
  });

  describe('handleDescriptionChange()', () => {
    it('should be get correct value when team description has change', () => {
      vm.handleDescriptionChange({
        target: {
          value: '123',
        },
      } as React.ChangeEvent<HTMLInputElement>);
      expect(vm.description).toBe('123');
      // chang team description
      vm.handleDescriptionChange({
        target: {
          value: '12',
        },
      } as React.ChangeEvent<HTMLInputElement>);
      expect(vm.description).toBe('12');
    });
  });

  describe('save()', () => {
    const name = 'name';
    const description = 'description';
    const options: TeamSetting = {
      name,
      description,
      isPublic: true,
      permissionFlags: {
        TEAM_POST: true,
      },
    };

    it('should be convert to team save success when normal return of service', async () => {
      const mockSuccess = { id: 123 };
      groupService.convertToTeam = jest
        .fn()
        .mockImplementation(() => mockSuccess);
      const result = await vm.save(options);
      expect(groupService.convertToTeam).toHaveBeenCalledWith(
        props.id,
        mockEntityGroup.members,
        options,
      );
      expect(result).toEqual(mockSuccess);
    });

    it('should be convert to team save failure when team name duplicate [JPT-1392]', async () => {
      const mockError = new JServerError(
        ERROR_CODES_SERVER.ALREADY_TAKEN,
        'NAME_DUPLICATION_ERROR_MESSAGE',
      );
      groupService.convertToTeam = jest.fn().mockRejectedValue(mockError);
      const result = await vm.save(options);
      expect(result).toBeNull();
    });

    it('should be convert to team save failure when service error [JPT-1394]', async () => {
      const mockError = new JNetworkError(
        ERROR_CODES_NETWORK.INTERNAL_SERVER_ERROR,
        'NETWORK_OFFLINE_ERROR_MESSAGE',
      );
      groupService.convertToTeam = jest.fn().mockRejectedValueOnce(mockError);
      await expect(vm.save(options)).rejects.toEqual(
        new Error('NETWORK_OFFLINE_ERROR_MESSAGE'),
      );
    });
  });
});
