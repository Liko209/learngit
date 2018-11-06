/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-05 14:12:57
 * Copyright © RingCentral. All rights reserved.
 */
import ReactDOM from 'react-dom';

function scrollToComponent(component?: React.ReactInstance | null) {
  if (!component) return;
  const el = ReactDOM.findDOMNode(component);
  if (el && el instanceof HTMLElement) {
    el.scrollIntoView();
  }
}

export { scrollToComponent };
