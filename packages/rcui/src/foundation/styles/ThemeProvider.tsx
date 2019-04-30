import React, { Component } from 'react';
import {
  StylesProvider,
  createGenerateClassName,
  jssPreset,
  ThemeProvider as MuiThemeProvider,
} from '@material-ui/styles';
import { create } from 'jss';
import { ThemeProvider as StyledThemeProvider } from '../styled-components';
import createTheme from './createTheme';
import themeHandler from './ThemeHandler';
import options from './options.json';
import { Theme } from './theme.d';

// create jss
const styleNode = document.createComment('jss-insertion-point');
document.head.insertBefore(styleNode, document.head.firstChild);

const generateClassName = createGenerateClassName();
const jss = create({
  ...jssPreset(),
  // We define a custom insertion point that JSS will look for injecting the styles in the DOM.
  insertionPoint: 'jss-insertion-point',
});

type ThemeProviderProps = {
  themeName?: string;
  children: React.ReactChild;
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
      <StylesProvider jss={jss} generateClassName={generateClassName}>
        <MuiThemeProvider theme={theme}>
          <StyledThemeProvider theme={theme}>
            {React.Children.only(children)}
          </StyledThemeProvider>
        </MuiThemeProvider>
      </StylesProvider>
    );
  }
}

export default ThemeProvider;
