/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-10 19:29:47
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';

// const MODEL_MAP = {};

class ModelProvider {
  private _ModelCreator: object;
  constructor() {
    this._ModelCreator = {};
    // const requireContext = require.context('../models', false, /.*\.ts$/);
    // requireContext.keys().map(key => {
    //   const [, name] = key.split('/');
    //   MODEL_MAP[name.replace('.ts', '')] = requireContext(key).default;
    // });
  }

  getModelCreator(name: string) {
    let Creator = this._ModelCreator[name];
    if (!Creator) {
      // Creator = MODEL_MAP[_.upperFirst(name)];
      Creator = require(`../models/${_.upperFirst(name)}.ts`).default; // eslint-disable-line
      this._ModelCreator[name] = Creator;
    }
    return Creator;
  }
}

export default ModelProvider;
