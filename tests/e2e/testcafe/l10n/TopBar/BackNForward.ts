import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { h } from '../../v2/helpers';
import { AppRoot } from "../../v2/page-models/AppRoot";



fixture('BackNForward').beforeEach(setupCase(BrandTire.RCOFFICE)).afterEach(teardownCase())
test(formalName('Check menu tip', ['P0', 'BackNForward', 'Hank']), async (t) => {
const loginUser = h(t).rcData.mainCompany.users[5];
const app = new AppRoot(t);
const menuButton = app.homePage.leftPanel.toggleButton;
const dashboardButton = app.homePage.leftPanel.dashboardEntry;
const forwardButton = app.homePage.header.forwardButton;
const backButton = app.homePage.header.backButton;



await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
await h(t).directLoginWithUser(SITE_URL, loginUser);
await app.homePage.ensureLoaded();
});
await h(t).withLog(`When I hover "menu" button`, async () =>{
await t.hover(menuButton);
})
await h(t).log(`Then take screenshot Jupiter_TopBar_MenuButton`, { screenshotPath: 'Jupiter_TopBar_MenuButton'}
);
await h(t).withLog(`When I click "dashboard" Tab and hover "back" button`, async () => {
await dashboardButton.enter();
await backButton.hoverSelf();
});
await h(t).log(`Then take screenshot Jupiter_TopBar_BackButton `,{ screenshotPath: 'Jupiter_TopBar_BackButton'}
);
await h(t).withLog(`When I click "back" button and I hover "forward" button`, async () => {
await backButton.clickSelf();
await forwardButton.hoverSelf();
});
await h(t).log(`Then take screenshot Jupiter_TopBar_ForwardButton`,{ screenshotPath: 'Jupiter_TopBar_ForwardButton'}
);
});
