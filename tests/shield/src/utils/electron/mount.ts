/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-12 16:01:07
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import ReactDOM from 'react-dom';

const _createRootEl = () => {
  const root = document.createElement('div');
  root.id = 'root';
  return root;
};

const mount = <P>(element: React.ReactElement<P>) => {
  const root = _createRootEl();
  document.body.appendChild(root);

  const renderResult = ReactDOM.render(element, root);
  if (!renderResult || !(renderResult instanceof React.Component)) {
    throw new Error('Can not mount this element');
  }
  const instance = renderResult;

  return {
    instance,
    get htmlElement() {
      return ReactDOM.findDOMNode(instance) as HTMLElement;
    },
    unmount() {
      document.body.removeChild(root);
    },
  };
};

export { mount };
