import { formalName } from '../../libs/filter';
import { v4 as uuid } from 'uuid';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { h } from '../../v2/helpers';
import { SITE_URL, BrandTire } from '../../config';

declare var test: TestFn;
fixture('CloseConversation')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Close current conversation directly, and navigate to blank page (without UMI)',
  ['JPT-135', 'JPT-130', 'P1', 'ConversationList']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    user.sdk = await h(t).getSdk(user);

    const directMessagesSection =
      app.homePage.messageTab.directMessagesSection;
    const favoritesSection = app.homePage.messageTab.favoritesSection;
    const teamsSection = app.homePage.messageTab.teamsSection;

    let pvtChatId, favChatId, teamId, currentGroupId;
    await h(t).withLog('Given I have an extension with 1 private chat and 1 group chat and I team chat',
      async () => {
        pvtChatId = (await user.sdk.platform.createGroup({
          type: 'PrivateChat',
          members: [user.rcId, users[5].rcId],
        })).data.id;
        favChatId = (await user.sdk.platform.createGroup({
          type: 'Group',
          members: [user.rcId, users[5].rcId, users[6].rcId],
        })).data.id;
        teamId = (await user.sdk.platform.createGroup({
          isPublic: true,
          name: uuid(),
          type: 'Team',
          members: [user.rcId, users[5].rcId, users[6].rcId],
        })).data.id;
      },
    );

    await h(t).withLog('All conversations should not be hidden before login', async () => {
      await user.sdk.glip.showGroups(user.rcId, [pvtChatId, favChatId, teamId]);
      await user.sdk.glip.favoriteGroups(user.rcId, [+favChatId]);
    })
    await h(t).withLog('And I clean all UMI before login', async () => {
      await user.sdk.glip.clearAllUmi();
    });

    await h(t).withLog('And I set user skip_close_conversation_confirmation is true before login',
      async () => {
        await user.sdk.glip.skipCloseConversationConfirmation(user.rcId, true);
      },
    );

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );

    const pvtChat = directMessagesSection.conversationEntryById(pvtChatId);
    const favChat = favoritesSection.conversationEntryById(favChatId);
    const teamChat = teamsSection.conversationEntryById(teamId);

    await h(t).withLog('Then I can find the 3 conversations in conversation list', async () => {
      await directMessagesSection.expand();
      await t.expect(pvtChat.exists).ok(pvtChatId, { timeout: 10e3 });
      await favoritesSection.expand();
      await t.expect(favChat.exists).ok(favChatId, { timeout: 10e3 });
      await teamsSection.expand();
      await t.expect(teamChat.exists).ok(teamId, { timeout: 10e3 });
    }, true);

    const groupList = {
      directMessage: pvtChat,
      team: teamChat,
    };

    for (const key in groupList) {
      const item = groupList[key];
      await h(t).withLog(`When I open a ${key} conversation and then click close conversation button`,
        async () => {
          await item.enter();
          currentGroupId = await app.homePage.messageTab.conversationPage.currentGroupId;
          await item.expectUmi(0);
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
        await t.wait(2e3);
        const open_url = await h(t).href;
        const str = open_url.toString().split('messages');
        await t.expect(str.length).eql(2).expect(str[1]).eql('');
      },
      );
    }

    await h(t).withLog(`When I click more Icon of a favorite conversation with UMI`, async () => {
      await favChat.openMoreMenu();
    });

    await h(t).withLog('Then the close button should not be show', async () => {
      await t.expect(app.homePage.messageTab.moreMenu.close.exists).notOk();
      await t.pressKey('esc');
    },
    );
  },
);

test(formalName('Close other conversation in confirm alert,and still focus on user veiwing conversation(without UMI)',
  ['JPT-137', 'JPT-130', 'P1', 'ConversationList']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    user.sdk = await h(t).getSdk(user);

    const dmSection = app.homePage.messageTab.directMessagesSection;
    const teamsSection = app.homePage.messageTab.teamsSection;

    let pvtChatId, teamId, urlBeforeClose, urlAfterClose, currentGroupId;
    await h(t).withLog('Given I have an extension with 1 private chat A and 1 team chat B', async () => {
      pvtChatId = (await user.sdk.platform.createGroup({
        type: 'PrivateChat',
        members: [user.rcId, users[5].rcId],
      })).data.id;
      teamId = (await user.sdk.platform.createGroup({
        isPublic: true,
        name: uuid(),
        type: 'Team',
        members: [user.rcId, users[5].rcId, users[6].rcId],
      })).data.id;
    });

    await h(t).withLog('All conversations should not be hidden before login', async () => {
      await user.sdk.glip.showGroups(user.rcId, [pvtChatId, teamId]);
      await user.sdk.glip.clearFavoriteGroups();
    });

    await h(t).withLog('And I set user skip_close_conversation_confirmation is true before login',
      async () => {
        await user.sdk.glip.skipCloseConversationConfirmation(user.rcId, true);
      },
    );

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );

    const pvtChat = dmSection.conversationEntryById(pvtChatId);
    const team = teamsSection.conversationEntryById(teamId);

    await h(t).withLog('Then I clean UMI in the A and B', async () => {
      await dmSection.expand();
      await t.expect(pvtChat.exists).ok(pvtChatId, { timeout: 10e3 });
      await pvtChat.enter();
      await teamsSection.expand();
      await t.expect(team.exists).ok(teamId, { timeout: 10e3 });
      await team.enter();
      currentGroupId = await app.homePage.messageTab.conversationPage.currentGroupId;
    });

    await h(t).withLog('When I open conversation B and close conversation A', async () => {
      await pvtChat.enter();
      urlBeforeClose = await h(t).href;
      await team.openMoreMenu();
      await app.homePage.messageTab.moreMenu.close.enter();
    });

    await h(t).withLog('Then  conversation A should be remove from conversation list.',
      async () => {
        await t.wait(2e3);
        await t
          .expect(dmSection.conversationEntryById(currentGroupId).exists)
          .notOk();
      },
    );

    await h(t).withLog('And Still focus on conversation B', async () => {
      await t.wait(2e3);
      urlAfterClose = await h(t).href;
      await t.expect(urlAfterClose).eql(urlBeforeClose, 'URL is changed');
    });
  },
);

// the detail of dialog
const title = 'Close Conversation?';
const content =
  'Closing a conversation will remove it from the left pane, but will not delete the contents.';
const checkboxLabel = "Don't ask me again";
const button = 'Close Conversation';

test(formalName('Close current conversation in confirm alert(without UMI)',
  ['JPT-134', 'JPT-130', 'P2', 'ConversationList']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    user.sdk = await h(t).getSdk(user);

    const dmSection = app.homePage.messageTab.directMessagesSection;
    const teamsSection = app.homePage.messageTab.teamsSection;

    let pvtChatId, teamId;
    await h(t).withLog('Given I have an extension with 1 private chat A and 1 team chat B',
      async () => {
        pvtChatId = (await user.sdk.platform.createGroup({
          type: 'PrivateChat',
          members: [user.rcId, users[5].rcId],
        })).data.id;
        teamId = (await user.sdk.platform.createGroup({
          isPublic: true,
          name: uuid(),
          type: 'Team',
          members: [user.rcId, users[5].rcId, users[6].rcId],
        })).data.id;
      },
    );

    await h(t).withLog('All conversations should not be hidden before login', async () => {
      await user.sdk.glip.showGroups(user.rcId, [pvtChatId, teamId]);
      await user.sdk.glip.clearFavoriteGroups();
    });

    await h(t).withLog('And I clean all UMI before login',
      async () => {
        await user.sdk.glip.clearAllUmi();
      },
    );

    await h(t).withLog('And I set user skip_close_conversation_confirmation is False before login',
      async () => {
        await user.sdk.glip.skipCloseConversationConfirmation(user.rcId, false);
      },
    );

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );

    const pvtChat = dmSection.conversationEntryById(pvtChatId);
    const team = teamsSection.conversationEntryById(teamId);

    await h(t).withLog('And I open conversation A', async () => {
      await dmSection.expand();
      await t.expect(pvtChat.exists).ok(pvtChatId, { timeout: 10e3 });
      await pvtChat.enter();
    }, true);

    await h(t).withLog('Then conversation A should not have UMI', async () => {
      await h(t).waitUmiDismiss();  // temporary: need time to wait back-end and front-end sync umi data.
      await pvtChat.expectUmi(0);
    });

    await h(t).withLog("When I click conversation A's close buttom", async () => {
      await pvtChat.openMoreMenu();
      await app.homePage.messageTab.moreMenu.close.enter();
    });

    const dialog = app.homePage.messageTab.closeConversationModal;
    await h(t).withLog('Then a confirm dialog should be popup', async () => {
      await t.expect(dialog.getSelector('h2').withText(title).exists).ok();
      await t.expect(dialog.getSelector('p').withText(content)).ok();
      await t
        .expect(dialog.dontAskAgainCheckbox.parent('label')
          .find('span').withText(checkboxLabel).exists)
        .ok();
      await t.expect(dialog.confirmButton.find('span').withText(button).exists).ok();
    });

    await h(t).withLog(`When I don't select "Don't ask me again" then click "Close Conversation" button`,
      async () => {
        await dialog.confirm();
      },
    );

    await h(t).withLog('The popup dialog dissmis and conversation A is unvisible',
      async () => {
        await t.expect(dialog.exists).notOk();
        await t.expect(pvtChat.exists).notOk();
      },
    );

    await h(t).withLog("When I click conversation B's close buttom", async () => {
      await team.openMoreMenu();
      await app.homePage.messageTab.moreMenu.close.enter();
    },
    );

    await h(t).withLog('Then should be show the confirm dialog again',
      async () => {
        await t.expect(dialog.getSelector('h2').withText(title).exists).ok();
        await t.expect(dialog.getSelector('p').withText(content)).ok();
        await t
          .expect(dialog.dontAskAgainCheckbox.parent('label')
            .find('span').withText(checkboxLabel).exists)
          .ok();
        await t.expect(dialog.confirmButton.find('span').withText(button).exists).ok();
      },
    );
  },
);

test(formalName(`Tap ${checkboxLabel} checkbox,then close current conversation in confirm alert(without UMI)`,
  ['JPT-134', 'JPT-130', 'P2', 'ConversationList']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    user.sdk = await h(t).getSdk(user);

    const dmSection = app.homePage.messageTab.directMessagesSection;
    const teamsSection = app.homePage.messageTab.teamsSection;

    let pvtChatId, teamId;
    await h(t).withLog('Given I have an extension with 1 private chat A and 1 team chat B',
      async () => {
        pvtChatId = (await user.sdk.platform.createGroup({
          type: 'PrivateChat',
          members: [user.rcId, users[5].rcId],
        })).data.id;
        teamId = (await user.sdk.platform.createGroup({
          isPublic: true,
          name: uuid(),
          type: 'Team',
          members: [user.rcId, users[5].rcId, users[6].rcId],
        })).data.id;
      },
    );

    await h(t).withLog('All conversations should not be hidden before login', async () => {
      await user.sdk.glip.showGroups(user.rcId, [pvtChatId, teamId]);
      await user.sdk.glip.clearFavoriteGroups();
    });

    await h(t).withLog('And I clean all UMI before login',
      async () => {
        await user.sdk.glip.clearAllUmi();
      },
    );

    await h(t).withLog('And I set user skip_close_conversation_confirmation is False before login',
      async () => {
        await user.sdk.glip.skipCloseConversationConfirmation(user.rcId, false);
      },
    );

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );

    const pvtChat = dmSection.conversationEntryById(pvtChatId);
    const team = teamsSection.conversationEntryById(teamId);
    const dialog = app.homePage.messageTab.closeConversationModal;

    await h(t).withLog('And I open conversation A ', async () => {
      await dmSection.expand();
      await t.expect(pvtChat.exists).ok(pvtChatId, { timeout: 10e3 });
      await pvtChat.enter();
    }, true);

    await h(t).withLog('Then conversation A should not have UMI', async () => {
      await h(t).waitUmiDismiss();  // temporary: need time to wait back-end and front-end sync umi data.
      await pvtChat.expectUmi(0);
    });

    await h(t).withLog("When I click conversation A's close buttom", async () => {
      await pvtChat.openMoreMenu();
      await app.homePage.messageTab.moreMenu.close.enter();
    });

    await h(t).withLog('Then a confirm dialog should be popup', async () => {
      await t.expect(dialog.getSelector('h2').withText(title).exists).ok();
      await t.expect(dialog.getSelector('p').withText(content)).ok();
      await t
        .expect(dialog.dontAskAgainCheckbox.parent('label').find('span').withText(checkboxLabel).exists)
        .ok();
      await t
        .expect(dialog.confirmButton.find('span').withText(button).exists)
        .ok();
    });

    await h(t).withLog(`When I select "Don't ask me again" then click "Close Conversation" button`,
      async () => {
        await dialog.toggleDontAskAgain();
        await dialog.confirm();
      },
    );

    await h(t).withLog('The popup dialog disappear and conversation A should be closed',
      async () => {
        await t.expect(dialog.exists).notOk();
        await t.expect(pvtChat.exists).notOk();
      },
    );

    await h(t).withLog("When I click conversation B's close buttom", async () => {
      await team.openMoreMenu();
      await app.homePage.messageTab.moreMenu.close.enter();
    });

    await h(t).withLog('Then should not show  the confirm dialog agin', async () => {
      await t.expect(dialog.exists).notOk();
    });

    await h(t).withLog('and conversation B should be closed', async () => {
      await t.expect(team.exists).notOk();
    });
  },
);

test(formalName('No close button in conversation with UMI', ['JPT-114', 'P2', 'ConversationList']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[4];
    await h(t).resetGlipAccount(user);
    user.sdk = await h(t).getSdk(user);

    const favoritesSection = app.homePage.messageTab.favoritesSection;
    const directMessagesSection =
      app.homePage.messageTab.directMessagesSection;
    const teamsSection = app.homePage.messageTab.teamsSection;

    let favGroupId, pvtChatId, teamId1, teamId2;
    await h(t).withLog('Given I have an extension with 1 private chat, 2 team chat, and 1 group team',
      async () => {
        pvtChatId = (await user.sdk.platform.createGroup({
          type: 'PrivateChat',
          members: [user.rcId, users[5].rcId],
        })).data.id;
        favGroupId = (await user.sdk.platform.createGroup({
          type: 'Group',
          members: [user.rcId, users[5].rcId, users[6].rcId],
        })).data.id;
        teamId1 = (await user.sdk.platform.createGroup({
          isPublic: true,
          name: `Team ${uuid()}`,
          type: 'Team',
          members: [user.rcId, users[5].rcId, users[6].rcId],
        })).data.id;
        teamId2 = (await user.sdk.platform.createGroup({
          isPublic: true,
          name: `Team ${uuid()}`,
          type: 'Team',
          members: [user.rcId, users[5].rcId, users[6].rcId],
        })).data.id;
      },
    );

    await h(t).withLog('All conversations should not be hidden before login', async () => {
      await user.sdk.glip.favoriteGroups(user.rcId, [+favGroupId]);
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );

    await h(t).withLog('And other user send post to each conversation', async () => {
      await teamsSection.expand();
      await teamsSection.conversationEntryById(teamId2).enter();
      const user5Platform = await h(t).getPlatform(users[5]);
      const umiGroupIds = [favGroupId, pvtChatId, teamId1];
      for (const id of umiGroupIds) {
        await user5Platform.createPost(
          { text: `${uuid()} ![:Person](${user.rcId})` },
          id,
        );
      }
    });

    let favoriteItem, directMessageItem, teamItem;
    await h(t).withLog('Then I can find conversation with UMI in favorites/DM/teams section',
      async () => {
        await t.wait(3e3);
        await favoritesSection.expand();
        favoriteItem = favoritesSection.conversationEntryById(favGroupId);
        await t.expect(await favoriteItem.getUmi()).eql(1);
        await directMessagesSection.expand();
        directMessageItem = directMessagesSection.conversationEntryById(
          pvtChatId,
        );
        await t.expect(await directMessageItem.getUmi()).eql(1);
        await teamsSection.expand();
        teamItem = teamsSection.conversationEntryById(teamId1);
        await t.expect(await teamItem.getUmi()).eql(1);
      },
    );

    const groupList = {
      favorite: favoriteItem,
      directMessage: directMessageItem,
      team: teamItem,
    };
    const closeButton = app.homePage.messageTab.moreMenu.close;
    for (const key in groupList) {
      const item = groupList[key];
      await h(t).withLog(`When I click more Icon of a ${key} conversation with UMI`,
        async () => {
          await item.openMoreMenu();
        },
      );

      await h(t).withLog('Then the close button should not be show', async () => {
        await t.expect(closeButton.exists).notOk();
        await t.pressKey('esc');
      });
    }
  },
);
