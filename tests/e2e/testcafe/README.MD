# Jupiter E2E Tests #

## Description ##
Write and run E2E tests with testcafe

## Quick Start ##
```bash
# install dependency
npm install

# using chrome/firefox/safari for local run
npm run testcafe -- -c 2 chrome -s /tmp/screen/ --reporter allure-lazy ./fixtures/*

# using seleinum:{BROWSER_NAME} for remote run on selenium grid
# in order to run remotely, you need to set SELENIUM_SERVER
export SELENIUM_SERVER=http://hub.lab.rcch.ringcentral.com:5555/wd/hub
npm run testcafe -- -c 2 selenium:chrome -s /tmp/screen/ --reporter allure-lazy ./fixtures/*

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
