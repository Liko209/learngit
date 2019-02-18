import ProgressBar from '../index';

import NProgress from 'nprogress';

jest.mock('nprogress');

describe('ProgressBar', () => {
  let progressBar: ProgressBar;
  beforeEach(() => {
    progressBar = new ProgressBar();
  });
  it('start(): _start should true', () => {
    progressBar.start();
    expect(progressBar._start).toBe(true);
  });

  it('stop(): _start should false', () => {
    progressBar.stop();
    expect(progressBar._start).toBe(false);
  });

  describe('update(e)', () => {
    beforeEach(() => {
      NProgress.inc = jest.fn();
    });
    it('update(e): self reduce when lengthComputable = true', () => {
      const mock = {
        lengthComputable: true,
        loaded: 10,
        total: 30,
      };
      progressBar.update(mock);
      expect(NProgress.inc).toBeCalledWith(Math.floor(10 / 30));
    });

    it('update(e): reduce when lengthComputable = false', () => {
      const mock = {
        lengthComputable: false,
        loaded: 10,
        total: 0,
      };
      progressBar.update(mock);
      expect(NProgress.inc).not.toBeCalled();
    });
  });
});
