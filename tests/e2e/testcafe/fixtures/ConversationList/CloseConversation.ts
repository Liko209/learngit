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


// the detail of dialog
const title = 'Close Conversation?';
const content =
  'Closing a conversation will remove it from the left pane, but will not delete the contents.';
const checkboxLabel = "Don't ask me again";
const button = 'Close Conversation';

test(
  formalName(
    'Close current conversation directly, and navigate to blank page (without UMI)',
    ['JPT-135', 'JPT-130', 'P1', 'ConversationList'],
  ),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    const userPlatform = await h(t).getPlatform(user);
    const userGlip = await h(t).getGlip(user);
    const dmSection = app.homePage.messagePanel.directMessagesSection;
    const teamsSection = app.homePage.messagePanel.teamsSection;

    let pvtChatId, groupId, teamId;
    await h(t).withLog(
      'Given I have an extension with 1 private chat and 1 group chat and I team chat',
      async () => {
        pvtChatId = (await userPlatform.createGroup({
          type: 'PrivateChat',
          members: [user.rcId, users[5].rcId],
        })).data.id;
        groupId = (await userPlatform.createGroup({
          type: 'Group',
          members: [user.rcId, users[5].rcId, users[6].rcId],
        })).data.id;;
        teamId = (await userPlatform.createGroup({
          isPublic: true,
          name: uuid(),
          type: 'Team',
          members: [user.rcId, users[5].rcId, users[6].rcId],
        })).data.id;
      },
    );

    await h(t).withLog('All conversations should not be hidden before login', async () => {
      await userGlip.updateProfile(user.rcId, {
        [`hide_group_${pvtChatId}`]: false,
        [`hide_group_${groupId}`]: false,
      });
    },
    );

    await h(t).withLog('And I set user skip_close_conversation_confirmation is true before login', async () => {
      await userGlip.updateProfile(user.rcId, {
        skip_close_conversation_confirmation: true
      });
    },
    );

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      });

    const pvtChat = dmSection.conversations.filter(`[data-group-id="${pvtChatId}"]`);
    const group = dmSection.conversations.filter(`[data-group-id="${groupId}"]`);
    const team = teamsSection.conversations.filter(`[data-group-id="${teamId}"]`);
    const closeButton = app.getSelector('li').withText('Close');

    await h(t).withLog(`Then I can find the 3 conversations in conversation list`, async () => {
      await dmSection.expand();
      await t.expect(pvtChat.exists).ok(pvtChatId, { timeout: 10e3 });
      await t.expect(group.exists).ok(groupId, { timeout: 10e3 });
      await teamsSection.expand();
      await t.expect(team.exists).ok(teamId, { timeout: 10e3 });
    });

    await h(t).withLog(`When I open PrivateChat conversation and then click close conversation button`, async () => {
      await t.click(pvtChat);
      const moreIcon = pvtChat.find('span').withText('more_vert');
      await t.click(moreIcon);
      await t.click(closeButton);
    });

    await h(t).withLog(`Then PrivateChat conversation should be remove from conversation list.`, async () => {
      await t.expect(pvtChat.exists).notOk();
    });

    await h(t).withLog(`And Content panel should navigate to Blank page`, async () => {
      const open_url = await h(t).href;
      const str = open_url.toString().split('messages');
      await t.expect(str.length).eql(2)
        .expect(str[1]).eql('');
      await t.expect(app.homePage.messagePanel.conversationPage.find(".ql-editor").exists).notOk()
    })

    await h(t).withLog(`When I open group conversation and then click close conversation button`, async () => {
      await t.click(group);
      const moreIcon = group.find('span').withText('more_vert');
      await t.click(moreIcon);
      await t.click(closeButton);
    });

    await h(t).withLog(`Then group conversation should be remove from conversation list.`, async () => {
      await t.expect(group.exists).notOk();
    });

    await h(t).withLog(`And Content panel should navigate to Blank page`, async () => {
      const open_url = await h(t).href;
      const str = open_url.toString().split('messages');
      await t.expect(str.length).eql(2)
        .expect(str[1]).eql('');
      await t.expect(app.homePage.messagePanel.conversationPage.find(".ql-editor").exists).notOk()
    })

    await h(t).withLog(`When I open team conversation and then click close conversation button`, async () => {
      await t.click(team);
      const moreIcon = team.find('span').withText('more_vert');
      await t.click(moreIcon);
      await t.click(closeButton);
    });

    await h(t).withLog(`Then team conversation should be remove from conversation list.`, async () => {
      await t.expect(team.exists).notOk();
    });

    await h(t).withLog(`And Content panel should navigate to Blank page`, async () => {
      const open_url = await h(t).href;
      const str = open_url.toString().split('messages');
      await t.expect(str.length).eql(2)
        .expect(str[1]).eql('');
      await t.expect(app.homePage.messagePanel.conversationPage.find(".ql-editor").exists).notOk()
    })
  },
);

test(
  formalName(
    'Close other conversation in confirm alert,and still focus on user veiwing conversation(without UMI)',
    ['JPT-137', 'JPT-130', 'P1', 'ConversationList'],
  ),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    const userPlatform = await h(t).getPlatform(user);
    const userGlip = await h(t).getGlip(user);
    const dmSection = app.homePage.messagePanel.directMessagesSection;
    const teamsSection = app.homePage.messagePanel.teamsSection;

    let pvtChatId, teamId, urlBeforeClose, urlAfterClose;
    await h(t).withLog(
      'Given I have an extension with 1 private chat A and 1 team chat B',
      async () => {
        pvtChatId = (await userPlatform.createGroup({
          type: 'PrivateChat',
          members: [user.rcId, users[5].rcId],
        })).data.id;
        teamId = (await userPlatform.createGroup({
          isPublic: true,
          name: uuid(),
          type: 'Team',
          members: [user.rcId, users[5].rcId, users[6].rcId],
        })).data.id;
      },
    );

    await h(t).withLog('All conversations should not be hidden before login', async () => {
      await userGlip.updateProfile(user.rcId, {
        [`hide_group_${pvtChatId}`]: false,
      });
    },
    );

    await h(t).withLog('And I set user skip_close_conversation_confirmation is true before login', async () => {
      await userGlip.updateProfile(user.rcId, {
        skip_close_conversation_confirmation: true
      });
    },
    );

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      });

    const pvtChat = dmSection.conversations.filter(`[data-group-id="${pvtChatId}"]`);
    const team = teamsSection.conversations.filter(`[data-group-id="${teamId}"]`);
    const closeButton = app.getSelector('li').withText('Close');

    await h(t).withLog(`Then I clean UMI in the A and B`, async () => {
      await dmSection.expand();
      await t.expect(pvtChat.exists).ok(pvtChatId, { timeout: 10e3 });
      await t.click(pvtChat);
      await teamsSection.expand();
      await t.expect(team.exists).ok(teamId, { timeout: 10e3 });
      await t.click(team);
    });


    await h(t).withLog(`When I open conversation B and close conversation A`, async () => {
      urlBeforeClose = await h(t).href;
      const moreIcon = pvtChat.find('span').withText('more_vert');
      await t.click(moreIcon);
      await t.click(closeButton);
    });

    await h(t).withLog(`Then  conversation A should be remove from conversation list.`, async () => {
      await t.expect(pvtChat.exists).notOk();
    });

    await h(t).withLog(`And Still focus on conversation B`, async () => {
      urlAfterClose = await h(t).href;
      await t.expect(urlAfterClose).eql(urlBeforeClose, "URL is changed")
    });
  },
);

test(
  formalName('Close current conversation in confirm alert(without UMI)', [
    'JPT-134',
    'JPT-130',
    'P2',
    'ConversationList',
  ]),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    const userPlatform = await h(t).getPlatform(user);
    const userGlip = await h(t).getGlip(user);
    const dmSection = app.homePage.messagePanel.directMessagesSection;
    const teamsSection = app.homePage.messagePanel.teamsSection;


    let pvtChatId, teamId;
    await h(t).withLog(
      'Given I have an extension with 1 private chat A and 1 team chat B',
      async () => {
        pvtChatId = (await userPlatform.createGroup({
          type: 'PrivateChat',
          members: [user.rcId, users[5].rcId],
        })).data.id;
        teamId = (await userPlatform.createGroup({
          isPublic: true,
          name: uuid(),
          type: 'Team',
          members: [user.rcId, users[5].rcId, users[6].rcId],
        })).data.id;
      },
    );

    await h(t).withLog('All conversations should not be hidden before login', async () => {
      await userGlip.updateProfile(user.rcId, {
        [`hide_group_${pvtChatId}`]: false,
      });
    },
    );

    await h(t).withLog('And I set user skip_close_conversation_confirmation is False before login', async () => {
      await userGlip.updateProfile(user.rcId, {
        skip_close_conversation_confirmation: false
      });
    },
    );

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      });

    const pvtChat = dmSection.conversations.filter(`[data-group-id="${pvtChatId}"]`);
    const team = teamsSection.conversations.filter(`[data-group-id="${teamId}"]`);
    const closeButton = app.getSelector('li').withText('Close');
    const dialog = app.homePage.messagePanel.closeConversationModal;

    await h(t).withLog(`Then I can open conversation A `, async () => {
      await dmSection.expand();
      await t.expect(pvtChat.exists).ok(pvtChatId, { timeout: 10e3 });
      await t.click(pvtChat);
    });

    await h(t).withLog(`When I click conversation A's close buttom`, async () => {
      const moreIcon = pvtChat.find('span').withText('more_vert');
      await t.click(moreIcon);
      await t.click(closeButton);
    });

    await h(t).withLog(`Then a confirm dialog should be popup`, async () => {
      await t.expect(dialog.getSelector('h2').withText(title).exists).ok();
      await t.expect(dialog.getSelector('p').withText(content)).ok();
      await t.expect(dialog.dontAskAgainCheckbox.withText(checkboxLabel)).ok();
      await t.expect(dialog.confirmButton.withText(button.toUpperCase())); //The button is uppercase,it's by design
    });

    await h(t).withLog(`When I don't select "Don't ask me again" then click "Close Conversation" button`, async () => {
      await dialog.confirm();
    });

    await h(t).withLog(`The popup dialog dissmis and conversation A is unvisible`, async () => {
      await t.expect(dialog.exists).notOk();
      await t.expect(pvtChat.exists).notOk();
    });

    await h(t).withLog(`When I click conversation B's close buttom`, async () => {
      const moreIcon = team.find('span').withText('more_vert');
      await t.click(moreIcon);
      await t.click(closeButton);
    });

    await h(t).withLog(`Then should be show the confirm dialog again`, async () => {
      await t.expect(dialog.getSelector('h2').withText(title).exists).ok();
      await t.expect(dialog.getSelector('p').withText(content)).ok();
      await t.expect(dialog.dontAskAgainCheckbox.withText(checkboxLabel)).ok();
      await t.expect(dialog.confirmButton.withText(button.toUpperCase()));
    });

  }
);

test(
  formalName(
    `Tap ${checkboxLabel} checkbox,then close current conversation in confirm alert(without UMI)`,
    ['JPT-134', 'JPT-130', 'P2', 'ConversationList'],
  ),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    const userPlatform = await h(t).getPlatform(user);
    const userGlip = await h(t).getGlip(user);
    const dmSection = app.homePage.messagePanel.directMessagesSection;
    const teamsSection = app.homePage.messagePanel.teamsSection;



    let pvtChatId, teamId;
    await h(t).withLog(
      'Given I have an extension with 1 private chat A and 1 team chat B',
      async () => {
        pvtChatId = (await userPlatform.createGroup({
          type: 'PrivateChat',
          members: [user.rcId, users[5].rcId],
        })).data.id;
        teamId = (await userPlatform.createGroup({
          isPublic: true,
          name: uuid(),
          type: 'Team',
          members: [user.rcId, users[5].rcId, users[6].rcId],
        })).data.id;
      },
    );

    await h(t).withLog('All conversations should not be hidden before login', async () => {
      await userGlip.updateProfile(user.rcId, {
        [`hide_group_${pvtChatId}`]: false,
      });
    },
    );

    await h(t).withLog('And I set user skip_close_conversation_confirmation is False before login', async () => {
      await userGlip.updateProfile(user.rcId, {
        skip_close_conversation_confirmation: false
      });
    },
    );

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      });

    const pvtChat = dmSection.conversations.filter(`[data-group-id="${pvtChatId}"]`);
    const team = teamsSection.conversations.filter(`[data-group-id="${teamId}"]`);
    const closeButton = app.getSelector('li').withText('Close');
    const dialog = app.homePage.messagePanel.closeConversationModal;

    await h(t).withLog(`Then I can open conversation A `, async () => {
      await dmSection.expand();
      await t.expect(pvtChat.exists).ok(pvtChatId, { timeout: 10e3 });
      await t.click(pvtChat);
    });

    await h(t).withLog(`When I click conversation A's close buttom`, async () => {
      const moreIcon = pvtChat.find('span').withText('more_vert');
      await t.click(moreIcon);
      await t.click(closeButton);
    });

    await h(t).withLog(`Then a confirm dialog should be popup`, async () => {
      await t.expect(dialog.getSelector('h2').withText(title).exists).ok();
      await t.expect(dialog.getSelector('p').withText(content)).ok();
      await t.expect(dialog.dontAskAgainCheckbox.withText(checkboxLabel)).ok();
      await t.expect(dialog.confirmButton.withText(button.toUpperCase())); //The button is uppercase,it's by design
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
      const moreIcon = team.find('span').withText('more_vert');
      await t.click(moreIcon);
      await t.click(closeButton);
    });

    await h(t).withLog(`Then should not show  the confirm dialog agin`, async () => {
      await t.expect(dialog.exists).notOk();
    });

    await h(t).withLog(`and conversation B should be closed`, async () => {
      await t.expect(team.exists).notOk();
    });
  },
);

// todo cannot check (with umi)
test.skip(
  formalName('No close button in conversation with UMI', [
    'JPT-114',
    'P2',
    'ConversationList',
  ]),
  async (t: TestController) => {

  },
);
