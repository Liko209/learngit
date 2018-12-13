import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL } from '../../config';


fixture('Profile/ViewYourProfile')
    .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
    .afterEach(teardownCase());

test(formalName('ViewYourProfile', ['JPT-460', 'P1','zack']), async (t) => {
    const user = h(t).rcData.mainCompany.users[4];
    const app = new AppRoot(t);
    const viewProfile= app.homePage.viewProfile;

    await h(t).withLog(`Given I login Jupiter with ${user.company.number}#${user.extension}`, async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
    });
    await h(t).withLog('Then I can open setting menu in home page', async () => {
        await app.homePage.openSettingMenu();
        await app.homePage.settingMenu.ensureLoaded();
    });
    await h(t).withLog('When I click ViewProfile button in setting menu', async () => {
        await app.homePage.settingMenu.clickViewYourProfile();
    });
    await h(t).withLog('Then I can see Profile title', async () => {
        await viewProfile.shouldExistviewProfile('Profile');
    }, true);
});
