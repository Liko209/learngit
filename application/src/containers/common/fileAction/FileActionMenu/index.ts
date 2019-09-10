/*
 * @Author: wayne.zhou
 * @Date: 2019-05-27 17:47:52
 * Copyright © RingCentral. All rights reserved.
 */
import { FileActionMenuView, FileActionMenuProps } from './FileActionMenu';
import { buildContainer } from '@/base';
import { FileActionViewModel } from '../common/FIleAction.ViewModel';

const FileActionMenu = buildContainer<FileActionMenuProps>({
  View: FileActionMenuView,
  ViewModel: FileActionViewModel,
});

export { FileActionMenu };
