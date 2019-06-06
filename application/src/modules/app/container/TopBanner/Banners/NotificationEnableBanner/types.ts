/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-05-28 10:30:59
 * Copyright © RingCentral. All rights reserved.
 */

import { WithTranslation } from 'react-i18next';

type NotificationEnableBannerProps = {};

type NotificationEnableBannerViewProps = WithTranslation &
  NotificationEnableBannerProps & {
    isShow: boolean;
    isBlocked: boolean;
    handleClose: () => void;
  };

export { NotificationEnableBannerProps, NotificationEnableBannerViewProps };
