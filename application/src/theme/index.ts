import { createTheme } from 'ui-components/theme';
import config from '@/config';

interface IThemeConfig {
  default: string;
  theme: string[];
}

function createThemes(config: IThemeConfig) {
  const requireContext = require.context('./', false, /.ts$/);
  const themePaths = requireContext.keys();
  const themeNames = themePaths.map((path: string) =>
    path.split('.')[1].split('/')[1],
  );
  const { theme } = config;

  return theme
    .map((name: string) => {
      const index = themeNames.indexOf(name);
      if (index !== -1) {
        return {
          name,
          theme: createTheme(requireContext(themePaths[index])),
        };
      }
      return;
    })
    .reduce((allTheme, theme) => {
      if (theme) {
        allTheme[theme.name] = theme.theme;
      }
      return allTheme;
    },      {});
}

const themeConfig: IThemeConfig = config.get('theme');
const themes = createThemes(themeConfig);

console.log(themes);

export const defaultTheme = themes[themeConfig.default];
export default themes;
