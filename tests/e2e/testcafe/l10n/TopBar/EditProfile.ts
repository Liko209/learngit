import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { h } from '../../v2/helpers';
import { AppRoot } from "../../v2/page-models/AppRoot";

fixture('TopBar/EditProfile')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Check "Profile" menu', ['P2', 'TopBar', 'EditProfile', 'V1.7', 'Hank.Huang']), async (t) => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[5];
  const avatarData = {
    "url": "https://glipasialabnet-glpci1xmn.s3.amazonaws.com/web/customer_files/72507404/1.jpg?Expires=2075494478&AWSAccessKeyId=AKIAJTSETWOUUVBJDLCA&Signature=5lupBH7xxLX6qYhMPaIjDLYqWtg%3D",
    "offset": "43x0",
    "crop": "172x172",
  };

  await h(t).withLog('Given I have a extension has avatar photo in backend', async () => {
    await h(t).glip(loginUser).init();
    const hasAvatarInBackend = !!await h(t).glip(loginUser).getPersonPartialData('headshot');
    avatarData['creator_id'] = await h(t).glip(loginUser).toPersonId(loginUser.rcId);
    if (!hasAvatarInBackend) {
      await h(t).glip(loginUser).updatePerson({
        headshot: avatarData
      });
    };
  });

  await h(t).withLog(`When I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const settingMenu = app.homePage.settingMenu;
  const profileDialog = app.homePage.profileDialog;
  await h(t).withLog('And I view profile and hover "edit" button', async () => {
    await app.homePage.openSettingMenu();
    await settingMenu.clickDropMenuViewProfile();
    await profileDialog.hoverEditProfile();
  });

  await h(t).log('Then I take screenshot', { screenshotPath:'Jupiter_TopBar_ProfileEditButton' });

  await h(t).withLog('When I enter "edit profile" dialog', async () => {
    await profileDialog.clickEditProfile();
  });

  const editProfileDialog = app.homePage.profileEditDialog;
  await h(t).withLog('Then "edit profile" dialog should be displayed', async () => {
    await editProfileDialog.ensureLoaded();
  });

  await h(t).log('And I take screenshot', { screenshotPath:'Jupiter_TopBar_EditProfileDialog' });

  await h(t).withLog('When I click "Edit profile photo" button', async () => {
    await editProfileDialog.clickAvatarEditDiv();
  });

  const AvatarEditDialog = app.homePage.AvatarEditDialog;
  await h(t).withLog('Then "Edit profile photo" dialog should be displayed', async() => {
    await AvatarEditDialog.ensureLoaded();
  });

  await h(t).log('And I take screenshot', { screenshotPath:'Jupiter_TopBar_AvatarEditDialog' });
});
