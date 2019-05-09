import applyTheme from './ThemeHandler';
import options from './options.json';

async function detect() {
  let theme;
  try {
    theme = (await applyTheme.read(options.brandThemeFile)) as {
      [brand: string]: {
        default: string;
        themes: string[];
      };
    };
  } catch (error) {
    console.log(error);
  }
  return theme;
}

export default detect;
