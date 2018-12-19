/*
 * @Author: doyle.wu
 * @Date: 2018-12-09 21:01:04
 */
import { Scene } from './Scene';
import { SceneConfig } from './config/SceneConfig';
import { LoginPage } from '../pages/LoginPage';
import { HomePageGatherer } from '../gatherers/HomePageGatherer';

class LoginScene extends Scene {
    private _finallyUrl: string;

    async preHandle() {
        this.config = new SceneConfig();

        this.config.passes[0].gatherers.push({
            instance: new HomePageGatherer()
        });

        let loginPage = new LoginPage();
        this._finallyUrl = await loginPage.authUrl();
    }

    finallyUrl(): string {
        return this._finallyUrl;
    }
}

export {
    LoginScene
}