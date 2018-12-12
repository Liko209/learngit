/*
 * @Author: Mia Cai (mia.cai@ringcentral.com)
 */
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL } from '../../config';
import * as _ from 'lodash';

fixture('ConversationList/maxConversation')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());

const DEFAULT_MAX_NUMBER = 20;
test(formalName('JPT-58 Show conversations with limit count conversations, older unread and current opened;JPT-344 The conversation will disappear when removing one older conversation from Fav and the section shows >= limit count conversations',
    ['JPT-58', 'JPT-344', 'P2', 'P1', 'ConversationList', 'Mia.Cai']),
  async (t: TestController) => {
    const createdNum = 6;
    const MAX_NUMBER = 3;
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    await h(t).resetGlipAccount(user);
    user.sdk = await h(t).getSdk(user);
    const user5Platform = await h(t).getPlatform(users[5]);
    const teamsSection = app.homePage.messageTab.teamsSection;
    const favoritesSection = app.homePage.messageTab.favoritesSection;

    await h(t).withLog('Given I clear all UMIs before login', async () => {
      await user.sdk.glip.clearAllUmi();
    });

    let newTeam1;
    await h(t).withLog(`And I create one new teams`, async () => {
      newTeam1 = await user.sdk.platform.createGroup({
        type: 'Team',
        name: uuid(),
        members: [user.rcId, users[5].rcId],
      });
    });

    await h(t).withLog(`And 1.favorite the created team(JPT-344) 2.Set limit conversation count=${MAX_NUMBER}(JPT-58)`, async () => {
      await user.sdk.glip.setMaxTeamDisplay(user.rcId, MAX_NUMBER);
      await user.sdk.glip.favoriteGroups(user.rcId, [+newTeam1.data.id]);
    });

    const newTeamIds = [];
    const umiIds = [1, 5 ,6];
    await h(t).withLog(`And I create ${createdNum} new teams`, async () => {
      for (let i = createdNum; i > 0; i--) {
        const newTeam = await user.sdk.platform.createGroup({
          type: 'Team',
          name: i + '====' + uuid(),
          members: [user.rcId, users[5].rcId],
        });
        if (_.includes(umiIds, i)) {
          await h(t).withLog(`And make conversation${i} has unread`, async () => {
            await user5Platform.createPost({ text: `${uuid()} ![:Person](${user.rcId})` }, newTeam.data.id);
          })
        }
        newTeamIds.unshift(newTeam.data.id);
      }
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
      await app.homePage.ensureLoaded(); 
    }, true);

    await h(t).withLog('And Make sure current opened conversation isn\'t older team)', async () => {
      await teamsSection.conversationEntryById(newTeamIds[1]).enter();
    });

    const realNum = 5;
    await h(t).withLog(`Then max conversation count should be exceeded, total number should be ${realNum}`, async () => {
      const count = await teamsSection.conversations.count;
      await t.expect(count).eql(realNum);
    }, true);

    await h(t).withLog('And all new teams except the conversation.4 should be found in the team section', async () => {
      let expectNewTeamIds = Array.from(newTeamIds);
      expectNewTeamIds.splice(3, 1);
      for (let i = 0; i < expectNewTeamIds.length; i++) {
        await t.expect(teamsSection.conversationEntryById(expectNewTeamIds[i]).exists).ok();
      }
      await t.expect(teamsSection.conversationEntryById(newTeamIds[3]).exists).notOk();
    });

    const conversation1 = teamsSection.conversationEntryById(newTeamIds[0]);
    const conversation5 = teamsSection.conversationEntryById(newTeamIds[4]);

    await h(t).withLog('When I click the unread conversation.1 ', async () => {
      await conversation1.enter();
      await t.wait(5e3);
    });

    await h(t).withLog('And I navigate away from conversation.1 (click conversation.5 )', async () => {
      await conversation5.enter();
      await t.wait(5e3);
    });

    await h(t).withLog('Then unread conversation.1 should remain in the section', async () => {
      await t.expect(conversation1.exists).ok();
    });

    await h(t).withLog('And unread conversation.5 should remain in the section', async () => {
      await t.expect(conversation5.exists).ok();
    });

    await h(t).withLog('When I navigate away from conversation.5 (click conversation.1 )', async () => {
      await conversation1.enter();
      await t.wait(5e3);
    });

    await h(t).withLog('Then conversation.5 should be hide', async () => {
      await t.expect(conversation5.exists).notOk();
    });

    await h(t).withLog('When the hide conversation.5 received new message ', async () => {
      await user5Platform.createPost({ text: `${uuid()} ![:Person](${user.rcId})` }, newTeamIds[4]);
    });

    await h(t).withLog('Then All new teams except the conversation.3/4 should be found in the team section', async () => {
      const expectNewTeamIds = Array.from(newTeamIds);
      expectNewTeamIds.splice(2, 2); 
      for (let i = 0; i < expectNewTeamIds.length; i++) {
        await t.expect(teamsSection.conversationEntryById(expectNewTeamIds[i]).exists).ok(newTeamIds.indexOf(expectNewTeamIds[i]) + " : " + expectNewTeamIds[i]);
      }
      await t.expect(teamsSection.conversationEntryById(newTeamIds[2]).exists).notOk();
      await t.expect(teamsSection.conversationEntryById(newTeamIds[3]).exists).notOk();
    });

    // case: JPT-344  remove one older team from fav
    const favConversation = favoritesSection.conversationEntryById(newTeam1.data.id);
    await h(t).withLog(`When remove the team ${newTeam1} from fav`, async () => {
      await favConversation.openMoreMenu();
      await app.homePage.messageTab.moreMenu.favoriteToggler.enter();
    });

    await h(t).withLog('The older fav team will disappear', async () => {
      await t.expect(favConversation.exists).notOk();
      await user.sdk.glip.setMaxTeamDisplay(user.rcId, DEFAULT_MAX_NUMBER);
    });
  }
);


test(formalName('JPT-353 maxConversation=limit conversation count(without unread); JPT-310 Shouldn\'t automatically bring up an older conversation when remove one conversation;JPT-342 The conversation will be back to the section when removing one conversation from Fav and it isn\'t older than the conversation list',
    ['JPT-353', 'JPT-310', 'JPT-342', 'P2', 'ConversationList', , 'Mia.Cai']),
  async (t: TestController) => {
    const MAX_NUMBER = 3;
    let realNum = MAX_NUMBER;
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    user.sdk = await h(t).getSdk(user);
    const teamsSection = app.homePage.messageTab.teamsSection;
    const favoritesSection = app.homePage.messageTab.favoritesSection;


    await h(t).withLog('Given clear all UMIs before login', async () => {
      await user.sdk.glip.clearAllUmi();
    });

    await h(t).withLog(`And set limit conversation count=${MAX_NUMBER}(JPT-353)`, async () => {
      await user.sdk.glip.updateProfile(user.rcId, { max_leftrail_group_tabs2: MAX_NUMBER })
    });

    await h(t).withLog('And I set user skip_close_conversation_confirmation is true before login',async () => {
        await user.sdk.glip.updateProfile(user.rcId, {skip_close_conversation_confirmation: true,});
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
        await t.wait(5e3);
    });

    const newTeamIds = [];
    await h(t).withLog(`And I create ${MAX_NUMBER} new teams`, async () => {
      for (let i = MAX_NUMBER; i > 0; i--) {
        const newTeam = await user.sdk.platform.createGroup({
          type: 'Team',
          name: uuid(),
          members: [user.rcId, users[5].rcId],
        });
        if (i === MAX_NUMBER) {
          await h(t).withLog('And make sure current opened conversation isn\'t older team)', async () => {
            await teamsSection.nthConversationEntry(0).enter();
          });
        }
        newTeamIds.push(newTeam.data.id);
      }
    });

    // case JPT-353
    await h(t).withLog(`Then max conversation count should be limited, total number should be ${realNum}`, async () => {
      await t.expect(teamsSection.conversations.count).eql(realNum, { timeout: 10e3});
    });

    await h(t).withLog(`When I refresh page`, async () => {
      await h(t).refresh();
      await app.homePage.messageTab.ensureLoaded(10e3);
    });

    await h(t).withLog(`Then max conversation count = ${realNum}`, async () => {
      await t.expect(teamsSection.conversations.count).eql(realNum, { timeout: 10e3});
    });

    // case JPT-310
    const conversation3 = teamsSection.nthConversationEntry(2);
    const conversation2 = teamsSection.nthConversationEntry(1);

    await h(t).withLog("When I click conversation.3's close buttom", async () => {
      await conversation3.openMoreMenu();
      await app.homePage.messageTab.moreMenu.close.enter();
    });

    realNum = MAX_NUMBER - 1;
    await h(t).withLog(`Then max conversation count = ${realNum}`, async () => {
      await t.expect(teamsSection.conversations.count).eql(realNum, { timeout: 5e3});
    });

    await h(t).withLog("When I click conversation.2's favorite buttom", async () => {
      await conversation2.openMoreMenu();
      await app.homePage.messageTab.moreMenu.favoriteToggler.enter();
    });

    realNum = realNum - 1;
    await h(t).withLog(`Then max conversation count = ${realNum}`, async () => {
      await t.expect(teamsSection.conversations.count).eql(realNum, { timeout: 5e3});
    });

    // case JPT-342
    const favConversation = favoritesSection.nthConversationEntry(0);
    await h(t).withLog("When I remove conversation.2 from favorite", async () => {
      await favConversation.openMoreMenu();
      await app.homePage.messageTab.moreMenu.favoriteToggler.enter();
    });

    await h(t).withLog('Then conversation.2 is back to the section', async () => {
      await t.expect(conversation2.exists).ok();
    });

    realNum = realNum + 1;
    await h(t).withLog(`And max conversation count = ${realNum}`, async () => {
      await t.expect(teamsSection.conversations.count).eql(realNum, { timeout: 5e3});
      await user.sdk.glip.updateProfile(user.rcId, { max_leftrail_group_tabs2: DEFAULT_MAX_NUMBER });
    });
  }
);
