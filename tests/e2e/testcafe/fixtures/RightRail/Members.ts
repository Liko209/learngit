/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-07-31 14:04:18
 * Copyright © RingCentral. All rights reserved.
 */
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup } from '../../v2/models';

fixture('RightRail')
  .beforeEach(setupCase(BrandTire.RC_FIJI_GUEST))
  .afterEach(teardownCase());

test(formalName('No "Show all #" link for 1:1 conversation & Can show the underline when hovering on the "Show all #" on the right shelf of conversation & Can open the group/team profile via "Show all #" link', ['Chris.Zhan', 'P1', 'P2', 'JPT-2646', 'JPT-2658', 'JPT-2644']), async t => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).glip(loginUser).init()

  let chat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, users[0]]
  }

  let groupChat = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, users[5], users[7]]
  }

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser, users[5]]
  }

  await h(t).withLog(`Given I have a 1:1 chat, a group chat and a team named ${team.name} before login`, async () => {
    await h(t).scenarioHelper.createTeamsOrChats([chat, groupChat, team]);
  });

  await h(t).withLog('And send a message to ensure chat and group in list', async () => {
    await h(t).scenarioHelper.sendTextPost('for appear in section', chat, loginUser);
    await h(t).scenarioHelper.sendTextPost('for appear in section', groupChat, loginUser);
  });

  const app = new AppRoot(t);
  const rightRail = app.homePage.messageTab.rightRail;
  const directMessagesSection = app.homePage.messageTab.directMessagesSection;
  const teamsSection = app.homePage.messageTab.teamsSection;
  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const chatItem = directMessagesSection.conversationEntryById(chat.glipId);
  await h(t).withLog('Then I open the private chat', async () => {
    await chatItem.enter();
  });

  await h(t).withLog('Then check the right shell member list header, should not see "Show all #" link', async () => {
    await t.expect(rightRail.memberListSection.showAllLink.exists).eql(false);
  });

  const groupItem = directMessagesSection.conversationEntryById(groupChat.glipId);
  await h(t).withLog('Then I open the group chat', async () => {
    await groupItem.enter();
  });

  await h(t).withLog('Then check the right shell member list header, I can see "Show all #" link', async () => {
    await t.expect(rightRail.memberListSection.showAllLink.exists).eql(true);
  });

  const teamItem = teamsSection.conversationEntryById(team.glipId);
  await h(t).withLog('Then I open the team', async () => {
    await teamItem.enter();
  });

  await h(t).withLog('Then check the right shell member list header, I can see "Show all #" link', async () => {
    await t.expect(rightRail.memberListSection.showAllLink.exists).eql(true);
  });

  await h(t).withLog('When I click the link', async () => {
    await t.click(rightRail.memberListSection.showAllLink);
  });

  await h(t).withLog('Then team profile should show up', async () => {
    await t.expect(app.homePage.profileDialog.visible).eql(true);
  });
});

test(formalName('Check whether guest section is showed on the right shelf of conversation', ['Chris.Zhan', 'P2', 'JPT-2664']), async t => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = h(t).rcData.mainCompany.users[4];
  const guest = h(t).rcData.guestCompany.users[0];
  await h(t).glip(loginUser).init()

  let chat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, users[0]]
  }

  let group = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, users[5], users[7]]
  }

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser, users[5]]
  }

  let chatWithGuest = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, guest]
  }

  let groupChatWithGuest = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, users[5], guest]
  }

  let teamWithGuest = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser, users[5], guest]
  }

  await h(t).withLog(`Given I have a 1:1 chat, a group chat and a team named ${team.name} before login`, async () => {
    await h(t).scenarioHelper.createTeamsOrChats([chat,group, team]);
  });

  await h(t).withLog(`Given I have a 1:1 chat with guest, a group chat with guest and a team with guest named ${teamWithGuest.name} before login`, async () => {
    await h(t).scenarioHelper.createTeamsOrChats([chatWithGuest,groupChatWithGuest,teamWithGuest]);
  });

  await h(t).withLog('And send a message to ensure chat and group in list', async () => {
    await h(t).scenarioHelper.sendTextPost('for appear in section', chat, loginUser);
    await h(t).scenarioHelper.sendTextPost('for appear in section', group, loginUser);
    await h(t).scenarioHelper.sendTextPost('for appear in section', chatWithGuest, loginUser);
    await h(t).scenarioHelper.sendTextPost('for appear in section', groupChatWithGuest, loginUser);
  });

  const app = new AppRoot(t);
  const rightRail = app.homePage.messageTab.rightRail;
  const directMessagesSection = app.homePage.messageTab.directMessagesSection;
  const teamsSection = app.homePage.messageTab.teamsSection;
  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const chatItem = directMessagesSection.conversationEntryById(chat.glipId);
  await h(t).withLog('Then I open the private chat', async () => {
    await chatItem.enter();
  });

  await h(t).withLog('Then I can not see the guest section', async () => {
    await t.expect(rightRail.memberListSection.guests.exists).eql(false);
  });

  const groupItem = directMessagesSection.conversationEntryById(group.glipId);
  await h(t).withLog('Then I open the group', async () => {
    await groupItem.enter();
  });

  await h(t).withLog('Then I can not see the guest section', async () => {
    await t.expect(rightRail.memberListSection.guests.exists).eql(false);
  });

  const teamItem = teamsSection.conversationEntryById(team.glipId);
  await h(t).withLog('Then I open the team', async () => {
    await teamItem.enter();
  });

  await h(t).withLog('Then I can not see the guest section', async () => {
    await t.expect(rightRail.memberListSection.guests.exists).eql(false);
  });

  const chatWithGuestItem = directMessagesSection.conversationEntryById(chatWithGuest.glipId);
  await h(t).withLog('Then I open the private chat with guest', async () => {
    await chatWithGuestItem.enter();
  });

  await h(t).withLog('Then I can not see the guest section', async () => {
    await t.expect(rightRail.memberListSection.guests.exists).eql(true);
  });

  const groupWithGuestItem = directMessagesSection.conversationEntryById(groupChatWithGuest.glipId);
  await h(t).withLog('Then I open the group with guest', async () => {
    await groupWithGuestItem.enter();
  });

  await h(t).withLog('Then I can not see the guest section', async () => {
    await t.expect(rightRail.memberListSection.guests.exists).eql(true);
  });

  const teamWithGuestItem = teamsSection.conversationEntryById(teamWithGuest.glipId);
  await h(t).withLog('Then I open the team with guest', async () => {
    await teamWithGuestItem.enter();
  });

  await h(t).withLog('Then I can not see the guest section', async () => {
    await t.expect(rightRail.memberListSection.guests.exists).eql(true);
  });

});

test(formalName('"Add people" icon shows the tooltip & Can show the tooltip when hovering on the member\'s avatar on the right shelf of conversation & Can open the mini profile when clicking the member\'s avatar on the right shelf of conversation', ['Chris.Zhan', 'P2', 'P1', 'JPT-2599', 'JPT-2654', 'JPT-2655']), async t => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = h(t).rcData.mainCompany.users[4];
  const loginUserGlip = h(t).glip(loginUser)
  await loginUserGlip.init()
  const me = await loginUserGlip.getPerson(loginUser.rcId);

  const guestUser = h(t).rcData.guestCompany.users[0];
  const guest = await loginUserGlip.getPerson(guestUser.rcId);

  let chat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, guestUser]
  }

  let group = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, users[5], guestUser]
  }

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser, users[5], guestUser]
  }

  await h(t).withLog(`Given I have a 1:1 chat, a group chat and a team named ${team.name} before login`, async () => {
    await h(t).scenarioHelper.createTeamsOrChats([chat, group, team]);
  });

  await h(t).withLog('And send a message to ensure chat and group in list', async () => {
    await h(t).scenarioHelper.sendTextPost('for appear in section', chat, loginUser);
    await h(t).scenarioHelper.sendTextPost('for appear in section', group, loginUser);
  });

  const app = new AppRoot(t);
  const rightRail = app.homePage.messageTab.rightRail;
  const directMessagesSection = app.homePage.messageTab.directMessagesSection;
  const teamsSection = app.homePage.messageTab.teamsSection;
  const miniProfile = app.homePage.miniProfile;

  const checkTooltip = async () => {
    await h(t).withLog('When I hover on my avatar on the right shell member list', async () => {
      await t.hover(rightRail.memberListSection.header);
      await t.hover(rightRail.memberListSection.getAvatarById(me.data._id), {speed: 0.1})
    })

    await h(t).withLog('Then I can see tooltip with my name', async () => {
      await rightRail.memberListSection.showTooltip(me.data.display_name)
    })

    await h(t).withLog('When I hover on guest\'s avatar on the right shell member list', async () => {
      await t.hover(rightRail.memberListSection.header);
      await t.hover(rightRail.memberListSection.getAvatarById(guest.data._id), {speed: 0.1})
    })

    await h(t).withLog('Then I can see tooltip with guest\'s name', async () => {
      await rightRail.memberListSection.showTooltip(guest.data.display_name)
    })
  }

  const checkMiniProfile = async () => {
    await h(t).withLog('When I click my avatar on the right shell member list', async () => {
      await t.click(rightRail.memberListSection.getAvatarById(me.data._id))
    })

    await h(t).withLog('Then I can see my mini profile', async () => {
      await miniProfile.shouldBePopUp();
      const profileName = await miniProfile.getName();
      await t.expect(profileName).eql(me.data.display_name)
    })

    await h(t).withLog('Then I click somewhere else', async () => {
      await t.click(rightRail.memberListSection.header, {
        offsetX: 1,
        offsetY: 1,
      })
    })

    await h(t).withLog('Then the mimi profile should be dismissed', async () => {
      await miniProfile.shouldBeDismissed();
    })

    await h(t).withLog('When I click guest\'s avatar on the right shell member list', async () => {
      await t.click(rightRail.memberListSection.getAvatarById(guest.data._id))
    })

    await h(t).withLog('Then I can see guest\'s mini profile', async () => {
      await miniProfile.shouldBePopUp();
      const profileName = await miniProfile.getName();
      await t.expect(profileName).eql(guest.data.display_name)
    })

    await h(t).withLog('Then I click somewhere else', async () => {
      await t.click(rightRail.memberListSection.header, {
        offsetX: 1,
        offsetY: 1,
      })
    })

    await h(t).withLog('Then the mimi profile should be dismissed', async () => {
      await miniProfile.shouldBeDismissed();
    })
  }

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const chatItem = directMessagesSection.conversationEntryById(chat.glipId);
  await h(t).withLog('Then I open the private chat', async () => {
    await chatItem.enter();
  });

  await h(t).withLog('When I hover on the add button', async () => {
    await t.hover(rightRail.memberListSection.body);
    await t.hover(rightRail.memberListSection.addMemberButton, {speed: 0.1});
  });

  await h(t).withLog('Then I can see tooltip with text "Add people" ', async () => {
    await rightRail.memberListSection.showTooltip('Add people')
  });

  await checkTooltip();
  await checkMiniProfile();

  const groupItem = directMessagesSection.conversationEntryById(group.glipId);
  await h(t).withLog('Then I open the group chat', async () => {
    await groupItem.enter();
  });

  await h(t).withLog('When I hover on the add button', async () => {
    await t.hover(rightRail.memberListSection.header);
    await t.hover(rightRail.memberListSection.addMemberButton, {speed: 0.1});
  });

  await h(t).withLog('Then I can see tooltip with text "Add people" ', async () => {
    await rightRail.memberListSection.showTooltip('Add people')
  });

  await checkTooltip();
  await checkMiniProfile();

  const teamItem = teamsSection.conversationEntryById(team.glipId);
  await h(t).withLog('Then I open the team chat', async () => {
    await teamItem.enter();
  });

  await h(t).withLog('When I hover on the add button', async () => {
    await t.hover(rightRail.memberListSection.header);
    await t.hover(rightRail.memberListSection.addMemberButton, {speed: 0.1});
  });

  await h(t).withLog('Then I can see tooltip with text "Add team members" ', async () => {
    await rightRail.memberListSection.showTooltip('Add team members')
  });

  await checkTooltip();
  await checkMiniProfile();
});







test(formalName('Check whether "add team members" icon is showed on right shelf when no permission.', ['Windy.Yao', 'P2', 'JPT-2785']), async t => {
  const app = new AppRoot(t)
  const adminUser = h(t).rcData.mainCompany.users[4];
  const memberUser = h(t).rcData.mainCompany.users[5];
  const guestUser = h(t).rcData.guestCompany.users[0];
  await h(t).glip(memberUser).init();
  await h(t).platform(adminUser).init();
  await h(t).glip(guestUser).init();

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: adminUser,
    members: [adminUser, memberUser, guestUser]
  }

  await h(t).withLog(`Given I have a team named ${team.name} before login`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });


  const rightRail = app.homePage.messageTab.rightRail;
  const teamsSection = app.homePage.messageTab.teamsSection;
  const teamItem = teamsSection.conversationEntryById(team.glipId);
  const conversationPage = app.homePage.messageTab.conversationPage;
  const profileDialog = app.homePage.profileDialog;
  const teamSettingDialog = app.homePage.teamSettingDialog;

  await h(t).withLog(`And memberUser login Jupiter with ${memberUser.company.number}#${memberUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, memberUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('Then memberUser open the team chat', async () => {
    await teamItem.enter();
  });
  await h(t).withLog('The "Add team members" icon is showed.', async () => {
    await t.expect(rightRail.memberListSection.addMemberButton.exists).ok()
  });


  await h(t).withLog(`When memberUser logout and login  with guestUser ${guestUser.company.number}#${guestUser.extension}`, async () => {
    await app.homePage.logoutThenLoginWithUser(SITE_URL, guestUser);
  });
  await h(t).withLog('Then guestUser open the team chat', async () => {
    await teamItem.enter();
  });

  await h(t).withLog('The "Add team members" icon is hidden.', async () => {
    await t.expect(rightRail.memberListSection.addMemberButton.exists).notOk()
  });


  await h(t).withLog(`When guestUser logout and login  with adminUser ${adminUser.company.number}#${adminUser.extension}`, async () => {
    await app.homePage.logoutThenLoginWithUser(SITE_URL, adminUser);
  });
  await h(t).withLog('Then adminUser open the team chat', async () => {
    await teamItem.enter();
  });
  await h(t).withLog('The "Add team members" icon is showed.', async () => {
    await t.expect(rightRail.memberListSection.addMemberButton.exists).ok()
  });


  await h(t).withLog(`And adminUser set Add team member permission toggle is "off" on team settings page`, async () => {
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
    await profileDialog.clickSetting();
    await teamSettingDialog.notAllowAddTeamMember();
    await teamSettingDialog.save();
  });

  await h(t).withLog(`When adminUser logout and login  with memberUser ${memberUser.company.number}#${memberUser.extension}`, async () => {
    await app.homePage.logoutThenLoginWithUser(SITE_URL, memberUser);
  });
  await h(t).withLog('Then memberUser open the team chat', async () => {
    await teamItem.enter();
  });

  await h(t).withLog('The "Add team members" icon is hidden.', async () => {
    await t.expect(rightRail.memberListSection.addMemberButton.exists).notOk()
  });

  await h(t).withLog(`When adminUser logout and login  with guestUser ${guestUser.company.number}#${guestUser.extension}`, async () => {
    await app.homePage.logoutThenLoginWithUser(SITE_URL, guestUser);
  });
  await h(t).withLog('Then guestUser open the team chat', async () => {
    await teamItem.enter();
  });

  await h(t).withLog('The "Add team members" icon is hidden.', async () => {
    await t.expect(rightRail.memberListSection.addMemberButton.exists).notOk()
  });



});


fixture('RightRail')
  .beforeEach(setupCase(BrandTire.MAIN_50_WITH_GUEST_20))
  .afterEach(teardownCase());

test(formalName('Check the maximum rows of members/guests are displayed on the right shelf', ['Chris.Zhan', 'P2', 'JPT-2676']), async t => {
  const users = h(t).rcData.mainCompany.users;
  const guestUsers = h(t).rcData.guestCompany.users;
  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).glip(loginUser).init()

  let team1 = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: users.slice(0, 40)
  }

  let team2 = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [...users.slice(0, 40), ...guestUsers.slice(0, 10)]
  }

  await h(t).withLog(`Given I have a team with 40 members and a team with 40 members and 10 guests`, async () => {
    await h(t).scenarioHelper.createTeam(team1);
    await h(t).scenarioHelper.createTeam(team2);
  });

  const app = new AppRoot(t);
  const rightRail = app.homePage.messageTab.rightRail;
  const teamsSection = app.homePage.messageTab.teamsSection;

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const teamItem1 = teamsSection.conversationEntryById(team1.glipId);
  const teamItem2 = teamsSection.conversationEntryById(team2.glipId);
  await h(t).withLog('When I open the team1', async () => {
    await teamItem1.enter();
  });

  const AVATAR_HEIGHT = 40;
  await h(t).withLog('Then the team member section should have 3 rows of member avatars', async () => {
    await t.expect(rightRail.memberListSection.members.clientHeight).eql(AVATAR_HEIGHT * 3);
  })

  const memberAvatars = rightRail.memberListSection.members.find('[data-test-automation-id="rightShelfMemberListAvatar"]');
  const memberMore = await rightRail.memberListSection.members.find('[data-test-automation-id="rightShelfMemberListMore"]')
  const guestAvatars = await rightRail.memberListSection.guests.find('[data-test-automation-id="rightShelfMemberListAvatar"]')
  const guestMore = await rightRail.memberListSection.guests.find('[data-test-automation-id="rightShelfMemberListMore"]')
  await h(t).withLog('And the count number should be the number of not displayed members', async () => {
    const showAllText = await rightRail.memberListSection.showAllLink.innerText;
    const allCount = Number(showAllText.slice(showAllText.search(/\d+/g)));
    const displayedMemberCount = await memberAvatars.count;
    await t.expect(memberMore.textContent).eql(`+${allCount - displayedMemberCount}`)
  }, true)

  await h(t).withLog('When I open the team2', async () => {
    await teamItem2.enter();
  });

  await h(t).withLog('Then the team member section should have 3 rows of member avatars', async () => {
    await t.expect(rightRail.memberListSection.members.clientHeight).eql(AVATAR_HEIGHT * 3);
  })

  await h(t).withLog('Then the team guests section should have 1 rows of guests avatars', async () => {
    await t.expect(rightRail.memberListSection.guests.clientHeight).eql(AVATAR_HEIGHT * 1);
  })

  await h(t).withLog('And the count number should be the number of not displayed guests in the guests section', async () => {
    const showAllText = await rightRail.memberListSection.showAllLink.innerText;
    const allCount = Number(showAllText.slice(showAllText.search(/\d+/g)));
    const displayedMemberCount = await memberAvatars.count;
    const restMemberText = await memberMore.textContent;
    const restMemberCount = Number(restMemberText.substring(1));
    const displayedGuestCount = await guestAvatars.count;
    await t.expect(guestMore.textContent).eql(`+${allCount - displayedMemberCount - restMemberCount - displayedGuestCount}`)
  }, true)

});

test(formalName('Check the maximum rows of members/guests are displayed on the right shelf', ['Chris.Zhan', 'P2', 'JPT-2680']), async t => {
  const users = h(t).rcData.mainCompany.users;
  const guestUsers = h(t).rcData.guestCompany.users;
  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).glip(loginUser).init()

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [...users.slice(0, 27), ...guestUsers.slice(0, 9)]
  }

  await h(t).withLog(`Given I have a team with 27 members and 9 guests`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  const app = new AppRoot(t);
  const rightRail = app.homePage.messageTab.rightRail;
  const teamsSection = app.homePage.messageTab.teamsSection;
  const memberAvatars = rightRail.memberListSection.members.find('[data-test-automation-id="rightShelfMemberListAvatar"]');
  const guestAvatars = await rightRail.memberListSection.guests.find('[data-test-automation-id="rightShelfMemberListAvatar"]')

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const teamItem = teamsSection.conversationEntryById(team.glipId);
  await h(t).withLog('When I open the team', async () => {
    await teamItem.enter();
  });

  const getMemberFirstRowCount = async () => {
    const firstRowAvatarOffsetTop = await memberAvatars.nth(0).getBoundingClientRectProperty('top');
    let count = 0;
    const avatarCount = await memberAvatars.count;
    for (let i = 0; i < avatarCount; i++) {
      const ot = await memberAvatars.nth(i).getBoundingClientRectProperty('top');
      if (ot === firstRowAvatarOffsetTop) {
        count++
      } else {
        break;
      }
    }
    return count;
  }

  const expectAvatarCountInOneRow = async (count: number) => {
    await h(t).withLog(`Then the team member section should have ${count} avatars in one row`, async () => {
      const count = await getMemberFirstRowCount()
      await t.expect(count).eql(count);
    })

    await h(t).withLog(`And the team guest section should have ${count} avatars in one row`, async () => {
      const count = await guestAvatars.count;
      await t.expect(count).eql(count);
    }, true)
  }

  await h(t).withLog('And I drag the resize handle to 200', async () => {
    await rightRail.resize('right', 68);
  })

  await expectAvatarCountInOneRow(4);

  await h(t).withLog('When I drag the resize handle to 204', async () => {
    await rightRail.resize('left', 4);
  })

  await expectAvatarCountInOneRow(5);

  await h(t).withLog('When I drag the resize handle to 240', async () => {
    await rightRail.resize('left', 36);
  })

  await expectAvatarCountInOneRow(6);

  await h(t).withLog('When I drag the resize handle to 276', async () => {
    await rightRail.resize('left', 36);
  })

  await expectAvatarCountInOneRow(7);

  await h(t).withLog('When I drag the resize handle to 312', async () => {
    await rightRail.resize('left', 36);
  })

  await expectAvatarCountInOneRow(8);

  await h(t).withLog('When I drag the resize handle to 348', async () => {
    await rightRail.resize('left', 36);
  })

  await expectAvatarCountInOneRow(9);
})

test(formalName('The order of members/guests list of the right shelf can be updated after adding/deleting new people & The order of members/guests list of the right shelf', ['Chris.Zhan', 'P1', 'JPT-2687', 'JPT-2688', 'JPT-2686']), async t => {
  const users = h(t).rcData.mainCompany.users;
  const guestUsers = h(t).rcData.guestCompany.users;
  const loginUser = h(t).rcData.mainCompany.users[4];
  const loginUserGlip = h(t).glip(loginUser)
  await loginUserGlip.init()
  const me = await loginUserGlip.getPerson(loginUser.rcId);

  let team1 = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [...users.slice(1, 3), guestUsers[0]]
  }

  let team2 = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [...users.slice(0, 28), ...guestUsers.slice(0, 10)]
  }

  await h(t).withLog(`Given I have a team with 3 members and 1 guest and a team with 28 members and 10 guests`, async () => {
    await h(t).scenarioHelper.createTeam(team1);
    await h(t).scenarioHelper.createTeam(team2);
  });

  const app = new AppRoot(t);
  const rightRail = app.homePage.messageTab.rightRail;
  const teamsSection = app.homePage.messageTab.teamsSection;
  const memberAvatars = rightRail.memberListSection.members.find('[data-test-automation-id="rightShelfMemberListAvatar"]');
  const guestAvatars = await rightRail.memberListSection.guests.find('[data-test-automation-id="rightShelfMemberListAvatar"]')

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const teamItem1 = teamsSection.conversationEntryById(team1.glipId);
  const teamItem2 = teamsSection.conversationEntryById(team2.glipId);
  await h(t).withLog('When I open the team1', async () => {
    await teamItem2.enter();
    await teamItem1.enter();
  });

  await h(t).withLog('Then 3 members avatar and 1 guest avatar displayed', async () => {
    const showAllText = await rightRail.memberListSection.showAllLink.innerText;
    const allCount = Number(showAllText.slice(showAllText.search(/\d+/g)));
    const displayedMemberCount = await memberAvatars.count;
    const displayedGuestCount = await guestAvatars.count;
    await t.expect(allCount).eql(4)
    await t.expect(displayedMemberCount).eql(3)
    await t.expect(displayedGuestCount).eql(1)
  }, true);

  await h(t).withLog('And first user is current user', async () => {
    await t.expect(memberAvatars.nth(0).getAttribute('uid')).eql(`${me.data._id}`);
  });

  const user5 = h(t).rcData.mainCompany.users[5];
  const guest2 = h(t).rcData.guestCompany.users[1];
  await h(t).withLog('When I add a member and a guest', async () => {
    await loginUserGlip.addTeamMembers(team1.glipId, [user5.rcId, guest2.rcId]);
    await t.wait(2000)
  });

  await h(t).withLog('Then the lists and count should be updated', async () => {
    const showAllText = await rightRail.memberListSection.showAllLink.innerText;
    const allCount = Number(showAllText.slice(showAllText.search(/\d+/g)));
    const displayedMemberCount = await memberAvatars.count;
    const displayedGuestCount = await guestAvatars.count;
    await t.expect(allCount).eql(6)
    await t.expect(displayedMemberCount).eql(4)
    await t.expect(displayedGuestCount).eql(2)
  }, true);

  await h(t).withLog('And first user is current user', async () => {
    await t.expect(memberAvatars.nth(0).getAttribute('uid')).eql(`${me.data._id}`);
  });

  await h(t).withLog('When I remove a member and a guest', async () => {
    await loginUserGlip.removeTeamMembers(team1.glipId, [user5.rcId, guest2.rcId]);
    await t.wait(2000)
  });

  await h(t).withLog('Then the lists and count should be updated', async () => {
    const showAllText = await rightRail.memberListSection.showAllLink.innerText;
    const allCount = Number(showAllText.slice(showAllText.search(/\d+/g)));
    const displayedMemberCount = await memberAvatars.count;
    const displayedGuestCount = await guestAvatars.count;
    await t.expect(allCount).eql(4)
    await t.expect(displayedMemberCount).eql(3)
    await t.expect(displayedGuestCount).eql(1)
  }, true);

  await h(t).withLog('And first user is current user', async () => {
    await t.expect(memberAvatars.nth(0).getAttribute('uid')).eql(`${me.data._id}`);
  });

  await h(t).withLog('When I open the team2', async () => {
    await teamItem2.enter();
  });

  await h(t).withLog('Then 17 members avatar and 5 guest avatar displayed, and +11 for members, and +5 for guests', async () => {
    const showAllText = await rightRail.memberListSection.showAllLink.innerText;
    const allCount = Number(showAllText.slice(showAllText.search(/\d+/g)));
    const displayedMemberCount = await memberAvatars.count;
    const displayedGuestCount = await guestAvatars.count;
    const memberMore = await rightRail.memberListSection.members.find('[data-test-automation-id="rightShelfMemberListMore"]')
    const guestMore = await rightRail.memberListSection.guests.find('[data-test-automation-id="rightShelfMemberListMore"]')
    const restMemberText = await memberMore.textContent;
    const restMemberCount = Number(restMemberText.substring(1));
    const restGuestText = await guestMore.textContent;
    const restGuestCount = Number(restGuestText.substring(1));
    await t.expect(allCount).eql(38)
    await t.expect(displayedMemberCount).eql(17)
    await t.expect(displayedGuestCount).eql(5)
    await t.expect(restMemberCount).eql(11)
    await t.expect(restGuestCount).eql(5)
  }, true);

  await h(t).withLog('And first user is current user', async () => {
    await t.expect(memberAvatars.nth(0).getAttribute('uid')).eql(`${me.data._id}`);
  });

  const user30 = h(t).rcData.mainCompany.users[30];
  const guest11 = h(t).rcData.guestCompany.users[11];
  await h(t).withLog('When I add a member and a guest', async () => {
    await loginUserGlip.addTeamMembers(team2.glipId, [user30.rcId, guest11.rcId]);
    await t.wait(2000)
  });

  await h(t).withLog('Then the lists and count should be updated', async () => {
    const showAllText = await rightRail.memberListSection.showAllLink.innerText;
    const allCount = Number(showAllText.slice(showAllText.search(/\d+/g)));
    const displayedMemberCount = await memberAvatars.count;
    const displayedGuestCount = await guestAvatars.count;
    const memberMore = await rightRail.memberListSection.members.find('[data-test-automation-id="rightShelfMemberListMore"]')
    const guestMore = await rightRail.memberListSection.guests.find('[data-test-automation-id="rightShelfMemberListMore"]')
    const restMemberText = await memberMore.textContent;
    const restMemberCount = Number(restMemberText.substring(1));
    const restGuestText = await guestMore.textContent;
    const restGuestCount = Number(restGuestText.substring(1));
    await t.expect(allCount).eql(40)
    await t.expect(displayedMemberCount).eql(17)
    await t.expect(displayedGuestCount).eql(5)
    await t.expect(restMemberCount).eql(12)
    await t.expect(restGuestCount).eql(6)
  }, true);

  await h(t).withLog('When I remove a member and a guest', async () => {
    await loginUserGlip.removeTeamMembers(team2.glipId, [user30.rcId, guest11.rcId]);
    await t.wait(2000)
  });

  await h(t).withLog('Then the lists and count should be updated', async () => {
    const showAllText = await rightRail.memberListSection.showAllLink.innerText;
    const allCount = Number(showAllText.slice(showAllText.search(/\d+/g)));
    const displayedMemberCount = await memberAvatars.count;
    const displayedGuestCount = await guestAvatars.count;
    const memberMore = await rightRail.memberListSection.members.find('[data-test-automation-id="rightShelfMemberListMore"]')
    const guestMore = await rightRail.memberListSection.guests.find('[data-test-automation-id="rightShelfMemberListMore"]')
    const restMemberText = await memberMore.textContent;
    const restMemberCount = Number(restMemberText.substring(1));
    const restGuestText = await guestMore.textContent;
    const restGuestCount = Number(restGuestText.substring(1));
    await t.expect(allCount).eql(38)
    await t.expect(displayedMemberCount).eql(17)
    await t.expect(displayedGuestCount).eql(5)
    await t.expect(restMemberCount).eql(11)
    await t.expect(restGuestCount).eql(5)
  }, true);
})

