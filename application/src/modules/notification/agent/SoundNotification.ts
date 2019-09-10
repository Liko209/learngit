import { IMediaService, MediaOptions, IMedia } from '@/interface/media';
import { ISoundNotification, Sounds } from '../interface';
import {
  RingsList,
  SoundsList,
  SOUNDS_TYPE,
  RINGS_TYPE,
} from 'sdk/module/profile';
import { mainLogger } from 'foundation/log';
import { getEntity } from '@/store/utils';
import { UserSettingEntity } from 'sdk/module/setting';
import SettingModel from '@/store/models/UserSetting';
import { ENTITY_NAME } from '@/store';
import { SETTING_ITEM__SPEAKER_SOURCE } from '@/modules/setting/constant';
import { reaction } from 'mobx';
import { Disposer } from 'mobx-react';

export class SoundNotification implements ISoundNotification {
  @IMediaService private _mediaService: IMediaService;
  private _library: Map<string, string> = new Map();
  private _mediaPool: Map<string, IMedia> = new Map();
  private _disposers: Disposer[] = [];
  constructor() {
    [...SoundsList, ...RingsList].forEach(item => {
      if (![SOUNDS_TYPE.Off, RINGS_TYPE.Off].includes(item.id))
        this._library.set(item.id, item.url);
    });
    this.destroyMedia();
  }
  destroyMedia() {
    const disposer = reaction(
      () =>
        getEntity<UserSettingEntity, SettingModel>(
          ENTITY_NAME.USER_SETTING,
          SETTING_ITEM__SPEAKER_SOURCE,
        ).source,
      () => {
        this._mediaPool.forEach(media => {
          media.stop();
          media.dispose();
        });
      },
    );
    this._disposers.push(disposer);
  }

  create(name: Sounds, opts: Exclude<MediaOptions, 'src'>) {
    const src = this._library.get(name);
    const trackId = opts.trackId;
    if (src) {
      const tag = src + trackId;
      mainLogger.tags('SoundNotification').log('create Sound for',  src);
      if (this._mediaPool.has(tag)) {
        const media = this._mediaPool.get(tag) as IMedia;
        const {
          autoplay,
          loop = false,
          muted = false,
          outputDevices = null,
        } = opts;
        media.setLoop(loop);
        media.setMute(muted);
        media.setOutputDevices(outputDevices);
        if (autoplay) media.play();
        return media;
      }
      const media = this._mediaService.createMedia({ src, ...opts });
      this._mediaPool.set(tag, media);
      return media;
    }
    mainLogger
      .tags('SoundNotification')
      .warn('Failed to find the sound source', name);
    return;
  }
}
