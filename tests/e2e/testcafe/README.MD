# Jupiter E2E Tests #

## Description ##
Write and run E2E tests with testcafe

## Quick Start ##
```bash
npm install
# using chrome/firefox/safari for local run
npm run testcafe chrome ./fixtures/*

# using seleinum:{BROWSER_NAME} for remote run on selenium grid
# in order to run remotely, you need to set SELENIUM_SERVER
export SELENIUM_SERVER=http://hub.lab.rcch.ringcentral.com:5555/wd/hub
npm run testcafe selenium:chrome ./fixtures/*
```

## Coding Guideline ##
TODO

### Directory Outline ###
page-models: page models
fixtures: test cases

TODO
