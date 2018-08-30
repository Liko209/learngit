export default class ProfileModel {
  static fromJS(data: any) {
    const { favorite_post_ids: favoritePostIds = [] } = data;
    const model = {
      favoritePostIds,
    };

    return model;
  }
}
