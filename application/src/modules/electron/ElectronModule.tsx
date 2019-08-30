import { AbstractModule } from 'framework/AbstractModule';
import storeManager from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import { ElectronZipItemProvider } from './ElectronZipItemProvider';
import { LogControlManager } from 'sdk/module/log';
import { logManager } from 'foundation/log';
import notificationCenter from 'sdk/service/notificationCenter';
import { ENTITY } from 'sdk/service/eventKey';
import { PermissionService } from 'sdk/module/permission';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

class ElectronModule extends AbstractModule {
  async bootstrap() {
    if (
      window.jupiterElectron &&
      window.jupiterElectron.getElectronVersionInfo
    ) {
      if (window.jupiterElectron.getElectronVersionInfo) {
        const versionInfo = window.jupiterElectron.getElectronVersionInfo();
        this.setElectronVersionInfo(
          versionInfo.electronAppVersion,
          versionInfo.electronVersion,
        );
      }
      LogControlManager.instance().registerZipProvider(
        new ElectronZipItemProvider(),
      );
      window.jupiterElectron.setLogger &&
        window.jupiterElectron.setLogger(logManager.getLogger('electron'));

      window.jupiterElectron.setPermission &&
        notificationCenter.on(ENTITY.USER_PERMISSION, () => {
          this.updatePermission();
        });
    }
  }

  setElectronVersionInfo(
    electronAppVersion?: string,
    electronVersion?: string,
  ) {
    const globalStore = storeManager.getGlobalStore();
    globalStore.set(GLOBAL_KEYS.ELECTRON_APP_VERSION, electronAppVersion || '');
    globalStore.set(GLOBAL_KEYS.ELECTRON_VERSION, electronVersion || '');
  }

  async updatePermission() {
    const permissionService = ServiceLoader.getInstance<PermissionService>(
      ServiceConfig.PERMISSION_SERVICE,
    );
    const userPermission = await permissionService.getUserPermission();
    window.jupiterElectron.setPermission &&
      window.jupiterElectron.setPermission(userPermission.permissions);
  }
}

export { ElectronModule };
