import { AbstractModule, inject } from 'framework';
import registerServiceWorker from './registerServiceWorker';
import { Upgrade } from './upgrade';

class ServiceWorkerModule extends AbstractModule {
  @inject(Upgrade)
  private _upgradeHandler: Upgrade;

  async bootstrap() {
    registerServiceWorker(
      (swURL: string, hasWaitingWorker: boolean) => {
        this._upgradeHandler.setServiceWorkerURL(swURL, hasWaitingWorker);
      },
      (isCurrentPageInControl: boolean, isByWaitingWorker: boolean) => {
        this._upgradeHandler.onNewContentAvailable(
          isCurrentPageInControl,
          isByWaitingWorker,
        );
      },
      () => {
        this._upgradeHandler.onControllerChanged();
      },
      (text: string) => {
        this._upgradeHandler.logInfo(text);
      },
    );
  }
}

export { ServiceWorkerModule };
