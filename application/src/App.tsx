import * as React from 'react';
import { hot } from 'react-hot-loader';
import I18n from '@/containers/I18n';
import LanguageSwitcher from '@/containers/LanguageSwitcher';
import ThemeProvider from '@/containers/ThemeProvider';
import StoreContext from '@/store/context';
import storeManager from '@/store';

import '@/App.css';
// import logo from './logo.svg';

class App extends React.PureComponent {
  public render() {
    return (
      <ThemeProvider>
        <StoreContext.Provider value={storeManager} >
          <div className="App">
            <header className="App-header">
              <img className="App-logo" alt="logo" />
              <h1 className="App-title">Welcome to React</h1>
            </header>
            <p className="App-intro">
              To get started, edit <code>src/App.tsx</code> and save to reload.
            </p>
            <LanguageSwitcher />
            <I18n />
          </div>
        </StoreContext.Provider>
      </ThemeProvider>
    );
  }
}

export default hot(module)(App);
