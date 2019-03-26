/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-05 18:30:30
 * Copyright © RingCentral. All rights reserved.
 */

type Props = {};

type ViewProps = {
  currentUserId: number;
  isUploadingFeedback: boolean;
  toggleAboutPage: (
    electronAppVersion?: string,
    electronVersion?: string,
  ) => void;
  handleSignOut: () => void;
};

export { Props, ViewProps };
