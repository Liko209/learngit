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
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { HoverControllerViewModel } from '@/modules/common/container/Layout/HoverController';
import {
  ActiveVoicemailId,
  FetchVoicemailData,
  VoicemailFilterFunc,
  VoicemailFilterOptions,
  VoicemailProps,
  VoicemailViewProps,
} from './types';
import { INITIAL_COUNT } from './config';
import { VoicemailListHandler } from './VoicemailListHandler';
import { container } from 'framework/ioc';
import { PhoneStore } from '../../store';

class VoicemailViewModel extends HoverControllerViewModel<VoicemailProps>
  implements VoicemailViewProps {
  private _phoneStore: PhoneStore = container.get(PhoneStore);

  @observable
  isError = false;

  @observable
  filterFOCKey = '';

  @observable
  activeVoicemailId: ActiveVoicemailId = null;

  @observable
  private _filterValue = '';

  @observable
  private _handler: VoicemailListHandler;

  @observable
  private _filterFunc: VoicemailFilterFunc = null;

  @action
  onVoicemailPlay = (id: ActiveVoicemailId) => {
    this.activeVoicemailId = id;
  };

  constructor(props: any) {
    super(props);

    this._setHandler(this.getHandler());

    this.reaction(
      () => this._filterValue,
      async (filterKey: string) => {
        this._filterFunc = await this._service.buildFilterFunc({ filterKey });

        const handler = this.getHandler();

        await handler.fetchSortableDataListHandler.fetchData(
          QUERY_DIRECTION.NEWER,
          INITIAL_COUNT,
        );

        this._setFilterFOCKey(filterKey);

        this._setHandler(handler);
      },
    );

    this.reaction(
      () => getGlobalValue(GLOBAL_KEYS.INCOMING_CALL),
      () => this._pauseAllVoiceMail(),
    );
  }

  private _service = ServiceLoader.getInstance<VoicemailService>(
    ServiceConfig.VOICEMAIL_SERVICE,
  );

  getHandler() {
    return new VoicemailListHandler(this._fetchData, this._filterFunc);
  }

  @action
  private _setHandler(handler: VoicemailListHandler) {
    this._handler = handler;
  }

  @action
  private _setFilterFOCKey(key: string) {
    this.filterFOCKey = key;
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

    if (this._filterValue && this._filterFunc) {
      options.filterFunc = this._filterFunc;
    }

    try {
      return await this._service.fetchVoicemails(options);
    } catch (error) {
      this.isError = true;

      return { data: [], hasMore: true };
    }
  };

  @action
  onErrorReload = () => {
    this.isError = false;
  };

  @action
  onFilterChange: IJuiChangePhoneFilter = value => {
    this._filterValue = value;
  };

  private _pauseAllVoiceMail = () => {
    const audioCache = this._phoneStore.audioCache;
    if (audioCache.size !== 0) {
      audioCache.forEach(audio => {
        audio.media && audio.media.pause();
      });
    }
  };

  dispose() {
    super.dispose();
    this._pauseAllVoiceMail();
  }
}

export { VoicemailViewModel };
