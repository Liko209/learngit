import _ from 'lodash';
import { ModelConstructor } from '../models/Base';

class ModelProvider {
  ModelCreator: object;
  constructor() {
    this.ModelCreator = {};
  }

  getModelCreator<T>(name: string): ModelConstructor<T> {
    let Creator = this.ModelCreator[name];
    if (!Creator) {
      Creator = require(`../models/${_.upperFirst(name)}.ts`).default; // eslint-disable-line
      this.ModelCreator[name] = Creator;
    }
    return Creator;
  }
}

export default ModelProvider;
