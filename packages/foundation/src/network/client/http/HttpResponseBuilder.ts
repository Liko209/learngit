import NetworkResponseBuilder from '../NetworkResponseBuilder';
import HttpResponse from './HttpResponse';

class HttpResponseBuilder extends NetworkResponseBuilder {
  build(): HttpResponse {
    return new HttpResponse(this);
  }
}

export default HttpResponseBuilder;
