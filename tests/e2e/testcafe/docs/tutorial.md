# E2E Guideline

## Sample ##

``` typescript

import * as faker from 'faker/locale/en';
import { v4 as uuid } from 'uuid';

import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL } from '../../config';

fixture('Send Messages')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());

test(formalName('Send message', ['P0', 'JPT-77']), async (t) => {
  const users = h(t).rcData.mainCompany.users;

  const loginUser = users[3];
  const app = new AppRoot(t);

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I enter a conversation', async () => {
    await app.homePage.messageTab.directMessagesSection.expand();
    await app.homePage.messageTab.directMessagesSection.nthConversationEntry(0).enter();
  });

  const identifier = uuid();
  const message = `${faker.lorem.sentence()} ${identifier}`;

  const conversationSection = app.homePage.messageTab.conversationSection;
  await h(t).withLog('Then I can send message to this conversation', async () => {
    await conversationSection.sendMessage(message);
  });

  await h(t).withLog('And I should read this message from post list', async () => {
    await t.expect(conversationSection.posts.child().withText(identifier).exists).ok();
  }, true);
});
```

## How to Write Automation Script

### Template ###

You can start your first case from following template code

```typescript
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL, BrandTire } from '../config';

fixture('Fixture Name')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Case1 Name', ['tag1', 'tag2']), async (t) => {
  // steps
});
test(formalName('Case2 Name', ['tag1', 'tag2']), async (t) => {
  // steps
});
/* more cases */
```

### Use Page Model ###

AppRoot class is the entry of page model.

You should create an instance of AppRoot at the beginning of your test script, then use can use page model object to manipulate web elements.

```typescript
const app = new AppRoot(t);
```

The modification of Page Model should pass the review of SDET team since it may affect a lot of cases.

### Use Helper Functions ###

Besides of TestController which is provided by testcafe, we also provide a helper lib which wrap and extend feature of testcafe to help you writing automation script.

Here is the sample code about how to use helper lib

```typescript
import { formalName } from '../../libs/filter';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL } from '../../config';
import { h } from '../../v2/helpers' // import helper lib

fixture('Fixture Name')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());

test(formalName('Case1 Name', ['tag1', 'tag2']), async (t) => {
  /* fetch test data */
  h(t).rcData; // entry of test data
  const loginUser = h(t).rcData.mainCompany.users[0];  // fetch an account from test data

  /* sdk */
  await h(t).platform(loginUser).init(); // login platform sdk
  await h(t).glip(loginUser).init();  // login glip sdk

  /* log */
  await h(t).log('hello world'); // writing a log, which will be found in the report
  await h(t).withLog('hello world', async () => {
    // steps
  });  // writing steps within withLog closure, so that the execution status and duration will be updated automatically

  /* more step */

});
```

### How to Log Steps ###

We prefer to use BDD style steps that start with Given-When-Then to describe your script.

An ideal report looks like this:

![Report Sample](./res/report-sample.png)

##  Execution

### Select cases to execute

You can use following environment variables to select cases you want to execute

`INCLUDE_TAGS` `EXCLUDE_TAGS` Filter cases by tag.

`CASE_FILTER` Filter cases by filtrex query language. For more detail, please check: <https://github.com/link89/filtrex/blob/master/README.md>

### Local execution without selenium

In most case you can working with testcafe without selenium. You can provide a `.env` file to setup exectuion option. Here is an example

```bash
RC_PLATFORM_APP_KEY=
RC_PLATFORM_APP_SECRET=

# select cases you want to execute
CASE_FILTER='tags in ("P0")'
FIXTURES=./fixtures/

TESTS_LOG=debug-test.log

SITE_URL=https://develop.fiji.gliprc.com
SITE_ENV=GLP-CI1-XMN
BROWSERS=chrome
```

and run `npm run e2e` to start execution.

### Local execution with selenium-grid

Some cases (telephony for example) may need special previllege to execute, for cases of this kind you have to execute them via selenium-grid with specific setting items.

To execute on selenium-grid, you have to provide a file named `capabilities.json`

```json
{
    "chrome": {
        "chromeOptions": {
            "args": [
                "--use-fake-ui-for-media-stream",
                "--use-fake-device-for-media-stream",
                "--allow-http-screen-capture",
                "--disable-web-security",
                "--ignore-certificate-errors",
                "--no-user-gesture-required",
                "--autoplay-policy=no-user-gesture-required",
                "--ignore-autoplay-restrictions"
            ],
            "prefs": {
                "profile.managed_default_content_settings.notifications": 1,
                "intl.accept_languages": "en"
            }
        }
    }
}
```

and config to using selenium-grid in  `.env` file

```bash
RC_PLATFORM_APP_KEY=
RC_PLATFORM_APP_SECRET=

CASE_FILTER='tags in ("JPT-1747")'
FIXTURES=./telephony

SITE_URL=https://develop.fiji.gliprc.com
SITE_ENV=GLP-CI1-XMN

ENABLE_SSL=true
BROWSERS=selenium:chrome
SELENIUM_SERVER=
```

and run `npm run e2e` to start execution.

### 

## Tips ##

#### search h(t) first if an operation doesn't support by testcafe ####

For some common operations, like fetch href, reload page, that cannot be found in testcafe, try h(t)

#### use textContent to assert existence of an element ####

```typescript
await t.expect(titleText.textContent).eql('Jupiter')
```

#### use uuid and faker to generate random content ####

```typescript
import * as faker from 'faker/locale/en';
import { v4 as uuid } from 'uuid';

const teamName = `Team ${uuid()}`;
const message = faker.lorem.sentence();
```

#### if an element is hidden behind a tooltip, you should hover to other element before click it ####

```typescript
await t.hover('html').click(button);
```

####  use h(t).resetGlipAccount to clear up data  ####

```typescript
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4];
    await h(t).resetGlipAccount(loginUser); // reset
    await h(t).platform(loginUser).init(); // init platform sdk before using

    let chat, group;
    await h(t).withLog('Given I have an extension with 1 private chat and 1 group chat', async () => {
      chat = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'PrivateChat', members: [loginUser.rcId, users[5].rcId],
      });
      group = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Group', members: [loginUser.rcId, users[5].rcId, users[6].rcId],
      });
    });
```

#### Don't use testcafe's `expect` API as gerneral purpose assertion library

testcafe's `expect` API is designed for expect web element, don't use it as gerneral purpose assertion library. There is a chance that testcafe will get stucked when the assertion is failed.

```typescript
// Don't do this
await t.expect(list1.length === list2.length).ok();
// Do this
import * as assert from "assert";
assert.equal(list1.length, list2.length);

```

