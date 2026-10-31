import { addFoundations } from './foundations.js';
import { addDataChallenges } from './data.js';
import { addCollectionChallenges } from './collections.js';
import { addAlgorithmChallenges } from './algorithms.js';
import { addAdvancedChallenges } from './advanced.js';

export const PROBLEM_LEVELS = [
  'Values & decisions', 'Loops & arrays', 'Strings & functions', 'Objects & records',
  'Nested data', 'State & collections', 'Recursion & graphs', 'Algorithms & search',
  'Asynchronous debugging', 'Integrated systems',
];
const list = [];
addFoundations(list);
addDataChallenges(list);
addCollectionChallenges(list);
addAlgorithmChallenges(list);
addAdvancedChallenges(list);
// Within each topic level, begin with the shorter programs before longer ones.
list.sort((a, b) => a.level - b.level || a.starter.split('\n').length - b.starter.split('\n').length);
export const PROBLEM_CHALLENGES = list.map((challenge, index) => ({
  ...challenge, number: index + 1, id: `problem-${String(index + 1).padStart(3, '0')}`,
}));
