/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-08-03 14:00:02
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import * as React from 'react';
import { observer } from 'mobx-react';
import { hot } from 'react-hot-loader/root';
import { container } from 'framework';
import { JuiContentLoader } from 'jui/pattern/ContentLoader';
import ThemeProvider from '@/containers/ThemeProvider';
import { analytics } from '@/Analytics';
import { AboutView } from '@/containers/About';
import { generalErrorHandler } from '@/utils/error';
import { Router } from '@/modules/router';
import { TopBanner } from '../TopBanner';
import { AppStore } from '../../store';
import { Title } from './Title';
import { ElectronBadgeWithAppUmi } from './ElectronBadgeWithAppUmi';

@observer
class App extends React.Component {
  private _appStore: AppStore = container.get(AppStore);

  componentDidCatch(error: Error) {
    generalErrorHandler(error);
  }

  componentDidMount() {
    analytics.bootstrap();
  }

  public render() {
    const { globalLoading } = this._appStore;
    return (
      <ThemeProvider>
        {globalLoading ? (
          <JuiContentLoader />
        ) : (
          <>
            <Title />
            <TopBanner />
            <Router />
            <AboutView />
            {window.jupiterElectron && <ElectronBadgeWithAppUmi />}
          </>
        )}
      </ThemeProvider>
    );
  }
}
const HotApp = hot(App);

export { HotApp as App };
export default HotApp;
