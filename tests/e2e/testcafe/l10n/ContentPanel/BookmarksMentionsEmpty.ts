import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { AppRoot } from "../../v2/page-models/AppRoot";
import { h } from "../../v2/helpers";

fixture('ContentPanel/BookmarksMentionsEmpty')
.beforeEach(setupCase(BrandTire.RCOFFICE))
.afterEach(teardownCase());
test(formalName('Enter Bookmarks page and Mentions page display empty', ['P2','BookmarksMentionsEmpty','Mentions','V1.6','Hanny.Han']),
async t => {

	const loginUser = h(t).rcData.mainCompany.users[2];
	const app = new AppRoot(t);

	await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`,async () => {
		await h(t).directLoginWithUser(SITE_URL, loginUser);
		await app.homePage.ensureLoaded();
  });

  const bookmarkEntry = app.homePage.messageTab.bookmarksEntry;
  await h(t).withLog('When I enter bookmarks page', async () => {
		await bookmarkEntry.enter();
  });
  await h(t).log('Then I capture screenshot',{screenshotPath:'Jupiter_ContentPanel_BookmarkEmpty'});

  const mentionsEntry = app.homePage.messageTab.mentionsEntry;
  await h(t).withLog('When I enter Mentions page', async () => {
		await mentionsEntry.enter();
  });
  await h(t).log('Then I capture screenshot',{screenshotPath:'Jupiter_ContentPanel_MentionsEmpty'});
});
