import { setupCase, teardownCase } from '../../init';
import { BrandTire, SITE_URL } from '../../config';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { IGroup } from '../../v2/models';
import { v4 as uuid } from 'uuid';

fixture('ContentPanel/Pin').beforeEach(setupCase(BrandTire.RCOFFICE)).afterEach(teardownCase());

test(formalName('Pin and Unpin in the direct message conversation', ['P2','Message','ContentPanel','Pin','V1.4','Knight.Shen']),async (t: TestController) => {
	const app = new AppRoot(t);
	const user = h(t).rcData.mainCompany.users;
	const loginUser = user[6];
	const otherUser = user[7];

	const chat: IGroup = {
		name: 'PinTest',
		type: 'DirectMessage',
		owner: loginUser,
		members: [loginUser, otherUser]
	};

	await h(t).withLog('Given one DirectMessage conversation', async () => {
    await h(t).glip(loginUser).init();
		await h(t).glip(loginUser).resetProfileAndState();
		await h(t).scenarioHelper.createOrOpenChat(chat);
	});

	const pinDMPostId = await h(t).scenarioHelper.sentAndGetTextPostId(uuid(),chat,otherUser);
	await h(t).withLog(`And I login Jupiter with extension: ${loginUser.company.number}#${loginUser.extension}`,async () => {
		await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

	const dmSection = app.homePage.messageTab.directMessagesSection;
	await h(t).withLog('When I enter the conversation which receive new message',async () => {
		await dmSection.expand();
		await dmSection.conversationEntryById(chat.glipId).enter();
	});

	const conversationPage = app.homePage.messageTab.conversationPage;
	await h(t).withLog('And I hover pin button', async () => {
		await conversationPage.postItemById(pinDMPostId).hoverPinButtonByClass();
		await t.expect(conversationPage.postItemById(pinDMPostId).getPinButtonByClass.visible).ok();
	});

	await h(t).log('Then I take screenshot', {screenshotPath: 'Jupiter_ContentPanel_pin'});

	await h(t).withLog('When I hover pin button after click unpin button',async () => {
		await conversationPage.postItemById(pinDMPostId).clickPinButtonByClass();
		await t.expect(conversationPage.postItemById(pinDMPostId).getUnpinButtonByClass.visible).ok();
	});

  await h(t).log('Then I take screenshot', { screenshotPath: 'Jupiter_ContentPanel_Unpin' });
});
