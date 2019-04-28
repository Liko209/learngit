/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-09 14:08:18
 * Copyright © RingCentral. All rights reserved.
 */
import { CONVERSATION_TYPES } from '@/constants';

type MentionProps = {
  id: number;
  pid?: number;
  isEditMode?: boolean;
};

type MentionViewProps = {
  ids: number[];
  open: boolean;
  currentIndex: number;
  searchTerm?: string;
  groupType: CONVERSATION_TYPES;
  selectHandler: Function;
  isEditMode?: boolean;
  isOneToOneGroup: boolean;
  initIndex: number;
};

export { MentionProps, MentionViewProps };
