# Jupiter E2E Tests #

## Description ##
Write and run E2E tests with testcafe

## Quick Start ##

### Environment Variables ###
You can export following environment variables or put them in .env file to control the test runner.

| Name                   | Default                             | Usage                                                        | Example                                                      |
| ---------------------- | ----------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| SITE_URL               | http://localhost:3000/unified-login | Url to test.                                                 |                                                              |
| SITE_ENV               | XMN-UP                              | Sandbox to use.                                              |                                                              |
| RC_PLATFORM_APP_KEY    |                                     | Ringcentral sdk credential                                   |                                                              |
| RC_PLATFORM_APP_SECRET |                                     | Ringcentral sdk credential                                   |                                                              |
| FIXTURES               | ./fixtures/\*\*/\*.ts               | Fixtures to run.                                             |                                                              |
| CONCURRENCY            | 1                                   | Number of workers.                                           |                                                              |
| SCREENSHOTS_PATH       | /tmp                                | Where screenshots are stored.                                |                                                              |
| BROWSERS               |                                     | Select browsers to run. To run on Selenium Grid, the name pattern of browsers should be selenium:{BRPWSER_NAME}. | valid values are: selenium:chrome, selenium:firefox, selenium: internet explorer, selenium: MicrosoftEdge |
| SELENIUM_SERVER        |                                     | Selenium grid server to run cases on. Pipeline should use this option to run on remove browsers. | http://xmn145.rcoffice.ringcentral.com:4444/wd/hub           |
| INCLUDE_TAGS           |                                     | Select cases to run by tags.                                 | P0,P1                                                        |
| EXCLUDE_TAGS           |                                     | Select cases not to run by tags.                             | P2,P3                                                        |
| BRANCH                 | default                             | Load execution strategy from ./configs/${BRANCH}.json, default config will be loaded if specific strategy is not found. Can be overwrote by other env vars. | e2e/maintenance                                              |
| ACTION                 | on_debug                            | Select strategy by action. Pipeline should use either on_push or on_merge. Can be overwrote by other env vars. | valid values are: on_push, on_merge, on_debug                |

### Command Line Sample ###
```bash
# install dependency
npm install

# using live mode during development
npx testcafe-live chrome ./fixtures/

# for local
# using default configuration to run
npm run e2e

# for pipeline
# using seleinum:{BROWSER_NAME} for remote run on selenium grid
# in order to run remotely, you need to set SELENIUM_SERVER (export or put it in .env)
DEBUG=false 
SITE_URL=http://localhost:8888 SELENIUM_SERVER=http://xmn145.rcoffice.ringcentral.com:4444/wd/hub ACTION='on_merge' BRANCH='your_branch_name' npm run e2e

# report can be found under ./allure/allure-results/
# using following command to view report
allure serve ./allure/allure-results/
```

## Generate Accounts in Account Pool

In case you don't have enough accounts sets to run cases, you can following below guideline to generate accounts by yourself.

You can find the account pool you use in ./config.ts and enter admin page. For example, suggest the account pool you use is http://xia01-i01-hbt02.lab.rcch.ringcentral.com:9998 . Then the admin page for this account is http://xia01-i01-hbt02.lab.rcch.ringcentral.com:9998/admin

On the admin page, choose "Account Generation",  and select Envrionment you use first (xmn-up for this example). Then you can click "Add Generation Setting"  to add the number of specific account types you want to generate. 

NOTE: Don't create too many accounts at a time (at most 10 for each account type).

## Coding Guideline ##

### Directory Outline ###
page-models: page class

fixtures: test cases

### Self Checklist ###
- [ ] Wrapping page elements and operations in Page Class
- [ ] Page Class must extends BasePage
- [ ] Using getter to visit page element
- [ ] Using BasePage#log to add messages to report
- [ ] Using BasePage#shouldNavigateTo to transfer from current page to new page object
