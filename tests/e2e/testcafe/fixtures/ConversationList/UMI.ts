import { formalName } from '../../libs/filter';
import { setUp, tearDown, TestHelper } from '../../libs/helpers';
import { directLogin } from '../../utils';
import { ConversationItemUMI } from '../../page-models/components/ConversationList/ConversationItemUMI';
import {
  DirectMessageSection,
  TeamSection,
  FavoriteSection,
} from '../../page-models/components';
import { setupSDK } from '../../utils/setupSDK';
import * as _ from 'lodash';
import {
  prepareConversations,
  clearAllUMI,
  setFavoriteConversations,
} from '../utils';

declare var test: TestFn;
fixture('ConversationStream/ConversationStream').skip
  .beforeEach(setUp('GlipBetaUser(1210,4488)'))
  .afterEach(tearDown());

test(
  formalName('UMI add receive message count', [
    'JPT-107',
    'P0',
    'ConversationList',
  ]),
  async (t: TestController) => {
    await setupSDK(t);
    const h = new TestHelper(t);
    const { privateChat, group, team } = await prepareConversations(t, [
      { type: 'privateChat', identifier: 'privateChat' },
      { type: 'group', identifier: 'group' },
      { type: 'team', identifier: 'team' },
    ]);

    const chain1 = directLogin(t)
      .log('1.Navigate to DirectMessageSection')
      .shouldNavigateTo(DirectMessageSection)
      .expectExist()
      .log('2.Check the section is expanded')
      .shouldExpand()
      .log('3.Click items to reset')
      .clickItemById(+group.id)
      .log("4.Click private chat so target items won't be affected")
      .clickItemById(+privateChat.id)
      .shouldNavigateTo(ConversationItemUMI)
      .log('5.Get initial unread count')
      .getUnreadCount(+group.id, 'dmUnreadCount');
    await chain1;
    const dmUnreadCount = t.ctx.dmUnreadCount;
    h.log(`6.Initial unread count is ${dmUnreadCount}`);

    const chain2 = chain1
      .log('7.Send post to group')
      .sendPostToGroup('TestGroupUMI', +group.id)
      .chain(t => t.wait(3000))
      .log('8.Check the post UMI of group')
      .checkUnread(+group.id, dmUnreadCount + 1)
      .log('9.Send mention post to group')
      .sendMentionToGroup(+group.id)
      .log('10.Check the mention UMI of group')
      .chain(t => t.wait(3000))
      .checkMentionUMI(+group.id, dmUnreadCount + 2)
      .log('11.Navigate to TeamSection')
      .shouldNavigateTo(TeamSection)
      .expectExist()
      .log('12.Check the section is expanded')
      .shouldExpand()
      .shouldNavigateTo(ConversationItemUMI)
      .log('13.Get initial unread count')
      .getUnreadCount(+team.id, 'teamUnreadCount');
    await chain2;
    const teamUnreadCount = t.ctx.teamUnreadCount;
    h.log(`14.Initial unread count is ${teamUnreadCount}`);

    await chain2
      .log('15.Send post to Team')
      .sendPostToGroup('TestTeamUMI', +team.id)
      .log('16.Check Team UMI')
      .chain(t => t.wait(3000))
      .checkUnread(+team.id, teamUnreadCount, false)
      .log('17.Send mention post to team')
      .sendMentionToGroup(+team.id)
      .log('18.Check the mention UMI of team')
      .chain(t => t.wait(3000))
      .checkMentionUMI(+team.id, teamUnreadCount + 1);
  },
);

test(
  formalName('Remove UMI when open conversation', [
    'JPT-103',
    'P0',
    'ConversationList',
  ]),
  async (t: TestController) => {
    await setupSDK(t);
    const h = new TestHelper(t);
    const { privateChat, team } = await prepareConversations(t, [
      { type: 'privateChat', identifier: 'privateChat' },
      { type: 'team', identifier: 'team' },
    ]);

    h.log('Send a mention post to the team');
    const client702 = await h.glipApiManager.getClient(
      h.users.user702,
      h.companyNumber,
    );
    await client702.sendPost(team.id, {
      groupId: team.id.toString(),
      text: `Hi, ![:Person](${h.users.user701.rc_id}), take a look!`,
    });

    await directLogin(t)
      .log('1.Navigate to DirectMessageSection')
      .shouldNavigateTo(DirectMessageSection)
      .expectExist()
      .log('2.Check the section is expanded')
      .shouldExpand()
      .log("3.Click private chat so target items won't be affected")
      .clickItemById(+privateChat.id)
      .log('4.Navigate to TeamSection')
      .shouldNavigateTo(TeamSection)
      .expectExist()
      .log('5.Check the section is expanded')
      .shouldExpand()
      .shouldNavigateTo(ConversationItemUMI)
      .log('6.Check the mention UMI of team')
      .chain(t => t.wait(3000))
      .log('7.Check the team has unread mention message')
      .chain(t => t.wait(3000))
      .checkMentionUMIWithAnyCount(+team.id)
      .log('8.Navigate to TeamSection')
      .shouldNavigateTo(TeamSection)
      .log('9.Open the team conversation')
      .clickItemById(+team.id)
      .shouldNavigateTo(ConversationItemUMI)
      .log('10.Check UMI of team dismiss')
      .chain(t => t.wait(3000))
      .checkNoUMI(+team.id);
  },
);

// skip due to db performance issue in E2E test. The problem does not occur in other circumstances (other than E2E test).
test.skip(
  formalName('Current opened conversation should not display UMI', [
    'JPT-105',
    'P1',
    'ConversationList',
  ]),
  async (t: TestController) => {
    await setupSDK(t);
    const { privateChat, team } = await prepareConversations(t, [
      { type: 'privateChat', identifier: 'privateChat' },
      { type: 'team', identifier: 'team' },
    ]);

    await directLogin(t)
      .log('1.Navigate to DirectMessageSection')
      .shouldNavigateTo(DirectMessageSection)
      .expectExist()
      .log('2.Check the section is expanded')
      .shouldExpand()
      .log('3.Open a group conversation')
      .clickItemById(+privateChat.id)
      .log('4.Navigate to ConversationItemUMI')
      .shouldNavigateTo(ConversationItemUMI)
      .log('5.Send post to group')
      .chain(t => t.wait(3000))
      .sendPostToGroup('TestUMI', +privateChat.id)
      .log('6.Should not display UMI')
      .chain(t => t.wait(3000))
      .checkNoUMI(+privateChat.id)
      .log('7.Navigate to TeamSection')
      .shouldNavigateTo(TeamSection)
      .expectExist()
      .log('8.Check the section is expanded')
      .shouldExpand()
      .log('9.Open a team conversation')
      .clickItemById(+team.id)
      .log('10.Refresh page')
      .chain(t => t.wait(3000))
      .reload()
      .log('11.Navigate to ConversationItemUMI')
      .shouldNavigateTo(ConversationItemUMI)
      .log('12.Should not display UMI')
      .chain(t => t.wait(3000))
      .checkNoUMI(+privateChat.id);
  },
);

test(
  formalName(
    'Should not display UMI when section is expended & Should display UMI when section is collapsed',
    ['JPT-98', 'JPT-99', 'P2', 'P1', 'ConversationList'],
  ),
  async (t: TestController) => {
    await setupSDK(t);
    const {
      favPrivateChat,
      favTeam,
      pvtChat1,
      pvtChat2,
      pvtChat3,
      team1,
      team2,
    } = await prepareConversations(t, [
      { type: 'privateChat', identifier: 'favPrivateChat', isFavorite: true },
      { type: 'team', identifier: 'favTeam', isFavorite: true },
      { type: 'privateChat', identifier: 'pvtChat1' },
      { type: 'privateChat', identifier: 'pvtChat2' },
      { type: 'privateChat', identifier: 'pvtChat3' },
      { type: 'team', identifier: 'team1' },
      { type: 'team', identifier: 'team2' },
    ]);

    await clearAllUMI(t);

    await directLogin(t)
      // DM section
      .log('1.Navigate to DirectMessageSection')
      .shouldNavigateTo(DirectMessageSection)
      .expectExist()
      .log('2.Check the section is expanded')
      .shouldExpand()
      .log('3.Click extra item to avoid affecting target items')
      .clickItemById(+pvtChat3.id)
      .chain(t => t.wait(2000))
      .log('4.Navigate to ConversationItemUMI')
      .shouldNavigateTo(ConversationItemUMI)
      .log('5.Send posts to pvtChats to create UMI')
      .chain(t => t.wait(2000))
      .sendPostToGroup('TestUMI', +pvtChat1.id, '703', 2)
      .sendPostToGroup('TestUMI', +pvtChat2.id, '704', 3)
      .log('6.Check no umi in Direct Message section header')
      .chain(t => t.wait(2000))
      .checkNoUMIInHeader('Direct Messages')
      .log('7.Navigate to DirectMessageSection')
      .shouldNavigateTo(DirectMessageSection)
      .log('8.Click header to collapse')
      .clickHeader()
      .log('9.Navigate to ConversationItemUMI')
      .shouldNavigateTo(ConversationItemUMI)
      .log('10.Check UMI in header should be 5')
      .checkUnreadInHeader('Direct Messages', 5)
      .log('11.Send another post with mention to one pvtChat')
      .sendMentionToGroup(+pvtChat1.id, '703')
      .log('12.Check UMI in header should be 6 with mention color')
      .chain(t => t.wait(2000))
      .checkUnreadInHeader('Direct Messages', 6, true)
      .log('13.Send another post to one pvtChat')
      .sendPostToGroup('TestUMI', +pvtChat1.id, '703')
      .log('14.Check UMI in header should be 7 with mention color')
      .checkUnreadInHeader('Direct Messages', 7, true)
      // // Team section
      .log('15.Navigate to TeamSection')
      .shouldNavigateTo(TeamSection)
      .expectExist()
      .log('16.Check the section is expanded')
      .shouldExpand()
      .log('17.Navigate to ConversationItemUMI')
      .shouldNavigateTo(ConversationItemUMI)
      .log('18.Send posts to teams to create UMI')
      .chain(t => t.wait(2000))
      .sendMentionToGroup(+team1.id, '702', 2)
      .sendMentionToGroup(+team2.id, '702', 3)
      .log('19.Check no umi in Team section header')
      .chain(t => t.wait(2000))
      .checkNoUMIInHeader('Teams')
      .log('20.Navigate to TeamSection')
      .shouldNavigateTo(TeamSection)
      .log('21.Click header to collapse')
      .clickHeader()
      .log('22.Navigate to ConversationItemUMI')
      .shouldNavigateTo(ConversationItemUMI)
      .log('23.Check UMI in header should be 5')
      .checkUnreadInHeader('Teams', 5, true)
      .log('24.Send another post with mention to one team')
      .sendMentionToGroup(+team1.id, '702')
      .log('25.Check UMI in header should be 6 with mention color')
      .chain(t => t.wait(2000))
      .checkUnreadInHeader('Teams', 6, true)
      .log('26.Send another normal post to one team')
      .sendPostToGroup('TestUMI', +team1.id, '702')
      .log(
        '27. Should not increase. Check UMI in header should be 6 with mention color',
      )
      .checkUnreadInHeader('Teams', 6, true)
      // Fav section
      .log('28.Navigate to FavoriteSection')
      .shouldNavigateTo(FavoriteSection)
      .expectExist()
      .log('29.Check the section is expanded')
      .shouldExpand()
      .log('30.Navigate to ConversationItemUMI')
      .shouldNavigateTo(ConversationItemUMI)
      .log('31.Send posts to teams to create UMI')
      .chain(t => t.wait(2000))
      .sendMentionToGroup(+favPrivateChat.id, '702', 2)
      .sendMentionToGroup(+favTeam.id, '702', 3)
      .log('32.Check no umi in Favorites section header')
      .chain(t => t.wait(2000))
      .checkNoUMIInHeader('Favorites')
      .log('33.Navigate to FavoritesSection')
      .shouldNavigateTo(FavoriteSection)
      .log('34.Click header to collapse')
      .clickHeader()
      .log('35.Navigate to ConversationItemUMI')
      .shouldNavigateTo(ConversationItemUMI)
      .log('36.Check UMI in header should be 5')
      .checkUnreadInHeader('Favorites', 5, true)
      .log('37.Send another post with mention to one fav group')
      .sendMentionToGroup(+favPrivateChat.id, '702')
      .log('38.Check UMI in header should be 6 with mention color')
      .chain(t => t.wait(2000))
      .checkUnreadInHeader('Favorites', 6, true)
      .log('39.Send another post with mention to one fav team')
      .sendMentionToGroup(+favTeam.id, '702')
      .log('40.Check UMI in header should be 7 with mention color')
      .chain(t => t.wait(2000))
      .checkUnreadInHeader('Favorites', 7, true)
      .log('41.Send another normal post to one fav group')
      .sendPostToGroup('TestUMI', +favPrivateChat.id, '702')
      .log(
        '42. Should increase. Check UMI in header should be 8 with mention color',
      )
      .checkUnreadInHeader('Favorites', 8, true)
      .log('43.Send another normal post to one fav team')
      .sendPostToGroup('TestUMI', +favTeam.id, '702')
      .log(
        '44. Should not increase. Check UMI in header should be 8 with mention color',
      )
      .checkUnreadInHeader('Favorites', 8, true);
  },
);

test(
  formalName('UMI should be updated when fav/unfav conversation', [
    'JPT-123',
    'P1',
    'ConversationList',
  ]),
  async (t: TestController) => {
    await setFavoriteConversations(t, []);
    const {
      pvtChat1,
      pvtChat2,
      pvtChat3,
      team1,
      team2,
    } = await prepareConversations(t, [
      { type: 'privateChat', identifier: 'pvtChat1' },
      { type: 'privateChat', identifier: 'pvtChat2' },
      { type: 'privateChat', identifier: 'pvtChat3' },
      { type: 'team', identifier: 'team1' },
      { type: 'team', identifier: 'team2' },
    ]);
    await clearAllUMI(t);
    await directLogin(t)
      .log('1.Navigate to DirectMessageSection')
      .shouldNavigateTo(DirectMessageSection)
      .expectExist()
      .log('2.Check the section is expanded')
      .shouldExpand()
      .log('3.Click extra item to avoid affecting target items')
      .clickItemById(+pvtChat3.id)
      .chain(t => t.wait(2000))
      .shouldNavigateTo(ConversationItemUMI)
      .sendPostToGroup('TestUMI', +pvtChat1.id, '702', 2)
      .shouldNavigateTo(TeamSection)
      .expectExist()
      .log('4.Check the section is expanded')
      .shouldExpand()
      .chain(t => t.wait(2000))
      .shouldNavigateTo(ConversationItemUMI)
      .sendMentionToGroup(+team1.id, '702', 2)
      .log('5.Click Favorite section header to collapse')
      .shouldNavigateTo(FavoriteSection)
      .clickHeader()
      .chain(t => t.wait(1000))
      .shouldCollapse()
      .log('6.Preconditions done')
      .log('7.Favorite pvtChat1 and team1, umi should move to fav section')
      .shouldNavigateTo(ConversationItemUMI)
      .favoriteGroup(+pvtChat1.id)
      .favoriteGroup(+team1.id)
      .chain(t => t.wait(2000))
      .checkUnreadInHeader('Favorites', 4, true)
      .checkNoUMIInHeader('Direct Messages')
      .checkNoUMIInHeader('Teams')
      .log('8.Favorite pvtChat2 and team3, umi no change')
      .favoriteGroup(+pvtChat2.id)
      .favoriteGroup(+team2.id)
      .chain(t => t.wait(2000))
      .checkUnreadInHeader('Favorites', 4, true)
      .checkNoUMIInHeader('Direct Messages')
      .checkNoUMIInHeader('Teams')
      .log('9.Expand Favorite section')
      .shouldNavigateTo(FavoriteSection)
      .clickHeader()
      .chain(t => t.wait(1000))
      .shouldExpand()
      .log('10.Collapse DM section')
      .shouldNavigateTo(DirectMessageSection)
      .clickHeader()
      .chain(t => t.wait(1000))
      .shouldCollapse()
      .log('11.Collapse Team section')
      .shouldNavigateTo(TeamSection)
      .clickHeader()
      .chain(t => t.wait(1000))
      .shouldCollapse()
      .log('12.UnFavorite pvtChat2 and team3, umi no change')
      .shouldNavigateTo(ConversationItemUMI)
      .unFavoriteGroup(+pvtChat2.id)
      .unFavoriteGroup(+team2.id)
      .log('13.Collapse Favorite section')
      .shouldNavigateTo(FavoriteSection)
      .clickHeader()
      .shouldCollapse()
      .chain(t => t.wait(2000))
      .shouldNavigateTo(ConversationItemUMI)
      .checkUnreadInHeader('Favorites', 4, true)
      .checkNoUMIInHeader('Direct Messages')
      .checkNoUMIInHeader('Teams')
      .log('14.UnFavorite pvtChat1 and team1, umi move back')
      .log('15.Expand Favorite section')
      .shouldNavigateTo(FavoriteSection)
      .clickHeader()
      .chain(t => t.wait(1000))
      .shouldExpand()
      .shouldNavigateTo(ConversationItemUMI)
      .unFavoriteGroup(+pvtChat1.id)
      .unFavoriteGroup(+team1.id)
      .log('16.Collapse Favorite section')
      .shouldNavigateTo(FavoriteSection)
      .clickHeader()
      .shouldCollapse()
      .chain(t => t.wait(2000))
      .shouldNavigateTo(ConversationItemUMI)
      .checkNoUMIInHeader('Favorites')
      .checkUnreadInHeader('Direct Messages', 2)
      .checkUnreadInHeader('Teams', 2, true);
  },
);
