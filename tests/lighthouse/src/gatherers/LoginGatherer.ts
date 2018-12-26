import * as lighthouse from 'lighthouse';
import * as core from 'core-js';
/*
 * @Author: doyle.wu
 * @Date: 2018-12-12 12:56:30
 */
const Gatherer = require('lighthouse/lighthouse-core/gather/gatherers/gatherer');
import { jupiterUtils } from '../utils/JupiterUtils';
import { HomePage } from '../pages/HomePage';

class LoginGatherer extends Gatherer {

    async beforePass(passContext) {
        let { url } = passContext.settings;

        let homePage = new HomePage(passContext);

        let authUrl = await jupiterUtils.getAuthUrl(url);
        let page = await homePage.newPage();

        await page.goto(authUrl);

        await homePage.waitForCompleted();

        await homePage.close();
    }

    afterPass(passContext) {
        return {};
    }

    pass(passContext) {
    }
}

export {
    LoginGatherer
}