/*
 * @Author: Steven Zhuang (steven.zhuang@ringcentral.com)
 * @Date: 2019-05-09 11:10:53
 * Copyright © RingCentral. All rights reserved.
 */

const fs = require('fs');
const path = require('path');

////////////////////////////////////////
if (process.argv.length < 3) {
  console.error('Target language is missed.');
  process.exit(1);
}
const targetLanguage = process.argv[2];

////////////////////////////////////////
const localesPath = 'application/public/locales';
const localesFileName = 'translations.json';
const baseLanguage = 'en';

function getLocaleFileName(language) {
  return `${localesPath}/${language}/${localesFileName}`;
}

const increasePercent = 0.3;
const pseudoMap = {
  a: 'á',
  b: 'β',
  c: 'ç',
  d: 'δ',
  e: 'è',
  f: 'ƒ',
  g: 'ϱ',
  h: 'λ',
  i: 'ï',
  j: 'J',
  k: 'ƙ',
  l: 'ℓ',
  m: '₥',
  n: 'ñ',
  o: 'ô',
  p: 'ƥ',
  q: '9',
  r: 'ř',
  s: 'ƨ',
  t: 'ƭ',
  u: 'ú',
  v: 'Ʋ',
  w: 'ω',
  x: 'ж',
  y: '¥',
  z: 'ƺ',
  A: 'Â',
  B: 'ß',
  C: 'Ç',
  D: 'Ð',
  E: 'É',
  F: 'F',
  G: 'G',
  H: 'H',
  I: 'Ì',
  J: 'J',
  K: 'K',
  L: '£',
  M: 'M',
  N: 'N',
  O: 'Ó',
  P: 'Þ',
  Q: 'Q',
  R: 'R',
  S: '§',
  T: 'T',
  U: 'Û',
  V: 'V',
  W: 'W',
  X: 'X',
  Y: 'Ý',
  Z: 'Z',
};
const extraPseudoWords =
  ' lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc eget urna laoreet, accumsan felis at, dapibus elit. In ut tempus mauris. Sed eget sagittis arcu, in condimentum purus. Curabitur vitae congue elit.';

function reservePlaceHolders(src, holders) {
  let dest = src;
  const regexp = /\{\{[a-zA-Z0-9]+\}\}/g;

  let m;
  let allMatch = [];
  do {
    m = regexp.exec(src);
    if (m) {
      allMatch.push(m[0]);
    }
  } while (m);

  for (let index = 0; index < allMatch.length; index++) {
    const key = `10086123456789-${index}`;
    const value = allMatch[index];
    holders[key] = value;
    dest = dest.replace(value, key);
  }

  return dest;
}

function revertPlaceHolders(src, holders) {
  let dest = src;
  Object.keys(holders).forEach(key => {
    dest = dest.replace(key, holders[key]);
  });

  return dest;
}

function pseudoWithCharMap(src) {
  let dest = '';
  const holders = {};
  const srcWithoutHolders = reservePlaceHolders(src, holders);

  for (let index = 0; index < srcWithoutHolders.length; index++) {
    const original = srcWithoutHolders[index];
    const pseudo = pseudoMap[original];
    dest += pseudo === undefined ? original : pseudo;
  }

  dest = revertPlaceHolders(dest, holders);

  return dest;
}

function pseudoValue(src) {
  let dest = pseudoWithCharMap(src);
  const extraLen = Math.ceil(dest.length * increasePercent);
  return (dest + extraPseudoWords.substr(0, extraLen)).trimRight();
}

function pseudoObject(src) {
  let dest = {};
  Object.keys(src).forEach(key => {
    const v = src[key];
    if (typeof v === 'object') {
      dest[key] = pseudoObject(v);
    } else {
      dest[key] = pseudoValue(v);
    }
  });

  return dest;
}

////////////////////////////////////////
const srcData = JSON.parse(
  fs.readFileSync(getLocaleFileName(baseLanguage), 'utf8'),
);

const destData = pseudoObject(srcData);

const destFileName = getLocaleFileName(targetLanguage);
const destFilePath = path.dirname(destFileName);
if (!fs.existsSync(destFilePath)) {
  fs.mkdirSync(destFilePath);
}
fs.writeFileSync(destFileName, JSON.stringify(destData, null, '\t'), 'utf8');
console.log(`Exported to ${destFileName}`);
