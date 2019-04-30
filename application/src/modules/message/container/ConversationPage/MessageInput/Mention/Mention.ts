/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:07:02
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { MentionView } from './Mention.View';
import { MentionViewModel } from './Mention.ViewModel';
import { MentionProps } from './types';

const Mention = buildContainer<MentionProps>({
  View: MentionView,
  ViewModel: MentionViewModel,
});

export { Mention };
