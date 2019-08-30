/*
 * @Author: Steven Zhuang (steven.zhuang@ringcentral.com)
 * @Date: 2019-01-15 13:12:02
 * Copyright © RingCentral. All rights reserved.
 */
import { PromisedComputedValue } from 'computed-async-mobx';
import ConferenceItemModel from '@/store/models/ConferenceItem';

type Props = {
  ids: number[];
};

type ViewProps = {
  conference: ConferenceItemModel;
  isHostByMe: boolean;
  globalNumber: string;
  phoneNumber: string;
  canUseConference: PromisedComputedValue<boolean>;
  joinAudioConference: () => void;
  disabled: boolean;
};

export { Props, ViewProps };
