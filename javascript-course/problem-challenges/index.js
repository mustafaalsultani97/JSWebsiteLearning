import { addFoundations } from './foundations.js';
import { addDataChallenges } from './data.js';
import { addCollectionChallenges } from './collections.js';
import { addAlgorithmChallenges } from './algorithms.js';
import { addAdvancedChallenges } from './advanced.js';
import { PROBLEM_ORDER } from './order.js';

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
// Length edits must not move a saved draft to a different challenge.
list.sort((a, b) => PROBLEM_ORDER.indexOf(a.title) - PROBLEM_ORDER.indexOf(b.title));
export const PROBLEM_CHALLENGES = list.map((challenge, index) => ({
  ...challenge, number: index + 1, id: `problem-${String(index + 1).padStart(3, '0')}`,
}));
