/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:26:24
 * Copyright © RingCentral. All rights reserved.
 */
import { GroupService, Group } from 'sdk/module/group';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { jit } from 'shield/sdk/SdkItFramework';
import { IApiContract, IRequestResponse } from 'shield/sdk/types';
import { readApiJson } from 'shield/sdk/utils';
import { IGlipTeamPost } from 'shield/sdk/mocks/glip/api/team/team.post.contract';
import { Team } from './scenario';

jit('Group Integration test', ({ helper, sdk, template }) => {
  let groupService: GroupService;

  helper.useInitialData(template.STANDARD);

  beforeAll(async () => {
    await sdk.setup();
    groupService = ServiceLoader.getInstance(ServiceConfig.GROUP_SERVICE);
  });
  afterAll(async () => {
    await sdk.cleanUp();
  });
  describe('GroupService', () => {
    it('create team', async () => {
      const { createdTeam } = await helper.useScenario(Team.Create.Success);

      await groupService.createTeam(
        createdTeam.creator_id,
        createdTeam.members,
        {
          name: createdTeam.set_abbreviation,
        },
      );
      const result = await groupService.getById(createdTeam._id!);
      expect(result).not.toBeUndefined();
      expect(result!.set_abbreviation).toEqual(createdTeam.set_abbreviation);
      expect(result!.creator_id).toEqual(createdTeam.creator_id);
      expect(result!.members).toEqual(createdTeam.members);
    });
    it('modify team name', async () => {
      const { updatedTeam } = await helper.useScenario(Team.Update.Success);
      await groupService.updateTeamSetting(updatedTeam._id, {
        name: updatedTeam.set_abbreviation,
      });
      const result = await groupService.getById(updatedTeam._id);
      expect(result).not.toBeUndefined();
      expect(result!.set_abbreviation).toEqual(updatedTeam.set_abbreviation);
    });
    it('disable all team permission', async () => {
      const { updatedTeam } = await helper.useScenario(Team.Update.Success, {
        teamInfo: {
          permissions: {
            user: {
              level: 0,
            },
          },
        },
      });
      const beforeUpdate = await groupService.getById(updatedTeam._id);
      expect(beforeUpdate!.permissions).not.toEqual(updatedTeam.permissions);
      await groupService.updateTeamSetting(updatedTeam._id, {
        name: updatedTeam.set_abbreviation,
        permissionFlags: {
          TEAM_ADD_MEMBER: false,
          TEAM_PIN_POST: false,
          TEAM_POST: false,
          TEAM_ADD_INTEGRATIONS: false,
        },
      });
      const afterUpdate = await groupService.getById(updatedTeam._id);
      expect(afterUpdate).not.toBeUndefined();
      expect(afterUpdate!.permissions).toEqual(updatedTeam.permissions);
    });
    it('enable all team permission', async () => {
      const { updatedTeam } = await helper.useScenario(Team.Update.Success, {
        teamInfo: {
          permissions: {
            user: {
              level: 15,
            },
          },
        },
      });
      const beforeUpdate = await groupService.getById(updatedTeam._id);
      expect(beforeUpdate!.permissions).not.toEqual(updatedTeam.permissions);
      await groupService.updateTeamSetting(updatedTeam._id, {
        name: updatedTeam.set_abbreviation,
        permissionFlags: {
          TEAM_ADD_MEMBER: true,
          TEAM_PIN_POST: true,
          TEAM_POST: true,
          TEAM_ADD_INTEGRATIONS: true,
        },
      });
      const afterUpdate = await groupService.getById(updatedTeam._id);
      expect(afterUpdate).not.toBeUndefined();
      expect(afterUpdate!.permissions).toEqual(updatedTeam.permissions);
    });
    it('add team member', async () => {
      const updatedTeam = helper.mockResponse(
        readApiJson<IApiContract<any, Group>>(
          require('./data/ADD_TEAM_MEMBER.SUCCESS.json'),
        ),
        (
          reqRes: IRequestResponse<{ _id: number; members: number[] }, Group>,
        ) => ({
          id: reqRes.request.data!._id,
          addMembers: reqRes.request.data!.members,
          newMembers: reqRes.response.data!.members,
        }),
      );
      await groupService.addTeamMembers(updatedTeam.addMembers, updatedTeam.id);
      const result = await groupService.getById(updatedTeam.id!);
      expect(result).not.toBeUndefined();
      expect(result!.members).toEqual(updatedTeam.newMembers);
    });
    it('archived team', async () => {
      const updatedTeam = helper.mockResponse(
        require('./data/ARCHIVED_TEAM.SUCCESS.json'),
        (reqRes: IRequestResponse<Group, Group>) => ({
          id: reqRes.request.data!._id!,
        }),
      );
      await groupService.archiveTeam(updatedTeam.id);
      const result = await groupService.getById(updatedTeam.id!);
      expect(result).not.toBeUndefined();
      expect(result!.is_archived).toBeTruthy();
    });
  });
});
