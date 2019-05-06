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
import {
  ElectronUpgradeDialogProps,
  ElectronUpgradeDialogViewProps,
} from './types';
import portalManager from '@/common/PortalManager';

const ElectronUpgradeDialog = buildContainer<ElectronUpgradeDialogProps>({
  View: ElectronUpgradeDialogView,
  ViewModel: ElectronUpgradeDialogViewModel,
});

const showUpgradeDialog = (props: ElectronUpgradeDialogViewProps) => {
  const ref = portalManager.wrapper(ElectronUpgradeDialogView).show(props);
  ElectronUpgradeDialogComponent.setPortalRef(ref);
};

export { ElectronUpgradeDialog, showUpgradeDialog };
