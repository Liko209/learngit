import React, { Component, createElement } from 'react';
import hoistStatics from 'hoist-non-react-statics';
import { ENTITY_NAME } from '@/store';
import StoreManager from '@/store/base/StoreManager';
import MultiEntityMapStore from '@/store/base/MultiEntityMapStore';
import StoreContext from '@/store/context';

type IReactComponent<P = any> =
    | React.SFC<P>
    | React.ComponentClass<P>
    | React.ClassicComponentClass<P>;

export interface IStoresProps {
  getEntity: (entityName: string, id: number) => {};
}

type IProps<OriginalProps> = OriginalProps & IStoresProps;

/**
 * Store Injection
 */
function createStoreInjector<T, OriginalProps>(component: IReactComponent<OriginalProps>) {
  const displayName =
    `inject-
    ${(component.displayName ||
      component.name ||
      (component.constructor && component.constructor.name) ||
      'Unknown')}`;

  class Injector extends Component<OriginalProps> {
    static readonly displayName = displayName;
    static readonly wrappedComponent = component;
    wrappedInstance: React.ReactInstance;
    storeManager: StoreManager;
    entityStore: {[parameter: string]: MultiEntityMapStore} = {};

    constructor(props: OriginalProps) {
      super(props);
      this.createElementWithStores = this.createElementWithStores.bind(this);
      this.getEntity = this.getEntity.bind(this);
    }

    componentWillUnmount() {
      Object.values(this.entityStore).forEach((store) => {
        store.delUsedIds(this);
      });
    }

    getEntity(entityName: string, id: number) {
      const entityNames = Object.values(ENTITY_NAME);
      if (!entityNames.includes(entityName)) {
        throw new Error('entity name must be included in ENTITY_NAME');
      }

      let store = this.entityStore[entityName];
      if (!store) {
        store = this.storeManager.getEntityMapStore(entityName) as MultiEntityMapStore;
        this.entityStore[entityName] = store;
      }
      store.addUsedIds(this, id);

      return store.get(id);
    }

    createElementWithStores(storeManager: StoreManager) {
      const newProps = {
        ...(this.props as {}),
      } as IProps<OriginalProps>;

      this.storeManager = storeManager;
      newProps.getEntity = this.getEntity;

      return createElement(component, newProps);
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
  hoistStatics(Injector, component);

  return Injector;
}

export default function inject() {
  return function <T extends Component, OriginalProps extends {}>(
    componentClass: IReactComponent<OriginalProps>,
  ) {
    return createStoreInjector<T, OriginalProps>(componentClass);
  };
}
