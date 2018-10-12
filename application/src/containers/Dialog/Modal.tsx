/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-11 13:21:43
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import ThemeProvider from '@/containers/ThemeProvider';
import { JuiModal, JuiModalProps } from 'jui/components/Dialog/Modal1';

function modal(config: JuiModalProps) {
  const div = document.createElement('div');
  document.body.appendChild(div);

  function destroy() {
    const unmountResult = ReactDOM.unmountComponentAtNode(div);
    if (unmountResult && div.parentNode) {
      div.parentNode.removeChild(div);
    }
  }

  const { onOK, onCancel, ...newConfig } = config;

  const currentConfig = {
    ...newConfig,
    open: true,
    onOK() {
      onOK && onOK();
      destroy();
    },
    onCancel() {
      onCancel && onCancel();
      destroy();
    },
  } as any;

  function render(props: JuiModalProps) {
    ReactDOM.render(
      <ThemeProvider>
        <JuiModal {...props} />
      </ThemeProvider>,
      div,
    );
  }

  render(currentConfig);

  return {
    destroy,
  };
}

export { modal };
