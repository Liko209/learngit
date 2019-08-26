/*
 * @Author: ken.li
 * @Date: 2019-08-26 09:42:42
 * Copyright © RingCentral. All rights reserved.
 */

import { dataAnalysis } from 'foundation/analysis';

function withEscTracking(onCancel: any) {
  const onClose = (event: React.MouseEvent, reason: string) => {
    if (onCancel) {
      if (reason === 'escapeKeyDown') {
        dataAnalysis.track('Jup_Web/DT_general_kbShortcuts', {
          shortcut: 'escape',
        });
      }
      onCancel(event);
    }
  };
  return onClose;
}

export { withEscTracking };
