/*
 * @Author: doyle.wu
 * @Date: 2018-12-09 21:01:04
 */
import { Scene } from './Scene';
import { SceneConfig } from './config/SceneConfig';
import { jupiterUtils } from '../utils/JupiterUtils';
import { HomePageGatherer } from '../gatherers/HomePageGatherer';

class LoginScene extends Scene {
    private _finallyUrl: string;

    async preHandle() {
        this.config = new SceneConfig();

        this.config.passes[0].gatherers.push({
            instance: new HomePageGatherer()
        });

        this._finallyUrl = await jupiterUtils.getAuthUrl(this.url);
    }

    finallyUrl(): string {
        return this._finallyUrl;
    }
}

export {
    LoginScene
}