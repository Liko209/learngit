import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { IGroup } from "../../v2/models";
import { formalName } from "../../libs/filter";
import { AppRoot } from "../../v2/page-models/AppRoot";
import { h } from "../../v2/helpers";

fixture('RightRail/GroupAddPeople').beforeEach(setupCase(BrandTire.RCOFFICE)).afterEach(teardownCase());
test(formalName('Check add people button on group', ['P2','RightRail','GroupAddPeople','V1.7','Hanny.Han']),async (t) => {

  const app = new AppRoot(t);
	const users = h(t).rcData.mainCompany.users;
	const loginUser = users[4];
  const otherUser = users[5];
  const anotherUser = users[6];

	const group: IGroup = {
		name: 'AddPeopleTest',
		type: 'Group',
		owner: loginUser,
		members: [loginUser, otherUser,anotherUser]
  };
  await h(t).withLog('Given one DirectMessage conversation', async () => {
    await h(t).glip(loginUser).init();
		await h(t).scenarioHelper.createOrOpenChat(group);
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`,async()=>{
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });
  const dmSection = app.homePage.messageTab.directMessagesSection;
  const rightRail = app.homePage.messageTab.rightRail;
	await h(t).withLog('When I enter the conversation',async () => {
		await dmSection.expand();
    await dmSection.conversationEntryById(group.glipId).enter();

  });

  await h(t).withLog('When I click "Add people" icon on right rail',async () => {
    await t.click(rightRail.memberListSection.addMemberButton);
  });

  await h(t).log('Then I take screenshot', {screenshotPath:'Jupiter_RightRail_GroupAddPeopleDialog'});
});
