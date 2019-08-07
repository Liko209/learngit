/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-18 13:48:19
 * Copyright © RingCentral. All rights reserved.
 */
import PersonModel from '@/store/models/Person';
import GroupModel from '@/store/models/Group';

type MentionItemProps = {
  id: number;
  selectHandler: Function;
  index: number;
  currentIndex: number;
};

type MentionItemViewProps = MentionItemProps & {
  item: PersonModel & GroupModel;
  isTeam: boolean;
};

export { MentionItemProps, MentionItemViewProps };
