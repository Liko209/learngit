import { Dialog } from '@/containers/Dialog';
import portalManager from '@/common/PortalManager';
import i18nT from '@/utils/i18nT';
import { RCInfoService } from 'sdk/module/rcInfo';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { ServiceConfig } from 'sdk/module/serviceLoader';
import { ERCWebUris } from 'sdk//module/rcInfo/types';
import { container } from 'framework';
import { CLIENT_SERVICE } from '@/modules/common/interface';
import { ClientService } from '@/modules/common';
import { Notification } from '@/containers/Notification';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
async function showRCDownloadDialog() {
  portalManager.dismissAll();
  const { startLoading, stopLoading } = Dialog.confirm({
    title: await i18nT('telephony.prompt.RCPhoneIsNotInstalledTitle'),
    content: await i18nT('telephony.prompt.RCPhoneIsNotInstalledBody'),
    okText: await i18nT('telephony.prompt.RCPhoneIsNotInstalledOK'),
    onOK: async () => {
      startLoading();
      const service: RCInfoService = ServiceLoader.getInstance(
        ServiceConfig.RC_INFO_SERVICE,
      );
      try {
        const downloadUrl = await service.generateWebSettingUri(
          ERCWebUris.RC_APP_DOWNLOAD_URL,
        );
        const clientService: ClientService = container.get(CLIENT_SERVICE);
        clientService.open(downloadUrl);
      } catch {
        Notification.flashToast({
          message: await i18nT('telephony.prompt.RCPhoneGetDownloadError'),
          type: ToastType.ERROR,
          messageAlign: ToastMessageAlign.LEFT,
          fullWidth: false,
          dismissible: false,
        });
      } finally {
        stopLoading();
      }
    },
  });
}
export { showRCDownloadDialog };
