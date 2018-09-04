/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-04 11:01:32
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { themeHandler } from 'ui-components/theme';
import detectTheme from '@/theme';

interface IProps {}

interface IState {
  themes: string[] | null;
}
class ThemeSwitcher extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      themes: null,
    };
    this.applyTheme = this.applyTheme.bind(this);
  }

  async componentDidMount() {
    const theme = await detectTheme() as {themes: string[]};
    this.setState({
      themes: theme.themes,
    });
  }

  applyTheme(theme: string) {
    return () => {
      return themeHandler.applyTheme(theme);
    };
  }

  render() {
    const { themes } = this.state;
    if (!themes) {
      return null;
    }
    return themes.map(theme => (
      <button id={theme} onClick={this.applyTheme(theme)}>{theme}</button>
    ));
  }
}

export default ThemeSwitcher;
