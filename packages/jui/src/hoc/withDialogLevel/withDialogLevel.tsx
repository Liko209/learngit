/*
 * @Author: isaac.liu
 * @Date: 2019-09-11 16:33:30
 * Copyright © RingCentral. All rights reserved.
 */
import React, { SFC, ComponentType, useCallback, useState, useLayoutEffect } from 'react';

type WithDialogLevelProps = {
  open: boolean;
  canGoTop: boolean;
}

const withDialogLevel = <P extends { hidden?: boolean }>(
  Component: ComponentType<P>,
): SFC<P & WithDialogLevelProps> => {
  return (props: WithDialogLevelProps) => {
    const { open, canGoTop, ...rest } = props;
    const dialer = document.querySelector('[role="dialer"]');
    const isDialerHidden = dialer ? (dialer.getAttribute('style') as string).includes('visibility: hidden') : true;
    const [hide, setHide] = useState(open ? (isDialerHidden ? false : !canGoTop) : false);
    const callback = useCallback(() => {
      const dialog = document.querySelector('[role="dialog"]');
      // often this means there is a dialer
      if (isDialerHidden) {
        return;
      }
      if (dialog && dialog.parentNode) {
        if (canGoTop) {
          dialog.parentNode.removeChild(dialog);
          document.body.append(dialog);
        } else {
          dialog.parentNode.insertBefore(dialog, dialer);
        }
      }
    }, [open]);

    useLayoutEffect(() => {
      // const dialer = document.querySelector('[role="dialer"]');
      // const isDialerHidden = dialer ? (dialer.getAttribute('style') as string).includes('visibility: hidden') : true;
      if (open) {
        // need to re-adjust UI hierarchy
        const dialog = document.querySelector('[role="dialog"]');
        if (isDialerHidden) {
          setHide(false);
          return () => ({});
        }
        // often this means there is a dialer
        if (dialog && dialog.parentNode) {
          callback();
        } else {
          const id = requestAnimationFrame(() => {
            callback();
            setHide(false);
          });
          return (() => cancelAnimationFrame(id));
        }
      }
      return () => ({});
    }, [open]);
    return (
      <Component open={open} hidden={open ? hide : false} {...rest as P} />
    );
  }
};

export { withDialogLevel, WithDialogLevelProps };
