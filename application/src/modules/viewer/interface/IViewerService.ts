/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-06-04 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */

type ViewerProps = {
  itemId: number;
  groupId: number;
};
interface IViewerService {
  open: (props: ViewerProps) => void;
}

export { IViewerService, ViewerProps };
