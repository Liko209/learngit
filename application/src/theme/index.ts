// import { createTheme } from 'ui-components/theme';
import config from '@/config';

interface IThemeConfig {
  default: string;
  theme: string[];
}

function createThemes(config: IThemeConfig) {
  const requireContext = require.context('./', false, /.ts$/);
  const keys = requireContext.keys();
  const { theme } = config;
  console.log(keys);

  return theme
    .map((name: string) => {
      const index = keys.indexOf(name);
      if (index !== -1) {
        return {
          name,
          // theme: createTheme(requireContext(name)),
        };
      }
      return;
    })
    .reduce((allTheme, theme) => {
      if (theme) {
        // allTheme[theme.name] = theme.theme;
      }
      return allTheme;
    },      {});
}

const themeConfig: IThemeConfig = config.get('theme');
const themes = createThemes(themeConfig);

console.log(themeConfig, themes);

export const defaultTheme = themes[themeConfig.default];
export default themes;
