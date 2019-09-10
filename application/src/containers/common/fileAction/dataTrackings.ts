/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-08-28 13:06:39
 * Copyright © RingCentral. All rights reserved.
 */

import { dataAnalysis } from 'foundation/analysis';
import { getFileExtension } from '@/common/getFileIcon';

type Scene = 'rightShelf' | 'conversationHistory' | 'fullScreenViewer';

function trackViewInBrowserAction(scene: Scene, name: string) {
  const extension = getFileExtension(name);
  dataAnalysis.track(`Jup_Web/DT_msg_${scene}_actionsOnFile`, {
    extension,
    action: 'viewInBrowser',
    type: 'image',
  });
}

export { Scene, trackViewInBrowserAction };
