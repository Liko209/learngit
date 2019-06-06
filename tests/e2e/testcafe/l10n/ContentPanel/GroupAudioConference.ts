import { BrandTire, SITE_URL } from "../../config";
import { setupCase, teardownCase } from "../../init";
import { formalName } from "../../libs/filter";
import { AppRoot } from "../../v2/page-models/AppRoot";
import { h } from "../../v2/helpers";
import { v4 as uuid } from 'uuid';
import { FileAndImagePreviewer } from "../../v2/page-models/AppRoot/HomePage/ImagePreviewer";
import { IGroup } from "../../v2/models";

fixture('ContentPanel/GroupAudioConference')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('The audio conference message displayed in the conversation.', ['P2', 'ContentPanel', 'Message', 'GroupAudioConference', 'V1.4', 'Hanny.Han']),
  async (t) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4];
    const otherUser = users[5];
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();

    let team = <IGroup>{
      name: uuid(),
      type: 'Team',
      owner: loginUser,
      members: [loginUser, otherUser]
    }

    await h(t).withLog('Given I have an extension with 1 team chat, and start a audio conference to the team', async () => {
      await h(t).scenarioHelper.createTeam(team);
      await h(t).glip(loginUser).createSimpleAudioConference(team.glipId);
    });

    await h(t).withLog(`And I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('When I enter the team', async () => {
      await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    });

    const postCard = app.homePage.messageTab.conversationPage.nthPostItem(-1);
    await h(t).withLog('And I can find the last post is a audio conference', async () => {
      // await t.expect(postCard.AudioConferenceHeaderNotification.exists).ok();
    });

    await h(t).log('Then I capture screenshot', {screenshotPath: 'Jupiter_ContentPanel_GroupAudioConference'});

  });
