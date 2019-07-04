/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-03-06 15:57:37
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';

type ViewerContextType = {
  show: boolean;
  closeViewer?: () => {};
  onTransitionExited?: () => {};
  onTransitionEntered?: () => {};
  isAnimating: boolean;
  setDeleteItem: (value: boolean) => void;
  deleteItem?: boolean;
};
export default React.createContext<ViewerContextType>({
  show: true,
  isAnimating: false,
  setDeleteItem: () => {},
});
