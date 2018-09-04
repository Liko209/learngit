/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-04 11:01:27
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { ThemeProvider as UIThemeProvider } from 'ui-components/theme';
import detectTheme from '@/theme';

interface IProps {
  children: React.ReactNode;
}

interface IState {
  defaultTheme: string | null;
}
class ThemeProvider extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      defaultTheme: null,
    };
  }

  async componentDidMount() {
    const theme = await detectTheme() as {default: string};
    this.setState({
      defaultTheme: theme.default,
    });
  }

  render() {
    const { defaultTheme } = this.state;
    const { children } = this.props;
    if (!defaultTheme) {
      return null;
    }
    return <UIThemeProvider themeName={defaultTheme}>{children}</UIThemeProvider>;
  }
}

export default ThemeProvider;
