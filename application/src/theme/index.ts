import config from '@/config';
console.log('config: ', config);

interface IThemeConfig {
  default: string;
  themes: string[];
}

const themeConfig: IThemeConfig = config.get('theme');
const defaultTheme = themeConfig.default;
const themes = themeConfig.themes;

export {
  defaultTheme,
  themes,
};
