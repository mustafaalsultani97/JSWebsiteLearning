import { addChallenge } from './helpers.js';
export function addAdvancedChallenges(list) {
  const add = (level, ...args) => addChallenge(list, level, ...args);
  add(8, 'Wait for every mapped task', 'Asynchronously double every number and return the resolved numbers in input order.', String.raw`
async function solve(numbers) {
  async function double(number) {
    await Promise.resolve();
    const result = number * 2;
    return result;
  }
  const pending = numbers.map(number => {
    return double(number);
  });
  const values = await Promise.all(pending);
  const total = values.reduce((sum, value) => sum + value, 0);
  return {
    values,
    total
  };
}`, [['await Promise.all(pending)','await pending']], [[[1,3,2],{values:[2,6,4],total:12},'Resolve each element'],[[0,-2],{values:[0,-4],total:-4},'Zero and negative'],[[],{values:[],total:0},'No tasks']], 'Awaiting an array does not await the promises inside it.', 'Promise.all waits for every mapped promise and produces resolved values in the same order as the inputs.');
  add(8, 'Return a result from an async helper', 'Load each amount asynchronously, apply a fee once per amount, and return their total.', String.raw`
async function solve(request) {
  async function load(amount) {
    await Promise.resolve();
    return amount;
  }
  async function withFee(amount) {
    const loaded = await load(amount);
    const total = loaded + request.fee;
    return total;
  }
  const results = [];
  for (const amount of request.amounts) {
    results.push(await withFee(amount));
  }
  return {
    results,
    total: results.reduce((sum, value) => sum + value, 0)
  };
}`, [['return total;','// TODO: resolve this helper with its calculated value.']], [[{amounts:[2,4],fee:1},{results:[3,5],total:8},'Apply per-item fee'],[{amounts:[0],fee:0},{results:[0],total:0},'Zero result'],[{amounts:[],fee:5},{results:[],total:0},'No charges']], 'An async function still needs return to resolve with a value.', 'Awaiting load pauses correctly, but without returning total the helper fulfills with undefined.');
  add(8, 'Keep successful batch results', 'Double nonnegative inputs asynchronously. Negative inputs reject. Return successful values and failure count without stopping the batch.', String.raw`
async function solve(numbers) {
  async function process(number) {
    await Promise.resolve();
    if (number < 0) {
      throw new Error('negative');
    }
    return number * 2;
  }
  const settled = await Promise.allSettled(numbers.map(process));
  const values = [];
  let failures = 0;
  for (const result of settled) {
    if (result.status === 'fulfilled') {
      values.push(result.value);
    } else {
      failures += 1;
    }
  }
  return { values, failures };
}`, [['result.status === \'fulfilled\'','result.status === \'success\'']], [[[2,-1,3],{values:[4,6],failures:1},'Mixed outcomes'],[[-2,-3],{values:[],failures:2},'All fail'],[[],{values:[],failures:0},'Empty batch']], 'Inspect the actual status names returned by allSettled.', 'A successful settled promise has status fulfilled; a failed one has status rejected. The result value exists on fulfilled entries.');
  add(8, 'Filter with an asynchronous rule', 'Keep even numbers after an asynchronous eligibility check, preserving order.', String.raw`
async function solve(numbers) {
  async function eligible(number) {
    await Promise.resolve();
    return number % 2 === 0;
  }
  const decisions = await Promise.all(numbers.map(eligible));
  const kept = [];
  for (let index = 0; index < numbers.length; index++) {
    if (decisions[index]) {
      kept.push(numbers[index]);
    }
  }
  return {
    kept,
    rejected: numbers.length - kept.length
  };
}`, [['const decisions = await Promise.all(numbers.map(eligible));','const decisions = numbers.map(eligible);']], [[[1,2,3,4],{kept:[2,4],rejected:2},'Mixed eligibility'],[[-2,0],{kept:[-2,0],rejected:0},'Even nonpositive numbers'],[[],{kept:[],rejected:0},'No inputs']], 'Promises themselves are truthy even if they will resolve to false.', 'Resolve all eligibility promises before testing their boolean values. The matching indexes connect decisions back to original numbers.');
  add(8, 'Share in-flight work', 'Load each ID as ID multiplied by ten. Concurrent repeated IDs should share one load; report values and load count.', String.raw`
async function solve(ids) {
  const cache = new Map();
  let loads = 0;
  async function load(id) {
    loads += 1;
    await Promise.resolve();
    return id * 10;
  }
  async function get(id) {
    if (cache.has(id)) {
      return cache.get(id);
    }
    const pending = load(id);
    cache.set(id, pending);
    return pending;
  }
  const values = await Promise.all(ids.map(get));
  return {
    values,
    loads
  };
}`, [['const pending = load(id);','const pending = await load(id);']], [[[1,1,2],{values:[10,10,20],loads:2},'Concurrent duplicates'],[[0,0],{values:[0,0],loads:1},'Zero key'],[[],{values:[],loads:0},'No loads']], 'Store the promise before yielding control to another caller.', 'Awaiting before caching creates a window where other calls see a miss. Cache the in-flight promise immediately so every caller shares it.');
  add(8, 'Retry a rejected cached request', 'Each ID fails on its first load and succeeds on the next. Process IDs sequentially, evict failures, and return values or error for each request.', String.raw`
async function solve(ids) {
  const cache = new Map();
  const attempts = new Map();
  async function load(id) {
    attempts.set(id, (attempts.get(id) ?? 0) + 1);
    if (attempts.get(id) === 1) throw new Error('temporary');
    return id * 2;
  }
  function get(id) {
    if (!cache.has(id)) {
      const pending = load(id).catch(error => {
        cache.delete(id);
        throw error;
      });
      cache.set(id, pending);
    }
    return cache.get(id);
  }
  const values = [];
  for (const id of ids) {
    try { values.push(await get(id)); }
    catch { values.push('error'); }
  }
  return { values, attempts: [...attempts.entries()] };
}`, [['cache.delete(id);','// TODO: allow a later request to retry this ID.']], [[[2,2,2],{values:['error',4,4],attempts:[[2,2]]},'Retry then reuse'],[[1,2,1,2],{values:['error','error',2,4],attempts:[[1,2],[2,2]]},'Independent IDs'],[[],{values:[],attempts:[]},'No requests']], 'A rejected promise left in the cache will reject forever.', 'Delete the failed entry in its rejection handler. A later caller creates a new attempt; a successful promise can remain cached.');
  add(8, 'Keep a task queue running after failure', 'Run amounts sequentially. Negative amounts reject; other amounts add to a shared total. Return ok/error outcomes and the total.', String.raw`
async function solve(amounts) {
  let total = 0;
  let tail = Promise.resolve();
  function enqueue(amount) {
    const current = tail.then(async () => {
      await Promise.resolve();
      if (amount < 0) throw new Error('rejected');
      total += amount;
      return total;
    });
    tail = current.catch(() => {});
    return current;
  }
  const pending = amounts.map(amount =>
    enqueue(amount).then(() => 'ok', () => 'error')
  );
  const outcomes = await Promise.all(pending);
  return {
    total,
    outcomes
  };
}`, [['tail = current.catch(() => {});','tail = current;']], [[[2,-1,3],{total:5,outcomes:['ok','error','ok']},'Work after a failure'],[[-1,4],{total:4,outcomes:['error','ok']},'First task fails'],[[],{total:0,outcomes:[]},'No work']], 'The queue tail needs to recover even though the individual task still rejects.', 'Catch only on the scheduling tail so the next task can run. Return the original task promise so its caller still observes its failure.');
  add(8, 'Close an async stream', 'Read up to limit values from an async generator. Return the values and whether cleanup ran; limit is positive.', String.raw`
async function solve(request) {
  let cleaned = false;
  async function* stream() {
    try {
      for (const value of request.values) {
        await Promise.resolve();
        yield value;
      }
    } finally {
      cleaned = true;
    }
  }
  const taken = [];
  for await (const value of stream()) {
    taken.push(value);
    if (taken.length >= request.limit) {
      break;
    }
  }
  return { taken, cleaned };
}`, [['cleaned = true;','// TODO: record that stream cleanup happened.']], [[{values:[1,2,3],limit:2},{taken:[1,2],cleaned:true},'Close early'],[{values:[1],limit:4},{taken:[1],cleaned:true},'Exhaust stream'],[{values:[],limit:1},{taken:[],cleaned:true},'Empty stream']], 'The finally block handles both normal exhaustion and early closure.', 'for await closes the generator when the loop breaks. finally runs in both paths and records completed cleanup.');
  add(8, 'Ignore stale request completions', 'Start named requests in order, finish them in the supplied index order, and display only the newest request result.', String.raw`
async function solve(request) {
  let version = 0;
  let displayed = null;
  const release = [];
  const pending = request.names.map(name => {
    const mine = ++version;
    const gate = new Promise(resolve => release.push(resolve));
    return gate.then(() => {
      if (mine === version) {
        displayed = name;
      }
    });
  });
  for (const index of request.finishOrder) {
    release[index]();
    await pending[index];
  }
  await Promise.all(pending);
  return {
    displayed,
    started: version
  };
}`, [['mine === version','mine <= version']], [[{names:['old','new'],finishOrder:[1,0]},{displayed:'new',started:2},'Old finishes last'],[{names:['a','b','c'],finishOrder:[0,2,1]},{displayed:'c',started:3},'Three requests'],[{names:[],finishOrder:[]},{displayed:null,started:0},'No requests']], 'Only the request holding the latest version may update the display.', 'Older requests still finish, but their saved version no longer matches the current version. Equality prevents stale results from replacing newer ones.');
  add(8, 'Preserve order in a worker pool', 'Use two workers to double numbers. Each job waits its specified number of microtask steps; return results in input order.', String.raw`
async function solve(jobs) {
  let cursor = 0;
  const results = Array(jobs.length);
  async function work() {
    while (cursor < jobs.length) {
      const index = cursor++;
      const job = jobs[index];
      for (let step = 0; step < job.steps; step++) {
        await Promise.resolve();
      }
      const value = job.value * 2;
      results[index] = value;
    }
  }
  await Promise.all([work(), work()]);
  return {
    results,
    processed: cursor
  };
}`, [['results[index] = value;','results.push(value);']], [[[{value:1,steps:3},{value:2,steps:0},{value:3,steps:1}],{results:[2,4,6],processed:3},'Out-of-order completion'],[[{value:0,steps:1}],{results:[0],processed:1},'One job'],[[],{results:[],processed:0},'No jobs']], 'Reserve an input index before waiting, then write into that result slot.', 'Appending reflects completion order and also leaves the preallocated slots empty. Indexed assignment preserves the original order regardless of scheduling.');

  add(9, 'Repair a least-recently-used cache', 'Process get and put commands for a positive-capacity cache. Reads refresh recency. Return read results and remaining entries from oldest to newest.', String.raw`
function solve(request) {
  const entries = new Map();
  const reads = [];
  function get(key) {
    if (!entries.has(key)) return null;
    const value = entries.get(key);
    entries.delete(key);
    entries.set(key, value);
    return value;
  }
  for (const command of request.commands) {
    if (command.type === 'put') {
      entries.delete(command.key);
      entries.set(command.key, command.value);
      if (entries.size > request.capacity) {
        const oldest = entries.keys().next().value;
        entries.delete(oldest);
      }
    } else {
      reads.push(get(command.key));
    }
  }
  return { reads, entries: [...entries] };
}`, [['entries.delete(key);','// TODO: move a cache hit to the newest position.']], [[{capacity:2,commands:[{type:'put',key:'a',value:1},{type:'put',key:'b',value:2},{type:'get',key:'a'},{type:'put',key:'c',value:3},{type:'get',key:'b'}]},{reads:[1,null],entries:[['a',1],['c',3]]},'Refresh on hit'],[{capacity:1,commands:[{type:'put',key:'a',value:0},{type:'get',key:'a'}]},{reads:[0],entries:[['a',0]]},'Cached zero'],[{capacity:2,commands:[]},{reads:[],entries:[]},'No commands']], 'Setting an existing Map key does not change its insertion order.', 'Delete and reinsert a hit to move it to the newest position. Eviction can then remove the first key as the least recently used.');
  add(9, 'Expire cached values on a logical clock', 'Put values with a TTL using the command time. A get at or after expiry is a miss. Return read results and the count of unexpired cached entries at the final command time.', String.raw`
function solve(commands) {
  const cache = new Map();
  const reads = [];
  let now = 0;
  function expire(key) {
    const entry = cache.get(key);
    if (entry && entry.expires <= now) {
      cache.delete(key);
    }
  }
  for (const command of commands) {
    now = command.time;
    if (command.type === 'put') {
      cache.set(command.key, {
        value: command.value,
        expires: now + command.ttl
      });
    } else {
      expire(command.key);
      reads.push(cache.get(command.key)?.value ?? null);
    }
  }
  for (const key of cache.keys()) expire(key);
  return { reads, size: cache.size };
}`, [['entry.expires <= now','entry.expires < now']], [[[{type:'put',time:0,key:'a',value:7,ttl:5},{type:'get',time:4,key:'a'},{type:'get',time:5,key:'a'}],{reads:[7,null],size:0},'Exact expiry boundary'],[[{type:'put',time:2,key:'z',value:0,ttl:0},{type:'get',time:2,key:'z'}],{reads:[null],size:0},'Immediate expiry'],[[],{reads:[],size:0},'Empty cache']], 'At the expiry time, the entry is already expired.', 'Use an inclusive expiry comparison. A logical command clock makes these checks deterministic without relying on real time.');
  add(9, 'Roll back a failed transaction', 'Apply set operations to a numeric balance. If a negative value is requested, restore the starting balance by undoing accepted changes in reverse order.', String.raw`
function solve(request) {
  let balance = request.start;
  const undo = [];
  const trace = [];
  let committed = true;
  try {
    for (const value of request.values) {
      if (value < 0) throw new Error('invalid balance');
      const previous = balance;
      undo.push(() => {
        balance = previous;
        trace.push(balance);
      });
      balance = value;
    }
  } catch {
    committed = false;
    for (let index = undo.length - 1; index >= 0; index--) {
      undo[index]();
    }
  }
  return { balance, committed, trace };
}`, [['for (let index = undo.length - 1; index >= 0; index--)','for (let index = 0; index < undo.length; index++)']], [[{start:10,values:[20,30,-1]},{balance:10,committed:false,trace:[20,10]},'Reverse rollback'],[{start:5,values:[7,9]},{balance:9,committed:true,trace:[]},'Commit'],[{start:2,values:[-1]},{balance:2,committed:false,trace:[]},'Fail before changes']], 'Undo the most recent change first.', 'Each undo restores the value before its own update. Applying undos in reverse order unwinds the transaction back to its starting state.');
  add(9, 'Replay events exactly once', 'Events have unique IDs but delivery may repeat. Apply each first-seen event once, sum amounts by account, and report duplicate count.', String.raw`
function solve(events) {
  const seen = new Set();
  const accounts = new Map();
  let duplicates = 0;
  function apply(event) {
    if (seen.has(event.id)) {
      duplicates += 1;
      return;
    }
    seen.add(event.id);
    const previous = accounts.get(event.account) ?? 0;
    accounts.set(event.account, previous + event.amount);
  }
  for (const event of events) {
    apply(event);
  }
  const balances = [];
  let total = 0;
  for (const [account, balance] of accounts) {
    balances.push({ account, balance });
    total += balance;
  }
  return { balances, total, duplicates };
}`, [['seen.add(event.id);','seen.add(event.account);']], [[[{id:'1',account:'a',amount:5},{id:'2',account:'a',amount:3},{id:'1',account:'a',amount:5}],{balances:[{account:'a',balance:8}],total:8,duplicates:1},'Duplicate delivery'],[[{id:'a',account:'x',amount:1},{id:'b',account:'y',amount:-1}],{balances:[{account:'x',balance:1},{account:'y',balance:-1}],total:0,duplicates:0},'Separate accounts'],[[],{balances:[],total:0,duplicates:0},'No events']], 'Deduplicate by the event identifier, not by the entity being updated.', 'An account can legitimately receive many events. The seen set must store event IDs so only repeated deliveries are suppressed.');
  add(9, 'Prune a tree without losing matching descendants', 'Keep nodes whose name contains query and their ancestors. Matching a parent does not automatically keep nonmatching children. Return null if no node matches.', String.raw`
function solve(request) {
  const query = request.query.toLowerCase();
  function prune(node) {
    const children = [];
    for (const child of node.children ?? []) {
      const kept = prune(child);
      if (kept !== null) {
        children.push(kept);
      }
    }
    const matches = node.name.toLowerCase().includes(query);
    if (!matches && children.length === 0) {
      return null;
    }
    return {
      name: node.name,
      children
    };
  }
  if (request.root === null) {
    return null;
  }
  const result = prune(request.root);
  return result;
}`, [['!matches && children.length === 0','!matches || children.length === 0']], [[{root:{name:'root',children:[{name:'Target'},{name:'other'}]},query:'target'},{name:'root',children:[{name:'Target',children:[]}]},'Keep ancestor path'],[{root:{name:'match'},query:'match'},{name:'match',children:[]},'Matching leaf'],[{root:{name:'none'},query:'z'},null,'No matches']], 'Drop a node only when neither it nor any retained descendant matches.', 'The removal condition needs AND. OR would discard both matching leaves and nonmatching ancestors of a match.');
  add(9, 'Schedule stable priorities', 'Process enqueue and run commands. Run the lowest numeric priority first; ties use enqueue order. Return executed names and remaining names in run order.', String.raw`
function solve(commands) {
  const pending = [];
  const executed = [];
  let sequence = 0;
  function compare(a, b) {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return a.sequence - b.sequence;
  }
  for (const command of commands) {
    if (command.type === 'enqueue') {
      pending.push({
        name: command.name,
        priority: command.priority,
        sequence: sequence++
      });
    } else if (pending.length) {
      pending.sort(compare);
      executed.push(pending.shift().name);
    }
  }
  pending.sort(compare);
  return { executed, remaining: pending.map(task => task.name) };
}`, [['return a.sequence - b.sequence;','return b.sequence - a.sequence;']], [[[{type:'enqueue',name:'a',priority:2},{type:'enqueue',name:'b',priority:2},{type:'enqueue',name:'c',priority:1},{type:'run'},{type:'run'}],{executed:['c','a'],remaining:['b']},'Priority with stable ties'],[[{type:'run'}],{executed:[],remaining:[]},'Empty scheduler'],[[{type:'enqueue',name:'x',priority:0}],{executed:[],remaining:['x']},'One pending job']], 'Earlier enqueue sequence numbers must sort first on a tie.', 'Priority determines the primary order. The ascending sequence number provides a stable first-in order for equal priorities.');
  add(9, 'Find a route through a maze', 'Return the shortest number of steps from start to end in a rectangular 0/1 grid, moving up, down, left or right. Blocked or unreachable endpoints return -1.', String.raw`
function solve(request) {
  const grid = request.grid;
  const [startRow, startColumn] = request.start;
  const [endRow, endColumn] = request.end;
  if (grid[startRow][startColumn] || grid[endRow][endColumn]) return -1;
  const queue = [[startRow, startColumn, 0]];
  const seen = new Set([startRow + ',' + startColumn]);
  const directions = [[1,0],[-1,0],[0,1],[0,-1]];
  let head = 0;
  while (head < queue.length) {
    const [row, column, distance] = queue[head++];
    if (row === endRow && column === endColumn) return distance;
    for (const [dr, dc] of directions) {
      const nextRow = row + dr;
      const nextColumn = column + dc;
      if (nextRow < 0 || nextRow >= grid.length) continue;
      if (nextColumn < 0 || nextColumn >= grid[0].length) continue;
      const key = nextRow + ',' + nextColumn;
      if (grid[nextRow][nextColumn] || seen.has(key)) continue;
      seen.add(key);
      queue.push([nextRow, nextColumn, distance + 1]);
    }
  }
  return -1;
}`, [['row === endRow && column === endColumn','row === endRow || column === endColumn']], [[{grid:[[0,0,0],[1,1,0],[0,0,0]],start:[0,0],end:[2,2]},4,'Match both coordinates'],[{grid:[[0,1],[1,0]],start:[0,0],end:[1,1]},-1,'Unreachable'],[{grid:[[0]],start:[0,0],end:[0,0]},0,'Already at destination']], 'A destination is a pair of coordinates, not just a matching row or column.', 'Require both coordinates to match. Breadth-first search then returns the first complete destination match, which has the shortest distance.');
  add(9, 'Apply immutable nested updates', 'Set a value at an existing path in a JSON object or array. Return original and updated structures; the original must remain unchanged.', String.raw`
function solve(request) {
  const original = request.value;
  function update(node, path, value, depth) {
    if (depth === path.length) {
      return value;
    }
    const key = path[depth];
    const copied = Array.isArray(node) ? [...node] : { ...node };
    copied[key] = update(node[key], path, value, depth + 1);
    return copied;
  }
  const updated = update(original, request.path, request.next, 0);
  function countContainers(node) {
    if (node === null || typeof node !== 'object') return 0;
    return 1 + Object.values(node).reduce((sum, child) => sum + countContainers(child), 0);
  }
  return {
    original,
    updated,
    containers: countContainers(updated)
  };
}`, [['const copied = Array.isArray(node) ? [...node] : { ...node };','const copied = node;']], [[{value:{a:{b:1}},path:['a','b'],next:2},{original:{a:{b:1}},updated:{a:{b:2}},containers:2},'Nested object'],[{value:[{x:1}],path:[0,'x'],next:4},{original:[{x:1}],updated:[{x:4}],containers:2},'Array path'],[{value:{a:1},path:[],next:3},{original:{a:1},updated:3,containers:0},'Replace root']], 'Every container on the modified path needs its own copy.', 'Copy the current container, recursively replace its selected child, and return the copy. Unchanged branches may safely be shared because they are not mutated.');
  add(9, 'Invalidate dependent cached totals', 'A directed acyclic graph defines each node total as its own value plus dependency totals. Process get and set commands; changing a node must invalidate it and every dependent.', String.raw`
function solve(request) {
  const values = { ...request.values }, cache = new Map();
  let calculations = 0;
  function total(node) {
    if (cache.has(node)) return cache.get(node);
    calculations += 1;
    const result = values[node] + (request.graph[node] ?? []).reduce((sum, id) => sum + total(id), 0);
    cache.set(node, result);
    return result;
  }
  function invalidate(node, seen = new Set()) {
    if (seen.has(node)) return;
    seen.add(node);
    cache.delete(node);
    for (const [parent, dependencies] of Object.entries(request.graph))
      if (dependencies.includes(node)) invalidate(parent, seen);
  }
  const outputs = [];
  for (const command of request.commands) {
    if (command.type === 'get') { outputs.push(total(command.node)); continue; }
    values[command.node] = command.value;
    invalidate(command.node);
  }
  return { outputs, calculations };
}`, [['invalidate(parent, seen);','cache.has(parent); // TODO: invalidate the dependent.']], [[{values:{a:1,b:2,c:3},graph:{a:['b'],b:['c']},commands:[{type:'get',node:'a'},{type:'set',node:'c',value:5},{type:'get',node:'a'}]},{outputs:[6,8],calculations:6},'Transitive invalidation'],[{values:{a:2,b:3},graph:{a:['b']},commands:[{type:'get',node:'a'},{type:'get',node:'a'}]},{outputs:[5,5],calculations:2},'Reuse cached totals'],[{values:{a:0},graph:{},commands:[{type:'get',node:'a'},{type:'set',node:'a',value:1},{type:'get',node:'a'}]},{outputs:[0,1],calculations:2},'Direct invalidation']], 'A dependency change makes cached totals above it stale too.', 'Find tasks whose dependency list contains the changed node, then recursively delete their cached totals. A visited set handles shared parents once.');
  add(9, 'Repair a shared async dependency service', 'Evaluate a requested root in a DAG, counting each node as 1 plus its dependency totals. A specified node fails only on its first attempt. Retry once after failure, share in-flight work, and keep successful cached nodes.', String.raw`
async function solve(request) {
  const cache = new Map(), attempts = new Map();
  async function get(node) {
    if (cache.has(node)) return cache.get(node);
    attempts.set(node, (attempts.get(node) ?? 0) + 1);
    const pending = Promise.resolve().then(async () => {
      if (node === request.failOnce && attempts.get(node) === 1) throw Error('temporary failure');
      const values = await Promise.all((request.graph[node] ?? []).map(get));
      return 1 + values.reduce((sum, value) => sum + value, 0);
    }).catch(error => {
      cache.delete(node);
      throw error;
    });
    cache.set(node, pending);
    return pending;
  }
  let retried = false;
  const value = await get(request.root).catch(async () => {
    retried = true;
    await Promise.allSettled([...cache.values()]);
    return get(request.root);
  });
  const totalAttempts = [...attempts.values()].reduce((sum, count) => sum + count, 0);
  return { value, totalAttempts, cached: [...cache.keys()].sort(), retried, events: retried ? ['retry', 'success'] : ['success'] };
}`, [['cache.delete(node);','// TODO: a failed node must be allowed to run again.']], [[{graph:{root:['left','right'],left:['leaf'],right:['leaf']},root:'root',failOnce:'leaf'},{value:5,totalAttempts:8,cached:['leaf','left','right','root'],retried:true,events:['retry','success']},'Shared failing dependency'],[{graph:{root:['leaf']},root:'root',failOnce:null},{value:2,totalAttempts:2,cached:['leaf','root'],retried:false,events:['success']},'No retry needed'],[{graph:{root:['good','bad']},root:'root',failOnce:'bad'},{value:3,totalAttempts:5,cached:['bad','good','root'],retried:true,events:['retry','success']},'Retain successful sibling']], 'Rejections must remove their own cached promise as they propagate through dependent nodes.', 'Cache promises immediately to share concurrent work. On failure, evict the rejected entry and rethrow so dependent failures are evicted too. The retry reuses successful siblings while rebuilding failed paths.');
}
