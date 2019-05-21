import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { h } from '../../v2/helpers';
import { AppRoot } from "../../v2/page-models/AppRoot";



fixture('TopBar/Profile').beforeEach(setupCase(BrandTire.RCOFFICE)).afterEach(teardownCase())
test(formalName('Check "Profile" menu', ['P2', 'TopBar', 'Profile', 'V1.4', 'Hank.Huang']), async (t) => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[5];
  const settingMenu = app.homePage.settingMenu;
  const topBarAvatar = app.homePage.topBarAvatar;

  await h(t).glip(loginUser).init();

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });
  await h(t).withLog(`When I click "New actions" button`, async() => {
    await t.click(topBarAvatar);
  });
  await h(t).withLog(`Then "Setting Menu" should be displayed`, async() => {
    await t.expect(settingMenu.self.exists).ok();
  })
  await h(t).log('And I take screenshot', {screenshotPath:'Jupiter_TopBar_SettingMenu'});

  await h(t).withLog(`When I click "Profile" button`, async() => {
    await settingMenu.clickViewYourProfile();
  });
  await h(t).withLog(`Then "Profile" page should be displayed`, async() => {
    await t.expect(settingMenu.viewYourProfileButton.exists).ok();
  });
  await h(t).log('And I take screenshot', {screenshotPath:'Jupiter_TopBar_ProfilePage'});

  const profileDialog = app.homePage.profileDialog;
  const favoriteStatusIcon = profileDialog.favoriteStatusIcon;
  const unFavoriteStatusIcon = profileDialog.unFavoriteStatusIcon;

  await h(t).withLog(`When I hover "Favorites" button`, async() => {
    await t.hover(favoriteStatusIcon);
  });
  await h(t).withLog(`Then "favorite" icon should be displayed`, async() => {
    await t.expect(unFavoriteStatusIcon.exists).notOk();
  });
  await h(t).log('And I take screenshot', {screenshotPath:'Jupiter_TopBar_RemoveFromFavorites'});

  await h(t).withLog(`When I click "Favorites" button and hover it`, async() => {
    await t.click(favoriteStatusIcon);
    await t.hover(favoriteStatusIcon);
  });
  await h(t).withLog(`Then "favorite" icon change to "unFavorite" icon`, async() => {
    await t.expect(unFavoriteStatusIcon.exists).ok();
  });
  await h(t).log('And I take screenshot', {screenshotPath:'Jupiter_TopBar_AddToFavorites'});

  const closeButton = app.homePage.profileDialog.closeButton;
  const extensionArea =app.homePage.profileDialog.extensionArea;

  await h(t).withLog(`When I hover "Close" button`, async() => {
    await t.hover(closeButton);
  });
  await h(t).log('Then I take screenshot', {screenshotPath:'Jupiter_TopBar_ProfileCloseButton'});

  await h(t).withLog(`When I hover "Ext" area and hover "Copy" button`,async() => {
    await t.hover(extensionArea);
    await t.hover(extensionArea.nth(-1).find('button'));
  });
  await h(t).withLog(`Then text "Copy" should be displayed` , async() => {
    await t.expect(extensionArea.nth(-1).find('button').exists).ok();
  });
  await h(t).log('And I take screenshot', {screenshotPath:'Jupiter_TopBar_ProfileCopyButton'});

  await h(t).withLog(`When I click "About RingCentral" button` , async() => {
    await t.click(closeButton);
    await t.click(topBarAvatar);
    await settingMenu.clickAboutButton();
  });
  // await h(t).withLog(`Then "About" popup should be displayed` ,async() => {
  //   await t.expect(settingMenu.viewAboutButton.exists).ok;
  // });
  await h(t).log('Then I take screenshot', {screenshotPath:'Jupiter_TopBar_AboutPage'});
});
