/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:07:16
 * Copyright © RingCentral. All rights reserved.
 */
import { ComponentLifecycle } from 'react';

interface IViewModel<P = {}, S = {}, SS = any>
  extends ComponentLifecycle<P, S, SS> {
  ready?(): void;
  extendProps<T extends Object>(props: T): this & T;
}

export { IViewModel };
