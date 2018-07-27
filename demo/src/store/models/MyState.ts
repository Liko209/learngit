export default class MyStateModel {
  static fromJS(data: any) {
    const { away_status_history: awayStatusHistory = [] } = data;
    const model = {
      awayStatusHistory
    };

    return model;
  }
}
