import NetworkResponseBuilder from '../NetworkResponseBuilder';
import HttpResponse from './HttpResponse';

class HttpResponseBuilder extends NetworkResponseBuilder {
  static get builder() {
    return new HttpResponseBuilder();
  }

  build(): HttpResponse {
    return new HttpResponse(this);
  }
}

export default HttpResponseBuilder;
