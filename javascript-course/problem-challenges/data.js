import { addChallenge } from './helpers.js';
export function addDataChallenges(list) {
  const add = (level, ...args) => addChallenge(list, level, ...args);
  add(2, 'Normalize a name list', 'Trim each name, lowercase it, and discard names that are empty after trimming.', String.raw`
function solve(names) {
  const normalized = [];
  for (const name of names) {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      continue;
    }
    const lower = trimmed.toLowerCase();
    normalized.push(lower);
  }
  return normalized;
}`, [['trimmed.toLowerCase()', 'trimmed.toUpperCase()']], [[[' ADA ','',' Bob '],['ada','bob'],'Mixed input'],[['  '],[],'Whitespace only'],[['Jo Lee'],['jo lee'],'Internal space']], 'The requested result uses lowercase letters.', 'Trim before checking emptiness, then lowercase the retained text. An uppercase conversion violates the normalization rule.');
  add(2, 'Count words after trimming', 'Count whitespace-separated words. Empty or whitespace-only text has zero words.', String.raw`
function solve(text) {
  const cleaned = text.trim();
  if (cleaned === '') {
    return 0;
  }
  const words = cleaned.split(/\s+/);
  let count = 0;
  for (const word of words) {
    count += 1;
  }
  return count;
}`, [["cleaned.split(/\\s+/)", "cleaned.split(' ')"]], [['one   two\nthree',3,'Repeated whitespace'],['  ',0,'No words'],['hello\nworld',2,'Newline separator']], 'A separator can contain several spaces or a newline.', 'The regular expression matches one or more whitespace characters. Splitting on a single space creates empty entries and misses newlines.');
  add(2, 'Build a URL slug', 'Turn words separated by whitespace into a lowercase hyphen-separated slug.', String.raw`
function solve(title) {
  const trimmed = title.trim();
  if (!trimmed) {
    return '';
  }
  const words = trimmed.toLowerCase().split(/\s+/);
  const parts = [];
  for (const word of words) {
    parts.push(word);
  }
  return parts.join('-');
}`, [["return parts.join('-');", '// TODO: join the parts with hyphens and return the slug.']], [['  Learn  JavaScript ','learn-javascript','Extra spaces'],['One','one','One word'],['','', 'Empty title']], 'The array needs a separator when it becomes text.', 'join connects the normalized words with one hyphen between each pair. No leading or trailing hyphen is added.');
  add(2, 'Count vowels without case sensitivity', 'Count a, e, i, o and u in the text, regardless of letter case.', String.raw`
function solve(text) {
  const vowels = 'aeiou';
  let count = 0;
  const normalized = text.toLowerCase();
  for (const character of normalized) {
    if (vowels.includes(character)) {
      count += 1;
    }
  }
  return count;
}`, [['text.toLowerCase()', 'text']], [['AEIOU',5,'Uppercase vowels'],['Hello World',3,'Mixed letters'],['rhythm',0,'No vowels']], 'Make the input comparable to the lowercase vowel list.', 'Normalize the whole string before iterating. Then includes recognizes vowels from either original letter case.');
  add(2, 'Match a palindrome', 'Ignore spaces and letter case, then report whether the text reads the same backward.', String.raw`
function solve(text) {
  const cleaned = text.toLowerCase().replace(/\s/g, '');
  let left = 0;
  let right = cleaned.length - 1;
  while (left < right) {
    if (cleaned[left] !== cleaned[right]) {
      return false;
    }
    left += 1;
    right -= 1;
  }
  return true;
}`, [['let right = cleaned.length - 1;', 'let right = cleaned.length;']], [['Never odd or even',true,'Spaces and case'],['hello',false,'Not a palindrome'],['',true,'Empty text']], 'The final character is one position before length.', 'The right pointer must begin at the last valid index. Both pointers then move inward until they meet.');
  add(2, 'Keep a mapping callback result', 'Return a label for each score: pass at 60 or above, otherwise retry.', String.raw`
function solve(scores) {
  function label(score) {
    if (score >= 60) {
      return 'pass';
    }
    return 'retry';
  }
  const results = scores.map(score => {
    return label(score);
  });
  return results;
}`, [['return label(score);', 'label(score);']], [[[59,60,80],['retry','pass','pass'],'Boundary scores'],[[0],['retry'],'Low score'],[[],[],'No scores']], 'A callback with braces needs its own return.', 'The inner helper returns a label, but the map callback must return that label too. Otherwise map collects undefined values.');
  add(2, 'Apply a configurable multiplier', 'Multiply every value by factor. Preserve an explicit zero factor; default to 2 only when factor is absent.', String.raw`
function solve(request) {
  const factor = request.factor ?? 2;
  const numbers = request.numbers;
  function multiply(value) {
    return value * factor;
  }
  const result = [];
  for (const value of numbers) {
    result.push(multiply(value));
  }
  return result;
}`, [['request.factor ?? 2', 'request.factor || 2']], [[{numbers:[2,3],factor:0},[0,0],'Zero factor'],[{numbers:[2,3]},[4,6],'Default factor'],[{numbers:[-2],factor:3},[-6],'Explicit factor']], 'A default should not replace a valid zero.', 'Nullish coalescing distinguishes absent input from zero. The helper closes over the chosen factor for every item.');
  add(2, 'Return the first longest word', 'Return the first word with the greatest length, or an empty string for an empty array.', String.raw`
function solve(words) {
  let longest = '';
  let longestLength = 0;
  for (const word of words) {
    const length = word.length;
    if (length > longestLength) {
      longest = word;
      longestLength = length;
    }
  }
  return longest;
}`, [['length > longestLength', 'length >= longestLength']], [[['cat','dog'],'cat','Keep first tie'],[['a','long','hi'],'long','Longer later word'],[[],'','Empty list']], 'Equal length should preserve the earlier word.', 'Update only for a strictly longer word. Using >= replaces an earlier word on a tie.');
  add(2, 'Format a duration', 'For nonnegative whole seconds, return minutes:seconds with a two-digit seconds part.', String.raw`
function solve(totalSeconds) {
  const minuteSize = 60;
  const minutes = Math.floor(totalSeconds / minuteSize);
  const seconds = totalSeconds % minuteSize;
  const minuteText = String(minutes);
  const secondText = String(seconds).padStart(2, '0');
  const result = minuteText + ':' + secondText;
  return result;
}`, [["String(seconds).padStart(2, '0')", 'String(seconds)']], [[65,'1:05','One-digit seconds'],[0,'0:00','Zero duration'],[125,'2:05','More than one minute']], 'The seconds field always needs two characters.', 'padStart supplies a leading zero only when necessary. The minutes value stays unpadded.');
  add(2, 'Collect character positions', 'Return every index containing target in a basic Latin string.', String.raw`
function solve(request) {
  const text = request.text;
  const target = request.target;
  const positions = [];
  for (let index = 0; index < text.length; index++) {
    const character = text[index];
    if (character === target) {
      positions.push(index);
    }
  }
  return positions;
}`, [['positions.push(index);', '// TODO: record this matching index.']], [[{text:'banana',target:'a'},[1,3,5],'Multiple matches'],[{text:'abc',target:'z'},[],'No matches'],[{text:'aaa',target:'a'},[0,1,2],'Every position']], 'Collect the position, not the character.', 'Appending each matching index and continuing the loop finds every occurrence in ascending order.');

  add(3, 'Count repeated tags', 'Return alphabetically sorted [tag, count] pairs for all tags.', String.raw`
function solve(tags) {
  const counts = new Map();
  for (const tag of tags) {
    const previous = counts.get(tag) ?? 0;
    counts.set(tag, previous + 1);
  }
  const entries = [...counts.entries()];
  entries.sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
  return entries;
}`, [['counts.set(tag, previous + 1);', 'counts.set(tag, 1);']], [[['b','a','b'],[['a',1],['b',2]],'Repeated tags'],[['__proto__','__proto__'],[['__proto__',2]],'Unusual tag name'],[[],[],'No tags']], 'Use the previous count when updating an existing tag.', 'A Map safely stores arbitrary string keys. Increment the previous count, then sort the resulting entries by tag.');
  add(3, 'Group names by team', 'Return [team, names] pairs in first-seen team order. Preserve name order within each team.', String.raw`
function solve(people) {
  const teams = new Map();
  for (const person of people) {
    if (!teams.has(person.team)) {
      teams.set(person.team, []);
    }
    const names = teams.get(person.team);
    names.push(person.name);
  }
  const result = [...teams.entries()];
  return result;
}`, [['names.push(person.name);', '// TODO: append this person to their team.']], [[[{name:'Ada',team:'red'},{name:'Bo',team:'blue'},{name:'Cy',team:'red'}],[['red',['Ada','Cy']],['blue',['Bo']]],'Two teams'],[[{name:'Jo',team:'x'}],[['x',['Jo']]],'One team'],[[],[],'No people']], 'The map already contains a separate array for each team.', 'Retrieve the team array and push the name into it. Map iteration preserves the first insertion order of team keys.');
  add(3, 'Select available products', 'Return names of products that are in stock and cost no more than the budget.', String.raw`
function solve(request) {
  const selected = [];
  const budget = request.budget;
  for (const product of request.products) {
    const affordable = product.price <= budget;
    const available = product.stock > 0;
    if (affordable && available) {
      selected.push(product.name);
    }
  }
  return selected;
}`, [['affordable && available', 'affordable || available']], [[{budget:5,products:[{name:'a',price:5,stock:1},{name:'b',price:9,stock:1},{name:'c',price:2,stock:0}]},['a'],'Both requirements'],[{budget:0,products:[{name:'free',price:0,stock:2}]},['free'],'Free item'],[{budget:10,products:[]},[],'No products']], 'Both availability and affordability must be true.', 'A product is selected only if it passes both independent tests. The price boundary includes a product costing exactly the budget.');
  add(3, 'Copy a profile before editing', 'Return the renamed profile together with the untouched original name.', String.raw`
function solve(request) {
  const original = request.profile;
  const updated = { ...original };
  updated.name = request.name;
  const result = {
    originalName: original.name,
    updatedName: updated.name,
    age: updated.age
  };
  return result;
}`, [['const updated = { ...original };', 'const updated = original;']], [[{profile:{name:'Ada',age:20},name:'Jo'},{originalName:'Ada',updatedName:'Jo',age:20},'Rename a copy'],[{profile:{name:'X',age:0},name:''},{originalName:'X',updatedName:'',age:0},'Empty new name'],[{profile:{name:'Bo',age:40},name:'Bo'},{originalName:'Bo',updatedName:'Bo',age:40},'Same name']], 'Assignment shares an object; it does not copy its properties.', 'Object spread creates a separate top-level object. Updating its name then leaves the original name intact.');
  add(3, 'Sort scores as numbers', 'Return scores from lowest to highest while leaving the input array order unchanged.', String.raw`
function solve(scores) {
  const originalOrder = scores.join(',');
  const sorted = [...scores];
  sorted.sort((a, b) => a - b);
  const unchanged = scores.join(',') === originalOrder;
  return {
    sorted,
    unchanged
  };
}`, [['sorted.sort((a, b) => a - b);', 'sorted.sort();']], [[[10,2,30],{sorted:[2,10,30],unchanged:true},'Different digit lengths'],[[-1,-10,0],{sorted:[-10,-1,0],unchanged:true},'Negative numbers'],[[],{sorted:[],unchanged:true},'Empty scores']], 'The default sort compares text representations.', 'A numeric comparator subtracts the second value from the first. Sorting the spread copy preserves the input array.');
  add(3, 'Apply defaults in the right order', 'Merge default options with supplied options, giving supplied values priority.', String.raw`
function solve(options) {
  const defaults = {
    theme: 'dark',
    limit: 10,
    enabled: true
  };
  const merged = { ...defaults, ...options };
  return {
    theme: merged.theme,
    limit: merged.limit,
    enabled: merged.enabled
  };
}`, [['{ ...defaults, ...options }', '{ ...options, ...defaults }']], [[{theme:'light',limit:0},{theme:'light',limit:0,enabled:true},'Override defaults'],[{}, {theme:'dark',limit:10,enabled:true},'No overrides'],[{enabled:false},{theme:'dark',limit:10,enabled:false},'Explicit false']], 'Later object properties overwrite earlier properties.', 'Spread defaults first and supplied options last. This also preserves intentional zero and false values.');
  add(3, 'Deduplicate IDs', 'Return only the first item for each ID, preserving the order in which IDs first appear.', String.raw`
function solve(items) {
  const seen = new Set();
  const unique = [];
  for (const item of items) {
    if (seen.has(item.id)) {
      continue;
    }
    seen.add(item.id);
    unique.push(item);
  }
  return unique;
}`, [['seen.add(item.id);', '// TODO: remember this ID before continuing.']], [[[{id:1,name:'a'},{id:1,name:'b'},{id:2,name:'c'}],[{id:1,name:'a'},{id:2,name:'c'}],'Repeated ID'],[[{id:0},{id:0}],[{id:0}],'Zero ID'],[[],[],'No items']], 'The seen set must change when a new item is accepted.', 'Record the ID before moving to the next item. Later objects with the same ID are skipped even if their other fields differ.');
  add(3, 'Read an optional address', 'Return the city, or Unknown when the profile or address or city is missing. Preserve an empty city string.', String.raw`
function solve(profile) {
  const fallback = 'Unknown';
  const city = profile?.address?.city;
  const label = city ?? fallback;
  const result = {
    city: label
  };
  return result;
}`, [['profile?.address?.city', 'profile.address.city']], [[{address:{city:'Lund'}},{city:'Lund'},'Present city'],[null,{city:'Unknown'},'Missing profile'],[{address:{city:''}},{city:''},'Empty string'],[{}, {city:'Unknown'},'Missing address']], 'Every optional step needs to tolerate a missing value.', 'Optional chaining safely stops when the profile or address is nullish. The final ?? supplies a fallback without replacing an empty string.');
  add(3, 'Total a shopping cart', 'Multiply each line price by its quantity, then sum all line totals.', String.raw`
function solve(cart) {
  let subtotal = 0;
  const lineTotals = [];
  for (const item of cart) {
    const line = item.price * item.quantity;
    lineTotals.push(line);
    subtotal += line;
  }
  return {
    lineTotals,
    subtotal
  };
}`, [['subtotal += line;', 'subtotal = line;']], [[[{price:3,quantity:2},{price:5,quantity:1}],{lineTotals:[6,5],subtotal:11},'Several lines'],[[{price:4,quantity:0}],{lineTotals:[0],subtotal:0},'Zero quantity'],[[],{lineTotals:[],subtotal:0},'Empty cart']], 'The subtotal must retain earlier line totals.', 'Each line is calculated independently. += accumulates those lines instead of replacing the subtotal with the latest line.');
  add(3, 'Index records by ID', 'Return names for each requested ID, using null for IDs that are absent.', String.raw`
function solve(request) {
  const byId = new Map();
  for (const record of request.records) {
    byId.set(record.id, record.name);
  }
  const names = [];
  for (const id of request.ids) {
    const name = byId.get(id) ?? null;
    names.push(name);
  }
  return names;
}`, [['byId.set(record.id, record.name);', 'byId.set(record.name, record.id);']], [[{records:[{id:1,name:'Ada'},{id:2,name:'Bo'}],ids:[2,9,1]},['Bo',null,'Ada'],'Lookup order'],[{records:[{id:0,name:''}],ids:[0]},[''],'Empty name'],[{records:[],ids:[3]},[null],'No records']], 'The requested lookup is by ID, so ID must be the key.', 'Map.set receives the key first and value second. Correct indexing lets requested IDs retrieve names in their own order.');
}
