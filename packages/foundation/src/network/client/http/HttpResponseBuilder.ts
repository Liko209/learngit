import NetworkResponseBuilder from '../NetworkResponseBuilder';
import HttpResponse from './HttpResponse';
import HttpRequest from './HttpRequest';

class HttpResponseBuilder extends NetworkResponseBuilder<HttpRequest> {
  static get builder() {
    return new HttpResponseBuilder();
  }

  build(): HttpResponse {
    return new HttpResponse(this);
  }
}

export default HttpResponseBuilder;
