import React, { Component, createElement, ComponentType } from 'react';
import hoistStatics from 'hoist-non-react-statics';
import { BaseModel } from 'sdk/models';
import { ENTITY_NAME } from '@/store';
import StoreManager from '@/store/base/StoreManager';
import MultiEntityMapStore from '@/store/base/MultiEntityMapStore';
import StoreContext from '@/store/context';
import { Omit } from '@material-ui/core';
import Base from '@/store/models/Base';

export interface IComponentWithGetEntityProps {
  getEntity: (entityName: string, id: number) => {};
}

/**
 * Store Injection
 */
function createStoreInjector<P>(WrappedComponent: ComponentType<P>) {
  const displayName =
    `inject-
    ${(WrappedComponent.displayName ||
      WrappedComponent.name ||
      (WrappedComponent.constructor && WrappedComponent.constructor.name) ||
      'Unknown')}`;

  class Injector extends Component<P & IComponentWithGetEntityProps> {
    static readonly displayName = displayName;
    static readonly wrappedComponent = WrappedComponent;
    wrappedInstance: React.ReactInstance;
    storeManager: StoreManager;
    entityStore: { [parameter: string]: MultiEntityMapStore<any, any> } = {};

    constructor(props: P & IComponentWithGetEntityProps) {
      super(props);
      this.createElementWithStores = this.createElementWithStores.bind(this);
      this.getEntity = this.getEntity.bind(this);
    }

    componentWillUnmount() {
      Object.values(this.entityStore).forEach((store) => {
        store.delUsedIds(this);
      });
    }

    getEntity<T extends BaseModel, K extends Base<T>>(entityName: ENTITY_NAME, id: number) {
      let store = this.entityStore[entityName];
      if (!store) {
        store = this.storeManager.getEntityMapStore(entityName) as MultiEntityMapStore<T, K>;
        this.entityStore[entityName] = store;
      }
      store.addUsedIds(this, id);

      return store.get(id);
    }

    createElementWithStores(storeManager: StoreManager) {
      this.storeManager = storeManager;

      return createElement<P>(
        WrappedComponent,
        { ...this.props as {}, getEntity: this.getEntity } as P & IComponentWithGetEntityProps,
      );
    }

    render() {
      return (
        <StoreContext.Consumer>
          {this.createElementWithStores}
        </StoreContext.Consumer>
      );
    }
  }

  // Static fields from component should be visible on the generated Injector
  hoistStatics(Injector, WrappedComponent);

  return Injector;
}

export default function inject() {
  return <OriginalProps extends { [key: string]: any }, Component extends React.ComponentClass<OriginalProps>>(
    WrappedComponent: ComponentType<OriginalProps>,
  ): ComponentType<Omit<OriginalProps, keyof IComponentWithGetEntityProps>> => {
    return createStoreInjector<OriginalProps>(WrappedComponent);
  };
}
