/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-02-26 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import FileItemModel from '@/store/models/FileItem';
import PersonModel from '@/store/models/Person';

type ViewerTitleProps = {
  itemId: number;
  currentItemId: number;
  groupId: number;
  currentIndex: number;
  total: number;
};

type ViewerTitleViewProps = ViewerTitleProps & {
  item: FileItemModel;
  sender: PersonModel | null;
  createdAt: number | null;
};

export { ViewerTitleProps, ViewerTitleViewProps };
