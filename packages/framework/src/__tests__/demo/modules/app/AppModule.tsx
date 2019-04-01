import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './container/App/App';
import { AbstractModule } from '../../../../AbstractModule';

class AppModule extends AbstractModule {
  bootstrap() {
    ReactDOM.render(<App />, document.getElementById('root'));
  }
}

export { AppModule };
