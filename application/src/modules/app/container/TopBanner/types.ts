/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-04-30 15:30:56
 * Copyright © RingCentral. All rights reserved.
 */
type BannerType = React.ComponentType;
type TopBannerConfig = {
  Component: BannerType;
  priority: number;
  props: object;
  isShow: boolean;
};

type TopBannerViewProps = {
  data: TopBannerConfig[];
};

export { TopBannerConfig, TopBannerViewProps, BannerType };
