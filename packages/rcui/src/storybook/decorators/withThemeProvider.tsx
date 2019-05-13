import * as React from 'react';
import { ThemeProvider } from '../../foundation/styles';

export default function withThemeProvider(story: () => React.ReactChild) {
  return <ThemeProvider>{story()}</ThemeProvider>;
}
