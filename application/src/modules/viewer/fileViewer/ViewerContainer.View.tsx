/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-06-06 09:40:39
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo, SFC } from 'react';
import { JuiViewerSidebar, JuiViewerDocument } from 'jui/pattern/Viewer';
import { JuiViewerImg } from 'jui/pattern/Viewer/ViewerTitle';

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
    const items = dataModule.pages.map((page, i) => {
      return <JuiViewerImg src={page.url} key={i} />;
    });
    return (
      <JuiViewerSidebar
        open={true}
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
    const pages = dataModule.pages.map((page, i) => {
      const { viewport } = page;
      return {
        cmp: <JuiViewerImg src={page.url} key={`${i}${page.url}`} />,
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
        scale={dataModule.currentScale}
        pageIndex={dataModule.currentPageIdx}
        pageFit={true}
        scrollBarPadding={LEFT_WIDTH}
        onScaleChange={handleScaleChanged}
        onCurrentPageIdxChanged={handlePageIdxChanged}
      />
    );
  }
  return null;
};

export { ViewerDocument, ThumbnailBar };
