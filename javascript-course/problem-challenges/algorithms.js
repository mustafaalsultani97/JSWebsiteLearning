import { addChallenge } from './helpers.js';
export function addAlgorithmChallenges(list) {
  const add = (level, ...args) => addChallenge(list, level, ...args);
  add(6, 'Sum all numeric leaves', 'Recursively sum numbers in nested arrays. Ignore strings, booleans and null.', String.raw`
function solve(tree) {
  function visit(node) {
    if (typeof node === 'number') {
      return node;
    }
    if (!Array.isArray(node)) {
      return 0;
    }
    let total = 0;
    for (const child of node) {
      total += visit(child);
    }
    return total;
  }
  const total = visit(tree);
  return { total };
}`, [['total += visit(child);','total += typeof child === \'number\' ? child : 0;']], [[[[1,[2,[3]]],4],{total:10},'Deep nesting'],[['5',null,true,-2],{total:-2},'Ignore nonnumbers'],[[],{total:0},'Empty tree']], 'The same function must handle each child, including another array.', 'Recursion handles arrays at any depth. Adding only direct numeric children skips numbers inside nested arrays.');
  add(6, 'Measure tree depth', 'A node has children in an array. Return the number of nodes on the longest root-to-leaf path; null has depth zero.', String.raw`
function solve(root) {
  function depth(node) {
    if (node === null) {
      return 0;
    }
    const children = node.children ?? [];
    let deepest = 0;
    for (const child of children) {
      const childDepth = depth(child);
      deepest = Math.max(deepest, childDepth);
    }
    return deepest + 1;
  }
  const result = depth(root);
  return result;
}`, [['return deepest + 1;','return deepest;']], [[{children:[{children:[{}]},{}]},3,'Uneven branches'],[{},1,'Leaf node'],[null,0,'Missing root']], 'Each recursive level contributes its own node.', 'The deepest child depth excludes the current node. Add one when returning, with null as the zero-depth base case.');
  add(6, 'Find a path through a tree', 'Return the first root-to-target ID path, or null. Children are searched from left to right.', String.raw`
function solve(request) {
  function find(node, path) {
    const next = [...path, node.id];
    if (node.id === request.target) {
      return next;
    }
    for (const child of node.children ?? []) {
      const found = find(child, next);
      if (found !== null) {
        return found;
      }
    }
    return null;
  }
  if (!request.root) {
    return null;
  }
  return find(request.root, []);
}`, [['const next = [...path, node.id];','const next = [node.id];']], [[{root:{id:'a',children:[{id:'b',children:[{id:'c'}]}]},target:'c'},['a','b','c'],'Deep target'],[{root:{id:'a'},target:'a'},['a'],'Root target'],[{root:{id:'a'},target:'z'},null,'Missing target']], 'Extend the existing path instead of starting over at each node.', 'Copy the ancestor path and append the current ID. Separate copies prevent sibling searches from changing one another.');
  add(6, 'Repair binary search', 'Search an ascending numeric array and return the matching index or -1. Inputs have distinct values.', String.raw`
function solve(request) {
  const values = request.values;
  let low = 0;
  let high = values.length - 1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const value = values[middle];
    if (value === request.target) {
      return middle;
    }
    if (value < request.target) {
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }
  return -1;
}`, [['while (low <= high)', 'while (low < high)']], [[{values:[1,3,5,7],target:7},3,'Final candidate'],[{values:[4],target:4},0,'Only candidate'],[{values:[1,3],target:2},-1,'Absent target']], 'A range containing one remaining item still needs a check.', 'The bounds are inclusive, so low equal to high represents one valid candidate. Stop only once low exceeds high.');
  add(6, 'Flatten recursively', 'Flatten arrays at any depth while preserving all non-array values and their order.', String.raw`
function solve(input) {
  const output = [];
  function visit(values) {
    for (const value of values) {
      if (Array.isArray(value)) {
        visit(value);
      } else {
        output.push(value);
      }
    }
  }
  visit(input);
  return {
    values: output,
    count: output.length
  };
}`, [['visit(value);','output.push(value);']], [[[[1,[2]],3],{values:[1,2,3],count:3},'Nested arrays'],[[0,[false,[null]]],{values:[0,false,null],count:3},'Falsy leaves'],[[[],[]],{values:[],count:0},'Empty branches']], 'An array child requires another visit, not a direct append.', 'Recursively traverse array children and append only leaves. This preserves depth-first left-to-right order.');
  add(6, 'Traverse a graph with cycles', 'Return unique nodes in depth-first order from start, visiting neighbors in their given order.', String.raw`
function solve(request) {
  const seen = new Set();
  const order = [];
  function visit(node) {
    if (seen.has(node)) {
      return;
    }
    seen.add(node);
    order.push(node);
    for (const neighbor of request.graph[node] ?? []) {
      visit(neighbor);
    }
  }
  visit(request.start);
  return {
    order,
    count: seen.size
  };
}`, [['seen.add(node);','// TODO: mark this node before following its neighbors.']], [[{graph:{a:['b','c'],b:['a'],c:['b']},start:'a'},{order:['a','b','c'],count:3},'Cycle and shared neighbor'],[{graph:{x:['x']},start:'x'},{order:['x'],count:1},'Self-loop'],[{graph:{},start:'z'},{order:['z'],count:1},'Isolated node']], 'A node must be marked before recursive calls can return to it.', 'Marking on entry prevents cycles from recursing forever and prevents shared neighbors from appearing twice.');
  add(6, 'Find shortest unweighted distances', 'Return [node, distance] pairs in breadth-first discovery order from start.', String.raw`
function solve(request) {
  const distances = new Map([[request.start, 0]]);
  const queue = [request.start];
  let head = 0;
  while (head < queue.length) {
    const node = queue[head++];
    const distance = distances.get(node);
    for (const neighbor of request.graph[node] ?? []) {
      if (distances.has(neighbor)) {
        continue;
      }
      distances.set(neighbor, distance + 1);
      queue.push(neighbor);
    }
  }
  const result = [...distances.entries()];
  return result;
}`, [['distance + 1','distance']], [[{graph:{a:['b','c'],b:['d'],c:['d'],d:['a']},start:'a'},[['a',0],['b',1],['c',1],['d',2]],'Layers and a cycle'],[{graph:{a:[]},start:'a'},[['a',0]],'Start alone'],[{graph:{a:['b'],b:['c']},start:'a'},[['a',0],['b',1],['c',2]],'Chain']], 'Crossing one edge adds one to the path length.', 'Breadth-first discovery visits shortest paths first. Assign the neighbor its parent distance plus one and mark it before enqueuing.');
  add(6, 'Generate subsets with backtracking', 'Return all subsets in exclude-then-include recursive order. Treat equal values at different positions as separate choices.', String.raw`
function solve(values) {
  const result = [];
  const chosen = [];
  function visit(index) {
    if (index === values.length) {
      result.push([...chosen]);
      return;
    }
    visit(index + 1);
    chosen.push(values[index]);
    visit(index + 1);
    chosen.pop();
  }
  visit(0);
  return {
    subsets: result,
    count: result.length
  };
}`, [['chosen.pop();','// TODO: undo the choice before returning to the caller.']], [[[1,2],{subsets:[[],[2],[1],[1,2]],count:4},'Two decisions'],[[3],{subsets:[[],[3]],count:2},'One decision'],[[],{subsets:[[]],count:1},'Empty subset']], 'Every push in one branch needs a matching undo afterward.', 'Backtracking removes the last choice before exploring another branch. Saved subsets are copies so later mutations do not alter them.');
  add(6, 'Merge two sorted lists', 'Merge ascending arrays into one ascending array, preserving duplicates.', String.raw`
function solve(request) {
  const left = request.left;
  const right = request.right;
  const merged = [];
  let a = 0;
  let b = 0;
  while (a < left.length && b < right.length) {
    if (left[a] <= right[b]) {
      merged.push(left[a++]);
    } else {
      merged.push(right[b++]);
    }
  }
  while (a < left.length) merged.push(left[a++]);
  while (b < right.length) merged.push(right[b++]);
  return merged;
}`, [['while (b < right.length) merged.push(right[b++]);','// TODO: append any remaining values from the right list.']], [[{left:[1,3],right:[2,4,5]},[1,2,3,4,5],'Right remainder'],[{left:[],right:[2]},[2],'Empty left'],[{left:[1,1],right:[1]},[1,1,1],'Duplicate values']], 'The main loop stops as soon as either list runs out.', 'After pairwise merging, append the remainder from both sides. One list can still contain multiple unconsumed values.');
  add(6, 'Memoize a recurrence correctly', 'Return Fibonacci(n) and the number of non-base calculations. F(0)=0 and F(1)=1; each larger n should be calculated once.', String.raw`
function solve(n) {
  const cache = new Map([[0, 0], [1, 1]]);
  let calculations = 0;
  function fib(value) {
    if (cache.has(value)) {
      return cache.get(value);
    }
    calculations += 1;
    const result = fib(value - 1) + fib(value - 2);
    cache.set(value, result);
    return result;
  }
  const value = fib(n);
  return {
    value,
    calculations
  };
}`, [['cache.set(value, result);','// TODO: save this result before returning.']], [[6,{value:8,calculations:5},'Reuse subproblems'],[2,{value:1,calculations:1},'First non-base case'],[0,{value:0,calculations:0},'Base case']], 'Checking the cache is useful only if new results are stored.', 'Memoization records every newly calculated Fibonacci value, avoiding repeated recursive work for the same argument.');

  add(7, 'Count coin combinations', 'Count ways to make amount using unlimited coins of distinct positive values. Order does not create a different combination.', String.raw`
function solve(request) {
  const amount = request.amount;
  const ways = Array(amount + 1).fill(0);
  ways[0] = 1;
  for (const coin of request.coins) {
    for (let total = coin; total <= amount; total++) {
      ways[total] += ways[total - coin];
    }
  }
  const combinations = ways[amount];
  return {
    combinations,
    table: ways
  };
}`, [['ways[0] = 1;','ways[0] = 0;']], [[{coins:[1,2],amount:4},{combinations:3,table:[1,1,2,2,3]},'Repeated coins'],[{coins:[2],amount:3},{combinations:0,table:[1,0,1,0]},'Unreachable amount'],[{coins:[],amount:0},{combinations:1,table:[1]},'Empty combination']], 'There is exactly one way to make zero: choose no coins.', 'The base value seeds every later combination. Keeping coin iteration outside amount iteration avoids counting different orders separately.');
  add(7, 'Count paths around obstacles', 'Count paths from the top-left to bottom-right of a rectangular grid, moving only right or down. A 1 is blocked and a 0 is open.', String.raw`
function solve(grid) {
  if (!grid.length || !grid[0].length) {
    return 0;
  }
  const width = grid[0].length;
  const paths = Array(width).fill(0);
  paths[0] = 1;
  for (const row of grid) {
    for (let column = 0; column < width; column++) {
      if (row[column] === 1) {
        paths[column] = 0;
      } else if (column > 0) {
        paths[column] += paths[column - 1];
      }
    }
  }
  return paths[width - 1];
}`, [['paths[column] = 0;','// TODO: a blocked cell has no paths into it.']], [[[[0,0,0],[0,1,0],[0,0,0]],2,'Middle obstacle'],[[[1,0],[0,0]],0,'Blocked start'],[[[0]],1,'One open cell']], 'An obstacle must erase the count previously stored for its column.', 'The rolling array stores paths from above; the left neighbor contributes paths from the current row. A blocked cell resets its count to zero.');
  add(7, 'Query a prefix sum', 'For each [start,end] query, sum values from start inclusive to end exclusive.', String.raw`
function solve(request) {
  const prefix = [0];
  for (const value of request.values) {
    const previous = prefix[prefix.length - 1];
    prefix.push(previous + value);
  }
  const answers = [];
  for (const [start, end] of request.queries) {
    const before = prefix[start];
    const throughEnd = prefix[end];
    answers.push(throughEnd - before);
  }
  return {
    answers,
    prefix
  };
}`, [['throughEnd - before','throughEnd + before']], [[{values:[2,4,6],queries:[[0,3],[1,3],[2,2]]},{answers:[12,10,0],prefix:[0,2,6,12]},'Half-open ranges'],[{values:[-2,3],queries:[[0,1],[1,2]]},{answers:[-2,3],prefix:[0,-2,1]},'Negative value'],[{values:[],queries:[[0,0]]},{answers:[0],prefix:[0]},'Empty range']], 'Remove the total before start from the total before end.', 'Prefix sums include everything before a boundary. Subtracting the earlier boundary isolates the requested half-open range.');
  add(7, 'Find the longest unique window', 'Return the length of the longest substring without repeated basic Latin characters.', String.raw`
function solve(text) {
  const last = new Map();
  let left = 0;
  let best = 0;
  for (let right = 0; right < text.length; right++) {
    const character = text[right];
    if (last.has(character)) {
      left = Math.max(left, last.get(character) + 1);
    }
    last.set(character, right);
    const length = right - left + 1;
    best = Math.max(best, length);
  }
  return best;
}`, [['Math.max(left, last.get(character) + 1)','last.get(character) + 1']], [['abba',2,'Do not move left backward'],['abcabcbb',3,'Repeated windows'],['',0,'Empty string']], 'A previously seen character may lie before the current window.', 'Move left forward only. Math.max prevents an old occurrence from expanding the window backward and reintroducing duplicates.');
  add(7, 'Merge overlapping intervals', 'Return merged [start,end] intervals sorted by start. Touching endpoints count as overlapping.', String.raw`
function solve(intervals) {
  const sorted = intervals.map(pair => [...pair]);
  sorted.sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const interval of sorted) {
    const last = merged[merged.length - 1];
    if (!last || interval[0] > last[1]) {
      merged.push(interval);
    } else {
      last[1] = Math.max(last[1], interval[1]);
    }
  }
  return {
    intervals: merged,
    count: merged.length
  };
}`, [['Math.max(last[1], interval[1])','interval[1]']], [[[[1,10],[2,3]],{intervals:[[1,10]],count:1},'Contained interval'],[[[5,7],[1,3],[3,6]],{intervals:[[1,7]],count:1},'Touching and unsorted'],[[],{intervals:[],count:0},'No intervals']], 'A contained interval must not shorten the current merged endpoint.', 'Use the maximum end when merging. Sorting starts first ensures each interval can be compared with the latest merged interval.');
  add(7, 'Find a lower bound', 'Return the first index whose value is at least target, or length when all values are smaller.', String.raw`
function solve(request) {
  const values = request.values;
  let low = 0;
  let high = values.length;
  const target = request.target;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (values[middle] < target) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }
  return {
    index: low,
    found: low < values.length && values[low] === target
  };
}`, [['values[middle] < target','values[middle] <= target']], [[{values:[1,2,2,4],target:2},{index:1,found:true},'First equal value'],[{values:[1,3],target:2},{index:1,found:false},'Insertion point'],[{values:[],target:5},{index:0,found:false},'Empty input']], 'An equal value may be the answer or have an earlier equal neighbor.', 'Keep equality in the left search half by moving high to middle. Moving low past equality computes an upper bound instead.');
  add(7, 'Order dependencies before tasks', 'Return dependencies before their dependents using depth-first order over the requested task list. Return null for a cycle.', String.raw`
function solve(request) {
  const visiting = new Set();
  const done = new Set();
  const order = [];
  function visit(task) {
    if (visiting.has(task)) return false;
    if (done.has(task)) return true;
    visiting.add(task);
    for (const dependency of request.graph[task] ?? []) {
      if (!visit(dependency)) return false;
    }
    visiting.delete(task);
    done.add(task);
    order.push(task);
    return true;
  }
  for (const task of request.tasks) {
    if (!visit(task)) return null;
  }
  return order;
}`, [['visiting.delete(task);','// TODO: this task has left the active recursion path.']], [[{graph:{app:['a','b'],a:['base'],b:['base']},tasks:['app']},['base','a','b','app'],'Shared dependency'],[{graph:{a:['b'],b:['a']},tasks:['a']},null,'Real cycle'],[{graph:{},tasks:['x','x']},['x'],'Duplicate request']], 'Being on the current path is different from already being completed.', 'Remove a task from visiting once its dependencies finish. Otherwise a completed shared dependency looks like a cycle.');
  add(7, 'Compute edit distance', 'Return the minimum single-character insertions, deletions and replacements needed to transform one basic Latin string into another.', String.raw`
function solve(request) {
  const a = request.from;
  const b = request.to;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let row = 1; row <= a.length; row++) {
    const current = [row];
    for (let column = 1; column <= b.length; column++) {
      const cost = a[row - 1] === b[column - 1] ? 0 : 1;
      const remove = previous[column] + 1;
      const insert = current[column - 1] + 1;
      const replace = previous[column - 1] + cost;
      current[column] = Math.min(remove, insert, replace);
    }
    previous = current;
  }
  return previous[b.length];
}`, [['a[row - 1] === b[column - 1] ? 0 : 1','a[row - 1] === b[column - 1] ? 1 : 0']], [[{from:'kitten',to:'sitting'},3,'Mixed edits'],[{from:'same',to:'same'},0,'No changes'],[{from:'',to:'abc'},3,'Insert everything']], 'Matching characters have no replacement cost.', 'The diagonal transition costs zero on a match and one on a mismatch. Insertions and deletions always cost one.');
  add(7, 'Track connected components', 'Start with n isolated nodes numbered 0 through n-1. Union every pair and return the number of components.', String.raw`
function solve(request) {
  const parent = Array.from({ length: request.n }, (_, i) => i);
  let components = request.n;
  function find(node) {
    if (parent[node] !== node) {
      parent[node] = find(parent[node]);
    }
    return parent[node];
  }
  for (const [a, b] of request.edges) {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) {
      parent[rootB] = rootA;
      components -= 1;
    }
  }
  return components;
}`, [['parent[rootB] = rootA;','// TODO: join the two roots before counting the merge.']], [[{n:4,edges:[[0,1],[1,2],[0,2]]},2,'Repeated connectivity'],[{n:2,edges:[[0,1],[0,1]]},1,'Duplicate edge'],[{n:3,edges:[]},3,'No edges']], 'The parent structure must record the union so later edges see it.', 'Connect one root to the other and decrement only for distinct roots. Repeated edges must not reduce the component count again.');
  add(7, 'Keep a running median', 'After each number arrives, return the median of all numbers seen so far. Average the middle two for an even count.', String.raw`
function solve(numbers) {
  const sorted = [];
  const medians = [];
  for (const number of numbers) {
    let index = 0;
    while (index < sorted.length && sorted[index] <= number) {
      index += 1;
    }
    sorted.splice(index, 0, number);
    const middle = Math.floor(sorted.length / 2);
    const median = sorted.length % 2
      ? sorted[middle]
      : (sorted[middle - 1] + sorted[middle]) / 2;
    medians.push(median);
  }
  return medians;
}`, [['(sorted[middle - 1] + sorted[middle]) / 2','sorted[middle]']], [[[5,1,3,2],[5,3,3,2.5],'Odd and even counts'],[[10,2],[10,6],'Numeric ordering'],[[],[],'No numbers']], 'An even-length list has two central values.', 'Keep the arrivals sorted and average both middle elements when the count is even. The upper middle alone is not the median in that case.');
}
