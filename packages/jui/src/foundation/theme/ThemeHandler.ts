/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-08-30 08:38:40
 * Copyright © RingCentral. All rights reserved.
 */
import { EventEmitter2 } from 'eventemitter2';
import ajax from './ajax';
import option from './options.json';

type IOptions = {
  loadPath: (theme: string) => string;
};

class ThemeHandler extends EventEmitter2 {
  private options: IOptions = {
    loadPath: theme => `${option.basePath}${theme}.json`,
  };

  async applyTheme(theme: string) {
    const themeOptions = await this.read(theme);
    this.emit(option.bindEvent, themeOptions);
  }

  read(theme: string) {
    const { loadPath } = this.options;
    const url = loadPath(theme);

    return this.loadUrl(url);
  }

  loadUrl(url: string) {
    return new Promise((resolve, reject) => {
      ajax(url, (data, xhr) => {
        if (xhr.status >= 400 && xhr.status < 600) return reject(`failed loading ${url}`);

        let ret;
        let err;
        try {
          ret = JSON.parse(data);
        } catch (e) {
          err = `failed parsing ${url} to json`;
        }
        if (err) return reject(err);
        resolve(ret);
      });
    });
  }
}
export { ThemeHandler };
export default new ThemeHandler;
