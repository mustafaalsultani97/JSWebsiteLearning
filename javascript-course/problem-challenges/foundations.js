import { addChallenge } from './helpers.js';
export function addFoundations(list) {
  const add = (level, ...args) => addChallenge(list, level, ...args);
  add(0, 'Repair a shopping total', 'Return the total cost after multiplying price by quantity and adding delivery.', String.raw`
function solve(order) {
  const price = order.price;
  const quantity = order.quantity;
  const delivery = order.delivery;
  const subtotal = price * quantity;
  const total = subtotal + delivery;
  return total;
}`, [['price * quantity', 'price + quantity']], [[{price:8,quantity:3,delivery:2},26,'Three items plus delivery'],[{price:5,quantity:0,delivery:0},0,'An empty order'],[{price:2.5,quantity:4,delivery:1},11,'A decimal price']], 'Trace the subtotal before adding delivery.', 'A unit price must be multiplied by the number of units. Delivery is then added once to the subtotal.');
  add(0, 'Return the temperature', 'Convert a Celsius reading to Fahrenheit and return the number.', String.raw`
function solve(celsius) {
  const scale = 9 / 5;
  const offset = 32;
  const scaled = celsius * scale;
  const fahrenheit = scaled + offset;
  return fahrenheit;
}`, [['return fahrenheit;', '// TODO: send the calculated temperature back to the caller.']], [[0,32,'Freezing point'],[100,212,'Boiling point'],[-40,-40,'A negative reading']], 'Printing a value is different from returning it.', 'The arithmetic already calculates Fahrenheit. return makes that value available to the caller and to the checks.');
  add(0, 'Keep a changing score', 'Start from the supplied score, add the bonus, subtract the penalty, and return the final score.', String.raw`
function solve(round) {
  let score = round.start;
  const bonus = round.bonus;
  const penalty = round.penalty;
  score += bonus;
  score -= penalty;
  return score;
}`, [['let score', 'const score']], [[{start:10,bonus:5,penalty:2},13,'Bonus and penalty'],[{start:0,bonus:0,penalty:0},0,'No changes'],[{start:2,bonus:1,penalty:5},-2,'A negative final score']], 'Which declaration permits reassignment?', 'The score variable changes twice, so its binding must use let. The bonus and penalty values can remain const.');
  add(0, 'Include the minimum age', 'Return admitted for ages at least the minimum, otherwise return wait.', String.raw`
function solve(visitor) {
  const age = visitor.age;
  const minimum = visitor.minimum;
  let result = 'wait';
  if (age >= minimum) {
    result = 'admitted';
  }
  return result;
}`, [['age >= minimum', 'age > minimum']], [[{age:18,minimum:18},'admitted','Exactly the minimum'],[{age:17,minimum:18},'wait','Below the minimum'],[{age:21,minimum:18},'admitted','Above the minimum']], 'Check the exact boundary, not just values above it.', 'At least includes equality. The >= comparison admits someone whose age is exactly the minimum.');
  add(0, 'Convert an entered amount', 'Read a numeric price supplied as text, add a numeric fee, and return a number.', String.raw`
function solve(payment) {
  const enteredPrice = payment.price;
  const fee = payment.fee;
  const price = Number(enteredPrice);
  const total = price + fee;
  return total;
}`, [['Number(enteredPrice)', 'enteredPrice']], [[{price:'12',fee:3},15,'Text price'],[{price:'0',fee:2},2,'Zero price'],[{price:'2.5',fee:0.5},3,'Decimal text']], 'Inspect the type of the value before adding.', 'Number converts the entered string into a number. Without conversion, + joins the text and fee instead of adding them.');
  add(0, 'Finish a greeting', 'Return Hello, NAME! after trimming spaces from the supplied name.', String.raw`
function solve(name) {
  const cleaned = name.trim();
  const prefix = 'Hello, ';
  const suffix = '!';
  const greeting = prefix + cleaned + suffix;
  return greeting;
}`, [['const greeting = prefix + cleaned + suffix;', '// TODO: build greeting from the three parts.']], [[' Ada ','Hello, Ada!','Trim outside spaces'],['Sam','Hello, Sam!','A plain name'],['  Jo Lee  ','Hello, Jo Lee!','Preserve spaces within a name']], 'Join the prepared prefix, cleaned name and suffix.', 'The name is trimmed once. Concatenating the three pieces preserves the comma, space and final exclamation mark.');
  add(0, 'Report a remainder', 'Split items into full boxes and return the number of items left over.', String.raw`
function solve(shipment) {
  const items = shipment.items;
  const capacity = shipment.capacity;
  const fullBoxes = Math.floor(items / capacity);
  const packed = fullBoxes * capacity;
  const leftover = items - packed;
  return leftover;
}`, [['items - packed', 'items / capacity']], [[{items:17,capacity:5},2,'Some items remain'],[{items:12,capacity:4},0,'Exact fit'],[{items:2,capacity:5},2,'Less than one box']], 'Subtract the number already packed from the total.', 'Flooring the division counts complete boxes. Multiplying by capacity gives packed items, and subtracting those leaves the remainder.');
  add(0, 'Require both entry conditions', 'Return allowed only when the visitor has a ticket and the venue is open.', String.raw`
function solve(visit) {
  const hasTicket = visit.hasTicket;
  const isOpen = visit.isOpen;
  let result = 'denied';
  if (hasTicket && isOpen) {
    result = 'allowed';
  }
  return result;
}`, [['hasTicket && isOpen', 'hasTicket || isOpen']], [[{hasTicket:true,isOpen:true},'allowed','Both conditions'],[{hasTicket:true,isOpen:false},'denied','Closed venue'],[{hasTicket:false,isOpen:true},'denied','Missing ticket']], 'The rule requires two true values together.', 'Logical AND requires both conditions. OR would admit someone when only one condition is true.');
  add(0, 'Preserve a zero setting', 'Return the configured limit, using 10 only when the limit is null or absent.', String.raw`
function solve(settings) {
  const fallback = 10;
  const configured = settings.limit;
  const limit = configured ?? fallback;
  const result = { limit };
  return result;
}`, [['configured ?? fallback', 'configured || fallback']], [[{limit:0},{limit:0},'Zero is intentional'],[{}, {limit:10},'Absent setting'],[{limit:4},{limit:4},'A positive setting']], 'Zero is falsy but is still a valid limit.', 'Nullish coalescing replaces only null or undefined. Logical OR would also replace a valid zero.');
  add(0, 'Choose the right price band', 'Return premium for scores at least 90, standard for at least 60, and basic otherwise.', String.raw`
function solve(score) {
  let band;
  if (score >= 90) {
    band = 'premium';
  } else if (score >= 60) {
    band = 'standard';
  } else {
    band = 'basic';
  }
  return band;
}`, [["band = 'standard';", '// TODO: assign the middle band.']], [[90,'premium','Top boundary'],[60,'standard','Middle boundary'],[59,'basic','Below the middle band']], 'Follow the branches for a score of exactly 60.', 'The first matching branch wins. The middle branch assigns standard only after the premium test has failed.');

  add(1, 'Visit every array element', 'Return the sum of all numbers, including the last item. An empty array totals zero.', String.raw`
function solve(numbers) {
  let total = 0;
  for (let index = 0; index < numbers.length; index++) {
    const value = numbers[index];
    total += value;
  }
  return total;
}`, [['index < numbers.length', 'index < numbers.length - 1']], [[[2,4,6],12,'All three items'],[[7],7,'One item'],[[],0,'No items']], 'An array of length 3 has indexes 0, 1 and 2.', 'The loop must visit indexes strictly below length. Subtracting one from the bound skips the final element.');
  add(1, 'Build a doubled list', 'Return a new array containing every input number doubled.', String.raw`
function solve(numbers) {
  const result = [];
  for (const number of numbers) {
    const doubled = number * 2;
    result.push(doubled);
  }
  return result;
}`, [['result.push(doubled);', '// TODO: append doubled to the result.']], [[[1,3,5],[2,6,10],'Several numbers'],[[-2,0],[-4,0],'Negative and zero'],[[],[],'Empty list']], 'The calculated value must be added to the result array.', 'push adds each doubled value in order. Returning the array after the loop includes all results, including an empty result for empty input.');
  add(1, 'Count only positive values', 'Count numbers greater than zero. Zero and negative numbers do not count.', String.raw`
function solve(numbers) {
  let count = 0;
  for (const number of numbers) {
    if (number > 0) {
      count += 1;
    }
  }
  return count;
}`, [['number > 0', 'number >= 0']], [[[0,2,-1,3],2,'Mixed signs'],[[0,0],0,'Only zero'],[[],0,'No values']], 'Positive is strictly greater than zero.', 'The comparison must exclude zero. Increase the counter only inside the positive branch.');
  add(1, 'Find a negative maximum', 'Return the largest number in a nonempty list, or null for an empty list.', String.raw`
function solve(numbers) {
  if (numbers.length === 0) {
    return null;
  }
  let largest = numbers[0];
  for (const value of numbers) {
    if (value > largest) {
      largest = value;
    }
  }
  return largest;
}`, [['let largest = numbers[0];', 'let largest = 0;']], [[[-8,-2,-5],-2,'All negative'],[[3,9,1],9,'Positive values'],[[],null,'Empty input']], 'The initial candidate should be a value from the input.', 'Starting at zero fails when every input is negative. The empty guard allows the first item to be a safe initial candidate.');
  add(1, 'Reverse without skipping index zero', 'Return the input items in reverse order in a new array.', String.raw`
function solve(items) {
  const reversed = [];
  for (let index = items.length - 1; index >= 0; index--) {
    const item = items[index];
    reversed.push(item);
  }
  return reversed;
}`, [['index >= 0', 'index > 0']], [[['a','b','c'],['c','b','a'],'Three items'],[[4],[4],'Single item'],[[],[],'Empty input']], 'The first item has index zero and must be visited too.', 'Count backward from length minus one through zero, inclusive. The decrement moves toward the loop exit.');
  add(1, 'Find the first matching index', 'Return the first index whose value equals target, or -1 when there is no match.', String.raw`
function solve(search) {
  const items = search.items;
  const target = search.target;
  for (let index = 0; index < items.length; index++) {
    if (items[index] === target) {
      return index;
    }
  }
  return -1;
}`, [['return index;', '// TODO: return the matching position.']], [[{items:[4,2,4],target:4},0,'First match'],[{items:[1,3],target:3},1,'Later match'],[{items:[],target:5},-1,'No match']], 'A match should finish the function immediately.', 'Returning inside the matching branch guarantees the first position. The final -1 runs only when the loop finds nothing.');
  add(1, 'Keep the even numbers', 'Return only even numbers in their original order, including zero and negative even values.', String.raw`
function solve(numbers) {
  const result = [];
  for (const value of numbers) {
    const remainder = value % 2;
    if (remainder === 0) {
      result.push(value);
    }
  }
  return result;
}`, [['remainder === 0', 'remainder === 1']], [[[1,2,3,4],[2,4],'Mixed parity'],[[-4,-3,0],[-4,0],'Negatives and zero'],[[],[],'Empty input']], 'An even number leaves no remainder after division by two.', 'A remainder of zero works for positive, negative and zero values. A remainder of one selects some odd numbers instead.');
  add(1, 'Separate running totals', 'Return the total after each input item has been added.', String.raw`
function solve(numbers) {
  const totals = [];
  let running = 0;
  for (const number of numbers) {
    running += number;
    totals.push(running);
  }
  return totals;
}`, [['running += number;', 'running = number;']], [[[2,3,4],[2,5,9],'Accumulation'],[[3,-5,2],[3,-2,0],'Decreasing totals'],[[],[],'No totals']], 'Keep the previous total when adding the next number.', 'Assignment replaces the total; += adds to it. Store the updated total once per iteration.');
  add(1, 'Stop a countdown', 'For a nonnegative integer, return the countdown from that number to 1.', String.raw`
function solve(start) {
  const result = [];
  let remaining = start;
  while (remaining > 0) {
    result.push(remaining);
    remaining -= 1;
  }
  return result;
}`, [['remaining -= 1;', '// TODO: move remaining toward zero.']], [[3,[3,2,1],'Count down from three'],[1,[1],'Last step'],[0,[],'Already finished']], 'The value in the while condition must change inside the loop.', 'Decrementing remaining after every append eventually makes the condition false. Without that update the worker reaches its time limit.');
  add(1, 'Average a list safely', 'Return the arithmetic mean, or zero when the list is empty.', String.raw`
function solve(numbers) {
  if (numbers.length === 0) {
    return 0;
  }
  let total = 0;
  for (const value of numbers) {
    total += value;
  }
  const average = total / numbers.length;
  return average;
}`, [['total / numbers.length', 'total / (numbers.length + 1)']], [[[2,4,6],4,'Three values'],[[9],9,'One value'],[[],0,'Empty list']], 'Divide by the number of values actually added.', 'The denominator is the array length. The early empty check avoids division by zero.');
}
