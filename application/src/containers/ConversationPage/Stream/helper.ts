/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-05 14:12:57
 * Copyright © RingCentral. All rights reserved.
 */
import ReactDOM from 'react-dom';

async function scrollToComponent(
  component?: React.ReactInstance | null,
  options?: boolean | ScrollIntoViewOptions,
) {
  return new Promise((resolve, reject) => {
    if (!component) return;
    try {
      const el = ReactDOM.findDOMNode(component);
      if (el && el instanceof HTMLElement) {
        el.scrollIntoView(options);
        resolve();
      }
    } catch (err) {
      resolve();
      console.warn(err);
    }
  });
}

export { scrollToComponent };
