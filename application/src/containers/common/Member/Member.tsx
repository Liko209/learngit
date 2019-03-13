/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-03-11 16:25:35,
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import View from './Member.View';
import ViewModel from './Member.ViewModel';
import { MemberProps } from './types';

export default buildContainer<MemberProps>({ View, ViewModel });
