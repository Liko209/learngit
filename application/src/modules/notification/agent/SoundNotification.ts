import { IMediaService } from '@/interface/media';
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
  create(name: Sounds, trackId: string) {
    const src = this._library.get(name);
    if (src) {
      return this._mediaService.createMedia({ src, trackId });
    }
    mainLogger.warn('Failed to find the sound source', name);
    return;
  }
}
