import { GroupService, Group } from 'sdk/module/group';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { itForSdk } from 'shield/sdk/SdkItFramework';
import { IRequestResponse } from 'shield/sdk/utils/network/networkDataTool';
import { IGlipTeamPost } from 'shield/sdk/mocks/server/glip/api/team/team.post.contract';
import { IApiContract } from 'shield/sdk/types';
// xx.request.data.description
itForSdk('Group Integration test', ({ data, sdk, mockResponse, readJson }) => {
  let groupService: GroupService;

  data.useInitialData(data.template.STANDARD);

  beforeAll(async () => {
    await sdk.setup();
    groupService = ServiceLoader.getInstance(ServiceConfig.GROUP_SERVICE);
  });
  afterAll(async () => {
    await sdk.cleanUp();
  });
  describe('GroupService', () => {
    it('create team', async () => {
      const mockInfo = mockResponse(
        readJson<IGlipTeamPost>(require('./data/CREATE_TEAM.SUCCESS.json')),
        api => {
          const {
            response: { data },
          } = api;
          return {
            id: data._id,
            creatorId: data.creator_id,
            members: data.members,
            name: data.set_abbreviation,
          };
        },
      );
      await groupService.createTeam(mockInfo.creatorId, mockInfo.members, {
        name: mockInfo.name,
      });
      const result = await groupService.getById(mockInfo.id!);
      expect(result).not.toBeUndefined();
      expect(result!.set_abbreviation).toEqual(mockInfo.name);
      expect(result!.creator_id).toEqual(mockInfo.creatorId);
      expect(result!.members).toEqual(mockInfo.members);
    });
    it('modify team name', async () => {
      const mockInfo = mockResponse(
        readJson<IApiContract<any, Group>>(
          require('./data/MODIFY_TEAM_NAME.SUCCESS.json'),
        ),
        reqRes => {
          const {
            response: { data },
          } = reqRes;
          return {
            teamId: Number(data._id!),
            name: data.set_abbreviation,
          };
        },
      );
      await groupService.updateTeamSetting(mockInfo.teamId, {
        name: mockInfo.name,
      });
      const result = await groupService.getById(mockInfo.teamId);
      expect(result).not.toBeUndefined();
      expect(result!.set_abbreviation).toEqual(mockInfo.name);
    });
    it('disable all team permission', async () => {
      const mockTeamInfo = mockResponse(
        readJson<IApiContract<any, Group>>(
          require('./data/DISABLE_TEAM_PERMISSION.SUCCESS.json'),
        ),
        reqRes => {
          const {
            response: { data },
          } = reqRes;
          data.permissions!.user!.level = 0;
          return {
            teamId: Number(data._id),
            name: data.set_abbreviation,
            permissions: data.permissions,
          };
        },
      );
      const beforeUpdate = await groupService.getById(mockTeamInfo.teamId);
      expect(beforeUpdate!.permissions).not.toEqual(mockTeamInfo.permissions);
      await groupService.updateTeamSetting(mockTeamInfo.teamId, {
        name: mockTeamInfo.name,
        permissionFlags: {
          TEAM_ADD_MEMBER: false,
          TEAM_PIN_POST: false,
          TEAM_POST: false,
          TEAM_ADD_INTEGRATIONS: false,
        },
      });
      const afterUpdate = await groupService.getById(mockTeamInfo.teamId);
      expect(afterUpdate).not.toBeUndefined();
      expect(afterUpdate!.permissions).toEqual(mockTeamInfo.permissions);
    });
    it('enable all team permission', async () => {
      const mockInfo = mockResponse(
        readJson<IApiContract<any, Group>>(
          require('./data/DISABLE_TEAM_PERMISSION.SUCCESS.json'),
        ),
        reqRes => {
          const {
            response: { data },
          } = reqRes;
          data.permissions!.user!.level = 15;
          return {
            teamId: Number(data._id),
            name: data.set_abbreviation,
            permissions: data.permissions,
          };
        },
      );
      const beforeUpdate = await groupService.getById(mockInfo.teamId);
      expect(beforeUpdate!.permissions).not.toEqual(mockInfo.permissions);
      await groupService.updateTeamSetting(mockInfo.teamId, {
        name: mockInfo.name,
        permissionFlags: {
          TEAM_ADD_MEMBER: true,
          TEAM_PIN_POST: true,
          TEAM_POST: true,
          TEAM_ADD_INTEGRATIONS: true,
        },
      });
      const afterUpdate = await groupService.getById(mockInfo.teamId);
      expect(afterUpdate).not.toBeUndefined();
      expect(afterUpdate!.permissions).toEqual(mockInfo.permissions);
    });
    it('add team member', async () => {
      const mockInfo = mockResponse(
        readJson<IApiContract<any, Group>>(
          require('./data/ADD_TEAM_MEMBER.SUCCESS.json'),
        ),
        (
          reqRes: IRequestResponse<{ _id: number; members: number[] }, Group>,
        ) => {
          return {
            id: reqRes.request.data!._id,
            addMembers: reqRes.request.data!.members,
            newMembers: reqRes.response.data!.members,
          };
        },
      );
      await groupService.addTeamMembers(mockInfo.addMembers, mockInfo.id);
      const result = await groupService.getById(mockInfo.id!);
      expect(result).not.toBeUndefined();
      expect(result!.members).toEqual(mockInfo.newMembers);
    });
    it('archived team', async () => {
      const mockInfo = mockResponse(
        require('./data/ARCHIVED_TEAM.SUCCESS.json'),
        (reqRes: IRequestResponse<Group, Group>) => {
          return {
            id: reqRes.request.data!._id!,
          };
        },
      );
      await groupService.archiveTeam(mockInfo.id);
      const result = await groupService.getById(mockInfo.id!);
      expect(result).not.toBeUndefined();
      expect(result!.is_archived).toBeTruthy();
    });
  });
});
