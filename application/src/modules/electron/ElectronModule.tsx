import { AbstractModule } from 'framework';
import storeManager from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';

class ElectronModule extends AbstractModule {
  async bootstrap() {
    if (
      window.jupiterElectron &&
      window.jupiterElectron.getElectronVersionInfo
    ) {
      const versionInfo = window.jupiterElectron.getElectronVersionInfo();
      this.setElectronVersionInfo(
        versionInfo.electronAppVersion,
        versionInfo.electronVersion,
      );
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
}

export { ElectronModule };
