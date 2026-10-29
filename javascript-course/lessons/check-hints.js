// One non-solution hint per required check, in the same order as exercise.tests.
// These are separate from the broader, manually opened lesson hints.
export const mainCheckHints = {
  'first-program': [
    'Check the first console.log call. It should print the welcome text before any calculations.',
    'Check whether the calculation is inside quotes. Quoted characters are text; an expression outside quotes is evaluated.',
    'The last call should display the written expression as text, not calculate it again.'
  ],
  variables: [
    'Compare the book title with the instructions, including spaces and capital letters.',
    'Trace pagesRead from its starting value through the update. Store the updated value before printing it.',
    'A boolean is a true-or-false value. Check that it is not surrounded by quotes.',
    'Pass the stored title, page count and completion flag to console.log. Printing their names as strings is different.'
  ],
  arrays: [
    'Replacing the second item and appending a new item are two separate operations. Check the zero-based index and the final order.',
    'Read length after both updates. Do not confuse the item count with the final index.',
    'Log the playlist array itself after updating it, rather than a text label or the return value of push.'
  ],
  objects: [
    'Check the title and page count properties against the original requirements. Object keys and text values have different roles.',
    'Update the availability property on the existing book object. A separate variable will not change that property.',
    'Add the borrower property to book and check its spelling and string value.',
    'Read and print the two requested properties after the checkout updates.'
  ],
  debugging: [
    'The input hoursText is text. Convert it to a numeric value before storing the working hours value.',
    'Keep the supplied inputs. Multiply the price per hour by the number of hours, then add the one-time helmet fee.',
    'Check the variable named in console.log and place that call after the completed calculation.'
  ],
  conditions: [
    'Check each requirement separately, then combine them so both must be true. Someone at the loan limit cannot borrow again.',
    'Trace which branch the supplied visitor enters, then check the message assigned inside that branch.',
    'Log the selected message after the branches, where the message variable is still in scope.'
  ],
  switch: [
    'Check that the case matches the supplied string. A missing break can let a later case overwrite the chosen packaging.',
    'Print the final packaging variable after the switch finishes.'
  ],
  'for-loop': [
    'Trace the starting counter, the final included counter and the update. Push one label during each iteration.',
    'Print the completed label array once, after the loop.'
  ],
  'while-loop': [
    'Trace the charge after each increase. Stop as soon as the condition becomes false, without adding another round.',
    'Increase the round counter once per actual charging update, inside the loop.',
    'Log both final values after the loop rather than only the intermediate values.'
  ],
  'for-of': [
    'Test each instrument’s availability, then collect its name only when it qualifies. Do not stop at the first unavailable instrument.',
    'Read the source objects without assigning to their properties. Collect results in a separate array.',
    'Log the collected names after the loop, rather than the full source objects.'
  ],
  'function-forms': [
    'Each version must return the conversion of its own parameter. A block body needs an explicit return.',
    'Use the supplied parameter in the calculation, rather than a fixed example value.',
    'Call the functions and print the values they return, rather than printing the function objects themselves.'
  ],
  parameters: [
    'Check the default parameter value and the normal calculation when the caller omits a rate.',
    'Use the caller’s rate, including zero. A default parameter is not a replacement for every falsy value.',
    'Handle the empty-delivery case before adding any fee, and return from that branch.'
  ],
  scope: [
    'Calculate with the function’s inputs and return its local result to the caller.',
    'Keep the function’s local variable separate from the outer variable. An assignment to the outer name changes shared state.',
    'Print the outer value and the returned value in the requested order.'
  ],
  averages: [
    'Add every item before dividing by the item count. A return inside the loop can stop after the first item.',
    'Check the empty list before dividing. For a single item, the average equals that item.',
    'Start the accumulator inside the function for every call, and keep decimal results instead of rounding them.',
    'Sum by reading the input array. Do not remove, replace or reorder its items.'
  ],
  'vip-project': [
    'Select items only when both requirements pass, then convert each selected duration to seconds.',
    'Check the exact duration boundary. Collect qualifying items in their original order.',
    'Start with an empty result and return it even if the loop finds no matches.',
    'Create a new result object for each match. Reusing the source object or one shared result object links later changes together.'
  ],
  callbacks: [
    'Pass the first callback’s return value into the second callback, then return the final value.',
    'Let the supplied callbacks decide the operations. Do not hard-code the arithmetic from one example.',
    'Call each callback exactly once. Store the first result so you can pass it on without repeating the call.'
  ],
  'array-filter': [
    'Compare against both limits and include equality at each endpoint.',
    'Filter selects items without sorting or deduplicating. Keep the original order and repeated matches.',
    'An empty list should return an empty array. When the limits are equal, matching values still qualify.',
    'Return a new filtered array without editing the original array.'
  ],
  'array-map-pipeline': [
    'Decide which distances qualify while they are still in kilometers, then convert the selected values to meters.',
    'Include the exact threshold, keep decimals, and preserve repeated matching distances.',
    'Always return an array, even when nothing qualifies. An empty result does not need an undefined return.',
    'Transform into a new array instead of replacing values in the original input.'
  ],
  'modular-helpers': [
    'The selection helper needs both availability and condition to pass. Checking only one allows invalid tools through.',
    'Use the supplied name and the requested punctuation and spacing to build the label.',
    'Pass the predicate to filter and the formatter to map, then return the final array. The empty case should also return an array.',
    'Helpers should read tool properties without changing the source objects.'
  ],
  'ai-refactoring': [
    'Preserve the original selection rule, then produce the same label for each selected book.',
    'Keep equality at the page threshold and return an empty array when there are no matches.',
    'Do not add sorting or deduplication during a refactor. Repeated entries and their order are part of the behavior.',
    'Build the result without assigning to source book properties or changing the input array.',
    'Replace the selection step with filter and the transformation step with map while preserving the original behavior.'
  ]
};
