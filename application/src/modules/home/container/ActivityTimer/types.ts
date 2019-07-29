/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-07-25 07:16:52
 * Copyright © RingCentral. All rights reserved.
 */
import { PRESENCE } from 'sdk/module/presence/constant';

type ActivityTimerProps = {};

type ActivityTimerViewProps = {
  setOffline: () => void;
  setOnline: () => void;
  presence: PRESENCE;
};

export { ActivityTimerProps, ActivityTimerViewProps };
