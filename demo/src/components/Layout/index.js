import { injectGlobal } from 'styled-components';

import Box from './components/Box';
import Page from './components/Page';
import Container from './components/Container';
import ScrollView from './components/ScrollView';
// shortcuts
import Flex from './components/shortcut/Flex';
import Center from './components/shortcut/Center';
import VBox from './components/shortcut/VBox';

/* eslint no-unused-expressions: 0 */
injectGlobal`
  .layout--box {
    display: flex;
    height: 100%;
  }
`;

export default Box;

export { Box, Page, Container, ScrollView, Flex, Center, VBox };
