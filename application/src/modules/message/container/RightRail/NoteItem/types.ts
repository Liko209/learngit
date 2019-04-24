/*
 * @Author: isaac.liu
 * @Date: 2019-01-14 13:42:15
 * Copyright © RingCentral. All rights reserved.
 */

import NoteItemModel from '@/store/models/NoteItem';

type NoteProps = {
  id: number;
};

type NoteItemProps = {
  note: NoteItemModel;
  title: string;
  subTitle: string;
  disabled?: boolean;
};

export { NoteItemProps, NoteProps };
