/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-06-03 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';

export type ViewerContextType = {
  show: boolean;
  closeViewer?: () => void;
  onTransitionExited?: () => void;
  onTransitionEntered?: () => void;
  onContentLoad?: () => void;
  onContentError?: () => void;
  isAnimating: boolean;
  setDeleteItem: (value: boolean) => void;
  deleteItem?: boolean;
  setLoading: (value: boolean) => void;
};
export default React.createContext<ViewerContextType>({
  show: true,
  isAnimating: false,
  setDeleteItem: () => {},
  setLoading: () => {},
});
