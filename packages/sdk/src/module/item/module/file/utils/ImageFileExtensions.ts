/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-16 17:02:47
 * Copyright © RingCentral. All rights reserved.
 */

const GifFileExtensions = new Set(['gif']);

const SupportPreviewImageExtensions = new Set([
  'jpg',
  'png',
  'jpeg',
  'bmp',
  'gif',
  'tif',
  'tiff',
  // 'giphy', // todo: Unrealized support preivew giphy
  // 'tif', // use thumbs url
  // Unable to parse the following suffix file.
  // https://en.wikipedia.org/wiki/Comparison_of_web_browsers#Image_format_support
  // 'tiff', // Only Safari support, Chrome and Firefox not support.
  // 'ps', // Only Safari support, Chrome and Firefox not support.
  // 'psd', // Only Safari support, Chrome and Firefox not support.
  // 'ai', // Chrome and Firefox and Safari not support.
  // 'heic', // Chrome and Firefox and Safari not support. Apple macOS Mojave dynamic wallpaper.
]);

const SupportShowRawImageExtensions = new Set([
  'jpg',
  'png',
  'jpeg',
  'bmp',
  'gif',
]);

const ResizableExtensions = new Set([
  'bmp',
  'jpg',
  'jpeg',
  'png',
  'tif',
  'tiff',
]);

const ImageFileExtensions = new Set([
  'jpg',
  'png',
  'jpeg',
  'bmp',
  'gif',
  'tif',
  'tiff',
  'ai',
  'psd',
  'heic',
  'ase',
  'art',
  'blp',
  'cd5',
  'cit',
  'cpt',
  'cr2',
  'cut',
  'dds',
  'dib',
  'djvu',
  'egt',
  'exif',
  'gpl',
  'grf',
  'icns',
  'ico',
  'iff',
  'jng',
  'jfif',
  'jp2',
  'jps',
  'lbm',
  'max',
  'miff',
  'mng',
  'msp',
  'nitf',
  'ota',
  'pbm',
  'pc1',
  'pc2',
  'pc3',
  'pcf',
  'pcx',
  'pdn',
  'pgm',
  'pi1',
  'pi2',
  'pi3',
  'pict',
  'pct',
  'pnm',
  'pns',
  'ppm',
  'psb',
  'pdd',
  'psp',
  'px',
  'pxm',
  'pxr',
  'qfx',
  'raw',
  'rle',
  'sct',
  'sgi',
  'rgb',
  'int',
  'bw',
  'tga',
  'vtf',
  'xbm',
  'xcf',
  'xpm',
  '3dv',
  'amf',
  'awg',
  'cgm',
  'cdr',
  'cmx',
  'dxf',
  'e2d',
  'egt',
  'eps',
  'fs',
  'gbr',
  'odg',
  'svg',
  'stl',
  'vrml',
  'x3d',
  'sxd',
  'v2d',
  'vnd',
  'wmf',
  'emf',
  'art',
  'xar',
  'webp',
  'jxr',
  'hdp',
  'wdp',
  'cur',
  'ecw',
  'iff',
  'lbm',
  'liff',
  'nrrd',
  'pam',
  'pcx',
  'pgf',
  'sgi',
  'rgba',
  'bw',
  'int',
  'inta',
  'sid',
  'ras',
  'sun',
  'tga',
  'ps',
]);

export {
  ImageFileExtensions,
  GifFileExtensions,
  ResizableExtensions,
  SupportPreviewImageExtensions,
  SupportShowRawImageExtensions,
};
