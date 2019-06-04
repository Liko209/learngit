/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-06-03 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';

type ViewerContextType = {
  show: boolean;
  closeViewer?: () => {};
  onTransitionExited?: () => {};
  onTransitionEntered?: () => {};
  isAnimating: boolean;
};
export default React.createContext<ViewerContextType>({
  show: true,
  isAnimating: false,
});
