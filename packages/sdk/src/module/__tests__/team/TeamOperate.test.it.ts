import { GroupService, Group } from 'sdk/module/group';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { itForSdk } from 'shield/sdk/SdkItFramework';
import { IRequestResponse } from 'shield/sdk/utils/network/networkDataTool';

itForSdk('Group Integration test', ({ server, data, sdk, mockResponse }) => {
  let groupService: GroupService;

  const glipData = data.useInitialData(data.template.BASIC);
  // data.helper().team.createTeam('Test Team with thomas', [123]),
  const team1 = data
    .helper()
    .team.createTeam('Test Team with thomas', [123], { post_cursor: 11 });
  glipData.teams.push(team1, ...data.helper().team.factory.buildList(2));
  glipData.groupState.push(
    data.helper().groupState.createGroupState(team1._id, { post_cursor: 8 }),
  );
  glipData.people.push(
    data.helper().person.build({ display_name: 'Special Name +86789' }),
  );
  data.apply();

  beforeAll(async () => {
    await sdk.setup();
    groupService = ServiceLoader.getInstance(ServiceConfig.GROUP_SERVICE);
  });
  afterAll(async () => {
    await sdk.cleanUp();
  });
  describe('GroupService', () => {
    it('search group', async () => {
      const mockTeamInfo = mockResponse(
        require('./data/MODIFY_TEAM_NAME.SUCCESS.json'),
        (reqRes: IRequestResponse<any, Group>) => {
          const {
            response: { data },
          } = reqRes;
          return {
            teamId: Number(data._id!),
            name: data.set_abbreviation,
          };
        },
      );
      await groupService.updateTeamSetting(mockTeamInfo.teamId, {
        name: mockTeamInfo.name,
      });
      const result = await groupService.getById(mockTeamInfo.teamId);
      expect(result!.set_abbreviation).toEqual(mockTeamInfo.name);
    });
  });
});
