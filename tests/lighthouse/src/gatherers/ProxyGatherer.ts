/*
 * @Author: doyle.wu
 * @Date: 2018-12-25 14:37:09
 */

const Gatherer = require('lighthouse/lighthouse-core/gather/gatherers/gatherer');
import { mockHelper } from '../mock/MockHelper';

class ProxyGatherer extends Gatherer {

    async beforePass(passContext) {
    }

    async afterPass(passContext) {
        // the mocker will effect lighthouse audit, so close mocker before audit.
        mockHelper.close();

        return {};
    }

    async pass(passContext) {
    }
}

export {
    ProxyGatherer
}