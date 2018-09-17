import { ComponentLifecycle } from 'react';

interface IViewModel extends ComponentLifecycle<any, any, any> {
  extendProps<T extends Object>(props: T): this & T;
}

export { IViewModel };
