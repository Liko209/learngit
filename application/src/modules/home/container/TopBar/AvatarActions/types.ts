/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-05 18:30:30
 * Copyright © RingCentral. All rights reserved.
 */

type Props = {};

type ViewProps = {
  currentUserId: number;
  toggleAboutPage: (appVersion?: string, electronVersion?: string) => void;
  handleSignOut: () => void;
};

export { Props, ViewProps };
