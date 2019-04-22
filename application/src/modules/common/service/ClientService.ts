/*
 * @Author: Andy Hu(andy.hu@ringcentral.com)
 * @Date: 2019-03-04 16:12:23
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
import { container } from 'framework';
import { ElectronService } from '@/modules/electron';
import { IClientService } from '../interface';

class ClientService implements IClientService {
  focus() {
    if (window.jupiterElectron) {
      const electronService = container.get(ElectronService);
      electronService.bringAppToFront();
    }
    window.focus();
  }
}
export { ClientService };
