import { ComponentType } from 'react';
import { IViewModel } from './IViewModel';

interface IPlugin {
  install(vm: IViewModel): void;
  wrapView(View: ComponentType<any>): ComponentType<any>;
  uninstall(vm: IViewModel): void;
}

export { IPlugin };
