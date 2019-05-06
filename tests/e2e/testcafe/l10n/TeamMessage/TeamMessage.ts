import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup } from '../../v2/models';

fixture('TeamMessage/TeamMessage')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Check menu tip',['P2','TeamMessage','V1.4','Sean']),async(t)=>{
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[4];
  const otherUser = h(t).rcData.mainCompany.users[5];
  const anotherUser = h(t).rcData.mainCompany.users[6];
  await h(t).glip(otherUser).init();

  let publicTeam = <IGroup>{
    type: "Team",
    isPublic: true,
    name: `${uuid()}`,
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).log(`Given I have an extension "${loginUser.company.number}#${loginUser.extension}"`);

  await h(t).withLog(`And there is public team: ${publicTeam.name}`, async () => {
    await h(t).scenarioHelper.createTeam(publicTeam);
  });

  await h(t).withLog('And otherUser join the team',async()=>{
    await h(t).scenarioHelper.joinTeam(publicTeam,otherUser)
  })

  await h(t).withLog(`And add another user into the team`, async () => {
    await h(t).scenarioHelper.addMemberToTeam(publicTeam,[anotherUser])
  });

  await h(t).withLog(`And rename the team twice`, async () => {
    await h(t).scenarioHelper.updateTeam(publicTeam, {name: `${uuid()}`})
    await h(t).scenarioHelper.updateTeam(publicTeam, {name: `rename ${uuid()}`})
  });

  await h(t).withLog(`When I login Jupiter with this extension ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const teamSection = app.homePage.messageTab.teamsSection;
  await h(t).withLog(`And I enter and rename the team`, async () => {
    await teamSection.conversationEntryById(publicTeam.glipId).enter();
  });

  await h(t).log('Then I capture screenshot',{screenshotPath:'Jupiter_ContentPanel_Team'})
});
