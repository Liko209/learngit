/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-10 19:29:47
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';

class ModelProvider {
  private _ModelCreator: object;
  constructor() {
    this._ModelCreator = {};
  }

  getModelCreator(name: string) {
    let Creator = this._ModelCreator[name];
    if (!Creator) {
      Creator = require(`../models/${_.upperFirst(name)}.ts`).default; // eslint-disable-line
      this._ModelCreator[name] = Creator;
    }
    return Creator;
  }
}

export default ModelProvider;
