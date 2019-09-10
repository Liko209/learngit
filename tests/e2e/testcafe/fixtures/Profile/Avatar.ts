import { h, H } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL, BrandTire, SITE_ENV } from '../../config';
import { ITestMeta, IGroup } from '../../v2/models';
import * as assert from 'assert';
import { AvatarEditDialog } from '../../v2/page-models/AppRoot/HomePage/AvatarEditDialog';
import { v4 as uuid } from 'uuid';


fixture('Profile/Avatar')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


const filePath = '../../sources/avatar.jpg';
test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2581'],
  maintainers: ['Potar.he'],
  keywords: ['Profile', 'Avatar']
})('Check the custom avatar if the user has set the photo', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];

  await h(t).withLog('Given I have a extension has not avatar photo in backend', async () => {
    await h(t).glip(loginUser).init();
    const hasAvatarInBackend = !!await h(t).glip(loginUser).getPersonPartialData('headshot');
    if (hasAvatarInBackend) {
      await h(t).resetGlipAccount(loginUser);
    }
  });
  await h(t).glip(loginUser).init();
  const firstName = await h(t).glip(loginUser).getPersonPartialData('first_name');
  const lastName = await h(t).glip(loginUser).getPersonPartialData('last_name');
  const formatAvatar = async (firstName, lastName) => {
    if (firstName.t == '' || lastName == '') {
      await h(t).glip(loginUser).updatePerson({ 'first_name': 'John707', 'last_name': 'Doe' })
      return 'JD';
    }
    return firstName[0].toUpperCase() + lastName[0].toUpperCase();
  }
  const avatarText = await formatAvatar(firstName, lastName);

  const app = new AppRoot(t);
  await h(t).withLog(`When I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('Then top bar avatar Display the default avatar: {avatarText} ', async (step) => {
    step.setMetadata("avatarText", avatarText);
    await t.expect(app.homePage.avatarShortName.textContent).eql(avatarText);
  })

  await h(t).withLog('When I open setting menu in home page', async () => {
    await app.homePage.openSettingMenu();
    await app.homePage.settingMenu.ensureLoaded();
  });

  await h(t).withLog('When I click view profile in setting menu', async () => {
    await app.homePage.settingMenu.clickDropMenuViewProfile();
  });

  const profileDialog = app.homePage.profileDialog;

  await h(t).withLog('Then user profile should be opened in viewer mode', async () => {
    await profileDialog.ensureLoaded();
  }, true);

  await h(t).withLog('When I click "Edit profile" button in viewer mode', async () => {
    await profileDialog.clickEditProfile();
  });

  const editProfileDialog = app.homePage.profileEditDialog;
  await h(t).withLog('Then user profile should be opened in edit mode', async () => {
    await editProfileDialog.ensureLoaded();
  }, true);

  await h(t).withLog('When I upload a photo', async () => {
    await editProfileDialog.uploadFile(filePath);
  });

  const avatarEditDialog = app.homePage.AvatarEditDialog;
  await h(t).withLog('Then  "Edit Profile Photo" dialog should be popup', async () => {
    await avatarEditDialog.ensureLoaded();
  });

  await h(t).withLog('And The zoom control is showed.', async () => {
    await t.expect(avatarEditDialog.zoomControl.exists).ok();
  });

  await h(t).withLog('And "Upload photo" button is displayed.', async () => {
    await t.expect(avatarEditDialog.uploadButton.exists).ok();
  });

  await h(t).withLog('And The background of default photo is not transparent.', async () => {
    await t.expect(avatarEditDialog.imageCanvasMask.exists).ok();
    // use UT to check css.
  });

  await h(t).withLog('And Cancel and Save button exists', async () => {
    await t.expect(avatarEditDialog.cancelButton.exists).ok();
    await t.expect(avatarEditDialog.doneButton.exists).ok();
  });

});


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2597'],
  maintainers: ['Potar.he'],
  keywords: ['Profile', 'Avatar']
})('Check the custom avatar if the user has set the photo', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[4];
  const avatarData = {
    // "creator_id": 90996739,
    "url": "https://glipasialabnet-glpci1xmn.s3.amazonaws.com/web/customer_files/72507404/1.jpg?Expires=2075494478&AWSAccessKeyId=AKIAJTSETWOUUVBJDLCA&Signature=5lupBH7xxLX6qYhMPaIjDLYqWtg%3D",
    "offset": "43x0",
    "crop": "172x172",
  }

  if (SITE_ENV === 'XMN-UP') {
    avatarData['url'] = 'https://glipasialabnet-xmnup.s3.amazonaws.com/web/customer_files/2891251724/download.png?Expires=2075494478&AWSAccessKeyId=AKIAIV55VIWRKLRZEYSA&Signature=Aij%2FJGSfmBoZJvllvKApk4c003w%3D';
  }

  await h(t).withLog('Given I have a extension has avatar photo in backend', async () => {
    await h(t).glip(loginUser).init();
    const hasAvatarInBackend = !!await h(t).glip(loginUser).getPersonPartialData('headshot');
    avatarData['creator_id'] = await h(t).glip(loginUser).toPersonId(loginUser.rcId);
    if (!hasAvatarInBackend) {
      await h(t).glip(loginUser).updatePerson({
        headshot: avatarData
      });
    }
  });

  const app = new AppRoot(t);
  await h(t).withLog(`When I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('Then top bar avatar Display the default avatar', async () => {
    await t.expect(app.homePage.avatarImage.exists).ok();
  })

  await h(t).withLog('When I open setting menu in home page', async () => {
    await app.homePage.openSettingMenu();
    await app.homePage.settingMenu.ensureLoaded();
  });

  await h(t).withLog('When I click view profile in setting menu', async () => {
    await app.homePage.settingMenu.clickDropMenuViewProfile();
  });

  const profileDialog = app.homePage.profileDialog;

  await h(t).withLog('Then user profile should be opened in viewer mode', async () => {
    await profileDialog.ensureLoaded();
  }, true);

  await h(t).withLog('When I click "Edit profile" button in viewer mode', async () => {
    await profileDialog.clickEditProfile();
  });

  const editProfileDialog = app.homePage.profileEditDialog;
  await h(t).withLog('Then user profile should be opened in edit mode', async () => {
    await editProfileDialog.ensureLoaded();
  }, true);

  await h(t).withLog('When I upload a photo', async () => {
    await editProfileDialog.uploadFile(filePath);
  });

  const avatarEditDialog = app.homePage.AvatarEditDialog;
  await h(t).withLog('Then  "Edit Profile Photo" dialog should be popup', async () => {
    await avatarEditDialog.ensureLoaded();
  });

  await h(t).withLog('And The zoom control is show.', async () => {
    await t.expect(avatarEditDialog.zoomControl.exists).ok();
  });

  await h(t).withLog('And "Upload photo" button is displayed.', async () => {
    await t.expect(avatarEditDialog.uploadButton.exists).ok();
  });

  await h(t).withLog('And The background of default photo is not transparent.', async () => {
    await t.expect(avatarEditDialog.imageCanvasMask.exists).ok();
    // use UT to check css.
  });

  await h(t).withLog('And Cancel and Save button exists', async () => {
    await t.expect(avatarEditDialog.cancelButton.exists).ok();
    await t.expect(avatarEditDialog.doneButton.exists).ok();
  });

  let leftValue;
  await h(t).withLog('And avatar photo exists', async () => {
    await t.expect(avatarEditDialog.image.exists).ok();
    leftValue = await avatarEditDialog.image.getBoundingClientRectProperty('left');
  });

  await h(t).withLog('When move the photo', async () => {
    await t.drag(avatarEditDialog.image, 30, 0)
  });

  await h(t).withLog('Then the photo is moved ', async () => {
    const currentLeft = await avatarEditDialog.image.getBoundingClientRectProperty('left');
    assert.ok(currentLeft !== leftValue, "avatar photo moved...")
  });

});


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2620', 'JPT-2623', 'JPT-2633'],
  maintainers: ['Potar.he'],
  keywords: ['Profile', 'Avatar']
})('Check the crop window displays after selecting an image in photo view && JPG circle cursor is move && GIF circle cursor is fix', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[4];

  const jpgPath = '../../sources/avatar.jpg';
  const gifPath = '../../sources/avatar.gif';

  const app = new AppRoot(t);
  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I open setting menu in home page', async () => {
    await app.homePage.openSettingMenu();
    await app.homePage.settingMenu.ensureLoaded();
  });

  await h(t).withLog('When I click view profile in setting menu', async () => {
    await app.homePage.settingMenu.clickDropMenuViewProfile();
  });

  const profileDialog = app.homePage.profileDialog;

  await h(t).withLog('Then user profile should be opened in viewer mode', async () => {
    await profileDialog.ensureLoaded();
  }, true);

  await h(t).withLog('When I click "Edit profile" button in viewer mode', async () => {
    await profileDialog.clickEditProfile();
  });

  const editProfileDialog = app.homePage.profileEditDialog;
  await h(t).withLog('Then user profile should be opened in edit mode', async () => {
    await editProfileDialog.ensureLoaded();
  }, true);

  await h(t).withLog('When I upload a photo', async () => {
    await editProfileDialog.uploadFile(filePath);
  });

  const avatarEditDialog = app.homePage.AvatarEditDialog;
  await h(t).withLog('Then  "Edit Profile Photo" dialog should be popup', async () => {
    await avatarEditDialog.ensureLoaded();
  });

  await h(t).withLog('When I upload a photo', async () => {
    await avatarEditDialog.uploadFile(filePath);
  });

  // jpg
  await h(t).withLog('And I upload a jpg photo', async () => {
    await avatarEditDialog.uploadFile(jpgPath);
  });

  await h(t).withLog('Then Photo display shows the original photo with a circular crop window.', async () => {
    await H.retryUntilPass(async () => {
      const circleStyle = await avatarEditDialog.circleArea.style;
      assert.ok(
        circleStyle['border-bottom-left-radius'] == '50%' &&
        circleStyle['border-bottom-right-radius'] == '50%' &&
        circleStyle['border-top-left-radius'] == '50%' &&
        circleStyle['border-top-right-radius'] == '50%',
        'the crop window is not a circle!'
      );
    })
  });

  await h(t).withLog('And the photo needs to fit in the display window, whichever reaches the window\'s maximum.', async () => {
    await checkPhotoFitToDisplayWindow(avatarEditDialog);
  });

  await h(t).withLog('And The crop window is fixed in the center of the photo display.', async () => {
    const circleStyle = await avatarEditDialog.imageCanvas.style;
    assert.ok(
      circleStyle['justify-content'] == "center" && circleStyle['display'] == "flex",
      'the photo is not put in center'
    );
  });

  await h(t).withLog('And The crop window is fixed in the center of the photo display.', async () => {
    const circleStyle = await avatarEditDialog.imageCanvas.style;
    assert.ok(
      circleStyle['justify-content'] == "center" && circleStyle['display'] == "flex",
      'the photo is not put in center'
    );
  });

  await h(t).withLog('And The zoom control is showed.', async () => {
    await t.expect(avatarEditDialog.zoomControl.exists).ok();
  });

  await h(t).withLog('And The mouse changes to a four-way-arrow icon indicator and he can move the photo around by dragging the mouse.', async () => {
    const circleStyle = await avatarEditDialog.circleArea.style;
    assert.ok(circleStyle['cursor'] == 'move' || circleStyle['pointer-events'] == 'auto', 'mouse style is not "move"')
  });


  // gif

  await h(t).withLog('And I upload a gif photo', async () => {
    await avatarEditDialog.uploadFile(gifPath);
  });

  await h(t).withLog('Then Photo display shows the original photo with a circular crop window.', async () => {
    await H.retryUntilPass(async () => {
      const circleStyle = await avatarEditDialog.circleArea.style;
      assert.ok(
        circleStyle['border-bottom-left-radius'] == '50%' &&
        circleStyle['border-bottom-right-radius'] == '50%' &&
        circleStyle['border-top-left-radius'] == '50%' &&
        circleStyle['border-top-right-radius'] == '50%',
        'the crop window is not a circle!'
      );
    })
  });

  await h(t).withLog('And the photo needs to fit in the display window, whichever reaches the window\'s maximum.', async () => {
    await checkPhotoFitToDisplayWindow(avatarEditDialog);
  });

  await h(t).withLog('And The crop window is fixed in the center of the photo display.', async () => {
    const circleStyle = await avatarEditDialog.imageCanvas.style;
    assert.ok(
      circleStyle['justify-content'] == "center" && circleStyle['display'] == "flex",
      'the photo is not put in center'
    );
  });

  await h(t).withLog('And The crop window is fixed in the center of the photo display.', async () => {
    const circleStyle = await avatarEditDialog.imageCanvas.style;
    assert.ok(
      circleStyle['justify-content'] == "center" && circleStyle['display'] == "flex",
      'the photo is not put in center'
    );
  });

  await h(t).withLog('And The zoom control is hidden.', async () => {
    await t.expect(avatarEditDialog.zoomControl.exists).notOk();
  });

  await h(t).withLog('And The mouse changes to a four-way-arrow icon indicator and he can move the photo around by dragging the mouse.', async () => {
    const circleStyle = await avatarEditDialog.circleArea.style;
    assert.ok(circleStyle['pointer-events'] == 'none', `mouse style pointer-events is ${circleStyle['pointer-events']}`);
  });

});


test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-2638'],
  maintainers: ['Potar.he'],
  keywords: ['Profile', 'Avatar']
})('Check the avatar can be saved successfully after user set the photo', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[4];

  const filePath = '../../sources/avatar.jpg';

  const app = new AppRoot(t);
  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  let hasAvatar = await app.homePage.avatarImage.exists;
  let avatarUrl = hasAvatar ? await app.homePage.avatarImage.getAttribute('src') : undefined;

  await h(t).withLog('When I open setting menu in home page', async () => {
    await app.homePage.openSettingMenu();
    await app.homePage.settingMenu.ensureLoaded();
  });

  await h(t).withLog('When I click view profile in setting menu', async () => {
    await app.homePage.settingMenu.clickDropMenuViewProfile();
  });

  const profileDialog = app.homePage.profileDialog;

  await h(t).withLog('Then user profile should be opened in viewer mode', async () => {
    await profileDialog.ensureLoaded();
  }, true);

  await h(t).withLog('When I click "Edit profile" button in viewer mode', async () => {
    await profileDialog.clickEditProfile();
  });

  const editProfileDialog = app.homePage.profileEditDialog;
  await h(t).withLog('Then user profile should be opened in edit mode', async () => {
    await editProfileDialog.ensureLoaded();
  }, true);

  await h(t).withLog('When I upload a photo', async () => {
    await editProfileDialog.uploadFile(filePath);
  });

  const avatarEditDialog = app.homePage.AvatarEditDialog;
  await h(t).withLog('Then  "Edit Profile Photo" dialog should be popup', async () => {
    await avatarEditDialog.ensureLoaded();
  });


  await h(t).withLog('When I upload a jpg photo', async () => {
    await avatarEditDialog.uploadFile(filePath);
  });

  await h(t).withLog('Then The zoom control is showed', async () => {
    await t.expect(avatarEditDialog.zoomControl.exists).ok();
  });

  await h(t).withLog('When I click save button on Edit Profile Photo dialog', async () => {
    await avatarEditDialog.clickDoneButton();
  });

  await h(t).withLog('Then The Edit Profile Photo dialog is closed.', async () => {
    await avatarEditDialog.ensureDismiss();
  });

  await h(t).withLog('And The avatar in Edit Profile dialog is updated.', async () => {
    await t.expect(editProfileDialog.avatarEditDiv.getAttribute('icon')).match(/^blob:/);
  });

  await h(t).withLog('When I click save button on Edit Profile dialog', async () => {
    await editProfileDialog.clickSaveButton();
  });

  await h(t).withLog('Then The Edit Profile  dialog is closed.', async () => {
    await editProfileDialog.ensureDismiss();
  });

  await h(t).withLog('And avatar photo changed.', async () => {
    if (avatarUrl) {
      await t.expect(app.homePage.avatarImage.getAttribute('src')).notEql(avatarUrl);
    } else {
      await t.expect(app.homePage.avatarImage.exists).ok();
    }
  });

});


test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-2630'],
  maintainers: ['Potar.he'],
  keywords: ['Profile', 'Avatar']
})('Check the avatar can be saved successfully after user set the photo', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];

  const filePath = '../../sources/avatar.jpg';
  const defaultScale = '1';

  const app = new AppRoot(t);
  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });


  await h(t).withLog('When I open setting menu in home page', async () => {
    await app.homePage.openSettingMenu();
    await app.homePage.settingMenu.ensureLoaded();
  });

  await h(t).withLog('When I click view profile in setting menu', async () => {
    await app.homePage.settingMenu.clickDropMenuViewProfile();
  });

  const profileDialog = app.homePage.profileDialog;

  await h(t).withLog('Then user profile should be opened in viewer mode', async () => {
    await profileDialog.ensureLoaded();
  }, true);

  await h(t).withLog('When I click "Edit profile" button in viewer mode', async () => {
    await profileDialog.clickEditProfile();
  });

  const editProfileDialog = app.homePage.profileEditDialog;
  await h(t).withLog('Then user profile should be opened in edit mode', async () => {
    await editProfileDialog.ensureLoaded();
  }, true);

  await h(t).withLog('When I upload a photo', async () => {
    await editProfileDialog.uploadFile(filePath);
  });

  const avatarEditDialog = app.homePage.AvatarEditDialog;
  await h(t).withLog('Then  "Edit Profile Photo" dialog should be popup', async () => {
    await avatarEditDialog.ensureLoaded();
  });

  await h(t).withLog('When I upload a photo', async () => {
    await avatarEditDialog.uploadFile(filePath);
  });

  await h(t).withLog('Then The zoom control is showed', async () => {
    await t.expect(avatarEditDialog.zoomControl.exists).ok();
  });

  await h(t).withLog('Then zoom control appear, default value is {defaultScale}', async (step) => {
    step.setMetadata('defaultScale', defaultScale)
    await t.expect(avatarEditDialog.zoomValue).eql(defaultScale);
  });

  await h(t).withLog('When dragging the handle of zoom control using mouse', async () => {
    await t.drag(avatarEditDialog.zoomControl, 120, 0, { offsetX: 5, offsetY: 5 })
  });

  await h(t).withLog('The photo will zoom in relative to the center of the window', async () => {
    await t.expect(avatarEditDialog.zoomValue).notEql(defaultScale);
    await checkImageAtMiddle(avatarEditDialog);
  });

  let valueBeforePressKey;
  await h(t).withLog('When Using mouse wheel when hovering inside the window and seeing the four-way-arrow', async () => {
    if (!await avatarEditDialog.zoomControl.focused) {
      await t.click(avatarEditDialog.zoomControl);
    }
    valueBeforePressKey = await avatarEditDialog.zoomValue;
    await t.pressKey('right')
  });

  await h(t).withLog('The photo will zoom in relative to the center of the window', async () => {
    await t.expect(avatarEditDialog.zoomValue).notEql(valueBeforePressKey);
    await checkImageAtMiddle(avatarEditDialog);
  });

  // todo mousewheel

});


test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-2631'],
  maintainers: ['Potar.he'],
  keywords: ['Profile', 'Avatar']
})('Check when the photo display is reset to default and the zoom control is reset to 1x', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[4];

  const firstFilePath = '../../sources/avatar.jpg';
  const secondFilePath = '../../sources/avatar1.jpg'

  const app = new AppRoot(t);
  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });


  await h(t).withLog('When I open setting menu in home page', async () => {
    await app.homePage.openSettingMenu();
    await app.homePage.settingMenu.ensureLoaded();
  });

  await h(t).withLog('When I click view profile in setting menu', async () => {
    await app.homePage.settingMenu.clickDropMenuViewProfile();
  });

  const profileDialog = app.homePage.profileDialog;

  await h(t).withLog('Then user profile should be opened in viewer mode', async () => {
    await profileDialog.ensureLoaded();
  }, true);

  await h(t).withLog('When I click "Edit profile" button in viewer mode', async () => {
    await profileDialog.clickEditProfile();
  });

  const editProfileDialog = app.homePage.profileEditDialog;
  await h(t).withLog('Then user profile should be opened in edit mode', async () => {
    await editProfileDialog.ensureLoaded();
  }, true);

  await h(t).withLog('When I upload a photo', async () => {
    await editProfileDialog.uploadFile(filePath);
  });

  const avatarEditDialog = app.homePage.AvatarEditDialog;
  await h(t).withLog('Then "Edit Profile Photo" dialog should be popup', async () => {
    await avatarEditDialog.ensureLoaded();
  });

  await h(t).withLog('When I upload a jpg photo', async () => {
    await avatarEditDialog.uploadFile(firstFilePath);
  });

  await h(t).withLog('Then zoom control appear,  zoom control is reset to 1x', async () => {
    await checkPhotoFitToDisplayWindow(avatarEditDialog);
    await t.expect(avatarEditDialog.zoomValue).eql("1");
  });

  await h(t).withLog('When I click "cancel" button', async () => {
    await avatarEditDialog.clickCancelButton();
  });

  await h(t).withLog('Then Edit Profile Photo dialog is closed and app return to edit profile dialog.', async () => {
    await avatarEditDialog.ensureDismiss();
    await editProfileDialog.ensureLoaded();
  });

  await h(t).withLog('When I open "Edit Profile Photo" again and upload a jpg photo', async () => {
    await editProfileDialog.uploadFile(filePath);
    await avatarEditDialog.ensureLoaded();
    await avatarEditDialog.uploadFile(firstFilePath);
  });

  await h(t).withLog('Then The photo display is reset to default, zoom control is reset to 1x', async () => {
    await checkPhotoFitToDisplayWindow(avatarEditDialog);
    await t.expect(avatarEditDialog.zoomValue).eql("1");
  });

  await h(t).withLog('When dragging the handle of zoom control using mouse', async () => {
    await t.drag(avatarEditDialog.zoomControl, 120, 0, { offsetX: 5, offsetY: 5 })
  });


  await h(t).withLog('The photo will zoom in relative to the center of the window', async () => {
    await t.expect(avatarEditDialog.zoomValue).notEql("1");
    await checkImageAtMiddle(avatarEditDialog);
  });

  await h(t).withLog('When I upload a new jpg photo', async () => {
    await avatarEditDialog.uploadFile(secondFilePath);
  });

  await h(t).withLog('Then The photo display is reset to default, zoom control is reset to 1x', async () => {
    await checkPhotoFitToDisplayWindow(avatarEditDialog);
    await t.expect(avatarEditDialog.zoomValue).eql("1");
  });

});

async function checkPhotoFitToDisplayWindow(avatarEditDialog: AvatarEditDialog) {
  const circleHeight = await avatarEditDialog.circleArea.clientHeight;
  const circleWidth = await avatarEditDialog.circleArea.clientWidth;
  const photoHeight = await avatarEditDialog.image.clientHeight;
  const photoWidth = await avatarEditDialog.image.clientWidth;
  assert.ok(
    circleHeight == photoHeight || circleWidth == photoWidth,
    'the photo is not fit to the display window'
  )
}

async function checkImageAtMiddle(avatarEditDialog: AvatarEditDialog) {
  await H.retryUntilPass(async () => {
    const imagePositions = await avatarEditDialog.image.boundingClientRect;
    const canvasPositions = await avatarEditDialog.imageCanvas.boundingClientRect;
    const imageHorizontalMiddle = (imagePositions.right + imagePositions.left) / 2;
    const imageVerticalMiddle = (imagePositions.top + imagePositions.bottom) / 2;
    const canvasHorizontalMiddle = (canvasPositions.right + canvasPositions.left) / 2;
    const canvasVerticalMiddle = (canvasPositions.top + canvasPositions.bottom) / 2;
    assert.ok(
      Math.abs(imageHorizontalMiddle - canvasHorizontalMiddle) < 1 &&
      Math.abs(imageVerticalMiddle - canvasVerticalMiddle) < 1,
      "not middle"
    )
  })
}

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2902'],
  maintainers: ['Potar.he'],
  keywords: ['Profile', 'Avatar']
})('Check the default/group/team avatar cannot be open.', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const anotherUser = users[0]

  await h(t).withLog('Given I have a be checked avatar extension has not avatar photo in backend', async () => {
    await h(t).glip(anotherUser).init();
    const hasAvatarInBackend = !!await h(t).glip(anotherUser).getPersonPartialData('headshot');
    if (hasAvatarInBackend) {
      await h(t).resetGlipAccount(anotherUser);
    }
  });

  let chat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, anotherUser]
  }

  await h(t).withLog('And loginUser has a chat with the extension', async () => {
    await h(t).glip(loginUser).init();
    await h(t).scenarioHelper.createOrOpenChat(chat)
    await h(t).scenarioHelper.sendTextPost(uuid(), chat, anotherUser);
  });

  const app = new AppRoot(t);
  await h(t).withLog(`When I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And enter the chat', async () => {
    await app.homePage.messageTab.directMessagesSection.conversationEntryById(chat.glipId).enter();
  })

  const conversationPage = app.homePage.messageTab.conversationPage
  await h(t).withLog('When I open profile of the extension ', async () => {
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
  });

  const profileDialog = app.homePage.profileDialog;
  await h(t).withLog('And click the avatar', async () => {
    await profileDialog.ensureLoaded();
    await profileDialog.clickAvatar();
  });

  await h(t).withLog('Then the  profile dialog should keep open', async () => {
    await profileDialog.ensureLoaded();
  }, true);


  await h(t).withLog('And the avatar viewer should not be opened ', async () => {
    await app.homePage.viewerDialog.ensureDismiss();
  });


});


test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-2903'],
  maintainers: ['Potar.he'],
  keywords: ['Profile', 'Avatar']
})('Check the loading status when custom avatar can be opened in full screen.', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[0];
  const anotherUser = users[4]
  const avatarData = {
    // "creator_id": 90996739,
    "url": "https://glipasialabnet-glpci1xmn.s3.amazonaws.com/web/customer_files/72507404/1.jpg?Expires=2075494478&AWSAccessKeyId=AKIAJTSETWOUUVBJDLCA&Signature=5lupBH7xxLX6qYhMPaIjDLYqWtg%3D",
    "offset": "43x0",
    "crop": "172x172",
  }

  if (SITE_ENV === 'XMN-UP') {
    avatarData['url'] = 'https://glipasialabnet-xmnup.s3.amazonaws.com/web/customer_files/2891251724/download.png?Expires=2075494478&AWSAccessKeyId=AKIAIV55VIWRKLRZEYSA&Signature=Aij%2FJGSfmBoZJvllvKApk4c003w%3D';
  }

  let fullName;
  await h(t).withLog('Given I have a extension has avatar photo in backend', async () => {
    await h(t).glip(anotherUser).init();
    const hasAvatarInBackend = !!await h(t).glip(anotherUser).getPersonPartialData('headshot');
    avatarData['creator_id'] = await h(t).glip(anotherUser).toPersonId(anotherUser.rcId);
    if (!hasAvatarInBackend) {
      await h(t).glip(anotherUser).updatePerson({
        headshot: avatarData
      });
    }
    fullName = await h(t).glip(anotherUser).getPersonPartialData('display_name');
  });

  let chat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, anotherUser]
  }

  await h(t).withLog('And loginUser has a chat with the extension', async () => {
    await h(t).glip(loginUser).init();
    await h(t).scenarioHelper.createOrOpenChat(chat)
    await h(t).scenarioHelper.sendTextPost(uuid(), chat, anotherUser);
  });

  const app = new AppRoot(t);
  await h(t).withLog(`When I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And enter the chat', async () => {
    await app.homePage.messageTab.directMessagesSection.conversationEntryById(chat.glipId).enter();
  })

  const conversationPage = app.homePage.messageTab.conversationPage
  await h(t).withLog('When I open profile of the extension ', async () => {
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
  });

  const profileDialog = app.homePage.profileDialog;
  await h(t).withLog('And click the avatar', async () => {
    await profileDialog.ensureLoaded();
    await profileDialog.clickAvatar();
  });

  const avatarViewer = app.homePage.fileAndImagePreviewer;
  await h(t).withLog('Then The avatar was open in the full-screen image viewer with the full-size photo.', async () => {
    await avatarViewer.ensureLoaded();
    await avatarViewer.shouldBeFullScreen();
  }, true);

  await h(t).withLog('And the avatar viewer show title: {fullName}', async (step) => {
    step.setMetadata('fullName', fullName);
    await t.expect(avatarViewer.avatarUserName.textContent).eql(fullName);
  });

  await h(t).withLog('And the avatar viewer show close button', async () => {
    await t.expect(avatarViewer.closeButton.exists).ok();
  });

  await h(t).withLog('And the avatar viewer show zoom in/out icon', async () => {
    await t.hover(avatarViewer.imageCanvas);
    await t.expect(avatarViewer.zoomInButton.exists).ok();
    await t.expect(avatarViewer.zoomOutButton.exists).ok();
  });

  await h(t).withLog('And the avatar viewer show reset icon', async () => {
    await t.expect(avatarViewer.zoomResetButton.exists).ok();
  });

  await h(t).withLog('When I click close button', async () => {
    await avatarViewer.clickCloseButton();
  });

  await h(t).withLog('Then Should see profile dialog.', async () => {
    await avatarViewer.ensureDismiss();
    await profileDialog.ensureLoaded();
  });

  await h(t).withLog('When I click avatar icon again', async () => {
    await profileDialog.clickAvatar();
  });

  await h(t).withLog('Then Should see avatar viewer.', async () => {
    await avatarViewer.ensureLoaded();
  });

  await h(t).withLog('When I press esc', async () => {
    await avatarViewer.quitByPressEsc();
  });

  await h(t).withLog('Then Should see profile dialog.', async () => {
    await avatarViewer.ensureDismiss();
    await profileDialog.ensureLoaded();
  });

});
