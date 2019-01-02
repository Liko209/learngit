/*
 * @Author: doyle.wu
 * @Date: 2018-12-11 12:03:33
 */
import { Scene } from './Scene';
import { sceneConfigFactory } from './config/SceneConfigFactory';
import { LoginGatherer } from '../gatherers/LoginGatherer';
import { HomePageGatherer } from '../gatherers/HomePageGatherer';
import { OfflineGatherer } from '../gatherers/OfflineGatherer';

class OfflineScene extends Scene {

    async preHandle() {
        this.config = sceneConfigFactory.getOfflineConfig();

        this.config.passes[0].gatherers.unshift({
            instance: new LoginGatherer()
        });

        this.config.passes[0].gatherers.push({
            instance: new HomePageGatherer()
        });

        this.config.passes[0].gatherers.push({
            instance: new OfflineGatherer()
        });
    }
}

export {
    OfflineScene
}