/*
 * @Author: ken.li
 * @Date: 2019-06-02 16:49:33
 * Copyright © RingCentral. All rights reserved.
 */
import { CONVERSATION_TYPES } from '@/constants';

type ColonEmojiProps = {
  id: number;
  pid?: number;
  isEditMode?: boolean;
};

type ColonEmojiViewProps = {
  ids: number[];
  open: boolean;
  currentIndex: number;
  searchTerm?: string;
  groupType: CONVERSATION_TYPES;
  selectHandler: Function;
  isEditMode?: boolean;
  isOneToOneGroup: boolean;
  initIndex: number;
  members?: any;
};

export { ColonEmojiProps, ColonEmojiViewProps };
