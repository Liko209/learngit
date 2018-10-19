import { formalName } from '../../libs/filter';
import { setUp, tearDown, TestHelper } from '../../libs/helpers';
import { directLogin } from '../../utils';
import { ConversationItemUMI } from '../../page-models/components/ConversationList/ConversationItemUMI';
import {
  DirectMessageSection,
  TeamSection,
} from '../../page-models/components';
import { setupSDK } from '../../utils/setupSDK';
import * as _ from 'lodash';
import { prepareConversations } from './utils';

declare var test: TestFn;
fixture('ConversationStream/ConversationStream')
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

// test(
//   formalName(
//     'Should not display UMI when section is expended & Should display UMI when section is collapsed',
//     ['JPT-98', 'JPT-99', 'P2', 'P1', 'ConversationList'],
//   ),
//   async (t: TestController) => {
//     await setupSDK(t);
//     const {
//       favPrivateChat,
//       favTeam,
//       pvtChat1,
//       pvtChat2,
//       pvtChat3,
//       team1,
//       team2,
//     } = await prepareConversations(t, [
//       { type: 'privateChat', identifier: 'favPrivateChat' },
//       { type: 'team', identifier: 'favTeam' },
//       { type: 'privateChat', identifier: 'pvtChat1' },
//       { type: 'privateChat', identifier: 'pvtChat2' },
//       { type: 'privateChat', identifier: 'pvtChat3' },
//       { type: 'team', identifier: 'team1' },
//       { type: 'team', identifier: 'team2' },
//     ]);

//     await directLogin(t)
//       .log('1.Navigate to DirectMessageSection')
//       .shouldNavigateTo(DirectMessageSection)
//       .expectExist()
//       .log('2.Check the section is expanded')
//       .shouldExpand()
//       .log('3.Click each item to reset')
//       .clickEachItem()
//       .log('4.Click extra item to avoid affecting target items')
//       .clickItemById(+pvtChat3.id)
//       .chain(t => t.wait(5000))
//       .log('5.Navigate to ConversationItemUMI')
//       .shouldNavigateTo(ConversationItemUMI)
//       .log('6.Send posts to pvtChats to create UMI')
//       .chain(t => t.wait(3000))
//       .sendPostToGroup('TestUMI', +pvtChat1.id, '703', 2)
//       .sendPostToGroup('TestUMI', +pvtChat2.id, '704', 3)
//       .log('7.Check no umi in Direct Message section header')
//       .checkNoUMIInHeader('Direct Messages')
//       .log('8.Navigate to DirectMessageSection')
//       .shouldNavigateTo(DirectMessageSection)
//       .log('9.Click header to collapse')
//       .clickHeader()
//       .log('10.Navigate to ConversationItemUMI')
//       .shouldNavigateTo(ConversationItemUMI)
//       .log('11.Check UMI in header should be 5')
//       .checkUnreadInHeader('Direct Messages', 5)
//       .sendMentionToTeam()
//       .log('4.Check the mention UMI of team')
//       .checkTeamMentionUMI()
//       .log('5.Check the section UMI of team')
//       .checkSectionNoUMI();
//   },
// );

// test(
//   formalName('Should display UMI when section is collapsed', [
//     'JPT-99',
//     'P1',
//     'ConversationList',
//   ]),
//   async (t: TestController) => {
//     await directLogin(t)
//       .log('1.Navigate to ConversationItemUMI')
//       .shouldNavigateTo(ConversationItemUMI)
//       .log('Check section is expanded')
//       .shouldExpand()
//       .log('Send post to group')
//       .sendPostToGroup('TestUMI')
//       .log('Calculate all UMI in group section')
//       .calculateDMUMI()
//       .log('Click DM section header')
//       .clickGoupHeader()
//       .log('Check section is collapsed')
//       .shouldCollapsed()
//       .log('Check UMI in DM section ')
//       .checkSectionUMI();
//   },
// );

// test(
//   formalName('UMI should be updated when fav/unfav conversation', [
//     'JPT-123',
//     'P1',
//     'ConversationList',
//   ]),
//   async (t: TestController) => {
//     await directLogin(t)
//       .log('1.Navigate to FavoriteSection')
//       .shouldNavigateTo(FavoriteSection)
//       .log('2.Click fav section header')
//       .clickHeader()
//       .log('3.Check section is collapsed')
//       .checkCollapsed()
//       .log('4.Check UMI in Fav section')
//       .checkSectionUMI()
//       .log('5.Navigate to DM section')
//       .shouldNavigateTo(DirectMessageSection)
//       .log('6.Send post to Group')
//       .sendPostToGroup()
//       .log('7.Click DM section header')
//       .clickGoupHeader()
//       .log('8.Check section is collapsed')
//       .checkCollapsed()
//       .log('9.Check the UMI in DM section')
//       .checkSectionUMI()
//       .log('10.Click fav section header')
//       .clickHeader()
//       .log('11.Check section is expanded')
//       .shouldExpand()
//       .log('12.Favorite the group')
//       .FavoriteGroup()
//       .log('13.Click fav section header')
//       .clickHeader()
//       .log('14.Check section is collapsed')
// .checkCollapsed()
//       .log('15.Check the UMI in DM section')
//       .checkSectionNoUMI()
//       .log('16.Navigate to Fav section')
//       .shouldNavigateTo(FavoriteSection)
//       .log('17.Check UMI in Fav section')
//       .checkSectionUMI();
//   },
// );
