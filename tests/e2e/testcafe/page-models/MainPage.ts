/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-21 16:35:03
 * Copyright © RingCentral. All rights reserved.
 */
import { ReactSelector } from 'testcafe-react-selectors';
import { BasePage } from './BasePage';

const favoriteSection = ReactSelector('FavoriteSection');
const favoriteSectionHeader = favoriteSection.findReact('ConversationListSectionHeader');
const favoriteSectionCollapse = favoriteSection.findReact('Collapse');

class MainPage extends BasePage {
  favoriteSection: Selector = favoriteSection;
  favoriteSectionHeader: Selector = favoriteSectionHeader;
  favoriteSectionCollapse: Selector = favoriteSectionCollapse;
}

export { MainPage };
