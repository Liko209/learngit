import NetworkResponseBuilder from '../NetworkResponseBuilder';
import Response from './Response';

class HttpResponseBuilder extends NetworkResponseBuilder {
  build(): Response {
    return new Response(this);
  }
}

export default HttpResponseBuilder;
