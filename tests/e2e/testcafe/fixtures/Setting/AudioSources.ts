/*
 * @Author: Potar.He 
 * @Date: 2019-06-05 00:34:07 
 * @Last Modified by:   Potar.He 
 * @Last Modified time: 2019-06-05 00:34:07 
 */

import { v4 as uuid } from 'uuid';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { ITestMeta } from "../../v2/models";
import { WebphoneSession } from '../../v2/webphone/session';

import { ClientFunction } from 'testcafe';
import * as _ from 'lodash';
import * as assert from 'assert';

fixture('Phone/GeneralSettings')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-2113'],
  maintainers: ['potar.he'],
  keywords: ['GeneralSettings']
})(`The microphone/speaker source should be from the selected settings`, async (t) => {
  const users = h(t).rcData.mainCompany.users
  const loginUser = users[0];
  const caller = users[1];

  const app = new AppRoot(t);

  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  const settingTab = app.homePage.settingTab;
  const notificationAndSoundsPage = settingTab.notificationAndSoundsPage;


  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  let callerWebPhoneSession: WebphoneSession;
  await h(t).withLog(`And login a with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: caller.company.number,
      extension: caller.extension,
    })
    await h(t).newWebphoneSession(caller);
  });


  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`And I click Notifications and Sounds tab`, async () => {
    await settingTab.notificationAndSoundsEntry.enter();
  });

  const deviceInfos: deviceInfo[] = await getDeviceInfos();
  const audioInputs = _.filter(deviceInfos, { kind: "audioinput" });
  const audioOutputs = _.filter(deviceInfos, { kind: "audiooutput" });
  const defaultAudioInput = _.filter(deviceInfos, { kind: "audioinput", deviceId: 'default' })[0];
  const defaultAudioOutput = _.filter(deviceInfos, { kind: "audiooutput", deviceId: 'default' })[0];
  console.log(defaultAudioInput)
  console.log(defaultAudioOutput)



  await h(t).withLog(`Then I can see "{defaultMicroLabel}" in Microphone source selectorBox of audio sources section`, async (step) => {
    step.setMetadata('defaultMicroLabel', defaultAudioInput.label);
    // await notificationAndSoundsPage.currentMicrophoneSourceTextToBe(defaultDeviceText);
    // await notificationAndSoundsPage.currentMicrophoneSourceValueToBe(defaultDeviceValue);
  });


  await h(t).withLog(`And I can see "{defaultSpeakerLabel}" in Speaker source selectorBox of audio sources section`, async (step) => {
    step.setMetadata('defaultSpeakerLabel', defaultAudioOutput.label);
    // await notificationAndSoundsPage.currentSpeakerSourceTextToBe(defaultDeviceText);
    // await notificationAndSoundsPage.currentSpeakerSourceValueToBe(defaultDeviceValue);
  });


  /** insert input */
  await h(t).withLog(`When I click Microphone source selectorBox`, async () => {
    await notificationAndSoundsPage.clickMicrophoneSourceSelectBox();
  });

  await h(t).withLog(`Then microphone source should have {length} items and default device`, async (step) => {
    step.setMetadata('length', audioInputs.length.toString())
    await t.expect(notificationAndSoundsPage.microphoneSourceItems.count).eql(audioInputs.length);
    // await t.expect(notificationAndSoundsPage.microphoneSourceById(defaultAudioInput.deviceId).exists).ok();
  });

  const newAudioInput = <deviceInfo>{
    deviceId: uuid(),
    kind: "audioinput",
    label: "new Audio Input",
    groupId: uuid()
  }

  await h(t).withLog(`When I insert new audio input device`, async () => {
    deviceInfos.push(newAudioInput);
    console.log('deviceInfos', deviceInfos.length)
    audioInputs.push(newAudioInput);
    console.log('audioInputs', audioInputs.length)
    console.log('deviceInfos', deviceInfos)
    await mockDeviceInfos(deviceInfos);
  });

  await t.debug();
  await h(t).withLog(`Then microphone source should have {length} items`, async (step) => {
    step.setMetadata('length', audioInputs.length.toString())
    // await t.expect(notificationAndSoundsPage.microphoneSourceItems.count).eql(audioInputs.length);
  });

  await h(t).withLog(`And microphone source should have {label} with {id}`, async (step) => {
    step.initMetadata({
      'label': newAudioInput.label,
      id: newAudioInput.deviceId
    });
    await t.expect(notificationAndSoundsPage.microphoneSourceByLabel(newAudioInput.label).exists).ok();
    await t.expect(notificationAndSoundsPage.microphoneSourceById(newAudioInput.deviceId).exists).ok();
  });

  await h(t).withLog(`When I select the microphone source {labe}`, async (step) => {
    step.initMetadata({ 'label': newAudioInput.label });
    await notificationAndSoundsPage.selectMicrophoneSourceByLabel(newAudioInput.label);
  });

  await h(t).withLog(`Then I can see "{label}" in Microphone source selectorBox of audio sources section`, async (step) => {
    step.setMetadata('label', newAudioInput.label);
    await notificationAndSoundsPage.currentMicrophoneSourceLabelToBe(newAudioInput.label);
    await notificationAndSoundsPage.currentMicrophoneSourceIdToBe(newAudioInput.deviceId);
  });

  /** insert output */
  await h(t).withLog(`When I click speaker source selectorBox`, async () => {
    await notificationAndSoundsPage.clickSpeakerSourceSelectBox();
  });

  await h(t).withLog(`Then speaker source should have {length} items and default device`, async (step) => {
    step.setMetadata('length', audioInputs.length.toString())
    await t.expect(notificationAndSoundsPage.speakerSourceItems.count).eql(audioOutputs.length);
    // await t.expect(notificationAndSoundsPage.speakerSourceById(defaultAudioOutput.deviceId).exists).ok();
  });

  const newAudioOutput = <deviceInfo>{
    deviceId: uuid(),
    kind: "audiooutput",
    label: "new Audio output",
    groupId: uuid()
  }

  await h(t).withLog(`When I insert new audio output device`, async () => {
    deviceInfos.push(newAudioOutput);
    audioOutputs.push(newAudioOutput);
    await mockDeviceInfos(deviceInfos);
  });

  await h(t).withLog(`Then speaker source should have {length} items`, async (step) => {
    step.setMetadata('length', audioOutputs.length.toString())
    // await t.expect(notificationAndSoundsPage.speakerSourceItems.count).eql(audioInputs.length);
  });

  await h(t).withLog(`And speaker source should have {label} with {id}`, async (step) => {
    step.initMetadata({
      'label': newAudioOutput.label,
      id: newAudioOutput.deviceId
    });
    await t.expect(notificationAndSoundsPage.speakerSourceByLabel(newAudioOutput.label).exists).ok();
    await t.expect(notificationAndSoundsPage.speakerSourceById(newAudioOutput.deviceId).exists).ok();
  });

  await h(t).withLog(`When I select the speaker source {labe}`, async (step) => {
    step.initMetadata({ 'label': newAudioOutput.label });
    await notificationAndSoundsPage.selectSpeakerSourceByLabel(newAudioOutput.label);
  });

  await h(t).withLog(`Then I can see "{label}" in speaker source selectorBox of audio sources section`, async (step) => {
    step.setMetadata('label', newAudioOutput.label);
    await notificationAndSoundsPage.currentSpeakerSourceLabelToBe(newAudioOutput.label);
    await notificationAndSoundsPage.currentSpeakerSourceIdToBe(newAudioOutput.deviceId);
  });

  /** assert device in use */
  // await h(t).withLog(`When the caller call loginUser`, async () => {
  //   await callerWebPhoneSession.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
  // });

  // const telephonyDialog = app.homePage.telephonyDialog;
  // await h(t).withLog(`and loginUser answer the call`, async () => {
  //   await telephonyDialog.ensureLoaded();
  //   await telephonyDialog.clickAnswerButton();
  // });

  // await h(t).withLog(`Then the microphone source {deviceId} should be in use`, async (step) => {
  //   step.setMetadata('deviceId', newAudioInput.deviceId)
  //   const sinkId = await ClientFunction(() => {
  //     const videoElement = document.querySelector('video[id^=remote]');
  //     return videoElement["sinkId"];
  //   })()
  //   assert.ok(sinkId == newAudioInput.deviceId, `${sinkId} != ${newAudioInput.deviceId}`);
  // });

  // await h(t).withLog(`And I hangup the call`, async () => {
  //   await telephonyDialog.clickHangupButton();
  // });

  /** remove input */
  await h(t).withLog(`When I click Microphone source selectorBox`, async () => {
    await notificationAndSoundsPage.clickMicrophoneSourceSelectBox();
  });

  await h(t).withLog(`Then microphone source should have {length} items`, async (step) => {
    step.setMetadata('length', audioInputs.length.toString())
    await t.expect(notificationAndSoundsPage.microphoneSourceItems.count).eql(audioInputs.length);
  });

  await h(t).withLog(`When I remove the new audio device`, async () => {
    deviceInfos.splice(-2, 1);
    audioInputs.pop();
    console.log(deviceInfos)
    await mockDeviceInfos(deviceInfos);
  });

  await h(t).withLog(`Then microphone source should have {length} items and the new microphone device dismiss`, async (step) => {
    step.setMetadata('length', audioInputs.length.toString())
    // await t.expect(notificationAndSoundsPage.microphoneSourceItems.count).eql(audioInputs.length);
    await t.expect(notificationAndSoundsPage.microphoneSourceByLabel(newAudioInput.label).exists).notOk();
  });


  await h(t).withLog(`When I select the last used option of microphone source`, async () => {
    await notificationAndSoundsPage.selectMicrophoneSourceById('default')
  });

  await h(t).withLog(`Then I can see "{label}" in Microphone source selectorBox of audio sources section`, async (step) => {
    step.setMetadata('label', defaultAudioInput.label);
    await notificationAndSoundsPage.currentMicrophoneSourceLabelToBe(defaultAudioInput.label);
    await notificationAndSoundsPage.currentMicrophoneSourceIdToBe(defaultAudioInput.deviceId);
  });

  /** remove output */
  await h(t).withLog(`When I click speaker source selectorBox`, async () => {
    await notificationAndSoundsPage.clickSpeakerSourceSelectBox();
  });

  await h(t).withLog(`Then speaker source should have {length} items`, async (step) => {
    step.setMetadata('length', audioOutputs.length.toString())
    await t.expect(notificationAndSoundsPage.speakerSourceItems.count).eql(audioOutputs.length);
  });

  await h(t).withLog(`When I remove the new speaker device`, async () => {
    deviceInfos.pop();
    audioOutputs.pop();
    await mockDeviceInfos(deviceInfos);
  });

  await h(t).withLog(`Then speaker source should have {length} items and the new speaker device dismiss`, async (step) => {
    step.setMetadata('length', audioOutputs.length.toString())
    await t.expect(notificationAndSoundsPage.speakerSourceItems.count).eql(audioOutputs.length);
    await t.expect(notificationAndSoundsPage.speakerSourceByLabel(newAudioOutput.label).exists).notOk();
  });


  await h(t).withLog(`When I select the last used option of speaker source`, async () => {
    await notificationAndSoundsPage.selectSpeakerSourceById('default')
  });

  await h(t).withLog(`Then I can see "{label}" in speaker source selectorBox of audio sources section`, async (step) => {
    step.setMetadata('label', defaultAudioOutput.label);
    await notificationAndSoundsPage.currentSpeakerSourceLabelToBe(defaultAudioOutput.label);
    await notificationAndSoundsPage.currentSpeakerSourceIdToBe(defaultAudioOutput.deviceId);
  });

  /** todo check telephony */


});

interface deviceInfo {
  deviceId: string,
  kind: "audioinput" | "audiooutput" | "videoinput",
  label: string,
  groupId: string
}

async function getDeviceInfos() {
  const infos = await ClientFunction(() => {
    return navigator.mediaDevices.enumerateDevices().then(deviceInfos => {
      return JSON.stringify(deviceInfos);
    })
  })()
  return JSON.parse(infos);
}

async function mockDeviceInfos(deviceInfos) {
  await ClientFunction((deviceInfos) => {
    navigator.mediaDevices.enumerateDevices = () => new Promise<MediaDeviceInfo[]>((resolve, reject) => {
      resolve(deviceInfos);
    })
    navigator.mediaDevices.dispatchEvent(new Event('devicechange'));
  })(deviceInfos);
}