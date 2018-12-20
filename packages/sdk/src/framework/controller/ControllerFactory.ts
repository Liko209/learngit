import { ControllerBuilder } from './impl/ControllerBuilder';
import { BaseModel } from './../../models';

class ControllerFactory {
  static getControllerBuilder<T extends BaseModel = BaseModel>() {
    return new ControllerBuilder<T>();
  }
}

export { ControllerFactory };
