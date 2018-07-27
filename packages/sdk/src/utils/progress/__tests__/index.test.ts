import ProgressBar from '../index';

describe('ProgressBar', () => {
  let progressBar: ProgressBar;
  beforeEach(() => {
    progressBar = new ProgressBar();
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => cb());
  });
  it('start(): _counter should add 1', () => {
    let mock = 1;
    progressBar.start();
    expect(progressBar.counter).toBe(mock);
  });

  it('stop(): _counter should less than 0', () => {
    let mock = -1;
    progressBar.stop();
    expect(progressBar.counter).toBe(mock);
  });

  describe('update(e)', () => {
    it('update(e): self reduce when lengthComputable = true', () => {
      let mock = {
        lengthComputable: true,
        loaded: 10,
        total: 30
      };
      progressBar.update(mock);
      expect(progressBar.counter).toBe(0);
    });

    it('update(e): reduce when lengthComputable = false', () => {
      let mock = {
        lengthComputable: false,
        loaded: 10,
        total: 0
      };
      progressBar.update(mock);
      expect(progressBar.counter).toBe(-1);
    });
  });
});
