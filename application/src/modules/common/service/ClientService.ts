/*
 * @Author: Andy Hu(andy.hu@ringcentral.com)
 * @Date: 2019-03-04 16:12:23
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
import { container } from 'framework';
import { ElectronService } from '@/modules/electron';
import { IClientService, InvokeAppOpts } from '../interface';

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
  invokeApp(urlScheme: string, options: InvokeAppOpts) {
    let appPortal = document.getElementById(
      'app-portal',
    ) as HTMLIFrameElement | null;
    if (!appPortal) {
      appPortal = document.createElement('iframe');
      Object.assign(appPortal, {
        id: 'app-portal',
        height: '0',
        width: '0',
        tabIndex: -1,
      });
      appPortal.style.display = 'none';
      const body = document.body;
      body.appendChild(appPortal);
      appPortal.setAttribute('src', urlScheme);
    }
    appPortal.setAttribute('src', urlScheme);
    if (!window.jupiterElectron) {
      return;
    }
    const isBound = false && this._electronService.isURLSchemeBound(urlScheme);
    if (!isBound) {
      options.fallback();
    }
  }
}
export { ClientService };
