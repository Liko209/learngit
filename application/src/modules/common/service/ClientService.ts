/*
 * @Author: Andy Hu(andy.hu@ringcentral.com)
 * @Date: 2019-03-04 16:12:23
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
import { container } from 'framework';
import { ElectronService } from '@/modules/electron';
import { IClientService } from '../interface';

class ClientService implements IClientService {
  private get _electronService() {
    return container.get(ElectronService);
  }
  focus() {
    if (window.jupiterElectron) {
      this._electronService.bringAppToFront();
    }
    window.focus();
  }
  invokeApp(urlScheme: string) {
    window.location.href = urlScheme;
  }
}
export { ClientService };
