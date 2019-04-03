import { container, Jupiter } from '../../Jupiter';
import * as app from './modules/app/module.config';
import * as math from './modules/math/module.config';

class Demo {
  private _jupiter = container.get(Jupiter);

  constructor() {
    this._jupiter.registerModule(app.config);
    this._jupiter.registerModule(math.config);
  }

  run() {
    this._jupiter.bootstrap();
  }
}

export { Demo };
