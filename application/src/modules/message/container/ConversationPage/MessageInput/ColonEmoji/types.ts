/*
 * @Author: ken.li
 * @Date: 2019-06-02 16:49:33
 * Copyright © RingCentral. All rights reserved.
 */

type ColonEmojiProps = {
  id: number;
  pid?: number;
  isEditMode?: boolean;
};

type ColonEmojiViewProps = {
  ids: string[];
  open: boolean;
  currentIndex: number;
  searchTerm?: string;
  selectHandler: Function;
  isEditMode?: boolean;
  members?: any;
};

type MemberData = {
  displayName: string;
  id?: string;
  displayId: string;
};

export { ColonEmojiProps, ColonEmojiViewProps, MemberData };
