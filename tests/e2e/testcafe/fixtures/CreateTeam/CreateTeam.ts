/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-31 13:37:43
 * Copyright © RingCentral. All rights reserved.
 */

import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup, ITestMeta } from '../../v2/models';
import * as faker from 'faker/locale/en';

fixture('CreateTeam')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('new team popup can be open and closed', ['P1', 'JPT-86']), async t => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[0];

  await h(t).withLog(`When I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  // case 1
  await h(t).withLog('Then I can open add menu in home page', async () => {
    await app.homePage.openAddActionMenu();
  });

  const createTeamModal = app.homePage.createTeamModal;
  await h(t).withLog('Then I can open Create Team in AddActionMenu', async () => {
    await app.homePage.addActionMenu.createTeamEntry.enter();
    await createTeamModal.ensureLoaded();
  }, true);

  await h(t).withLog('Then I can close the Create Team popup', async () => {
    await createTeamModal.clickCancelButton();
  });
});

test(formalName('Check the maximum length of the Team Name input box', ['P1', 'JPT-102']), async t => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).glip(loginUser).init();
  const newMemberName = h(t).glip(loginUser).getPersonPartialData('display_name', users[7].rcId);

  let group = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, users[5], users[6]]
  }

  await h(t).withLog('Given I have a group type chat', async () => {
    await h(t).scenarioHelper.createOrOpenChat(group);
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I can open add menu in home page', async () => {
    await app.homePage.openAddActionMenu();
  });

  const createTeamModal = app.homePage.createTeamModal;
  await h(t).withLog('And I can open Create Team in AddActionMenu', async () => {
    await app.homePage.addActionMenu.createTeamEntry.enter();
    await createTeamModal.ensureLoaded();
  });

  await h(t).withLog('And I input team name exceeded max characters(202)', async () => {
    await createTeamModal.typeRandomTeamName(202);
  });

  await h(t).withLog('Then Just only paste 200 characters into field, other characters should be automatically truncated.', async () => {
    const teamNameValue = await createTeamModal.teamNameInput.value;
    await t.expect(teamNameValue.length).eql(200);
    await createTeamModal.clickCancelButton();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('When I open the group and open more button on the conversation page header', async () => {
    await app.homePage.messageTab.directMessagesSection.conversationEntryById(group.glipId).enter();
    await conversationPage.waitUntilPostsBeLoaded();
    await conversationPage.openMoreButtonOnHeader();
  });

  await h(t).withLog('And I click "Convert to team" button', async () => {
    await conversationPage.headerMoreMenu.convertToTeam.enter()
  });

  const convertToTeamModal = app.homePage.convertToTeamModal;
  await h(t).withLog('Then ConvertToTeam dialog should be popup', async () => {
    await convertToTeamModal.ensureLoaded();
  });

  await h(t).withLog('When I input team name exceeded max characters(202)', async () => {
    await convertToTeamModal.typeRandomTeamName(202);
  });

  await h(t).withLog('Then Just only paste 200 characters into field, other characters should be automatically truncated.', async () => {
    const teamNameValue = await convertToTeamModal.teamNameInput.value;
    await t.expect(teamNameValue.length).eql(200);
    await convertToTeamModal.clickCancelButton();
  });
});

test(formalName('Check the new team can be created successfully', ['P1', 'JPT-127']), async t => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[0];
  const teamName = `Team ${uuid()}`;

  await h(t).withLog(`When I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('Then I can open add menu in home page', async () => {
    await app.homePage.openAddActionMenu();
  });

  const createTeamModal = app.homePage.createTeamModal;
  await h(t).withLog('Then I can open Create Team in AddActionMenu', async () => {
    await app.homePage.addActionMenu.createTeamEntry.enter();
    await createTeamModal.ensureLoaded();
  });

  await h(t).withLog('Then I can input team name randomly', async () => {
    await createTeamModal.typeTeamName(teamName);
  });

  await h(t).withLog('Then I can set the team as Public', async () => {
    await createTeamModal.turnOffIsPublic();
  });

  await h(t).withLog('Then Turn off the toggle of "Members may post messages"', async () => {
    await createTeamModal.turnOffMayPostMessage();
  });

  await h(t).withLog('Then Tap create team button', async () => {
    await createTeamModal.clickCreateButton();
  });

  await h(t).withLog('Then Check the created team', async () => {
    const teamSection = app.homePage.messageTab.teamsSection;
    await teamSection.expand();
    await t.expect(teamSection.conversations.withText(`${teamName}`).exists).ok();
    await t.expect(app.homePage.messageTab.conversationPage.title.withText(`${teamName}`).exists).ok();
  }, true);
});

test(formalName('Check the Create button is disabled when user create team without team name', ['P2', 'JPT-92']),
  async t => {
    const app = new AppRoot(t);
    const loginUser = h(t).rcData.mainCompany.users[0];
    const teamName = `Team ${uuid()}`;

    await h(t).withLog(`When I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    // case 4
    await h(t).withLog('Then I can open add menu in home page', async () => {
      await app.homePage.openAddActionMenu();
    });

    const createTeamModal = app.homePage.createTeamModal;
    await h(t).withLog('Then CreateTeam button is disabled', async () => {
      await app.homePage.addActionMenu.createTeamEntry.enter();
      await createTeamModal.ensureLoaded();
      await createTeamModal.createTeamButtonShouldBeDisabled();
    }, true);

    await h(t).withLog('Then CreateTeam button is enabled', async () => {
      await createTeamModal.typeTeamName(teamName);
      await createTeamModal.createdTeamButtonShouldBeEnabled();
    }, true);

  },
);

test(formalName('new team popup can be open', ['P2', 'JPT-88']), async t => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[0];

  await h(t).withLog(`When I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('Then I can open add menu in home page', async () => {
    await app.homePage.openAddActionMenu();
  });

  const createTeamModal = app.homePage.createTeamModal;
  await h(t).withLog('And I can open Create Team in AddActionMenu', async () => {
    await app.homePage.addActionMenu.createTeamEntry.enter();
    await createTeamModal.ensureLoaded();
  }, true);

  await h(t).withLog('And Pubic Team toggle is false by default', async () => {
    await t.expect(createTeamModal.isPublicToggle.checked).notOk();
  });

  await h(t).withLog('And Add other members toggle is true by default', async () => {
    await t.expect(createTeamModal.mayAddMemberToggle.checked).ok();
  });
  await h(t).withLog('And Post messages toggle is true by default', async () => {
    await t.expect(createTeamModal.mayPostMessageToggle.checked).ok();
  });
  await h(t).withLog('And Pin pist toggle is true by default', async () => {
    await t.expect(createTeamModal.mayPinPostToggle.checked).ok();
  });

  await h(t).withLog('And Team name ghost by default', async () => {
    await t.expect(createTeamModal.teamNameInput.getAttribute('placeholder')).eql('Enter team name');
  });

  await h(t).withLog('And Members ghost by default', async () => {
    await t.expect(createTeamModal.memberInput.InputArea.getAttribute('placeholder')).eql('Enter names or email addresses');
  });
});

test(formalName('Check the maximum length of the Team Description input box', ['P3', 'JPT-111']),
  async t => {
    const app = new AppRoot(t);
    const loginUser = h(t).rcData.mainCompany.users[0];

    await h(t).withLog(`When I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    // case 5
    await h(t).withLog('Then I can open add menu in home page', async () => {
      await app.homePage.openAddActionMenu();
    });

    const createTeamModal = app.homePage.createTeamModal;
    await h(t).withLog('Then I can open Create Team in AddActionMenu', async () => {
      await app.homePage.addActionMenu.createTeamEntry.enter();
      await createTeamModal.ensureLoaded();
    });

    await h(t).withLog('Then I input team Description exceeded max characters', async () => {
      // Here we type 1002 chars, which exceeds max chars of 1000
      await createTeamModal.typeRandomTeamDescription(1002);
    });

    await h(t).withLog('Then I can input team Description with 1000 character', async () => {
      const teamDescriptionValue = await createTeamModal.teamDescriptionInput.value;
      // assert only 1000 chars will be kept
      await t.expect(teamDescriptionValue.length).eql(1000);
      await createTeamModal.clickCancelButton();
    });

  },
);

test(formalName('Check user can be able to remove the selected name(s)', ['P3', 'JPT-148', 'Potar.He']), async t => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[0];
  await h(t).glip(loginUser).init();

  let name; //  email;  TODO: currently no support  email search. {name, email}
  await h(t).withLog(`Given I one exist user name and email`, async () => {
    name = await h(t).glip(loginUser).getPerson(users[1].rcId).then(res => res.data.display_name);
    // email = personData.data.email;  // TODO: currently no support  email search. {name, email}
  });


  const searchParams = { name } // TODO: currently no support  email search. {name, email}
  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  // create team entry
  const createTeamModal = app.homePage.createTeamModal;
  await h(t).withLog('When I click Create Team on AddActionMenu', async () => {
    await app.homePage.openAddActionMenu();
    await app.homePage.addActionMenu.createTeamEntry.enter();
    await createTeamModal.ensureLoaded();
  });

  await h(t).withLog('Then the create team dialog should be popup', async () => {
    await t.expect(createTeamModal.exists).ok();
  });

  const createTeamSteps = async (key: string, text: string, i: number) => {
    await h(t).withLog(`When I type ${key}: ${text}, and select the first search user`, async () => {
      await createTeamModal.memberInput.typeText(text, { paste: true });
      await t.wait(3e3);
      await createTeamModal.memberInput.selectMemberByNth(0);
    });

    await h(t).withLog(`Then the selected members count should be 1`, async () => {
      await t.expect(createTeamModal.memberInput.selectedMembers.count).eql(1);
    });

    if (i == 0) {
      await h(t).withLog(`When I Tap the "backspace" on the keypad`, async () => {
        await t.pressKey('backspace');
      })
    } else {
      await h(t).withLog(`When I tap the "delete" icon of the selected contact`, async () => {
        await createTeamModal.memberInput.removeSelectedItem();
      })
    }

    await h(t).withLog(`Then the last selected members should be removed`, async () => {
      await t.expect(createTeamModal.memberInput.selectedMembers.exists).notOk();
    });
  }

  for (let key in searchParams) {
    let text = searchParams[key]
    for (let i of _.range(2)) {
      await createTeamSteps(key, text, i);
    }
  }

  // send new Message entry
  const sendNewMessageModal = app.homePage.sendNewMessageModal;
  await h(t).withLog('When I click "Send New Message" on AddActionMenu', async () => {
    await createTeamModal.clickCancelButton();
    await app.homePage.openAddActionMenu();
    await app.homePage.addActionMenu.sendNewMessageEntry.enter();
    await sendNewMessageModal.ensureLoaded();
  });

  await h(t).withLog('Then the "New Message" dialog should be popup', async () => {
    await t.expect(sendNewMessageModal.exists).ok();
  });

  const sendNewMessageSteps = async (key: string, text: string, i: number) => {
    await h(t).withLog(`When I type ${key}: ${text}, and select the first search user`, async () => {
      await sendNewMessageModal.memberInput.typeText(text);
      await sendNewMessageModal.memberInput.selectMemberByNth(0);
    });

    await h(t).withLog(`Then the selected members count should be 1`, async () => {
      await t.expect(sendNewMessageModal.memberInput.selectedMembers.count).eql(1);
    });

    if (i == 0) {
      await h(t).withLog(`When I Tap the "backspace" on the keypad`, async () => {
        await t.pressKey('backspace');
      })
    } else {
      await h(t).withLog(`When I tap the "delete" icon of the selected contact`, async () => {
        await sendNewMessageModal.memberInput.removeSelectedMember();
      })
    }

    await h(t).withLog(`Then the last selected members should be removed`, async () => {
      await t.expect(sendNewMessageModal.memberInput.selectedMembers.exists).notOk();
    });
  }

  for (let key in searchParams) {
    let text = searchParams[key]
    for (let i of _.range(2)) {
      await sendNewMessageSteps(key, text, i);
    }
  }

});

test(formalName('Check \"Allow members to add other members\" can be turn on/off on the create new team dialog', ['P1', 'JPT-1078', 'Wayne.zhou', 'CreateTeam']), async t => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const adminUser = users[4];
  const anotherUser = users[0];
  const allowToAddUserTeamName = `allowToAdd${uuid()}`
  const notAllowToAddUserTeamName = `notAllowToAdd${uuid()}`
  await h(t).glip(adminUser).init();

  await h(t).withLog(`Given I login Jupiter with ${adminUser.company.number}#${adminUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, adminUser);
    await app.homePage.ensureLoaded();
  });

  const createTeamModal = app.homePage.createTeamModal;
  const teamsSection = app.homePage.messageTab.teamsSection;

  const openCreateTeamModal = async () => {
    await app.homePage.openAddActionMenu();
    await app.homePage.addActionMenu.createTeamEntry.enter();
    await createTeamModal.ensureLoaded();
  }

  await h(t).withLog('When I open create team dialog on AddActionMenu', async () => {
    await openCreateTeamModal();
  });

  const anotherUserName = await h(t).glip(adminUser).getPerson(anotherUser.rcId).then(res => res.data.display_name);
  await h(t).withLog('And I create a team that allow user to add other member', async () => {
    await createTeamModal.typeTeamName(allowToAddUserTeamName);
    await createTeamModal.memberInput.addMember(anotherUserName);
    await createTeamModal.clickCreateButton();
  });

  await h(t).withLog('And I create a team that not allow user to add other member', async () => {
    await openCreateTeamModal();
    await createTeamModal.typeTeamName(notAllowToAddUserTeamName);
    await createTeamModal.memberInput.addMember(anotherUserName);
    await createTeamModal.turnOffMayAddMember();
    await createTeamModal.clickCreateButton();
  });

  await h(t).withLog('Then I should see team created', async () => {
    await teamsSection.expand();
    await t.expect(teamsSection.conversations.withText(`${allowToAddUserTeamName}`).exists).ok();
    await t.expect(teamsSection.conversations.withText(`${notAllowToAddUserTeamName}`).exists).ok();
  });

  await h(t).withLog('When I login in with another user', async () => {
    await app.homePage.openSettingMenu();
    await app.homePage.settingMenu.clickLogout();
    await h(t).directLoginWithUser(SITE_URL, anotherUser);
    await app.homePage.ensureLoaded();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;

  await h(t).withLog('And I open "allowToAddUser.." team profile', async () => {
    await teamsSection.conversationEntryByName(allowToAddUserTeamName).enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
  });

  await h(t).withLog('Then I should see "Add team members" button', async () => {
    await t.expect(app.homePage.profileDialog.addMembersIcon.exists).ok();
  });

  await h(t).withLog('When I open "notAllowToAddUser..." team profile', async () => {
    await app.homePage.profileDialog.clickCloseButton();
    await teamsSection.conversationEntryByName(notAllowToAddUserTeamName).enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
  });

  await h(t).withLog('Then I should not see "Add team members" button', async () => {
    await t.expect(app.homePage.profileDialog.addMembersIcon.exists).notOk();
  });
});

// todo: using api check instead login
test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-121'],
  maintainers: ['ali.naffaa'],
  keywords: ['CreateTeam', 'highCost'],
})('Allow members to post messages" can be turn on or off in the create new team.', async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).glip(loginUser).init();

  const otherUser = users[5];

  const teamNames = [uuid(), uuid()];
  const anotherUserName = await h(t).glip(loginUser).getPersonPartialData("display_name", otherUser.rcId);

  const createTeamModal = app.homePage.createTeamModal;
  const createTeam = async (teamName: string) => {
    await createTeamModal.typeTeamName(teamName);
    await createTeamModal.memberInput.addMember(anotherUserName);
    await createTeamModal.clickCreateButton();
  };

  await h(t).withLog(`Given I login Jupiter with admin: {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And click "Create Team" button on top bar', async () => {
    await app.homePage.openAddActionMenu();
    await app.homePage.addActionMenu.createTeamEntry.enter();

  });

  await h(t).withLog('Then check toggle is On for \'Allow members to post messages\'', async () => {
    await t.expect(createTeamModal.mayPostMessageToggle.checked).ok();
  });

  await h(t).withLog('And create a team', async () => {
    await createTeam(teamNames[0]);
  });

  await h(t).withLog(`When I login Jupiter with member: {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: otherUser.company.number,
      extension: otherUser.extension,
    });
    await app.homePage.logoutThenLoginWithUser(SITE_URL, otherUser);
    await app.homePage.ensureLoaded();
  });

  const teamsSection = app.homePage.messageTab.teamsSection;
  await h(t).withLog('And open a team', async () => {
    await teamsSection.conversationEntryByName(teamNames[0]).enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('Then team member can see input box in the team', async () => {
    await t.expect(conversationPage.messageInputArea.exists).ok();
  });

  await h(t).withLog(`When I login Jupiter with admin: {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await app.homePage.logoutThenLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And click "Create Team" button on top bar', async () => {
    await app.homePage.openAddActionMenu();
    await app.homePage.addActionMenu.createTeamEntry.enter();
  });

  await h(t).withLog('When I turn off the “Allow members to post messages” toggle', async () => {
    await createTeamModal.turnOffMayPostMessage();
  });

  await h(t).withLog('Then the toggle can be turn off', async () => {
    await t.expect(createTeamModal.mayPostMessageToggle().checked).notOk();
  });

  await h(t).withLog('And create a team', async () => {
    await createTeam(teamNames[1]);
  });

  await h(t).withLog(`When I login Jupiter with member: {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: otherUser.company.number,
      extension: otherUser.extension,
    });
    await app.homePage.logoutThenLoginWithUser(SITE_URL, otherUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And open a team', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryByName(teamNames[1]).enter();
  });

  await h(t).withLog('Then team member should not see input box in the team (read only mode)', async () => {
    await conversationPage.shouldBeReadOnly();
  });
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-104'],
  maintainers: ['ali.naffaa'],
  keywords: ['CreateTeam'],
})('Check any characters can be enter into input box of Team Name', async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).platform(loginUser).init();
  await h(t).scenarioHelper.resetProfileAndState(loginUser);
  const createTeamModal = app.homePage.createTeamModal;

  const enterSymbols = async (text: string) => {
    await createTeamModal.ensureLoaded();
    await createTeamModal.typeTeamName(text);
    await createTeamModal.memberInput.typeText(text, { replace: true });
    await createTeamModal.typeTeamDescription(text);
  };

  const checkResult = async (text: string) => {
    await t.expect(createTeamModal.teamNameInput.value).eql(text);
    await t.expect(createTeamModal.memberInput.InputArea.value).eql(text);
    await t.expect(createTeamModal.teamDescriptionInput.value).eql(text);
  };

  await h(t).withLog(`Given I login Jupiter with admin: {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  })

  await h(t).withLog('When I click "Create Team" button on top bar', async () => {
    await app.homePage.openAddActionMenu();
    await app.homePage.addActionMenu.createTeamEntry.enter();
  });

  const specialSymbols = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
  const alphanumeric = faker.random.alphaNumeric(15);
  const asianSymbols = '\u2e80\u2e81\u2ee7\u2f87\u3028\u3226\u3359\u3400\u3598\u3D18\u4027\u4618\u4808\u4CB9';
  await h(t).withLog(`When enter alphanumeric ${alphanumeric} characters into the fields`, async () => {
    await enterSymbols(alphanumeric);
  });

  await h(t).withLog('Then they can be input into fields', async () => {
    await checkResult(alphanumeric);
  });

  await h(t).withLog(`When enter asian ${asianSymbols} characters into the fields`, async () => {
    await enterSymbols(asianSymbols);
  });

  await h(t).withLog('Then they can be input into fields', async () => {
    await checkResult(asianSymbols);
  });

  await h(t).withLog(`When enter specific ${specialSymbols} characters into the fields`, async () => {
    await enterSymbols(specialSymbols);
  });

  await h(t).withLog('Then they can be input into fields', async () => {
    await checkResult(specialSymbols);
  });
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-115'],
  maintainers: ['ali.naffaa'],
  keywords: ['CreateTeam'],
})('Check "Invite Type" can be chosen and save in the create new team', async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const otherUser = users[5];
  const workerUser = users[1];
  await h(t).platform(loginUser).init();
  await h(t).scenarioHelper.resetProfileAndState(loginUser);
  await h(t).scenarioHelper.resetProfileAndState(workerUser);
  const otherUserName = await h(t).glip(loginUser).getPersonPartialData('display_name', otherUser.rcId);
  const createTeamModal = app.homePage.createTeamModal;

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I click "Create Team" button on top bar', async () => {
    await app.homePage.openAddActionMenu();
    await app.homePage.addActionMenu.createTeamEntry.enter();
  });

  await h(t).withLog('Then Toggle is OFF, Private (invite only) is the default option', async () => {
    await createTeamModal.ensureLoaded();
    await t.expect(createTeamModal.isPublicToggle.checked).notOk();
  });

  await h(t).withLog('When I turn on "Public Team (visible to any co-worker)". ', async () => {
    await createTeamModal.turnOnIsPublic();
  });

  await h(t).withLog('Then toggle "Public Team (visible to any co-worker)" can be turn on', async () => {
    await t.expect(createTeamModal.isPublicToggle.checked).ok();
  });
  const teamName = uuid();
  await h(t).withLog(`When I save team ${teamName}`, async () => {
    await createTeamModal.turnOnIsPublic();
    await createTeamModal.typeTeamName(teamName);
    await createTeamModal.memberInput.typeText(otherUserName);
    await createTeamModal.clickCreateButton();
  });

  await h(t).withLog(`And I logout and then login Jupiter with ${workerUser.company.number}#${workerUser.extension}`, async () => {
    await app.homePage.openSettingMenu();
    await app.homePage.settingMenu.clickLogout();
    await h(t).directLoginWithUser(SITE_URL, workerUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I type team name ${teamName} in search input area`, async () => {
    await app.homePage.header.searchBar.clickSelf();
    await app.homePage.searchDialog.typeSearchKeyword(teamName);
  });

  await h(t).withLog(`Then I should find ${teamName} team (visible to any co-worker)`, async () => {
    await t.expect(app.homePage.searchDialog.instantPage.teams.withText(teamName).exists).ok();
  });
});
