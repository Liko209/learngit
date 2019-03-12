/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-10-24 14:25:44
 * Copyright © RingCentral. All rights reserved.
 */
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('ConversationList/HighlightConversation')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Open last conversation when login and group show in the top of conversation list', ['JPT-144', 'P2', 'ConversationList']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[7];
    const directMessageSection = app.homePage.messageTab.directMessagesSection;
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).resetProfileAndState();

    let groupId;
    await h(t).withLog('Given I have an extension with a group chat', async () => {
      groupId = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Group',
        members: [loginUser.rcId, users[5].rcId, users[6].rcId],
      });
    });

    await h(t).withLog(`And the group chat ${groupId} is last group selected`, async () => {
      await h(t).glip(loginUser).setLastGroupId(groupId)
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('Then the group should be opened automatically after login', async () => {
      await t.expect(h(t).href).match(new RegExp(`${groupId}$`));
    });

    await h(t).withLog('And the group is highlighted', async () => {
      const textStyle = await directMessageSection.conversations
        .filter(`[data-group-id="${groupId}"]`)
        .find('p').style;
      await t.expect(textStyle.color).eql('rgb(6, 132, 189)');
    });

    await h(t).withLog('And the content is shown on the conversation page', async () => {
      await app.homePage.messageTab.conversationPage.groupIdShouldBe(groupId);
    });
  },
);
