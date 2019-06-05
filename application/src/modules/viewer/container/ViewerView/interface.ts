/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-06-04 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */
import { ReactNode } from 'react';

type UpdateParamsType = {
  scale?: number;
  pageIdx?: number;
};
interface IViewerView {
  pages?: {
    cmp: ReactNode;
    viewport?: {
      origHeight: number;
      origWidth: number;
    };
  }[];
  title?: ReactNode;
  info?: ReactNode;
  actions?: ReactNode;

  viewerDestroyer: Function;
  currentPageIdx: number;
  currentScale: number;
  onUpdate: (opts: UpdateParamsType) => void;
}

export { IViewerView, UpdateParamsType };
