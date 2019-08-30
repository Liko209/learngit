/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-06-04 09:12:51
 * Copyright © RingCentral. All rights reserved.
 * */

type UpdateParamsType = {
  scale?: number;
  pageIdx?: number;
};

type TitleType = {
  uid?: number;
  userDisplayName: string;
  name: string;
  downloadUrl: any;
  createdAt: string;
  textFieldValue?: number;
  currentPageIdx: number;
  pageTotal: number;
  fileId: number;
  groupId: number;
  handleTextFieldChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};
interface IViewerView {
  pages?: {
    url?: string;
    viewport?: {
      origHeight: number;
      origWidth: number;
    };
  }[];
  title?: any;
  viewerDestroyer: Function;
  currentPageIdx: number;
  currentScale: number;
  onUpdate: (opts: UpdateParamsType) => void;
  onContentLoad?: () => void;
  onContentError?: () => void;
  dispose?: () => void;
}

export { IViewerView, UpdateParamsType, TitleType };
