/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-04-29 17:24:09
 * Copyright © RingCentral. All rights reserved.
 */
import { WithTranslation } from 'react-i18next';

enum UpgradeType {
  FORCE = 'force',
  SOFT = 'soft',
}

type ElectronUpgradeDialogProps = {
  type: UpgradeType;
};

type ElectronUpgradeDialogViewProps = WithTranslation &
  ElectronUpgradeDialogProps;

type UpgradeUserAction = {
  skip?: boolean;
  snooze?: boolean;
};

type Ref = {
  dismiss: (afterDismiss?: (() => void) | undefined) => void;
};

export {
  Ref,
  UpgradeType,
  ElectronUpgradeDialogProps,
  ElectronUpgradeDialogViewProps,
  UpgradeUserAction,
};
