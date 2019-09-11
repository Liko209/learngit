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

const withDialogLevel = <P extends WithDialogLevelProps>(
  Component: ComponentType<P>,
): SFC<P & WithDialogLevelProps> => {
  return (props: WithDialogLevelProps) => {
    const { open, canGoTop, ...rest } = props;
    const [hide, setHide] = useState(open ? (!canGoTop) : false);
    const callback = useCallback(() => {
      const dialog = document.querySelector('[role="dialog"]');
      // means we need to run at next
      if (dialog && dialog.parentNode) {
        if (canGoTop) {
          dialog.parentNode.removeChild(dialog);
          document.body.append(dialog);
        } else {
          // often this means there is a dialer
          const dialer = document.querySelector('[role="dialer"]');
          dialog.parentNode.insertBefore(dialog, dialer);
        }
      }
    }, [open, canGoTop]);

    useLayoutEffect(() => {
      if (open) {
        // need to re-adjust UI hierarchy
        const dialog = document.querySelector('[role="dialog"]');
        // means we need to run at next
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
    }, [open, canGoTop]);

    return (
      <Component open={open} hidden={open ? hide : false} {...rest as P} />
    );
  }
};

export { withDialogLevel, WithDialogLevelProps };
