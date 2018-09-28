import React, { ComponentType, createElement, ComponentClass } from 'react';
import hoistStatics from 'hoist-non-react-statics';
import { getEntity, getSingleEntity, getGlobalValue } from './utils';

type Omit<T, K extends keyof T> = Pick<
  T,
  ({ [P in keyof T]: P } &
    { [P in K]: never } & { [x: string]: never })[keyof T]
>;

export interface IStoreViewModel {
  dispose?: () => void;
}

export interface IInjectedStoreProps<VM> {
  vm: VM;
  getEntity: typeof getEntity;
  getSingleEntity: typeof getSingleEntity;
  getGlobalValue: typeof getGlobalValue;
}

const getDisplayName = (name: string) => `ViewModel(${name})`;

export default function inject(VM: new () => IStoreViewModel) {
  const vm = new VM();
  return <P extends IInjectedStoreProps<typeof vm>>(
    WrappedComponent: ComponentType<P>,
  ) => {
    const wrappedComponentName =
      WrappedComponent.displayName || WrappedComponent.name || 'Component';

    const displayName = getDisplayName(wrappedComponentName);

    class Injector extends React.Component<P> {
      static readonly displayName = displayName;
      static readonly WrappedComponent = WrappedComponent;

      componentWillUnmount() {
        if (vm.dispose) {
          vm.dispose();
        }
      }

      render() {
        const newProps = {
          ...(this.props as {}),
          vm,
          getEntity,
          getSingleEntity,
          getGlobalValue,
        } as IInjectedStoreProps<typeof vm>;
        return createElement(WrappedComponent, { ...newProps } as P &
          IInjectedStoreProps<typeof vm>);
      }
    }

    // Static fields from component should be visible on the generated Injector
    hoistStatics(Injector, WrappedComponent);

    return Injector as ComponentClass<
      Omit<P, keyof IInjectedStoreProps<typeof vm>> & {}
    > & { WrappedComponent: ComponentType<P> };
  };
}
