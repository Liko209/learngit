/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-07-01 15:00:00
 * Copyright © RingCentral. All rights reserved.
 */

import { jupiter, container } from 'framework';
import { IMediaService, MediaEventName } from '@/interface/media';
import { MediaService } from '@/modules/media/service';
import { AudioPlayerButtonViewModel } from '../AudioPlayerButton.ViewModel';
import { Media } from '@/modules/media/Media';
import { JuiAudioStatus } from 'jui/components/AudioPlayer';

jupiter.registerService(IMediaService, MediaService);

const setup = (opts?: any) => {
  const mediaService: IMediaService = jupiter.get(IMediaService);
  const media = mediaService.createMedia({
    src: (opts && opts.src) || 'example.mp3',
  }) as Media;
  const vm = new AudioPlayerButtonViewModel({
    media,
    onPlay: opts && opts.onPlay,
    onPause: opts && opts.onPause,
    onEnded: opts && opts.onEnded,
    onError: opts && opts.onError,
  });
  return { mediaService, vm, media };
};

const emit = (media: Media, eventName: MediaEventName, returnValue?: any) => {
  const event = media.events.filter(event => {
    return event.name === eventName;
  })[0];
  event && event.handler && event.handler(returnValue);
};

describe('AudioPlayerButtonViewModel', () => {
  beforeEach(() => {
    jest.spyOn<HTMLMediaElement, any>(HTMLMediaElement.prototype, 'load');
    jest.spyOn<HTMLMediaElement, any>(HTMLMediaElement.prototype, 'play');
    jest.spyOn<HTMLMediaElement, any>(HTMLMediaElement.prototype, 'pause');
    container.snapshot();
  });
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    container.restore();
  });

  describe('actionHandler()', () => {
    describe('play', () => {
      it('should play media when status is play', () => {
        const playMockFn = jest.spyOn(HTMLMediaElement.prototype, 'play');
        const { vm, media } = setup();

        vm.playHandler();
        expect(playMockFn).toHaveBeenCalled();

        emit(media, 'play');
        expect(vm.mediaStatus).toEqual(JuiAudioStatus.PLAY);
        expect(vm.isPlaying).toBeTruthy();
      });
      it('should call onPlay when media played', () => {
        const onPlay = jest.fn();
        const { vm, media } = setup({
          onPlay,
        });

        vm.playHandler();
        emit(media, 'play');

        expect(onPlay).toHaveBeenCalled();
        expect(vm.mediaStatus).toEqual(JuiAudioStatus.PLAY);
        expect(vm.isPlaying).toBeTruthy();
      });
    });
  });

  describe('event', () => {
    it('should reset when media ended called', () => {
      const onEnded = jest.fn();
      const { vm, media } = setup({
        onEnded,
      });
      emit(media, 'ended');
      expect(onEnded).toHaveBeenCalled();
      expect(vm.isPlaying).toBeFalsy();
    });
    it('should call onError when media play error', () => {
      const onError = jest.fn();
      const { vm, media } = setup({
        onError,
      });
      emit(media, 'error');
      expect(onError).toHaveBeenCalled();
      expect(vm.isPlaying).toBeFalsy();
    });
    it('should call onPause when media pause', () => {
      const onPause = jest.fn();
      const { vm, media } = setup({
        onPause,
      });
      emit(media, 'pause');
      expect(onPause).toHaveBeenCalled();
      expect(vm.isPlaying).toBeFalsy();
    });
  });
});
