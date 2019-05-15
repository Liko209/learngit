import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { h } from '../../v2/helpers';
import { AppRoot } from "../../v2/page-models/AppRoot";



fixture('TopBar/Profile').beforeEach(setupCase(BrandTire.RCOFFICE)).afterEach(teardownCase())
test(formalName('Check menu tip', ['P2', 'Profile', 'V1.4', 'Hank.Huang']), async (t) => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[5];

  await h(t).glip(loginUser).init();

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });
  await h(t).withLog(`When I click "New actions" button`, async() => {
    const topBarAvatar = app.homePage.topBarAvatar;
    await t.click(topBarAvatar);
  });
  await h(t).withLog(`Then "Setting Menu" should be displayed`, async() => {
    const settingMenu = app.homePage.settingMenu;
    await t.expect(settingMenu.self.exists).ok();
  })
  await h(t).log('And I take screenshot ', {screenshotPath:`Jupiter_TopBar_SettingMenu`});
  await h(t).withLog(`When I click "Profile" button`, async() => {
    const settingMenu = app.homePage.settingMenu;
    await settingMenu.clickViewYourProfile();
  });
  await h(t).withLog(`Then "Profile" page should be displayed`, async() => {
    const settingMenu = app.homePage.settingMenu;
    await t.expect(settingMenu.viewYourProfileButton.exists).ok();
  });
  await h(t).log('And I take screenshot ', {screenshotPath:`Jupiter_TopBar_ProfilePage`});
  await h(t).withLog(`When I hover "Favorites" button`, async() => {
    const favoriteButton = app.homePage.profileDialog.favoriteButton;
    await t.hover(favoriteButton);
  });
  await h(t).withLog(`Then "favorite" icon should be displayed`, async() => {
    await t.expect(app.homePage.profileDialog.favoriteStatusIcon.exists).ok();
    await t.expect(app.homePage.profileDialog.unFavoriteStatusIcon.exists).notOk();
  });
  await h(t).log('And I take screenshot ', {screenshotPath:`Jupiter_TopBar_RemoveFromFavorites`});
  await h(t).withLog(`When I click "Favorites" button and hover it`, async() => {
    const favoriteButton = app.homePage.profileDialog.favoriteButton;
    await t.click(favoriteButton);
    await t.hover(favoriteButton);
  });
  await h(t).withLog(`Then "favorite" icon change to "unFavorite" icon`, async() => {
    await t.expect(app.homePage.profileDialog.favoriteStatusIcon.exists).notOk();
    await t.expect(app.homePage.profileDialog.unFavoriteStatusIcon.exists).ok();
  });
  await h(t).log('And I take screenshot ', {screenshotPath:'Jupiter_TopBar_AddToFavorites'});
  await h(t).withLog(`When I hover "Close" button`, async() => {
    const closeButton = app.homePage.profileDialog.closeButton;
    await t.hover(closeButton);
  });
  await h(t).log('Then I take screenshot ', {screenshotPath:'Jupiter_TopBar_ProfileCloseButton'});
  await h(t).withLog(`When I hover "Ext" area and hover "Copy" button`,async() => {
    const extensionArea =app.homePage.profileDialog.extensionArea;
    await t.hover(extensionArea);
    await t.hover(extensionArea.nth(-1).find('button'));
  });
  await h(t).withLog(`Then text "Copy" should be displayed` , async() => {
    const extensionArea =app.homePage.profileDialog.extensionArea;
    await t.expect(extensionArea.nth(-1).find('button').exists).ok();
  });
  await h(t).log('And I take screenshot ', {screenshotPath:'Jupiter_TopBar_ProfileCopyButton'});
  await h(t).withLog(`When I click "About RingCentral" button` , async() => {
    const settingMenu = app.homePage.settingMenu;
    const topBarAvatar = app.homePage.topBarAvatar;
    const closeButton = app.homePage.profileDialog.closeButton;
    await t.click(closeButton);
    await t.click(topBarAvatar);
    await settingMenu.clickAboutButton();
  });
  await h(t).withLog(`Then "About" popup should be displayed` ,async() => {
    const settingMenu = app.homePage.settingMenu;
    await t.expect(settingMenu.viewAboutButton.exists).ok;
  });
  await h(t).log('And I take screenshot ', {screenshotPath:'Jupiter_TopBar_AboutPage'});
});
