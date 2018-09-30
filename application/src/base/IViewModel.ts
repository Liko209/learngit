/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:07:16
 * Copyright © RingCentral. All rights reserved.
 */
interface IViewModel<P = {}, S = {}, SS = any> {
  onReceiveProps?(props: P): void;
  dispose?(): void;
  extendProps<T extends Object>(props: T): this & T;
}

export { IViewModel };
