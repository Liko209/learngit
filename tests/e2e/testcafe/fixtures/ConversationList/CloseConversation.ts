import * as _ from "lodash";
import { formalName } from '../../libs/filter';
import { v4 as uuid } from 'uuid';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { h } from '../../v2/helpers';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup, ITestMeta } from "../../v2/models";

declare var test: TestFn;
fixture('ConversationList/CloseConversation')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Close current conversation directly, and navigate to blank page (without UMI)', ['JPT-135', 'JPT-130', 'P1', 'CloseConversation', 'ConversationList']),
  async (t: TestController) => {
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4];
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();

    let privateChat = <IGroup>{
      type: 'DirectMessage',
      owner: loginUser,
      members: [loginUser, users[5]],
    }
    let favoriteChat = <IGroup>{
      type: 'Group',
      owner: loginUser,
      members: [loginUser, users[5], users[6]],
    }
    let team = <IGroup>{
      type: 'Team',
      name: uuid(),
      owner: loginUser,
      members: [loginUser],
    }
    let currentGroupId;

    await h(t).withLog('Given I have an extension with 1 private chat and 1 group chat (in favorite) and I team chat', async () => {
      await h(t).scenarioHelper.createTeamsOrChats([privateChat, favoriteChat, team]);
      await h(t).glip(loginUser).favoriteGroups([+favoriteChat.glipId]);
    });

    await h(t).withLog('And send a message to ensure privateChat (then clear umi) in list', async () => {
      await h(t).scenarioHelper.sendTextPost('for appear in section', privateChat, loginUser);
      await h(t).glip(loginUser).clearAllUmi();
    });

    await h(t).withLog('And I set user skip_close_conversation_confirmation is true before login', async () => {
      await h(t).glip(loginUser).skipCloseConversationConfirmation(true);
    });

    const app = new AppRoot(t);
    const directMessagesSection = app.homePage.messageTab.directMessagesSection;
    const favoritesSection = app.homePage.messageTab.favoritesSection;
    const teamsSection = app.homePage.messageTab.teamsSection;
    const privateConversation = directMessagesSection.conversationEntryById(privateChat.glipId);
    const favoriteConversation = favoritesSection.conversationEntryById(favoriteChat.glipId);
    const teamConversation = teamsSection.conversationEntryById(team.glipId);

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('Then I can find the 3 conversations in conversation list', async () => {
      await directMessagesSection.expand();
      await t.expect(privateConversation.exists).ok(privateChat.glipId, { timeout: 10e3 });
      await favoritesSection.expand();
      await t.expect(favoriteConversation.exists).ok(favoriteChat.glipId, { timeout: 10e3 });
      await teamsSection.expand();
      await t.expect(teamConversation.exists).ok(team.glipId, { timeout: 10e3 });
    }, true);

    const groupList = {
      directMessage: privateConversation,
      team: teamConversation,
    };

    for (const key in groupList) {
      const item = groupList[key];
      await h(t).withLog(`When I open a ${key} conversation and then click close conversation button`,
        async () => {
          await item.enter();
          currentGroupId = await app.homePage.messageTab.conversationPage.currentGroupId;
          await item.umi.shouldBeNumber(0);
          await item.openMoreMenu();
          await app.homePage.messageTab.moreMenu.close.enter();
        },
      );

      await h(t).withLog(`Then the ${key} conversation should be remove from conversation list.`,
        async () => {
          await t
            .expect(directMessagesSection.conversationEntryById(currentGroupId).exists)
            .notOk();
        },
      );

      await h(t).withLog('And Content panel should navigate to Blank page', async () => {
        await t.expect(h(t).href).match(/messages$/);
      });
    }

    await h(t).withLog(`When I click more Icon of a favorite conversation with UMI`, async () => {
      await favoriteConversation.openMoreMenu();
    });

    await h(t).withLog('Then the close button should be disabled', async () => {
      await app.homePage.messageTab.moreMenu.close.shouldBeDisabled();
      await t.pressKey('esc');
    });
  },
);

test(formalName('Close other conversation in confirm alert,and still focus on user viewing conversation(without UMI)', ['JPT-137', 'JPT-130', 'P1', 'ConversationList']),
  async (t: TestController) => {
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4];
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();

    let privateChat = <IGroup>{
      type: 'DirectMessage',
      owner: loginUser,
      members: [loginUser, users[5]],
    }

    let team = <IGroup>{
      type: 'Team',
      name: uuid(),
      owner: loginUser,
      members: [loginUser],
    }

    await h(t).withLog('Given I have an extension with 1 private chat A and 1 team chat B', async () => {
      await h(t).scenarioHelper.createTeamsOrChats([privateChat, team]);
    });

    await h(t).withLog('And send a message to ensure privateChat (then clear umi) in list', async () => {
      await h(t).scenarioHelper.sendTextPost('for appear in section', privateChat, loginUser);
      await h(t).glip(loginUser).clearAllUmi();
    });

    let urlBeforeClose, currentGroupId;
    await h(t).withLog('And I set user skip_close_conversation_confirmation is true before login', async () => {
      await h(t).glip(loginUser).skipCloseConversationConfirmation(true);
    });

    const app = new AppRoot(t);
    const directMessageSection = app.homePage.messageTab.directMessagesSection;
    const teamsSection = app.homePage.messageTab.teamsSection;
    const privateConversation = directMessageSection.conversationEntryById(privateChat.glipId);
    const teamConversation = teamsSection.conversationEntryById(team.glipId);


    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('Then I clean UMI in the A and B', async () => {
      await directMessageSection.expand();
      await t.expect(privateConversation.exists).ok(privateChat.glipId, { timeout: 10e3 });
      await privateConversation.enter();
      await teamsSection.expand();
      await t.expect(teamConversation.exists).ok(team.glipId, { timeout: 10e3 });
      await teamConversation.enter();
      currentGroupId = await app.homePage.messageTab.conversationPage.currentGroupId;
    });

    await h(t).withLog('When I open conversation B and close conversation A', async () => {
      await privateConversation.enter();
      urlBeforeClose = await h(t).href;
      await teamConversation.openMoreMenu();
      await app.homePage.messageTab.moreMenu.close.enter();
    });

    await h(t).withLog('Then conversation A should be remove from conversation list.', async () => {
      await t.expect(directMessageSection.conversationEntryById(currentGroupId).exists).notOk();
    });

    await h(t).withLog('And Still focus on conversation B', async () => {
      await t.expect(h(t).href).eql(urlBeforeClose, 'URL is changed');
    });
  },
);

// the detail of dialog
const title = 'Close Conversation?';
const content = 'Closing a conversation will remove it from the left pane, but will not delete the contents.';
const checkboxLabel = "Don't ask me again";
const button = 'Close';

test.meta(<ITestMeta>{
  priority: ['p2'],
  caseIds: ['JPT-134', 'JPT-1370'],
  keywords: ['ConversationList', 'closeConversation'],
  maintainers: ['Potar.he']
})('Close current conversation in confirm alert(without UMI)', async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  let privateChat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, users[5]],
  }
  let team = <IGroup>{
    type: 'Team',
    owner: loginUser,
    name: uuid(),
    members: [loginUser],
  }

  await h(t).withLog('Given I have an extension with 1 private chat A and 1 team chat B', async () => {
    await h(t).scenarioHelper.createTeamsOrChats([privateChat, team]);
  });
  await h(t).withLog('And send a message to ensure privateChat (then clear umi) in list', async () => {
    await h(t).scenarioHelper.sendTextPost('for appear in section', privateChat, loginUser);
    await h(t).glip(loginUser).clearAllUmi();
  });

  await h(t).withLog('And I set user skip_close_conversation_confirmation is False before login', async () => {
    await h(t).glip(loginUser).skipCloseConversationConfirmation(false);
  });

  const app = new AppRoot(t);
  const directMessageSection = app.homePage.messageTab.directMessagesSection;
  const teamsSection = app.homePage.messageTab.teamsSection;
  const privateConversation = directMessageSection.conversationEntryById(privateChat.glipId);
  const teamConversation = teamsSection.conversationEntryById(team.glipId);

  await h(t).withLog(`When I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I open conversation A', async () => {
    await directMessageSection.expand();
    await t.expect(privateConversation.exists).ok(privateChat.glipId, { timeout: 10e3 });
    await privateConversation.enter();
  }, true);

  await h(t).withLog('Then conversation A should not have UMI', async () => {
    await h(t).waitUmiDismiss();  // temporary: need time to wait back-end and front-end sync umi data.
    await privateConversation.umi.shouldBeNumber(0);
  });

  await h(t).withLog("When I click conversation A's close bottom", async () => {
    await privateConversation.openMoreMenu();
    await app.homePage.messageTab.moreMenu.close.enter();
  });

  // JPT-1370
  const dialog = app.homePage.messageTab.closeConversationModal;
  await h(t).withLog('Then a confirm dialog should be popup', async () => {
    await t.expect(dialog.title.withText(title).exists).ok();
    await t.expect(dialog.confirmMessage.withText(content)).ok();
    await t.expect(dialog.dontAskAgainCheckboxLabel.textContent).eql(checkboxLabel);
    await t.expect(dialog.closeButton.withText(button).exists).ok();
  });

  await h(t).withLog(`When I don't select "Don't ask me again" then click "Close Conversation" button`, async () => {
    await dialog.clickCloseButton();
  });

  await h(t).withLog('The popup dialog dissmis and conversation A is unvisible', async () => {
    await t.expect(dialog.exists).notOk();
    await t.expect(privateConversation.exists).notOk();
  });

  await h(t).withLog("When I click conversation B's close buttom", async () => {
    await teamConversation.openMoreMenu();
    await app.homePage.messageTab.moreMenu.close.enter();
  });

  await h(t).withLog('Then should be show the confirm dialog again', async () => {
    await t.expect(dialog.title.withText(title).exists).ok();
    await t.expect(dialog.confirmMessage.withText(content)).ok();
    await t.expect(dialog.dontAskAgainCheckboxLabel.textContent).eql(checkboxLabel);
    await t.expect(dialog.closeButton.withText(button).exists).ok();
  });
});

test(formalName(`Tap ${checkboxLabel} checkbox,then close current conversation in confirm alert(without UMI)`, ['JPT-134', 'JPT-130', 'P2', 'ConversationList']), async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  let privateChat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, users[5]],
  }

  let team = <IGroup>{
    type: 'Team',
    owner: loginUser,
    name: uuid(),
    members: [loginUser],
  }

  await h(t).withLog('Given I have an extension with 1 private chat A and 1 team chat B', async () => {
    await h(t).scenarioHelper.createTeamsOrChats([privateChat, team]);
  });

  await h(t).withLog('And send a message to ensure privateChat (then clear umi) in list', async () => {
    await h(t).scenarioHelper.sendTextPost('for appear in section', privateChat, loginUser);
    await h(t).glip(loginUser).clearAllUmi();
  });

  await h(t).withLog('And I set user skip_close_conversation_confirmation is False before login', async () => {
    await h(t).glip(loginUser).skipCloseConversationConfirmation(false);
  },
  );

  const app = new AppRoot(t);
  const directMessagesSection = app.homePage.messageTab.directMessagesSection;
  const teamsSection = app.homePage.messageTab.teamsSection;
  const privateConversation = directMessagesSection.conversationEntryById(privateChat.glipId);
  const teamConversation = teamsSection.conversationEntryById(team.glipId);
  const closeConversationDialog = app.homePage.messageTab.closeConversationModal;

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I open conversation A ', async () => {
    await directMessagesSection.expand();
    await t.expect(privateConversation.exists).ok(privateChat.glipId, { timeout: 10e3 });
    await privateConversation.enter();
  }, true);

  await h(t).withLog('Then conversation A should not have UMI', async () => {
    await h(t).waitUmiDismiss();  // temporary: need time to wait back-end and front-end sync umi data.
    await privateConversation.umi.shouldBeNumber(0);
  });

  await h(t).withLog("When I click conversation A's close buttom", async () => {
    await privateConversation.openMoreMenu();
    await app.homePage.messageTab.moreMenu.close.enter();
  });

  await h(t).withLog('Then a confirm dialog should be popup', async () => {
    await t.expect(closeConversationDialog.title.withText(title).exists).ok();
    await t.expect(closeConversationDialog.confirmMessage.withText(content)).ok();
    await t.expect(closeConversationDialog.dontAskAgainCheckboxLabel.textContent).eql(checkboxLabel);
    await t.expect(closeConversationDialog.closeButton.find('span').withText(button).exists).ok();
  });

  await h(t).withLog(`When I select "Don't ask me again" then click "Close Conversation" button`, async () => {
    await closeConversationDialog.toggleDontAskAgain();
    await closeConversationDialog.clickCloseButton();
  });

  await h(t).withLog('The popup dialog disappear and conversation A should be closed', async () => {
    await t.expect(closeConversationDialog.exists).notOk();
    await t.expect(privateConversation.exists).notOk();
  });

  await h(t).withLog("When I click conversation B's close buttom", async () => {
    await teamConversation.openMoreMenu();
    await app.homePage.messageTab.moreMenu.close.enter();
  });

  await h(t).withLog('Then should not show  the confirm dialog agin', async () => {
    await t.expect(closeConversationDialog.exists).notOk();
  });

  await h(t).withLog('and conversation B should be closed', async () => {
    await t.expect(teamConversation.exists).notOk();
  });
});

test(formalName('No close button in conversation with UMI', ['JPT-114', 'P2', 'ConversationList']), async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[1];
  const otherUser = users[0];

  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  await h(t).platform(otherUser).init();
  const meChatId = await h(t).glip(loginUser).getPersonPartialData('me_group_id');

  let privateChat = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, otherUser]
  }
  let favoriteChat = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, otherUser, users[6]]
  }
  let team = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  await h(t).withLog('Given I have an extension with 1 private chat, 2 team chat, and 1 group team(in favorite)', async () => {
    await h(t).scenarioHelper.createTeamsOrChats([privateChat, favoriteChat, team]);
    await h(t).glip(loginUser).favoriteGroups([+favoriteChat.glipId, +meChatId]);
  });

  await h(t).withLog('And send a message to ensure privateChat (then clear umi) in list', async () => {
    await h(t).scenarioHelper.sendTextPost('for appear in section', privateChat, loginUser);
    await h(t).glip(loginUser).clearAllUmi();
  });

  const app = new AppRoot(t);
  const favoritesSection = app.homePage.messageTab.favoritesSection;
  const directMessagesSection = app.homePage.messageTab.directMessagesSection;
  const teamsSection = app.homePage.messageTab.teamsSection;

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And enter me chat conversation', async () => {
    await favoritesSection.conversationEntryById(meChatId).enter();
  });

  await h(t).withLog('And other user send post to each conversation', async () => {
    const umiGroupIds = [favoriteChat.glipId, privateChat.glipId, team.glipId];
    for (const id of umiGroupIds) {
      await h(t).platform(otherUser).createPost(
        { text: `${uuid()} ![:Person](${loginUser.rcId})` },
        id,
      );
    }
  });

  const favoriteItem = favoritesSection.conversationEntryById(favoriteChat.glipId);
  const directMessageItem = directMessagesSection.conversationEntryById(privateChat.glipId);
  const teamItem = teamsSection.conversationEntryById(team.glipId);
  await h(t).withLog('Then I can find conversation with UMI in favorites/DM/teams section', async () => {
    await favoritesSection.expand();
    await favoriteItem.umi.shouldBeNumber(1);
    await directMessagesSection.expand();
    await directMessageItem.umi.shouldBeNumber(1);
    await teamsSection.expand();
    await teamItem.umi.shouldBeNumber(1);
  });

  const groupList = {
    favorite: favoriteItem,
    directMessage: directMessageItem,
    team: teamItem,
  };
  const closeButton = app.homePage.messageTab.moreMenu.close;
  for (const key in groupList) {
    const item = groupList[key];
    await h(t).withLog(`When I click more Icon of a ${key} conversation with UMI`, async () => {
      await item.openMoreMenu();
    });

    await h(t).withLog('Then the close button should not be show', async () => {
      await closeButton.shouldBeDisabled();
      await t.pressKey('esc');
    });
  }
});


test(formalName('JPT-138 Can display conversation history when receiving messages from the closed conversation.', ['JPT-138', 'P2', 'ConversationList', 'Mia.Cai']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[7];
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();
    const otherUser = users[5];
    await h(t).platform(otherUser).init();

    const directMessagesSection = app.homePage.messageTab.directMessagesSection;
    const teamsSection = app.homePage.messageTab.teamsSection;
    const conversationPage = app.homePage.messageTab.conversationPage;
    const posts = [`post1:${uuid()}`, `post2:${uuid()}`];

    let privateChat = <IGroup>{
      type: "DirectMessage",
      owner: loginUser,
      members: [loginUser, otherUser]
    }
    let favoriteChat = <IGroup>{
      type: "DirectMessage",
      owner: loginUser,
      members: [loginUser, otherUser, users[6]]
    }
    let team = <IGroup>{
      type: 'Team',
      name: uuid(),
      owner: loginUser,
      members: [loginUser, otherUser]
    }

    await h(t).withLog('Given I have an extension with 1 dm and I team', async () => {
      await h(t).scenarioHelper.createTeamsOrChats([privateChat, favoriteChat, team]);
      await h(t).glip(loginUser).favoriteGroups([+favoriteChat.glipId]);
    });


    await h(t).withLog('And send 2 messages to each conversation', async () => {
      for (let i of _.range(posts.length)) {
        await h(t).platform(otherUser).sendTextPost(posts[i], privateChat.glipId);
        await h(t).platform(otherUser).sendTextPost(posts[i], team.glipId);
      }
    });

    await h(t).withLog('And Clear all UMI for 2 conversations', async () => {
      await h(t).glip(loginUser).resetProfileAndState();
    });

    await h(t).withLog('And I set user skip_close_conversation_confirmation is true before login', async () => {
      await h(t).glip(loginUser).skipCloseConversationConfirmation(true);
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    }, true);


    const privateConversation = directMessagesSection.conversationEntryById(privateChat.glipId);
    const teamChat = teamsSection.conversationEntryById(team.glipId);

    await h(t).withLog('Then I can find the 2 conversations in conversation list', async () => {
      await t.expect(privateConversation.exists).ok(privateChat.glipId, { timeout: 10e3 });
      await t.expect(teamChat.exists).ok(team.glipId, { timeout: 10e3 });
    }, true);

    await h(t).withLog('When closed 2 conversations', async () => {
      await privateConversation.openMoreMenu();
      await app.homePage.messageTab.moreMenu.close.enter();
      await teamChat.openMoreMenu();
      await app.homePage.messageTab.moreMenu.close.enter();
    }, true);

    await h(t).withLog('And send one message to 2 conversations', async () => {
      const new_post = `new post:${uuid()}`;
      posts.push(new_post);
      await h(t).platform(otherUser).sendTextPost(new_post, privateChat.glipId);
      await h(t).platform(otherUser).sendTextPost(new_post, team.glipId);
    });

    await h(t).withLog(`Then I can find the both conversations in conversation list`, async () => {
      await t.expect(privateConversation.exists).ok();
      await t.expect(teamChat.exists).ok();
    });

    await h(t).withLog(`When I open the direct messages conversation`, async () => {
      await privateConversation.enter();
    });

    await h(t).withLog('Then history posts can be displayed in conversations stream', async () => {
      await conversationPage.historyPostsDisplayedInOrder(posts);
    }, true);

    await h(t).withLog(`When I open the team conversation`, async () => {
      await teamChat.enter();
    });

    await h(t).withLog('Then history posts can be displayed in order in conversations stream', async () => {
      await conversationPage.historyPostsDisplayedInOrder(posts);
    }, true);

  });

test(formalName('Check can cancel confirm dialog when user first time use close conversation function', ['JPT-1360', 'P2', 'ConversationList', 'Potar.He']),
  async (t: TestController) => {
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[7];

    let team = <IGroup>{
      type: 'Team',
      name: uuid(),
      owner: loginUser,
      members: [loginUser]
    }

    await h(t).withLog(`Given I have an extension with one new team named: ${team.name}`, async () => {
      await h(t).scenarioHelper.createTeam(team);
    });

    await h(t).withLog('And I set user skip_close_conversation_confirmation is false before login', async () => {
      await h(t).glip(loginUser).init();
      await h(t).glip(loginUser).skipCloseConversationConfirmation(false);
    });

    const app = new AppRoot(t);
    await h(t).withLog(`And I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    const teamEntry = app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId);

    await h(t).withLog('When I open close conversation dialog of the team', async () => {
      await app.homePage.messageTab.teamsSection.expand();
      await teamEntry.openMoreMenu();
      await app.homePage.messageTab.moreMenu.close.enter();
    });

    const closeConversationDialog = app.homePage.messageTab.closeConversationModal;
    await h(t).withLog('Then the close conversation dialog should be popup', async () => {
      await t.expect(closeConversationDialog.exists).ok();
    }, true);

    await h(t).withLog(`When I select "Don't ask me again" then click Cancel button`, async () => {
      await closeConversationDialog.toggleDontAskAgain();
      await closeConversationDialog.clickCancelButton();
    });

    await h(t).withLog(`Then the confirm dialog should dismiss and the team still exist in team section`, async () => {
      await t.expect(closeConversationDialog.exists).notOk();
      await t.expect(teamEntry.exists).ok();
    });

    await h(t).withLog(`When I open close conversation dialog of the team again`, async () => {
      await teamEntry.openMoreMenu();
      await app.homePage.messageTab.moreMenu.close.enter();
    });

    await h(t).withLog('Then the close conversation dialog should be popup', async () => {
      await t.expect(closeConversationDialog.exists).ok();
    }, true);

    await h(t).withLog(`When I click Cancel button`, async () => {
      await closeConversationDialog.clickCancelButton();
    });;

    await h(t).withLog(`Then the confirm dialog should dismiss and the team still exist in team section`, async () => {
      await t.expect(closeConversationDialog.exists).notOk();
      await t.expect(teamEntry.exists).ok();
    });
  });



test.meta(<ITestMeta>{
  caseIds: ['JPT-318'], priority: ['P2'], keywords: ['ConversationList', 'FavoriteSection', 'closeConversation'], maintainers: ['potar.he']
})('Expand & Collapse', async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[7];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  const chat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, users[5]]
  }
  const favoriteChat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, users[6]]
  }
  const team = <IGroup>{
    type: 'Team',
    members: [loginUser],
    owner: loginUser,
    name: uuid()
  }

  await h(t).withLog('Given I have an extension with 2 private chats and 1 team', async () => {
    await h(t).scenarioHelper.createTeamsOrChats([chat, favoriteChat, team]);
  });

  await h(t).withLog('And there is a conversation in each (Favorites/DirectMessages/Teams) section ', async () => {
    await h(t).glip(loginUser).favoriteGroups(favoriteChat.glipId);
  });

  const app = new AppRoot(t);
  const favoritesSection = app.homePage.messageTab.favoritesSection;
  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I open more menu on a conversation in favorites section', async () => {
    await app.homePage.messageTab.favoritesSection.nthConversationEntry(0).openMoreMenu();
  });

  const moreMenu = app.homePage.messageTab.moreMenu;
  await h(t).withLog('Then Close option should not display, only show remove favorites option', async () => {
    await moreMenu.close.shouldBeDisabled();
    await moreMenu.favoriteToggler.shouldBeName('Remove from Favorites');
  });

  await h(t).withLog('When I open more menu on a conversation in DirectMessages section', async () => {
    await moreMenu.quitByPressEsc();
    await app.homePage.messageTab.directMessagesSection.nthConversationEntry(0).openMoreMenu();
  });

  await h(t).withLog('Then Close option should display', async () => {
    await moreMenu.close.shouldBeEnabled();
  });

  await h(t).withLog('When I open more menu on a conversation in Teams section', async () => {
    await moreMenu.quitByPressEsc();
    await app.homePage.messageTab.teamsSection.nthConversationEntry(0).openMoreMenu();
  });

  await h(t).withLog('Then Close option should display', async () => {
    await moreMenu.close.shouldBeEnabled();
  });
});
