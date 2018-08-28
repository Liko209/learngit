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
  stores: {
    [key: string]: MultiEntityMapStore<any, any>;
  };
}

type IProps<OriginalProps> = OriginalProps & IStoresProps;

/**
 * Store Injection
 */
function createStoreInjector<T, OriginalProps>(
  grabStoresFn: (storeManager: StoreManager) => {},
  component: IReactComponent<OriginalProps>,
  injectNames: string,
) {
  let displayName =
    `inject-
    ${(component.displayName ||
      component.name ||
      (component.constructor && component.constructor.name) ||
      'Unknown')}`;
  if (injectNames) displayName = `${displayName}-with-${injectNames}`;

  class Injector extends Component<OriginalProps> {
    static readonly displayName = displayName;
    static readonly wrappedComponent = component;
    wrappedInstance: React.ReactInstance;

    constructor(props: OriginalProps) {
      super(props);
      this.createElementWithStores = this.createElementWithStores.bind(this);
    }

    createElementWithStores(storeManager: StoreManager) {
      const newProps = {
        ...(this.props as {}),
        stores: grabStoresFn(storeManager),
      } as IProps<OriginalProps>;
      const stores = grabStoresFn(storeManager);
      newProps.stores = stores;

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

function grabStoresByName(storeNames: string[]) {
  return function (storeManager: StoreManager) {
    const stores = {};
    const entityName = Object.values(ENTITY_NAME);
    storeNames.forEach((storeName) => {
      if (!entityName.includes(storeName)) {
        throw new Error(
          'MobX injector: Store \'' +
          storeName +
          '\' is not available! Make sure it is provided by some Provider',
        );
      }
      stores[storeName] = storeManager.getEntityMapStore(storeName);
    });
    return stores;
  };
}

export default function inject(...storeNames: string[]) {
  const grabStoresFn = grabStoresByName(storeNames);
  return function <T extends Component, OriginalProps extends {}>(
    componentClass: IReactComponent<OriginalProps>,
  ) {
    return createStoreInjector<T, OriginalProps>(
      grabStoresFn,
      componentClass,
      storeNames.join('-'),
    );
  };
}
