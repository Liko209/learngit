/*
 * @Author: doyle.wu
 * @Date: 2018-12-11 12:02:26
 */
import { Scene } from './Scene';
import { SceneConfig } from './config/SceneConfig';
import { LoginGatherer } from '../gatherers/LoginGatherer';
import { HomePageGatherer } from '../gatherers/HomePageGatherer';

class RefreshScene extends Scene {
    async preHandle() {
        this.config = new SceneConfig();

        this.config.passes[0].gatherers.unshift({
            instance: new LoginGatherer()
        })
        this.config.passes[0].gatherers.push({
            instance: new HomePageGatherer()
        });
    }
}

export {
    RefreshScene
}
