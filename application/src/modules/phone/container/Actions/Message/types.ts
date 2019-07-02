/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-26 13:18:18
 * Copyright © RingCentral. All rights reserved.
 */
import PersonModel from '@/store/models/Person';

import { ENTITY_TYPE } from '../../constants';

type MessageProps = {
  id: number;
  person: PersonModel | null;
  entity: ENTITY_TYPE;
};

type MessageViewProps = {
  entity: ENTITY_TYPE;
  hookAfterClick?: () => void;
  goToConversation: () => void;
};

export { MessageProps, MessageViewProps, ENTITY_TYPE };
