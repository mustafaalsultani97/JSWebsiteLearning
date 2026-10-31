import { addChallenge } from './helpers.js';
export function addCollectionChallenges(list) {
  const add = (level, ...args) => addChallenge(list, level, ...args);
  add(4, 'Flatten rows in order', 'Flatten one level of nested arrays. Preserve values including zero, false and null.', String.raw`
function solve(rows) {
  const result = [];
  for (const row of rows) {
    for (const value of row) {
      result.push(value);
    }
  }
  const count = result.length;
  return {
    values: result,
    count
  };
}`, [['result.push(value);','if (value) result.push(value);']], [[[[1,0],[false,null]],{values:[1,0,false,null],count:4},'Falsy values are items'],[[[],[2]],{values:[2],count:1},'Empty row'],[[],{values:[],count:0},'No rows']], 'Every item belongs in the result, even if it is falsy.', 'The inner loop must append unconditionally. Testing truthiness incorrectly drops legitimate values such as zero and false.');
  add(4, 'Sum matrix columns', 'For a rectangular numeric matrix, return each column total. An empty matrix returns an empty array.', String.raw`
function solve(matrix) {
  if (matrix.length === 0) {
    return [];
  }
  const width = matrix[0].length;
  const totals = Array(width).fill(0);
  for (const row of matrix) {
    for (let column = 0; column < width; column++) {
      totals[column] += row[column];
    }
  }
  return totals;
}`, [['totals[column] += row[column];','totals[column] = row[column];']], [[[[1,2],[3,4]],[4,6],'Two rows'],[[[-1],[5],[2]],[6],'One column'],[[],[],'Empty matrix']], 'Each column accumulator must retain earlier rows.', 'Initialize one total per column, then add the value from every row at that column index.');
  add(4, 'Combine customer orders', 'Return each customer with the sum of all their order amounts, in first-seen customer order.', String.raw`
function solve(orders) {
  const totals = new Map();
  for (const order of orders) {
    const customer = order.customer;
    const previous = totals.get(customer) ?? 0;
    const next = previous + order.amount;
    totals.set(customer, next);
  }
  const result = [];
  for (const [customer, total] of totals) {
    result.push({ customer, total });
  }
  return result;
}`, [['totals.set(customer, next);','// TODO: store the new total for this customer.']], [[[{customer:'a',amount:4},{customer:'b',amount:2},{customer:'a',amount:3}],[{customer:'a',total:7},{customer:'b',total:2}],'Repeated customer'],[[{customer:'x',amount:0}],[{customer:'x',total:0}],'Zero amount'],[[],[],'No orders']], 'Calculating next does not update the map.', 'Write the new accumulated amount back under the customer key. Map order remains the order in which customers first appeared.');
  add(4, 'Filter nested course scores', 'For each student, average only their scores of 60 or higher. Use zero when none qualify.', String.raw`
function solve(students) {
  const report = [];
  for (const student of students) {
    const passing = student.scores.filter(score => score >= 60);
    let total = 0;
    for (const score of passing) {
      total += score;
    }
    const average = passing.length ? total / passing.length : 0;
    report.push({ name: student.name, average });
  }
  return report;
}`, [['total / passing.length','total / student.scores.length']], [[[{name:'Ada',scores:[40,60,80]}],[{name:'Ada',average:70}],'Ignore failed scores'],[[{name:'Bo',scores:[10,20]}],[{name:'Bo',average:0}],'None pass'],[[{name:'Cy',scores:[]}],[{name:'Cy',average:0}],'No scores']], 'The divisor must count the same values that contributed to the sum.', 'After filtering, divide by the passing-score count. The empty branch avoids NaN when there are no qualifying scores.');
  add(4, 'Update nested settings independently', 'Change the copied theme while preserving the original nested settings. Return both theme values.', String.raw`
function solve(request) {
  const original = request.profile;
  const updated = {
    ...original,
    settings: { ...original.settings }
  };
  updated.settings.theme = request.theme;
  const report = {
    before: original.settings.theme,
    after: updated.settings.theme,
    name: updated.name
  };
  return report;
}`, [['settings: { ...original.settings }','settings: original.settings']], [[{profile:{name:'Ada',settings:{theme:'dark'}},theme:'light'},{before:'dark',after:'light',name:'Ada'},'Nested copy'],[{profile:{name:'Bo',settings:{theme:'light'}},theme:'dark'},{before:'light',after:'dark',name:'Bo'},'Reverse themes'],[{profile:{name:'Cy',settings:{theme:'dark'}},theme:'dark'},{before:'dark',after:'dark',name:'Cy'},'Same theme']], 'A top-level spread still shares nested objects unless they are copied too.', 'Copy settings as well as the profile. Otherwise changing updated.settings.theme also changes original.settings.theme.');
  add(4, 'Chunk a sequence', 'Split items into arrays of at most size items. Size is a positive integer; keep the final short chunk.', String.raw`
function solve(request) {
  const items = request.items;
  const size = request.size;
  const chunks = [];
  for (let start = 0; start < items.length; start += size) {
    const end = start + size;
    const chunk = items.slice(start, end);
    chunks.push(chunk);
  }
  return {
    chunks,
    count: chunks.length
  };
}`, [['items.slice(start, end)','items.slice(start, end - 1)']], [[{items:[1,2,3,4,5],size:2},{chunks:[[1,2],[3,4],[5]],count:3},'Short final chunk'],[{items:[1,2],size:1},{chunks:[[1],[2]],count:2},'Single item chunks'],[{items:[],size:3},{chunks:[],count:0},'Empty sequence']], 'slice excludes the end index already.', 'Passing start + size as the exclusive end includes exactly size items when available. Subtracting another one loses an item from each chunk.');
  add(4, 'Merge duplicate inventory rows', 'Combine quantities for equal SKUs. Return [sku, quantity] pairs in first-seen order.', String.raw`
function solve(rows) {
  const stock = new Map();
  for (const row of rows) {
    const sku = row.sku;
    const previous = stock.get(sku) ?? 0;
    const quantity = previous + row.quantity;
    stock.set(sku, quantity);
  }
  const result = [];
  for (const [sku, quantity] of stock) {
    result.push([sku, quantity]);
  }
  return result;
}`, [['const quantity = previous + row.quantity;','const quantity = previous + 1;']], [[[{sku:'x',quantity:3},{sku:'x',quantity:2},{sku:'y',quantity:4}],[['x',5],['y',4]],'Quantity totals'],[[{sku:'x',quantity:-2},{sku:'x',quantity:2}],[['x',0]],'Stock adjustments'],[[],[],'No rows']], 'Count the quantity on each row, not the number of rows.', 'Accumulate row.quantity under the SKU key. This supports positive stock arrivals and negative adjustments.');
  add(4, 'Select the highest score per player', 'Return each player and their highest score, preserving first-seen player order.', String.raw`
function solve(rounds) {
  const best = new Map();
  for (const round of rounds) {
    const previous = best.get(round.player);
    if (!best.has(round.player) || round.score > previous) {
      best.set(round.player, round.score);
    }
  }
  const report = [];
  for (const [player, score] of best) {
    report.push({ player, score });
  }
  return report;
}`, [['round.score > previous','round.score < previous']], [[[{player:'a',score:3},{player:'a',score:8},{player:'a',score:2}],[{player:'a',score:8}],'Best of three'],[[{player:'b',score:-5},{player:'b',score:-2}],[{player:'b',score:-2}],'Negative scores'],[[],[],'No rounds']], 'A new record replaces the old score only when it is higher.', 'The first score initializes each player. Subsequent scores replace it only if they exceed the saved best.');
  add(4, 'Build a pagination result', 'Return the requested one-based page and total page count. Size is positive; an out-of-range page has no items.', String.raw`
function solve(request) {
  const total = request.items.length;
  const pageCount = Math.ceil(total / request.size);
  const start = (request.page - 1) * request.size;
  const end = start + request.size;
  const items = request.items.slice(start, end);
  return {
    page: request.page,
    pageCount,
    items
  };
}`, [['(request.page - 1) * request.size','request.page * request.size']], [[{items:[1,2,3,4,5],page:1,size:2},{page:1,pageCount:3,items:[1,2]},'First page'],[{items:[1,2,3],page:2,size:2},{page:2,pageCount:2,items:[3]},'Partial last page'],[{items:[1],page:3,size:2},{page:3,pageCount:1,items:[]},'Beyond the end']], 'Page one starts at array index zero.', 'Convert the one-based page number into a zero-based offset before multiplying by page size.');
  add(4, 'Join users with their tasks', 'Return every user with titles of their tasks. Include users with no tasks and ignore tasks for unknown users.', String.raw`
function solve(data) {
  const byUser = new Map();
  for (const task of data.tasks) {
    if (!byUser.has(task.userId)) {
      byUser.set(task.userId, []);
    }
    byUser.get(task.userId).push(task.title);
  }
  const report = [];
  for (const user of data.users) {
    const tasks = byUser.get(user.id) ?? [];
    report.push({ name: user.name, tasks });
  }
  return report;
}`, [['byUser.get(task.userId).push(task.title);','// TODO: add this task title to its user list.']], [[{users:[{id:1,name:'A'},{id:2,name:'B'}],tasks:[{userId:1,title:'x'},{userId:1,title:'y'}]},[{name:'A',tasks:['x','y']},{name:'B',tasks:[]}],'User without tasks'],[{users:[],tasks:[{userId:8,title:'x'}]},[],'Unknown user'],[{users:[{id:3,name:'C'}],tasks:[]},[{name:'C',tasks:[]}],'No tasks']], 'Create the task list if needed, then append on every iteration.', 'Build an index from user IDs to task titles, then walk users to produce the final report. This preserves users without tasks.');

  add(5, 'Keep separate counters', 'Run named counter commands. Each counter starts at zero and is independent; return the result after every command.', String.raw`
function solve(commands) {
  function createCounter() {
    let value = 0;
    return amount => {
      value += amount;
      return value;
    };
  }
  const counters = new Map();
  const results = [];
  for (const command of commands) {
    if (!counters.has(command.name)) {
      counters.set(command.name, createCounter());
    }
    const next = counters.get(command.name)(command.amount);
    results.push(next);
  }
  return results;
}`, [['if (!counters.has(command.name)) {','if (true) {']], [[[{name:'a',amount:2},{name:'b',amount:5},{name:'a',amount:3}],[2,5,5],'Independent state'],[[{name:'x',amount:1},{name:'x',amount:-1}],[1,0],'Reuse a counter'],[[],[],'No commands']], 'A counter should be constructed only on its first use.', 'Each closure stores one counter value. Recreating it for every command discards previous updates.');
  add(5, 'Memoize square calculations', 'Return each square and the number of actual calculations. Repeated inputs, including zero, should be cached.', String.raw`
function solve(numbers) {
  const cache = new Map();
  let calculations = 0;
  function square(number) {
    if (cache.has(number)) {
      return cache.get(number);
    }
    calculations += 1;
    const result = number * number;
    cache.set(number, result);
    return result;
  }
  const values = numbers.map(square);
  return {
    values,
    calculations
  };
}`, [['cache.has(number)','cache.get(number)']], [[[0,0,2,2],{values:[0,0,4,4],calculations:2},'Cache zero'],[[3,3,3],{values:[9,9,9],calculations:1},'One calculation'],[[],{values:[],calculations:0},'No calculations']], 'Cache presence and the truthiness of a cached result are different.', 'Map.has detects an existing key even when its cached square is zero. A truthiness test recomputes zero unnecessarily.');
  add(5, 'Restore a stack with undo', 'Process push(value), pop and undo commands. Undo restores the state before the last push or pop; empty undo does nothing.', String.raw`
function solve(commands) {
  let stack = [];
  const history = [];
  for (const command of commands) {
    if (command.type === 'undo') {
      if (history.length) {
        stack = history.pop();
      }
      continue;
    }
    history.push([...stack]);
    if (command.type === 'push') {
      stack.push(command.value);
    } else if (command.type === 'pop') {
      stack.pop();
    }
  }
  return stack;
}`, [['history.push([...stack]);','history.push(stack);']], [[[{type:'push',value:1},{type:'push',value:2},{type:'undo'}],[1],'Undo a push'],[[{type:'push',value:3},{type:'pop'},{type:'undo'}],[3],'Undo a pop'],[[{type:'undo'}],[],'No history']], 'A history entry must be a snapshot rather than the live array.', 'Copy the stack before a mutation. Sharing its reference means later pushes and pops alter the saved history too.');
  add(5, 'Process a first-in first-out queue', 'Enqueue supplied values, dequeue the oldest value, and return removed values plus the remaining queue. Empty dequeue returns null.', String.raw`
function solve(commands) {
  const queue = [];
  const removed = [];
  for (const command of commands) {
    if (command.type === 'enqueue') {
      queue.push(command.value);
      continue;
    }
    if (command.type === 'dequeue') {
      const value = queue.length ? queue.shift() : null;
      removed.push(value);
    }
  }
  return {
    removed,
    remaining: queue
  };
}`, [['queue.shift()','queue.pop()']], [[[{type:'enqueue',value:1},{type:'enqueue',value:2},{type:'dequeue'}],{removed:[1],remaining:[2]},'Remove oldest'],[[{type:'dequeue'}],{removed:[null],remaining:[]},'Empty queue'],[[],{removed:[],remaining:[]},'No commands']], 'A queue removes from the opposite end from where it adds.', 'push adds at the back, and shift removes from the front. pop would make the structure last-in first-out.');
  add(5, 'Balance different bracket types', 'Return whether (), [] and {} brackets are correctly nested. Ignore other characters.', String.raw`
function solve(text) {
  const pairs = { ')': '(', ']': '[', '}': '{' };
  const openers = '([{';
  const stack = [];
  for (const character of text) {
    if (openers.includes(character)) {
      stack.push(character);
    } else if (Object.hasOwn(pairs, character)) {
      const last = stack.pop();
      if (last !== pairs[character]) {
        return false;
      }
    }
  }
  return stack.length === 0;
}`, [['return stack.length === 0;','return true;']], [['([{}])',true,'Nested pairs'],['([)]',false,'Mismatched nesting'],['((a)',false,'Unclosed opener'],['',true,'No brackets']], 'After matching closers, some opening brackets may remain.', 'Each closer must match the latest opener. Finishing successfully also requires an empty stack, otherwise an opener was never closed.');
  add(5, 'Build a one-use initializer', 'Call an initializer for every supplied number but compute only once. Return the first computed result each time and count executions.', String.raw`
function solve(numbers) {
  let calls = 0;
  function once(fn) {
    let done = false;
    let value;
    return input => {
      if (!done) {
        value = fn(input);
        done = true;
      }
      return value;
    };
  }
  const initialize = once(number => {
    calls += 1;
    return number * 3;
  });
  return { values: numbers.map(initialize), calls };
}`, [['done = true;','// TODO: remember that initialization has completed.']], [[[2,4,6],{values:[6,6,6],calls:1},'Reuse first result'],[[0,5],{values:[0,0],calls:1},'Zero first result'],[[],{values:[],calls:0},'Never called']], 'Completion must be remembered separately from the cached value.', 'Set the done flag after calculating once. The cached value can legitimately be zero and should still be reused.');
  add(5, 'Remove a subscription', 'Subscribe named listeners, unsubscribe names, and emit messages. Return name:message deliveries in subscription order.', String.raw`
function solve(commands) {
  const listeners = new Set();
  const deliveries = [];
  for (const command of commands) {
    if (command.type === 'on') {
      listeners.add(command.name);
    } else if (command.type === 'off') {
      listeners.delete(command.name);
    } else if (command.type === 'emit') {
      for (const name of listeners) {
        deliveries.push(name + ':' + command.message);
      }
    }
  }
  return deliveries;
}`, [['listeners.delete(command.name);','listeners.add(command.name);']], [[[{type:'on',name:'a'},{type:'on',name:'b'},{type:'off',name:'a'},{type:'emit',message:'hi'}],['b:hi'],'Unsubscribe'],[[{type:'on',name:'a'},{type:'on',name:'a'},{type:'emit',message:'x'}],['a:x'],'No duplicate subscriptions'],[[{type:'emit',message:'x'}],[],'No subscribers']], 'The off branch must remove the name from the active set.', 'Set.delete unsubscribes the listener. Adding the name in that branch has the opposite effect.');
  add(5, 'Track stock through a class', 'Apply add and sell commands to a stock count. Reject sales exceeding available stock; return sale results and final stock.', String.raw`
function solve(request) {
  class Inventory {
    constructor(stock) {
      this.stock = stock;
    }
    add(amount) {
      this.stock += amount;
    }
    sell(amount) {
      if (amount > this.stock) return false;
      this.stock -= amount;
      return true;
    }
  }
  const inventory = new Inventory(request.stock);
  const sales = [];
  for (const command of request.commands) {
    if (command.type === 'add') inventory.add(command.amount);
    else sales.push(inventory.sell(command.amount));
  }
  return { sales, stock: inventory.stock };
}`, [['this.stock -= amount;','this.stock += amount;']], [[{stock:5,commands:[{type:'sell',amount:3},{type:'sell',amount:3}]},{sales:[true,false],stock:2},'Reject excess sale'],[{stock:0,commands:[{type:'add',amount:4},{type:'sell',amount:4}]},{sales:[true],stock:0},'Sell exactly stock'],[{stock:2,commands:[]},{sales:[],stock:2},'No commands']], 'A successful sale removes stock.', 'Subtract only after validating availability. A rejected sale leaves stock unchanged.');
  add(5, 'Combine set operations', 'Return distinct common values and values only in the left list, preserving left-list order.', String.raw`
function solve(request) {
  const right = new Set(request.right);
  const seen = new Set();
  const common = [];
  const onlyLeft = [];
  for (const value of request.left) {
    if (seen.has(value)) continue;
    seen.add(value);
    if (right.has(value)) {
      common.push(value);
    } else {
      onlyLeft.push(value);
    }
  }
  return { common, onlyLeft };
}`, [['seen.add(value);','// TODO: mark this left value as processed.']], [[{left:[1,2,1,3,3],right:[2,4]},{common:[2],onlyLeft:[1,3]},'Distinct partitions'],[{left:[0,0],right:[0]},{common:[0],onlyLeft:[]},'Repeated common zero'],[{left:[],right:[1]},{common:[],onlyLeft:[]},'Empty left list']], 'Membership in right and duplicate suppression are separate concerns.', 'Use seen to process each left value once. Then right.has decides which result array receives it.');
  add(5, 'Replay account events', 'Replay deposits and withdrawals. Reject withdrawals exceeding the balance and report the balance after each accepted event.', String.raw`
function solve(request) {
  let balance = request.start;
  let rejected = 0;
  const balances = [];
  for (const event of request.events) {
    if (event.type === 'withdraw') {
      if (event.amount > balance) {
        rejected += 1;
        continue;
      }
      balance -= event.amount;
    } else {
      balance += event.amount;
    }
    balances.push(balance);
  }
  return { balance, balances, rejected };
}`, [['continue;','break;']], [[{start:3,events:[{type:'withdraw',amount:5},{type:'deposit',amount:4}]},{balance:7,balances:[7],rejected:1},'Continue after rejection'],[{start:5,events:[{type:'withdraw',amount:5}]},{balance:0,balances:[0],rejected:0},'Withdraw entire balance'],[{start:0,events:[]},{balance:0,balances:[],rejected:0},'No events']], 'A rejected event should skip itself, not terminate the entire replay.', 'continue advances to the next event. break would discard every later deposit or withdrawal.');
}
