/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-08-21 14:17:07
 * Copyright © RingCentral. All rights reserved.
 */
import { PromisedComputedValue } from 'computed-async-mobx';

type AudioConferenceProps = {
  groupId?: number;
  variant?: 'text' | 'round' | 'plain';
  size?: 'small' | 'medium' | 'large';
  color?: string;
  onClick?: () => void;
  analysisSource?: string;
};

type AudioConferenceViewProps = {
  showIcon: PromisedComputedValue<boolean>;
};

export { AudioConferenceProps, AudioConferenceViewProps };
