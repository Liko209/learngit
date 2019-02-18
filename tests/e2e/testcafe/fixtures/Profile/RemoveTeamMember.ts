/*
 * @Author: Potar.He 
 * @Date: 2019-02-14 16:15:37 
 * @Last Modified by: 
 * @Last Modified time: 2019-02-18 12:53:41
 */
import * as assert from 'assert';
import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL, BrandTire } from '../../config';


fixture('Profile/RemoveTeamMember')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Only admin has the ability to remove members from the team', ['JPT-1081', 'RemoveTeamMember', 'P1', 'Potar.he']), async (t) => {
  const app = new AppRoot(t);

  const users = h(t).rcData.mainCompany.users
  const admin1 = users[5];
  const admin2 = users[6];
  const member = users[7];
  await h(t).platform(admin1).init();
  await h(t).glip(admin1).init();

  const adminName1 = await h(t).glip(admin1).getPersonPartialData('display_name', admin1.rcId);
  const adminName2 = await h(t).glip(admin1).getPersonPartialData('display_name', admin2.rcId);
  const memberName = await h(t).glip(admin1).getPersonPartialData('display_name', member.rcId);
  const removeFromTeamText = "Remove from team";

  let teamId;
  await h(t).withLog(`Given I have one team with 2 admins and 1 member`, async () => {
    teamId = await h(t).platform(admin1).createAndGetGroupId({
      name: uuid(),
      type: 'Team',
      members: [admin1.rcId, admin2.rcId, member.rcId]
    })
    const adminIds = await h(t).glip(admin1).toPersonId([admin1.rcId, admin2.rcId]);
    await h(t).glip(admin1).updateGroup(teamId, {
      permissions: {
        admin: {
          uids: adminIds
        }
      }
    });
  });

  await h(t).withLog(`Given I login Jupiter with admin1: ${admin1.company.number}#${admin1.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, admin1);
    await app.homePage.ensureLoaded();
  });

  const profileDialog = app.homePage.profileDialog;
  await h(t).withLog('And admin1 open team profile dialog', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
  }, true);

  await h(t).withLog('When admin1 hover admin1 row in members list', async () => {
    await t.hover(profileDialog.memberEntryByName(adminName1).self);
  });

  await h(t).withLog('Then Show "more" button', async () => {
    await t.expect(profileDialog.memberEntryByName(adminName1).moreButton.exists).ok();
  }, true);
  
  await h(t).withLog('When I click the more button', async () => {
    await t.click(profileDialog.memberEntryByName(adminName1).moreButton);
  });

  await h(t).withLog(`And no ${removeFromTeamText} button`, async () => {
    await t.expect(profileDialog.memberMoreMenu.removeFromTeamItem.withExactText(removeFromTeamText).exists).notOk();
  }, true);

  await h(t).withLog('When admin1 hover admin2 row in members list', async () => {
    await profileDialog.memberMoreMenu.quit();
    await t.hover(profileDialog.memberEntryByName(adminName2).self);
  });

  await h(t).withLog('Then Show "more" button', async () => {
    await t.expect(profileDialog.memberEntryByName(adminName2).moreButton.exists).ok();
  }, true);

  await h(t).withLog('When admin1 Click the more button', async () => {
    await t.click(profileDialog.memberEntryByName(adminName2).moreButton);
  });

  await h(t).withLog(`Then Show ${removeFromTeamText} button`, async () => {
    await t.expect(profileDialog.memberMoreMenu.removeFromTeamItem.withExactText(removeFromTeamText).exists).ok();
  }, true);

  await h(t).withLog(`When admin1 click ${removeFromTeamText} button`, async () => {
    await profileDialog.memberMoreMenu.clickRemoveTeamMember();
  });

  await h(t).withLog(`Then admin2 is removed from the list and Profile dialog shouldn't dismiss `, async () => {
    await profileDialog.shouldBePopUp();
    await t.expect(profileDialog.memberEntryByName(adminName2).exists).notOk();
    await H.retryUntilPass(async () => {
      const members = await h(t).glip(admin1).getGroup(teamId).then(res => res.data.members);
      const adminPersonsId = await h(t).glip(admin1).toPersonId(admin2.rcId);
      assert.ok(!_.includes(members, adminPersonsId), `Have not removed ${adminName2} from api`);
    })
  }, true);

  await h(t).withLog('When admin1 hover member row in members list', async () => {
    await t.hover(profileDialog.memberEntryByName(memberName).self);
  });

  await h(t).withLog('Then Show "more" button', async () => {
    await t.expect(profileDialog.memberEntryByName(memberName).moreButton.exists).ok();
  }, true);

  await h(t).withLog('When admin1 Click the more button', async () => {
    await t.click(profileDialog.memberEntryByName(memberName).moreButton);
  });

  await h(t).withLog(`Then Show ${removeFromTeamText} button`, async () => {
    await t.expect(profileDialog.memberMoreMenu.removeFromTeamItem.withExactText(removeFromTeamText).exists).ok();
  }, true);

  await h(t).withLog(`When admin1 click ${removeFromTeamText} button`, async () => {
    await profileDialog.memberMoreMenu.clickRemoveTeamMember();
  });

  await h(t).withLog(`Then the member is removed from the list and Profile dialog shouldn't dismiss `, async () => {
    await profileDialog.shouldBePopUp();
    await t.expect(profileDialog.memberEntryByName(memberName).exists).notOk();
    await H.retryUntilPass(async () => {
      const members = await h(t).glip(admin1).getGroup(teamId).then(res => res.data.members);
      const adminPersonsId = await h(t).glip(admin1).toPersonId(member.rcId);
      assert.ok(!_.includes(members, adminPersonsId), `Have not removed ${memberName} from api`);
    })
  }, true);

});

test(formalName('The remove team member permission should sync dynamically', ['JPT-1086', 'P1', 'RemoveTeamMember', 'Potar.he']), async (t) => {
  const app = new AppRoot(t);

  const users = h(t).rcData.mainCompany.users
  const loginAdmin = users[5];
  const anotherAdmin = users[6];
  const loginMember = users[7];
  await h(t).platform(anotherAdmin).init();
  await h(t).glip(anotherAdmin).init();
  await h(t).glip(loginMember).init()

  const members = [loginAdmin.rcId, anotherAdmin.rcId, loginMember.rcId]

  const loginAdminName = await h(t).glip(anotherAdmin).getPersonPartialData('display_name', loginAdmin.rcId);
  const anotherAdminName = await h(t).glip(anotherAdmin).getPersonPartialData('display_name', anotherAdmin.rcId);
  const loginAdminPersonId = await h(t).glip(anotherAdmin).toPersonId(loginAdmin.rcId);
  const anotherAdminPersonId = await h(t).glip(anotherAdmin).toPersonId(anotherAdmin.rcId);
  const loginMemberPersonId = await h(t).glip(anotherAdmin).toPersonId(loginMember.rcId);
  const removeFromTeamText = "Remove from team";

  let teamId;
  await h(t).withLog(`Given I have one team with 2 admins and 1 member`, async () => {
    teamId = await h(t).platform(anotherAdmin).createAndGetGroupId({
      name: uuid(),
      type: 'Team',
      members
    })
    const adminIds = await h(t).glip(anotherAdmin).toPersonId([loginAdmin.rcId, anotherAdmin.rcId]);
    await h(t).glip(anotherAdmin).updateGroup(teamId, {
      permissions: {
        admin: {
          uids: adminIds
        }
      }
    });
  });

  await h(t).withLog(`Given I login Jupiter with admin ${loginAdmin.company.number}#${loginAdmin.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginAdmin);
    await app.homePage.ensureLoaded();
  });

  const profileDialog = app.homePage.profileDialog;
  await h(t).withLog('And login user open team profile dialog', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
  }, true);


  await h(t).withLog(`When The other admin changed login user's role to non-admin`, async () => {
    await h(t).glip(anotherAdmin).updateGroup(teamId, {
      permissions: {
        admin: {
          uids: [].concat(anotherAdminPersonId)
        }
      }
    })
  });

  for (const i of _.range(members.length)) {
    await h(t).withLog(`When login user hover any row ${i}/${members.length} in members list`, async () => {
      await t.hover(profileDialog.nthMemberEntry(i).self);
    });

    await h(t).withLog('Then no "more" button', async () => {
      await t.expect(profileDialog.nthMemberEntry(i).moreButton.exists).notOk();
    }, true);
  }

  await h(t).withLog(`Given the login user logout and login with member: ${loginMember.company.number}#${loginMember.extension}`, async () => {
    await profileDialog.close();
    await app.homePage.openSettingMenu();
    await app.homePage.settingMenu.ensureLoaded();
    await app.homePage.settingMenu.clickLogout();
    await t.wait(2e3);
    await h(t).directLoginWithUser(SITE_URL, loginMember);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And login user open team profile dialog', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
  }, true);

  await h(t).withLog(`And The other admin changed login user's role to admin`, async () => {
    await h(t).glip(anotherAdmin).updateGroup(teamId, {
      permissions: {
        admin: {
          uids: [].concat(anotherAdminPersonId, loginMemberPersonId)
        }
      }
    })
  });

  const toBeRemoveMembers = {
    [loginAdminPersonId]: loginAdminName,
    [anotherAdminPersonId]: anotherAdminName
  }

  for (const personId in toBeRemoveMembers) {
    const memberName = toBeRemoveMembers[personId];
    await h(t).withLog(`When the login user hover other member ${memberName} row in the members list`, async () => {
      await t.hover(profileDialog.memberEntryByName(memberName).self);
    });

    await h(t).withLog('Then Show "more" button', async () => {
      await t.expect(profileDialog.memberEntryByName(memberName).moreButton.exists).ok();
    }, true);


    await h(t).withLog('When login user Click the more button', async () => {
      await t.click(profileDialog.memberEntryByName(memberName).moreButton);
    });

    await h(t).withLog(`Then Show ${removeFromTeamText} button`, async () => {
      await t.expect(profileDialog.memberMoreMenu.removeFromTeamItem.withExactText(removeFromTeamText).exists).ok();
    }, true);

    await h(t).withLog(`When login user click ${removeFromTeamText} button`, async () => {
      await profileDialog.memberMoreMenu.clickRemoveTeamMember();
    });

    await h(t).withLog(`Then member ${memberName} is removed from the list and Profile dialog shouldn't dismiss `, async () => {
      await profileDialog.shouldBePopUp();
      await t.expect(profileDialog.memberEntryByName(memberName).exists).notOk();
      await H.retryUntilPass(async () => {
        const members = await h(t).glip(loginMember).getGroup(teamId).then(res => res.data.members);
        assert.ok(!_.includes(members, personId), `Have not removed ${memberName} from api`);
      })
    }, true);
  }

});

test(formalName(`The team should be removed from the removed member's side`, ['JPT-1085', 'P1', 'RemoveTeamMember', 'Potar.he']), async (t) => {
  const app = new AppRoot(t);

  const users = h(t).rcData.mainCompany.users
  const loginAdmin = users[5];
  const anotherAdmin = users[6];
  const member1 = users[7];
  await h(t).platform(loginAdmin).init();
  await h(t).glip(loginAdmin).init();

  const roleLoginAdmin = await h(t).userRole(loginAdmin);

  const teamSection = app.homePage.messageTab.teamsSection;
  const profileDialog = app.homePage.profileDialog;

  let teamId;
  await h(t).withLog(`Given I have one team with 2 admins and 1 member`, async () => {
    teamId = await h(t).platform(loginAdmin).createAndGetGroupId({
      name: uuid(),
      type: 'Team',
      members: [loginAdmin.rcId, anotherAdmin.rcId, member1.rcId]
    })
    const adminIds = await h(t).glip(loginAdmin).toPersonId([loginAdmin.rcId, anotherAdmin.rcId]);
    await h(t).glip(loginAdmin).updateGroup(teamId, {
      permissions: {
        admin: {
          uids: adminIds
        }
      }
    });
  });

  const otherUsers = [anotherAdmin, member1];
  for (const member of otherUsers) {
    const roleMember = await h(t).userRole(member);
    const memberName = await h(t).glip(loginAdmin).getPersonPartialData('display_name', member.rcId);
    const memberPersonId = await h(t).glip(loginAdmin).toPersonId(member.rcId);
    await h(t).withLog(`When And login admin ${loginAdmin.company.number}#${loginAdmin.extension} open the team profile dialog`, async () => {
      await t.useRole(roleLoginAdmin);
      await app.homePage.ensureLoaded();
      await teamSection.conversationEntryById(teamId).openMoreMenu();
      await app.homePage.messageTab.moreMenu.profile.enter();
    }, true);
  
    await h(t).withLog(`When the login admin remove ${memberName} from team via member row MoreMenu`, async () => {
      await profileDialog.memberEntryByName(memberName).openMoreMenu();
      await profileDialog.memberMoreMenu.clickRemoveTeamMember();
    });
  
    await h(t).withLog(`Then member ${memberName} is removed from the list and Profile dialog shouldn't dismiss `, async () => {
      await profileDialog.shouldBePopUp();
      await t.expect(profileDialog.memberEntryByName(memberName).exists).notOk();
      await H.retryUntilPass(async () => {
        const members = await h(t).glip(loginAdmin).getGroup(teamId).then(res => res.data.members);
        assert.ok(!_.includes(members, memberPersonId), `Have not removed ${memberName} from api`);
      })
    }, true);
  
    await h(t).withLog(`When I login Jupiter with a: ${member.company.number}#${member.extension}`, async () => {
      await t.useRole(roleMember);
    });
  
    await h(t).withLog(`Then the team should be removed from the list`, async () => {
      await t.expect(teamSection.conversationEntryById(teamId).exists).notOk();
    });
  
    await h(t).withLog(`When The login admin1 send one post to the team`, async () => {
      await h(t).platform(loginAdmin).sendTextPost(uuid(), teamId);
    });
  
    await h(t).withLog(`Then The team shouldn't show in the conversation list`, async () => {
      await t.expect(teamSection.conversationEntryById(teamId).exists).notOk();
    });
  }

});
