import { MathService } from './service/MathService';
import { MATH_SERVICE } from './interface';

const config = {
  provides: [
    {
      name: MATH_SERVICE,
      value: MathService,
    },
  ],
};

export { config };
