/*
 * @Author: Potar.He 
 * @Date: 2019-06-05 00:34:07 
 * @Last Modified by:   Potar.He 
 * @Last Modified time: 2019-06-05 00:34:07 
 */

import { v4 as uuid } from 'uuid';
import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { ITestMeta } from "../../v2/models";
import { WebphoneSession } from '../../v2/webphone/session';

import { ClientFunction } from 'testcafe';
import * as _ from 'lodash';
import * as assert from 'assert';

fixture('NotificationAndSounds/AudioSources')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-2265'],
  maintainers: ['potar.he'],
  keywords: ['AudioSources']
})(`Check the default Microphone/Speaker source in a call/meeting/conference`, async (t) => {
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
  await h(t).withLog(`And login webphone with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: caller.company.number,
      extension: caller.extension,
    })
    callerWebPhoneSession = await h(t).newWebphoneSession(caller);
  });


  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`And I click Notifications and Sounds tab`, async () => {
    await settingTab.notificationAndSoundsEntry.enter();
  });

  const defaultDeviceId = 'default';
  const defaultDeviceLabel = 'Default';
  const deviceInfos: deviceInfo[] = await getDeviceInfos();
  const audioInputs = _.filter(deviceInfos, { kind: "audioinput" });
  const audioOutputs = _.filter(deviceInfos, { kind: "audiooutput" });

  await h(t).withLog(`Then I can see "{defaultMicroLabel}" in Microphone source selectorBox of audio sources section`, async (step) => {
    step.setMetadata('defaultMicroLabel', defaultDeviceLabel);
    await notificationAndSoundsPage.currentMicrophoneSourceLabelToBe(defaultDeviceLabel);
    await notificationAndSoundsPage.currentMicrophoneSourceIdToBe(defaultDeviceId);
  });

  for (let i = 0; i < audioOutputs.length; i++) {
    await h(t).withLog(`When I click speaker source selectorBox`, async () => {
      await notificationAndSoundsPage.clickSpeakerSourceSelectBox();
    });

    await h(t).withLog(`Then speaker source should have {length} items and default device`, async (step) => {
      step.setMetadata('length', audioOutputs.length.toString())
      await t.expect(notificationAndSoundsPage.speakerSourceItems.count).eql(audioOutputs.length);
      await t.expect(notificationAndSoundsPage.speakerSourceById(defaultDeviceId).exists).ok();
    });

    let label = '', deviceId = '';
    await h(t).withLog(`When I select the No.{index} speaker source `, async (step) => {
      step.initMetadata({ 'index': (i + 1).toString() });
      label = await notificationAndSoundsPage.speakerSourceItems.nth(i).textContent;
      deviceId = await notificationAndSoundsPage.getSpeakerSourceIdByNth(i)
      await notificationAndSoundsPage.selectSpeakerSourceByNth(i);
    });

    await h(t).withLog(`Then I can see "{label}" in speaker source selectorBox of audio sources section`, async (step) => {
      step.setMetadata('label', label);
      await notificationAndSoundsPage.currentSpeakerSourceLabelToBe(label);
      await notificationAndSoundsPage.currentSpeakerSourceIdToBe(deviceId);
    });

    /** assert device in use */
    await h(t).withLog(`When the caller call loginUser`, async () => {
      await callerWebPhoneSession.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
    });

    const telephonyDialog = app.homePage.telephonyDialog;
    await h(t).withLog(`and loginUser answer the call`, async () => {
      await telephonyDialog.ensureLoaded();
      await telephonyDialog.clickAnswerButton();
    });

    await h(t).withLog(`Then the speaker source id: {deviceId} should be in use`, async (step) => {
      step.setMetadata('deviceId', deviceId);
      let sinkId = ''
      await H.retryUntilPass(async () => {
        sinkId = await ClientFunction(() => {
          const videoElement = document.querySelector('video[id^=remote-audio-]');
          return videoElement["sinkId"];
        })();
        assert.ok(sinkId == deviceId, `${sinkId} != ${deviceId}`);
      })
    });

    await h(t).withLog(`And I hangup the call`, async () => {
      await t.wait(3e3); // wait phone call connected
      await telephonyDialog.clickHangupButton();
      await telephonyDialog.ensureDismiss();
    });
  }

  for (let i = 0; i < audioInputs.length; i++) {
    await h(t).withLog(`When I click Microphone source selectorBox`, async () => {
      await notificationAndSoundsPage.clickMicrophoneSourceSelectBox();
    });

    await h(t).withLog(`Then microphone source should have {length} items and default device`, async (step) => {
      step.setMetadata('length', audioInputs.length.toString())
      await t.expect(notificationAndSoundsPage.microphoneSourceItems.count).eql(audioInputs.length);
      await t.expect(notificationAndSoundsPage.microphoneSourceById(defaultDeviceId).exists).ok();
    });

    let label = '', deviceId = '';
    await h(t).withLog(`When I select the No.{index} microphone source `, async (step) => {
      step.initMetadata({ 'index': (i + 1).toString() });
      label = await notificationAndSoundsPage.microphoneSourceItems.nth(i).textContent;
      deviceId = await notificationAndSoundsPage.getMicrophoneSourceIdByNth(i)
      await notificationAndSoundsPage.selectMicrophoneSourceByNth(i);
    });

    await h(t).withLog(`Then I can see "{label}" in Microphone source selectorBox of audio sources section`, async (step) => {
      step.setMetadata('label', label);
      await notificationAndSoundsPage.currentMicrophoneSourceLabelToBe(label);
      await notificationAndSoundsPage.currentMicrophoneSourceIdToBe(deviceId);
    });

    // TODO:
    /** assert output device in use */
  }
});

test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-2113'],
  maintainers: ['potar.he'],
  keywords: ['AudioSources']
})(`The Microphone/Speaker source should be from the selected settings`, async (t) => {
  const users = h(t).rcData.mainCompany.users
  const loginUser = users[0];

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

  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`And I click Notifications and Sounds tab`, async () => {
    await settingTab.notificationAndSoundsEntry.enter();
  });

  const deviceInfos: deviceInfo[] = await getDeviceInfos();
  const audioInputs = _.filter(deviceInfos, { kind: "audioinput" });
  const audioOutputs = _.filter(deviceInfos, { kind: "audiooutput" });


  /** insert input */
  await h(t).withLog(`When I click Microphone source selectorBox`, async () => {
    await notificationAndSoundsPage.clickMicrophoneSourceSelectBox();
  });

  await h(t).withLog(`Then microphone source should have {length} items`, async (step) => {
    step.setMetadata('length', audioInputs.length.toString())
    await t.expect(notificationAndSoundsPage.microphoneSourceItems.count).eql(audioInputs.length);
  });

  const newAudioInput = <deviceInfo>{
    deviceId: uuid(),
    kind: "audioinput",
    label: "new Audio Input",
    groupId: uuid()
  }

  await h(t).withLog(`When I insert new audio input device`, async () => {
    deviceInfos.push(newAudioInput);
    audioInputs.push(newAudioInput);
    await mockDeviceInfos(deviceInfos);
  });

  await h(t).withLog(`Then microphone source should have {length} items`, async (step) => {
    step.setMetadata('length', audioInputs.length.toString())
    await t.expect(notificationAndSoundsPage.microphoneSourceItems.count).eql(audioInputs.length);
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

  await h(t).withLog(`Then speaker source should have {length} items`, async (step) => {
    step.setMetadata('length', audioInputs.length.toString())
    await t.expect(notificationAndSoundsPage.speakerSourceItems.count).eql(audioOutputs.length);
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
    await t.expect(notificationAndSoundsPage.speakerSourceItems.count).eql(audioInputs.length);
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
});

test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-2266', 'JPT-2267'],
  maintainers: ['potar.he'],
  keywords: ['AudioSources']
})(`The Microphone/Speaker source should be from the default when no last used device and the currently used device is removed 
& The Microphone/Speaker source should be from the last selected settings when the currently used device is removed`, async (t) => {
    const users = h(t).rcData.mainCompany.users
    const loginUser = users[0];

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

    await h(t).withLog(`When I click Setting entry`, async () => {
      await settingsEntry.enter();
    });

    await h(t).withLog(`And I click Notifications and Sounds tab`, async () => {
      await settingTab.notificationAndSoundsEntry.enter();
    });

    const defaultDeviceId = 'default';
    const defaultDeviceLabel = 'Default';

    const deviceInfos: deviceInfo[] = await getDeviceInfos();
    const audioInputs = _.filter(deviceInfos, { kind: "audioinput" });
    const audioOutputs = _.filter(deviceInfos, { kind: "audiooutput" });

    await h(t).withLog(`Then I can see "{defaultMicroLabel}" in Microphone source selectorBox of audio sources section`, async (step) => {
      step.setMetadata('defaultMicroLabel', defaultDeviceLabel);
      await notificationAndSoundsPage.currentMicrophoneSourceLabelToBe(defaultDeviceLabel);
      await notificationAndSoundsPage.currentMicrophoneSourceIdToBe(defaultDeviceId);
    });

    /** insert input */
    await h(t).withLog(`When I click Microphone source selectorBox`, async () => {
      await notificationAndSoundsPage.clickMicrophoneSourceSelectBox();
    });

    await h(t).withLog(`Then microphone source should have {length} items`, async (step) => {
      step.setMetadata('length', audioInputs.length.toString())
      await t.expect(notificationAndSoundsPage.microphoneSourceItems.count).eql(audioInputs.length);
    });

    const lastAudioInput = <deviceInfo>{
      deviceId: uuid(),
      kind: "audioinput",
      label: "last-Audio-Input",
      groupId: uuid()
    }

    const newAudioInput = <deviceInfo>{
      deviceId: uuid(),
      kind: "audioinput",
      label: "new-Audio-Input",
      groupId: uuid()
    }

    await h(t).withLog(`When I insert new audio input device`, async () => {
      deviceInfos.push(lastAudioInput, newAudioInput);
      audioInputs.push(lastAudioInput, newAudioInput);
      await mockDeviceInfos(deviceInfos);
    });

    await h(t).withLog(`Then microphone source should have {length} items`, async (step) => {
      step.setMetadata('length', audioInputs.length.toString())
      await t.expect(notificationAndSoundsPage.microphoneSourceItems.count).eql(audioInputs.length);
    });

    await h(t).withLog(`And microphone source should have {lastLabel} and {newLabel}`, async (step) => {
      step.initMetadata({
        lastLabel: lastAudioInput.label,
        newLabel: newAudioInput.label
      });
      await t.expect(notificationAndSoundsPage.microphoneSourceByLabel(lastAudioInput.label).exists).ok();
      await t.expect(notificationAndSoundsPage.microphoneSourceByLabel(newAudioInput.label).exists).ok();
    });

    await h(t).withLog(`When I select the microphone source {lastBabel}`, async (step) => {
      step.initMetadata({ 'lastBabel': lastAudioInput.label });
      await notificationAndSoundsPage.selectMicrophoneSourceByLabel(lastAudioInput.label);
    });

    await h(t).withLog(`Then I can see "{lastBabel}" in Microphone source selectorBox of audio sources section`, async (step) => {
      step.setMetadata('lastBabel', lastAudioInput.label);
      await notificationAndSoundsPage.currentMicrophoneSourceLabelToBe(lastAudioInput.label);
    });

    await h(t).withLog(`When I click Microphone source selectorBox`, async () => {
      await notificationAndSoundsPage.clickMicrophoneSourceSelectBox();
    })

    await h(t).withLog(`and I select the microphone source {newLabel}`, async (step) => {
      step.initMetadata({ 'newLabel': newAudioInput.label });
      await notificationAndSoundsPage.selectMicrophoneSourceByLabel(newAudioInput.label);
    });

    await h(t).withLog(`Then I can see "{newLabel}" in Microphone source selectorBox of audio sources section`, async (step) => {
      step.setMetadata('newLabel', newAudioInput.label);
      await notificationAndSoundsPage.currentMicrophoneSourceLabelToBe(newAudioInput.label);
    });

    /** remove input */
    await h(t).withLog(`When I remove the new microphone device`, async () => {
      deviceInfos.pop();
      audioInputs.pop();
      await mockDeviceInfos(deviceInfos);
    });

    await h(t).withLog(`Then I can see "{lastBabel}" in Microphone source selectorBox of audio sources section`, async (step) => {
      step.setMetadata('lastBabel', lastAudioInput.label);
      await notificationAndSoundsPage.currentMicrophoneSourceLabelToBe(lastAudioInput.label);
    });

    await h(t).withLog(`When I click Microphone source selectorBox`, async () => {
      await notificationAndSoundsPage.clickMicrophoneSourceSelectBox();
    });

    await h(t).withLog(`Then microphone source should have {length} items`, async (step) => {
      step.setMetadata('length', audioInputs.length.toString())

      await t.expect(notificationAndSoundsPage.microphoneSourceItems.count).eql(audioInputs.length);
    });

    await h(t).withLog(`And {newLabel} dismiss in drop down list`, async (step) => {
      step.setMetadata('newLabel', newAudioInput.label);
      await t.expect(notificationAndSoundsPage.microphoneSourceByLabel(newAudioInput.label).exists).notOk();
      await notificationAndSoundsPage.quitByPressEsc();
    });

    await h(t).withLog(`When I remove the last microphone device`, async () => {
      deviceInfos.pop();
      audioInputs.pop();
      await mockDeviceInfos(deviceInfos);
    });

    await h(t).withLog(`Then I can see "{default}" in Microphone source selectorBox of audio sources section`, async (step) => {
      step.setMetadata('default', defaultDeviceLabel);
      await notificationAndSoundsPage.currentMicrophoneSourceLabelToBe(defaultDeviceLabel);
    });

    await h(t).withLog(`When I click Microphone source selectorBox`, async () => {
      await notificationAndSoundsPage.clickMicrophoneSourceSelectBox();
    });

    await h(t).withLog(`Then microphone source should have {length} items`, async (step) => {
      step.setMetadata('length', audioInputs.length.toString());
      await t.expect(notificationAndSoundsPage.microphoneSourceItems.count).eql(audioInputs.length);
    });

    await h(t).withLog(`And {lastLabel} dismiss in drop down list`, async (step) => {
      step.setMetadata('lastLabel', lastAudioInput.label)
      await t.expect(notificationAndSoundsPage.microphoneSourceByLabel(lastAudioInput.label).exists).notOk();
      await notificationAndSoundsPage.quitByPressEsc();
    });

    /** insert output */
    await h(t).withLog(`When I click speaker source selectorBox`, async () => {
      await notificationAndSoundsPage.clickSpeakerSourceSelectBox();
    });

    await h(t).withLog(`Then speaker source should have {length} items`, async (step) => {
      step.setMetadata('length', audioInputs.length.toString())
      await t.expect(notificationAndSoundsPage.speakerSourceItems.count).eql(audioInputs.length);
    });

    const lastAudioOutput = <deviceInfo>{
      deviceId: uuid(),
      kind: "audiooutput",
      label: "last-Audio-Output",
      groupId: uuid()
    }

    const newAudioOutput = <deviceInfo>{
      deviceId: uuid(),
      kind: "audiooutput",
      label: "new-Audio-Output",
      groupId: uuid()
    }

    await h(t).withLog(`When I insert new audio output device`, async () => {
      deviceInfos.push(lastAudioOutput, newAudioOutput);
      audioOutputs.push(lastAudioOutput, newAudioOutput);
      await mockDeviceInfos(deviceInfos);
    });

    await h(t).withLog(`Then speaker source should have {length} items`, async (step) => {
      step.setMetadata('length', audioOutputs.length.toString())
      await t.expect(notificationAndSoundsPage.speakerSourceItems.count).eql(audioOutputs.length);
    });

    await h(t).withLog(`And speaker source should have {lastLabel} and {newLabel}`, async (step) => {
      step.initMetadata({
        lastLabel: lastAudioOutput.label,
        newLabel: newAudioOutput.label
      });
      await t.expect(notificationAndSoundsPage.speakerSourceByLabel(lastAudioOutput.label).exists).ok();
      await t.expect(notificationAndSoundsPage.speakerSourceByLabel(newAudioOutput.label).exists).ok();
    });

    await h(t).withLog(`When I select the speaker source {lastBabel}`, async (step) => {
      step.initMetadata({ 'lastBabel': lastAudioOutput.label });
      await notificationAndSoundsPage.selectSpeakerSourceByLabel(lastAudioOutput.label);
    });

    await h(t).withLog(`Then I can see "{lastBabel}" in speaker source selectorBox of audio sources section`, async (step) => {
      step.setMetadata('lastBabel', lastAudioOutput.label);
      await notificationAndSoundsPage.currentSpeakerSourceLabelToBe(lastAudioOutput.label);
    });

    await h(t).withLog(`When I click speaker source selectorBox`, async () => {
      await notificationAndSoundsPage.clickSpeakerSourceSelectBox();
    })

    await h(t).withLog(`and I select the speaker source {newLabel}`, async (step) => {
      step.initMetadata({ 'newLabel': newAudioOutput.label });
      await notificationAndSoundsPage.selectSpeakerSourceByLabel(newAudioOutput.label);
    });

    await h(t).withLog(`Then I can see "{newLabel}" in speaker source selectorBox of audio sources section`, async (step) => {
      step.setMetadata('newLabel', newAudioOutput.label);
      await notificationAndSoundsPage.currentSpeakerSourceLabelToBe(newAudioOutput.label);
    });

    /** remove output */
    await h(t).withLog(`When I remove the new speaker device`, async () => {
      deviceInfos.pop();
      audioOutputs.pop();
      await mockDeviceInfos(deviceInfos);
    });

    await h(t).withLog(`Then I can see "{lastBabel}" in speaker source selectorBox of audio sources section`, async (step) => {
      step.setMetadata('lastBabel', lastAudioOutput.label);
      await notificationAndSoundsPage.currentSpeakerSourceLabelToBe(lastAudioOutput.label);
    });

    await h(t).withLog(`When I click speaker source selectorBox`, async () => {
      await notificationAndSoundsPage.clickSpeakerSourceSelectBox();
    });

    await h(t).withLog(`Then speaker source should have {length} items`, async (step) => {
      step.setMetadata('length', audioOutputs.length.toString())

      await t.expect(notificationAndSoundsPage.speakerSourceItems.count).eql(audioOutputs.length);
    });

    await h(t).withLog(`And {newLabel} dismiss in drop down list`, async (step) => {
      step.setMetadata('newLabel', newAudioOutput.label);
      await t.expect(notificationAndSoundsPage.speakerSourceByLabel(newAudioOutput.label).exists).notOk();
      await notificationAndSoundsPage.quitByPressEsc();
    });

    await h(t).withLog(`When I remove the last speaker device`, async () => {
      deviceInfos.pop();
      audioOutputs.pop();
      await mockDeviceInfos(deviceInfos);
    });

    await h(t).withLog(`Then I can see "{default}" in speaker source selectorBox of audio sources section`, async (step) => {
      step.setMetadata('default', defaultDeviceLabel);
      await notificationAndSoundsPage.currentSpeakerSourceLabelToBe(defaultDeviceLabel);
    });

    await h(t).withLog(`When I click speaker source selectorBox`, async () => {
      await notificationAndSoundsPage.clickSpeakerSourceSelectBox();
    });

    await h(t).withLog(`Then speaker source should have {length} items`, async (step) => {
      step.setMetadata('length', audioOutputs.length.toString());
      await t.expect(notificationAndSoundsPage.speakerSourceItems.count).eql(audioOutputs.length);
    });

    await h(t).withLog(`And {lastLabel} dismiss in drop down list`, async (step) => {
      step.setMetadata('lastLabel', lastAudioOutput.label)
      await t.expect(notificationAndSoundsPage.speakerSourceByLabel(lastAudioOutput.label).exists).notOk();
      await notificationAndSoundsPage.quitByPressEsc();
    });

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