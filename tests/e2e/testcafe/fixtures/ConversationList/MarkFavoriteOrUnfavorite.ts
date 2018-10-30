/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-10-29 13:26:39
 * Copyright © RingCentral. All rights reserved.
 */
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL } from '../../config';
import { GlipSdk } from '../../v2/sdk/glip';

fixture('ConversationList/MarkFavoriteOrUnfavorite')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());

test(
  formalName(
    'Display Favorite button when user tap more button of a conversation in DM/Teams & When user mark a conversation as favorite, move the conversation to favorite section.',
    ['P2', 'JPT-181', 'JPT-183', 'ConversationList'],
  ),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    const userPlatform = await h(t).sdkHelper.sdkManager.getPlatform(user);
    const glipSDK: GlipSdk = await h(t).sdkHelper.sdkManager.getGlip(user);
    const directMessagesSection =
      app.homePage.messagePanel.directMessagesSection;
    const teamsSection = app.homePage.messagePanel.teamsSection;
    const favoritesSection = app.homePage.messagePanel.favoritesSection;

    let group, team;
    await h(t).withLog(
      'Given I have an extension with a group and a team conversation',
      async () => {
        group = await userPlatform.createGroup({
          type: 'Group',
          members: [user.rcId, users[5].rcId, users[6].rcId],
        });
        team = await userPlatform.createGroup({
          type: 'Team',
          name: uuid(),
          members: [user.rcId, users[5].rcId],
        });
      },
    );

    await h(t).withLog(
      'And the conversations should not be hidden before login',
      async () => {
        await glipSDK.updateProfile(user.rcId, {
          [`hide_group_${group.data.id}`]: false,
          [`hide_group_${team.data.id}`]: false,
          favorite_group_ids: [],
        });
      },
    );

    await h(t).withLog(
      `When I login Jupiter with this extension: ${user.company.number}#${
      user.extension
      }`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );
    let groupItem;
    await h(t).withLog('Then I click more button of group', async () => {
      groupItem = directMessagesSection.conversations.filter(
        `[data-group-id="${group.data.id}"]`,
      );
      directMessagesSection.warnFlakySelector();
      const moreIcon = groupItem.find('span').withText('more_vert');
      await t.click(moreIcon);
    });

    let favoriteButton1;
    await h(t).withLog('I can find the favorite button', async () => {
      favoritesSection.warnFlakySelector();
      favoriteButton1 = app.homePage
        .getSelector('#render-props-menu')
        .find('li[data-test-automation-id="favToggler"]');
      await t.expect(favoriteButton1.exists).ok();
    });

    await h(t).withLog('Then I click the favorite button', async () => {
      await t.click(favoriteButton1);
      await t.wait(1e3);
    });

    await h(t).withLog(
      'Then I can find the item in favorite section but not in direct messages section',
      async () => {
        groupItem = directMessagesSection.conversations.filter(
          `[data-group-id="${group.data.id}"]`,
        );
        await t.expect(groupItem.exists).notOk();
        groupItem = favoritesSection.conversations.filter(
          `[data-group-id="${group.data.id}"]`,
        );
        await t.expect(groupItem.exists).ok();
      },
    );

    let teamItem;
    await h(t).withLog('Then I click more button of team', async () => {
      teamItem = teamsSection.conversations.filter(
        `[data-group-id="${team.data.id}"]`,
      );
      teamsSection.warnFlakySelector();
      const moreIcon = teamItem.find('span').withText('more_vert');
      await t.click(moreIcon);
    });

    let favoriteButton2;
    await h(t).withLog('I can find the favorite button', async () => {
      favoritesSection.warnFlakySelector();
      favoriteButton2 = app.homePage
        .getSelector('#render-props-menu')
        .find('li[data-test-automation-id="favToggler"]');
      await t.expect(favoriteButton2.exists).ok();
    });

    await h(t).withLog('Then I click the favorite button', async () => {
      await t.click(favoriteButton2);
      await t.wait(1e3);
    });

    await h(t).withLog(
      'Then I can find the item in favorite section but not in team section',
      async () => {
        teamItem = teamsSection.conversations.filter(
          `[data-group-id="${team.data.id}"]`,
        );
        await t.expect(teamItem.exists).notOk();
        teamItem = favoritesSection.conversations.filter(
          `[data-group-id="${team.data.id}"]`,
        );
        await t.expect(teamItem.exists).ok();
      },
    );
  },
);

test(
  formalName(
    'Display Unfavorite button when user tap more button of a conversation in favorite section. & When user mark a conversation as unfavorite, remove the conversation from favorite section.',
    ['P2', 'JPT-182', 'JPT-184', 'ConversationList'],
  ),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    const userPlatform = await h(t).sdkHelper.sdkManager.getPlatform(user);
    const glipSDK: GlipSdk = await h(t).sdkHelper.sdkManager.getGlip(user);
    const directMessagesSection =
      app.homePage.messagePanel.directMessagesSection;
    const teamsSection = app.homePage.messagePanel.teamsSection;
    const favoritesSection = app.homePage.messagePanel.favoritesSection;

    let group, team;
    await h(t).withLog(
      'Given I have an extension with a group and a team conversation',
      async () => {
        group = await userPlatform.createGroup({
          type: 'Group',
          members: [user.rcId, users[5].rcId, users[6].rcId],
        });
        team = await userPlatform.createGroup({
          type: 'Team',
          name: uuid(),
          members: [user.rcId, users[5].rcId],
        });
      },
    );

    await h(t).withLog(
      'Before login, the conversations should not be hidden and should have been marked as favorite already',
      async () => {
        await glipSDK.updateProfile(user.rcId, {
          [`hide_group_${group.data.id}`]: false,
          [`hide_group_${team.data.id}`]: false,
          favorite_group_ids: [+group.data.id, +team.data.id],
        });
      },
    );

    await h(t).withLog(
      `When I login Jupiter with this extension: ${user.company.number}#${
      user.extension
      }`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );
    let groupItem;
    await h(t).withLog('Then I click more button of group', async () => {
      groupItem = favoritesSection.conversations.filter(
        `[data-group-id="${group.data.id}"]`,
      );
      favoritesSection.warnFlakySelector();
      const moreIcon = groupItem.find('span').withText('more_vert');
      await t.click(moreIcon);
    });

    let unfavoriteButton1;
    await h(t).withLog('I can find the unfavorite button', async () => {
      favoritesSection.warnFlakySelector();
      unfavoriteButton1 = app.homePage
        .getSelector('#render-props-menu')
        .find('li[data-test-automation-id="favToggler"]');
      await t.expect(unfavoriteButton1.exists).ok();
    });

    await h(t).withLog('Then I click the unfavorite button', async () => {
      await t.click(unfavoriteButton1);
      await t.wait(1e3);
    });

    await h(t).withLog(
      'Then I can find the item in direct messages section but not in favorite section',
      async () => {
        groupItem = directMessagesSection.conversations.filter(
          `[data-group-id="${group.data.id}"]`,
        );
        await t.expect(groupItem.exists).ok();
        groupItem = favoritesSection.conversations.filter(
          `[data-group-id="${group.data.id}"]`,
        );
        await t.expect(groupItem.exists).notOk();
      },
    );

    let teamItem;
    await h(t).withLog('Then I click more button of team', async () => {
      teamItem = favoritesSection.conversations.filter(
        `[data-group-id="${team.data.id}"]`,
      );
      favoritesSection.warnFlakySelector();
      const moreIcon = teamItem.find('span').withText('more_vert');
      await t.click(moreIcon);
    });

    let unfavoriteButton2;
    await h(t).withLog('I can find the unfavorite button', async () => {
      unfavoriteButton2 = app.homePage
        .getSelector('#render-props-menu')
        .find('li[data-test-automation-id="favToggler"]');
      await t.expect(unfavoriteButton2.exists).ok();
    });

    await h(t).withLog('Then I click the unfavorite button', async () => {
      await t.click(unfavoriteButton2);
      await t.wait(1e3);
    });

    await h(t).withLog(
      'Then I can find the item in team section but not in favorite section',
      async () => {
        teamItem = teamsSection.conversations.filter(
          `[data-group-id="${team.data.id}"]`,
        );
        await t.expect(teamItem.exists).ok();
        teamItem = favoritesSection.conversations.filter(
          `[data-group-id="${team.data.id}"]`,
        );
        await t.expect(teamItem.exists).notOk();
      },
    );
  },
);

test(
  formalName(
    'When Me conversation is removed favorite mark, it should be displayed in DM section.',
    ['P2', 'JPT-185', 'ConversationList'],
  ),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    const glipSDK: GlipSdk = await h(t).sdkHelper.sdkManager.getGlip(user);
    const directMessagesSection =
      app.homePage.messagePanel.directMessagesSection;
    const teamsSection = app.homePage.messagePanel.teamsSection;
    const favoritesSection = app.homePage.messagePanel.favoritesSection;

    let meChatId;
    await h(t).withLog(
      'Given I have an extension with a me conversation',
      async () => {
        meChatId = (await glipSDK.getPerson(user.rcId)).data.me_group_id;
      },
    );

    await h(t).withLog(
      'Before login, the conversations should not be hidden and should have been marked as favorite already',
      async () => {
        await glipSDK.updateProfile(user.rcId, {
          [`hide_group_${meChatId}`]: false,
          favorite_group_ids: [+meChatId],
        });
      },
    );

    await h(t).withLog(
      `When I login Jupiter with this extension: ${user.company.number}#${
      user.extension
      }`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );
    let item;
    await h(t).withLog(
      'Then I click more button of me conversation item',
      async () => {
        item = favoritesSection.conversations.filter(
          `[data-group-id="${meChatId}"]`,
        );
        favoritesSection.warnFlakySelector();
        const moreIcon = item.find('span').withText('more_vert');
        await t.click(moreIcon);
      },
    );

    let unfavoriteButton;
    await h(t).withLog('I can find the unfavorite button', async () => {
      unfavoriteButton = app.homePage
        .getSelector('#render-props-menu')
        .find('li[data-test-automation-id="favToggler"]');
      await t.expect(unfavoriteButton.exists).ok();
    });

    await h(t).withLog('Then I click the unfavorite button', async () => {
      await t.click(unfavoriteButton);
      await t.wait(1e3);
    });

    await h(t).withLog(
      'Then I can find the item in direct messages section but not in favorite section nor in team section',
      async () => {
        item = directMessagesSection.conversations.filter(
          `[data-group-id="${meChatId}"]`,
        );
        await t.expect(item.exists).ok();
        item = favoritesSection.conversations.filter(
          `[data-group-id="${meChatId}"]`,
        );
        await t.expect(item.exists).notOk();
        item = teamsSection.conversations.filter(
          `[data-group-id="${meChatId}"]`,
        );
        await t.expect(item.exists).notOk();
      },
    );
  },
);
