/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-05-30 16:53:54
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, action, computed } from 'mobx';
import { QUERY_DIRECTION } from 'sdk/dao';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { VoicemailService } from 'sdk/module/RCItems/voicemail';
import { IJuiChangePhoneFilter } from 'jui/pattern/Phone/Filter';
import {
  FetchVoicemailData,
  VoicemailFilterFunc,
  VoicemailFilterOptions,
  VoicemailProps,
  VoicemailViewProps,
} from './types';
import { VoicemailListHandler } from './VoicemailListHandler';
import { HoverControllerViewModel } from '../HoverController';

class VoicemailViewModel extends HoverControllerViewModel<VoicemailProps>
  implements VoicemailViewProps {
  @observable
  isError = false;

  @observable
  filterValue = '';

  @observable
  _filterFunc: VoicemailFilterFunc = null;

  constructor(props: any) {
    super(props);

    this.reaction(
      () => this.filterValue,
      async filterKey => {
        this._filterFunc = await this._service.buildFilterFunc({ filterKey });
      },
    );
  }

  private _service = ServiceLoader.getInstance<VoicemailService>(
    ServiceConfig.VOICEMAIL_SERVICE,
  );

  @computed
  private get _handler() {
    return new VoicemailListHandler(this._fetchData, this._filterFunc);
  }

  @computed
  get listHandler() {
    return this._handler.fetchSortableDataListHandler;
  }

  @action
  private _fetchData: FetchVoicemailData = async (
    direction,
    pageSize,
    anchor,
  ) => {
    const realDirection =
      direction === QUERY_DIRECTION.NEWER
        ? QUERY_DIRECTION.OLDER
        : QUERY_DIRECTION.NEWER;

    const options: VoicemailFilterOptions = {
      limit: pageSize,
      direction: realDirection,
      anchorId: anchor && anchor.id,
    };

    if (this.filterValue && this._filterFunc) {
      options.filterFunc = this._filterFunc;
    }

    try {
      return await this._service.fetchVoicemails(options);
    } catch (error) {
      this.isError = true;

      return { data: [], hasMore: true };
    }
  }

  @action
  onErrorReload = () => {
    this.isError = false;
  }

  @action
  onFilterChange: IJuiChangePhoneFilter = value => {
    this.filterValue = value;
  }
}

export { VoicemailViewModel };
