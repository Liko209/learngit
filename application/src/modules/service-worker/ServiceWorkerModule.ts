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
      () => {
        this._upgradeHandler.onNewContentAvailable();
      },
    );
  }
}

export { ServiceWorkerModule };
