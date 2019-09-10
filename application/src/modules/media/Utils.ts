/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-06-27 12:40:00
 * Copyright © RingCentral. All rights reserved.
 */

/**
 * HACK:
 * Skirting the Safari audio policy for UI sound effects
 * once you’ve played the sound once on a user interaction,
 * you can then play it again without further interaction.
 * so use 24Hz sound and setting the volume to zero and
 * playing the sound in the click handler before the async
 * operation to “initialized” it and then, once async
 * operation is complete, the other audio will play normality.
 *
 * audio_sin_24Hz_-3dBFS_0.01s means a sine sound with 24Hz,3db,
 */
const sound24Hz = require('./assets/audio_sin_24Hz_-3dBFS_0.01s.mp3');

const audioPolicyHandler = (actionHandler: () => void) => {
  const userInputEventNames = [
    'click',
    'contextmenu',
    'auxclick',
    'dblclick',
    'mousedown',
    'mouseup',
    'pointerup',
    'touchend',
    'keydown',
    'keyup',
  ];

  const policyHandler = () => {
    actionHandler();
    userInputEventNames.forEach(eventName => {
      document.removeEventListener(eventName, policyHandler);
    });
  };
  userInputEventNames.forEach(eventName => {
    document.addEventListener(eventName, policyHandler);
  });
};

const formatMediaId = (ids: {
  trackId: string;
  mediaId: string;
  description?: string;
}) => {
  const isValid = (str: string) => {
    if (str === '') return true;
    const matchArr = str.toString().match(/[\w-_0-9]+/gi);
    return matchArr && matchArr.length === 1;
  };
  if (
    !isValid(ids.trackId) ||
    !isValid(ids.mediaId) ||
    (ids.description && !isValid(ids.description))
  ) {
    throw new Error('[MediaModule] media id or description is inValid');
  }
  let id = `[${ids.trackId}]-[${ids.mediaId}]`;
  if (ids.description) {
    id += `-[${ids.description}]`;
  }
  return id;
};

const dismantleMediaId = (id: string) => {
  if (typeof id === 'string' && id) {
    const matchArr = id.match(/\[[\w-_0-9]*\]/gi);
    const getVal = (str: string) => str.replace(/(\[)|(\])/g, '');

    const trackId = matchArr && matchArr[0] ? getVal(matchArr[0]) : '';
    const mediaId = matchArr && matchArr[1] ? getVal(matchArr[1]) : '';
    const description = matchArr && matchArr[2] ? getVal(matchArr[2]) : '';
    return {
      trackId,
      mediaId,
      description,
    };
  }
  return {};
};

const safariAudioPolicyHandler = () => {
  audioPolicyHandler(() => {
    const audio = document.createElement('audio');
    audio.src = sound24Hz;
    audio.volume = 0;
    audio.muted = true;
    try {
      audio && audio.play();
    } catch (e) {
      return;
    }
  });
};

const isValidVolume = (vol: number) => vol <= 1 && vol >= 0;

const difference = (a: string[], b: string[]) =>
  a.concat(b).filter(v => !a.includes(v) || !b.includes(v));

const Utils = {
  formatMediaId,
  dismantleMediaId,
  audioPolicyHandler,
  safariAudioPolicyHandler,
  isValidVolume,
  difference,
};

export { Utils };
