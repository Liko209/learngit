import { ComponentLifecycle } from 'react';
interface IViewModel extends ComponentLifecycle<any, any, any> {
  extendViewProps(key: string, value?: any): void;
}

export { IViewModel };
