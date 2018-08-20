import * as React from 'react';
import { ThemeProvider as UIThemeProvider } from 'ui-components/theme';
import { defaultTheme } from '@/theme';

interface IProps {
  children: React.ReactNode;
}
class ThemeProvider extends React.PureComponent<IProps> {
  render() {
    const { children } = this.props;
    return <UIThemeProvider themeName={defaultTheme}>{children}</UIThemeProvider>;
  }
}

export default ThemeProvider;
