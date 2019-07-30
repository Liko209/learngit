/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-07-23 01:48:27
 * Copyright © RingCentral. All rights reserved.
 */

type DndBannerProps = {};

type DndBannerViewProps = {
  isShow: boolean;
  handleClose: () => void;
  handleUnblock: () => void;
};

export { DndBannerProps, DndBannerViewProps };
