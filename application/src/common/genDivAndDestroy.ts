/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-21 15:20:31
 * Copyright © RingCentral. All rights reserved.
 */
import ReactDOM from 'react-dom';

function genDivAndDestroy() {
  const container = document.createElement('div');
  document.getElementById('root')!.appendChild(container);

  function destroy() {
    const unmountResult = ReactDOM.unmountComponentAtNode(container);
    if (unmountResult && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
  return {
    container,
    destroy,
  };
}

export { genDivAndDestroy };
