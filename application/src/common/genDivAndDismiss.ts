/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-21 15:20:31
 * Copyright © RingCentral. All rights reserved.
 */
import ReactDOM from 'react-dom';

function genDivAndDismiss() {
  const container = document.createElement('div');
  document.getElementById('root')!.appendChild(container);

  function dismiss() {
    const unmountResult = ReactDOM.unmountComponentAtNode(container);
    if (unmountResult && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
  return {
    container,
    dismiss,
  };
}

export { genDivAndDismiss };
