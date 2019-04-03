import React from 'react';
import { container } from '../../../../../../Jupiter';
import { MATH_SERVICE, IMathService } from '../../../math/interface';

class App extends React.Component {
  private _mathService: IMathService = container.get(MATH_SERVICE);

  render() {
    const result = this._mathService.add(1, 1);
    return <div>Result is: {result}</div>;
  }
}

export { App };
