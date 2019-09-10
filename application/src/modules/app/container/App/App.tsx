/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-08-03 14:00:02
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { observer } from 'mobx-react';
import { container } from 'framework/ioc';
import { JuiContentLoader } from 'jui/pattern/ContentLoader';
import { HighlightStyle } from 'jui/pattern/ConversationCard';
import ThemeProvider from '@/containers/ThemeProvider';
import { generalErrorHandler, errorReporter } from '@/utils/error';
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
    errorReporter.report(error);
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
            <HighlightStyle />
            {window.jupiterElectron && <ElectronBadgeWithAppUmi />}
          </>
        )}
      </ThemeProvider>
    );
  }
}

export { App };
export default App;
