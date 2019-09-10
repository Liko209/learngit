/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-07-01 15:00:00
 * Copyright © RingCentral. All rights reserved.
 */

import { container } from 'framework/ioc';
import { jupiter } from 'framework/Jupiter';
import { IMediaService, MediaEventName } from '@/interface/media';
import { MediaService } from '@/modules/media/service';
import { AudioPlayerViewModel } from '../AudioPlayer.ViewModel';
import { Media } from '@/modules/media/Media';
import { JuiAudioStatus } from 'jui/components/AudioPlayer';
import { mainLogger } from 'foundation/log';

jupiter.registerService(IMediaService, MediaService);

const setup = (opts?: any) => {
  const mediaService: IMediaService = jupiter.get(IMediaService);
  const vm = new AudioPlayerViewModel({
    id: opts && opts.id,
    trackId: opts && opts.trackId,
    src: (opts && opts.src) || 'example.mp3',
    startTime: opts && opts.startTime,
    duration: opts && opts.duration,
    onPlay: opts && opts.onPlay,
    onPaused: opts && opts.onPaused,
    onEnded: opts && opts.onEnded,
    onTimeUpdate: opts && opts.onTimeUpdate,
    onError: opts && opts.onError,
    onBeforePlay: opts && opts.onBeforePlay,
    onBeforePause: opts && opts.onBeforePause,
    onBeforeReload: opts && opts.onBeforeReload
  });
  const media = vm._createMedia() as Media;
  return { mediaService, vm, media };
};

const emit = (media: Media, eventName: MediaEventName, returnValue?: any) => {
  const event = media.events.filter(event => {
    return event.name === eventName;
  })[0];
  event && event.handler && event.handler(returnValue);
};

const sleep = function(time: number) {
  return new Promise((resolve: Function) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

describe('AudioPlayerViewModel', () => {
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

  describe('reaction()', () => {
    it('should update media when props media update', () => {
      const mediaService: IMediaService = jupiter.get(IMediaService);
      const media = mediaService.createMedia({
        src: 'example.mp3',
      });
      const vm = new AudioPlayerViewModel({});
      expect(vm._media).toEqual(null);
      expect(vm._currentSrc).toEqual('');

      vm._propMediaReaction(media);

      expect(vm._media).toEqual(media);
      expect(vm._currentSrc).toEqual('example.mp3');
    })
    it('should throw error when prop media is not instance Media', () => {
      const vm = new AudioPlayerViewModel({});
      expect(() => {
        vm._propMediaReaction('test');
      }).toThrowError();
    })
    it('should console warning if use prop media and trackId given', () => {
      const mediaService: IMediaService = jupiter.get(IMediaService);
      const media = mediaService.createMedia({
        src: 'example.mp3',
      });
      const vm = new AudioPlayerViewModel({
        trackId: 'trackId',
      });
      expect(vm._media).toEqual(null);
      expect(vm._currentSrc).toEqual('');

      const warnFn = jest.spyOn(mainLogger, 'warn').mockImplementation();

      vm._propMediaReaction(media);
      expect(warnFn).toBeCalled();
      expect(vm._media.trackId).not.toEqual('trackId');
      expect(vm._currentSrc).toEqual('example.mp3');
    })
    it('should get media when props id update', () => {
      const mediaService: IMediaService = jupiter.get(IMediaService);
      const media = mediaService.createMedia({
        id: 'propsID',
        src: 'example.mp3',
      });

      const vm = new AudioPlayerViewModel({});
      expect(vm._media).toEqual(null);
      
      vm._propIdReaction('propsID');
      expect(vm._media).toEqual(media);
    })
    it('should create media and dispose old media when src update', () => {
      const vm = new AudioPlayerViewModel({});

      jest.spyOn(vm, '_mediaOptions', 'get')
        .mockReturnValueOnce({
          src: 'example1.mp3',
        }).mockReturnValueOnce({
          src: 'example2.mp3'
        })
      
      expect(vm._media).toEqual(null);

      vm._propSrcReaction('example1.mp3');
      expect(vm._media.src).toEqual('example1.mp3');
      vm._propSrcReaction('example2.mp3');
      expect(vm._media.src).toEqual('example2.mp3');
    })
  })

  describe('createMedia()', () => {
    it('should create media by media service', () => {
      const { media } = setup();
      expect(media).toBeInstanceOf(Media);
      expect(media.events.length).toEqual(6);
    });
  });

  describe('getMedia()', () => {
    it('should get media by media service', () => {
      const mediaId = 'testMediaId1';
      const trackId = 'testTrackId';
      const { media, vm } = setup({
        trackId,
        id: mediaId
      });
      expect(media.id).toEqual(`[${trackId}]-[${mediaId}]`);

      const checkMedia = vm._getMedia(mediaId);
      expect(checkMedia.id).toEqual(media.id);
    });
    it('should not get media when media is not exist', () => {
      const mediaId = 'testMediaId2';
      const { vm } = setup();
      const checkMedia = vm._getMedia(mediaId);
      expect(checkMedia).toEqual(null);
    });
  });

  describe('dispose()', () => {
    it('should be pause if unmount component [JPT-2219]', () => {
      const { vm, media } = setup();
      expect(media).toBeInstanceOf(Media);
      expect(vm._media).toEqual(media);
      vm.dispose();
      expect(vm._media).toEqual(null);
      expect(vm.mediaStatus).toEqual(JuiAudioStatus.PLAY);
      expect(media.playing).toBeFalsy();
    });
  });

  describe('actionHandler()', () => {
    describe('play', () => {
      it('should play media when status is play', async () => {
        const playMockFn = jest.spyOn(HTMLMediaElement.prototype, 'play');
        const { vm, media } = setup();

        await vm.playHandler();
        await sleep(300);
        expect(vm.mediaStatus).toEqual(JuiAudioStatus.LOADING);
        expect(playMockFn).toHaveBeenCalled();

        emit(media, 'play');
        expect(vm.mediaStatus).toEqual(JuiAudioStatus.PAUSE);
      });
      it('should play media when onBeforePlay return true', async () => {
        const onBeforePlay = jest.fn().mockReturnValue(true);
        const { vm, media } = setup({
          onBeforePlay
        });

        await vm.playHandler();
        await sleep(300);
        expect(vm.mediaStatus).toEqual(JuiAudioStatus.LOADING);
        expect(onBeforePlay).toHaveBeenCalled();

        emit(media, 'play');
        expect(vm.mediaStatus).toEqual(JuiAudioStatus.PAUSE);
      });
      it('should not play media when onBeforePlay return false', async () => {
        const onBeforePlay = jest.fn().mockReturnValue(false);
        const { vm, media } = setup({
          onBeforePlay
        });

        await vm.playHandler();
        expect(vm.mediaStatus).toEqual(JuiAudioStatus.RELOAD);
        expect(onBeforePlay).toHaveBeenCalled();

        emit(media, 'error');
        expect(vm.mediaStatus).toEqual(JuiAudioStatus.RELOAD);
        expect(vm.currentTime).toEqual(0);
      });

      it('should play media start time when customer provide startTime', async () => {
        const playMockFn = jest.spyOn(HTMLMediaElement.prototype, 'play');
        const startTime = 100;
        const { vm, media } = setup({
          startTime
        });

        expect(vm.currentTime).toEqual(startTime);
        await vm.playHandler();
        await sleep(300);
        expect(vm.mediaStatus).toEqual(JuiAudioStatus.LOADING);
        expect(playMockFn).toHaveBeenCalled();

        emit(media, 'play');
        expect(vm.mediaStatus).toEqual(JuiAudioStatus.PAUSE);
      });
      it('should not show loading status when media canplay inline 250ms', async () => {
        const playMockFn = jest.spyOn(HTMLMediaElement.prototype, 'play');
        const { vm, media } = setup();

        await vm.playHandler();
        await sleep(100);
        expect(vm.mediaStatus).toEqual(JuiAudioStatus.PLAY);
        emit(media, 'play');
        expect(vm.mediaStatus).toEqual(JuiAudioStatus.PAUSE);
        expect(playMockFn).toHaveBeenCalled();
      })
    });

    describe('pause', () => {
      it('should pause media when status is pause', async () => {
        const { vm, media } = setup();
        await vm.pauseHandler();

        emit(media, 'pause');
        expect(vm.mediaStatus).toEqual(JuiAudioStatus.PLAY);
      });
      it('should call onPaused when media paused [JPT-2222]', async () => {
        const onPaused = jest.fn();
        const { vm, media } = setup({
          onPaused
        });
        await vm.pauseHandler();

        emit(media, 'pause');
        expect(vm.mediaStatus).toEqual(JuiAudioStatus.PLAY);
        expect(onPaused).toHaveBeenCalled();
      });
      it('should pause media when onBeforePause return true', async () => {
        const onBeforePause = jest.fn().mockReturnValue(true);
        const { vm, media } = setup({
          onBeforePause
        });
        await vm.pauseHandler();
        expect(onBeforePause).toHaveBeenCalled();

        emit(media, 'pause');
        expect(vm.mediaStatus).toEqual(JuiAudioStatus.PLAY);
      });
      it('should not pause media when onBeforePause return false', async () => {
        const onBeforePause = jest.fn().mockReturnValue(false);
        const { vm, media } = setup({
          onBeforePause
        });
        emit(media, 'play');

        await vm.pauseHandler();
        expect(onBeforePause).toHaveBeenCalled();

        expect(vm.mediaStatus).toEqual(JuiAudioStatus.PAUSE);
      });
    });

    describe('reload', () => {
      it('should reload media when status is reload', async () => {
        const { vm } = setup();
        await vm.reloadHandler();
        await sleep(300);
        expect(vm.mediaStatus).toEqual(JuiAudioStatus.LOADING);
      });
      it('should reload media when onBeforeReload return true', async () => {
        const onBeforeReload = jest.fn();
        const { vm, media } = setup({
          onBeforeReload
        });

        emit(media, 'error');

        await vm.reloadHandler();
        expect(onBeforeReload).toHaveBeenCalled();
        expect(vm.mediaStatus).toEqual(JuiAudioStatus.RELOAD);
      });
    });
  });

  describe('event', () => {
    it('should set media duration when media loadeddata called', async () => {
      const { vm, media } = setup();
      emit(media, 'loadeddata');
      expect(vm.currentDuration).toEqual(0);
      expect(media.duration).toEqual(0);
    });
    it('should set current time when media timeupdate called', async () => {
      const onTimeUpdate = jest.fn();
      const { vm, media } = setup({
        onTimeUpdate
      });
      emit(media, 'timeupdate');
      expect(media.currentTime).toEqual(0);
      expect(vm.currentTime).toEqual(0);

      const currentTime = 100;
      media.setCurrentTime(currentTime);
      expect(media.currentTime).toEqual(currentTime);
      emit(media, 'timeupdate');
      expect(vm.currentTime).toEqual(currentTime);
      expect(onTimeUpdate).toHaveBeenCalled();
    });
    it('should reset when media ended called', async () => {
      const onEnded = jest.fn();
      const { vm, media } = setup({
        onEnded
      });
      emit(media, 'ended');
      expect(onEnded).toHaveBeenCalled();
      expect(vm.currentTime).toEqual(0);
      expect(vm.mediaStatus).toEqual(JuiAudioStatus.PLAY);
    });
    it('should set reload status when media error called', () => {
      const onError = jest.fn();
      const { vm, media } = setup({
        onError
      });

      emit(media, 'error');
      expect(onError).toHaveBeenCalled();
      expect(vm.mediaStatus).toEqual(JuiAudioStatus.RELOAD);
      expect(vm.currentTime).toEqual(0);
    });
  });

  describe('timestamp update', () => {
    it('should update zero and stop media when has media and media duration, but timestamp out duration', () => {
      const duration = 100;
      const timeUpdateMockFn = jest.fn();
      const { vm, media } = setup({
        onTimeUpdate: timeUpdateMockFn
      });
      jest.spyOn(media, 'duration', 'get').mockReturnValue(duration);
      expect(media).toBeInstanceOf(Media);
      expect(media.duration).toEqual(duration);

      const timestamp = 100;
      const mediaStopMockFn = jest.spyOn(media, 'stop');
      vm.timestampHandler(timestamp);
      expect(mediaStopMockFn).toHaveBeenCalled();
      expect(media.currentTime).toEqual(0);
      expect(vm.currentTime).toEqual(0);

      const timestamp2 = 110;
      const mediaStopMockFn2 = jest.spyOn(media, 'stop');
      vm.timestampHandler(timestamp2);
      expect(mediaStopMockFn2).toHaveBeenCalled();
      expect(media.currentTime).toEqual(0);
      expect(vm.currentTime).toEqual(0);
    });
    it('should update timestamp when has media and media duration, but timestamp in duration', () => {
      const duration = 100;
      const timeUpdateMockFn = jest.fn();
      const { vm, media } = setup({
        onTimeUpdate: timeUpdateMockFn
      });
      jest.spyOn(media, 'duration', 'get').mockReturnValue(duration);
      expect(media).toBeInstanceOf(Media);
      expect(media.duration).toEqual(duration);
      expect(media.playing).toBeFalsy();

      const timestamp = 11;
      const mediaSetCurrentTimeMockFn = jest.spyOn(media, 'setCurrentTime');
      vm.timestampHandler(timestamp);
      expect(mediaSetCurrentTimeMockFn).toHaveBeenCalled();
      expect(media.currentTime).toEqual(timestamp);
      expect(vm.currentTime).toEqual(timestamp);
      expect(media.playing).toBeFalsy();
    });

    it('should update zero and stop media when has media and prop duration, but not media duration and timestamp out duration', () => {
      const duration = 100;
      const timeUpdateMockFn = jest.fn();
      const { vm, media } = setup({
        duration,
        onTimeUpdate: timeUpdateMockFn
      });
      expect(media).toBeInstanceOf(Media);
      expect(media.duration).toEqual(0);

      const timestamp = 100;
      const mediaStopMockFn = jest.spyOn(media, 'stop');
      vm.timestampHandler(timestamp);
      expect(mediaStopMockFn).toHaveBeenCalled();
      expect(media.currentTime).toEqual(0);
      expect(vm.currentTime).toEqual(0);
    });
    it('should update timestamp when has media and prop duration, but not media duration and timestamp in duration', () => {
      const duration = 100;
      const timeUpdateMockFn = jest.fn();
      const { vm, media } = setup({
        duration,
        onTimeUpdate: timeUpdateMockFn
      });
      expect(media).toBeInstanceOf(Media);
      expect(media.duration).toEqual(0);

      const timestamp = 11;
      vm.timestampHandler(timestamp);
      expect(timeUpdateMockFn).toBeCalled();
      expect(media.currentTime).toEqual(timestamp);
      expect(vm.currentTime).toEqual(timestamp);
    });

    it('should update zero when not have media, but has prop duration and timestamp out duration', () => {
      const duration = 100;
      const timeUpdateMockFn = jest.fn();
      const vm = new AudioPlayerViewModel({
        duration,
        onTimeUpdate: timeUpdateMockFn
      });
      expect(vm._media).toBe(null);

      const timestamp = 100;
      vm.timestampHandler(timestamp);
      expect(timeUpdateMockFn).toBeCalled();
      expect(vm.currentTime).toEqual(0);
    });
    it('should update timestamp when not have media, but has prop duration and timestamp in duration', () => {
      const duration = 100;
      const timeUpdateMockFn = jest.fn();
      const vm = new AudioPlayerViewModel({
        duration,
        onTimeUpdate: timeUpdateMockFn
      });
      expect(vm._media).toBe(null);

      const timestamp = 11;
      vm.timestampHandler(timestamp);
      expect(timeUpdateMockFn).toBeCalled();
      expect(vm.currentTime).toEqual(timestamp);
    })
  });
});
