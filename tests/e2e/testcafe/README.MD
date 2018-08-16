# Jupiter E2E Tests #

## Description ##
Write and run E2E tests with testcafe

## Quick Start ##

### Environment Variables ###
| Name             | Default                         | Usage                                                                                                            | Example                                         |
|------------------|---------------------------------|------------------------------------------------------------------------------------------------------------------|-------------------------------------------------|
| FIXTURES         | $TESTCAFE_ROOT/fixtures/**/*.ts | Fixtures to run.                                                                                                 |                                                 |
| CONCURRENCY      | 1                               | Number of workers.                                                                                               |                                                 |
| SCREENSHOTS_PATH | /tmp/                           | Where screenshots are stored.                                                                                    |                                                 |
| BROWSERS         | chrome                          | Select browsers to run. To run on Selenium Grid, the name pattern of browsers should be selenium:{BROWSER_NAME}. | selenium:chrome                                 |
| SELENIUM_SERVER  |                                 | Selenium grid server to run cases on.                                                                            | http://hub.lab.rcch.ringcentral.com:5555/wd/hub |
| INCLUDE_TAGS     |                                 | Select cases to run by tags.                                                                                     | P0,P1                                           |
| EXCLUDE_TAGS     |                                 | Select cases not to run by tags.                                                                                 | P2,P3                                           |

### Command Line Sample ###
```bash
# install dependency
npm install

# using default configuration to run
npm run e2e

# using seleinum:{BROWSER_NAME} for remote run on selenium grid
# in order to run remotely, you need to set SELENIUM_SERVER
export SELENIUM_SERVER=http://hub.lab.rcch.ringcentral.com:5555/wd/hub
BROWSERS="selenium:chrome,selenium:firefox" npm run e2e

# report can be found under ./allure/allure-results/
# using following command to view report
allure serve ./allure/allure-results/
```

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
