import { setupCase, teardownCase } from '../../init';
import { BrandTire, SITE_URL } from '../../config';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { IGroup } from '../../v2/models';
import { v4 as uuid } from 'uuid';

fixture('ContentPanel/AttachFile')
	.beforeEach(setupCase(BrandTire.RCOFFICE))
	.afterEach(teardownCase());

test(
	formalName('Check attach file button in the content panel', [
		'P2',
		'Message',
		'ContentPanel',
		'AttachFile',
		'V1.4',
		'Knight.Shen'
	]),
	async (t: TestController) => {
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
			await h(t)
				.glip(loginUser)
				.init();
			await h(t)
				.glip(loginUser)
				.resetProfileAndState();
			await h(t).scenarioHelper.createOrOpenChat(chat);
			await h(t).scenarioHelper.sendTextPost(uuid(), chat, otherUser);
		});

		await h(t).withLog(
			`And I login Jupiter with extension: ${loginUser.company.number}#${
				loginUser.extension
			}`,
			async () => {
				await h(t).directLoginWithUser(SITE_URL, loginUser);
				await app.homePage.ensureLoaded();
			}
		);

		const dmSection = app.homePage.messageTab.directMessagesSection;
		await h(t).withLog(
			'When I enter conversation which receive new message',
			async () => {
				await dmSection.expand();
				await dmSection.conversationEntryById(chat.glipId).enter();
			}
		);

		const conversationPage = app.homePage.messageTab.conversationPage;
		await h(t).withLog('And I hover the attach file icon', async () => {
			await t.expect(conversationPage.attachFileIcon.exists).ok();
			await conversationPage.hoverAttachFileIcon();
		});

		await h(t).log('Then I take screenshot', {
			screenshotPath: 'Jupiter_ContentPanel_AttachFileIcon'
		});

		await h(t).withLog('When I click the attach file icon', async () => {
			await conversationPage.clickAttachFileIcon();
			await conversationPage.hoverAttachFileFromComputer();
			await t.expect(conversationPage.attachFileFromComputer.exists).ok();
		});

		await h(t).log('Then I take screenshot', {
			screenshotPath: 'Jupiter_ContentPanel_AttachFileMenu'
		});
	}
);
