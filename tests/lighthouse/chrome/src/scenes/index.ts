/*
 * @Author: doyle.wu
 * @Date: 2018-12-11 16:52:10
 */
import { Scene } from "./scene";
import { LighthouseScene } from "./lighthouseScene";
import { IndependenceScene } from "./independenceScene";
import { LoginScene } from "./loginScene";
import { OfflineScene } from "./offlineScene";
import { RefreshScene } from "./refreshScene";
import { SwitchConversationScene } from "./switchConversationScene";
import { SearchScene } from "./searchScene";
import { FetchGroupScene } from "./fetchGroupScene";
import { IndexDataScene } from "./indexDataScene";
import { SearchPhoneScene } from "./searchPhoneScene";
import { CallLogScene } from './callLogScene';
import { SettingScene } from './settingScene';
import { DocViewerScene } from './docViewerScene';
import { ImageViewerScene } from './imageViewerScene';
import { SearchForShareScene } from './searchForShareScene';

const scenes = {
  LoginScene,
  OfflineScene,
  RefreshScene,
  SwitchConversationScene,
  SearchScene,
  IndexDataScene,
  FetchGroupScene,
  SearchPhoneScene,
  CallLogScene,
  SettingScene,
  DocViewerScene,
  SearchForShareScene,
  // ImageViewerScene
}

export {
  Scene,
  LighthouseScene,
  IndependenceScene,
  scenes
};
