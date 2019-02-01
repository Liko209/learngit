import { errorUtils } from 'foundation';
import { ERROR_CONDITIONS } from './constants';
import { ErrorParserHolder } from './ErrorParserHolder';

class Helper {
  isNetworkConnectionError(error: Error) {
    return errorUtils.errorConditionSelector(
      ErrorParserHolder.getErrorParser().parse(error),
      ERROR_CONDITIONS.NOT_NETWORK,
    );
  }

  isAuthenticationError(error: Error) {
    return errorUtils.errorConditionSelector(
      ErrorParserHolder.getErrorParser().parse(error),
      ERROR_CONDITIONS.NOT_AUTHORIZED,
    );
  }

  isBackEndError(error: Error) {
    return errorUtils.errorConditionSelector(
      ErrorParserHolder.getErrorParser().parse(error),
      ERROR_CONDITIONS.BACKEND_ERROR,
    );
  }
}

export default new Helper();
