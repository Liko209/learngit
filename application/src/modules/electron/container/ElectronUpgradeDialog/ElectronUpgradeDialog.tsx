/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-04-29 14:04:00
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import {
  ElectronUpgradeDialogView,
  ElectronUpgradeDialogComponent,
} from './ElectronUpgradeDialog.View';
import { ElectronUpgradeDialogViewModel } from './ElectronUpgradeDialog.ViewModel';
import { ElectronUpgradeDialogProps } from './types';
import portalManager from '@/common/PortalManager';

const ElectronUpgradeDialog = buildContainer<ElectronUpgradeDialogProps>({
  View: ElectronUpgradeDialogView,
  ViewModel: ElectronUpgradeDialogViewModel,
});

const showUpgradeDialog = () => {
  const ref = portalManager.wrapper(ElectronUpgradeDialogView).show();
  ElectronUpgradeDialogComponent.setPortalRef(ref);
};

export { ElectronUpgradeDialog, showUpgradeDialog };
