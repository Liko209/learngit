/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-02-27 11:28:18
 * @Last Modified by: Lyman Lai (lyman.lai@ringcentral.com)
 * @Last Modified time: 2018-06-22 09:23:37
 */
import styled from 'styled-components';
import SplitPane from '@/components/SplitPane';

const SplitPaneWrapper = styled(SplitPane)`
  width: 100%;
  display: flex;
  flex-direction: row;
  .Pane2 {
    padding-bottom: 50px;
  }
  &[max-width~='900px'] .Pane2 {
    display: none;
  }
`;

export default SplitPaneWrapper;
