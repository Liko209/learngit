import { setupCase, teardownCase } from '../../init';
import { BrandTire, SITE_URL } from '../../config';
import { formalName } from '../../libs/filter';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { h } from '../../v2/helpers';
import { IGroup } from '../../v2/models';
import { v4 as uuid } from 'uuid';

fixture('ContentPanel/ThreadMoreButton').beforeEach(setupCase(BrandTire.RCOFFICE)).afterEach(teardownCase());

test(formalName('Check More button on post action bar', ['P2','Message','ContentPanel','MoreButton','V1.4','Knight.Shen']),async (t: TestController) => {
	const app = new AppRoot(t);
	const users = h(t).rcData.mainCompany.users;
	const loginUser = users[6];
	const otherUser = users[7];

	const chat: IGroup = {
		name: 'DMChat',
		type: 'DirectMessage',
		owner: loginUser,
		members: [loginUser, otherUser]
	};

	await h(t).withLog('Given one DirectMessage conversation', async () => {
		await h(t).glip(loginUser).init();
		await h(t).glip(loginUser).resetProfileAndState();
    await h(t).scenarioHelper.createOrOpenChat(chat);
  });

	const postDMId = await h(t).scenarioHelper.sentAndGetTextPostId(uuid(),chat,loginUser);
	await h(t).withLog(`And I login Jupiter with extension: ${loginUser.company.number}#${loginUser.extension}`,async () => {
		await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
	});

	const dmSection = app.homePage.messageTab.directMessagesSection;
	await h(t).withLog('When I enter conversation which receive new message',async () => {
		await dmSection.expand();
		await dmSection.conversationEntryById(chat.glipId).enter();
	});

	const conversationPage = app.homePage.messageTab.conversationPage;
	await h(t).withLog('And I hover more button in the action bar',async () => {
		await conversationPage.postItemById(postDMId).hoverMoreItemOnActionBar();
		await t.expect(conversationPage.postItemById(postDMId).actionBarMoreMenu.exists).ok();
	});

	await h(t).log('Then I take screenshot', {screenshotPath: 'Jupiter_ContentPanel_HoverMoreButton'});

	await h(t).withLog('When I click more button in the action bar',async () => {
		await conversationPage.postItemById(postDMId).clickMoreItemOnActionBar();
		await t.expect(conversationPage.postItemById(postDMId).actionBarMoreMenu.quoteItem.visible).ok();
		await t.expect(conversationPage.postItemById(postDMId).actionBarMoreMenu.deletePost.visible).ok();
	  await t.expect(conversationPage.postItemById(postDMId).actionBarMoreMenu.editPost.visible).ok();
	});

	await h(t).log('Then I take screenshot', {screenshotPath: 'Jupiter_ContentPanel_ActionBarMoreMenu'});

	await h(t).withLog('When I click quote item in the action bar',async () => {
		await conversationPage.postItemById(postDMId).actionBarMoreMenu.quoteItem.enter();
    const reg = new RegExp(/@[\s\S]+>/, 'gm');
		await t.expect(conversationPage.messageInputArea.textContent).match(reg);
	});

	await h(t).log('Then I take screenshot', {screenshotPath: 'Jupiter_ContentPanel_ActionBarQuotePost'});

	const deletePostDialog = app.homePage.messageTab.deletePostModal;
	await h(t).withLog('When I click delete post button in the action bar',async () => {
		await conversationPage.postItemById(postDMId).clickMoreItemOnActionBar();
		await conversationPage.postItemById(postDMId).actionBarMoreMenu.deletePost.enter();
		await t.expect(deletePostDialog.exists).ok();
	});

	await h(t).log('Then I take screenshot', {screenshotPath: 'Jupiter_ContentPanel_ActionBarDeletePost'});
});
