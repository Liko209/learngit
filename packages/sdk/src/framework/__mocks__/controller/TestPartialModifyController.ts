import _ from 'lodash';

import { IEntitySourceController } from '../../controller/interface/IEntitySourceController';
import { IPartialModifyController } from '../../controller/interface/IPartialModifyController';
import { PartialModifyController } from '../../controller/impl/PartialModifyController';
import { IdModel } from '../../model';

const delegate = (
  getObject: Function,
  methodName: string,
  isAsync: boolean = true,
) => {
  return isAsync
    ? jest.fn().mockImplementation(async (...args) => {
        const object = getObject();
        return await object[methodName].call(object, ...args);
      })
    : jest.fn().mockImplementation((...args) => {
        const object = getObject();
        return object[methodName].call(object, ...args);
      });
};

export class TestPartialModifyController<T extends IdModel = IdModel>
  implements IPartialModifyController<T> {
  public partialModifyController: IPartialModifyController<T>;
  constructor(public entitySourceController: IEntitySourceController<T>) {
    this.partialModifyController = new PartialModifyController(
      entitySourceController,
    );
  }

  updatePartially = delegate(
    () => this.partialModifyController,
    'updatePartially',
    true,
  );
  getMergedEntity = delegate(
    () => this.partialModifyController,
    'getMergedEntity',
    false,
  );
  getRollbackPartialEntity = delegate(
    () => this.partialModifyController,
    'getRollbackPartialEntity',
    false,
  );
}
