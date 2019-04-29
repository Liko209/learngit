import { ProgressBar } from '../ProgressBar';
import { spyOnTarget } from 'sdk/__tests__/utils';
import { IProgressObserver } from '../types';

describe('ProgressBar', () => {
  let progressBar: ProgressBar;
  let mockProgressObserver: IProgressObserver;
  beforeEach(() => {
    mockProgressObserver = spyOnTarget<IProgressObserver>({
      onStart: () => {},
      onProgress: () => {},
      onStop: () => {},
    });
    progressBar = new ProgressBar(mockProgressObserver);
  });
  it('start(): _start should true', () => {
    progressBar.start();
    expect(progressBar._start).toBe(true);
    expect(mockProgressObserver.onStart).toBeCalledWith(progressBar);
  });

  it('stop(): _start should false', () => {
    progressBar.start();
    progressBar.stop();
    expect(progressBar._start).toBe(false);
    expect(mockProgressObserver.onStop).toBeCalledWith(progressBar);
  });

  describe('update(e)', () => {
    it('update(e): self reduce when lengthComputable = true', () => {
      const mock = {
        lengthComputable: true,
        loaded: 10,
        total: 30,
      };
      progressBar.update(mock);
      // expect(NProgress.inc).toBeCalledWith(Math.floor(10 / 30));
      expect(mockProgressObserver.onProgress).toBeCalledWith(
        progressBar,
        progressBar['_progress'],
      );
    });

    it('update(e): reduce when lengthComputable = false', () => {
      const mock = {
        lengthComputable: false,
        loaded: 10,
        total: 0,
      };
      progressBar.update(mock);
      expect(mockProgressObserver.onProgress).not.toBeCalled();
    });
  });
});
