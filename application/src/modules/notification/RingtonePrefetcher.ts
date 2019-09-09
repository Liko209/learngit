import { jupiter } from 'framework/Jupiter';
import { IMediaService, IMedia } from '@/interface/media';
import SettingModel from '@/store/models/UserSetting';
import { getEntity } from '@/store/utils';
import { UserSettingEntity } from 'sdk/module/setting';
import { AUDIO_SOUNDS_INFO, RINGS_TYPE } from 'sdk/module/profile';
import { ENTITY_NAME } from '@/store';
import { reaction } from 'mobx';
import { Disposer } from 'mobx-react';

class RingtonePrefetcher {
  disposer: Disposer;
  media?: IMedia;
  constructor(private trackId: string, private settingId: number) {
    this.subscribeSettingChange();
  }
  prefetch(src: string) {
    if (this.media && this.media.playing) {
      this.media.on('pause', () => {
        this.createMedia(src);
      });
    } else {
      this.createMedia(src);
    }
    if (this.media) {
      this.media.on('loadeddata', () => {
        this.media && this.media.stop();
      });
    }
  }
  createMedia(src: string) {
    const mediaService: IMediaService = jupiter.get(IMediaService);
    this.media = mediaService.createMedia({
      src,
      trackId: this.trackId,
      muted: true,
      autoplay: true,
      outputDevices: null,
    });
  }
  subscribeSettingChange() {
    this.disposer = reaction(
      () => {
        const { value } = getEntity<
          UserSettingEntity,
          SettingModel<AUDIO_SOUNDS_INFO>
        >(ENTITY_NAME.USER_SETTING, this.settingId);
        if (value) {
          return value;
        }
        return {};
      },

      ({ id, url }: AUDIO_SOUNDS_INFO) => {
        if (id && RINGS_TYPE.Off !== id) {
          this.prefetch(url);
        } else {
          this.media && this.media.dispose();
          this.media = undefined;
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
