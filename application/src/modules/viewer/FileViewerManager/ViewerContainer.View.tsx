/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-06-06 09:40:39
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo, SFC } from 'react';
import { JuiViewerSidebar, JuiViewerDocument } from 'jui/pattern/Viewer';
import { JuiImageWithStatusView } from 'jui/pattern/Viewer/ViewerContentView';

import { IViewerView } from '../container/ViewerView/interface';

const LEFT_WIDTH = 268;

type Type = {
  dataModule: IViewerView;
  handleScaleChanged: () => void;
  handlePageIdxChanged: () => void;
};

const ThumbnailBar: SFC<Type> = memo((props: Type) => {
  const { dataModule, handlePageIdxChanged } = props;
  if (dataModule.pages) {
    const items = dataModule.pages.map(page => {
      return <JuiImageWithStatusView src={page.url || ''} key={page.url} />;
    });
    return (
      <JuiViewerSidebar
        open
        items={items}
        selectedIndex={dataModule.currentPageIdx}
        onSelectedChanged={handlePageIdxChanged}
      />
    );
  }
  return null;
});

const ViewerDocument = (props: Type) => {
  const { dataModule, handleScaleChanged, handlePageIdxChanged } = props;
  if (dataModule.pages) {
    const pages = dataModule.pages.map(page => {
      const { viewport } = page;
      return {
        cmp: (
          <JuiImageWithStatusView
            background={'paper'}
            src={page.url || ''}
            key={page.url}
          />
        ),
        getViewport: () => {
          return {
            height: viewport ? viewport.origHeight : 0,
            width: viewport ? viewport.origWidth : 0,
          };
        },
      };
    });
    return (
      <JuiViewerDocument
        pages={pages}
        data-test-automation-id="ViewerDocument"
        scale={dataModule.currentScale}
        pageIndex={dataModule.currentPageIdx}
        pageFit
        scrollBarPadding={LEFT_WIDTH}
        onScaleChange={handleScaleChanged}
        onCurrentPageIdxChanged={handlePageIdxChanged}
      />
    );
  }
  return null;
};

export { ViewerDocument, ThumbnailBar };
