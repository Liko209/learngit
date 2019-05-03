import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { h } from '../../v2/helpers';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { AsyncCreatable } from "react-select";
import { Header } from "../../v2/page-models/AppRoot/HomePage/header";
import { IGroup } from "../../v2/models";
import { button } from "@storybook/addon-knobs";


fixture('Profile').beforeEach(setupCase(BrandTire.RCOFFICE)).afterEach(teardownCase())
test(formalName('Check menu tip', ['P0', 'Profile', 'Hank']), async (t) => {
const loginUser = h(t).rcData.mainCompany.users[5];
await h(t).glip(loginUser).init();
const app = new AppRoot(t);
const settingMenu = app.homePage.settingMenu;
const topBarAvatar = app.homePage.topBarAvatar;
const anotherUser = h(t).rcData.mainCompany.users[7];
const favoriteButton = app.homePage.profileDialog.favoriteButton;
const closeButton = app.homePage.profileDialog.closeButton;
const extensionArea =app.homePage.profileDialog.extensionArea;
const anotherUserName = await h(t).glip(loginUser).getPersonPartialData('display_name', anotherUser.rcId);
const createTeamEntry = app.homePage.addActionMenu.createTeamEntry;

await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
await h(t).directLoginWithUser(SITE_URL, loginUser);
await app.homePage.ensureLoaded();
});
await h(t).withLog(`When I click "New actions" button`, async() => {
await t.click(topBarAvatar);
});
await h(t).log(`Then take screenshot Jupiter_TopBar_AvatarMenu`, {screenshotPath:`Jupiter_TopBar_AvatarMenu`}
);
await h(t).withLog(`When I click "Profile" button`, async() => {
await settingMenu.clickViewYourProfile();
});
await h(t).log(`Then take screenshot Jupiter_TopBar_Profile`, {screenshotPath:`Jupiter_TopBar_ProfilePage`}
);
await h(t).withLog(`When I hover "Favorites" button`, async() => {
await t.hover(favoriteButton);
});
await h(t).log(`Then take screenshot Jupiter_TopBar_RemoveFromFavorites`, {screenshotPath:`Jupiter_TopBar_RemoveFromFavorites`}
);
await h(t).withLog(`When I click "Favorites" button and hover it`, async() => {
await t.click(favoriteButton);
await t.hover(favoriteButton);
});
await h(t).log(`Then take screenshot Jupiter_TopBar_AddToFavorites`, {screenshotPath:`Jupiter_TopBar_AddToFavorites`}
);
await h(t).withLog(`When I hover "Close" button`, async() => {
await t.hover(closeButton);
});
await h(t).log(`Then take screenshot Jupiter_TopBar_ProfileCloseButton`, {screenshotPath:`Jupiter_TopBar_ProfileCloseButton`}
);
await h(t).withLog(`When I hover "Ext" area and hover "Copy" button`,async() => {
await t.hover(extensionArea);
await t.hover(extensionArea.nth(-1).find('button'))
});
await h(t).log(`Then take screenshot Jupiter_TopBar_ProfileCopyButton`, {screenshotPath:`Jupiter_TopBar_ProfileCopyButton`}
);
await h(t).withLog(`When I click "About RingCentral" button`,async() => {
await t.click(closeButton);
await t.click(topBarAvatar);
await settingMenu.clickAboutPage();
});
await h(t).log(`Then take screenshot Jupiter_TopBar_AboutPage`, {screenshotPath:`Jupiter_TopBar_AboutPage`}
);
});
