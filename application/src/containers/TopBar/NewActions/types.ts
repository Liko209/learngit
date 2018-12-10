/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-05 18:29:47
 * Copyright © RingCentral. All rights reserved.
 */

type Props = {};

type ViewProps = {
  updateCreateTeamDialogState: () => void;
  updateNewMessageDialogState: () => void;
  isShowNewMessageDialog: boolean;
  isShowCreateTeamDialog: boolean;
};

export { Props, ViewProps };
