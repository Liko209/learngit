/*
 * @Author: doyle.wu
 * @Date: 2019-07-05 09:27:33
 */
import { Config } from '../../config';

class DashboardMetricItemConfig {
  name: string;
  url: string;
  apiGoal: number;
}

class DashboardSceneConfig {
  name: string;
  gatherer: string;
  memoryUrl: string;
  k: number;
  b: number;
  metric: { [key: string]: DashboardMetricItemConfig };
}

class FlagConfig {
  warning: string;
  block: string;
  pass: string;
}

class DashboardConfig {
  colors: FlagConfig = {
    warning: "#f9d45c",
    block: "#ef8c8c",
    pass: "#9cc177"
  };
  icons: FlagConfig = {
    warning: ":warning:",
    block: ":x:",
    pass: ":white_check_mark:"
  };
  lodingTimeUrl: string = "http://xmn145.rcoffice.ringcentral.com:9005/question/140";
  scenes: { [key: string]: DashboardSceneConfig } = {
    "SwitchConversationScene": {
      "name": "SwitchConversationScene",
      "gatherer": "SwitchConversationGatherer",
      "memoryUrl": "http://xmn145.rcoffice.ringcentral.com:9005/question/57",
      "k": 3,
      "b": 700,
      "metric": {
        "goto_conversation_fetch_items": {
          "name": "goto_conversation_fetch_items",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/50",
          "apiGoal": 1000
        },
        "goto_conversation_fetch_posts": {
          "name": "goto_conversation_fetch_posts",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/101",
          "apiGoal": 1000
        },
        "conversation_fetch_from_db": {
          "name": "conversation_fetch_from_db",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/102",
          "apiGoal": 1000
        },
        "ui_message_render": {
          "name": "ui_message_render",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/209",
          "apiGoal": 1000
        },
        "ui_profile_render": {
          "name": "ui_profile_render",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/210",
          "apiGoal": 1000
        },
        "goto_conversation_shelf_fetch_items": {
          "name": "goto_conversation_shelf_fetch_items",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/210",
          "apiGoal": 1000
        },
        "init_group_members": {
          "name": "init_group_members",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/291",
          "apiGoal": 1000
        },
      }
    },
    "SearchScene": {
      "name": "SearchScene",
      "gatherer": "SearchGatherer",
      "memoryUrl": "http://xmn145.rcoffice.ringcentral.com:9005/question/125",
      "k": 3,
      "b": 700,
      "metric": {
        "search_group": {
          "name": "search_group",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/51",
          "apiGoal": 2000
        },
        "search_people": {
          "name": "search_people",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/52",
          "apiGoal": 2000
        },
        "search_team": {
          "name": "search_team",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/53",
          "apiGoal": 2000
        },
        "search_post": {
          "name": "search_post",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/207",
          "apiGoal": 2000
        },
        "ui_globalsearch_tab_render": {
          "name": "ui_globalsearch_tab_render",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/208",
          "apiGoal": 2000
        },
        "scroll_search_post": {
          "name": "scroll_search_post",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/289",
          "apiGoal": 2000
        }
      }
    },
    "FetchGroupScene": {
      "name": "FetchGroupScene",
      "gatherer": "FetchGroupGatherer",
      "memoryUrl": "http://xmn145.rcoffice.ringcentral.com:9005/question/126",
      "k": 3,
      "b": 700,
      "metric": {
        "group_section_fetch_teams": {
          "name": "group_section_fetch_teams",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/54",
          "apiGoal": 2000
        },
        "group_section_fetch_favorites": {
          "name": "group_section_fetch_favorites",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/55",
          "apiGoal": 2000
        },
        "group_section_fetch_direct_messages": {
          "name": "group_section_fetch_direct_messages",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/56",
          "apiGoal": 2000
        }
      }
    },
    "IndexDataScene": {
      "name": "IndexDataScene",
      "gatherer": "IndexDataGatherer",
      "memoryUrl": "http://xmn145.rcoffice.ringcentral.com:9005",
      "k": 3,
      "b": 700,
      "metric": {
        "handle_initial_incoming_account": {
          "name": "handle_initial_incoming_account",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/141",
          "apiGoal": 2000
        },
        "handle_remaining_incoming_account": {
          "name": "handle_remaining_incoming_account",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/181",
          "apiGoal": 2000
        },
        "handle_index_incoming_account": {
          "name": "handle_index_incoming_account",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/182",
          "apiGoal": 2000
        },
        "handle_initial_incoming_company": {
          "name": "handle_initial_incoming_company",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/142",
          "apiGoal": 2000
        },
        "handle_remaining_incoming_company": {
          "name": "handle_remaining_incoming_company",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/183",
          "apiGoal": 2000
        },
        "handle_index_incoming_company": {
          "name": "handle_index_incoming_company",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/184",
          "apiGoal": 2000
        },
        "handle_initial_incoming_item": {
          "name": "handle_initial_incoming_item",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/143",
          "apiGoal": 2000
        },
        "handle_remaining_incoming_item": {
          "name": "handle_remaining_incoming_item",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/185",
          "apiGoal": 2000
        },
        "handle_index_incoming_item": {
          "name": "handle_index_incoming_item",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/186",
          "apiGoal": 2000
        },
        "handle_initial_incoming_presence": {
          "name": "handle_initial_incoming_presence",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/144",
          "apiGoal": 2000
        },
        "handle_remaining_incoming_presence": {
          "name": "handle_remaining_incoming_presence",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/187",
          "apiGoal": 2000
        },
        "handle_index_incoming_presence": {
          "name": "handle_index_incoming_presence",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/188",
          "apiGoal": 2000
        },
        "handle_initial_incoming_state": {
          "name": "handle_initial_incoming_state",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/145",
          "apiGoal": 2000
        },
        "handle_remaining_incoming_state": {
          "name": "handle_remaining_incoming_state",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/189",
          "apiGoal": 2000
        },
        "handle_index_incoming_state": {
          "name": "handle_index_incoming_state",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/190",
          "apiGoal": 2000
        },
        "handle_initial_incoming_profile": {
          "name": "handle_initial_incoming_profile",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/146",
          "apiGoal": 2000
        },
        "handle_remaining_incoming_profile": {
          "name": "handle_remaining_incoming_profile",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/191",
          "apiGoal": 2000
        },
        "handle_index_incoming_profile": {
          "name": "handle_index_incoming_profile",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/192",
          "apiGoal": 2000
        },
        "handle_initial_incoming_person": {
          "name": "handle_initial_incoming_person",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/147",
          "apiGoal": 2000
        },
        "handle_remaining_incoming_person": {
          "name": "handle_remaining_incoming_person",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/193",
          "apiGoal": 2000
        },
        "handle_index_incoming_person": {
          "name": "handle_index_incoming_person",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/194",
          "apiGoal": 2000
        },
        "handle_initial_incoming_group": {
          "name": "handle_initial_incoming_group",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/148",
          "apiGoal": 2000
        },
        "handle_remaining_incoming_group": {
          "name": "handle_remaining_incoming_group",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/195",
          "apiGoal": 2000
        },
        "handle_index_incoming_group": {
          "name": "handle_index_incoming_group",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/196",
          "apiGoal": 2000
        },
        "handle_initial_incoming_post": {
          "name": "handle_initial_incoming_post",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/149",
          "apiGoal": 2000
        },
        "handle_remaining_incoming_post": {
          "name": "handle_remaining_incoming_post",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/197",
          "apiGoal": 2000
        },
        "handle_index_incoming_post": {
          "name": "handle_index_incoming_post",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/198",
          "apiGoal": 2000
        },
        "handle_index_data": {
          "name": "handle_index_data",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/150",
          "apiGoal": 2000
        },
        "handle_remaining_data": {
          "name": "handle_remaining_data",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/151",
          "apiGoal": 2000
        },
        "handle_initial_data": {
          "name": "handle_initial_data",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/152",
          "apiGoal": 2000
        },
        "first_login": {
          "name": "first_login",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/292",
          "apiGoal": 2000
        },
        "prepare_person_cache": {
          "name": "prepare_person_cache",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/293",
          "apiGoal": 2000
        },
        "conversation_handle_data_from_server": {
          "name": "conversation_handle_data_from_server",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/294",
          "apiGoal": 2000
        },
        "conversation_fetch_from_server": {
          "name": "conversation_fetch_from_server",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/295",
          "apiGoal": 2000
        },
        "load_phone_parser": {
          "name": "load_phone_parser",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/296",
          "apiGoal": 2000
        },
        "init_phone_parser": {
          "name": "init_phone_parser",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/297",
          "apiGoal": 2000
        },
      }
    },
    "SearchPhoneScene": {
      "name": "SearchPhoneScene",
      "gatherer": "SearchPhoneGatherer",
      "memoryUrl": "http://xmn145.rcoffice.ringcentral.com:9005",
      "k": 3,
      "b": 700,
      "metric": {
        "search_phone_number": {
          "name": "search_phone_number",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/180",
          "apiGoal": 2000
        }
      }
    },
    "CallLogScene": {
      "name": "CallLogScene",
      "gatherer": "CallLogGatherer",
      "memoryUrl": "http://xmn145.rcoffice.ringcentral.com:9005",
      "k": 3,
      "b": 700,
      "metric": {
        "filter_and_sort_call_log": {
          "name": "filter_and_sort_call_log",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/199",
          "apiGoal": 2000
        },
        "filter_and_sort_voicemail": {
          "name": "filter_and_sort_voicemail",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/253",
          "apiGoal": 2000
        },
        "fetch_call_log": {
          "name": "fetch_call_log",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/200",
          "apiGoal": 2000
        },
        "fetch_call_log_from_db": {
          "name": "fetch_call_log_from_db",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/201",
          "apiGoal": 2000
        },
        "fetch_voicemails": {
          "name": "fetch_voicemails",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/202",
          "apiGoal": 2000
        },
        "fetch_voicemails_from_db": {
          "name": "fetch_voicemails_from_db",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/203",
          "apiGoal": 2000

        },
        "init_rc_message_badge": {
          "name": "init_rc_message_badge",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/204",
          "apiGoal": 2000

        },
        "delete_rc_message": {
          "name": "delete_rc_message",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/205",
          "apiGoal": 2000

        },
        "delete_rc_message_from_server": {
          "name": "delete_rc_message_from_server",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/206",
          "apiGoal": 2000
        },
        "fetch_recent_call_logs": {
          "name": "fetch_recent_call_logs",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/254",
          "apiGoal": 2000
        },
        "delete_call_log": {
          "name": "delete_call_log",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/255",
          "apiGoal": 2000
        },
        "delete_call_log_from_server": {
          "name": "delete_call_log_from_server",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/256",
          "apiGoal": 2000
        },

      }
    },
    "DocViewerScene": {
      "name": "DocViewerScene",
      "gatherer": "DocViewerGatherer",
      "memoryUrl": "http://xmn145.rcoffice.ringcentral.com:9005",
      "k": 3,
      "b": 700,
      "metric": {
        "ui_viewer_page_render": {
          "name": "ui_viewer_page_render",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/385",
          "apiGoal": 2000
        }
      }
    },
    "ImageViewerScene": {
      "name": "ImageViewerScene",
      "gatherer": "ImageViewerGatherer",
      "memoryUrl": "http://xmn145.rcoffice.ringcentral.com:9005",
      "k": 3,
      "b": 700,
      "metric": {
        "ui_image_viewer_page_render": {
          "name": "ui_image_viewer_page_render",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/386",
          "apiGoal": 2000
        },
        "ui_image_viewer_image_render": {
          "name": "ui_image_viewer_image_render",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/387",
          "apiGoal": 2000
        }
      }
    },
    "SearchForShareScene": {
      "name": "SearchForShareScene",
      "gatherer": "SearchForShareGatherer",
      "memoryUrl": "http://xmn145.rcoffice.ringcentral.com:9005",
      "k": 3,
      "b": 700,
      "metric": {
        "search_all_group": {
          "name": "search_all_group",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/417",
          "apiGoal": 2000
        },
        "SEARCH_PERSONS_GROUPS": {
          "name": "SEARCH_PERSONS_GROUPS",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/418",
          "apiGoal": 2000
        }
      }
    },
  };

  constructor() {
    const metric = this.scenes['SwitchConversationScene'].metric;
    const keys = Object.keys(metric);
    const cfgKyes = Object.keys(Config.switchConversationIds);
    let item: DashboardMetricItemConfig, _item: DashboardMetricItemConfig;
    for (let key of keys) {
      item = metric[key];

      for (let k of cfgKyes) {
        _item = Object.assign({}, item);
        _item.name = [key, k].join('_');
        metric[_item.name] = _item;
      }
    }
  }
}

export {
  DashboardConfig,
  DashboardMetricItemConfig
}
