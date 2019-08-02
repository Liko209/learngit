import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL, BrandTire } from '../../config';
import { ITestMeta } from '../../v2/models';
import { v4 as uuid } from 'uuid';


fixture('Profile/ViewYourProfile')
    .beforeEach(setupCase(BrandTire.RCOFFICE))
    .afterEach(teardownCase());

test(formalName('Open personal profile via top bar avatar then open conversation', ['JPT-460', 'P1', 'spike.yang']), async (t) => {
    const loginUser = h(t).rcData.mainCompany.users[0];
    const app = new AppRoot(t);
    const editProfileDialog = app.homePage.editProfileDialog;

    await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
        await h(t).directLoginWithUser(SITE_URL, loginUser);
        await app.homePage.ensureLoaded();
    });
    await h(t).withLog('Then I can open setting menu in home page', async () => {
        await app.homePage.openSettingMenu();
        await app.homePage.settingMenu.ensureLoaded();
    });
    await h(t).withLog('When I click "Edit profile" button in setting menu', async () => {
        await app.homePage.settingMenu.clickEditYourProfile();
    });
    await h(t).withLog('Then user profile should be opened in edit mode', async () => {
        await editProfileDialog.ensureLoaded();
    }, true);

    });
    test.meta(<ITestMeta>{
      priority: ['P1'],
      caseIds: ['JPT-2648'],
      maintainers: ['William.Ye'],
      keywords: ['EditProfile']
    })(`Check the default options of the personal profile`, async (t) => {
      const loginUser = h(t).rcData.mainCompany.users[0];
      const app = new AppRoot(t);
      const viewProfile = app.homePage.profileDialog;
      const editProfile = app.homePage.editProfileDialog;

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
    await h(t).withLog('Then I can see Profile dialog', async () => {
      await viewProfile.ensureLoaded();
    });
    await h(t).withLog('When I click "Edit" button in setting menu', async () => {
        await viewProfile.clickEditProfile();
    });
    await h(t).withLog('Then I can see Edit Profile dialog', async () => {
        await editProfile.ensureLoaded();
    });
    await h(t).withLog('Then I can see options First Name/Last Name/Title/Location/Webpage in the dialog', async () => {
      await t.expect(editProfile.firstName.exists).ok();
      await t.expect(editProfile.lastName.exists).ok();
      await t.expect(editProfile.title.exists).ok();
      await t.expect(editProfile.location.exists).ok();
      await t.expect(editProfile.webpage.exists).ok();
    });
    await h(t).withLog('Then I can see the Cancel/Save button in the dialog', async () => {
      await t.expect(editProfile.cancelButton.exists).ok();
      await t.expect(editProfile.saveButton.exists).ok();
    });
  });
    test.meta(<ITestMeta>{
      priority: ['P2'],
      caseIds: ['JPT-2668'],
      maintainers: ['William.Ye'],
      keywords: ['EditProfile']
    })(`Check if the inline error message is shown when the webpage input is not valid`, async (t) => {
      const loginUser = h(t).rcData.mainCompany.users[0];
      const app = new AppRoot(t);
      const viewProfile = app.homePage.profileDialog;
      const editProfile = app.homePage.editProfileDialog;
      const webpage = `Webpage ${uuid()}`;
      const inlineError = 'Invalid webpage address';

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
    await h(t).withLog('Then I can see Profile dialog', async () => {
      await viewProfile.ensureLoaded();
    });
    await h(t).withLog('When I click "Edit" button in setting menu', async () => {
        await viewProfile.clickEditProfile();
    });
    await h(t).withLog('Then I can see Edit Profile dialog', async () => {
        await editProfile.ensureLoaded();
    });
    await h(t).withLog('Then I can input Webpage name randomly', async () => {
      await editProfile.inputWebpage(webpage);
    });
    await h(t).withLog('When I click "Save" button in edit profile dialog', async () => {
      await editProfile.clickSaveBtn();
    });
    await h(t).withLog(`Then the inline error shows: {inlineError}`, async (step) => {
      step.setMetadata('inlineError', inlineError);
      await t.expect(editProfile.webpageInlineError.textContent).eql(inlineError);
    });
  });

    test.meta(<ITestMeta>{
      priority: ['P2'],
      caseIds: ['JPT-2660'],
      maintainers: ['William.Ye'],
      keywords: ['EditProfile']
    })(`Check the maximum length for the profile options`, async (t) => {
      const loginUser = h(t).rcData.mainCompany.users[0];
      const app = new AppRoot(t);
      const viewProfile = app.homePage.profileDialog;
      const editProfile = app.homePage.editProfileDialog;

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
    await h(t).withLog('Then I can see Profile dialog', async () => {
      await viewProfile.ensureLoaded();
    });
    await h(t).withLog('When I click "Edit" button in setting menu', async () => {
        await viewProfile.clickEditProfile();
    });
    await h(t).withLog('Then I can see Edit Profile dialog', async () => {
        await editProfile.ensureLoaded();
    });
    await h(t).withLog('And I input First Name exceeded max characters(51)', async () => {
      await editProfile.typeRandomFirstName(51);
    });
    await h(t).withLog('Then Just only paste 50 characters into first name field, other characters should be automatically truncated.', async () => {
      const webpageValue = await editProfile.firstName.find('input').value;
      await t.expect(webpageValue.length).eql(50);
    });
    await h(t).withLog('And I input Last Name exceeded max characters(51)', async () => {
      await editProfile.typeRandomLastName(51);
    });
    await h(t).withLog('Then Just only paste 50 characters into last name field, other characters should be automatically truncated.', async () => {
      const webpageValue = await editProfile.lastName.find('input').value;
      await t.expect(webpageValue.length).eql(50);
    });
    await h(t).withLog('And I input Title exceeded max characters(201)', async () => {
      await editProfile.typeRandomTitle(201);
    });
    await h(t).withLog('Then Just only paste 200 characters into title field, other characters should be automatically truncated.', async () => {
      const webpageValue = await editProfile.title.find('input').value;
      await t.expect(webpageValue.length).eql(200);
    });
    await h(t).withLog('And I input Location exceeded max characters(201)', async () => {
      await editProfile.typeRandomLocation(201);
    });
    await h(t).withLog('Then Just only paste 200 characters into location field, other characters should be automatically truncated.', async () => {
      const webpageValue = await editProfile.location.find('input').value;
      await t.expect(webpageValue.length).eql(200);
    });
    await h(t).withLog('And I input webpage exceeded max characters(201)', async () => {
      await editProfile.typeRandomWebpage(201);
    });
    await h(t).withLog('Then Just only paste 200 characters into webpage field, other characters should be automatically truncated.', async () => {
      const webpageValue = await editProfile.webpage.find('input').value;
      await t.expect(webpageValue.length).eql(200);
    });
  });

  test.meta(<ITestMeta>{
    priority: ['P1'],
    caseIds: ['JPT-2665'],
    maintainers: ['William.Ye'],
    keywords: ['EditProfile']
  })(`Check if the user can successfully save the edit profile information`, async (t) => {
    const loginUser = h(t).rcData.mainCompany.users[0];
    const app = new AppRoot(t);
    const viewProfile = app.homePage.profileDialog;
    const editProfile = app.homePage.editProfileDialog;
    const newFirstName = "Hello"
    const newLastName = "World"
    let oldUserName = ""
    const newUserName = "Hello World"

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
  await h(t).withLog('Then I can see Profile dialog', async () => {
    await viewProfile.ensureLoaded();
  });

  await h(t).withLog('And I get current display name {displayName}', async (step) => {
    oldUserName = await viewProfile.name.textContent
    step.setMetadata('displayName', oldUserName)
  });
  await h(t).withLog('When I click "Edit" button in setting menu', async () => {
      await viewProfile.clickEditProfile();
  });
  await h(t).withLog('Then I can see Edit Profile dialog', async () => {
      await editProfile.ensureLoaded();
  });
  await h(t).withLog(`When I update first name to "{newFirstName}" and last name to "{newLastName}"`, async (step) => {
    step.initMetadata({ newFirstName, newLastName })
    await editProfile.updateFirstName(newFirstName, { replace: true });
    await editProfile.updateLastName(newLastName, { replace: true });
  });
  
  await h(t).withLog('When I click "Cancel" button in edit profile dialog', async () => {
    await editProfile.clickCancelBtn();
  });
  await h(t).withLog('Then I the Edit Profile dialog is dismissed', async () => {
    await editProfile.ensureDismiss();
  });
  await h(t).withLog('Then I can open setting menu in home page', async () => {
      await app.homePage.openSettingMenu();
      await app.homePage.settingMenu.ensureLoaded();
  });
  await h(t).withLog('When I click "Profile" button in setting menu', async () => {
    await app.homePage.settingMenu.clickViewYourProfile();
  });
  await h(t).withLog('Then I can see Profile dialog', async () => {
    await viewProfile.ensureLoaded();
  });
  await h(t).withLog('Then I can see the changes are discarded in Profile dialog', async () => {
    await t.expect(viewProfile.name.withExactText(oldUserName)).ok();
  });
  await h(t).withLog('When I click "Edit" button in setting menu', async () => {
      await viewProfile.clickEditProfile();
  });
  await h(t).withLog('Then I can see Edit Profile dialog', async () => {
      await editProfile.ensureLoaded();
  });
  await h(t).withLog(`When I update first name to "{newFirstName}" and last name to "{newLastName}"`, async (step) => {
    step.initMetadata({ newFirstName, newLastName })
    await editProfile.updateFirstName(newFirstName, { replace: true });
    await editProfile.updateLastName(newLastName, { replace: true });
  });
  await h(t).withLog('When I click "Save" button in edit profile dialog', async () => {
    await editProfile.clickSaveBtn();
  });
  await h(t).withLog('Then I the Edit Profile dialog is dismissed', async () => {
    await editProfile.ensureDismiss();
  });
  await h(t).withLog('Then I can open setting menu in home page', async () => {
      await app.homePage.openSettingMenu();
      await app.homePage.settingMenu.ensureLoaded();
  });
  await h(t).withLog('When I click "Profile" button in setting menu', async () => {
    await app.homePage.settingMenu.clickViewYourProfile();
  });
  await h(t).withLog('Then I can see Profile dialog', async () => {
    await viewProfile.ensureLoaded();
  });
  await h(t).withLog('Then I can see the changes made in Profile dialog', async () => {
    await t.expect(viewProfile.name.withExactText('newUserName')).ok();
  });
});

