/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-08 15:53:22
 * Copyright © RingCentral. All rights reserved.
 */

type NoteProps = {
  ids: number[]; // item ids
};

type NoteViewProps = {
  title: string;
  summary: string;
  getShowDialogPermission: () => Promise<boolean>;
  getBodyInfo: () => Promise<string | false>;
};

export { NoteProps, NoteViewProps };
