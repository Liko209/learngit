/*
 * Mia.Cai (mia.cai@ringcentral.com)
 */

import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { ITestMeta } from '../../v2/models';
import { SITE_URL, BrandTire } from '../../config';

fixture('SendNewMessage')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('JPT-285 Check New Message popup can be opened and closed', ['P1', 'SendNewMessage', 'Mia.Cai', 'JPT-285']), async t => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[0];
  const sendNewMessageModal = app.homePage.sendNewMessageModal;

  await h(t).withLog(`When I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I open add menu in home page', async () => {
    await app.homePage.openAddActionMenu();
  });

  await h(t).withLog('Then AddActionMenu -> sendNewMessageEntry exists', async () => {
    await app.homePage.addActionMenu.sendNewMessageEntry.exists;
  });

  await h(t).withLog('When I click the Send New Message button', async () => {
    await app.homePage.addActionMenu.sendNewMessageEntry.enter();
    await sendNewMessageModal.ensureLoaded();
  });

  await h(t).withLog('Then the Send New Message popup shows', async () => {
    //check members input exists
    await sendNewMessageModal.memberInput.ensureLoaded();
  }, true);

  await h(t).withLog('When I close the Send New Message popup', async () => {
    await sendNewMessageModal.clickCancelButton();
  });

  await h(t).withLog('Then the Send New Message popup dismiss', async () => {
    //check members input not exists
    await sendNewMessageModal.memberInput.ensureDismiss();
  }, true);
});

test(formalName('JPT-288 Check the maximum length of the “Type new message" Text Field', ['P3', 'SendNewMessage', 'Mia.Cai', 'JPT-288',]), async t => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[0];
  const sendNewMessageModal = app.homePage.sendNewMessageModal;
  const sendNewMessageEntry = app.homePage.addActionMenu.sendNewMessageEntry;
  const MAX = 10000;
  const moreThanMAX = 10001;
  const lessThanMax = 10;

  await h(t).withLog(`When I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I open add menu in home page', async () => {
    await app.homePage.openAddActionMenu();
  });

  await h(t).withLog('Then AddActionMenu -> sendNewMessageEntry exists', async () => {
    await sendNewMessageEntry.exists;
  });

  await h(t).withLog('When I click the Send New Message button', async () => {
    await sendNewMessageEntry.enter();
    await sendNewMessageModal.ensureLoaded();
  });

  await h(t).withLog('Then the Send New Message popup shows', async () => {
    //check members input exists
    await sendNewMessageModal.memberInput.ensureLoaded();
  }, true);

  await h(t).withLog(`When I input new message with ${lessThanMax} character`, async () => {
    const newMessage = await sendNewMessageModal.randomMessage(lessThanMax);
    await sendNewMessageModal.setNewMessage(newMessage);
  });

  await h(t).withLog(`Then New Message input show ${lessThanMax} characters`, async () => {
    const teamNameValue = await sendNewMessageModal.newMessageTextarea.value;
    await t.expect(teamNameValue.length).eql(lessThanMax);
  });

  await h(t).withLog(`When I input new message with ${MAX} character`, async () => {
    const newMessage = await sendNewMessageModal.randomMessage(MAX);
    await sendNewMessageModal.setNewMessage(newMessage);
  });

  await h(t).withLog(`Then New Message input show ${MAX} characters`, async () => {
    const teamNameValue = await sendNewMessageModal.newMessageTextarea.value;
    await t.expect(teamNameValue.length).eql(MAX);
  });

  await h(t).withLog(`When I input new message with more than ${moreThanMAX} character`, async () => {
    const newMessage = await sendNewMessageModal.randomMessage(moreThanMAX);
    await sendNewMessageModal.setNewMessage(newMessage);
  });

  await h(t).withLog(`Then New Message input show only ${MAX} characters`, async () => {
    const teamNameValue = await sendNewMessageModal.newMessageTextarea.value;
    await t.expect(teamNameValue.length).eql(MAX);
  });

});

test(formalName('JPT-286 New Message can be created successfully', ['P1', 'SendNewMessage', 'Mia.Cai', 'JPT-286']), async t => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[0];
  const sendNewMessageModal = app.homePage.sendNewMessageModal;
  const sendNewMessageEntry = app.homePage.addActionMenu.sendNewMessageEntry;
  const dmSection = app.homePage.messageTab.directMessagesSection;
  const otherUser = h(t).rcData.mainCompany.users[7];
  await h(t).glip(otherUser).init();
  const user2Name = await h(t).glip(otherUser).getPerson()
    .then(res => {
      return res.data.display_name;
    });
  const newMessages = `new message ${uuid()}`;

  await h(t).withLog(`When I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I open add menu in home page', async () => {
    await app.homePage.openAddActionMenu();
  });

  await h(t).withLog('Then AddActionMenu -> sendNewMessageEntry exists', async () => {
    await sendNewMessageEntry.exists;
  });

  await h(t).withLog('When I click the Send New Message button', async () => {
    await sendNewMessageEntry.enter();
    await sendNewMessageModal.ensureLoaded();
  });

  await h(t).withLog('Then the Send New Message popup shows', async () => {
    //check members input exists
    await sendNewMessageModal.memberInput.ensureLoaded();
  }, true);

  await h(t).withLog('When I input one memeber name', async () => {
    await sendNewMessageModal.memberInput.addMember(user2Name);
  });

  await h(t).withLog('Then the Send button should be enable', async () => {
    await sendNewMessageModal.sendButtonShouldBeEnabled();
  });

  await h(t).withLog('When I input new message', async () => {
    await sendNewMessageModal.setNewMessage(newMessages);
  });

  await h(t).withLog('And I click send button', async () => {
    await sendNewMessageModal.clickSendButton();
  });

  await h(t).withLog('Then the created conversation is at the top of the section', async () => {
    await dmSection.expand();
    await dmSection.nthConversationEntry(0).nameShouldBe(user2Name);
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('And the new message was sent successfully', async () => {
    await conversationPage.waitUntilPostsBeLoaded();
    await t.expect(conversationPage.posts.child().withText(newMessages).exists).ok();
  }, true);

  await h(t).withLog('When I refresh page', async () => {
    await h(t).reload();
    await app.homePage.ensureLoaded();
    await app.homePage.messageTab.directMessagesSection.ensureLoaded();
  });

  await h(t).withLog('Then the created conversation is at the top of the section', async () => {
    await dmSection.expand();
    await dmSection.nthConversationEntry(0).nameShouldBe(user2Name);
  });

  await h(t).withLog('And the new message was sent successfully', async () => {
    await conversationPage.waitUntilPostsBeLoaded();
    await t.expect(conversationPage.posts.child().withText(newMessages).exists).ok();
  }, true);
});

test(formalName('JPT-293 The Send button is disabled when user create new message without members', ['P2', 'SendNewMessage', 'Mia.Cai', 'JPT-293']),
  async t => {
    const app = new AppRoot(t);
    const loginUser = h(t).rcData.mainCompany.users[0];
    const sendNewMessageModal = app.homePage.sendNewMessageModal;
    const sendNewMessageEntry = app.homePage.addActionMenu.sendNewMessageEntry;
    const newMessage = `new message ${uuid()}`;

    await h(t).withLog(`When I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('And I open add menu in home page', async () => {
      await app.homePage.openAddActionMenu();
    });

    await h(t).withLog('Then AddActionMenu -> sendNewMessageEntry exists', async () => {
      await sendNewMessageEntry.exists;
    });

    await h(t).withLog('When I click the Send New Message button', async () => {
      await sendNewMessageEntry.enter();
      await sendNewMessageModal.ensureLoaded();
    });

    await h(t).withLog('Then the Send New Message popup shows', async () => {
      //check members input exists
      await sendNewMessageModal.memberInput.ensureLoaded();
    }, true);

    await h(t).withLog('And Send button is disabled', async () => {
      await sendNewMessageModal.sendButtonShouldBeDisabled();
    }, true);

    await h(t).withLog('When I input new message', async () => {
      await sendNewMessageModal.setNewMessage(newMessage);
    }, true);

    await h(t).withLog('Then Send button is disabled', async () => {
      await sendNewMessageModal.sendButtonShouldBeDisabled();
    }, true);

  },
);

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-289'],
  maintainers: ['ali.naffaa'],
  keywords: ['SendNewMessage'],
})('Check just only plain text can be enter into input box of "Type new message"', async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).platform(loginUser).init();
  await h(t).scenarioHelper.resetProfileAndState(loginUser);

  await h(t).withLog(`And I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  },
  );

  await h(t).withLog('When I click "Send New Message" on AddActionMenu', async () => {
    await app.homePage.openAddActionMenu();
    await app.homePage.addActionMenu.sendNewMessageEntry.enter();
  });

  const sendNewMessageModal = app.homePage.sendNewMessageModal;
  const specialSymbols = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
  await h(t).withLog(`And enter text or special symbols ${specialSymbols} into the fields `, async () => {
    await sendNewMessageModal.ensureLoaded();
    await sendNewMessageModal.memberInput.typeText(specialSymbols);
    await sendNewMessageModal.setNewMessage(specialSymbols);
  });

  await h(t).withLog('Then they can be input into fields', async () => {
    await t.expect(sendNewMessageModal.memberInput.InputArea.value).eql(specialSymbols);
    await t.expect(sendNewMessageModal.newMessageTextarea.value).eql(specialSymbols);
  });
});
