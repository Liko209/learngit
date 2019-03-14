/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-02-26 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { ViewerViewModelProps } from '../types';
import FileItemModel from '@/store/models/FileItem';
import PersonModel from '@/store/models/Person';

type ViewerTitleProps = { itemId: number };

type ViewerTitleViewModelProps = ViewerViewModelProps;

type ViewerTitleViewProps = ViewerViewModelProps & {
  item: FileItemModel;
  person: PersonModel;
};

export { ViewerTitleProps, ViewerTitleViewProps, ViewerTitleViewModelProps };
