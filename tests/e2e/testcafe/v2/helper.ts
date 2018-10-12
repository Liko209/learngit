import 'testcafe';

class Helper {
  constructor(private t: TestController) {};
}

function h(t: TestController) {
  return new Helper(t);
}

export {Helper, h};
