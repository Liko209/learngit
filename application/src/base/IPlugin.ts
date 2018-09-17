import { ComponentType } from 'react';
import { IViewModel } from './IViewModel';

interface IPlugin {
  install(vm: IViewModel): void;
  wrapView(View: ComponentType<any>): ComponentType<any>;
}

export { IPlugin };
