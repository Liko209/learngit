import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL, BrandTire } from '../../config';


fixture('Profile/ViewYourProfile')
    .beforeEach(setupCase(BrandTire.RCOFFICE))
    .afterEach(teardownCase());

test(formalName('Open personal profile via top bar avatar then open conversation', ['JPT-460', 'JPT-453', 'P1', 'zack']), async (t) => {
    const loginUser = h(t).rcData.mainCompany.users[0];
    const app = new AppRoot(t);
    const viewProfile = app.homePage.profileDialog;

    await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
        await h(t).directLoginWithUser(SITE_URL, loginUser);
        await app.homePage.ensureLoaded();
    });
    await h(t).withLog('Then I can open setting menu in home page', async () => {
        await app.homePage.openSettingMenu();
        await app.homePage.settingMenu.ensureLoaded();
    });
    await h(t).withLog('When I click "Profile" button in setting menu', async () => {
        await app.homePage.settingMenu.clickViewYourProfile();
    });
    await h(t).withLog('Then I can see Profile title', async () => {
        await viewProfile.ensureLoaded();
    }, true);
    await h(t).withLog('When I click messasge link in Profile', async () => {
        await viewProfile.goToMessages();
    }, true);
    await h(t).withLog('And I can jump to Me Conversation', async () => {
        await t.expect(app.homePage.messageTab.conversationPage.title.withText(/\(me\)$/).exists).ok();
    }, true);

});
