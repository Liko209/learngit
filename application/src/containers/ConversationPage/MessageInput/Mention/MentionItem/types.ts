/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-18 13:48:19
 * Copyright © RingCentral. All rights reserved.
 */
import PersonModel from '@/store/models/Person';

type MentionItemProps = {
  id: number;
  selectHandler: Function;
  index: number;
  currentIndex: number;
};

type MentionItemViewProps = {
  selectHandler: Function;
  index: number;
  currentIndex: number;
  person: PersonModel;
};

export { MentionItemProps, MentionItemViewProps };
