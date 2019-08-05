import { jupiter } from 'framework/src';
import { IMediaService, IMedia } from '@/interface/media';
import SettingModel from '@/store/models/UserSetting';
import { getEntity } from '@/store/utils';
import { UserSettingEntity } from 'sdk/module/setting';
import { AUDIO_SOUNDS_INFO, RINGS_TYPE } from 'sdk/module/profile';
import { ENTITY_NAME } from '@/store';
import { PHONE_SETTING_ITEM } from '../TelephonySettingManager/constant';
import { reaction } from 'mobx';
import { Disposer } from 'mobx-react';

class RingtonePrefetcher {
  disposer: Disposer;
  media: IMedia;
  init() {
    this.subscribeSettingChange();
  }
  prefetch(src: string) {
    const mediaService: IMediaService = jupiter.get(IMediaService);
    this.media = mediaService.createMedia({
      src,
      muted: true,
      autoplay: true,
      trackId: 'trailer',
    });
    this.media.on('loadeddata', () => {
      this.media.dispose();
    });
  }
  subscribeSettingChange() {
    this.disposer = reaction(
      () => {
        const { value } = getEntity<
          UserSettingEntity,
          SettingModel<AUDIO_SOUNDS_INFO>
        >(ENTITY_NAME.USER_SETTING, PHONE_SETTING_ITEM.SOUND_INCOMING_CALL);
        if (value) {
          return value;
        }
        return {};
      },

      ({ id, url }: AUDIO_SOUNDS_INFO) => {
        if (id && RINGS_TYPE.Off !== id) {
          this.prefetch(url);
        }
      },
      { fireImmediately: true },
    );
  }
  dispose() {
    this.disposer();
  }
}
export { RingtonePrefetcher };
