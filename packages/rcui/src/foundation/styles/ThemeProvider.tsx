import React, { Component } from 'react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { ThemeProvider as StyledThemeProvider } from '../styled-components';
import createTheme from './createTheme';
import themeHandler from './ThemeHandler';
import options from './options.json';
import { Theme } from './theme.d';

type ThemeProviderProps = {
  themeName?: string;
  children: React.ReactNode;
};

type ThemeProviderPropsState = {
  theme: Theme | null;
};

class ThemeProvider extends Component<
  ThemeProviderProps,
  ThemeProviderPropsState
> {
  private _mounted: boolean;
  constructor(props: ThemeProviderProps) {
    super(props);
    this.state = {
      theme: null,
    };
    this.onThemeChanged = this.onThemeChanged.bind(this);
  }

  async componentDidMount() {
    this._mounted = true;
    const { themeName } = this.props;
    let themeOptions = {};
    if (themeName) {
      themeOptions = await themeHandler.read(themeName);
    }
    this.setState({
      theme: createTheme(themeOptions),
    });

    themeHandler.on(options.bindEvent, this.onThemeChanged);
  }

  componentWillUnmount() {
    this._mounted = false;
    themeHandler.offAny(this.onThemeChanged);
  }

  onThemeChanged(themeOptions: {}) {
    if (!this._mounted) return;
    this.setState({
      theme: createTheme(themeOptions),
    });
  }

  render() {
    const { theme } = this.state;
    const { children } = this.props;
    if (!theme) {
      return null;
    }

    return (
      <MuiThemeProvider theme={theme}>
        <StyledThemeProvider theme={theme}>
          {React.Children.only(children)}
        </StyledThemeProvider>
      </MuiThemeProvider>
    );
  }
}

export default ThemeProvider;
