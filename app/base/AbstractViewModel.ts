/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:07:02
 * Copyright © RingCentral. All rights reserved.
 */
import { extendObservable } from 'mobx';
import { IViewModel } from './IViewModel';

abstract class AbstractViewModel implements IViewModel {
  extendProps<T extends Object>(props: T): this & T {
    return extendObservable(this, props);
  }
}

export { AbstractViewModel };
