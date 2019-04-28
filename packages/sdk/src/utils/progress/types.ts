/*
 * @Author: Paynter Chen
 * @Date: 2019-04-16 18:03:11
 * Copyright © RingCentral. All rights reserved.
 */

interface IProgress {
  isStart: () => boolean;

  getProgress: () => number;
}

interface IProgressObserver {
  onStart: (progressBar: IProgress) => void;
  onStop: (progressBar: IProgress) => void;
  onProgress: (progressBar: IProgress, progress: number) => void;
}

export { IProgress, IProgressObserver };
