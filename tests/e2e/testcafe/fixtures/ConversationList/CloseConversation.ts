import { formalName } from '../../libs/filter';
import { v4 as uuid } from 'uuid'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { h } from '../../v2/helpers';
import { SITE_URL } from '../../config';

declare var test: TestFn;
fixture('CloseConversation')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());


test(formalName('Close current conversation directly, and navigate to blank page (without UMI)',
  ['JPT-135', 'JPT-130', 'P1', 'ConversationList']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    user.sdk = await h(t).getSdk(user);

    const directMessagesSection = app.homePage.messagePanel.directMessagesSection;
    const favoritesSection = app.homePage.messagePanel.favoritesSection;
    const teamsSection = app.homePage.messagePanel.teamsSection;

    let pvtChatId, favChatId, teamId, currentGroupId;
    await h(t).withLog(
      'Given I have an extension with 1 private chat and 1 group chat and I team chat',
      async () => {
        pvtChatId = (await user.sdk.platform.createGroup({
          type: 'PrivateChat',
          members: [user.rcId, users[5].rcId],
        })).data.id;
        favChatId = (await user.sdk.platform.createGroup({
          type: 'Group',
          members: [user.rcId, users[5].rcId, users[6].rcId],
        })).data.id;;
        teamId = (await user.sdk.platform.createGroup({
          isPublic: true,
          name: uuid(),
          type: 'Team',
          members: [user.rcId, users[5].rcId, users[6].rcId],
        })).data.id;
      },
    );

    await h(t).withLog('All conversations should not be hidden before login', async () => {
      await user.sdk.glip.updateProfile(user.rcId, {
        [`hide_group_${pvtChatId}`]: false,
        [`hide_group_${favChatId}`]: false,
        [`hide_group_${teamId}`]: false,
        favorite_group_ids: [+favChatId]
      });
    });

    await h(t).withLog('And I set user skip_close_conversation_confirmation is true before login', async () => {
      await user.sdk.glip.updateProfile(user.rcId, {
        skip_close_conversation_confirmation: true
      });
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      }
    );

    const pvtChat = directMessagesSection.conversationByIdEntry(pvtChatId);
    const favChat = favoritesSection.conversationByIdEntry(favChatId);
    const teamChat = teamsSection.conversationByIdEntry(teamId);


    await h(t).withLog(`Then I can find the 3 conversations in conversation list`, async () => {
      await directMessagesSection.expand();
      await t.expect(pvtChat.exists).ok(pvtChatId, { timeout: 10e3 });;
      await favoritesSection.expand();
      await t.expect(favChat.exists).ok(favChatId, { timeout: 10e3 });
      await teamsSection.expand();
      await t.expect(teamChat.exists).ok(teamId, { timeout: 10e3 });
    });

    const groupList = {
      favorite: favChat,
      directMessage: pvtChat,
      team: teamChat
    }

    for (let key in groupList) {
      const item = groupList[key];
      await h(t).withLog(`When I open a ${key} conversation and then click close conversation button`, async () => {
        await item.enter();
        currentGroupId = await app.homePage.messagePanel.conversationPage.self.getAttribute('data-group-id');
        await item.waitUntilUmiNotExist();
        await item.openMoreMenu();
        await app.homePage.messagePanel.moreMenu.close.enter();
      });

      await h(t).withLog(`Then the ${key} conversation should be remove from conversation list.`, async () => {
        await t.expect(directMessagesSection.conversationByIdEntry(currentGroupId).exists).notOk();
      });

      await h(t).withLog(`And Content panel should navigate to Blank page`, async () => {
        await t.wait(2e3)
        const open_url = await h(t).href;;
        const str = open_url.toString().split('messages');
        await t.expect(str.length).eql(2)
          .expect(str[1]).eql('');
        await t.expect(app.homePage.messagePanel.conversationPage.messageInputArea.exists).notOk()
      })
    }
  },
);

test(formalName('Close other conversation in confirm alert,and still focus on user veiwing conversation(without UMI)',
  ['JPT-137', 'JPT-130', 'P1', 'ConversationList']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    user.sdk = await h(t).getSdk(user);

    const dmSection = app.homePage.messagePanel.directMessagesSection;
    const teamsSection = app.homePage.messagePanel.teamsSection;

    let pvtChatId, teamId, urlBeforeClose, urlAfterClose, currentGroupId;
    await h(t).withLog(
      'Given I have an extension with 1 private chat A and 1 team chat B',
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
      await user.sdk.glip.updateProfile(user.rcId, {
        [`hide_group_${pvtChatId}`]: false,
        favorite_group_ids: [],
      });
    });

    await h(t).withLog('And I set user skip_close_conversation_confirmation is true before login', async () => {
      await user.sdk.glip.updateProfile(user.rcId, {
        skip_close_conversation_confirmation: true
      });
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      }
    );

    const pvtChat = dmSection.conversationByIdEntry(pvtChatId);
    const team = teamsSection.conversationByIdEntry(teamId);

    await h(t).withLog(`Then I clean UMI in the A and B`, async () => {
      await dmSection.expand();
      await t.expect(pvtChat.exists).ok(pvtChatId, { timeout: 10e3 });
      await pvtChat.enter();
      await teamsSection.expand();
      await t.expect(team.exists).ok(teamId, { timeout: 10e3 });
      await team.enter();
      currentGroupId = await app.homePage.messagePanel.conversationPage.self.getAttribute('data-group-id');
    });


    await h(t).withLog(`When I open conversation B and close conversation A`, async () => {
      await pvtChat.enter();
      urlBeforeClose = await h(t).href;;
      await team.openMoreMenu();
      await app.homePage.messagePanel.moreMenu.close.enter();
    });

    await h(t).withLog(`Then  conversation A should be remove from conversation list.`, async () => {
      await t.wait(2e3);
      await t.expect(dmSection.conversationByIdEntry(currentGroupId).exists).notOk();
    });

    await h(t).withLog(`And Still focus on conversation B`, async () => {
      await t.wait(2e3);
      urlAfterClose = await h(t).href;;
      await t.expect(urlAfterClose).eql(urlBeforeClose, "URL is changed")
    });
  },
);

// the detail of dialog
const title = 'Close Conversation?';
const content =
  'Closing a conversation will remove it from the left pane, but will not delete the contents.';
const checkboxLabel = "Don't ask me again";
const button = 'Close Conversation';

test(formalName('Close current conversation in confirm alert(without UMI)', ['JPT-134', 'JPT-130', 'P2', 'ConversationList']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    user.sdk = await h(t).getSdk(user);

    const dmSection = app.homePage.messagePanel.directMessagesSection;
    const teamsSection = app.homePage.messagePanel.teamsSection;

    let pvtChatId, teamId;
    await h(t).withLog(
      'Given I have an extension with 1 private chat A and 1 team chat B',
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
      await user.sdk.glip.updateProfile(user.rcId, {
        [`hide_group_${pvtChatId}`]: false,
        [`hide_group_${teamId}`]: false,
        favorite_group_ids: [],
      });
    });

    await h(t).withLog('And I set user skip_close_conversation_confirmation is False before login', async () => {
      await user.sdk.glip.updateProfile(user.rcId, {
        skip_close_conversation_confirmation: false
      });
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      });

    const pvtChat = dmSection.conversationByIdEntry(pvtChatId);
    const team = teamsSection.conversationByIdEntry(teamId);
 
    await h(t).withLog(`And I open conversation A `, async () => {
      await dmSection.expand();
      await t.expect(pvtChat.exists).ok(pvtChatId, { timeout: 10e3 });
      await pvtChat.enter();
    });

    await h(t).withLog(`Then conversation A should not have UMI`, async () => {
      await pvtChat.waitUntilUmiNotExist();
    });

    await h(t).withLog(`When I click conversation A's close buttom`, async () => {
      await pvtChat.openMoreMenu();
      await app.homePage.messagePanel.moreMenu.close.enter();
    });

    const dialog = app.homePage.messagePanel.closeConversationModal;
    await h(t).withLog(`Then a confirm dialog should be popup`, async () => {
      await t.expect(dialog.getSelector('h2').withText(title).exists).ok();
      await t.expect(dialog.getSelector('p').withText(content)).ok();
      await t.expect(dialog.dontAskAgainCheckbox.parent('label').find('span').withText(checkboxLabel).exists).ok();
      await t.expect(dialog.confirmButton.find('span').withText(button).exists).ok();
    });

    await h(t).withLog(`When I don't select "Don't ask me again" then click "Close Conversation" button`, async () => {
      await dialog.confirm();
    });

    await h(t).withLog(`The popup dialog dissmis and conversation A is unvisible`, async () => {
      await t.expect(dialog.exists).notOk();
      await t.expect(pvtChat.exists).notOk();
    });

    await h(t).withLog(`When I click conversation B's close buttom`, async () => {
      await team.openMoreMenu();
      await app.homePage.messagePanel.moreMenu.close.enter();
    });

    await h(t).withLog(`Then should be show the confirm dialog again`, async () => {
      await t.expect(dialog.getSelector('h2').withText(title).exists).ok();
      await t.expect(dialog.getSelector('p').withText(content)).ok();
      await t.expect(dialog.dontAskAgainCheckbox.parent('label').find('span').withText(checkboxLabel).exists).ok();
      await t.expect(dialog.confirmButton.find('span').withText(button).exists).ok();
    });
  }
);

test(formalName(`Tap ${checkboxLabel} checkbox,then close current conversation in confirm alert(without UMI)`,
  ['JPT-134', 'JPT-130', 'P2', 'ConversationList']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    user.sdk = await h(t).getSdk(user);

    const dmSection = app.homePage.messagePanel.directMessagesSection;
    const teamsSection = app.homePage.messagePanel.teamsSection;

    let pvtChatId, teamId;
    await h(t).withLog(
      'Given I have an extension with 1 private chat A and 1 team chat B',
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
      await user.sdk.glip.updateProfile(user.rcId, {
        [`hide_group_${pvtChatId}`]: false,
        favorite_group_ids: [],
      });
    });

    await h(t).withLog('And I set user skip_close_conversation_confirmation is False before login', async () => {
      await user.sdk.glip.updateProfile(user.rcId, {
        skip_close_conversation_confirmation: false
      });
    },
    );

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      });

    const pvtChat = dmSection.conversationByIdEntry(pvtChatId);
    const team = teamsSection.conversationByIdEntry(teamId);
    const dialog = app.homePage.messagePanel.closeConversationModal;

    await h(t).withLog(`And I open conversation A `, async () => {
      await dmSection.expand();
      await t.expect(pvtChat.exists).ok(pvtChatId, { timeout: 10e3 });
      await pvtChat.enter();
    });

    await h(t).withLog(`Then conversation A should not have UMI`, async () => {
      await pvtChat.waitUntilUmiNotExist();
    });

    await h(t).withLog(`When I click conversation A's close buttom`, async () => {
      await pvtChat.openMoreMenu();
      await app.homePage.messagePanel.moreMenu.close.enter();
    });

    await h(t).withLog(`Then a confirm dialog should be popup`, async () => {
      await t.expect(dialog.getSelector('h2').withText(title).exists).ok();
      await t.expect(dialog.getSelector('p').withText(content)).ok();
      await t.expect(dialog.dontAskAgainCheckbox.parent('label').find('span').withText(checkboxLabel).exists).ok();
      await t.expect(dialog.confirmButton.find('span').withText(button).exists).ok();
    });

    await h(t).withLog(`When I select "Don't ask me again" then click "Close Conversation" button`, async () => {
      await dialog.toggleDontAskAgain();
      await dialog.confirm();
    });

    await h(t).withLog(`The popup dialog dissmis and conversation A should be closed`, async () => {
      await t.expect(dialog.exists).notOk();
      await t.expect(pvtChat.exists).notOk();
    });

    await h(t).withLog(`When I click conversation B's close buttom`, async () => {
      await team.openMoreMenu();
      await app.homePage.messagePanel.moreMenu.close.enter();
    });

    await h(t).withLog(`Then should not show  the confirm dialog agin`, async () => {
      await t.expect(dialog.exists).notOk();
    });

    await h(t).withLog(`and conversation B should be closed`, async () => {
      await t.expect(team.exists).notOk();
    });
  },
);

test(
  formalName('No close button in conversation with UMI', [
    'JPT-114',
    'P2',
    'ConversationList',
  ]),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    const userPlatform = await h(t).getPlatform(user);
    const userGlip = await h(t).getGlip(user);
    const favoritesSection = app.homePage.messagePanel.favoritesSection;
    const dmSection = app.homePage.messagePanel.directMessagesSection;
    const teamsSection = app.homePage.messagePanel.teamsSection;
    const closeButton = app.homePage.messagePanel.moreMenu.close;

    let favGroupId, pvtChatId, teamId1, teamId2;
    await h(t).withLog(
      'Given I have an extension with 2 private chat, 2 team chat, and 1 group tema',
      async () => {
        pvtChatId = (await userPlatform.createGroup({
          type: 'PrivateChat',
          members: [user.rcId, users[5].rcId],
        })).data.id;
        favGroupId = (await userPlatform.createGroup({
          type: 'Group',
          members: [user.rcId, users[5].rcId, users[6].rcId],
        })).data.id;
        teamId1 = (await userPlatform.createGroup({
          isPublic: true,
          name: `1 ${uuid()}`,
          type: 'Team',
          members: [user.rcId, users[5].rcId, users[6].rcId],
        })).data.id;
        teamId2 = (await userPlatform.createGroup({
          isPublic: true,
          name: `2 ${uuid()}`,
          type: 'Team',
          members: [user.rcId, users[5].rcId, users[6].rcId],
        })).data.id;
      },
    );

    await h(t).withLog('All conversations should not be hidden before login', async () => {
      await userGlip.updateProfile(user.rcId, {
        [`hide_group_${pvtChatId}`]: false,
        [`hide_group_${favGroupId}`]: false,
        [`hide_group_${teamId1}`]: false,
        [`hide_group_${teamId2}`]: false,
        favorite_group_ids: [+favGroupId]
      });
    });

    await h(t).withLog(
      `When I login Jupiter with this extension: ${user.company.number}#${
      user.extension
      }`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );


    await h(t).withLog('And other user send post to each conversation', async () => {
      await teamsSection.expand();
      await teamsSection.conversationByIdEntry(teamId2).enter();
      const user5Platform = await h(t).getPlatform(users[5]);
      const umiGroupIds = [favGroupId, pvtChatId, teamId1];
      for (let id of umiGroupIds) {
        await user5Platform.createPost(
          { text: `Hi, ![:Person](${user.rcId})` },
          id
        );
      }
    });

    await h(t).withLog(
      `Then I can find conversation with UMI in favorites/DM/teams section`,
      async () => {
        await t.wait(2e3)
        await favoritesSection.expand();
        const favUmiCount = (await favoritesSection.conversations.find('.umi').withText(/\d+/)).count
        await t.expect(favUmiCount).gt(0);
        await dmSection.expand();
        await t.expect((await dmSection.conversations.find('.umi').withText(/\d+/)).count).gt(0);
        await teamsSection.expand();
        await t.expect((await teamsSection.conversations.find('.umi').withText(/\d+/)).count).gt(0);
      },
    );

    await h(t).withLog(`When I click more Icon of a favorites conversation with UMI`, async () => {
      const UMI = await dmSection.conversations.find('.umi').withText(/\d+/)
      const moreIcon = UMI.nth(0).parent().find('span').withText('more_vert');
      await t.click(moreIcon);
    });

    await h(t).withLog(`Then the close button should not be show`, async () => {
      await t.expect(closeButton.exists).notOk();
    });

    await h(t).withLog(`When I click more Icon of a DM conversation with UMI`, async () => {
      const UMI = dmSection.conversations.find('.umi').withText(/\d+/)
      const moreIcon = UMI.nth(0).parent().find('span').withText('more_vert');
      await t.click(moreIcon);
    });

    await h(t).withLog(`Then the close button should not be show`, async () => {
      await t.expect(closeButton.exists).notOk();
    });

    await h(t).withLog(`When I click more Icon of a teams conversation with UMI`, async () => {
      const UMI = teamsSection.conversations.find('.umi').withText(/\d+/)
      const moreIcon = UMI.nth(0).parent().find('span').withText('more_vert');
      await t.click(moreIcon);
    });

    await h(t).withLog(`Then the close button should not be show`, async () => {
      await t.expect(closeButton.exists).notOk();
    });

    await h(t).withLog(`And clean all UMI`, async () => {
      await t.wait(2e3);
      const umiConversations = app.homePage.messagePanel.conversationListSections
        .find('.umi').withText(/\d+/).sibling('p');
      const count = await umiConversations.count;
      for (let i = count - 1; i >= 0; i--) {
        await await t.click(umiConversations.nth(i));
      }
    });
  },
);
