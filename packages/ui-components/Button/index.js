var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import React from 'react';
import styled, { withTheme } from 'styled-components';
import MuiButton from '@material-ui/core/Button';
export var CustomButton = function (props) {
    return React.createElement(MuiButton, __assign({}, props));
};
export var Button = styled(withTheme(CustomButton)).attrs({})(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  min-width: 104px !important;\n  min-height: ", " !important;\n  height: ", " !important;\n  padding: ", " !important;\n  font-size: 14px !important;\n  line-height: 16px !important;\n  border-radius: 2px !important;\n"], ["\n  min-width: 104px !important;\n  min-height: ",
    " !important;\n  height: ",
    " !important;\n  padding: ", " !important;\n  font-size: 14px !important;\n  line-height: 16px !important;\n  border-radius: 2px !important;\n"])), function (props) {
    return props.size && props.size === 'small' ? '28px' : '40px';
}, function (props) {
    return props.size && props.size === 'small' ? '28px' : '40px';
}, function (props) { return (props.href ? '0' : '0 20px'); });
export default Button;
var templateObject_1;
//# sourceMappingURL=index.js.map