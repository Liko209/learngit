import { EventEmitter2 } from 'eventemitter2';
import options from './options.json';

type Options = {
  loadPath: (theme: string) => string;
};

class ThemeHandler extends EventEmitter2 {
  private options: Options = {
    loadPath: theme => `${options.basePath}${theme}.json`,
  };

  async applyTheme(theme: string) {
    const themeOptions = await this.read(theme);
    this.emit(options.bindEvent, themeOptions);
  }

  read(theme: string) {
    const { loadPath } = this.options;
    const url = loadPath(theme);

    return this.loadUrl(url);
  }

  async loadUrl(url: string) {
    return fetch(url)
      .then((response: Response) => {
        if (response.ok) {
          try {
            return response.json();
          } catch (e) {
            return Promise.reject(`failed parsing ${url} to json`);
          }
        }
        return Promise.reject(`failed loading ${url}`);
      })
      .catch(() => Promise.reject(`failed loading ${url}`));
  }
}
export { ThemeHandler };
export default new ThemeHandler();
