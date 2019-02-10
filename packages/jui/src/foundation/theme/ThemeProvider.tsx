/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-08-30 08:39:11
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import createMuiTheme, {
  Theme as MuiTheme,
} from '@material-ui/core/styles/createMuiTheme';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import themeHandler from './ThemeHandler';
import option from './options.json';

interface IThemeProviderProps {
  themeName: string;
  children: React.ReactNode;
}

interface IThemeProviderPropsState {
  theme: MuiTheme | null;
}

class ThemeProvider extends PureComponent<
  IThemeProviderProps,
  IThemeProviderPropsState
> {
  private _mounted: boolean;
  constructor(props: IThemeProviderProps) {
    super(props);
    this.state = {
      theme: null,
    };
    this.onThemeChanged = this.onThemeChanged.bind(this);
  }

  async componentDidMount() {
    this._mounted = true;
    const { themeName } = this.props;
    const themeOptions = await themeHandler.read(themeName);
    this.setState({
      theme: createMuiTheme(themeOptions),
    });

    themeHandler.on(option.bindEvent, this.onThemeChanged);
  }

  componentWillUnmount() {
    this._mounted = false;
    themeHandler.offAny(this.onThemeChanged);
  }

  onThemeChanged(themeOptions: {}) {
    if (!this._mounted) return;
    this.setState({
      theme: createMuiTheme(themeOptions),
    });
  }

  render() {
    const { theme } = this.state;
    const { children } = this.props;
    if (!theme) {
      return null;
    }
    return (
      <StyledThemeProvider theme={theme}>
        <MuiThemeProvider theme={theme}>
          {React.Children.only(children)}
        </MuiThemeProvider>
      </StyledThemeProvider>
    );
  }
}

export { ThemeProvider };
