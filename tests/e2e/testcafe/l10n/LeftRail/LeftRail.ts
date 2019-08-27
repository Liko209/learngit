import { setupCase, teardownCase } from '../../init';
import { BrandTire, SITE_URL } from '../../config';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { AppRoot } from '../../v2/page-models/AppRoot';

fixture('LeftRail/LeftRail').beforeEach(setupCase(BrandTire.RCOFFICE)).afterEach(teardownCase());

//Update Knight.Shen V1.4 to Hanny.han V1.6 & V1.7
test(formalName('Enter message in left navigator', ['P2','Message','LeftRail','V1.4','V1.6','V1.7','Hanny.han']),async t => {
	const loginUser = h(t).rcData.mainCompany.users[4];
	const app = new AppRoot(t);

	await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`,async () => {
		await h(t).directLoginWithUser(SITE_URL, loginUser);
		await app.homePage.ensureLoaded();
	});

	const leftPanelEntry = app.homePage.leftPanel;
	await h(t).withLog('When I click menu button', async () => {
		await t.click(leftPanelEntry.toggleButton);
	});

	await h(t).withLog('And I enter message module', async () => {
		await leftPanelEntry.messagesEntry.enter();
	});

	const messageTab = app.homePage.messageTab;
	await h(t).withLog('And I fold team section', async () => {
		await messageTab.teamsSection.fold();
	});

	await h(t).withLog('And I fold direct message section', async () => {
		await messageTab.directMessagesSection.fold();
	});

	await h(t).withLog('Then all sections should be displayed', async () => {
		await t.expect(messageTab.directMessagesSection.visible).ok({ timeout: 3e3 });
		await t.expect(messageTab.teamsSection.visible).ok({ timeout: 3e3 });});

	await h(t).log('And I take screenshot', {screenshotPath: 'Jupiter_LeftRail'});
});
