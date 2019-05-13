/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-05-07 13:17:55
 * Copyright © RingCentral. All rights reserved.
 */

import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup } from '../../v2/models';

fixture('AccessArchivedTeam')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Bookmarks/@mentions behavior of Archived Teams', ['JPT-1727', 'P2', 'ConversationList']), async t => {
  const app = new AppRoot(t);
  const adminUser = h(t).rcData.mainCompany.users[0];
  const memberUser = h(t).rcData.mainCompany.users[5];
  const teamsSection = app.homePage.messageTab.teamsSection;
  const profileDialog = app.homePage.profileDialog;
  const teamSettingDialog = app.homePage.teamSettingDialog;
  const archiveTeamDialog = app.homePage.archiveTeamDialog;
  const conversationPage = app.homePage.messageTab.conversationPage;
  const mentionsEntry = app.homePage.messageTab.mentionsEntry;
  const bookmarksEntry = app.homePage.messageTab.bookmarksEntry;
  const mentionPage = app.homePage.messageTab.mentionPage;
  const bookmarkPage = app.homePage.messageTab.bookmarkPage;

  const teamName = uuid();

  const team = <IGroup>{
    name: teamName,
    type: 'Team',
    members: [adminUser, memberUser],
    owner: adminUser
  };

  await h(t).withLog(`When I login Jupiter with this extension: ${adminUser.company.number}#${adminUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, adminUser);
    await app.homePage.ensureLoaded();
  });

  let postMention, postBookmark;
  await h(t).withLog('And I create a plain text bookmarked post and a post with a mention', async () => {
    await h(t).scenarioHelper.createTeam(team);
    const teamEntry = app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId);
    await teamEntry.enter();
    postMention = await h(t).scenarioHelper.sendTextPost(`Hi, ![:Person](${adminUser.rcId})`, team, adminUser);
    postBookmark = await h(t).scenarioHelper.sendTextPost('How are you doing?', team, adminUser);
    await conversationPage.postItemById(postBookmark.data.id).clickBookmarkToggle();
  });

  await h(t).withLog('And I archive the team', async () => {
    await teamsSection.expand();
    const teamItem = teamsSection.conversationEntryById(team.glipId);
    await teamItem.openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
    await profileDialog.clickSetting();
    await teamSettingDialog.clickArchiveTeamButton();
    await archiveTeamDialog.clickArchiveButton();
  });

  const alertText = 'The team was archived. To know more, contact the team administrator.'
  let postItemMention;
  let postItemBookmark;

  await h(t).withLog('Given that I am in the mentions page now', async () => {
    await mentionsEntry.enter();
  }, true);

  await h(t).withLog('I can see the post with a mention from the archived team in the mentions page', async () => {
    postItemMention = mentionPage.postItemById(postMention.data.id);
    await t.expect(postItemMention.exists).ok();
  }, true);

  await h(t).withLog('And the team name of the archived team is changed to “Team name - Archived', async () => {
    await t.expect(postItemMention.conversationName.textContent).eql(teamName + ' - Archived');
  }, true);

  await h(t).withLog('And the team name should be in disabled state', async () => {
    const isDisabled = postItemMention.conversationSource.getAttribute("data-disabled");
    await t.expect(isDisabled).eql('true');
  }, true);

  await h(t).withLog('When I click the Jump to conversation button on the post from the archived team in the mentions page', async () => {
    await postItemMention.hoverPostAndClickJumpToConversationButton();
  });

  await h(t).withLog(`Then there should be error flash toast displayed "${alertText}"`, async () => {
    await app.homePage.alertDialog.shouldBeShowMessage(alertText);
  });

  await h(t).withLog('Given that I am in the bookmarks page now', async () => {
    await bookmarksEntry.enter();
  }, true);

  await h(t).withLog('I can see the post bookmarked from the archived team in the bookmarks page', async () => {
    postItemBookmark = bookmarkPage.postItemById(postBookmark.data.id);
    await t.expect(postItemBookmark.exists).ok();
  }, true);

  await h(t).withLog(`And the team name of the archived team is changed to “${teamName} - Archived`, async () => {
    await t.expect(postItemBookmark.conversationName.textContent).eql(teamName + ' - Archived');
  }, true);

  await h(t).withLog('And the team name should be in disabled state', async () => {
    const isDisabled = postItemBookmark.conversationSource.getAttribute("data-disabled");
    await t.expect(isDisabled).eql('true');
  }, true);

  await h(t).withLog('When I click the Jump to conversation button on the post from the archived team in the bookmarks page', async () => {
    await postItemBookmark.hoverPostAndClickJumpToConversationButton();
  });

  await h(t).withLog(`Then there should be error flash toast displayed "${alertText}"`, async () => {
    await app.homePage.alertDialog.shouldBeShowMessage(alertText);
  });
});
