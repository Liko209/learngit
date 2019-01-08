import { errorUtils } from 'foundation';
import { ERROR_CONDITIONS } from './constants';
import { ErrorParserHolder } from './ErrorParserHolder';

class Helper {
  isNotNetworkError(error: Error) {
    return errorUtils.errorConditionSelector(ErrorParserHolder.getErrorParser().parse(error), ERROR_CONDITIONS.NOT_NETWORK);
  }

  isNotAuthorizedError(error: Error) {
    return errorUtils.errorConditionSelector(ErrorParserHolder.getErrorParser().parse(error), ERROR_CONDITIONS.NOT_AUTHORIZED);
  }

  isBackEndError(error: Error) {
    return errorUtils.errorConditionSelector(ErrorParserHolder.getErrorParser().parse(error), ERROR_CONDITIONS.BACKEND_ERROR);
  }
}

export default new Helper();
