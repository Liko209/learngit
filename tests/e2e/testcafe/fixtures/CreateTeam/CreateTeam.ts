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
  const loginUser = h(t).rcData.mainCompany.users[0];

  await h(t).withLog(`When I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  // case 2
  await h(t).withLog('Then I can open add menu in home page', async () => {
    await app.homePage.openAddActionMenu();
  });

  const createTeamModal = app.homePage.createTeamModal;
  await h(t).withLog('Then I can open Create Team in AddActionMenu', async () => {
    await app.homePage.addActionMenu.createTeamEntry.enter();
    await createTeamModal.ensureLoaded();
  });

  await h(t).withLog('Then I input team name exceeded max characters', async () => {
    // Here we type 202 chars, which exceeds max chars of 200
    await createTeamModal.inputRandomTeamName(202);
  });

  await h(t).withLog('Then I can input team name with 200 character', async () => {
    const teamNameValue = await createTeamModal.teamNameInput.value;
    // assert only 1000 chars will be kept
    await t.expect(teamNameValue.length).eql(200);
    await createTeamModal.clickCancelButton();
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

  // case 3
  await h(t).withLog('Then I can open add menu in home page', async () => {
    await app.homePage.openAddActionMenu();
  });

  const createTeamModal = app.homePage.createTeamModal;
  await h(t).withLog('Then I can open Create Team in AddActionMenu', async () => {
    await app.homePage.addActionMenu.createTeamEntry.enter();
    await createTeamModal.ensureLoaded();
  });

  await h(t).withLog('Then I can input team name randomly', async () => {
    await createTeamModal.setTeamName(teamName);
  });

  await h(t).withLog('Then I can set the team as Public', async () => {
    await createTeamModal.clickPublicTeamButton();
  });

  await h(t).withLog('Then Turn off the toggle of "Members may post messages"', async () => {
    await createTeamModal.clickMayPostButton();
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
      await createTeamModal.setTeamName(teamName);
      await createTeamModal.createdTeamButtonShouldBeEnabled();
    }, true);

  },
);

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
      await createTeamModal.inputRandomTeamDescription(1002);
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
    const personData = await h(t).glip(loginUser).getPerson(users[1].rcId);
    name = personData.data.first_name + " " + personData.data.last_name;
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
      await createTeamModal.typeMember(text, { paste: true });
      await t.wait(3e3);
      await createTeamModal.selectMemberByNth(0);
    });

    await h(t).withLog(`Then the selected members count should be 1`, async () => {
      await t.expect(createTeamModal.selectedMembers.count).eql(1);
    });

    if (i == 0) {
      await h(t).withLog(`When I Tap the "backspace" on the keypad`, async () => {
        await t.pressKey('backspace');
      })
    } else {
      await h(t).withLog(`When I tap the "delete" icon of the selected contact`, async () => {
        await createTeamModal.removeSelectedMember();
      })
    }

    await h(t).withLog(`Then the last selected members should be removed`, async () => {
      await t.expect(createTeamModal.selectedMembers.exists).notOk();
    });
  }

  for (let key in searchParams) {
    let text = searchParams[key]
    for (let i of _.range(2)) {
      await createTeamSteps(key, text, i);
    }
  }

  // send new Message entry
  await h(t).withLog('When I click "Send New Message" on AddActionMenu', async () => {
    await createTeamModal.clickCancelButton();
    await app.homePage.openAddActionMenu();
    await app.homePage.addActionMenu.sendNewMessageEntry.enter();
    await createTeamModal.ensureLoaded();
  });

  const sendNewMessageModal = app.homePage.sendNewMessageModal;
  await h(t).withLog('Then the "New Message" dialog should be popup', async () => {
    await t.expect(sendNewMessageModal.exists).ok();
  });

  const sendNewMessageSteps = async (key: string, text: string, i: number) => {
    await h(t).withLog(`When I type ${key}: ${text}, and select the first search user`, async () => {
      await sendNewMessageModal.typeMember(text, { paste: true });
      await t.wait(3e3);
      await sendNewMessageModal.selectMemberByNth(0);
    });

    await h(t).withLog(`Then the selected members count should be 1`, async () => {
      await t.expect(sendNewMessageModal.selectedMembers.count).eql(1);
    });

    if (i == 0) {
      await h(t).withLog(`When I Tap the "backspace" on the keypad`, async () => {
        await t.pressKey('backspace');
      })
    } else {
      await h(t).withLog(`When I tap the "delete" icon of the selected contact`, async () => {
        await sendNewMessageModal.removeSelectedMember();
      })
    }

    await h(t).withLog(`Then the last selected members should be removed`, async () => {
      await t.expect(sendNewMessageModal.selectedMembers.exists).notOk();
    });
  }

  for (let key in searchParams) {
    let text = searchParams[key]
    for (let i of _.range(2)) {
      await sendNewMessageSteps(key, text, i);
    }
  }

});


