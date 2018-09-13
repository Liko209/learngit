import { ComponentType } from 'react';
import { extendObservable } from 'mobx';
import { IViewModel } from './IViewModel';
import { IPlugin } from './IPlugin';

abstract class AbstractPlugin implements IPlugin {
  protected vm?: IViewModel;

  abstract wrapView(View: ComponentType<any>): ComponentType<any>;
  abstract uninstall(vm: IViewModel): void;

  install(vm: IViewModel): void {
    this.beforeInstall && this.beforeInstall(vm);
    this.vm = vm;
    this.afterInstall && this.afterInstall(vm);
  }

  beforeInstall?(vm: IViewModel): void;
  afterInstall?(vm: IViewModel): void;

  protected extendViewModel<T>(newProps: T): IViewModel & T {
    this.checkInstalled();
    extendObservable(this.vm!, newProps);
    return this.vm! as IViewModel & T;
  }

  protected checkInstalled() {
    if (!this.vm) throw new Error('Plugin should be install before use.');
  }
}
export { AbstractPlugin };
