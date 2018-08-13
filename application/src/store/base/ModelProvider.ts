import _ from 'lodash';

class ModelProvider {
  ModelCreator: object;
  constructor() {
    this.ModelCreator = {};
  }

  getModelCreator(name: string) {
    let Creator = this.ModelCreator[name];
    if (!Creator) {
      Creator = require(`../models/${_.upperFirst(name)}.ts`).default; // eslint-disable-line
      this.ModelCreator[name] = Creator;
    }
    return Creator;
  }
}

export default ModelProvider;
