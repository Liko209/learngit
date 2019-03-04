import { IImageDownloader, IImageDownloadedListener } from 'sdk/pal';

function createImagElement() {
  const imgElement = document.createElement('img');
  imgElement.style.display = 'none';
  document.body.appendChild(imgElement);
  return imgElement;
}

class ImageDownloader implements IImageDownloader {
  private _imgElement = createImagElement();
  private _downloadListener: IImageDownloadedListener;
  private _image: {
    id: number;
    url: string;
    thumbnail: boolean;
    count?: number;
  };
  constructor() {
    this._imgElement.addEventListener('load', () => {
      console.log(
        'load',
        `width: ${this._imgElement.width}`,
        `height: ${this._imgElement.height}`,
      );
      this._downloadListener.onSuccess(
        this._image,
        this._imgElement.width,
        this._imgElement.height,
      );
    });

    this._imgElement.addEventListener('error', () => {
      console.log('error');
      this._downloadListener.onFailure(this._image.url, 0);
    });
  }
  download = (
    image: { id: number; url: string; thumbnail: boolean; count?: number },
    downloadListener: IImageDownloadedListener,
  ) => {
    console.debug('ImageDownloader, download:', image.url);
    this._image = image;
    this._downloadListener = downloadListener;
    this._imgElement.setAttribute('src', this._image.url);
  }
}

export { ImageDownloader };
