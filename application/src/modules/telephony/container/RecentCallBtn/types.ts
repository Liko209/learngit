/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-06-26 16:00:47
 * Copyright © RingCentral. All rights reserved.
 */

type Props = {};

type ViewProps = {
  shouldShowRecentCallOrBackBtn: boolean;
  shouldShowRecentCallBtn: boolean;
  jumpToRecentCall: () => void;
  backToDialer: () => void;
};

export { Props, ViewProps };
