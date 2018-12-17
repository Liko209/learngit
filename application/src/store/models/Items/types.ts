/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-08 10:09:31
 * Copyright © RingCentral. All rights reserved.
 */
import ItemModel from '../Item';

type LinkItem = {
  favicon: string;
  providerName: string;
  summary: string;
  title: string;
  url: string;
  image: string;
  deactivated: boolean;
  doNotRender: boolean;
} & ItemModel;

type NoteItem = {
  title: string;
  summary: string;
} & ItemModel;

export { LinkItem, NoteItem };
