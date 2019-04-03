/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-12-08 21:00:44
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import {
  EditMessageInputView,
  EditMessageInputViewComponent,
} from './EditMessageInput.View';
import { EditMessageInputViewModel } from './EditMessageInput.ViewModel';
import { EditMessageInputProps } from './types';

const EditMessageInput = buildContainer<EditMessageInputProps>({
  View: EditMessageInputView,
  ViewModel: EditMessageInputViewModel,
});

export { EditMessageInput, EditMessageInputViewComponent };
