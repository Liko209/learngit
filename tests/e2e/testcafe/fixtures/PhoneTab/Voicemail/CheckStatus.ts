import * as assert from 'assert';
import { ClientFunction } from "testcafe";
import { BrandTire, SITE_URL } from "../../../config";
import { setupCase, teardownCase } from "../../../init";
import { h, H } from "../../../v2/helpers";
import { ITestMeta } from "../../../v2/models";
import { AppRoot } from "../../../v2/page-models/AppRoot";
import { ensuredOneVoicemail } from "./utils";

fixture('Setting/EnterPoint')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2503'],
  maintainers: ['Travis.Xu'],
  keywords: ['voicemail']
})('Voicemail will keep playing when the voicemail isn\'t visible in the view page', async (t) => {

  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const callee = users[4];
  const caller = users[5];

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: callee.company.number,
      extension: callee.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, callee);
    await app.homePage.ensureLoaded();
  });

  const voicemailPage = app.homePage.phoneTab.voicemailPage;
  await h(t).withLog('When I click Phone entry of leftPanel and click voicemail entry', async () => {
    await app.homePage.leftPanel.phoneEntry.enter();
    const telephoneDialog = app.homePage.telephonyDialog;
    if (await telephoneDialog.exists) {
      await app.homePage.closeE911Prompt()
      await telephoneDialog.clickMinimizeButton();
    }
    await app.homePage.phoneTab.voicemailEntry.enter();
  });

  await h(t).withLog('Then voicemail page should be open', async () => {
    await voicemailPage.ensureLoaded();
  });

  await ensuredOneVoicemail(t, caller, callee, app);

  const voicemailItem = voicemailPage.voicemailItemByNth(0);
  const itemId = await voicemailItem.id;

  await h(t).withLog('When I play the first voicemail record', async () => {
    await voicemailItem.clickPlayButton();
  });

  await h(t).withLog('Then the status is playing', async () => {
    await t.expect(voicemailItem.playButton.exists).notOk();
    await expectVoicemailItemInPlayStatus(t, voicemailItem);
    await expectVoicemailPlaying(t, itemId, app);
  });

  await h(t).withLog('When I filter out the playing voicemail to make the playing voicemail is not visible', async () => {
    await t.typeText(voicemailPage.filterInput, 'xxxxxxxxxMMMMMxxxxx');
    await t.expect(voicemailItem.exists).notOk();
  });

  await h(t).withLog('Then the voicemail keep playing', async () => {
    await expectVoicemailPlaying(t, itemId, app);
  });

  await h(t).withLog('When I delete the filter condition', async () => {
    await t.selectText(voicemailPage.filterInput).pressKey('delete');
  });

  await h(t).withLog('Then the voicemail is in the "play" status', async () => {
    await expectVoicemailItemInPlayStatus(t, voicemailItem);
    await expectVoicemailPlaying(t, itemId, app);
  });
});

async function expectVoicemailItemInPlayStatus(t, voicemailItem) {
  await t.expect(voicemailItem.playButton.exists).notOk();
  await t.expect(voicemailItem.pauseButton.exists).ok({ timeout: 30e3 });
  await t.expect(voicemailItem.currentTimeSpan.exists).ok();
}

async function expectVoicemailPlaying(t, itemId, app) {

  // '[' and ']' need to be escaped
  const audioId = `\\[voicemail\\]-\\[${itemId}\\]`;
  await t.expect(app.getSelector(`#${audioId}`).exists).ok();
  assert.strictEqual(await audioElementPaused(app, audioId), false, 'expect paused of audio is false but it is true');
}

async function audioElementPaused(app, audioId) {
  const sel = app.getSelector(`#${audioId}`);
  return await ClientFunction((sel) => {
    return sel().paused
  })(sel)
}
