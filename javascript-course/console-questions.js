// Keep IDs, answer order and existing questions stable: progress is saved by ID.
// All outputs are text/primitives, or explicitly joined/stringified collections,
// so the answers do not depend on a browser's object inspector formatting.
import { addAdvancedConsoleQuestions } from './console-questions-advanced.js';
import { addExpertConsoleQuestions } from './console-questions-expert.js';
export const CONSOLE_LEVELS = [
  'First outputs', 'Values & decisions', 'Strings & arrays', 'Loops & tracing',
  'Functions', 'Array transformations', 'Objects & references', 'Scope & closures',
  'Advanced patterns', 'Async & mixed challenges',
  'Async control flow', 'Data reshaping', 'Coercion & evaluation',
  'Reference & property rules', 'Closure & function patterns', 'Classes & inheritance',
  'Iterators & generators', 'Async composition', 'Recursive algorithms', 'Mixed mastery',
  'Iteration under mutation', 'Descriptors & interception', 'Construction & binding',
  'Generator protocols', 'Promise job ordering', 'Async coordination',
  'Graph traversal & caching', 'Dynamic programming & search',
  'Representation & serialization', 'Expert integration',
];

const questions = [];
function q(title, code, output, distractors, explanation) {
  const number = questions.length + 1;
  // Balanced but varied correct-answer positions, stable across expansions.
  const positions = [1, 3, 0, 2, 2, 0, 3, 1, 0, 3, 1, 2, 3, 2, 1, 0, 1, 0, 2, 3];
  const answer = positions[(number - 1) % positions.length];
  const choices = [...distractors];
  choices.splice(answer, 0, output);
  questions.push({ id: `console-${String(number).padStart(3, '0')}`, number,
    level: Math.floor((number - 1) / 10), title, code, choices, answer, explanation });
}

// 01–10: one output, then combine values and follow changes.
q('A first message', 'console.log("Hello, JavaScript!");', 'Hello, JavaScript!',
  ['"Hello, JavaScript!"', 'Hello', 'undefined'],
  'console.log prints the text inside the quotes. The quotes mark a string in your code; they are not part of the printed message.');
q('Add two numbers', 'console.log(4 + 3);', '7', ['43', '4 + 3', '12'],
  'Both values are numbers, so + adds them: 4 + 3 is 7.');
q('Read a variable', 'const score = 12;\nconsole.log(score);', '12', ['score', 'undefined', '0'],
  'score holds the number 12. Using its name reads that stored value.');
q('Join two strings', 'console.log("Java" + "Script");', 'JavaScript', ['Java Script', 'Java+Script', 'NaN'],
  'With strings, + joins the text. No space is added unless you include one in a string.');
q('Change a value', 'let points = 5;\npoints = 9;\nconsole.log(points);', '9', ['5', '14', 'undefined'],
  'The assignment replaces the old value. By the time console.log runs, points is 9.');
q('Update with addition', 'let coins = 4;\ncoins += 3;\nconsole.log(coins);', '7', ['4', '3', '43'],
  'coins += 3 means coins = coins + 3. The stored value changes from 4 to 7.');
q('Order of operations', 'console.log(2 + 3 * 4);', '14', ['20', '24', '9'],
  'Multiplication happens before addition: 3 * 4 is 12, then 2 + 12 is 14.');
q('Group an expression', 'console.log((2 + 3) * 4);', '20', ['14', '9', '24'],
  'Parentheses are evaluated first. The sum 2 + 3 becomes 5, then 5 * 4 is 20.');
q('Keep the remainder', 'const remainder = 17 % 5;\nconsole.log(remainder);', '2', ['3', '3.4', '12'],
  '% gives the remainder after division. Three groups of 5 use 15, leaving 2.');
q('Two moments in time', 'let count = 2;\nconsole.log(count);\ncount *= 3;\nconsole.log(count + 1);', '2\n7', ['2\n6', '6\n7', '7\n2'],
  'The first call prints 2. Multiplying updates count to 6, and the second call prints 6 + 1. Each call starts a new line.');

// 11–20: comparison, branching and the values returned by logical operators.
q('Compare numbers', 'const age = 16;\nconsole.log(age >= 18);', 'false', ['true', '16', '18'],
  '16 is less than 18, so the comparison evaluates to the boolean false.');
q('Compare types too', 'console.log(5 === "5");\nconsole.log(5 == "5");', 'false\ntrue', ['true\ntrue', 'false\nfalse', 'true\nfalse'],
  '=== compares without converting types, so a number differs from a string. == converts these values to comparable numbers, making the second comparison true.');
q('Inspect a type', 'const total = "8" + 2;\nconsole.log(typeof total);', 'string', ['number', '10', '82'],
  'A string operand makes + join text here, producing "82". typeof reports string, not the value itself.');
q('Choose a branch', 'const score = 70;\nif (score >= 80) {\n  console.log("Gold");\n} else {\n  console.log("Keep going");\n}', 'Keep going', ['Gold', 'Gold\nKeep going', 'false'],
  '70 >= 80 is false, so only the else block runs.');
q('Stop at the first match', 'const points = 85;\nif (points >= 50) {\n  console.log("Pass");\n} else if (points >= 80) {\n  console.log("Great");\n} else {\n  console.log("Retry");\n}', 'Pass', ['Great', 'Pass\nGreat', 'Retry'],
  'The first condition is already true. An if/else-if chain skips all later branches after a match, even if a later condition would also be true.');
q('Combine conditions', 'const age = 20;\nconst hasTicket = false;\nconsole.log(age >= 18 && hasTicket);', 'false', ['true', '20', 'undefined'],
  'The age check is true, but hasTicket is false. Both must be truthy for this boolean && expression to be true.');
q('Negate a condition', 'const closed = false;\nconst seats = 0;\nconsole.log(!closed && seats > 0);', 'false', ['true', '0', 'null'],
  '!closed becomes true. seats > 0 is false, so true && false evaluates to false.');
q('Choose a value', 'const items = 3;\nconst label = items === 1 ? "item" : "items";\nconsole.log(items + " " + label);', '3 items', ['3 item', 'items', 'true'],
  'The condition is false, so the ternary chooses "items". Joining items, a space, and label prints "3 items".');
q('Use a fallback', 'const nickname = "";\nconst displayName = nickname || "Guest";\nconsole.log(displayName);', 'Guest', ['true', 'false', 'undefined'],
  'The empty string is falsy. || returns the right operand when the left one is falsy; it does not necessarily return a boolean.');
q('Zero is still a value', 'const score = 0;\nconsole.log(score || 10);\nconsole.log(score ?? 10);', '10\n0', ['10\n10', '0\n0', '0\n10'],
  '|| replaces any falsy value, including 0. ?? uses its fallback only for null or undefined, so it preserves 0.');

// 21–30: indexing, string transformations and array mutation.
q('Count characters', 'const word = "planet";\nconsole.log(word.length);', '6', ['5', '7', 'planet'],
  'length counts the six characters in this string. Indexes start at zero, but the length is still 6.');
q('Read by index', 'const word = "code";\nconsole.log(word[0] + word[3]);', 'ce', ['co', 'cd', 'undefinede'],
  'Index 0 is c and index 3 is e. + joins the two characters.');
q('Insert a calculation', 'const name = "Mira";\nconst age = 19;\nconsole.log(`${name}: ${age + 1}`);', 'Mira: 20', ['Mira: 19', '${name}: ${age + 1}', 'Mira: 191'],
  'Template literals evaluate expressions inside ${...}. age + 1 is numeric addition, so it inserts 20.');
q('Chain string methods', 'const tag = "  Hello  ";\nconsole.log(tag.trim().toUpperCase());', 'HELLO', ['Hello', '  HELLO  ', 'hello'],
  'trim removes spaces at the ends, then toUpperCase turns the remaining letters into uppercase.');
q('Slice a string', 'const word = "javascript";\nconsole.log(word.slice(4, 7));', 'scr', ['script', 'asc', 'scri'],
  'slice starts at index 4 (s) and stops before index 7. It includes indexes 4, 5 and 6: scr.');
q('Index an array', 'const colors = ["red", "green", "blue"];\nconsole.log(colors[1], colors.length);', 'green 3', ['red 3', 'green 2', 'blue 3'],
  'Index 1 is the second element, green. The array contains three elements. Arguments to one console.log call are shown separated by a space.');
q('Append then read', 'const scores = [2, 4];\nscores.push(6);\nconsole.log(scores.length, scores[2]);', '3 6', ['2 6', '3 undefined', '6 3'],
  'push adds 6 at index 2. The new length is 3. const prevents reassigning scores; it does not prevent changing the array.');
q('Remove the last item', 'const letters = ["a", "b", "c"];\nconst last = letters.pop();\nconsole.log(last, letters.join("-"));', 'c a-b', ['b a-c', 'c a-b-c', 'a b-c'],
  'pop removes and returns c. The remaining array joins to "a-b".');
q('Split, reverse, join', 'const text = "sun-moon-star";\nconsole.log(text.split("-").reverse().join(" / "));', 'star / moon / sun', ['sun / moon / star', 'star-moon-sun', 'rats-noom-nus'],
  'split creates three words, reverse reverses their order, and join places " / " between them. Individual words are not reversed.');
q('Copy a slice', 'const numbers = [1, 2, 3, 4];\nconst middle = numbers.slice(1, 3);\nmiddle[0] = 9;\nconsole.log(numbers.join(","));\nconsole.log(middle.join(","));', '1,2,3,4\n9,3', ['1,9,3,4\n9,3', '1,2,3,4\n9,3,4', '1,2,3,4\n2,3'],
  'slice copies indexes 1 and 2 into a new array. Replacing a number in that new array does not change the original array.');

// 31–40: trace repetition, conditions within loops and nested loops.
q('Count from zero', 'for (let i = 0; i < 3; i++) {\n  console.log(i);\n}', '0\n1\n2', ['1\n2\n3', '0\n1\n2\n3', '3'],
  'The loop prints 0, 1 and 2. After i becomes 3, i < 3 is false and the loop ends.');
q('Include the boundary', 'let total = 0;\nfor (let i = 1; i <= 3; i++) {\n  total += i;\n}\nconsole.log(total);', '6', ['3', '4', '7'],
  'The inclusive <= condition includes 3. total becomes 1, then 3, then 6.');
q('Use a larger step', 'let text = "";\nfor (let i = 2; i <= 6; i += 2) {\n  text += i;\n}\nconsole.log(text);', '246', ['12', '23456', '24'],
  'The loop visits 2, 4 and 6. text starts as a string, so += concatenates the numbers as text.');
q('While a value changes', 'let n = 10;\nlet steps = 0;\nwhile (n > 1) {\n  n = Math.floor(n / 2);\n  steps++;\n}\nconsole.log(n, steps);', '1 3', ['0 4', '2 2', '1 4'],
  'n becomes 5, then 2, then 1. That is three iterations, and the loop stops when n is no longer greater than 1.');
q('Run before checking', 'let n = 5;\ndo {\n  n += 2;\n} while (n < 3);\nconsole.log(n);', '7', ['5', '3', '9'],
  'A do/while loop runs its body once before testing its condition. n becomes 7, then the false condition stops repetition.');
q('Stop early', 'let total = 0;\nfor (let i = 1; i <= 5; i++) {\n  if (i === 4) break;\n  total += i;\n}\nconsole.log(total);', '6', ['10', '15', '3'],
  'The loop adds 1, 2 and 3. At 4, break exits before the addition, leaving 6.');
q('Skip an iteration', 'let total = 0;\nfor (let i = 1; i <= 5; i++) {\n  if (i % 2 === 0) continue;\n  total += i;\n}\nconsole.log(total);', '9', ['15', '6', '5'],
  'continue skips the addition for even numbers. Only 1, 3 and 5 contribute, giving 9.');
q('Loop over values', 'const prices = [3, 5, 2];\nlet total = 1;\nfor (const price of prices) {\n  total *= price;\n}\nconsole.log(total);', '30', ['10', '0', '15'],
  'for...of reads array values. Starting at 1, the running product becomes 3, then 15, then 30.');
q('A loop inside a loop', 'let count = 0;\nfor (let row = 0; row < 2; row++) {\n  for (let col = 0; col < 3; col++) {\n    count++;\n  }\n}\nconsole.log(count);', '6', ['5', '3', '9'],
  'Each of two outer iterations runs the inner loop three times. count increases 2 × 3 = 6 times.');
q('Trace dependent loops', 'let total = 0;\nfor (let i = 1; i <= 3; i++) {\n  for (let j = 1; j <= i; j++) {\n    total += j;\n  }\n}\nconsole.log(total);', '10', ['6', '9', '14'],
  'For i = 1 the inner sum is 1; for i = 2 it is 1 + 2 = 3; for i = 3 it is 1 + 2 + 3 = 6. Together they make 10.');

// 41–50: parameters, return values, composition and recursion.
q('Return a calculation', 'function double(n) {\n  return n * 2;\n}\nconsole.log(double(4) + 1);', '9', ['8', '10', 'undefined'],
  'double(4) returns 8. The outer expression adds 1 before printing.');
q('Parameters are local', 'let value = 3;\nfunction increase(value) {\n  value += 2;\n  return value;\n}\nconsole.log(increase(value), value);', '5 3', ['5 5', '3 3', '3 5'],
  'The parameter is a separate local variable holding a copy of the number. Changing it does not reassign the outer value.');
q('Default arguments', 'function greet(name = "Guest") {\n  return "Hi " + name;\n}\nconsole.log(greet());\nconsole.log(greet("Sam"));', 'Hi Guest\nHi Sam', ['Hi undefined\nHi Sam', 'Hi Guest\nHi Guest', 'Hi Sam\nHi Guest'],
  'The missing argument uses the default "Guest". Passing "Sam" supplies the parameter directly.');
q('Exit a function early', 'function label(n) {\n  if (n < 0) return "negative";\n  if (n === 0) return "zero";\n  return "positive";\n}\nconsole.log(label(-2), label(0));', 'negative zero', ['positive zero', 'negative positive', 'zero negative'],
  'A return exits the function immediately. -2 matches the first branch; 0 reaches the second branch.');
q('Printing versus returning', 'function show(n) {\n  console.log(n * 2);\n}\nconst result = show(3);\nconsole.log(result);', '6\nundefined', ['6', 'undefined\n6', '6\n6'],
  'show prints 6 but has no return statement. Its return value is undefined, which the final console.log prints.');
q('Compose function calls', 'const addOne = n => n + 1;\nconst triple = n => n * 3;\nconsole.log(triple(addOne(2)));', '9', ['7', '6', '8'],
  'The inner addOne(2) runs first and returns 3. triple then receives 3 and returns 9.');
q('Pass a callback', 'function applyTwice(value, fn) {\n  return fn(fn(value));\n}\nconsole.log(applyTwice(2, n => n + 3));', '8', ['5', '10', '12'],
  'The callback runs on 2, producing 5, then on 5, producing 8. It adds 3 twice.');
q('Collect rest arguments', 'function total(first, ...rest) {\n  return first + rest.length;\n}\nconsole.log(total(10, 20, 30, 40));', '13', ['100', '14', '10'],
  'first is 10. rest contains the other three arguments, so the function returns 10 + 3.');
q('Defaults and undefined', 'function multiply(a, b = 2) {\n  return a * b;\n}\nconsole.log(multiply(3, undefined));\nconsole.log(multiply(3, null));', '6\n0', ['6\n6', 'NaN\n0', '6\nnull'],
  'undefined activates the default b = 2. null does not activate a default and is converted to 0 by multiplication.');
q('Follow recursive returns', 'function sum(n) {\n  if (n === 0) return 0;\n  return n + sum(n - 1);\n}\nconsole.log(sum(4));', '10', ['4', '24', '6'],
  'The calls expand to 4 + 3 + 2 + 1 + 0. The base case at zero stops recursion, and the returns add to 10.');

// 51–60: array callbacks and combinations of transformations.
q('Transform every item', 'const values = [1, 3, 5];\nconsole.log(values.map(n => n * 2).join(","));', '2,6,10', ['1,3,5', '2,4,6', '10,6,2'],
  'map calls the callback for each element and collects each returned value in a new array.');
q('Keep matching values', 'const values = [2, 5, 8, 1];\nconsole.log(values.filter(n => n > 3).join(","));', '5,8', ['2,1', 'true,true', '8,5'],
  'filter retains elements whose callback returns a truthy value. 5 and 8 pass, in their original order.');
q('Use the callback index', 'const values = [10, 10, 10];\nconsole.log(values.map((n, index) => n + index).join(","));', '10,11,12', ['11,12,13', '10,10,10', '0,1,2'],
  'The second map argument is the zero-based index. The additions are 10 + 0, 10 + 1 and 10 + 2.');
q('Reduce from an initial value', 'const result = [2, 3, 4].reduce((sum, n) => sum + n, 10);\nconsole.log(result);', '19', ['9', '24', '10'],
  'The accumulator starts at 10, then becomes 12, 15 and 19. The initial value is included in the sum.');
q('Find the first match', 'const values = [1, 4, 6, 8];\nconsole.log(values.find(n => n % 2 === 0));\nconsole.log(values.filter(n => n % 2 === 0).length);', '4\n3', ['4\n4', '6\n3', '3\n4'],
  'find returns the first matching value, 4. filter collects all three even values, so its result has length 3.');
q('Some versus every', 'const values = [2, 4, 7];\nconsole.log(values.some(n => n % 2 === 0));\nconsole.log(values.every(n => n % 2 === 0));', 'true\nfalse', ['true\ntrue', 'false\ntrue', 'false\nfalse'],
  'some needs at least one even number and succeeds. every requires all numbers to be even, but 7 fails.');
q('Sort numbers deliberately', 'const values = [10, 2, 1];\nconsole.log([...values].sort().join(","));\nconsole.log(values.sort((a, b) => a - b).join(","));', '1,10,2\n1,2,10', ['1,2,10\n1,2,10', '10,2,1\n1,2,10', '1,10,2\n10,2,1'],
  'Default sort compares string forms, putting "10" before "2". The numeric comparator sorts by numeric value. The spread copy keeps the first sort separate.');
q('Filter then transform', 'const result = [1, 2, 3, 4, 5]\n  .filter(n => n % 2 === 1)\n  .map(n => n * n);\nconsole.log(result.join(","));', '1,9,25', ['1,4,9,16,25', '4,16', '1,3,5'],
  'Filtering keeps odd values 1, 3 and 5. map then squares each surviving value.');
q('Flatten callback results', 'const result = [1, 2, 3].flatMap(n => [n, n * 10]);\nconsole.log(result.join(","));', '1,10,2,20,3,30', ['1,2,3,10,20,30', '10,20,30', '1,10,20,30'],
  'Each callback returns a pair. flatMap flattens those pairs by one level, preserving their sequence.');
q('Build a transformation pipeline', 'const result = [2, 5, 8, 11]\n  .map(n => n - 1)\n  .filter(n => n % 2 === 0)\n  .reduce((sum, n) => sum + n, 0);\nconsole.log(result);', '14', ['12', '22', '26'],
  'map produces [1, 4, 7, 10]. filter keeps [4, 10]. reduce adds them to get 14.');

// 61–70: properties, identity, destructuring and shallow copies.
q('Compute a property name', 'const user = { name: "Ava", points: 7 };\nconst key = "points";\nconsole.log(user[key] + 2);', '9', ['7', 'undefined', 'NaN'],
  'Bracket notation evaluates key, so user[key] reads user.points, which is 7.');
q('Share an object', 'const first = { score: 1 };\nconst second = first;\nsecond.score = 9;\nconsole.log(first.score, second.score);', '9 9', ['1 9', '1 1', '9 1'],
  'Both variables refer to the same object. Editing through second is visible through first too.');
q('Copy top-level properties', 'const original = { score: 2 };\nconst copy = { ...original };\ncopy.score = 8;\nconsole.log(original.score, copy.score);', '2 8', ['8 8', '2 2', '8 2'],
  'Object spread creates a new object. Its score property holds a separate number, so changing copy.score leaves original.score alone.');
q('Unpack and rename', 'const user = { name: "Ada", score: 4 };\nconst { name: label, score = 10, rank = 1 } = user;\nconsole.log(label, score, rank);', 'Ada 4 1', ['Ada 10 1', 'undefined 4 1', 'Ada 4 undefined'],
  'name is assigned to the variable label. The existing score stays 4; the missing rank uses its default 1.');
q('Read a missing nested value', 'const user = { profile: null };\nconsole.log(user.profile?.name ?? "Anonymous");', 'Anonymous', ['null', 'undefined', 'TypeError'],
  'Optional chaining stops when profile is null and yields undefined. ?? then supplies "Anonymous".');
q('Rest after destructuring', 'const [first, , ...rest] = [3, 6, 9, 12];\nconsole.log(first, rest.join("-"));', '3 9-12', ['3 6-9-12', '6 9-12', '3 12'],
  'first receives 3. The empty slot skips 6. The rest array contains the remaining 9 and 12.');
q('Later properties win', 'const defaults = { theme: "dark", size: 12 };\nconst settings = { ...defaults, size: 16, theme: "light" };\nconsole.log(settings.theme, settings.size);', 'light 16', ['dark 12', 'dark 16', 'light 12'],
  'Properties written after a spread overwrite matching properties copied earlier. Both theme and size are replaced.');
q('Call an object method', 'const counter = {\n  value: 4,\n  add(n) {\n    this.value += n;\n    return this.value;\n  }\n};\nconsole.log(counter.add(3), counter.value);', '7 7', ['7 4', '4 7', 'undefined 7'],
  'Calling counter.add sets this to counter. The method updates value to 7 and returns 7 before the second argument is read.');
q('Look inside a shallow copy', 'const original = { info: { score: 2 }, name: "A" };\nconst copy = { ...original };\ncopy.info.score = 7;\ncopy.name = "B";\nconsole.log(original.info.score, original.name);', '7 A', ['2 A', '7 B', '2 B'],
  'Spread copies only the top level. Both info properties still reference one nested object, but name is a separate string property.');
q('Compare identity and contents', 'const a = { n: 1 };\nconst b = { n: 1 };\nconst c = a;\nconsole.log(a === b, a === c, a.n === b.n);', 'false true true', ['true true true', 'false false true', 'false true false'],
  'a and b are different objects despite equal contents. c refers to a itself. The numeric properties are both 1, so their comparison is true.');

// 71–80: lexical bindings, captured variables and stateful functions.
q('Shadow a block variable', 'let value = "outer";\n{\n  let value = "inner";\n  console.log(value);\n}\nconsole.log(value);', 'inner\nouter', ['inner\ninner', 'outer\nouter', 'outer\ninner'],
  'The block has its own value binding. It hides the outer binding only inside the braces.');
q('Function scope with var', 'function check() {\n  var value = 1;\n  if (true) {\n    var value = 2;\n  }\n  return value;\n}\nconsole.log(check());', '2', ['1', 'undefined', 'ReferenceError'],
  'var is scoped to the function, not the if block. Both declarations refer to the same binding, which is assigned 2.');
q('Read a hoisted var', 'function check() {\n  console.log(value);\n  var value = 4;\n  console.log(value);\n}\ncheck();', 'undefined\n4', ['4\n4', 'ReferenceError', 'null\n4'],
  'The var binding exists from function entry with value undefined. The assignment to 4 happens only when that line runs.');
q('Catch an early let read', 'let value = "outside";\ntry {\n  console.log(value);\n  let value = "inside";\n} catch (error) {\n  console.log(error.name);\n}', 'ReferenceError', ['outside', 'undefined', 'inside'],
  'The inner let binding shadows the outer one throughout the block, but is uninitialized before its declaration. Reading it throws a ReferenceError, which the catch prints.');
q('Remember a parameter', 'function makeAdder(amount) {\n  return n => n + amount;\n}\nconst addFive = makeAdder(5);\nconsole.log(addFive(3), addFive(8));', '8 13', ['3 8', '5 5', '8 8'],
  'The returned function closes over amount = 5. Each call adds that retained value to its new argument.');
q('Keep private state', 'function makeCounter() {\n  let count = 0;\n  return () => ++count;\n}\nconst next = makeCounter();\nconsole.log(next(), next(), next());', '1 2 3', ['0 1 2', '1 1 1', '3 3 3'],
  'All three calls share one captured count. Prefix ++ increments before returning, and arguments are evaluated left to right.');
q('Separate closure instances', 'function makeCounter() {\n  let count = 0;\n  return () => ++count;\n}\nconst a = makeCounter();\nconst b = makeCounter();\nconsole.log(a(), a(), b(), a());', '1 2 1 3', ['1 2 3 4', '1 1 1 1', '1 2 1 2'],
  'Each call to makeCounter creates its own count. a advances three times; b advances once.');
q('Capture a live binding', 'let value = 2;\nconst read = () => value;\nvalue = 7;\nconsole.log(read());', '7', ['2', 'undefined', 'ReferenceError'],
  'A closure reads the variable binding when it runs, not a frozen copy from when it was created. value is now 7.');
q('Capture loop bindings', 'const functions = [];\nfor (let i = 0; i < 3; i++) {\n  functions.push(() => i);\n}\nconsole.log(functions.map(fn => fn()).join(","));', '0,1,2', ['3,3,3', '2,2,2', '1,2,3'],
  'A for loop with let gives each iteration its own i binding. Each callback retains its particular iteration value.');
q('Capture one shared var', 'const functions = [];\nfor (var i = 0; i < 3; i++) {\n  functions.push(() => i);\n}\nconsole.log(functions.map(fn => fn()).join(","));', '3,3,3', ['0,1,2', '2,2,2', '1,2,3'],
  'var creates one shared binding. The callbacks run after the loop ends, when that single i has reached 3.');

// 81–90: collections, methods, evaluation order and structured reasoning.
q('Deduplicate values', 'const values = new Set([1, 2, 2, 3, 1]);\nvalues.add(2);\nconsole.log(values.size, [...values].join(","));', '3 1,2,3', ['4 1,2,3,2', '5 1,2,2,3,1', '3 3,2,1'],
  'Set retains each distinct value once, in insertion order. Adding 2 again does not change it.');
q('Distinguish Map keys', 'const map = new Map();\nmap.set(1, "number");\nmap.set("1", "string");\nmap.set(1, "updated");\nconsole.log(map.size, map.get(1), map.get("1"));', '2 updated string', ['1 updated updated', '3 updated string', '2 number string'],
  'A Map distinguishes number 1 from string "1". Setting number 1 again replaces its value without adding a third key.');
q('Bind a method', 'const player = {\n  score: 4,\n  read() { return this.score; }\n};\nconst bound = player.read.bind({ score: 9 });\nconsole.log(player.read(), bound());', '4 9', ['4 4', '9 9', '4 undefined'],
  'The direct method call uses player as this. bind creates another function with this fixed to the supplied object.');
q('Resolve an inherited method', 'class Base {\n  value() { return 2; }\n}\nclass Child extends Base {\n  value() { return super.value() + 3; }\n}\nconsole.log(new Child().value());', '5', ['2', '3', 'undefined'],
  'The Child method calls the Base implementation through super, gets 2, then adds 3.');
q('Read through a getter', 'const box = {\n  count: 1,\n  get next() { return ++this.count; }\n};\nconsole.log(box.next, box.next, box.count);', '2 3 3', ['2 2 1', '1 2 3', '3 3 3'],
  'Each next property access runs the getter. Left to right, count becomes 2 and then 3; the last argument reads 3.');
q('Trace switch fall-through', 'let text = "";\nswitch (2) {\n  case 1: text += "A";\n  case 2: text += "B";\n  case 3: text += "C"; break;\n  default: text += "D";\n}\nconsole.log(text);', 'BC', ['B', 'ABC', 'BCD'],
  'Execution starts at case 2. Without a break there, it continues through case 3, then stops at that break.');
q('A return inside finally', 'function choose() {\n  try {\n    return "try";\n  } finally {\n    return "finally";\n  }\n}\nconsole.log(choose());', 'finally', ['try', 'try\nfinally', 'undefined'],
  'finally runs before the function completes. Its own return replaces the pending return from try. Returning in finally can hide earlier results or errors.');
q('Short-circuit side effects', 'let count = 0;\nconst a = false && ++count;\nconst b = true || ++count;\nconst c = null ?? ++count;\nconsole.log(count, a, b, c);', '1 false true 1', ['3 1 2 3', '0 false true null', '1 false true true'],
  'false && skips its right operand, and true || skips its right operand. null ?? evaluates its fallback, incrementing count once and returning 1.');
q('Understand prefix and postfix', 'let n = 2;\nconst result = n++ + ++n;\nconsole.log(result, n);', '6 4', ['5 4', '7 4', '6 3'],
  'n++ returns 2 and then changes n to 3. ++n changes it to 4 and returns 4. The sum is 6 and the final n is 4.');
q('Copy an array of objects', 'const original = [{ n: 1 }, { n: 2 }];\nconst copy = original.map(item => ({ ...item }));\ncopy[0].n += 4;\nconst total = original.concat(copy).reduce((sum, item) => sum + item.n, 0);\nconsole.log(original[0].n, copy[0].n, total);', '1 5 10', ['5 5 14', '1 5 8', '1 1 6'],
  'map and object spread create new top-level objects, so original[0].n stays 1 while copy[0].n becomes 5. The combined values 1, 2, 5 and 2 sum to 10.');

// 91–100: promise order, async suspension and combined concepts.
q('A promise callback runs later', 'console.log("start");\nPromise.resolve().then(() => console.log("promise"));\nconsole.log("end");', 'start\nend\npromise', ['start\npromise\nend', 'promise\nstart\nend', 'end\nstart\npromise'],
  'Synchronous code prints start and end first. The promise callback runs as a microtask after this synchronous work finishes.');
q('Pass a value along a chain', 'Promise.resolve(3)\n  .then(n => n * 2)\n  .then(n => n + 1)\n  .then(n => console.log(n));', '7', ['6', '4', '3'],
  'Each returned value becomes the next callback input: 3 becomes 6, then 7, which the last callback prints.');
q('Recover from a rejection', 'Promise.resolve(2)\n  .then(() => { throw new Error("oops"); })\n  .catch(() => 5)\n  .then(n => console.log(n + 1));', '6', ['3', '5', 'oops'],
  'Throwing rejects the chain. catch handles that rejection and returns 5, so the following then receives 5 and prints 6.');
q('Pause at await', 'async function run() {\n  console.log("A");\n  await Promise.resolve();\n  console.log("B");\n}\nrun();\nconsole.log("C");', 'A\nC\nB', ['A\nB\nC', 'C\nA\nB', 'B\nA\nC'],
  'run starts synchronously and prints A. await suspends it even for an already fulfilled promise, so C prints before run resumes with B.');
q('Promise.all preserves input order', 'async function run() {\n  const slow = Promise.resolve().then(() => 1);\n  const fast = Promise.resolve(2);\n  const values = await Promise.all([slow, fast, 3]);\n  console.log(values.join(","));\n}\nrun();', '1,2,3', ['2,3,1', '3,2,1', '2,1,3'],
  'Promise.all produces values in the input order, regardless of which promise settles first. A plain value such as 3 is accepted too.');
q('Await does not await array elements', 'async function run() {\n  const values = await [1, 2].map(async n => n * 2);\n  console.log(values[0] instanceof Promise);\n  console.log((await Promise.all(values)).join(","));\n}\nrun();', 'true\n2,4', ['false\n2,4', 'true\n1,2', 'false\n1,2'],
  'An async callback returns a promise for each element. Awaiting the array itself leaves those promises inside it; Promise.all then waits for their values.');
q('Interleave promise microtasks', 'Promise.resolve()\n  .then(() => console.log("A"))\n  .then(() => console.log("B"));\nPromise.resolve().then(() => console.log("C"));\nconsole.log("D");', 'D\nA\nC\nB', ['D\nA\nB\nC', 'A\nC\nB\nD', 'D\nC\nA\nB'],
  'D is synchronous. A and C are already queued, in that order. Only after A finishes is B queued, behind C.');
q('Combine a closure with async calls', 'function makeCounter() {\n  let count = 0;\n  return async () => {\n    const before = count++;\n    await Promise.resolve();\n    return `${before}:${count}`;\n  };\n}\nasync function run() {\n  const next = makeCounter();\n  const results = await Promise.all([next(), next()]);\n  console.log(results.join(" | "));\n}\nrun();', '0:2 | 1:2', ['0:1 | 1:2', '1:2 | 2:2', '0:0 | 1:1'],
  'Both calls increment the shared count before either resumes. They save separate before values 0 and 1, but both read the now-shared count of 2 after await.');
q('Finally preserves a fulfilled value', 'Promise.resolve(2)\n  .then(n => n * 3)\n  .finally(() => 99)\n  .then(n => { throw n + 1; })\n  .catch(n => n * 2)\n  .then(n => console.log(n));', '14', ['198', '12', '200'],
  'The chain reaches 6. A normally returning finally preserves that value, ignoring 99. The next callback throws 7; catch recovers with 14, which is printed.');
q('Trace shared state across await', 'async function run() {\n  let total = 0;\n  const jobs = [1, 2, 3].map(async n => {\n    const snapshot = total;\n    await Promise.resolve();\n    total = snapshot + n;\n    return total;\n  });\n  const values = await Promise.all(jobs);\n  console.log(values.join(","));\n  console.log(total);\n}\nrun();', '1,2,3\n3', ['1,3,6\n6', '1,2,3\n6', '3,3,3\n3'],
  'All three callbacks save snapshot = 0 before their first await. They then resume in order, assigning total to 1, 2 and 3, rather than accumulating. Each returns its own assigned number, and the final total is 3.');

addAdvancedConsoleQuestions(q);
addExpertConsoleQuestions(q);
export const CONSOLE_QUESTIONS = questions;
