/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-07-15 06:29:46
 * Copyright © RingCentral. All rights reserved.
 */
import { PRESENCE } from 'sdk/module/presence/constant';

type PresenceMenuViewProps = {
  title: string;
  presence: PRESENCE;
};

type PresenceMenuProps = PresenceMenuViewProps & {};

export { PresenceMenuProps, PresenceMenuViewProps };
