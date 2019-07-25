import { IMediaService, MediaOptions } from '@/interface/media';
import { ISoundNotification, Sounds } from '../interface';
import { RingsList, SoundsList } from 'sdk/module/profile';
import { mainLogger } from 'sdk';

export class SoundNotification implements ISoundNotification {
  @IMediaService private _mediaService: IMediaService;
  private _library: Map<string, string> = new Map();
  constructor() {
    [...SoundsList, ...RingsList].forEach(item => {
      this._library.set(item.id, item.url);
    });
  }
  create(name: Sounds, opts: Exclude<MediaOptions, 'src'>) {
    const src = this._library.get(name);
    if (src) {
      return this._mediaService.createMedia({ src, ...opts });
    }
    mainLogger.warn('Failed to find the sound source', name);
    return;
  }
}
