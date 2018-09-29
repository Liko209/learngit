import { formalName } from '../../libs/filter';
import { setUp, tearDown, TestHelper } from '../../libs/helpers';
import { directLogin } from '../../utils';
import { setupSDK } from '../../utils/setupSDK';
import { ProfileAPI, PersonAPI } from '../../libs/sdk';
import { CloseConversation } from '../../page-models/components/ConversationList/CloseConversation';

declare var test: TestFn;
fixture('CloseConversation')
  .beforeEach(setUp('GlipBetaUser(1210,4488)'))
  .afterEach(tearDown());

let con1: number;
let con2: number;
// the detail of dialog
const title = 'Close Conversation?';
const content =
  'Closing a conversation will remove it from the left pane, but will not delete the contents.';
const checkboxLabel = "Don't ask me again";
const button = 'Close Conversation';
// prepare: must have 2 conversations at least in list
const prepare_2conversationInList = async (t: TestController) => {
  const helper = TestHelper.from(t);
  await helper.log(
    '1.Prepare: have 2 conversations at least in conversation list',
  );
  const client701 = await helper.glipApiManager.getClient(
    helper.users.user701,
    helper.companyNumber,
  );
  await client701.sendPost(helper.teams.team1_u1_u2.glip_id, {
    text: `send one post to ${helper.teams.team1_u1_u2.glip_id}`,
  });
  await client701.sendPost(helper.teams.team3_u1_u2_u3.glip_id, {
    text: `send one post to ${helper.teams.team3_u1_u2_u3.glip_id}`,
  });
};
// prepare: must have 1 conversations at least in list
const prepare_1conversationInList = async (t: TestController) => {
  const helper = TestHelper.from(t);
  await helper.log(
    '1.Prepare: have 1 conversations at least in conversation list',
  );
  const client701 = await helper.glipApiManager.getClient(
    helper.users.user701,
    helper.companyNumber,
  );
  con1 = helper.teams.team1_u1_u2.glip_id;
  await client701.sendPost(con1, {
    text: `send one post to ${helper.teams.team1_u1_u2.name}`,
  });
};
// prepare for case JPT-134: expect to show confirmation popup(skip_close_conversation_confirmation should be false or not exist)
const prepare_api1 = async (t: TestController) => {
  const helper = TestHelper.from(t);
  await helper.log('2.Prepare: show confirmation popup');
  await setupSDK(t);
  const id = (await PersonAPI.requestPersonById(helper.users.user701.glip_id))
    .data.profile_id;
  let data = (await ProfileAPI.requestProfileById(id)).data;
  if (data.skip_close_conversation_confirmation) {
    data = (await (ProfileAPI as any).putDataById(id, {
      skip_close_conversation_confirmation: false,
    })).data;
  }
  await helper.log('2.1 skip_close_conversation_confirmation: false');
};
// prepare for case JPT-135: expect no confirmation popup(skip_close_conversation_confirmation should be true)
const prepare_api2 = async (t: TestController) => {
  const helper = TestHelper.from(t);
  await helper.log('2.Prepare:no confirmation popup');
  await setupSDK(t);
  const id = (await PersonAPI.requestPersonById(helper.users.user701.glip_id))
    .data.profile_id;
  let data = (await ProfileAPI.requestProfileById(id)).data;
  if (!data.skip_close_conversation_confirmation) {
    data = (await (ProfileAPI as any).putDataById(id, {
      skip_close_conversation_confirmation: true,
    })).data;
  }
  await helper.log(
    `2.1 skip_close_conversation_confirmation: ${
      data.skip_close_conversation_confirmation
    }`,
  );
};
const action1 = (t: TestController) =>
  directLogin(t)
    .log('3.Should navigate to CloseConversation')
    .shouldNavigateTo(CloseConversation)
    .log('4.Click one conversation')
    .clickOneConversation(0)
    .log('5.Get conversation id')
    .getConversationId()
    .log('6.Click more button')
    .clickConversationMoreButton(0)
    .log('7.Exist close button')
    .expectCloseButton()
    .log('8.Click close button')
    .clickCloseButton()
    .log('9.Check display of the confirm dialog')
    .expectDialog(title, content, checkboxLabel, button);

test(
  formalName(
    'Close current conversation directly, and navigate to blank page (without UMI)',
    ['JPT-135', 'JPT-130', 'P1', 'ConversationList'],
  ),
  async (t: TestController) => {
    await prepare_1conversationInList(t);
    await prepare_api2(t);
    await directLogin(t)
      .log('3.Should navigate to CloseConversation')
      .shouldNavigateTo(CloseConversation)
      .log('4.Click one conversation')
      .clickOneConversation(0)
      .log('5.Get conversation id')
      .getConversationId()
      .log('6.Click more button')
      .clickConversationMoreButton(0)
      .log('7.Exist close button')
      .expectCloseButton()
      .log('8.Click close button')
      .clickCloseButton()
      .log('9.Navigate to blank page')
      .expect2BlankPage()
      .log('10.The conversation has closed')
      .expectNoClosedConversation()
      .log('11.Refresh page')
      .refreshPage()
      .log('12.The conversation has closed')
      .expectNoClosedConversation();
  },
);

test(
  formalName(
    'Close other conversation in confirm alert,and still focus on user veiwing conversation(without UMI)',
    ['JPT-137', 'JPT-130', 'P1', 'ConversationList'],
  ),
  async (t: TestController) => {
    await prepare_2conversationInList(t);
    await prepare_api1(t);
    await directLogin(t)
      .shouldNavigateTo(CloseConversation)
      .log('3.Prepare no UMI :Click one conversation c1')
      .clickOneConversation(1)
      .log('5.Get conversation id')
      .getConversationId()
      .log('4.Click one conversation c2')
      .clickOneConversation(0)
      .pushURL()
      .log("5.Click other conversation c1's  more button")
      .clickConversationMoreButton(1)
      .log('6.Exist close button')
      .expectCloseButton()
      .log('7.Click close button')
      .clickCloseButton()
      .log('8.Check display of the confirm dialog')
      .expectDialog(title, content, checkboxLabel, button)
      .log('9.Click close button of the dialog')
      .clickDialogCloseButton()
      .pushURL()
      .log('10.Current url should be same')
      .expectSameURL()
      .log('11.The conversation has closed')
      .expectNoClosedConversation()
      .log('12.Refresh page')
      .refreshPage()
      .log('13.The conversation has closed')
      .expectNoClosedConversation()
      .log('14.Click more button');
  },
);

test(
  formalName('Close current conversation in confirm alert(without UMI)', [
    'JPT-134',
    'JPT-130',
    'P2',
    'ConversationList',
  ]),
  async (t: TestController) => {
    await prepare_2conversationInList(t);
    await prepare_api1(t);
    await action1(t)
      .log('10.Click close button of the dialog')
      .clickDialogCloseButton()
      .log('11.Navigate to blank page')
      .expect2BlankPage()
      .log('12.The conversation has closed')
      .expectNoClosedConversation()
      .log('13.Refresh page')
      .refreshPage()
      .log('14.The conversation has closed')
      .expectNoClosedConversation()
      .log('15.Click more button')
      .clickConversationMoreButton(0)
      .log('16.Click close button')
      .clickCloseButton()
      .log('17.Check display the confirm dialog')
      .expectDialog(title, content, checkboxLabel, button);
  },
);

test(
  formalName(
    `Tap ${checkboxLabel} checkbox,then close current conversation in confirm alert(without UMI)`,
    ['JPT-134', 'JPT-130', 'P2', 'ConversationList'],
  ),
  async (t: TestController) => {
    await prepare_2conversationInList(t);
    await prepare_api1(t);
    await action1(t)
      .log(`10.Tap ${checkboxLabel} checkbox`)
      .clickDialogCheckbox()
      .log('11.Click close button of the dialog')
      .clickDialogCloseButton()
      .log('12.Navigate to blank page')
      .expect2BlankPage()
      .log('13.The conversation has closed')
      .expectNoClosedConversation()
      .log('14.Refresh page')
      .refreshPage()
      .log('15.The conversation has closed')
      .expectNoClosedConversation()
      .log('16.Click more button')
      .clickConversationMoreButton(0)
      .log('17.Click close button')
      .clickCloseButton()
      .log('18.Check no confirm dialog')
      .expectNoDialogTitle(title);
  },
);

// todo cannot check (with umi)
test.skip(
  formalName('No close button in conversation with UMI', [
    'JPT-114',
    'P2',
    'ConversationList',
  ]),
  async (t: TestController) => {
    await prepare_1conversationInList(t);
    const segment1 = directLogin(t)
      .log('2.Should navigate to CloseConversation')
      .shouldNavigateTo(CloseConversation)
      .log('3.Click the conversation')
      .clickConversationById(con1);
    await segment1;
    const segment2 = segment1
      .log('4.Make one conversation c2 has unread messages')
      .chain(async (t, h) => {
        const client701 = await h.glipApiManager.getClient(
          h.users.user701,
          h.companyNumber,
        );
        con2 = h.teams.team3_u1_u2_u3.glip_id;
        await client701.sendPost(con2, {
          text: `send one post to ${h.teams.team3_u1_u2_u3.name}`,
        });
      });
    await segment2;
    const segment3 = segment2
      .log(`5.Click more button in the conversation c2: ${con2}`)
      .clickMoreButtonById(con2)
      .log(`6.Expect no close button in c2: ${con2}`)
      .expectNoCloseButton();
    await segment3;
  },
);
