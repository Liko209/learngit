import { v4 as uuid } from 'uuid';
import * as _ from 'lodash'; 
import { formalName } from '../../../libs/filter';
import { h } from '../../../v2/helpers';
import { setupCase, teardownCase } from '../../../init';
import { AppRoot } from '../../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../../config';
import { IGroup } from "../../../v2/models";
import { WebphoneSession } from '../../../v2/webphone/session';

fixture('Phone/GeneralSettings')
  .beforeEach(setupCase(BrandTire.RC_WITH_DID))
  .afterEach(teardownCase());

test(formalName(`Check the page content of the "General" section`, ['P2', 'JPT-1753', 'GeneralSettings', 'Mia.Cai']), async t => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);

  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  const settingTab = app.homePage.settingTab;
  const regionLabel = 'Region';
  const callerIDLabel = 'Caller ID';
  const callerIDDesc = 'Choose your default Caller ID for making RingCentral phone calls';
  const extensionSettingsLabel = 'Extension settings';
  const extensionDesc = ' Customize your RingCentral extension settings (call routing, voicemail greetings and more)';

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`And I click Phone tab`, async () => {
    await settingTab.phoneEntry.enter();
  });

  await h(t).withLog(`Then I can see Caller ID/Region/Extension settings in the 'General' section`, async () => {
    // TODO
    // todo
  });

});

test(formalName(`Check the caller id drop down list shows available numbers for the user`, ['P2', 'JPT-1756', 'GeneralSettings', 'Mia.Cai']), async t => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  const settingTab = app.homePage.settingTab;
  let callerIDMapList = new Map();
  let nickName ='';

  await h(t).withLog(`Given I get login user display name`, async () => {
    const res = await h(t).glip(loginUser).getPerson();
    nickName = res.data.display_name;
  });

  await h(t).withLog(`And I get login user phone number info`, async () => {
    const res = await h(t).platform(loginUser).getExtensionPhoneNumberList();
    const records= res.data.records;
    for(let i in records){
      callerIDMapList.set(records[i]['usageType'],records[i]['phoneNumber']);
    }
    callerIDMapList.set('Company number with nick name',loginUser.company.number + nickName);
    callerIDMapList.set('Blocked','Blocked');
    callerIDMapList.set('Company number',loginUser.company.number);
  });
  console.log(callerIDMapList);

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`And I click Phone tab`, async () => {
    await settingTab.phoneEntry.enter();
  });

  await h(t).withLog(`Then I can see the default of Caller ID in the 'General' section`, async () => {
    // TODO
    for(let value of callerIDMapList.values()){
      await settingTab.phoneTab.callerIDDropDownListWithText(value)
    }
  });

});

// TODO
test(formalName(`Check if the caller id is implemented correctly`, ['P2', 'JPT-1759', 'GeneralSettings', 'Mia.Cai']), async t => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const anotherUser = h(t).rcData.mainCompany.users[5];
  const app = new AppRoot(t);
  await h(t).platform(anotherUser).init();
  await h(t).glip(anotherUser).init();

  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  const settingTab = app.homePage.settingTab;
  const phoneTab = settingTab.phoneTab;
  const telephonyDialog = app.homePage.telephonyDialog;
  const miniProfile = app.homePage.miniProfile;
  const profileDialog = app.homePage.profileDialog;
  let chat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, anotherUser]
  }

  await h(t).withLog('Given I have a 1:1 chat', async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
  });

  let anotherUserName= '';
  await h(t).withLog('And I get the display name of one user ', async () => {
    anotherUserName = await h(t).glip(anotherUser).getPersonPartialData('display_name', anotherUser.rcId);
  });

  const otherUserPostId = await h(t).platform(anotherUser).sentAndGetTextPostId(`Other post ${uuid()}`, chat.glipId);

  let session: WebphoneSession;
  await h(t).withLog('And anpther user login webphone', async () => {
    session = await h(t).newWebphoneSession(anotherUser);
  });

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  let callerIDList = [];
  await h(t).withLog('Given I get the caller id list from the setting', async () => {
    callerIDList = await phoneTab.getCallerIDList();
    for(let i = 0; i < callerIDList.length; i++){
      if(callerIDList[i] == 'Blocked'){
        callerIDList[i]='Unknown Caller';
      }
    }
  });
  
  // Entry1: 1:1conversation
  // Change the caller id from the setting
  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`And I click Phone tab`, async () => {
    await settingTab.phoneEntry.enter();
  });

  let randomCallerID = _.sample(callerIDList);
  await h(t).withLog(`When I change the caller id from the setting`, async () => {
    await phoneTab.selectCallerID(randomCallerID);
  });

  const chatEntry = app.homePage.messageTab.directMessagesSection.conversationEntryById(chat.glipId);
  await h(t).withLog('And I open the 1:1 chat', async () => {
    await chatEntry.enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('Then the call button should display', async () => {
    await t.expect(conversationPage.telephonyButton).ok();
  });

  await h(t).withLog('When I click the call button', async () => {
    await conversationPage.clickTelephonyButton();
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog(`Then the caller id is ${randomCallerID} from anotherUser`, async () => {
    await session.waitForPhoneNumber(randomCallerID);
  });

  // Entry2: mini profile

  // Change the caller id from the setting
  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`And I click Phone tab`, async () => {
    await settingTab.phoneEntry.enter();
  });

  randomCallerID = _.sample(callerIDList);
  await h(t).withLog(`When I change the caller id from the setting`, async () => {
    await phoneTab.selectCallerID(randomCallerID);
  });

  await h(t).withLog('Given I click hangup button', async () => {
    await telephonyDialog.clickHangupButton();
    await telephonyDialog.ensureDismiss();
  });

  await h(t).withLog('When I click the at-mention on the post',async() => {
    const postItem = app.homePage.messageTab.conversationPage.postItemById(otherUserPostId);
    await postItem.clickAvatar();
  });

  await h(t).withLog('Then show mini profile',async() => {
    await miniProfile.shouldBePopUp();
  });

  await h(t).withLog('When I click call button on the mini profile',async() => {
    await miniProfile.clickTelephonyButton();
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog(`Then the caller id is ${randomCallerID} from anotherUser`, async () => {
    await session.waitForPhoneNumber(randomCallerID);
  });

  // Entry3: profile
  
  // Change the caller id from the setting
  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`And I click Phone tab`, async () => {
    await settingTab.phoneEntry.enter();
  });

  randomCallerID = _.sample(callerIDList);
  await h(t).withLog(`When I change the caller id from the setting`, async () => {
    await phoneTab.selectCallerID(randomCallerID);
  });
  await h(t).withLog('Given I click hangup button', async () => {
    await telephonyDialog.clickHangupButton();
    await telephonyDialog.ensureDismiss();
  });

  await h(t).withLog('When I click the avatar on the post',async() => {
    const postItem = app.homePage.messageTab.conversationPage.postItemById(otherUserPostId);
    await postItem.clickAvatar();
    await miniProfile.ensureLoaded();
  });

  await h(t).withLog('And I click the Profile button on mini profile',async() => {
    await miniProfile.openProfile();
    await profileDialog.ensureLoaded();
  });

  await h(t).withLog('When I click call button on the profile',async() => {
    await profileDialog.makeCall();
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog(`Then the caller id is ${randomCallerID} from anotherUser`, async () => {
    await session.waitForPhoneNumber(randomCallerID);
  });

  // Entry4: search result

  // Change the caller id from the setting
  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`And I click Phone tab`, async () => {
    await settingTab.phoneEntry.enter();
  });

  randomCallerID = _.sample(callerIDList);
  await h(t).withLog(`When I change the caller id from the setting`, async () => {
    await phoneTab.selectCallerID(randomCallerID);
  });

  await h(t).withLog('Given I click hangup button', async () => {
    await telephonyDialog.clickHangupButton();
    await telephonyDialog.ensureDismiss();
  });

  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog;
  const anotherUserRecord = searchDialog.instantPage.searchPeopleWithText(anotherUserName);
  await h(t).withLog(`When I search the person ${anotherUserName}`,async() => {
    await searchBar.clickSelf();
    await searchDialog.typeSearchKeyword(anotherUserName);
    await t.expect(anotherUserRecord.exists).ok();
  });

  await h(t).withLog('And I hover on the record',async() => {
    await t.hover(anotherUserRecord.self);
  });

  await h(t).withLog('When I click call button on the record',async() => {
    await anotherUserRecord.clickTelephonyButton();
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog(`Then the caller id is ${randomCallerID} from anotherUser`, async () => {
    await session.waitForPhoneNumber(randomCallerID);
  });

});

// Region settings
test(formalName(`Check if the content of region section is displayed correctly;`, ['P2', 'JPT-1788', 'GeneralSettings', 'Mia.Cai']), async t => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);

  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  const settingTab = app.homePage.settingTab;
  const updateRegionDialog =settingTab.phoneTab.updateRegionDialog;
  const title = 'Home country code';
  const statement = 'Set the country and area code for your region. This will be used for local and emergency dialing and phone number formatting.';
  const saveButton = 'Save';
  const cancelButton = 'Cancel';

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`And I click Phone tab`, async () => {
    await settingTab.phoneEntry.enter();
  });

  await h(t).withLog(`And I click Update button in the Region`, async () => {
    await settingTab.phoneTab.clickRegionUpdateButton();
  });

  await h(t).withLog(`Then the update region popup shows`, async () => {
    await updateRegionDialog.showUpdateRegionDialog();
  });

  await h(t).withLog(`And check the popup with title/statement/Area code/buttons`, async () => {
    await updateRegionDialog.checkTitle(title);
    await updateRegionDialog.checkStatement(statement);
    await updateRegionDialog.checkSaveButton(saveButton);
    await updateRegionDialog.checkCancelButton(cancelButton);
  });
  

});

test(formalName(`Check when the area code is displayed`, ['P2','JPT-1790', 'GeneralSettings', 'Mia.Cai']), async t => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);

  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  const settingTab = app.homePage.settingTab;
  const updateRegionDialog =settingTab.phoneTab.updateRegionDialog;
  const countryList = ['US','CA','Puerto Ricco','China','Mexico','Australia'];
  const otherCountry='Korea';

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`And I click Phone tab`, async () => {
    await settingTab.phoneEntry.enter();
  });

  await h(t).withLog(`And I click Update button in the Region`, async () => {
    await settingTab.phoneTab.clickRegionUpdateButton();
  });

  await h(t).withLog(`Then the update region popup shows`, async () => {
    await updateRegionDialog.showUpdateRegionDialog();
  });

  await h(t).withLog(`And the dial plan shows`, async () => {
    await updateRegionDialog.showCountryDropDown();
  });

  for(let i in countryList){
    await h(t).withLog(`When select the country as "${countryList[i]}"`, async () => {
      // TODO
      await updateRegionDialog.selectCountry(countryList[i]);
    });
    await h(t).withLog(`Then Area code input box shows`, async () => {
      await updateRegionDialog.showAreaCode();
    });
  }

  await h(t).withLog(`When Selected a country not US/CA/Puerto Rico/China/Mexico/Australia`, async () => {
    // TODO
    await updateRegionDialog.selectCountry(otherCountry);
  });

  await h(t).withLog(`Then no Area code input box shows`, async () => {
    await updateRegionDialog.noAreaCode();
  });

});

test(formalName(`Check the dialog status when user save/cancel changes made on dialog`, ['P2', 'JPT-1798', 'GeneralSettings', 'Mia.Cai']), async t => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);

  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  const settingTab = app.homePage.settingTab;
  const updateRegionDialog =settingTab.phoneTab.updateRegionDialog;
  const country = 'US';
  const toast = 'Your region is updated successfully';

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`And I click Phone tab`, async () => {
    await settingTab.phoneEntry.enter();
  });

  await h(t).withLog(`And I click Update button in the Region`, async () => {
    await settingTab.phoneTab.clickRegionUpdateButton();
  });

  await h(t).withLog(`Then the update region popup shows`, async () => {
    await updateRegionDialog.showUpdateRegionDialog();
  });

  // get the default country
  const defaultCountry = await updateRegionDialog.countryDropDown.nth(0).innerText;
  await h(t).withLog(`When I change the dial plan/area`, async () => {
    // TODO
    await updateRegionDialog.selectCountryByIndex(1);
  });

  await h(t).withLog(`And I click cancel button`, async () => {
    await updateRegionDialog.clickCancelButton();
  });

  await h(t).withLog(`Then the dialog is closed`, async () => {
    await updateRegionDialog.noUpdateRegionDialog();
  });

  
  await h(t).withLog(`And the the default change should keep the same`, async () => {
      await t.expect(settingTab.phoneTab.regionFieldWithText(defaultCountry)).ok();
  });
 
  let areaCode;
  await h(t).withLog(`When I change the dial plan/area`, async () => {
    // TODO
    await updateRegionDialog.selectCountry(country);
    await updateRegionDialog.selectAreaCodeByIndex(1);
    areaCode = updateRegionDialog.areaCode.nth(1).innerText;
  });

  await h(t).withLog(`Then I can see the changes`, async () => {
    await t.expect(updateRegionDialog.countryDropDown.nth(0).innerText).eql(country);
    await t.expect(updateRegionDialog.areaCode.nth(1).innerText).eql(areaCode);
  });

  await h(t).withLog(`When I click save button`, async () => {
    await updateRegionDialog.clickSaveButton();
  });

  await h(t).withLog(`Then the dialog is closed`, async () => {
    await updateRegionDialog.noUpdateRegionDialog();
  });

  await h(t).withLog(`And show a success flash toast "${toast}"`, async () => {
    await updateRegionDialog.checkSuccessToast(toast);
  });

  await h(t).withLog(`Then I can see the changes`, async () => {
    await t.expect(settingTab.phoneTab.regionDescription.withText(country)).ok();
    await t.expect(settingTab.phoneTab.regionDescription.withText(areaCode)).ok();
  });

});