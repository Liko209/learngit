import React from 'react';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
export var createTheme = function (options) {
    return createMuiTheme(options);
};
export var ThemeProvider = function (_a) {
    var theme = _a.theme, children = _a.children;
    return (React.createElement(StyledThemeProvider, { theme: theme },
        React.createElement(MuiThemeProvider, { theme: theme }, React.Children.only(children))));
};
//# sourceMappingURL=index.js.map