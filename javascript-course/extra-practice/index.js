import { foundationsExtra } from './foundations.js';
import { controlExtra } from './control-flow.js';
import { functionsExtra } from './functions.js';
import { advancedExtra } from './advanced.js';

// Stable exercise IDs keep each optional draft separate from the required lesson.
export const extraByLesson = { ...foundationsExtra, ...controlExtra, ...functionsExtra, ...advancedExtra };
