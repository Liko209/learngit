
import { v4 as uuid } from 'uuid';
import * as assert from 'assert';
import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { h, H } from "../../v2/helpers";
import { AppRoot } from "../../v2/page-models/AppRoot";
import { IGroup } from "../../v2/models";




fixture('SendMessages').beforeEach(setupCase(BrandTire.RCOFFICE)).afterEach(teardownCase())
test(formalName('Check the like button ', ['P1','SendMessages','V1.4','Hanny.Han']),async(t)=>{
  const users=h(t).rcData.mainCompany.users;
  const userA = users[4];
  const userB = users[5];
  const app=new AppRoot(t);
  await h(t).glip(userB).init();


  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    members: [userA, userB],
    owner: userA
  }

  let postId;
  let currentNumber = 0;
  await h(t).withLog(`Given I one team named: "${team.name}" and one message in it`, async() =>{
    await h(t).scenarioHelper.createTeam(team);
    postId = await h(t).scenarioHelper.sentAndGetTextPostId(uuid(), team, userA);
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  const postCard = conversationPage.postItemById(postId);

  await h(t).withLog(`Given I login Jupiter with ${userA.company.number}#${userA.extension}`,async()=>{
    await h(t).directLoginWithUser(SITE_URL, userA);
    await app.homePage.ensureLoaded();
  })

  await h(t).withLog(`When I open the team ${team.name} and hover the message`, async()=>{
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.waitUntilPostsBeLoaded;
    await postCard.ensureLoaded();
    await t.hover(postCard.self);

  });

  await h(t).withLog(`Then Appear action bar and there have hollow "like" icon `, async () => {
    await t.hover(postCard.likeToggleOnActionBar);
  });

  await h(t).withLog(`and userB check like number should be ${currentNumber} on the message via Api`, async () => {
    await H.retryUntilPass(async () => {
      const likeCount = await h(t).glip(userB).getPostLikesCount(postId);
      assert.deepStrictEqual(currentNumber, likeCount, `likeCount expect ${currentNumber}, actual ${likeCount}`);
    });
  });
  await h(t).log('Then the hover like  will be displayed',{screenshotPath:'Jupiter_ContentPanel_MessagesLike'})


})
