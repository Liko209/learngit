/*
 * @Author:Andy Hu (andy.hu@ringcentral.com)
 * @Date: 2019-04-01 14:33:10
 * Copyright Â© RingCentral. All rights reserved.
 */
import { DeskTopNotification } from '../agent/DesktopNotification';
import {
  INotificationService,
  NotificationOpts,
  INotificationPermission,
  ISoundNotification,
  NotificationStrategy,
} from '../interface';
import { AbstractNotification } from '../agent/AbstractNotification';
import { SWNotification } from '../agent/SWNotification';
import { isFirefox, isElectron } from '@/common/isUserAgent';
import { Pal } from 'sdk/pal';
import { mainLogger } from 'foundation/log';
import { DesktopNotificationsSettingModel as DNSM } from 'sdk/module/profile';
import { SETTING_ITEM__NOTIFICATION_BROWSER } from '../notificationSettingManager/constant';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { SettingService } from 'sdk/module/setting/service/SettingService';
import { isCurrentUserDND } from '../utils';
import { IMediaService } from '@/interface/media';

const logger = mainLogger.tags('AbstractNotificationManager');

class NotificationService implements INotificationService {
  @INotificationPermission
  private _permission: INotificationPermission;
  @ISoundNotification
  private _soundNotification: ISoundNotification;
  @IMediaService
  private _mediaService: IMediaService;
  private _uiNotificationDistributors: Map<string, AbstractNotification<any>>;
  private _uiNotificationDistributor: AbstractNotification<any>;
  private _maximumFirefoxTxtLength = 40;
  private _maximumTxtLength = 700;
  constructor() {
    this._uiNotificationDistributors = new Map();
    this._uiNotificationDistributors.set('sw', new SWNotification());
    this._uiNotificationDistributors.set('desktop', new DeskTopNotification());
  }

  async shouldShowUINotification() {
    if (document.hasFocus() || isCurrentUserDND()) {
      return false;
    }
    if (!this._permission.isGranted) {
      return false;
    }
    const entity = await ServiceLoader.getInstance<SettingService>(
      ServiceConfig.SETTING_SERVICE,
    ).getById<DNSM>(SETTING_ITEM__NOTIFICATION_BROWSER);
    return (
      isElectron || (entity && entity.value && entity.value.wantNotifications)
    );
  }

  init() {
    Pal.instance.setNotificationPermission(this._permission);
    for (const _distributor of this._uiNotificationDistributors.values()) {
      const distributor = _distributor as AbstractNotification<any>;
      if (distributor.isSupported()) {
        this._uiNotificationDistributor = distributor;
        break;
      }
    }
  }

  addEllipsis(str: string = '', border: number) {
    return str && str.length > border ? `${str.substr(0, border)}...` : str;
  }

  async show(title: string, opts: NotificationOpts, force?: boolean) {
    const { strategy } = opts;
    delete opts.strategy;
    const {
      SOUND_AND_UI_NOTIFICATION,
      SOUND_ONLY,
      UI_NOTIFICATION_ONLY,
    } = NotificationStrategy;
    switch (strategy) {
      case SOUND_AND_UI_NOTIFICATION: {
        if (await this.shouldShowUINotification()) {
          this.buildSoundNotification(opts);
          this.buildUINotification(title, opts, force);
        }
        break;
      }
      case SOUND_ONLY: {
        this.buildSoundNotification(opts);
        break;
      }
      case UI_NOTIFICATION_ONLY: {
        this.buildUINotification(title, opts, force);
        break;
      }
      default: {
        await this.buildSoundNotification(opts);
        this.buildUINotification(title, opts, force);
      }
    }
  }

  async buildUINotification(
    title: string,
    opts: NotificationOpts,
    force?: boolean,
  ) {
    const shouldShowNotification = await this.shouldShowUINotification();
    if (!shouldShowNotification && !force) {
      return;
    }
    const { id, scope } = opts.data;
    const tag = `${scope}.${id}`;
    const customOps = { silent: true, ...opts, tag };
    logger.info(`prepare notification for ${tag}`);
    let titleFormatted = title;

    if (isFirefox) {
      customOps.body = this.addEllipsis(
        customOps.body,
        this._maximumFirefoxTxtLength,
      );
      titleFormatted = this.addEllipsis(title, this._maximumFirefoxTxtLength);
    }
    customOps.body = this.addEllipsis(customOps.body, this._maximumTxtLength);
    titleFormatted = this.addEllipsis(title, this._maximumTxtLength);
    this._uiNotificationDistributor.create(titleFormatted, customOps);
  }

  async buildSoundNotification(opts: NotificationOpts) {
    const scope = opts.data.scope;
    const source = opts.sound;
    if (!source) {
      logger.log('not necessary to play sound');
      return;
    }
    const mediaTrackId = this._mediaService.createTrack(scope, 400);
    this._soundNotification.create(source, {
      trackId: mediaTrackId,
      autoplay: true,
    });
    delete opts.sound;

    return;
  }

  close(scope: string, id: number) {
    this._uiNotificationDistributor.close(scope, id);
  }

  clear = () => {
    // todo clear scope
    this._uiNotificationDistributor.clear();
  };
}

export { NotificationService };
