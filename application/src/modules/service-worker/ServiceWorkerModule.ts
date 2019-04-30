import { AbstractModule, inject } from 'framework';
import registerServiceWorker from './registerServiceWorker';
import { Upgrade } from './upgrade';

class ServiceWorkerModule extends AbstractModule {
  @inject(Upgrade)
  private _upgradeHandler: Upgrade;

  async bootstrap() {
    registerServiceWorker(
      (swURL: string) => {
        this._upgradeHandler.setServiceWorkerURL(swURL);
      },
      (isCurrentPageInControl: boolean) => {
        this._upgradeHandler.onNewContentAvailable(isCurrentPageInControl);
      },
      (text: string) => {
        this._upgradeHandler.logInfo(text);
      },
    );
  }
}

export { ServiceWorkerModule };
