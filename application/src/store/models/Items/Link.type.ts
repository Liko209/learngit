/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-08 09:21:07
 * Copyright © RingCentral. All rights reserved.
 */
import ItemModel from '../Item';

type LinkItem = {
  summary: string;
  title: string;
  url: string;
  image: string;
  deactivated: boolean;
  doNotRender: boolean;
} & ItemModel;

export { LinkItem };
