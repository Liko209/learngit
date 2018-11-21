/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-21 13:28:06
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { genDivAndDestroy } from '@/common/genDivAndDestroy';
import ThemeProvider from '@/containers/ThemeProvider';
import { JuiDialog, JuiDialogProps } from 'jui/components/Dialog';

function dialog(component: React.ComponentType<any>, config: JuiDialogProps) {
  const Component = component;
  const { container, destroy } = genDivAndDestroy();

  function render(currentConfig: JuiDialogProps) {
    ReactDOM.render(
      <ThemeProvider>
        <JuiDialog {...currentConfig}>
          <Component destroy={destroy} />
        </JuiDialog>
      </ThemeProvider>,
      container,
    );
  }

  render(config);

  return {
    destroy,
  };
}

export { dialog };
