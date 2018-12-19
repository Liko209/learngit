import * as lighthouse from 'lighthouse';
import * as core from 'core-js';
/*
 * @Author: doyle.wu
 * @Date: 2018-12-12 12:56:30
 */
const Gatherer = require('lighthouse/lighthouse-core/gather/gatherers/gatherer');
import { LoginPage2 } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';

class LoginGatherer extends Gatherer {

    async beforePass(passContext) {
        let loginPage = new LoginPage2(passContext);
        await loginPage.login();

        let homePage = new HomePage(passContext);
        
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