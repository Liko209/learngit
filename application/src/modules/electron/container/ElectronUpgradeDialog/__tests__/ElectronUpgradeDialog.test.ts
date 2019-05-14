/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-05-06 17:14:39
 * Copyright © RingCentral. All rights reserved.
 */
import { showUpgradeDialog } from '../ElectronUpgradeDialog';
import portalManager from '@/common/PortalManager';
import { ElectronUpgradeDialogComponent } from '../ElectronUpgradeDialog.View';
describe('ElectronUpgradeDialogViewModel', () => {
  it('should not show dialog when already have one not closed', () => {
    jest
      .spyOn(ElectronUpgradeDialogComponent, 'getPortalRef')
      .mockReturnValue({});
    jest.spyOn(portalManager, 'wrapper').mockReturnValue({ show: jest.fn() });
    showUpgradeDialog({ downloadUrl: '' });
    expect(portalManager.wrapper).not.toHaveBeenCalled();
  });

  it('should show dialog', () => {
    jest
      .spyOn(ElectronUpgradeDialogComponent, 'getPortalRef')
      .mockReturnValue(null);

    const ref = { show: jest.fn() };
    jest.spyOn(portalManager, 'wrapper').mockReturnValue(ref);
    showUpgradeDialog({ downloadUrl: '' });
    expect(portalManager.wrapper).toHaveBeenCalled();
    expect(ref.show).toHaveBeenCalled();
  });
});
