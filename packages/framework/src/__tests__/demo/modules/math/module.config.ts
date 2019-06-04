import { ModuleConfig } from '../../../../types';
import { Jupiter } from '../../../../Jupiter';
import { MathService } from './service/MathService';
import { MATH_SERVICE } from './interface';

const config: ModuleConfig = {
  binding: (jupiter: Jupiter) => {
    jupiter.registerService(MATH_SERVICE, MathService);
  },
};

export { config };
