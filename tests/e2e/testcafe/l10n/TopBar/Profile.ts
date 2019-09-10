import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { h } from '../../v2/helpers';
import { AppRoot } from "../../v2/page-models/AppRoot";

fixture('TopBar/Profile')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());
test(formalName('Check the "presence" in profile', ['P2', 'TopBar', 'Profile','V1.7', 'Hank.Huang']), async (t) => {
  const app = new AppRoot(t);
  const settingMenu = app.homePage.settingMenu;
  const avatar = app.homePage.avatar;

  await h(t).withLog('When I change the presence to "Available" ', async () => {
    await app.homePage.openSettingMenu();
    await settingMenu.hoverPresenceMenuButton();
  });
  await h(t).withLog('Then check the presence change to "Available" ' , async () => {
    await avatar.hoverTopBarAvatar();
    await avatar.showTooltip('Available');
  });

  await h(t).log('And I take screenshot', {  screenshotPath:'Jupiter_TopBar_AvailablePresenceSubMenu'});

  await h(t).withLog('When I hover avatar in "available" Presence', async() => {
    await settingMenu.clickPresenceSubMenuAvailableButton();
    await avatar.hoverTopBarAvatar();
  });
  await h(t).log('Then I take screenshot', { screenshotPath:'Jupiter_TopBar_AvailablePresence' });

  await h(t).withLog('When I change presence to "Invisible"', async() => {
    await app.homePage.openSettingMenu();
    await settingMenu.hoverPresenceMenuButton();
    await settingMenu.clickPresenceSubMenuInvisibleButton();
  });

  await h(t).withLog('Then check the presence change to "Invisible" ' , async () => {
    await avatar.hoverTopBarAvatar();
    await avatar.showTooltip('Offline');
  });
  await h(t).withLog('And I open presence menu', async() => {
    await app.homePage.openSettingMenu();
    await settingMenu.hoverPresenceMenuButton();
  });
  await h(t).log('And I take screenshot', {screenshotPath:'Jupiter_TopBar_InvisiblePresenceSubMenu'});

  await h(t).withLog('When I hover avatar in "Invisible" Presence', async() => {
    await settingMenu.clickPresenceSubMenuInvisibleButton();
    await avatar.hoverTopBarAvatar();
  });
  await h(t).log('Then I take screenshot', {screenshotPath:'Jupiter_TopBar_InvisiblePresence'});

  await h(t).withLog('When I change presence to "Do Not Disturb" and hover current presence', async() => {
    await app.homePage.openSettingMenu();
    await settingMenu.hoverPresenceMenuButton();
    await settingMenu.clickPresenceSubMenuDndButton();
  });

  await h(t).withLog('Then check the presence change to "Do Not Disturb" ' , async () => {
    await avatar.hoverTopBarAvatar();
    await avatar.showTooltip("Do not disturb");
  });
  await h(t).withLog('And I open presence menu' , async () => {
    await app.homePage.openSettingMenu();
    await settingMenu.hoverPresenceMenuButton();
  });
  await h(t).log('And I take screenshot', {screenshotPath:'Jupiter_TopBar_DoNotDisturbPresenceSubMenu'});

  await h(t).withLog('When I hover avatar in "Invisible" Presence', async() => {
    await settingMenu.clickPresenceSubMenuDndButton()
    await avatar.hoverTopBarAvatar();
  });
  await h(t).log('Then I take screenshot', {screenshotPath:'Jupiter_TopBar_DoNotDisturbPresence'});
});

test(formalName('Check "Profile" menu', ['P2', 'TopBar', 'Profile', 'V1.4', 'Hank.Huang']), async (t) => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[5];
  const settingMenu = app.homePage.settingMenu;
  const topBarAvatar = app.homePage.topBarAvatar;

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });
  await h(t).withLog('When I click "New actions" button', async() => {
    await app.homePage.openSettingMenu();
  });
  await h(t).withLog('Then "Setting Menu" should be displayed', async() => {
    await t.expect(settingMenu.self.exists).ok();
  });
  await h(t).log('And I take screenshot', {screenshotPath:'Jupiter_TopBar_SettingMenu'});

  const profileDialog = app.homePage.profileDialog;
  await h(t).withLog('When I click "Profile" button', async() => {
    await settingMenu.clickDropMenuViewProfile();
  });
  await h(t).withLog('Then "Profile" page should be displayed', async() => {
    await t.expect(profileDialog.profileTitle.exists).ok();
  });
  await h(t).log('And I take screenshot', {screenshotPath:'Jupiter_TopBar_ProfilePage'});

  const favoriteButton = profileDialog.favoriteButton;
  await h(t).withLog('When I hover "Favorites" button', async() => {
    if(favoriteButton.exists){
      await profileDialog.hoverFavoriteButton();
    }
    else{
      await profileDialog.clickUnFavoriteButton();
      await profileDialog.hoverFavoriteButton();
    }
  });
  await h(t).log('Then I take screenshot', {screenshotPath:'Jupiter_TopBar_RemoveFromFavorites'});

  await h(t).withLog('When I click "Favorites" button and hover it', async() => {
    await profileDialog.clickFavoriteButton();
    await profileDialog.hoverUnFavoriteButton();
  });
  await h(t).log('And I take screenshot', { screenshotPath:'Jupiter_TopBar_AddToFavorites' });

  const closeButton = app.homePage.profileDialog.closeButton;
  const extensionArea =app.homePage.profileDialog.extensionArea;

  await h(t).withLog('When I hover "Close" button', async() => {
    await t.hover(closeButton);
  });
  await h(t).log('Then I take screenshot', { screenshotPath:'Jupiter_TopBar_ProfileCloseButton' });

  await h(t).withLog('When I hover "Ext" area and hover "Copy" button',async() => {
    await t.hover(extensionArea);
    await t.hover(extensionArea.nth(-1).find('button'));
  });
  await h(t).withLog('Then text "Copy" should be displayed' , async() => {
    await t.expect(extensionArea.nth(-1).find('button').exists).ok();
  });
  await h(t).log('And I take screenshot', { screenshotPath:'Jupiter_TopBar_ProfileCopyButton' });

  await h(t).withLog('When I click "About RingCentral" button' , async() => {
    await t.click(closeButton);
    await t.click(topBarAvatar);
    await settingMenu.clickAboutButton();
  });
  await h(t).log('Then I take screenshot', { screenshotPath:'Jupiter_TopBar_AboutPage' });
});
