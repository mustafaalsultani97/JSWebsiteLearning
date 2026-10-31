/*
  SCRIPT.JS — content and behavior

  Reading guide: search (Ctrl+F) for a numbered section below.
  Start with sections 1 and 9 to see how lesson data becomes HTML.
  Sections 8 and 11 handle progress and button clicks.
  Sections 3, 6 and 10 are the more advanced code runners.

  This is plain JavaScript with no UI framework. npm run build bundles the
  account SDK and these modules for Netlify. index.html loads the built file.
  accounts.js handles sign-in; progress-sync.js handles private cloud saves.
*/

import { createAccounts } from './accounts.js';
import { cleanExtraProgress, isExtraId, mergeExtraProgress, freshConsoleProgress, cleanConsoleProgress, mergeConsoleProgress, freshProblemProgress, cleanProblemProgress, mergeProblemProgress, MAX_PROGRESS_BYTES } from '../shared/progress.js';
import { renderConsolePractice, consolePracticeCard, consoleStats, bindConsolePractice, consoleQuestionCount } from './console-practice.js';
import { renderProblemPractice, problemPracticeCard, problemSolvedCount, bindProblemPractice, problemChallengeCount } from './problem-practice.js';
import { createCheckObserver, executePracticeChecks, explainPracticeError, feedbackForResult, timeoutFeedback } from './practice-feedback.js';
/* 1. COURSE CONTENT — authored lessons live in lessons/, grouped by topic. */
import { COURSE, lessonProgressKey, lessonProgressKeys, initialLessonCode, hasLessonWork } from "./lessons/index.js";

/* 2. REFERENCE LIBRARY — the original searchable JavaScript topic cards. */
const DATA = [
  {
    id: "decisions",
    title: "Decisions",
    color: "#6bdcf5",
    description:
      "Choose which code runs. Start with if/else, then use switch when one value has several possible matches.",
    cards: [
      {
        id: "kw-if",
        title: "if",
        summary: "Run code when a condition is truthy.",
        explanation: [
          "Truthy means treated as true in a condition. Put the condition in parentheses and the code in braces.",
        ],
        code: 'const age = 18;\nif (age >= 18) {\n  console.log("Adult");\n}',
        output: "Adult",
        pitfall: "Use === to compare values. A single = assigns a value.",
        mode: "run",
        level: "Start here",
        tags: ["if", "keyword", "original infographic"],
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else",
      },
      {
        id: "kw-else",
        title: "else",
        summary: "Provide the alternative to an if branch.",
        explanation: [
          "The else branch runs when the matching if condition is falsy. Chain else if to test another condition.",
        ],
        code: 'const score = 65;\nif (score >= 80) {\n  console.log("Great");\n} else if (score >= 50) {\n  console.log("Pass");\n} else {\n  console.log("Try again");\n}',
        output: "Pass",
        pitfall: "Only the first matching branch in an if/else-if chain runs.",
        mode: "run",
        level: "Start here",
        tags: ["else", "keyword", "original infographic"],
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else",
      },
      {
        id: "kw-switch",
        title: "switch",
        summary: "Compare one value with several cases.",
        explanation: [
          "JavaScript chooses a matching case using strict equality. It then continues until a break, return, throw or the end of the switch.",
        ],
        code: 'const day = "Sat";\nswitch (day) {\n  case "Sat":\n  case "Sun":\n    console.log("Weekend");\n    break;\n  default:\n    console.log("Weekday");\n}',
        output: "Weekend",
        pitfall:
          "Without an exit, execution falls through into the following case.",
        mode: "run",
        level: "Start here",
        tags: ["switch", "keyword", "original infographic"],
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch",
      },
      {
        id: "kw-case",
        title: "case",
        summary: "Mark a possible match in a switch.",
        explanation: [
          'Several case labels can share one block of work. The number 1 and the string "1" are different switch matches.',
        ],
        code: 'switch (1) {\n  case "1":\n    console.log("String");\n    break;\n  case 1:\n    console.log("Number");\n    break;\n}',
        output: "Number",
        pitfall: "A case is a label inside switch; it cannot stand alone.",
        mode: "run",
        level: "Start here",
        tags: ["case", "keyword", "original infographic"],
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch",
      },
      {
        id: "kw-default",
        title: "default",
        summary: "Mark the fallback when no case matches.",
        explanation: [
          "In switch, default handles the unmatched value. The same word also appears in export default for a module’s default export.",
        ],
        code: 'switch ("blue") {\n  case "red":\n    console.log("Red selected");\n    break;\n  default:\n    console.log("Another color");\n}',
        output: "Another color",
        pitfall:
          "default does not automatically stop fall-through. Put it last or add break if needed.",
        mode: "run",
        level: "Start here",
        tags: ["default", "keyword", "original infographic"],
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch",
      },
    ],
    group: "Keywords",
  },
  {
    id: "loops",
    title: "Loops",
    color: "#8de6ad",
    description:
      "Repeat work and control when repetition stops. An iteration is one trip through a loop.",
    cards: [
      {
        id: "kw-for",
        title: "for",
        summary: "Repeat with a start, condition and update.",
        explanation: [
          "The usual form has three parts: initialize once; check before each iteration; update after each completed iteration.",
        ],
        code: "for (let i = 0; i \u003c 3; i++) {\n  console.log(i);\n}",
        output: "0\n1\n2",
        pitfall:
          "for also has for...of and for...in forms; they do different jobs.",
        mode: "run",
        level: "Start here",
        tags: ["for", "keyword", "original infographic"],
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for",
      },
      {
        id: "kw-while",
        title: "while",
        summary: "Check first, then repeat while truthy.",
        explanation: [
          "If the condition is already falsy, the loop runs zero times. Change something that can eventually make the condition false.",
        ],
        code: "let count = 0;\nwhile (count \u003c 3) {\n  console.log(count);\n  count++;\n}",
        output: "0\n1\n2",
        pitfall:
          "A condition that never becomes false creates an infinite loop.",
        mode: "run",
        level: "Start here",
        tags: ["while", "keyword", "original infographic"],
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/while",
      },
      {
        id: "kw-do",
        title: "do",
        summary: "Run once before checking the condition.",
        explanation: [
          "A do...while loop checks at the end, so its body runs at least once.",
        ],
        code: "let count = 5;\ndo {\n  console.log(count);\n  count++;\n} while (count \u003c 3);",
        output: "5",
        pitfall: "Keep the semicolon after the final while(condition).",
        mode: "run",
        level: "Start here",
        tags: ["do", "keyword", "original infographic"],
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/do...while",
      },
      {
        id: "kw-break",
        title: "break",
        summary: "Stop the nearest loop or switch.",
        explanation: [
          "Execution continues after the loop or switch. A labeled break can exit a specifically labeled statement.",
        ],
        code: "for (let n = 1; n \u003c= 5; n++) {\n  if (n === 3) break;\n  console.log(n);\n}",
        output: "1\n2",
        pitfall:
          "Breaking an inner loop does not automatically stop the outer loop.",
        mode: "run",
        level: "Start here",
        tags: ["break", "keyword", "original infographic"],
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/break",
      },
      {
        id: "kw-continue",
        title: "continue",
        summary: "Skip the rest of this iteration.",
        explanation: [
          "The loop continues with its next iteration. In a for loop, the update step still runs; in while, the condition is checked again.",
        ],
        code: "for (let n = 1; n \u003c= 4; n++) {\n  if (n === 2) continue;\n  console.log(n);\n}",
        output: "1\n3\n4",
        pitfall:
          "In while loops, do not skip the update that makes the loop stop.",
        mode: "run",
        level: "Start here",
        tags: ["continue", "keyword", "original infographic"],
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/continue",
      },
    ],
    group: "Keywords",
  },
  {
    id: "variables-functions",
    title: "Variables and functions",
    color: "#f5d778",
    description: "Give values names and group reusable work into functions.",
    cards: [
      {
        id: "kw-let",
        title: "let",
        summary: "Create a variable you can reassign.",
        explanation: [
          "let is block-scoped: a declaration inside braces is limited to that block and its nested scopes.",
        ],
        code: "let score = 0;\nscore = 5;\nconsole.log(score);",
        output: "5",
        pitfall:
          "You cannot access a let binding before its declaration has initialized it.",
        mode: "run",
        level: "Start here",
        tags: ["let", "keyword", "original infographic"],
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let",
      },
      {
        id: "kw-const",
        title: "const",
        summary: "Create a name you cannot reassign.",
        explanation: [
          "const is block-scoped and needs an initial value. It protects the binding, not the contents of an object or array.",
        ],
        code: "const player = { score: 0 };\nplayer.score = 10;\nconsole.log(player.score);",
        output: "10",
        pitfall: "const does not make objects deeply immutable.",
        mode: "run",
        level: "Start here",
        tags: ["const", "keyword", "original infographic"],
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const",
      },
      {
        id: "kw-var",
        title: "var",
        summary: "Recognize the older variable declaration.",
        explanation: [
          "Inside a function, var is scoped to that function, not to an ordinary if or loop block. At top level, scope depends on script versus module context. Prefer let or const in new code.",
        ],
        code: "function demo() {\n  if (true) {\n    var count = 1;\n  }\n  return count;\n}\nconsole.log(demo());",
        output: "1",
        pitfall:
          "var is hoisted and initialized to undefined before its assignment runs.",
        mode: "run",
        level: "Start here",
        tags: ["var", "keyword", "original infographic"],
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var",
      },
      {
        id: "kw-function",
        title: "function",
        summary: "Define reusable code with parameters.",
        explanation: [
          "Parameters are the input names in a function definition. Arguments are the actual values you pass when calling it.",
        ],
        code: 'function greet(name) {\n  return "Hello, " + name;\n}\nconsole.log(greet("Milo"));',
        output: "Hello, Milo",
        pitfall:
          "Defining a function does not run its body. Call it with parentheses.",
        mode: "run",
        level: "Start here",
        tags: ["function", "keyword", "original infographic"],
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function",
      },
      {
        id: "kw-return",
        title: "return",
        summary: "Exit a function, optionally with a value.",
        explanation: [
          "return ends this function call. A normal function with no returned value gives undefined. An async function wraps its result in a Promise.",
        ],
        code: "function double(n) {\n  if (n \u003c 0) return;\n  return n * 2;\n}\nconsole.log(double(3));\nconsole.log(double(-1));",
        output: "6\nundefined",
        pitfall:
          "Put the returned expression on the same line as return, or start parentheses on that line.",
        mode: "run",
        level: "Start here",
        tags: ["return", "keyword", "original infographic"],
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/return",
      },
    ],
    group: "Keywords",
  },
  {
    id: "errors",
    title: "Errors",
    color: "#ffad97",
    description: "Handle failures intentionally and keep cleanup in one place.",
    cards: [
      {
        id: "kw-try",
        title: "try",
        summary: "Run code whose failures you may handle.",
        explanation: [
          "try must be followed by catch, finally, or both. A throw inside the try transfers control to its matching catch, when present.",
        ],
        code: 'try {\n  throw new Error("Missing name");\n} catch (error) {\n  console.log(error.message);\n} finally {\n  console.log("Done");\n}',
        output: "Missing name\nDone",
        pitfall:
          "A try block does not catch a later timer callback’s error. Handle errors inside the callback or await a rejecting Promise.",
        mode: "run",
        level: "Start here",
        tags: ["try", "keyword", "original infographic"],
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch",
      },
      {
        id: "kw-catch",
        title: "catch",
        summary: "Handle an exception from the try block.",
        explanation: [
          "The catch parameter holds the thrown value. Prefer throwing Error objects so you get a message and useful diagnostic information.",
        ],
        code: 'try {\n  throw new Error("Missing name");\n} catch (error) {\n  console.log(error.message);\n} finally {\n  console.log("Done");\n}',
        output: "Missing name\nDone",
        pitfall:
          "Avoid silently swallowing an error. Recover, report it, or rethrow it.",
        mode: "run",
        level: "Start here",
        tags: ["catch", "keyword", "original infographic"],
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch",
      },
      {
        id: "kw-finally",
        title: "finally",
        summary: "Run cleanup as control leaves try/catch.",
        explanation: [
          "finally runs on normal completion and on a throw or return, provided execution reaches the exit. It cannot recover from a process being forcibly terminated.",
        ],
        code: 'try {\n  throw new Error("Missing name");\n} catch (error) {\n  console.log(error.message);\n} finally {\n  console.log("Done");\n}',
        output: "Missing name\nDone",
        pitfall:
          "A return or throw in finally can replace a pending return value or error.",
        mode: "run",
        level: "Start here",
        tags: ["finally", "keyword", "original infographic"],
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch",
      },
      {
        id: "kw-throw",
        title: "throw",
        summary: "Raise an exception intentionally.",
        explanation: [
          "throw interrupts the current path and searches for a handler up the call stack. If none handles it, the exception escapes.",
        ],
        code: 'function needName(name) {\n  if (!name) throw new Error("Name required");\n  return name;\n}\ntry {\n  needName("");\n} catch (error) {\n  console.log(error.message);\n}',
        output: "Name required",
        pitfall: "The expression must be on the same line as throw.",
        mode: "run",
        level: "Start here",
        tags: ["throw", "keyword", "original infographic"],
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/throw",
      },
    ],
    group: "Keywords",
  },
  {
    id: "classes",
    title: "Classes and objects",
    color: "#c4aeff",
    description:
      "Create related objects and share behavior through classes and prototypes.",
    cards: [
      {
        id: "kw-class",
        title: "class",
        summary: "Define a class with fields and methods.",
        explanation: [
          "A class is a template for objects. Its constructor initializes each new instance. Methods live on its prototype unless declared static.",
        ],
        code: 'class Player {\n  constructor(name) { this.name = name; }\n  greet() { return "Hi, " + this.name; }\n}\nconsole.log(new Player("Milo").greet());',
        output: "Hi, Milo",
        pitfall:
          "Class bodies use strict mode. Call a class constructor with new.",
        mode: "run",
        level: "Start here",
        tags: ["class", "keyword", "original infographic"],
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/class",
      },
      {
        id: "kw-extends",
        title: "extends",
        summary: "Inherit from another class.",
        explanation: [
          "A subclass gains access to its parent’s methods and can add or override behavior.",
        ],
        code: 'class Pet {\n  speak() { return "Hello"; }\n}\nclass Dog extends Pet {\n  bark() { return "Woof"; }\n}\nconst dog = new Dog();\nconsole.log(dog.speak(), dog.bark());',
        output: "Hello Woof",
        pitfall:
          "Inheritance is one way to share behavior. Simple objects and composition are often enough.",
        mode: "run",
        level: "Start here",
        tags: ["extends", "keyword", "original infographic"],
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/extends",
      },
      {
        id: "kw-super",
        title: "super",
        summary: "Call the parent constructor or a parent method.",
        explanation: [
          "In a derived constructor, super(...) initializes this. Inside a method, super.method(...) calls a method found through the parent prototype.",
        ],
        code: 'class Pet {\n  constructor(name) { this.name = name; }\n  speak() { return this.name; }\n}\nclass Dog extends Pet {\n  constructor(name) { super(name); }\n  speak() { return super.speak() + " barks"; }\n}\nconsole.log(new Dog("Milo").speak());',
        output: "Milo barks",
        pitfall:
          "A derived constructor must call super() before accessing this.",
        mode: "run",
        level: "Start here",
        tags: ["super", "keyword", "original infographic"],
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/super",
      },
      {
        id: "kw-this",
        title: "this",
        summary: "Use the context of a function call.",
        explanation: [
          "For a regular method called as obj.method(), this is obj. A standalone function call in strict mode has undefined this. Arrow functions inherit this from the surrounding scope.",
        ],
        code: 'const player = {\n  name: "Milo",\n  greet() { return this.name; }\n};\nconsole.log(player.greet());',
        output: "Milo",
        pitfall:
          "Passing a method as a callback can lose its receiver. Use bind or a wrapper when needed.",
        mode: "run",
        level: "Start here",
        tags: ["this", "keyword", "original infographic"],
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this",
      },
      {
        id: "kw-new",
        title: "new",
        summary: "Create an instance using a constructor.",
        explanation: [
          "new creates an object linked to the constructor’s prototype and calls the constructor to initialize it. A constructor can explicitly return another object.",
        ],
        code: "class Point {\n  constructor(x, y) {\n    this.x = x;\n    this.y = y;\n  }\n}\nconst p = new Point(2, 3);\nconsole.log(p.x, p.y);",
        output: "2 3",
        pitfall: "Arrow functions cannot be constructors.",
        mode: "run",
        level: "Start here",
        tags: ["new", "keyword", "original infographic"],
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new",
      },
      {
        id: "kw-delete",
        title: "delete",
        summary: "Remove an object’s own property if allowed.",
        explanation: [
          "delete removes an own configurable property. It does not delete a lexical variable or immediately free memory.",
        ],
        code: 'const item = { temp: true };\ndelete item.temp;\nconsole.log("temp" in item);',
        output: "false",
        pitfall:
          "Deleting an array element leaves a hole and does not shorten its length. Use splice when you want to remove and shift.",
        mode: "run",
        level: "Start here",
        tags: ["delete", "keyword", "original infographic"],
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/delete",
      },
    ],
    group: "Keywords",
  },
  {
    id: "type-operators",
    title: "Types and word operators",
    color: "#79d4ff",
    description:
      "Inspect values, test properties and understand the result of an expression.",
    cards: [
      {
        id: "kw-typeof",
        title: "typeof",
        summary: "Get a string describing a value’s type.",
        explanation: [
          'Possible results include undefined, boolean, number, bigint, string, symbol, function and object. Historical exception: typeof null is "object".',
        ],
        code: 'console.log(typeof 42);\nconsole.log(typeof "Hi");\nconsole.log(typeof null);\nconsole.log(Array.isArray([]));',
        output: "number\nstring\nobject\ntrue",
        pitfall:
          'Arrays also produce "object". Use Array.isArray for an array check.',
        mode: "run",
        level: "Start here",
        tags: ["typeof", "keyword", "original infographic"],
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof",
      },
      {
        id: "kw-instanceof",
        title: "instanceof",
        summary: "Usually test an object’s prototype chain.",
        explanation: [
          "instanceof checks whether a constructor’s prototype occurs in the object’s prototype chain. A class can customize this test with Symbol.hasInstance.",
        ],
        code: "class Pet {}\nconst pet = new Pet();\nconsole.log(pet instanceof Pet);\nconsole.log([] instanceof Array);",
        output: "true\ntrue",
        pitfall:
          "Objects from another window may fail instanceof checks against this window’s constructors.",
        mode: "run",
        level: "Start here",
        tags: ["instanceof", "keyword", "original infographic"],
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof",
      },
      {
        id: "kw-in",
        title: "in",
        summary: "Test for a property, including inherited ones.",
        explanation: [
          "in checks property keys, not the values inside an array. Use Object.hasOwn when inherited properties should not count.",
        ],
        code: 'console.log("name" in { name: "Milo" });\nconsole.log(0 in ["a"]);\nconsole.log("a" in ["a"]);',
        output: "true\ntrue\nfalse",
        pitfall: "Use array.includes(value) to look for an array value.",
        mode: "run",
        level: "Start here",
        tags: ["in", "keyword", "original infographic"],
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/in",
      },
      {
        id: "kw-void",
        title: "void",
        summary: "Evaluate an expression and produce undefined.",
        explanation: [
          "The expression still runs, including any side effects. void only changes the result of the expression.",
        ],
        code: 'const result = void console.log("Hi");\nconsole.log(result);',
        output: "Hi\nundefined",
        pitfall: "void does not stop execution or cancel work.",
        mode: "run",
        level: "Start here",
        tags: ["void", "keyword", "original infographic"],
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/void",
      },
    ],
    group: "Keywords",
  },
  {
    id: "modules-async",
    title: "Modules and asynchronous code",
    color: "#f4aae0",
    description:
      "Split code into files, work with Promises, and create generators.",
    cards: [
      {
        id: "kw-import",
        title: "import",
        summary: "Read exports from another module.",
        explanation: [
          'Static imports go at module top level. Browsers need type="module" and a server for normal relative module imports.',
        ],
        code: '// math.js\nexport function double(n) { return n * 2; }\n\n// main.js\nimport { double } from "./math.js";\nconsole.log(double(3));',
        output: "6 (when the two module files are configured)",
        pitfall: "These are two files. Do not paste both into the playground.",
        mode: "module",
        level: "Start here",
        tags: ["import", "keyword", "original infographic"],
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import",
      },
      {
        id: "kw-export",
        title: "export",
        summary: "Make a declaration available to other modules.",
        explanation: [
          "Named exports can share several values. A module can also have one default export. Imported bindings are live views of exported bindings.",
        ],
        code: '// math.js\nexport const pi = 3.14159;\nexport function double(n) { return n * 2; }\n\n// main.js\nimport { pi, double } from "./math.js";\nconsole.log(double(3));',
        output: "6 (when the two module files are configured)",
        pitfall: "Exporting a value does not put it on the global object.",
        mode: "module",
        level: "Start here",
        tags: ["export", "keyword", "original infographic"],
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export",
      },
      {
        id: "kw-async",
        title: "async",
        summary: "Make a function return a Promise.",
        explanation: [
          "An async function can use await in its body. Returning a value fulfills its Promise; an uncaught throw rejects it.",
        ],
        code: "async function answer() {\n  return 42;\n}\nconsole.log(await answer());",
        output: "42",
        pitfall:
          "async does not move heavy calculations to a background thread.",
        mode: "run",
        level: "Start here",
        tags: ["async", "keyword", "original infographic"],
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function",
      },
      {
        id: "kw-await",
        title: "await",
        summary: "Pause async work until a value settles.",
        explanation: [
          "Use await inside an async function or at module top level. It pauses that function or module evaluation, not the JavaScript thread. A rejection becomes a thrown exception.",
        ],
        code: "async function answer() {\n  const n = await Promise.resolve(42);\n  return n;\n}\nconsole.log(await answer());",
        output: "42",
        pitfall:
          "The playground wraps your example in an async function so you can use await.",
        mode: "run",
        level: "Start here",
        tags: ["await", "keyword", "original infographic"],
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await",
      },
      {
        id: "kw-yield",
        title: "yield",
        summary: "Pause a generator and provide a value.",
        explanation: [
          "A function* creates a generator. Calling next() starts or resumes it. Each result has value and done properties.",
        ],
        code: "function* count() {\n  yield 1;\n  yield 2;\n}\nconst steps = count();\nconsole.log(steps.next().value);\nconsole.log(steps.next().value);\nconsole.log(steps.next().done);",
        output: "1\n2\ntrue",
        pitfall:
          "Calling the generator function creates an iterator; it does not immediately run the body.",
        mode: "run",
        level: "Start here",
        tags: ["yield", "keyword", "original infographic"],
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield",
      },
    ],
    group: "Keywords",
  },
  {
    id: "other-keywords",
    title: "Other useful statements",
    color: "#f8c47d",
    description:
      "Recognize debugging syntax, legacy features and reserved words.",
    cards: [
      {
        id: "kw-debugger",
        title: "debugger",
        summary: "Request a pause in an active debugger.",
        explanation: [
          "Without an active debugger, the statement has no visible effect. It is a useful temporary breakpoint during development.",
        ],
        code: "const total = 2 + 3;\ndebugger;\nconsole.log(total);",
        output: "5, unless an attached debugger pauses first",
        pitfall:
          "The playground runs in an isolated worker. Open browser developer tools to inspect debugging behavior.",
        mode: "run",
        level: "Start here",
        tags: ["debugger", "keyword", "original infographic"],
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger",
      },
      {
        id: "kw-with",
        title: "with",
        summary: "Recognize a deprecated statement; avoid it.",
        explanation: [
          "with adds an object to the scope chain for name lookup. It makes names ambiguous and is forbidden in strict mode. Access the property explicitly instead.",
        ],
        code: '// Modern alternative to with:\nconst person = { name: "Milo" };\nconsole.log(person.name);',
        output: "Milo",
        pitfall:
          "The with statement is not the same as with in modern import attributes.",
        mode: "run",
        level: "Start here",
        tags: ["with", "keyword", "original infographic"],
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/with",
      },
      {
        id: "kw-enum",
        title: "enum",
        summary: "A reserved word, not a JavaScript enum declaration.",
        explanation: [
          "JavaScript reserves enum for possible future syntax. TypeScript has an enum feature, but that is a different language feature. Use an object for named constants in plain JavaScript.",
        ],
        code: 'const Status = Object.freeze({\n  READY: "ready",\n  DONE: "done"\n});\nconsole.log(Status.READY);',
        output: "ready",
        pitfall:
          "Do not use enum as a variable name. Object.freeze is shallow.",
        mode: "run",
        level: "Start here",
        tags: ["enum", "keyword", "original infographic"],
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar",
      },
    ],
    group: "Keywords",
  },
  {
    id: "language-foundations",
    title: "Language foundations",
    description:
      "Understand values, scope and the rules that make programs predictable.",
    color: "#6BDCF5",
    cards: [
      {
        id: "lang-types",
        title: "The eight language types",
        summary: "Seven primitive types, plus objects.",
        explanation: [
          "The primitive types are undefined, null, boolean, number, bigint, string and symbol. Everything else is an object, including arrays and functions. Primitive values cannot be changed in place; a variable can be assigned a different value.",
        ],
        code: 'console.log(typeof 42);\nconsole.log(typeof "hello");\nconsole.log(typeof true);\nconsole.log(typeof undefined);\nconsole.log(typeof null);',
        output: "number\nstring\nboolean\nundefined\nobject",
        mode: "run",
        level: "Start here",
        tags: [],
        pitfall:
          "typeof null is a historical exception; it does not mean null is an ordinary object.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures",
      },
      {
        id: "lang-literals-comments",
        title: "Literals, comments and identifiers",
        summary: "Write values directly and give variables clear names.",
        explanation: [
          'A literal writes a value directly in code, such as 12 or "hello". An identifier names a variable, function or class. JavaScript is case-sensitive. // starts a line comment; /* ... */ encloses a block comment.',
        ],
        code: '// Names are case-sensitive.\nconst userName = "Milo";\nconst attempts = 3;\n/* A comment can span lines. */\nconsole.log(userName, attempts);',
        output: "Milo 3",
        mode: "run",
        level: "Start here",
        tags: [],
        pitfall: "userName and username are different names.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types",
      },
      {
        id: "lang-templates",
        title: "Template literals",
        summary: "Insert expressions into text with ${...}.",
        explanation: [
          "Backticks create template literals. They support line breaks and ${expression} placeholders. The expression is evaluated and inserted into the string.",
        ],
        code: 'const name = "Milo";\nconst score = 4;\nconsole.log(`${name} scored ${score + 1}.`);',
        output: "Milo scored 5.",
        mode: "run",
        level: "Start here",
        tags: [],
        pitfall: "Single and double quotes do not interpolate ${...}.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals",
      },
      {
        id: "lang-numbers-bigint",
        title: "Number and BigInt",
        summary: "Choose floating-point numbers or large integers.",
        explanation: [
          "Number handles both integers and fractions, using floating-point arithmetic. BigInt represents integers without the safe-integer size limit of Number. Write a BigInt literal with n. BigInt division discards the fractional part.",
        ],
        code: "console.log(Number.isSafeInteger(9007199254740991));\nconsole.log(String(9007199254740993n + 2n));\nconsole.log(String(7n / 2n));",
        output: "true\n9007199254740995\n3",
        mode: "run",
        level: "Everyday",
        tags: ["numeric", "integer"],
        pitfall:
          "Do not mix Number and BigInt in arithmetic. Convert deliberately; a conversion to Number can lose precision.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt",
      },
      {
        id: "lang-symbols",
        title: "Symbol values",
        summary: "Create unique property keys.",
        explanation: [
          "Each Symbol() call creates a unique value, even when descriptions match. Symbols can be object keys. Symbol.for(key) uses a shared registry and returns the same registered symbol for the same key.",
        ],
        code: 'const a = Symbol("id");\nconst b = Symbol("id");\nconsole.log(a === b);\nconsole.log(Symbol.for("shared") === Symbol.for("shared"));',
        output: "false\ntrue",
        mode: "run",
        level: "Deeper",
        tags: [],
        pitfall: "The description is a label, not the symbol's identity.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol",
      },
      {
        id: "lang-conversion",
        title: "Conversions and truthiness",
        summary: "Convert intentionally instead of guessing.",
        explanation: [
          'Number(), String() and Boolean() explicitly convert values. Falsy primitives are false, 0, -0, 0n, "", null, undefined and NaN. Ordinary objects, including empty arrays and empty objects, are truthy.',
        ],
        code: 'console.log(Number("12") + 1);\nconsole.log(Boolean("false"));\nconsole.log(Boolean([]));\nconsole.log(Boolean(0));',
        output: "13\ntrue\ntrue\nfalse",
        mode: "run",
        level: "Start here",
        tags: [],
        pitfall:
          'The string "false" is nonempty, so it is truthy. Legacy document.all is an unusual browser-only falsy object.',
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_operators",
      },
      {
        id: "lang-identity",
        title: "Object identity and shallow copies",
        summary:
          "Two objects with the same contents are still different objects.",
        explanation: [
          "Object equality compares identity. Assigning an object to another variable copies the reference. Object spread creates a new outer object, but nested objects are still shared.",
        ],
        code: "const a = { nested: { score: 1 } };\nconst alias = a;\nconst copy = { ...a };\nconsole.log(a === alias);\nconsole.log(a === copy);\ncopy.nested.score = 7;\nconsole.log(a.nested.score);",
        output: "true\nfalse\n7",
        mode: "run",
        level: "Everyday",
        tags: ["reference", "copy", "mutation"],
        pitfall: "A shallow copy does not deeply copy nested objects.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects",
      },
      {
        id: "lang-scope-tdz",
        title: "Scope and the temporal dead zone",
        summary:
          "A binding has both a visible region and an initialization point.",
        explanation: [
          "let, const and class have block scope. A binding exists before its declaration is reached, but accessing it before initialization throws ReferenceError. This period is called the temporal dead zone.",
        ],
        code: "let score = 1;\n{\n  let score = 2;\n  console.log(score);\n}\nconsole.log(score);",
        output: "2\n1",
        mode: "run",
        level: "Start here",
        tags: [],
        pitfall:
          "An inner declaration shadows an outer name throughout the inner block, including before initialization.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let",
      },
      {
        id: "lang-hoisting",
        title: "Hoisting",
        summary: "Declarations do not all behave the same before their line.",
        explanation: [
          "Function declarations can usually be called before the declaration. A var binding starts as undefined before its assignment. let, const and class cannot be accessed before initialization. The source code is not literally moved.",
        ],
        code: "console.log(double(3));\nfunction double(n) { return n * 2; }\nconsole.log(total);\nvar total = 5;\nconsole.log(total);",
        output: "6\nundefined\n5",
        mode: "run",
        level: "Everyday",
        tags: [],
        pitfall:
          "Function expressions assigned to const are not callable before initialization.",
        source: "https://developer.mozilla.org/en-US/docs/Glossary/Hoisting",
      },
      {
        id: "lang-strict-asi",
        title: "Strict mode and semicolons",
        summary: "Make accidental mistakes easier to catch.",
        explanation: [
          '"use strict" enables stricter checks in a classic script or function. Modules and class bodies are strict automatically. Automatic semicolon insertion fills certain missing semicolons; it does not make every line break safe.',
        ],
        code: 'function good() {\n  "use strict";\n  return { ok: true };\n}\nfunction surprising() {\n  return\n    42;\n}\nconsole.log(good().ok);\nconsole.log(surprising());',
        output: "true\nundefined",
        mode: "run",
        level: "Everyday",
        tags: [],
        pitfall:
          "Put a return value on the same line as return. A newline immediately after throw is a syntax error.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode",
      },
      {
        id: "lang-iteration-forms",
        title: "for...of and for...in",
        summary: "Choose values or property names.",
        explanation: [
          "for...of visits values from an iterable, such as an array, string, Map or Set. for...in visits enumerable string property names, including inherited ones. Object.keys() gives an object's own enumerable string keys.",
        ],
        code: "for (const value of [10, 20]) {\n  console.log(value);\n}\nfor (const key of Object.keys({ a: 1 })) {\n  console.log(key);\n}",
        output: "10\n20\na",
        mode: "run",
        level: "Start here",
        tags: [],
        pitfall:
          "Prefer for...of for array values. for...in is not a general replacement for it.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration",
      },
    ],
    group: "Core concepts",
  },
  {
    id: "language-operators",
    title: "Operators and patterns",
    description: "Read expressions, make choices and unpack data.",
    color: "#8DE6AD",
    cards: [
      {
        id: "lang-arithmetic",
        title: "Arithmetic, assignment and updates",
        summary: "Calculate a result or change a variable.",
        explanation: [
          "+ - * / ** perform arithmetic; % gives a remainder. += and similar operators combine arithmetic with assignment. Prefix ++ returns the new value; postfix ++ returns the old value. Parentheses make precedence explicit.",
        ],
        code: "let n = 2;\nconsole.log(2 + 3 * 4);\nconsole.log((2 + 3) * 4);\nconsole.log(2 ** 3, 7 % 3);\nconsole.log(n++, n);\nn += 2;\nconsole.log(n);",
        output: "14\n20\n8 1\n2 3\n5",
        mode: "run",
        level: "Start here",
        tags: [],
        pitfall:
          'With a string operand, + may concatenate text: "2" + 3 is "23".',
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_operators",
      },
      {
        id: "lang-equality",
        title: "Equality and comparison",
        summary: "Prefer strict equality unless conversion is deliberate.",
        explanation: [
          "=== and !== compare without converting types. == and != may convert operands. \u003c \u003c= > >= compare values; two strings are compared by their UTF-16 sequences. Object.is() distinguishes -0 from 0 and considers NaN equal to itself.",
        ],
        code: 'console.log(5 === "5");\nconsole.log(5 == "5");\nconsole.log(NaN === NaN);\nconsole.log(Object.is(NaN, NaN));\nconsole.log(Object.is(-0, 0));',
        output: "false\ntrue\nfalse\ntrue\nfalse",
        mode: "run",
        level: "Start here",
        tags: [],
        pitfall:
          "=== still compares objects by identity, not by matching their contents.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness",
      },
      {
        id: "lang-logical",
        title: "Logical operators: &&, || and !",
        summary: "Combine conditions and short-circuit work.",
        explanation: [
          "&& returns the first falsy operand, or the last operand if none is falsy. || returns the first truthy operand, or the last operand if none is truthy. ! converts to a boolean and reverses it. Later operands may never run.",
        ],
        code: 'console.log("ready" && 7);\nconsole.log("" || "fallback");\nconsole.log(!0);\nlet calls = 0;\nfalse && calls++;\nconsole.log(calls);',
        output: "7\nfallback\ntrue\n0",
        mode: "run",
        level: "Start here",
        tags: [],
        pitfall:
          "&& and || return operand values, not necessarily true or false.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND",
      },
      {
        id: "lang-nullish",
        title: "Nullish coalescing: ?? and ??=",
        summary: "Use a default only for null or undefined.",
        explanation: [
          '?? keeps values such as 0, false and "". ??= assigns only when the current value is null or undefined. Use parentheses when mixing ?? with && or ||.',
        ],
        code: 'console.log(0 ?? 10);\nconsole.log("" ?? "fallback");\nlet name;\nname ??= "Guest";\nconsole.log(name);',
        output: "0\n\nGuest",
        mode: "run",
        level: "Everyday",
        tags: [],
        pitfall: "|| also replaces 0, false and an empty string; ?? does not.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing",
      },
      {
        id: "lang-optional",
        title: "Optional chaining: ?.",
        summary: "Read through a possibly missing object.",
        explanation: [
          "?. stops a continuous property-access chain and produces undefined when the value before it is null or undefined. It also works with bracket access and optional calls.",
        ],
        code: 'const user = {};\nconsole.log(user.address?.city ?? "Unknown");\nconsole.log(user.greet?.());\nconsole.log(user.items?.[0]);',
        output: "Unknown\nundefined\nundefined",
        mode: "run",
        level: "Everyday",
        tags: [],
        pitfall:
          "?. does not protect an undeclared root variable, and it does not make a non-function callable.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining",
      },
      {
        id: "lang-ternary",
        title: "The conditional operator: ? :",
        summary: "Choose one of two expressions.",
        explanation: [
          "condition ? a : b evaluates the condition, then evaluates only the chosen expression. Use it for short choices that produce a value.",
        ],
        code: 'const age = 18;\nconst label = age >= 18 ? "Adult" : "Child";\nconsole.log(label);',
        output: "Adult",
        mode: "run",
        level: "Start here",
        tags: [],
        pitfall:
          "Long nested ternaries are hard to read. Use if/else for several steps.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_operator",
      },
      {
        id: "lang-destructuring",
        title: "Destructuring",
        summary: "Extract values into named variables.",
        explanation: [
          "Array destructuring uses positions; object destructuring uses property keys. You can rename a property or provide a default. A default is used for undefined, including a missing property, but not for null.",
        ],
        code: 'const [first, second = 0] = [5];\nconst { name: userName, age = 18 } = { name: "Milo" };\nconsole.log(first, second);\nconsole.log(userName, age);',
        output: "5 0\nMilo 18",
        mode: "run",
        level: "Everyday",
        tags: [],
        pitfall:
          "Renaming { name: userName } creates userName, not a variable named name.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring",
      },
      {
        id: "lang-rest-spread",
        title: "Rest and spread: ...",
        summary: "Collect remaining values or expand existing ones.",
        explanation: [
          "Rest collects multiple values into an array or object. Spread expands iterable values in calls and array literals, or copies own enumerable properties into an object literal. These are shallow operations.",
        ],
        code: "const [first, ...rest] = [1, 2, 3];\nconst combined = [0, ...rest];\nconsole.log(first);\nconsole.log(JSON.stringify(combined));\nconsole.log(Math.max(...combined));",
        output: "1\n[0,2,3]\n3",
        mode: "run",
        level: "Everyday",
        tags: [],
        pitfall:
          "Object spread copies own enumerable properties; it does not preserve the prototype or property descriptors.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax",
      },
      {
        id: "lang-bitwise",
        title: "Bitwise operators",
        summary: "Work with individual bits when you need to.",
        explanation: [
          "& | ^ ~ manipulate bits. \u003c\u003c >> >>> shift bits. Number operands are converted to 32-bit integers for these operators, so large values can lose information. BigInt supports bitwise operations except unsigned right shift >>>.",
        ],
        code: "console.log(5 & 3);\nconsole.log(5 | 3);\nconsole.log(1 \u003c\u003c 3);\nconsole.log(-1 >>> 0);",
        output: "1\n7\n8\n4294967295",
        mode: "run",
        level: "Deeper",
        tags: [],
        pitfall:
          "Bitwise & and | are different from logical && and ||. Do not use them interchangeably.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_operators",
      },
    ],
    group: "Core concepts",
  },
  {
    id: "language-functions",
    title: "Functions in practice",
    description:
      "Build reusable behavior and understand what a function remembers.",
    color: "#F5D778",
    cards: [
      {
        id: "lang-arrows",
        title: "Arrow functions",
        summary: "Write compact functions with inherited this.",
        explanation: [
          "An arrow with one expression returns it automatically. With a { } body, write return explicitly. Arrow functions inherit this and arguments from their surrounding scope and cannot be called with new.",
        ],
        code: 'const double = n => n * 2;\nconst makeUser = name => ({ name });\nconsole.log(double(4));\nconsole.log(makeUser("Milo").name);',
        output: "8\nMilo",
        mode: "run",
        level: "Everyday",
        tags: [],
        pitfall:
          "Wrap an object literal in parentheses when returning it directly from an arrow.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions",
      },
      {
        id: "lang-parameters",
        title: "Default and rest parameters",
        summary: "Make inputs optional or accept many values.",
        explanation: [
          "A default parameter is used when an argument is missing or undefined. A rest parameter collects the remaining arguments into an array and must be the last parameter.",
        ],
        code: 'function greet(name = "Guest") {\n  return `Hello, ${name}`;\n}\nfunction total(...numbers) {\n  return numbers.reduce((sum, n) => sum + n, 0);\n}\nconsole.log(greet());\nconsole.log(total(2, 3, 4));',
        output: "Hello, Guest\n9",
        mode: "run",
        level: "Everyday",
        tags: [],
        pitfall: "Passing null does not activate a default parameter.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters",
      },
      {
        id: "lang-closures",
        title: "Closures",
        summary: "A function remembers its surrounding bindings.",
        explanation: [
          "A closure lets a function use variables from the scope where it was created, even after the outer function returns. Each call to a factory can create independent state.",
        ],
        code: "function makeCounter() {\n  let count = 0;\n  return () => ++count;\n}\nconst next = makeCounter();\nconsole.log(next());\nconsole.log(next());",
        output: "1\n2",
        mode: "run",
        level: "Everyday",
        tags: [],
        pitfall:
          "Closures capture bindings, not frozen copies of their values.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures",
      },
      {
        id: "lang-callbacks",
        title: "Callbacks",
        summary: "Pass a function to be called by another function.",
        explanation: [
          "A callback is an ordinary function passed as an argument. Some callbacks run immediately, such as array callbacks. Others run later, such as timer callbacks. Passing a function is different from calling it.",
        ],
        code: "function calculate(a, b, operation) {\n  return operation(a, b);\n}\nconsole.log(calculate(3, 4, (a, b) => a + b));",
        output: "7",
        mode: "run",
        level: "Start here",
        tags: [],
        pitfall:
          "Passing handleClick supplies the function; passing handleClick() supplies its return value.",
        source:
          "https://developer.mozilla.org/en-US/docs/Glossary/Callback_function",
      },
      {
        id: "lang-higher-order",
        title: "Higher-order functions",
        summary: "Functions can accept or return other functions.",
        explanation: [
          "Because functions are values, you can store them, pass them around and return them. A higher-order function does at least one of these things. This is useful for reusable behavior.",
        ],
        code: 'const multiplyBy = factor => value => factor * value;\nconst triple = multiplyBy(3);\nconsole.log(triple(5));\nconsole.log([1, 2].map(triple).join(", "));',
        output: "15\n3, 6",
        mode: "run",
        level: "Everyday",
        tags: [],
        pitfall:
          "A function value is not the same as the result of calling it.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions",
      },
      {
        id: "lang-recursion",
        title: "Recursion",
        summary: "Solve a smaller version of the same problem.",
        explanation: [
          "A recursive function calls itself. Give it a base case that ends the recursion and make each call move toward that case. Deep recursion can exceed the call stack.",
        ],
        code: "function factorial(n) {\n  if (n \u003c= 1) return 1;\n  return n * factorial(n - 1);\n}\nconsole.log(factorial(5));",
        output: "120",
        mode: "run",
        level: "Everyday",
        tags: [],
        pitfall:
          "This simple example assumes a nonnegative integer. Validate input in real applications.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions",
      },
      {
        id: "lang-call-apply-bind",
        title: "call(), apply() and bind()",
        summary: "Choose this for a regular function call.",
        explanation: [
          "call() invokes a function with individual arguments; apply() invokes it with an array-like argument list. bind() creates a new function with this and optional leading arguments fixed.",
        ],
        code: 'function greet(word) {\n  return `${word}, ${this.name}`;\n}\nconst user = { name: "Milo" };\nconsole.log(greet.call(user, "Hi"));\nconsole.log(greet.apply(user, ["Hello"]));\nconst welcome = greet.bind(user, "Welcome");\nconsole.log(welcome());',
        output: "Hi, Milo\nHello, Milo\nWelcome, Milo",
        mode: "run",
        level: "Deeper",
        tags: [],
        pitfall:
          "These methods cannot replace the lexical this of an arrow function.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind",
      },
      {
        id: "lang-arguments",
        title: "arguments and rest arrays",
        summary: "Prefer rest parameters for a modern argument list.",
        explanation: [
          "Regular functions have an arguments object containing passed arguments. It is array-like, not an Array. Arrow functions have no own arguments. A rest parameter creates a real array.",
        ],
        code: 'function legacy() {\n  console.log(arguments.length);\n  console.log(Array.isArray(arguments));\n}\nfunction modern(...args) {\n  console.log(Array.isArray(args));\n}\nlegacy("a", "b");\nmodern("a", "b");',
        output: "2\nfalse\ntrue",
        mode: "run",
        level: "Deeper",
        tags: [],
        pitfall:
          "In non-strict functions with simple parameters, arguments can be linked to parameter values. Rest avoids that old behavior.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments",
      },
    ],
    group: "Core concepts",
  },
  {
    id: "language-object-model",
    title: "Objects and the class model",
    description: "Understand properties, inheritance and class features.",
    color: "#C4AEFF",
    cards: [
      {
        id: "lang-property-access",
        title: "Property access and computed names",
        summary: "Use dot notation or a key expression.",
        explanation: [
          'obj.name uses the literal key "name". obj[key] evaluates key. Brackets also allow names with spaces and symbol keys. A computed property name in an object literal uses [expression].',
        ],
        code: 'const field = "score";\nconst player = { [field]: 7, "full name": "Milo" };\nconsole.log(player.score);\nconsole.log(player[field]);\nconsole.log(player["full name"]);',
        output: "7\n7\nMilo",
        mode: "run",
        level: "Start here",
        tags: [],
        pitfall:
          "obj.key reads a property literally named key; it does not read the value of your key variable.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors",
      },
      {
        id: "lang-prototypes",
        title: "Prototype inheritance",
        summary: "Missing properties can come from another object.",
        explanation: [
          "An object can delegate property lookup to its prototype, then to that prototype's prototype. Object.create(proto) makes an object with a chosen prototype. Own properties belong directly to the object.",
        ],
        code: 'const parent = { kind: "pet" };\nconst child = Object.create(parent);\nchild.name = "Milo";\nconsole.log(child.kind);\nconsole.log(Object.hasOwn(child, "kind"));\nconsole.log("kind" in child);',
        output: "pet\nfalse\ntrue",
        mode: "run",
        level: "Deeper",
        tags: [],
        pitfall:
          "Inherited properties are not the same as an object's own properties.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain",
      },
      {
        id: "lang-descriptors",
        title: "Property descriptors",
        summary: "Control writing, enumeration and deletion.",
        explanation: [
          "Object.defineProperty() can create data properties with writable, enumerable and configurable flags. When omitted in a new descriptor, those flags default to false. Accessor properties use get and set instead of value and writable.",
        ],
        code: 'const item = {};\nObject.defineProperty(item, "id", { value: 7 });\nconsole.log(item.id);\nconsole.log(Object.keys(item).length);\nconsole.log(Object.getOwnPropertyDescriptor(item, "id").writable);',
        output: "7\n0\nfalse",
        mode: "run",
        level: "Deeper",
        tags: [],
        pitfall:
          "Assignments to a non-writable property can throw in strict mode.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty",
      },
      {
        id: "lang-get-set",
        title: "Getters and setters",
        summary: "Run code when a property is read or written.",
        explanation: [
          "A getter supplies a property value; a setter handles assignment to that property. They look like property access to the caller, even though a function runs behind the scenes.",
        ],
        code: "const counter = {\n  _value: 0,\n  get value() { return this._value; },\n  set value(n) { this._value = Math.max(0, n); }\n};\ncounter.value = -4;\nconsole.log(counter.value);",
        output: "0",
        mode: "run",
        level: "Everyday",
        tags: [],
        pitfall:
          "An underscore is just a naming convention; _value is not private.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get",
      },
      {
        id: "lang-constructor-target",
        title: "constructor and new.target",
        summary: "Initialize an instance and detect construction.",
        explanation: [
          "A class constructor runs when new creates an instance. In a function or constructor, new.target is the constructor that new targeted, or undefined for an ordinary function call.",
        ],
        code: 'function Tool() {\n  this.createdBy = new.target?.name ?? "ordinary call";\n}\nconst tool = new Tool();\nconsole.log(tool.createdBy);',
        output: "Tool",
        mode: "run",
        level: "Deeper",
        tags: [],
        pitfall:
          "constructor is a special class method name, not a general reserved word.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new.target",
      },
      {
        id: "lang-static",
        title: "Static methods and fields",
        summary: "Put behavior on the class itself.",
        explanation: [
          "static members belong to the constructor object, not to each instance. Call a static method through the class name. A static initialization block can perform setup when the class is evaluated.",
        ],
        code: "class Counter {\n  static total = 0;\n  static { this.total = 10; }\n  static next() { return ++this.total; }\n}\nconsole.log(Counter.next());",
        output: "11",
        mode: "run",
        level: "Everyday",
        tags: [],
        pitfall:
          "An instance does not automatically have its class's static methods.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/static",
      },
      {
        id: "lang-private",
        title: "Private class elements: #name",
        summary: "Keep a field or method inside its class.",
        explanation: [
          "A #private field must be declared by the class. Code outside the class cannot access it using that private name. Subclasses also cannot directly access a parent's private names.",
        ],
        code: "class Counter {\n  #value = 0;\n  increment() { return ++this.#value; }\n}\nconst counter = new Counter();\nconsole.log(counter.increment());\nconsole.log(counter.increment());",
        output: "1\n2",
        mode: "run",
        level: "Everyday",
        tags: [],
        pitfall:
          'counter["#value"] is an ordinary string-key property; it does not access the private field.',
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements",
      },
      {
        id: "lang-object-freeze",
        title: "Object.freeze() and const",
        summary: "Protect a binding or an object's own properties.",
        explanation: [
          "const prevents reassignment of a variable. Object.freeze() prevents adding or removing own properties and makes own data properties non-writable. Freezing is shallow: referenced nested objects can still change.",
        ],
        code: "const config = Object.freeze({ nested: { enabled: true } });\nconfig.nested.enabled = false;\nconsole.log(Object.isFrozen(config));\nconsole.log(config.nested.enabled);",
        output: "true\nfalse",
        mode: "run",
        level: "Everyday",
        tags: [],
        pitfall:
          "Freezing an outer object does not recursively freeze nested objects.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze",
      },
    ],
    group: "Core concepts",
  },
  {
    id: "language-modules-async",
    title: "Modules and async patterns",
    description: "Connect files and understand when code resumes.",
    color: "#F4AAE0",
    cards: [
      {
        id: "lang-named-default",
        title: "Named and default exports",
        summary: "Export many named values and at most one default.",
        explanation: [
          "A named import uses the exported name in braces. A default import has no braces and can use any local name. Browser module examples normally need files served over HTTP, not a double-clicked file URL.",
        ],
        code: '// math.js\nexport const square = n => n * n;\nexport default function double(n) { return n * 2; }\n\n// main.js\nimport twice, { square } from "./math.js";\nconsole.log(twice(3), square(3));',
        output: "6 9",
        mode: "module",
        level: "Everyday",
        tags: [],
        pitfall:
          "Run these as two separate module files. Do not paste both files into one script.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules",
      },
      {
        id: "lang-module-aliases",
        title: "Aliases and namespace imports",
        summary: "Rename a binding or group exports under one name.",
        explanation: [
          "as gives an import or export a local or exported alias. import * as name creates a module namespace object. Imported bindings are read-only views of live exports, not independent variable copies.",
        ],
        code: '// values.js\nexport const score = 7;\n\n// main.js\nimport { score as points } from "./values.js";\nimport * as values from "./values.js";\nconsole.log(points, values.score);',
        output: "7 7",
        mode: "module",
        level: "Everyday",
        tags: [],
        pitfall: "You cannot assign a new value to an imported binding.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import",
      },
      {
        id: "lang-dynamic-import",
        title: "Dynamic import()",
        summary: "Load a module when it is needed.",
        explanation: [
          "import(specifier) returns a Promise for a module namespace object. It can be used in ordinary scripts as well as modules. This is useful for optional features, but loading can fail and should be handled.",
        ],
        code: '// tools.js\nexport const double = n => n * 2;\n\n// main.js\nasync function main() {\n  const tools = await import("./tools.js");\n  console.log(tools.double(4));\n}\nmain().catch(console.error);',
        output: "8",
        mode: "module",
        level: "Everyday",
        tags: [],
        pitfall:
          "The path is resolved by the environment. A network or module-evaluation failure rejects the Promise.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import",
      },
      {
        id: "lang-import-meta",
        title: "import.meta",
        summary: "Read metadata about the current module.",
        explanation: [
          "import.meta exists only inside modules. Hosts commonly provide import.meta.url, the current module's URL. new URL(relativePath, import.meta.url) resolves an asset path relative to that module.",
        ],
        code: '// main.js, loaded as a module\nconsole.log(import.meta.url);\nconst asset = new URL("./icon.svg", import.meta.url);\nconsole.log(asset.href);',
        output: "The current module URL, then the icon.svg URL.",
        mode: "module",
        level: "Deeper",
        tags: [],
        pitfall:
          "import.meta is special module syntax; it is not a normal property on an import variable.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta",
      },
      {
        id: "lang-top-level-await",
        title: "Top-level await",
        summary: "Wait directly in a module's outer scope.",
        explanation: [
          "A module can use await outside a function. Its dependent modules wait for its evaluation to complete. This does not block the browser's entire main thread.",
        ],
        code: "// main.js, loaded as a module\nconst value = await Promise.resolve(42);\nconsole.log(value);",
        output: "42",
        mode: "module",
        level: "Everyday",
        tags: [],
        pitfall:
          "Top-level await is not valid in an ordinary classic script. The study runner wraps examples in an async function.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await",
      },
      {
        id: "lang-for-await",
        title: "for await...of",
        summary: "Consume values that arrive asynchronously.",
        explanation: [
          "for await...of works with async iterables and also accepts sync iterables. It awaits each iteration result. Use it inside an async function or at module top level.",
        ],
        code: "async function readValues() {\n  for await (const value of [Promise.resolve(1), Promise.resolve(2)]) {\n    console.log(value);\n  }\n}\nawait readValues();",
        output: "1\n2",
        mode: "run",
        level: "Deeper",
        tags: [],
        pitfall: "for...of alone does not automatically await Promise values.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of",
      },
      {
        id: "lang-async-generators",
        title: "Async generator functions",
        summary: "Produce a sequence with asynchronous work between values.",
        explanation: [
          "async function* combines generators with async functions. It returns an async iterator. Each next() call returns a Promise, and for await...of can consume its yielded values.",
        ],
        code: 'async function* values() {\n  yield await Promise.resolve("A");\n  yield "B";\n}\nfor await (const value of values()) {\n  console.log(value);\n}',
        output: "A\nB",
        mode: "run",
        level: "Deeper",
        tags: [],
        pitfall:
          "An async generator call returns an async iterator, not a Promise for the entire sequence.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function*",
      },
      {
        id: "lang-microtasks",
        title: "The event loop and microtasks",
        summary: "Synchronous code finishes before Promise callbacks resume.",
        explanation: [
          "A JavaScript job runs until its stack is empty. Promise reactions and await continuations use the microtask queue. Microtasks are processed before the next task, such as a timer callback. async does not make heavy calculations run in parallel.",
        ],
        code: 'console.log("A");\nPromise.resolve().then(() => console.log("B"));\nconsole.log("C");\nawait Promise.resolve();',
        output: "A\nC\nB",
        mode: "run",
        level: "Everyday",
        tags: [],
        pitfall:
          "A long synchronous loop can still block a thread. Use a worker when you need CPU work off the page's main thread.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model",
      },
    ],
    group: "Core concepts",
  },
  {
    id: "language-deeper",
    title: "Deeper syntax and resource cleanup",
    description:
      "Recognize advanced syntax and features whose browser support varies.",
    color: "#F8C47D",
    cards: [
      {
        id: "lang-using",
        title: "using declarations",
        summary: "Dispose of a resource when its scope ends.",
        explanation: [
          "using creates a binding that cannot be reassigned and calls the resource's Symbol.dispose method when the scope exits. Resources are cleaned up in reverse declaration order. This is explicit resource cleanup, not a replacement for garbage collection.",
        ],
        code: '{\n  using resource = {\n    [Symbol.dispose]() { console.log("Closed"); }\n  };\n  console.log("Working");\n}',
        output: "Working\nClosed",
        mode: "modern",
        level: "Deeper",
        tags: [],
        pitfall:
          "Check browser support. A disposable object must provide Symbol.dispose; null and undefined are also allowed.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/using",
      },
      {
        id: "lang-await-using",
        title: "await using declarations",
        summary: "Wait for asynchronous cleanup when a scope ends.",
        explanation: [
          "await using calls and awaits Symbol.asyncDispose when leaving the scope. If that method is absent, Symbol.dispose can be used as a fallback. Use it in an async function or a module context where await is allowed.",
        ],
        code: 'async function work() {\n  await using resource = {\n    async [Symbol.asyncDispose]() {\n      await Promise.resolve();\n      console.log("Closed");\n    }\n  };\n  console.log("Working");\n}\nawait work();',
        output: "Working\nClosed",
        mode: "modern",
        level: "Deeper",
        tags: [],
        pitfall:
          "The await belongs to cleanup; it does not automatically await the initializer. Browser support varies.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/await_using",
      },
      {
        id: "lang-disposal-order",
        title: "Cleanup order and errors",
        summary: "Cleanup still runs during a return or a thrown error.",
        explanation: [
          "Resource cleanup happens when leaving the scope, including early returns and exceptions. With multiple resources, cleanup runs in reverse declaration order. If both body and cleanup throw, the combined failure can be represented by SuppressedError.",
        ],
        code: 'function resource(name) {\n  return { [Symbol.dispose]() { console.log(name); } };\n}\n{\n  using first = resource("first");\n  using second = resource("second");\n  console.log("body");\n}',
        output: "body\nsecond\nfirst",
        mode: "modern",
        level: "Deeper",
        tags: [],
        pitfall:
          "Keep cleanup methods small and reliable. Do not rely on garbage-collection timing for important cleanup.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Resource_management",
      },
      {
        id: "lang-reserved-contextual",
        title: "Reserved and contextual words",
        summary: "Not every word that looks special is always reserved.",
        explanation: [
          "Keywords have roles in syntax; reserved words cannot be identifiers in specified contexts. async, of, as, from, get and set have contextual meanings. enum is always reserved. implements, interface, package, private, protected and public are reserved in strict mode.",
        ],
        code: 'const async = "a legal variable name";\nconst object = { default: 1, class: 2 };\nconsole.log(async);\nconsole.log(object.default);',
        output: "a legal variable name\n1",
        mode: "run",
        level: "Deeper",
        tags: [],
        pitfall:
          "Reserved words can often be property names. The rules for variable names are different.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar",
      },
      {
        id: "lang-labels",
        title: "Labels and targeted break/continue",
        summary: "Name an outer loop when control must target it.",
        explanation: [
          "A label names a statement. break label exits that labeled statement. continue label must target an enclosing loop. Ordinary break and continue affect the nearest applicable construct.",
        ],
        code: "outer: for (let row = 0; row \u003c 2; row++) {\n  for (let column = 0; column \u003c 2; column++) {\n    if (row === 1) break outer;\n    console.log(row, column);\n  }\n}",
        output: "0 0\n0 1",
        mode: "run",
        level: "Deeper",
        tags: [],
        pitfall:
          "Labels do not provide a general goto. Clear helper functions often make complex nested loops easier to read.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/label",
      },
      {
        id: "lang-tagged-templates",
        title: "Tagged template literals",
        summary: "Let a function process template text and expressions.",
        explanation: [
          "A tag is called with an array of literal string parts, followed by each interpolated value. It can return any value. Tagged templates are useful for specialized formatting, but safety depends on what the tag does.",
        ],
        code: "function describe(parts, value) {\n  return `${parts[0]}[${value}]${parts[1]}`;\n}\nconst result = describe`Score: ${7}!`;\nconsole.log(result);",
        output: "Score: [7]!",
        mode: "run",
        level: "Deeper",
        tags: [],
        pitfall:
          "A tag does not automatically sanitize HTML or database queries.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals",
      },
    ],
    group: "Core concepts",
  },
  {
    id: "builtin-strings",
    title: "Strings and text",
    description:
      "Create, inspect, search and transform text without changing the original string.",
    color: "#72d9ed",
    cards: [
      {
        id: "builtin-string-values",
        title: "String values and length",
        summary: "Strings are immutable sequences of UTF-16 code units.",
        explanation: [
          "Use quotes or backticks to create a string. String(value) converts a value to text. length measures UTF-16 code units, so one visible character may count as more than one.",
        ],
        code: 'const word = "hello";\nconsole.log(word.length);\nconsole.log(String(42));',
        output: "5\n42",
        mode: "run",
        level: "Start here",
        tags: ["Strings and text", "String values and length"],
        pitfall:
          'Prefer string primitives. new String("hello") creates an object, which behaves differently in comparisons.',
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String",
      },
      {
        id: "builtin-string-access",
        title: "at(), charAt() and indexing",
        summary:
          "Read a position in a string; at() accepts negative positions.",
        explanation: [
          "Positions start at zero. at(-1) reads the last code unit. Out-of-range indexing or at() returns undefined; charAt() returns an empty string.",
        ],
        code: 'const word = "hello";\nconsole.log(word[0]);\nconsole.log(word.at(-1));\nconsole.log(word.at(99));',
        output: "h\no\nundefined",
        mode: "run",
        level: "Everyday",
        tags: ["Strings and text", "at(), charAt() and indexing"],
        pitfall:
          "Reading a code unit is not always reading one complete emoji or visible character.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/at",
      },
      {
        id: "builtin-string-search",
        title: "includes(), startsWith() and endsWith()",
        summary:
          "Ask whether text contains, starts with or ends with another string.",
        explanation: [
          "These methods return true or false and are case-sensitive. Optional positions let you control where the comparison starts or ends.",
        ],
        code: 'const file = "notes.js";\nconsole.log(file.includes("notes"));\nconsole.log(file.startsWith("Notes"));\nconsole.log(file.endsWith(".js"));',
        output: "true\nfalse\ntrue",
        mode: "run",
        level: "Everyday",
        tags: ["Strings and text", "includes(), startsWith() and endsWith()"],
        pitfall:
          "These methods search literal strings, not regular expressions.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes",
      },
      {
        id: "builtin-string-index",
        title: "indexOf() and lastIndexOf()",
        summary: "Find the position of a substring.",
        explanation: [
          "indexOf() finds the first occurrence; lastIndexOf() searches from the end. Both return -1 when the substring is absent.",
        ],
        code: 'const text = "banana";\nconsole.log(text.indexOf("na"));\nconsole.log(text.lastIndexOf("na"));\nconsole.log(text.indexOf("z"));',
        output: "2\n4\n-1",
        mode: "run",
        level: "Everyday",
        tags: ["Strings and text", "indexOf() and lastIndexOf()"],
        pitfall:
          "Position 0 is a valid match but is falsy. Test index !== -1, not just if (index).",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/indexOf",
      },
      {
        id: "builtin-string-slice",
        title: "slice() and substring()",
        summary: "Extract part of a string without changing it.",
        explanation: [
          "The start position is included and the end position is excluded. slice() supports negative positions counted from the end. substring() treats negative values as zero and swaps reversed start/end arguments.",
        ],
        code: 'const text = "JavaScript";\nconsole.log(text.slice(0, 4));\nconsole.log(text.slice(-6));\nconsole.log(text.substring(4, 10));',
        output: "Java\nScript\nScript",
        mode: "run",
        level: "Everyday",
        tags: ["Strings and text", "slice() and substring()"],
        pitfall: "substr() is a legacy feature. Prefer slice() for new code.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/slice",
      },
      {
        id: "builtin-string-case",
        title: "trim() and case conversion",
        summary: "Clean outer whitespace and change letter case.",
        explanation: [
          "trim(), trimStart() and trimEnd() remove whitespace at the edges. toLowerCase() and toUpperCase() return changed copies; locale-aware variants support language-specific rules.",
        ],
        code: 'const raw = "  Hello  ";\nconsole.log(raw.trim().toLowerCase());\nconsole.log("hello".toUpperCase());\nconsole.log(raw.length);',
        output: "hello\nHELLO\n9",
        mode: "run",
        level: "Everyday",
        tags: ["Strings and text", "trim() and case conversion"],
        pitfall:
          "Trimming does not remove spaces inside a string. Case conversion is not always one character to one character.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim",
      },
      {
        id: "builtin-string-split",
        title: "split() and array join()",
        summary: "Turn text into a list, or a list into text.",
        explanation: [
          "split(separator) returns an array. Array.prototype.join(separator) joins array items into one string. A split limit caps the number of returned parts.",
        ],
        code: 'const parts = "red,green,blue".split(",");\nconsole.log(JSON.stringify(parts));\nconsole.log(parts.join(" / "));',
        output: '["red","green","blue"]\nred / green / blue',
        mode: "run",
        level: "Everyday",
        tags: ["Strings and text", "split() and array join()"],
        pitfall: 'split("") splits UTF-16 code units and can break emoji.',
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split",
      },
      {
        id: "builtin-string-replace",
        title: "replace() and replaceAll()",
        summary: "Replace matching text and keep the original unchanged.",
        explanation: [
          "replace() with a string pattern changes only the first match. replaceAll() changes every match. A replacement callback can compute the new text.",
        ],
        code: 'const text = "cat cat";\nconsole.log(text.replace("cat", "dog"));\nconsole.log(text.replaceAll("cat", "dog"));\nconsole.log(text);',
        output: "dog cat\ndog dog\ncat cat",
        mode: "run",
        level: "Everyday",
        tags: ["Strings and text", "replace() and replaceAll()"],
        pitfall:
          "A regular expression passed to replaceAll() must have the g flag.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replaceAll",
      },
      {
        id: "builtin-string-pad",
        title: "padStart(), padEnd() and repeat()",
        summary: "Add padding or repeat a string.",
        explanation: [
          "Padding methods grow a string to a target length. repeat(count) concatenates a string the requested number of times.",
        ],
        code: 'console.log("7".padStart(3, "0"));\nconsole.log("JS".padEnd(5, "."));\nconsole.log("ha".repeat(3));',
        output: "007\nJS...\nhahaha",
        mode: "run",
        level: "Everyday",
        tags: ["Strings and text", "padStart(), padEnd() and repeat()"],
        pitfall:
          "These return strings. Padding a number does not change its numeric value.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart",
      },
      {
        id: "builtin-string-unicode",
        title: "Unicode: code points and normalization",
        summary: "Text length and visible character count are different.",
        explanation: [
          "Spreading a string iterates Unicode code points rather than UTF-16 code units. Some visible characters still contain several code points. normalize() makes equivalent Unicode spellings comparable.",
        ],
        code: 'console.log("😀".length);\nconsole.log([..."😀"].length);\nconsole.log("é".normalize() === "é");',
        output: "2\n1\ntrue",
        mode: "run",
        level: "Deeper",
        tags: ["Strings and text", "Unicode: code points and normalization"],
        pitfall:
          "Use Intl.Segmenter with grapheme granularity for visible-character segmentation.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize",
      },
    ],
    group: "Standard library",
  },
  {
    id: "builtin-arrays",
    title: "Arrays and iteration",
    description:
      "Store ordered lists, choose the right method and distinguish copies from mutations.",
    color: "#91e5b0",
    cards: [
      {
        id: "builtin-array-basics",
        title: "Arrays, length and at()",
        summary: "An array holds an ordered, zero-indexed list.",
        explanation: [
          "Arrays can grow and contain different value types. Array.isArray(value) is the usual array check. length counts positions, including empty slots.",
        ],
        code: 'const colors = ["red", "blue"];\nconsole.log(colors[0], colors.at(-1));\nconsole.log(colors.length);\nconsole.log(Array.isArray(colors));',
        output: "red blue\n2\ntrue",
        mode: "run",
        level: "Start here",
        tags: ["Arrays and iteration", "Arrays, length and at()"],
        pitfall:
          "Assigning a larger length creates empty slots; it does not fill them with actual undefined values.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array",
      },
      {
        id: "builtin-array-ends",
        title: "push(), pop(), unshift() and shift()",
        summary: "Add or remove items at either end of an array.",
        explanation: [
          "push() and unshift() return the new length. pop() and shift() return the removed item, or undefined for an empty array. All four mutate the original.",
        ],
        code: "const items = [2];\nitems.push(3);\nitems.unshift(1);\nconsole.log(items.pop());\nconsole.log(items.shift());\nconsole.log(JSON.stringify(items));",
        output: "3\n1\n[2]",
        mode: "run",
        level: "Everyday",
        tags: ["Arrays and iteration", "push(), pop(), unshift() and shift()"],
        pitfall:
          "Mutating a const array is allowed; const prevents reassigning the variable, not changing array contents.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push",
      },
      {
        id: "builtin-array-slice",
        title: "slice() and concat()",
        summary: "Build a new array from existing items.",
        explanation: [
          "slice(start, end) copies a range, excluding the end. concat() joins arrays or values into a new array. Both make shallow copies.",
        ],
        code: "const a = [1, 2, 3];\nconsole.log(JSON.stringify(a.slice(1)));\nconsole.log(JSON.stringify(a.concat([4])));\nconsole.log(JSON.stringify(a));",
        output: "[2,3]\n[1,2,3,4]\n[1,2,3]",
        mode: "run",
        level: "Everyday",
        tags: ["Arrays and iteration", "slice() and concat()"],
        pitfall:
          "Nested objects remain shared between a shallow copy and the original array.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice",
      },
      {
        id: "builtin-array-splice",
        title: "splice() and toSpliced()",
        summary: "Remove, insert or replace array items.",
        explanation: [
          "splice(start, deleteCount, ...items) mutates the array and returns removed items. toSpliced() performs the edit in a new array and leaves the original unchanged.",
        ],
        code: 'const a = ["a", "b", "c"];\nconsole.log(JSON.stringify(a.splice(1, 1, "x")));\nconsole.log(JSON.stringify(a));\nconsole.log(JSON.stringify(a.toSpliced(1, 1)));',
        output: '["b"]\n["a","x","c"]\n["a","c"]',
        mode: "run",
        level: "Everyday",
        tags: ["Arrays and iteration", "splice() and toSpliced()"],
        pitfall:
          "The return value of splice() is the removed items, not the updated array. toSpliced() needs a modern browser.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSpliced",
      },
      {
        id: "builtin-array-map",
        title: "map()",
        summary: "Transform every visited item into a new array.",
        explanation: [
          "The callback receives the value, index and original array. Return the transformed value. map() itself does not mutate the original, although your callback could.",
        ],
        code: "const prices = [2, 4, 6];\nconst doubled = prices.map(price => price * 2);\nconsole.log(JSON.stringify(doubled));\nconsole.log(JSON.stringify(prices));",
        output: "[4,8,12]\n[2,4,6]",
        mode: "run",
        level: "Start here",
        tags: ["Arrays and iteration", "map()"],
        pitfall:
          "A callback with { } needs an explicit return. Otherwise the mapped results are undefined.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map",
      },
      {
        id: "builtin-array-filter",
        title: "filter()",
        summary: "Keep only items whose test is truthy.",
        explanation: [
          "filter() returns a new array. It preserves the order of retained items and keeps references to any retained objects.",
        ],
        code: "const numbers = [1, 2, 3, 4];\nconst even = numbers.filter(n => n % 2 === 0);\nconsole.log(JSON.stringify(even));",
        output: "[2,4]",
        mode: "run",
        level: "Start here",
        tags: ["Arrays and iteration", "filter()"],
        pitfall:
          "filter() does not stop after the first match. Use find() if you only need one item.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter",
      },
      {
        id: "builtin-array-find",
        title: "find(), findIndex() and findLast()",
        summary: "Locate the first or last item that passes a test.",
        explanation: [
          "find() and findLast() return an item or undefined. findIndex() and findLastIndex() return its position or -1. Last variants search backward.",
        ],
        code: "const values = [2, 5, 8, 5];\nconsole.log(values.find(n => n > 4));\nconsole.log(values.findIndex(n => n > 4));\nconsole.log(values.findLast(n => n > 4));\nconsole.log(values.findLastIndex(n => n > 4));",
        output: "5\n1\n5\n3",
        mode: "run",
        level: "Everyday",
        tags: ["Arrays and iteration", "find(), findIndex() and findLast()"],
        pitfall:
          "A found item can itself be undefined. Use an index check when you must distinguish absence.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find",
      },
      {
        id: "builtin-array-some-every",
        title: "some() and every()",
        summary: "Ask whether at least one item, or every item, passes a test.",
        explanation: [
          "some() stops after a truthy result. every() stops after a falsy result. For an empty array, some() is false and every() is true.",
        ],
        code: "console.log([1, 2, 3].some(n => n > 2));\nconsole.log([1, 2, 3].every(n => n > 0));\nconsole.log([].every(n => n > 0));",
        output: "true\ntrue\ntrue",
        mode: "run",
        level: "Everyday",
        tags: ["Arrays and iteration", "some() and every()"],
        pitfall:
          "These callbacks are not awaited. An async callback returns a Promise, which is truthy.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some",
      },
      {
        id: "builtin-array-reduce",
        title: "reduce() and reduceRight()",
        summary: "Combine items into one accumulated result.",
        explanation: [
          "reduce() visits left to right; reduceRight() visits right to left. Supply an initial value so empty arrays have a defined result and the accumulator type is clear.",
        ],
        code: "const total = [2, 3, 4].reduce(\n  (sum, n) => sum + n,\n  0\n);\nconsole.log(total);",
        output: "9",
        mode: "run",
        level: "Everyday",
        tags: ["Arrays and iteration", "reduce() and reduceRight()"],
        pitfall:
          "Reducing an empty array without an initial value throws a TypeError.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce",
      },
      {
        id: "builtin-array-foreach",
        title: "forEach()",
        summary: "Run a callback for each existing item.",
        explanation: [
          "forEach() is useful for side effects such as printing values. Its return value is always undefined. Use for...of when you need break, continue or sequential await.",
        ],
        code: "const seen = [];\nconst result = [1, 2].forEach(n => seen.push(n * 3));\nconsole.log(JSON.stringify(seen));\nconsole.log(result);",
        output: "[3,6]\nundefined",
        mode: "run",
        level: "Everyday",
        tags: ["Arrays and iteration", "forEach()"],
        pitfall:
          "forEach() does not wait for promises returned by an async callback.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach",
      },
      {
        id: "builtin-array-sort",
        title: "sort(), reverse() and copying variants",
        summary: "Reorder an array, with or without changing the original.",
        explanation: [
          "sort() and reverse() mutate. toSorted() and toReversed() return new arrays. Numeric ascending sorting needs a comparator such as (a, b) => a - b.",
        ],
        code: "const numbers = [10, 2, 1];\nconsole.log(JSON.stringify(numbers.toSorted((a, b) => a - b)));\nconsole.log(JSON.stringify(numbers));\nnumbers.reverse();\nconsole.log(JSON.stringify(numbers));",
        output: "[1,2,10]\n[10,2,1]\n[1,2,10]",
        mode: "run",
        level: "Everyday",
        tags: [
          "Arrays and iteration",
          "sort(), reverse() and copying variants",
        ],
        pitfall:
          "Default sorting compares string forms, so 10 comes before 2. Comparators must be consistent.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort",
      },
      {
        id: "builtin-array-flat",
        title: "flat() and flatMap()",
        summary: "Flatten nested arrays by a chosen depth.",
        explanation: [
          "flat() defaults to one level. flatMap() maps each item and then flattens one level, making it useful when one input produces zero, one or several outputs.",
        ],
        code: "console.log(JSON.stringify([1, [2, [3]]].flat(2)));\nconsole.log(JSON.stringify([1, 2].flatMap(n => [n, n * 10])));",
        output: "[1,2,3]\n[1,10,2,20]",
        mode: "run",
        level: "Everyday",
        tags: ["Arrays and iteration", "flat() and flatMap()"],
        pitfall: "flatMap() does not recursively flatten every nested array.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap",
      },
      {
        id: "builtin-array-create",
        title: "Array.from(), Array.of() and with()",
        summary: "Create lists or replace one item in a copy.",
        explanation: [
          "Array.from() converts an iterable or array-like value, with an optional mapping function. Array.of() treats every argument as an item. with(index, value) returns a copy with one position changed.",
        ],
        code: "console.log(JSON.stringify(Array.from({ length: 3 }, (_, i) => i + 1)));\nconsole.log(JSON.stringify(Array.of(3)));\nconsole.log(JSON.stringify([1, 2, 3].with(1, 9)));",
        output: "[1,2,3]\n[3]\n[1,9,3]",
        mode: "run",
        level: "Everyday",
        tags: ["Arrays and iteration", "Array.from(), Array.of() and with()"],
        pitfall:
          "Array(3) creates three empty slots; Array.of(3) creates a single item containing 3.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from",
      },
      {
        id: "builtin-array-search",
        title: "includes(), indexOf() and iterators",
        summary: "Find values or iterate positions and entries.",
        explanation: [
          "includes() checks for a value and can find NaN. indexOf() returns the first index or -1 and cannot find NaN. keys(), values() and entries() return iterators.",
        ],
        code: "const values = [10, NaN];\nconsole.log(values.includes(NaN));\nconsole.log(values.indexOf(NaN));\nconsole.log(JSON.stringify([...values.keys()]));",
        output: "true\n-1\n[0,1]",
        mode: "run",
        level: "Everyday",
        tags: ["Arrays and iteration", "includes(), indexOf() and iterators"],
        pitfall: "Both methods compare object references, not object contents.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes",
      },
      {
        id: "builtin-array-holes",
        title: "Sparse arrays, fill() and copyWithin()",
        summary:
          "Empty array slots are not the same as stored undefined values.",
        explanation: [
          "Many array methods such as map() skip holes. fill() writes a value into a range; copyWithin() copies a range within the same array. Both mutate.",
        ],
        code: "const sparse = Array(2);\nconsole.log(0 in sparse);\nsparse.fill(undefined);\nconsole.log(0 in sparse);\nconsole.log(JSON.stringify([1, 2, 3].copyWithin(0, 1)));",
        output: "false\ntrue\n[2,3,3]",
        mode: "run",
        level: "Deeper",
        tags: [
          "Arrays and iteration",
          "Sparse arrays, fill() and copyWithin()",
        ],
        pitfall:
          "Array(3).fill({}) shares one object across all three slots. Use Array.from() to create separate objects.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill",
      },
    ],
    group: "Standard library",
  },
  {
    id: "builtin-objects-json",
    title: "Objects and JSON",
    description:
      "Inspect properties, copy data, group values and exchange plain JSON text.",
    color: "#f1d77d",
    cards: [
      {
        id: "builtin-object-literals",
        title: "Object literals and property keys",
        summary: "Store named values together in an object.",
        explanation: [
          "Property keys are strings or symbols. Dot notation uses a fixed name; bracket notation accepts an expression. Object literals can use shorthand names and computed keys.",
        ],
        code: 'const name = "Milo";\nconst field = "score";\nconst player = { name, [field]: 7 };\nconsole.log(player.name, player[field]);',
        output: "Milo 7",
        mode: "run",
        level: "Start here",
        tags: ["Objects and JSON", "Object literals and property keys"],
        pitfall:
          "Two separately created objects are different references, even if their properties look identical.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object",
      },
      {
        id: "builtin-object-entries",
        title: "Object.keys(), values() and entries()",
        summary: "List an object’s own enumerable string-keyed properties.",
        explanation: [
          "keys() returns names, values() returns values, and entries() returns [key, value] pairs. Symbol keys and inherited properties are not included.",
        ],
        code: 'const player = { name: "Milo", score: 7 };\nconsole.log(JSON.stringify(Object.keys(player)));\nconsole.log(JSON.stringify(Object.values(player)));\nconsole.log(JSON.stringify(Object.entries(player)));',
        output: '["name","score"]\n["Milo",7]\n[["name","Milo"],["score",7]]',
        mode: "run",
        level: "Everyday",
        tags: ["Objects and JSON", "Object.keys(), values() and entries()"],
        pitfall:
          "These methods do not list non-enumerable properties. Reflect.ownKeys() includes all own string and symbol keys.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries",
      },
      {
        id: "builtin-object-fromentries",
        title: "Object.fromEntries()",
        summary: "Turn key-value pairs into an object.",
        explanation: [
          "Pass an iterable of two-item entries, such as an array or Map. Repeated keys are overwritten by the later entries.",
        ],
        code: 'const pairs = [["name", "Milo"], ["score", 7]];\nconst player = Object.fromEntries(pairs);\nconsole.log(player.name, player.score);',
        output: "Milo 7",
        mode: "run",
        level: "Everyday",
        tags: ["Objects and JSON", "Object.fromEntries()"],
        pitfall:
          "Entry keys become property keys. Use Map when keys need to be arbitrary objects.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries",
      },
      {
        id: "builtin-object-hasown",
        title: "Object.hasOwn()",
        summary: "Check for a property directly on an object.",
        explanation: [
          "Object.hasOwn(obj, key) ignores inherited properties. It also works for objects without Object.prototype and objects with a property named hasOwnProperty.",
        ],
        code: 'const obj = { value: undefined };\nconsole.log(Object.hasOwn(obj, "value"));\nconsole.log(Object.hasOwn(obj, "toString"));\nconsole.log("toString" in obj);',
        output: "true\nfalse\ntrue",
        mode: "run",
        level: "Everyday",
        tags: ["Objects and JSON", "Object.hasOwn()"],
        pitfall:
          "A property may exist with the value undefined. Testing obj.key !== undefined is not an ownership check.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn",
      },
      {
        id: "builtin-object-copy",
        title: "Object.assign() and object spread",
        summary:
          "Copy own enumerable properties into a target or a new object.",
        explanation: [
          "Object.assign(target, ...sources) mutates its target. Object spread creates a new object literal. Later properties overwrite earlier ones. Both copy nested object references.",
        ],
        code: "const original = { score: 1, stats: { wins: 0 } };\nconst copy = { ...original, score: 2 };\ncopy.stats.wins = 3;\nconsole.log(original.score, original.stats.wins);\nconsole.log(copy.score);",
        output: "1 3\n2",
        mode: "run",
        level: "Everyday",
        tags: ["Objects and JSON", "Object.assign() and object spread"],
        pitfall:
          "These are shallow copies, not recursive clones. Object.assign() can also invoke setters on its target.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign",
      },
      {
        id: "builtin-object-freeze",
        title: "freeze(), seal() and preventExtensions()",
        summary: "Restrict changes to an object.",
        explanation: [
          "preventExtensions() blocks new own properties. seal() also blocks property removal and reconfiguration. freeze() additionally makes own data properties non-writable. These restrictions are shallow.",
        ],
        code: "const config = Object.freeze({ nested: { value: 1 } });\nconfig.nested.value = 2;\nconsole.log(Object.isFrozen(config));\nconsole.log(config.nested.value);",
        output: "true\n2",
        mode: "run",
        level: "Everyday",
        tags: ["Objects and JSON", "freeze(), seal() and preventExtensions()"],
        pitfall:
          "Freezing an object does not recursively freeze its nested objects or make every built-in type immutable.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze",
      },
      {
        id: "builtin-object-is",
        title: "Object.is()",
        summary:
          "Compare values with special handling for NaN and signed zero.",
        explanation: [
          "Object.is() is similar to strict equality but considers NaN equal to itself and distinguishes +0 from -0.",
        ],
        code: "console.log(Object.is(NaN, NaN));\nconsole.log(Object.is(0, -0));\nconsole.log(0 === -0);",
        output: "true\nfalse\ntrue",
        mode: "run",
        level: "Everyday",
        tags: ["Objects and JSON", "Object.is()"],
        pitfall:
          "Object.is() still compares objects by identity, not by their properties.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is",
      },
      {
        id: "builtin-object-groupby",
        title: "Object.groupBy() and Map.groupBy()",
        summary: "Group iterable items according to a callback.",
        explanation: [
          "Object.groupBy() returns a null-prototype object keyed by strings or symbols. Map.groupBy() accepts any grouping key. The grouped items remain the original values, not deep copies.",
        ],
        code: 'const groups = Object.groupBy([1, 2, 3], n => n % 2 ? "odd" : "even");\nconsole.log(JSON.stringify(groups.odd));\nconst map = Map.groupBy([1, 2, 3], n => n % 2);\nconsole.log(JSON.stringify(map.get(0)));',
        output: "[1,3]\n[2]",
        mode: "modern",
        level: "Everyday",
        tags: ["Objects and JSON", "Object.groupBy() and Map.groupBy()"],
        pitfall:
          "Check support in older browsers. These are static methods, not array instance methods.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/groupBy",
      },
      {
        id: "builtin-json-basics",
        title: "JSON.stringify() and JSON.parse()",
        summary: "Convert plain data to JSON text and back.",
        explanation: [
          "stringify() creates JSON text; parse() reads it. JSON supports objects, arrays, strings, numbers, booleans and null. Object property names use double quotes.",
        ],
        code: 'const text = JSON.stringify({ name: "Milo", score: 7 });\nconsole.log(text);\nconst data = JSON.parse(text);\nconsole.log(data.name);',
        output: '{"name":"Milo","score":7}\nMilo',
        mode: "run",
        level: "Start here",
        tags: ["Objects and JSON", "JSON.stringify() and JSON.parse()"],
        pitfall:
          "Invalid JSON throws a SyntaxError. JSON is data, not executable JavaScript.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON",
      },
      {
        id: "builtin-json-limits",
        title: "JSON limits, replacers and revivers",
        summary: "JSON does not preserve every JavaScript value or type.",
        explanation: [
          "undefined-valued object properties are omitted; undefined array entries become null. BigInt and circular references normally throw. Date becomes a string; Map and Set need an explicit representation. Replacer and reviver functions customize conversion.",
        ],
        code: 'console.log(JSON.stringify({ missing: undefined, value: NaN }));\nconsole.log(JSON.stringify([undefined]));\nconst data = JSON.parse(\'{"count":"3"}\', (key, value) =>\n  key === "count" ? Number(value) : value\n);\nconsole.log(data.count + 1);',
        output: '{"value":null}\n[null]\n4',
        mode: "run",
        level: "Deeper",
        tags: ["Objects and JSON", "JSON limits, replacers and revivers"],
        pitfall:
          "JSON.parse(JSON.stringify(value)) is not a general-purpose deep clone. structuredClone() is a separate host API.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify",
      },
    ],
    group: "Standard library",
  },
  {
    id: "builtin-numbers-dates",
    title: "Numbers, dates and international text",
    description:
      "Work with numeric values, time and human-friendly formatting.",
    color: "#c1aff5",
    cards: [
      {
        id: "builtin-number-convert",
        title: "Number(), parseInt() and parseFloat()",
        summary: "Choose full conversion or leading-number parsing.",
        explanation: [
          "Number() converts the whole input. parseInt(text, radix) and parseFloat(text) parse a valid numeric prefix. An unsuccessful conversion produces NaN.",
        ],
        code: 'console.log(Number("12px"));\nconsole.log(parseInt("12px", 10));\nconsole.log(parseFloat("3.5kg"));\nconsole.log(Number(""));',
        output: "NaN\n12\n3.5\n0",
        mode: "run",
        level: "Everyday",
        tags: [
          "Numbers, dates and international text",
          "Number(), parseInt() and parseFloat()",
        ],
        pitfall:
          'Pass a radix to parseInt(). Number("") and Number(" ") are 0, which may be surprising in form validation.',
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number",
      },
      {
        id: "builtin-number-checks",
        title: "Number.isNaN(), isFinite() and isInteger()",
        summary: "Validate numbers without silently converting strings.",
        explanation: [
          "Number.isNaN() only accepts the NaN value. Number.isFinite() rejects infinities and non-numbers. Number.isInteger() checks integer-valued numbers; isSafeInteger() also checks exact integer range.",
        ],
        code: 'console.log(Number.isNaN(NaN));\nconsole.log(Number.isFinite("3"));\nconsole.log(Number.isInteger(3.0));\nconsole.log(Number.isSafeInteger(2 ** 53));',
        output: "true\nfalse\ntrue\nfalse",
        mode: "run",
        level: "Everyday",
        tags: [
          "Numbers, dates and international text",
          "Number.isNaN(), isFinite() and isInteger()",
        ],
        pitfall:
          "Global isNaN() and isFinite() convert their arguments first. Prefer the Number methods for validation.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN",
      },
      {
        id: "builtin-number-precision",
        title: "Floating-point precision and toFixed()",
        summary: "Many decimal fractions are approximate Number values.",
        explanation: [
          "Number uses binary floating point. toFixed(digits) returns a rounded string for display. Number.EPSILON is the gap above 1, not a universal tolerance for every scale.",
        ],
        code: "console.log(0.1 + 0.2 === 0.3);\nconsole.log((0.1 + 0.2).toFixed(2));\nconsole.log(typeof (1.5).toFixed(2));",
        output: "false\n0.30\nstring",
        mode: "run",
        level: "Everyday",
        tags: [
          "Numbers, dates and international text",
          "Floating-point precision and toFixed()",
        ],
        pitfall:
          "Choose tolerances based on scale and purpose. For exact money calculations, choose integer minor units or a suitable decimal library.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/EPSILON",
      },
      {
        id: "builtin-bigint",
        title: "BigInt arithmetic",
        summary: "Represent integers beyond Number’s safe integer range.",
        explanation: [
          "Write an n suffix or call BigInt() on an integer or integer string. BigInt division truncates toward zero. Most arithmetic cannot mix BigInt and Number operands.",
        ],
        code: "const n = 9007199254740993n;\nconsole.log(String(n + 1n));\nconsole.log(String(7n / 2n));\nconsole.log(typeof n);",
        output: "9007199254740994\n3\nbigint",
        mode: "run",
        level: "Everyday",
        tags: ["Numbers, dates and international text", "BigInt arithmetic"],
        pitfall:
          "Converting a huge BigInt to Number can lose precision. BigInt has no decimal fraction part.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt",
      },
      {
        id: "builtin-math-round",
        title: "Math rounding and useful functions",
        summary: "Round, clamp or calculate with numeric values.",
        explanation: [
          "floor() rounds down, ceil() rounds up, trunc() removes the fraction and round() picks the nearest integer, with ties toward positive infinity. abs(), min(), max(), sqrt(), pow(), sign(), log() and trigonometric functions support other calculations.",
        ],
        code: "console.log(Math.floor(-1.2), Math.trunc(-1.2));\nconsole.log(Math.ceil(1.2), Math.round(1.5));\nconsole.log(Math.max(0, Math.min(10, 12)));\nconsole.log(Math.sqrt(81));",
        output: "-2 -1\n2 2\n10\n9",
        mode: "run",
        level: "Everyday",
        tags: [
          "Numbers, dates and international text",
          "Math rounding and useful functions",
        ],
        pitfall:
          "Math works with Number values, not BigInt. Many Math functions return NaN for invalid inputs.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math",
      },
      {
        id: "builtin-math-random",
        title: "Math.random()",
        summary: "Generate a pseudorandom number in [0, 1).",
        explanation: [
          "Math.floor(Math.random() * count) creates an index from 0 through count - 1 when count is a positive integer. The maximum endpoint is excluded.",
        ],
        code: "const r = Math.random();\nconsole.log(r >= 0 && r \u003c 1);\nconst die = Math.floor(r * 6) + 1;\nconsole.log(die >= 1 && die \u003c= 6);",
        output: "true\ntrue",
        mode: "run",
        level: "Everyday",
        tags: ["Numbers, dates and international text", "Math.random()"],
        pitfall:
          "Math.random() is not suitable for passwords, security tokens or cryptography. Use the platform’s cryptographic random API.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random",
      },
      {
        id: "builtin-date-instant",
        title: "Date, timestamps and ISO text",
        summary: "A Date stores one timestamp, not a time zone.",
        explanation: [
          "Date timestamps are milliseconds since 1970-01-01T00:00:00Z. Date.now() returns the current timestamp. toISOString() formats in UTC; getTime() reads milliseconds.",
        ],
        code: 'const date = new Date("2026-01-02T12:30:00Z");\nconsole.log(date.toISOString());\nconsole.log(new Date(0).toISOString());',
        output: "2026-01-02T12:30:00.000Z\n1970-01-01T00:00:00.000Z",
        mode: "run",
        level: "Start here",
        tags: [
          "Numbers, dates and international text",
          "Date, timestamps and ISO text",
        ],
        pitfall:
          "Use unambiguous ISO date-time text with an explicit offset. Parsing arbitrary date text can vary between environments.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date",
      },
      {
        id: "builtin-date-components",
        title: "Date: local time, UTC and mutation",
        summary: "Choose local or UTC getters deliberately.",
        explanation: [
          "getFullYear(), getMonth() and related methods use the device time zone. Their getUTC... versions use UTC. Date month numbers are 0 through 11. set... methods mutate the Date.",
        ],
        code: "const date = new Date(Date.UTC(2026, 0, 2));\nconsole.log(date.getUTCFullYear(), date.getUTCMonth());\ndate.setUTCDate(date.getUTCDate() + 1);\nconsole.log(date.toISOString());",
        output: "2026 0\n2026-01-03T00:00:00.000Z",
        mode: "run",
        level: "Everyday",
        tags: [
          "Numbers, dates and international text",
          "Date: local time, UTC and mutation",
        ],
        pitfall:
          "A calendar day in a local time zone is not always 24 hours because of daylight-saving changes.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getMonth",
      },
      {
        id: "builtin-intl-format",
        title: "Intl.NumberFormat and DateTimeFormat",
        summary: "Format values for a chosen language and time zone.",
        explanation: [
          "Intl formatters separate data from presentation. Set a locale for language conventions and a timeZone when date output must be consistent. Available locale data can differ by environment.",
        ],
        code: 'const numberFormat = new Intl.NumberFormat("en-US");\nconsole.log(numberFormat.format(1234.5));\nconst dateFormat = new Intl.DateTimeFormat("en-GB", {\n  year: "numeric", month: "2-digit", day: "2-digit", timeZone: "UTC"\n});\nconsole.log(dateFormat.format(new Date("2026-01-02T00:00:00Z")));',
        output: "1,234.5\n02/01/2026",
        mode: "run",
        level: "Everyday",
        tags: [
          "Numbers, dates and international text",
          "Intl.NumberFormat and DateTimeFormat",
        ],
        pitfall:
          "Localized display strings should not be parsed back as machine data. Store the original number or timestamp.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl",
      },
      {
        id: "builtin-intl-more",
        title: "Intl.Collator, PluralRules and Segmenter",
        summary:
          "Compare text, choose plural forms and segment visible characters.",
        explanation: [
          "Collator provides language-aware sorting. PluralRules returns categories such as one or other; it does not translate text. Segmenter can split graphemes, words or sentences.",
        ],
        code: 'console.log(new Intl.PluralRules("en").select(1));\nconsole.log(new Intl.PluralRules("en").select(2));\nconst segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });\nconsole.log([...segmenter.segment("é")].length);',
        output: "one\nother\n1",
        mode: "run",
        level: "Everyday",
        tags: [
          "Numbers, dates and international text",
          "Intl.Collator, PluralRules and Segmenter",
        ],
        pitfall:
          "Check locale support and older-browser compatibility, especially for Segmenter.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter",
      },
      {
        id: "builtin-temporal",
        title: "Temporal",
        summary:
          "Model calendar dates, instants and time zones with separate types.",
        explanation: [
          "Temporal.PlainDate represents a date without a time zone. Temporal.Instant represents an exact instant; ZonedDateTime combines an instant with time-zone rules. Temporal operations return new values rather than mutating the original.",
        ],
        code: 'if (typeof Temporal === "undefined") {\n  console.log("Temporal is not available in this browser.");\n} else {\n  const date = Temporal.PlainDate.from("2026-01-02");\n  console.log(date.add({ days: 1 }).toString());\n}',
        output: "2026-01-03, or a browser-support message",
        mode: "modern",
        level: "Deeper",
        tags: ["Numbers, dates and international text", "Temporal"],
        pitfall:
          "Temporal support is still uneven. Check the documentation and your target browsers; a polyfill may be needed.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal",
      },
      {
        id: "builtin-intl-language",
        title: "Intl relative times, lists and display names",
        summary: "Format relative times and language-sensitive labels.",
        explanation: [
          "RelativeTimeFormat formats amounts such as yesterday or in two days. ListFormat joins words using language rules. DisplayNames provides names for languages, regions, currencies and other categories.",
        ],
        code: 'console.log(new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(-1, "day"));\nconsole.log(new Intl.ListFormat("en").format(["red", "blue"]));\nconsole.log(new Intl.DisplayNames(["en"], { type: "language" }).of("sv"));',
        output: "yesterday\nred and blue\nSwedish",
        mode: "run",
        level: "Everyday",
        tags: [
          "Numbers, dates and international text",
          "Intl relative times, lists and display names",
        ],
        pitfall:
          "Formatting depends on locale data. Store machine-readable values separately from the localized display text.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat",
      },
    ],
    group: "Standard library",
  },
  {
    id: "builtin-collections",
    title: "Maps, sets and weak collections",
    description:
      "Choose a collection according to what its keys and values need to do.",
    color: "#7dccf4",
    cards: [
      {
        id: "builtin-map",
        title: "Map",
        summary: "Store key-value pairs with keys of any type.",
        explanation: [
          "set(), get(), has(), delete() and clear() manage entries. size reports the count. Iteration follows insertion order. Object keys are matched by reference.",
        ],
        code: "const key = { id: 1 };\nconst scores = new Map();\nscores.set(key, 10);\nconsole.log(scores.get(key), scores.size);\nconsole.log(scores.get({ id: 1 }));",
        output: "10 1\nundefined",
        mode: "run",
        level: "Start here",
        tags: ["Maps, sets and weak collections", "Map"],
        pitfall:
          "Map entries are not object properties. Use map.set(key, value), not map[key] = value.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map",
      },
      {
        id: "builtin-map-iteration",
        title: "Map keys(), values() and entries()",
        summary: "Read a Map as iterable keys, values or pairs.",
        explanation: [
          "A Map’s default iterator yields [key, value] pairs. Spreading these iterators creates arrays. Object.fromEntries() can convert suitable entries into an object.",
        ],
        code: 'const map = new Map([["a", 1], ["b", 2]]);\nconsole.log(JSON.stringify([...map.keys()]));\nconsole.log(JSON.stringify([...map.values()]));\nconsole.log(JSON.stringify([...map]));',
        output: '["a","b"]\n[1,2]\n[["a",1],["b",2]]',
        mode: "run",
        level: "Everyday",
        tags: [
          "Maps, sets and weak collections",
          "Map keys(), values() and entries()",
        ],
        pitfall:
          "Converting to an object changes non-symbol keys into strings. Distinct Map keys can then collide.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/entries",
      },
      {
        id: "builtin-set",
        title: "Set",
        summary: "Keep unique values in insertion order.",
        explanation: [
          "add(), has(), delete() and clear() manage values. size reports the count. Duplicate primitive values collapse; different object references remain different values.",
        ],
        code: "const unique = new Set([1, 2, 2, 3]);\nunique.add(4);\nconsole.log(JSON.stringify([...unique]));\nconsole.log(unique.has(2), unique.size);\nconsole.log(new Set([{}, {}]).size);",
        output: "[1,2,3,4]\ntrue 4\n2",
        mode: "run",
        level: "Start here",
        tags: ["Maps, sets and weak collections", "Set"],
        pitfall:
          "Set does not compare object contents. Two separate { id: 1 } objects are two values.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set",
      },
      {
        id: "builtin-set-operations",
        title: "Set union(), intersection() and difference()",
        summary: "Combine sets without changing the originals.",
        explanation: [
          "union() includes either set; intersection() includes shared values; difference() keeps values missing from the other set. symmetricDifference() keeps values in exactly one set. Subset, superset and disjoint tests return booleans.",
        ],
        code: "const a = new Set([1, 2]);\nconst b = new Set([2, 3]);\nconsole.log(JSON.stringify([...a.union(b)]));\nconsole.log(JSON.stringify([...a.intersection(b)]));\nconsole.log(JSON.stringify([...a.difference(b)]));",
        output: "[1,2,3]\n[2]\n[1]",
        mode: "modern",
        level: "Everyday",
        tags: [
          "Maps, sets and weak collections",
          "Set union(), intersection() and difference()",
        ],
        pitfall:
          "Check support in older browsers. These methods return new Sets.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set",
      },
      {
        id: "builtin-weak-collections",
        title: "WeakMap and WeakSet",
        summary: "Associate data without keeping collectable keys alive.",
        explanation: [
          "WeakMap weakly holds its keys; WeakSet weakly holds its members. Objects and non-registered symbols can be used. They have no size or public iteration because garbage collection is not predictable.",
        ],
        code: 'const key = {};\nconst cache = new WeakMap([[key, "cached"]]);\nconst visited = new WeakSet([key]);\nconsole.log(cache.get(key));\nconsole.log(visited.has(key));',
        output: "cached\ntrue",
        mode: "run",
        level: "Deeper",
        tags: ["Maps, sets and weak collections", "WeakMap and WeakSet"],
        pitfall:
          "WeakMap values are not weak references. A key must still be reachable to look up its associated value.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap",
      },
    ],
    group: "Standard library",
  },
  {
    id: "builtin-promises",
    title: "Promises and async results",
    description:
      "Compose eventual success or failure and handle both paths explicitly.",
    color: "#eeaee0",
    cards: [
      {
        id: "builtin-promise-create",
        title: "new Promise(), resolve() and reject()",
        summary: "Represent an operation that will settle once.",
        explanation: [
          "The executor passed to new Promise() runs immediately. resolve() adopts a value or another promise; reject() rejects with a reason. Once settled, a promise cannot switch to another result.",
        ],
        code: 'const task = new Promise(resolve => {\n  console.log("executor");\n  resolve(7);\n});\nconsole.log("after creation");\nconsole.log(await task);',
        output: "executor\nafter creation\n7",
        mode: "run",
        level: "Everyday",
        tags: [
          "Promises and async results",
          "new Promise(), resolve() and reject()",
        ],
        pitfall:
          "The Promise constructor does not make expensive synchronous code run on another thread. Avoid async executor functions.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise",
      },
      {
        id: "builtin-promise-chain",
        title: "then() and catch()",
        summary: "Build a chain by returning the next value or promise.",
        explanation: [
          "then() returns a new promise. A returned value fulfills the next link; a thrown error rejects it. catch() handles a rejection and can recover by returning a value.",
        ],
        code: 'const result = await Promise.resolve(3)\n  .then(n => n * 2)\n  .then(() => { throw new Error("Oops"); })\n  .catch(error => "Recovered: " + error.message);\nconsole.log(result);',
        output: "Recovered: Oops",
        mode: "run",
        level: "Everyday",
        tags: ["Promises and async results", "then() and catch()"],
        pitfall:
          "Return asynchronous work from then() so the chain waits for it. A missing return can accidentally detach work.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then",
      },
      {
        id: "builtin-promise-finally",
        title: "Promise.prototype.finally()",
        summary: "Run cleanup after either fulfillment or rejection.",
        explanation: [
          "finally() receives no result argument. It usually passes the original value or error through. If it throws or returns a rejected promise, that failure replaces the original outcome.",
        ],
        code: 'const result = await Promise.resolve(5)\n  .finally(() => console.log("cleanup"));\nconsole.log(result);',
        output: "cleanup\n5",
        mode: "run",
        level: "Everyday",
        tags: ["Promises and async results", "Promise.prototype.finally()"],
        pitfall:
          "Promise.finally() is a method on a promise; finally in try/catch is a language keyword.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/finally",
      },
      {
        id: "builtin-promise-all",
        title: "Promise.all()",
        summary:
          "Wait for every input to fulfill, or reject on the first rejection.",
        explanation: [
          "The result array follows input order, not completion order. This is useful for independent operations whose results are all required. Empty input fulfills with an empty array.",
        ],
        code: 'const results = await Promise.all([\n  Promise.resolve("first"),\n  Promise.resolve("second")\n]);\nconsole.log(JSON.stringify(results));',
        output: '["first","second"]',
        mode: "run",
        level: "Everyday",
        tags: ["Promises and async results", "Promise.all()"],
        pitfall:
          "Rejecting Promise.all() does not cancel the remaining operations.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all",
      },
      {
        id: "builtin-promise-allsettled",
        title: "Promise.allSettled()",
        summary: "Wait for all outcomes, including failures.",
        explanation: [
          "Each result has status fulfilled with a value, or rejected with a reason. Results remain in input order. Use this when one failure should not discard other results.",
        ],
        code: 'const results = await Promise.allSettled([\n  Promise.resolve(1),\n  Promise.reject(new Error("failed"))\n]);\nconsole.log(results.map(item => item.status).join(", "));',
        output: "fulfilled, rejected",
        mode: "run",
        level: "Everyday",
        tags: ["Promises and async results", "Promise.allSettled()"],
        pitfall:
          "Read value only for fulfilled entries, and reason only for rejected entries.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled",
      },
      {
        id: "builtin-promise-any",
        title: "Promise.any()",
        summary: "Use the first fulfillment and ignore earlier rejections.",
        explanation: [
          "If every input rejects, Promise.any() rejects with an AggregateError containing the rejection reasons. Empty input also rejects.",
        ],
        code: 'const value = await Promise.any([\n  Promise.reject(new Error("unavailable")),\n  Promise.resolve("ready")\n]);\nconsole.log(value);',
        output: "ready",
        mode: "run",
        level: "Everyday",
        tags: ["Promises and async results", "Promise.any()"],
        pitfall:
          "First fulfillment is different from first settlement. Promise.race() also accepts a rejection as the winning outcome.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any",
      },
      {
        id: "builtin-promise-race",
        title: "Promise.race()",
        summary: "Adopt whichever input settles first.",
        explanation: [
          "The first settled input determines fulfillment or rejection. This can build timeout patterns, but actual cancellation needs a separate mechanism such as AbortController.",
        ],
        code: 'const value = await Promise.race([\n  Promise.resolve("first"),\n  Promise.resolve("second")\n]);\nconsole.log(value);',
        output: "first",
        mode: "run",
        level: "Everyday",
        tags: ["Promises and async results", "Promise.race()"],
        pitfall:
          "Promise.race([]) never settles. Losing operations keep running unless explicitly cancelled.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race",
      },
      {
        id: "builtin-promise-resolvers",
        title: "Promise.withResolvers()",
        summary: "Get a promise and its resolve/reject functions together.",
        explanation: [
          "The returned object contains promise, resolve and reject. This is useful when an external event determines the result, without keeping a constructor callback open.",
        ],
        code: 'const { promise, resolve } = Promise.withResolvers();\nresolve("ready");\nconsole.log(await promise);',
        output: "ready",
        mode: "modern",
        level: "Everyday",
        tags: ["Promises and async results", "Promise.withResolvers()"],
        pitfall:
          "Resolve or reject every created task on the relevant paths so callers do not wait forever. Older browsers may need support checks.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers",
      },
    ],
    group: "Standard library",
  },
  {
    id: "builtin-advanced-builtins",
    title: "Patterns and advanced built-ins",
    description:
      "A guided introduction to regular expressions, binary data, reflection and memory-related tools.",
    color: "#ffb59d",
    cards: [
      {
        id: "builtin-regexp-test",
        title: "RegExp and test()",
        summary: "Describe a text pattern and test whether it matches.",
        explanation: [
          "A regular expression literal uses /pattern/flags. test(text) returns a boolean; exec(text) returns match information or null. ^ and $ anchor the pattern, and + repeats one or more times.",
        ],
        code: 'const digits = /^[0-9]+$/;\nconsole.log(digits.test("123"));\nconsole.log(digits.test("123x"));\nconsole.log(/cat/i.test("CAT"));',
        output: "true\nfalse\ntrue",
        mode: "run",
        level: "Everyday",
        tags: ["Patterns and advanced built-ins", "RegExp and test()"],
        pitfall:
          "Regular expressions are powerful but are often the wrong tool for parsing structured formats such as HTML.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp",
      },
      {
        id: "builtin-regexp-groups",
        title: "Capturing groups and matchAll()",
        summary: "Extract parts of matches instead of only testing them.",
        explanation: [
          "Parentheses capture text; named groups use (?\u003cname>...). String.matchAll() returns an iterator of matches and requires a global regular expression.",
        ],
        code: 'const text = "x=12 y=3";\nconst matches = [...text.matchAll(/(?\u003cname>[a-z])=([0-9]+)/g)];\nconsole.log(matches[0].groups.name, matches[0][2]);\nconsole.log(matches.length);',
        output: "x 12\n2",
        mode: "run",
        level: "Everyday",
        tags: [
          "Patterns and advanced built-ins",
          "Capturing groups and matchAll()",
        ],
        pitfall:
          "Check for null after exec() or match() before reading capture groups.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll",
      },
      {
        id: "builtin-regexp-flags",
        title: "Regex flags and stateful lastIndex",
        summary:
          "Some regular expressions remember where the previous match ended.",
        explanation: [
          "g finds global matches; y matches at lastIndex. These flags make repeated test()/exec() calls update lastIndex. Other flags include i for case-insensitive, m for multiline anchors, s for dotAll, and u or v for Unicode-aware modes.",
        ],
        code: 'const pattern = /a/g;\nconsole.log(pattern.test("a"));\nconsole.log(pattern.test("a"));\npattern.lastIndex = 0;\nconsole.log(pattern.test("a"));',
        output: "true\nfalse\ntrue",
        mode: "run",
        level: "Deeper",
        tags: [
          "Patterns and advanced built-ins",
          "Regex flags and stateful lastIndex",
        ],
        pitfall:
          "Do not reuse a g or y regex for independent boolean tests without considering lastIndex. u and v cannot be combined.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/lastIndex",
      },
      {
        id: "builtin-regexp-replacement",
        title: "Regex replacement callbacks",
        summary: "Compute replacement text from each match.",
        explanation: [
          "String.replace() can accept a function. With a g regex, the function runs for every match. It receives the full match, capture groups and position information.",
        ],
        code: 'const result = "a1 b2".replace(/[0-9]/g, digit => String(Number(digit) * 10));\nconsole.log(result);',
        output: "a10 b20",
        mode: "run",
        level: "Everyday",
        tags: [
          "Patterns and advanced built-ins",
          "Regex replacement callbacks",
        ],
        pitfall:
          "Avoid overly complex patterns with explosive backtracking, especially on large or untrusted text.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace",
      },
      {
        id: "builtin-regexp-escape",
        title: "RegExp.escape()",
        summary: "Treat dynamic text as literal characters in a regex.",
        explanation: [
          "RegExp.escape(text) escapes text so characters such as . and * are matched literally. It is useful when combining a fixed pattern with user-supplied search text.",
        ],
        code: 'const literal = "a.b";\nconst pattern = new RegExp("^" + RegExp.escape(literal) + "$");\nconsole.log(pattern.test("a.b"));\nconsole.log(pattern.test("axb"));',
        output: "true\nfalse",
        mode: "modern",
        level: "Deeper",
        tags: ["Patterns and advanced built-ins", "RegExp.escape()"],
        pitfall:
          "This is a newer method. Check support in older browsers; do not assume a home-made escape regex handles every context.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/escape",
      },
      {
        id: "builtin-binary-data",
        title: "ArrayBuffer, typed arrays and DataView",
        summary:
          "Read and write raw bytes with explicit numeric representations.",
        explanation: [
          "ArrayBuffer owns memory. Typed arrays such as Uint8Array, Int32Array and Float64Array view that memory as numeric elements. DataView reads different numeric types with an explicit byte order.",
        ],
        code: "const buffer = new ArrayBuffer(4);\nconst view = new DataView(buffer);\nview.setUint16(0, 258, false);\nconsole.log(JSON.stringify([...new Uint8Array(buffer)]));\nconsole.log(view.getUint16(0, false));",
        output: "[1,2,0,0]\n258",
        mode: "run",
        level: "Deeper",
        tags: [
          "Patterns and advanced built-ins",
          "ArrayBuffer, typed arrays and DataView",
        ],
        pitfall:
          "Different views can share the same buffer: changing one changes what the others see. false here means big-endian byte order.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer",
      },
      {
        id: "builtin-typedarray-operations",
        title: "TypedArray set(), slice() and subarray()",
        summary: "Copy binary data or create another view over it.",
        explanation: [
          "Typed arrays have fixed element types. set() copies elements into an existing view. slice() copies into a new buffer; subarray() makes a view sharing the same memory.",
        ],
        code: "const bytes = new Uint8Array([1, 2, 3]);\nconst view = bytes.subarray(1);\nconst copy = bytes.slice(1);\nview[0] = 9;\nconsole.log(JSON.stringify([...bytes]));\nconsole.log(JSON.stringify([...copy]));",
        output: "[1,9,3]\n[2,3]",
        mode: "run",
        level: "Deeper",
        tags: [
          "Patterns and advanced built-ins",
          "TypedArray set(), slice() and subarray()",
        ],
        pitfall:
          "Integer typed arrays convert out-of-range values rather than storing arbitrary JavaScript numbers unchanged.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/subarray",
      },
      {
        id: "builtin-proxy-reflect",
        title: "Proxy and Reflect",
        summary: "Intercept object operations and forward them deliberately.",
        explanation: [
          "Proxy traps can customize reads, writes and other operations. Reflect exposes the corresponding standard operations as functions. Forwarding with Reflect helps preserve expected receiver behavior.",
        ],
        code: 'const target = { score: 7 };\nconst proxy = new Proxy(target, {\n  get(object, key, receiver) {\n    return key === "missing" ? 0 : Reflect.get(object, key, receiver);\n  }\n});\nconsole.log(proxy.score, proxy.missing);',
        output: "7 0",
        mode: "run",
        level: "Deeper",
        tags: ["Patterns and advanced built-ins", "Proxy and Reflect"],
        pitfall:
          "Proxies must obey object invariants. Private fields and some built-in internal slots can make forwarding less straightforward.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy",
      },
      {
        id: "builtin-symbol-protocols",
        title: "Symbol keys and well-known protocols",
        summary: "Use unique keys or opt into language behavior.",
        explanation: [
          "Each Symbol() call makes a unique primitive. Symbol.for() uses a shared registry. Well-known symbols such as Symbol.iterator, Symbol.toPrimitive and Symbol.toStringTag customize specific operations.",
        ],
        code: 'const secret = Symbol("id");\nconst item = { [secret]: 7, name: "Milo" };\nconsole.log(item[secret]);\nconsole.log(JSON.stringify(Object.keys(item)));\nconsole.log(Reflect.ownKeys(item).length);',
        output: '7\n["name"]\n2',
        mode: "run",
        level: "Deeper",
        tags: [
          "Patterns and advanced built-ins",
          "Symbol keys and well-known protocols",
        ],
        pitfall:
          "A Symbol property is not a security boundary: reflection can find symbol keys.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol",
      },
      {
        id: "builtin-iterator-helpers",
        title: "Iterator helpers",
        summary:
          "Transform a sequence lazily, producing values only when needed.",
        explanation: [
          "Iterator.from() wraps an iterable. Helpers such as map(), filter(), drop(), take() and flatMap() return iterators. toArray(), reduce(), some(), every() and find() consume values.",
        ],
        code: "const result = Iterator.from([1, 2, 3, 4])\n  .filter(n => n % 2 === 0)\n  .map(n => n * 10)\n  .take(1)\n  .toArray();\nconsole.log(JSON.stringify(result));",
        output: "[20]",
        mode: "modern",
        level: "Deeper",
        tags: ["Patterns and advanced built-ins", "Iterator helpers"],
        pitfall:
          "Iterators are consumed as you use them. Older browsers may not support these newer helpers.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator",
      },
      {
        id: "builtin-weakref-finalization",
        title: "WeakRef and FinalizationRegistry",
        summary:
          "Observe collectable objects without controlling collection timing.",
        explanation: [
          "WeakRef.deref() returns the object if it is still available, otherwise undefined. FinalizationRegistry can request a callback after collection, but neither timing nor execution is guaranteed.",
        ],
        code: "const item = { value: 7 };\nconst ref = new WeakRef(item);\nconsole.log(ref.deref().value);\n// Keep item strongly referenced in this example.",
        output: "7",
        mode: "run",
        level: "Deeper",
        tags: [
          "Patterns and advanced built-ins",
          "WeakRef and FinalizationRegistry",
        ],
        pitfall:
          "Do not depend on finalization for correctness, closing important resources or timely cleanup. Prefer explicit cleanup.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakRef",
      },
      {
        id: "builtin-shared-memory",
        title: "SharedArrayBuffer and Atomics",
        summary: "Coordinate shared memory between workers.",
        explanation: [
          "SharedArrayBuffer lets workers share bytes. Atomics provides operations such as load(), store(), add() and compareExchange() with defined atomic behavior. Browser shared memory requires an appropriate secure, cross-origin-isolated page.",
        ],
        code: "// Requires shared-memory support and browser isolation.\nconst shared = new SharedArrayBuffer(4);\nconst values = new Int32Array(shared);\nAtomics.store(values, 0, 1);\nAtomics.add(values, 0, 2);\nconsole.log(Atomics.load(values, 0));",
        output: "3 in a supported, correctly isolated environment",
        mode: "read",
        level: "Deeper",
        tags: [
          "Patterns and advanced built-ins",
          "SharedArrayBuffer and Atomics",
        ],
        pitfall:
          "This local study file is not configured for browser shared memory. Do not block the main browser thread with Atomics.wait().",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer",
      },
      {
        id: "builtin-error-families",
        title: "Error types, cause and AggregateError",
        summary: "Use error objects to describe and preserve failures.",
        explanation: [
          "TypeError describes an unsuitable type or operation; RangeError an out-of-range value; ReferenceError an unavailable binding; SyntaxError invalid syntax; URIError invalid URI encoding. Error supports a cause, and AggregateError holds multiple errors.",
        ],
        code: 'const original = new TypeError("Expected a number");\nconst wrapped = new Error("Save failed", { cause: original });\nconsole.log(wrapped.message);\nconsole.log(wrapped.cause.name);\nconst group = new AggregateError([original], "Several failures");\nconsole.log(group.errors.length);',
        output: "Save failed\nTypeError\n1",
        mode: "run",
        level: "Everyday",
        tags: [
          "Patterns and advanced built-ins",
          "Error types, cause and AggregateError",
        ],
        pitfall:
          "EvalError is retained largely for compatibility. Some names, such as InternalError, are not portable standard errors. SuppressedError relates to newer disposal features.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error",
      },
      {
        id: "builtin-uri-encoding",
        title: "encodeURIComponent() and URI helpers",
        summary: "Encode a value so reserved URL characters become data.",
        explanation: [
          "encodeURIComponent() encodes an individual URL component; decodeURIComponent() reverses it. encodeURI() is intended for a whole URI and keeps structural punctuation. For query parameters, the platform URLSearchParams API is usually easier.",
        ],
        code: 'const encoded = encodeURIComponent("A&B C");\nconsole.log(encoded);\nconsole.log(decodeURIComponent(encoded));',
        output: "A%26B%20C\nA&B C",
        mode: "run",
        level: "Everyday",
        tags: [
          "Patterns and advanced built-ins",
          "encodeURIComponent() and URI helpers",
        ],
        pitfall:
          "Decoding malformed percent escapes throws URIError. Encoding is not encryption and does not make an unsafe URL safe to visit.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent",
      },
      {
        id: "builtin-dynamic-code",
        title: "Function() and eval()",
        summary: "JavaScript can turn text into executable code.",
        explanation: [
          "The Function constructor builds a function from strings and uses global scope. Direct eval() evaluates text as code and can access the calling scope. Ordinary functions and explicit data parsing are easier to understand and control.",
        ],
        code: 'const add = new Function("a", "b", "return a + b;");\nconsole.log(add(2, 3));\n// Usually prefer: const add = (a, b) => a + b;',
        output: "5",
        mode: "run",
        level: "Deeper",
        tags: ["Patterns and advanced built-ins", "Function() and eval()"],
        pitfall:
          "Never execute untrusted text with Function() or eval(). Use JSON.parse() to read JSON data. Some sites intentionally block dynamic code execution.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/Function",
      },
    ],
    group: "Standard library",
  },
  {
    id: "platform-dom",
    title: "DOM and forms",
    description:
      "Browser APIs let JavaScript read and change a webpage. These examples need a document and should run after its body exists.",
    color: "#73D7F4",
    cards: [
      {
        id: "platform-select",
        title: "querySelector / querySelectorAll",
        summary: "Find elements using CSS selectors.",
        explanation: [
          "querySelector returns the first matching element or null. querySelectorAll returns a static NodeList of all matches; it is iterable but is not an Array.",
        ],
        code: 'const list = document.createElement("ul");\nlist.innerHTML = "\u003cli>Red\u003c/li>\u003cli>Blue\u003c/li>";\ndocument.body.append(list);\nconst first = list.querySelector("li");\nconsole.log(first.textContent);\nconsole.log(list.querySelectorAll("li").length);',
        output: "Red\n2",
        mode: "browser",
        level: "Start here",
        tags: ["DOM", "selection", "NodeList"],
        pitfall:
          "Check for null before reading a missing element. The HTML here is a fixed string; use textContent for untrusted text.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector",
      },
      {
        id: "platform-create",
        title: "createElement / append / remove",
        summary: "Build and remove elements.",
        explanation: [
          "Create an element, set its properties, and append it to an existing container. Appending an existing node moves that node; it does not copy it.",
        ],
        code: 'const note = document.createElement("p");\nnote.textContent = "Hello, webpage!";\ndocument.body.append(note);\nconsole.log(note.isConnected); // true\nnote.remove();\nconsole.log(note.isConnected); // false',
        output: "true\nfalse",
        mode: "browser",
        level: "Start here",
        tags: ["DOM", "create", "append", "remove"],
        pitfall:
          "Creating a node alone does not make it visible; insert it into the document.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement",
      },
      {
        id: "platform-text",
        title: "textContent / innerHTML",
        summary: "Choose between plain text and parsed HTML.",
        explanation: [
          "textContent inserts text literally. innerHTML parses a string as HTML, which is useful for trusted templates but dangerous for untrusted input.",
        ],
        code: 'const message = document.createElement("p");\nmessage.textContent = "\u003cstrong>Hello\u003c/strong>";\ndocument.body.append(message);\nconsole.log(message.textContent);',
        output: "\u003cstrong>Hello\u003c/strong>",
        mode: "browser",
        level: "Start here",
        tags: ["DOM", "text", "HTML", "XSS"],
        pitfall:
          "Never pass untrusted strings to innerHTML without a suitable sanitization strategy.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent",
      },
      {
        id: "platform-attributes",
        title: "Attributes, properties and dataset",
        summary: "Read markup information and live element state.",
        explanation: [
          "Attributes are strings in markup. Properties represent live JavaScript state and may have different types. data-* attributes are available through dataset.",
        ],
        code: 'const input = document.createElement("input");\ninput.setAttribute("value", "start");\ninput.value = "edited";\ninput.dataset.userId = "42";\nconsole.log(input.getAttribute("value"));\nconsole.log(input.value, input.dataset.userId);',
        output: "start\nedited 42",
        mode: "browser",
        level: "Everyday",
        tags: ["DOM", "attributes", "properties", "dataset"],
        pitfall:
          "An input's current value can differ from its value attribute. dataset values are strings.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset",
      },
      {
        id: "platform-classes",
        title: "classList / style",
        summary: "Change an element's visual state.",
        explanation: [
          "classList adds, removes, toggles and checks CSS classes. Prefer a reusable class for styling; style sets inline CSS properties.",
        ],
        code: 'const box = document.createElement("div");\nbox.classList.add("notice");\nbox.classList.toggle("selected", true);\nbox.style.padding = "1rem";\nconsole.log(box.classList.contains("selected"));',
        output: "true",
        mode: "browser",
        level: "Start here",
        tags: ["DOM", "CSS", "classList", "style"],
        pitfall:
          "Adding a class has no visible effect unless a matching CSS rule exists.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/API/Element/classList",
      },
      {
        id: "platform-forms",
        title: "Forms, FormData and validation",
        summary: "Read named form controls.",
        explanation: [
          "FormData collects successful controls: disabled controls and unchecked checkboxes are omitted. Built-in validation checks constraints such as required and type=email.",
        ],
        code: 'const form = document.createElement("form");\nconst input = document.createElement("input");\ninput.name = "email";\ninput.type = "email";\ninput.required = true;\ninput.value = "learner@example.com";\nform.append(input);\nconst data = new FormData(form);\nconsole.log(form.checkValidity());\nconsole.log(data.get("email"));',
        output: "true\nlearner@example.com",
        mode: "browser",
        level: "Everyday",
        tags: ["forms", "FormData", "validation", "input"],
        pitfall:
          "Client-side validation improves usability; validate again on the server. Avoid logging personal form data in production.",
        source: "https://developer.mozilla.org/en-US/docs/Web/API/FormData",
      },
      {
        id: "platform-ready",
        title: "DOMContentLoaded / script loading",
        summary: "Run DOM code after the HTML is ready.",
        explanation: [
          "A deferred external classic script runs after HTML parsing and before DOMContentLoaded. Module scripts are deferred by default. An async script runs when ready and does not preserve the same ordering.",
        ],
        code: 'function start() {\n  console.log("The DOM is ready");\n}\nif (document.readyState === "loading") {\n  document.addEventListener("DOMContentLoaded", start, {\n    once: true\n  });\n} else {\n  start();\n}',
        output: "The DOM is ready",
        mode: "browser",
        level: "Everyday",
        tags: ["DOMContentLoaded", "defer", "async", "modules"],
        pitfall:
          "DOMContentLoaded does not wait for images to finish loading. Script-tag async is different from an async function.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event",
      },
    ],
    group: "Browser & tools",
  },
  {
    id: "platform-events",
    title: "Events and interaction",
    description:
      "Events connect code to clicks, typing, forms and application messages. Prefer native controls and predictable behavior.",
    color: "#8DE6AD",
    cards: [
      {
        id: "platform-listeners",
        title: "addEventListener / removeEventListener",
        summary: "Attach and detach event handlers.",
        explanation: [
          "Keep the function reference if you will remove a listener later. The once option automatically removes a listener after its first invocation.",
        ],
        code: 'const button = document.createElement("button");\nbutton.textContent = "Try me";\nfunction greet() {\n  console.log("Hello");\n}\nbutton.addEventListener("click", greet);\nbutton.click();\nbutton.removeEventListener("click", greet);\nbutton.click();',
        output: "Hello",
        mode: "browser",
        level: "Start here",
        tags: ["events", "listener", "once"],
        pitfall:
          "A newly written arrow function is a different function, even if its body looks identical.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener",
      },
      {
        id: "platform-event-target",
        title: "event.target / currentTarget",
        summary: "Know what triggered a handler and where it is attached.",
        explanation: [
          "target identifies the event's target. currentTarget identifies the element whose listener is running. Event retargeting can change target across shadow-DOM boundaries.",
        ],
        code: 'const outer = document.createElement("div");\nconst button = document.createElement("button");\nbutton.textContent = "Click";\nouter.append(button);\nouter.addEventListener("click", event => {\n  console.log(event.target === button);\n  console.log(event.currentTarget === outer);\n});\nbutton.click();',
        output: "true\ntrue",
        mode: "browser",
        level: "Everyday",
        tags: ["events", "target", "currentTarget", "bubbling"],
        pitfall:
          "currentTarget is meaningful while the event handler is running; save what you need before awaiting.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/API/Event/currentTarget",
      },
      {
        id: "platform-prevent",
        title: "preventDefault / stopPropagation",
        summary: "Cancel default actions separately from event propagation.",
        explanation: [
          "preventDefault cancels a cancelable browser action, such as form submission. stopPropagation stops travel to other nodes; it does not cancel the default action or other listeners on the same node.",
        ],
        code: 'const form = document.createElement("form");\nform.addEventListener("submit", event => {\n  event.preventDefault();\n  console.log(event.defaultPrevented);\n});\nform.dispatchEvent(new Event("submit", {\n  bubbles: true,\n  cancelable: true\n}));',
        output: "true",
        mode: "browser",
        level: "Everyday",
        tags: ["events", "preventDefault", "stopPropagation", "capture"],
        pitfall:
          "Passive listeners cannot cancel a default action. Do not block keyboard or scrolling behavior without a clear reason.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault",
      },
      {
        id: "platform-delegation",
        title: "Event delegation",
        summary: "Handle many child elements with one listener.",
        explanation: [
          "Listen on a shared ancestor and inspect the clicked element. closest finds the nearest matching ancestor, including the element itself.",
        ],
        code: 'const list = document.createElement("div");\nconst button = document.createElement("button");\nbutton.dataset.action = "save";\nbutton.textContent = "Save";\nlist.append(button);\nlist.addEventListener("click", event => {\n  const target = event.target;\n  if (!(target instanceof Element)) return;\n  const item = target.closest("button[data-action]");\n  if (item && list.contains(item)) {\n    console.log(item.dataset.action);\n  }\n});\nbutton.click();',
        output: "save",
        mode: "browser",
        level: "Everyday",
        tags: ["events", "delegation", "closest"],
        pitfall:
          "Use an event that bubbles, or deliberately use capture. Check that the matching element belongs to the intended container.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/API/Element/closest",
      },
      {
        id: "platform-keyboard",
        title: "Keyboard and input events",
        summary: "Respond to keys and value changes.",
        explanation: [
          "keydown reports keys; input reports user changes to a control's value. Prefer native buttons because they already support keyboard activation.",
        ],
        code: 'const input = document.createElement("input");\ninput.setAttribute("aria-label", "Search notes");\ndocument.body.append(input);\ninput.addEventListener("input", event => {\n  console.log(event.currentTarget.value);\n});\ninput.addEventListener("keydown", event => {\n  if (event.key === "Escape") input.value = "";\n});',
        output: "Typing logs the value; Escape clears the input.",
        mode: "browser",
        level: "Everyday",
        tags: ["keyboard", "input", "keydown", "accessibility"],
        pitfall:
          "Changing input.value in code does not automatically fire an input event. Avoid treating keydown as a complete text-input system.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/API/Element/input_event",
      },
      {
        id: "platform-custom-events",
        title: "CustomEvent / aborting listeners",
        summary: "Send application events and clean up listeners.",
        explanation: [
          "CustomEvent carries data in detail. Pass an AbortSignal to addEventListener to remove a group of listeners when their controller aborts.",
        ],
        code: 'const bus = new EventTarget();\nconst controller = new AbortController();\nbus.addEventListener("score", event => {\n  console.log(event.detail);\n}, { signal: controller.signal });\nbus.dispatchEvent(new CustomEvent("score", { detail: 10 }));\ncontroller.abort();\nbus.dispatchEvent(new CustomEvent("score", { detail: 20 }));',
        output: "10",
        mode: "run",
        level: "Deeper",
        tags: ["events", "CustomEvent", "AbortController", "cleanup"],
        pitfall:
          "dispatchEvent calls listeners synchronously. EventTarget and CustomEvent are host APIs, not ECMAScript built-in objects.",
        source: "https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent",
      },
    ],
    group: "Browser & tools",
  },
  {
    id: "platform-web",
    title: "Web platform APIs",
    description:
      "These APIs come from the host environment. Some work in workers or Node.js too; others need a webpage, network access or permission.",
    color: "#F4AAE0",
    cards: [
      {
        id: "platform-fetch",
        title: "fetch / Response",
        summary: "Request data and check HTTP status.",
        explanation: [
          "fetch returns a Promise for a Response. HTTP error responses such as 404 normally fulfill that Promise, so inspect response.ok before reading the body.",
        ],
        code: '// Run on a site that serves /api/items as JSON.\nasync function loadItems() {\n  const response = await fetch("/api/items");\n  if (!response.ok) {\n    throw new Error("HTTP " + response.status);\n  }\n  return response.json();\n}\nloadItems().then(console.log).catch(console.error);',
        output: "Logs the server's JSON, or an error.",
        mode: "browser",
        level: "Everyday",
        tags: ["fetch", "HTTP", "Response", "JSON"],
        pitfall:
          "response.json() is asynchronous. Cross-origin requests need the server's CORS permission; mode: 'no-cors' does not make the response readable.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch",
      },
      {
        id: "platform-fetch-post",
        title: "Sending JSON with fetch",
        summary: "Send a request body with an appropriate content type.",
        explanation: [
          "Choose the HTTP method, serialize the body, and check the response. Authentication and cross-origin cookie handling require a deliberate server-side design.",
        ],
        code: '// Requires an API that accepts this request.\nasync function addItem() {\n  const response = await fetch("/api/items", {\n    method: "POST",\n    headers: { "Content-Type": "application/json" },\n    body: JSON.stringify({ name: "Notebook" })\n  });\n  if (!response.ok) throw new Error("HTTP " + response.status);\n  console.log("Saved");\n}\naddItem().catch(console.error);',
        output: "Saved, if the server accepts the request.",
        mode: "browser",
        level: "Everyday",
        tags: ["fetch", "POST", "headers", "JSON"],
        pitfall:
          "This example changes server state. Do not run it against an API unless you intend to create the item.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch",
      },
      {
        id: "platform-abort",
        title: "AbortController / AbortSignal",
        summary: "Signal cancellation to APIs that support it.",
        explanation: [
          "Create a controller, pass its signal to an operation, and call abort when that operation is no longer needed. The controller cannot undo completed work.",
        ],
        code: 'const controller = new AbortController();\ncontroller.signal.addEventListener("abort", () => {\n  console.log("Cancellation requested");\n});\ncontroller.abort();\nconsole.log(controller.signal.aborted);',
        output: "Cancellation requested\ntrue",
        mode: "run",
        level: "Everyday",
        tags: ["AbortController", "AbortSignal", "cancellation", "fetch"],
        pitfall:
          "Cancellation is cooperative. A signal does not automatically stop arbitrary JavaScript or cancel a Promise.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/API/AbortController",
      },
      {
        id: "platform-url",
        title: "URL / URLSearchParams",
        summary: "Build and inspect URLs without manual string stitching.",
        explanation: [
          "URL parses a URL using an optional base. searchParams reads and writes query parameters and handles encoding.",
        ],
        code: 'const url = new URL("/search", "https://example.com");\nurl.searchParams.set("q", "red shoes");\nurl.searchParams.append("tag", "sale");\nconsole.log(url.pathname);\nconsole.log(url.searchParams.get("q"));\nconsole.log(url.searchParams.getAll("tag").join(", "));',
        output: "/search\nred shoes\nsale",
        mode: "run",
        level: "Start here",
        tags: ["URL", "URLSearchParams", "encoding", "query"],
        pitfall:
          "A query parameter is text. Convert and validate it before using it as a number or making a security decision.",
        source: "https://developer.mozilla.org/en-US/docs/Web/API/URL",
      },
      {
        id: "platform-timers",
        title: "setTimeout / setInterval",
        summary: "Schedule work for later.",
        explanation: [
          "setTimeout schedules a callback once; setInterval schedules repeated callbacks. Use clearTimeout or clearInterval to cancel a pending schedule.",
        ],
        code: 'const canceled = setTimeout(() => {\n  console.log("This will not run");\n}, 1000);\nclearTimeout(canceled);\nawait new Promise(resolve => setTimeout(resolve, 20));\nconsole.log("Later");',
        output: "Later",
        mode: "run",
        level: "Everyday",
        tags: ["timers", "setTimeout", "setInterval", "clearTimeout"],
        pitfall:
          "The delay is a minimum scheduling delay, not a precise appointment. Busy code and background-tab throttling can delay callbacks.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout",
      },
      {
        id: "platform-animation",
        title: "requestAnimationFrame",
        summary: "Update animation before the next repaint.",
        explanation: [
          "Schedule a callback and use its timestamp for smooth, time-based motion. Call requestAnimationFrame again to continue the animation.",
        ],
        code: 'const dot = document.createElement("div");\ndot.textContent = "●";\ndocument.body.append(dot);\nlet start;\nfunction frame(time) {\n  start ??= time;\n  const progress = Math.min((time - start) / 1000, 1);\n  dot.style.transform = "translateX(" + progress * 100 + "px)";\n  if (progress \u003c 1) requestAnimationFrame(frame);\n}\nrequestAnimationFrame(frame);',
        output: "Moves a dot 100 pixels in roughly one second.",
        mode: "browser",
        level: "Everyday",
        tags: ["animation", "requestAnimationFrame", "performance"],
        pitfall:
          "Do not assume 60 frames per second. Respect reduced-motion preferences and stop animations that are no longer needed.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame",
      },
      {
        id: "platform-storage",
        title: "localStorage / sessionStorage",
        summary: "Store small string values in the browser.",
        explanation: [
          "localStorage usually survives browser restarts; sessionStorage is scoped to a tab's page session. Both are synchronous, origin-scoped storage APIs.",
        ],
        code: 'try {\n  localStorage.setItem("study-demo", JSON.stringify({ page: 3 }));\n  const saved = localStorage.getItem("study-demo");\n  console.log(saved ? JSON.parse(saved).page : "No saved data");\n  localStorage.removeItem("study-demo");\n} catch (error) {\n  console.log("Storage unavailable: " + error.name);\n}',
        output: "3, if storage is available.",
        mode: "browser",
        level: "Everyday",
        tags: ["localStorage", "sessionStorage", "persistence", "JSON"],
        pitfall:
          "Storage may be blocked or full, and file:// behavior varies. Do not store secrets here or assume the data is permanent.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage",
      },
      {
        id: "platform-clone",
        title: "structuredClone",
        summary: "Deep-copy supported data structures.",
        explanation: [
          "structuredClone copies many built-in types, nested objects and circular references. It is a host API available in modern browsers and Node.js, not a language keyword.",
        ],
        code: 'const original = { scores: [1, 2] };\nconst copy = structuredClone(original);\ncopy.scores.push(3);\nconsole.log(original.scores.join(", "));\nconsole.log(copy.scores.join(", "));',
        output: "1, 2\n1, 2, 3",
        mode: "run",
        level: "Everyday",
        tags: ["structuredClone", "copy", "deep clone"],
        pitfall:
          "Functions and DOM nodes cannot be cloned this way. Custom prototypes, accessors and property descriptors are not preserved as a general object-cloning contract.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone",
      },
      {
        id: "platform-files",
        title: "Blob / File / object URLs",
        summary: "Work with browser-side file data.",
        explanation: [
          "Blob holds immutable bytes. File adds file metadata such as a name. A user can choose files with a file input; selecting a file does not upload it.",
        ],
        code: 'const picker = document.createElement("input");\npicker.type = "file";\npicker.accept = ".txt";\npicker.addEventListener("change", async () => {\n  const file = picker.files[0];\n  if (!file) return;\n  console.log(file.name);\n  console.log(await file.text());\n});\ndocument.body.append(picker);',
        output: "After a file is chosen, logs its name and text.",
        mode: "browser",
        level: "Everyday",
        tags: ["Blob", "File", "file input", "object URL"],
        pitfall:
          "accept is only a selection hint. Validate size and content. If you use URL.createObjectURL, call URL.revokeObjectURL when the URL is no longer needed.",
        source: "https://developer.mozilla.org/en-US/docs/Web/API/File",
      },
      {
        id: "platform-clipboard",
        title: "navigator.clipboard",
        summary: "Copy text after a user action.",
        explanation: [
          "Clipboard methods return Promises and can fail because of permissions or browser policy. writeText generally requires a secure context such as HTTPS.",
        ],
        code: 'const button = document.createElement("button");\nbutton.textContent = "Copy a greeting";\nbutton.addEventListener("click", async () => {\n  try {\n    await navigator.clipboard.writeText("Hello!");\n    console.log("Copied");\n  } catch (error) {\n    console.log("Copy unavailable: " + error.name);\n  }\n});\ndocument.body.append(button);',
        output: "Clicking the button copies Hello! if allowed.",
        mode: "browser",
        level: "Everyday",
        tags: ["clipboard", "permissions", "secure context"],
        pitfall:
          "Browser requirements differ. Call clipboard methods from an intentional user interaction and provide feedback if copying fails.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText",
      },
      {
        id: "platform-observers",
        title: "IntersectionObserver / MutationObserver / ResizeObserver",
        summary: "React to changes without constant polling.",
        explanation: [
          "IntersectionObserver observes visibility relative to a root. MutationObserver observes DOM changes. ResizeObserver observes element size changes.",
        ],
        code: 'const box = document.createElement("div");\ndocument.body.append(box);\nconst observer = new MutationObserver(records => {\n  console.log(records.length > 0);\n  observer.disconnect();\n});\nobserver.observe(box, { childList: true });\nbox.textContent = "Changed";',
        output: "true",
        mode: "browser",
        level: "Deeper",
        tags: ["IntersectionObserver", "MutationObserver", "ResizeObserver"],
        pitfall:
          "Disconnect observers when finished. Changing the same observed state inside a callback can create feedback loops.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver",
      },
      {
        id: "platform-workers",
        title: "Web Workers",
        summary: "Move suitable computation off the page's main thread.",
        explanation: [
          "A worker runs in its own global environment and communicates through messages. Workers cannot directly access the DOM. Message data is generally cloned; transferable objects can move ownership.",
        ],
        code: '// Hosted page; worker.js must be available.\n// worker.js:\nself.onmessage = event => {\n  self.postMessage(event.data * 2);\n};\n// main.js (separate file):\n// const worker = new Worker("./worker.js");\n// worker.onmessage = event => {\n//   console.log(event.data); // 12\n//   worker.terminate();\n// };\n// worker.postMessage(6);',
        output: "The main page receives 12.",
        mode: "browser",
        level: "Deeper",
        tags: ["Worker", "postMessage", "threads", "performance"],
        pitfall:
          "Worker loading follows URL, origin and CSP rules. Local file URLs are not a portable worker deployment strategy.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers",
      },
      {
        id: "platform-streams",
        title: "ReadableStream",
        summary: "Consume data a chunk at a time.",
        explanation: [
          "Streams let producers and consumers exchange chunks without first building one large result. A reader locks its stream; release the lock when finished.",
        ],
        code: 'const stream = new ReadableStream({\n  start(controller) {\n    controller.enqueue("A");\n    controller.enqueue("B");\n    controller.close();\n  }\n});\nconst reader = stream.getReader();\ntry {\n  while (true) {\n    const { value, done } = await reader.read();\n    if (done) break;\n    console.log(value);\n  }\n} finally {\n  reader.releaseLock();\n}',
        output: "A\nB",
        mode: "run",
        level: "Deeper",
        tags: ["ReadableStream", "streams", "reader", "backpressure"],
        pitfall:
          "A chunk is not guaranteed to equal one text line or one complete message. Decode and buffer according to the data format.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream",
      },
      {
        id: "platform-websocket",
        title: "WebSocket",
        summary: "Keep a two-way connection open.",
        explanation: [
          "WebSocket delivers open, message, error and close events. Send only when the connection is open; validate incoming messages before using them.",
        ],
        code: '// Replace with a WebSocket endpoint you control.\nconst socket = new WebSocket("wss://example.com/socket");\nsocket.addEventListener("open", () => {\n  socket.send(JSON.stringify({ type: "hello" }));\n});\nsocket.addEventListener("message", event => {\n  console.log(event.data);\n});\nsocket.addEventListener("error", () => {\n  console.log("Connection error");\n});\n// Call socket.close() when finished.',
        output: "Depends on the server; example.com is a placeholder.",
        mode: "browser",
        level: "Deeper",
        tags: ["WebSocket", "real time", "network"],
        pitfall:
          "WebSocket does not automatically reconnect or validate messages. Design limits, authentication and reconnection deliberately.",
        source: "https://developer.mozilla.org/en-US/docs/Web/API/WebSocket",
      },
      {
        id: "platform-history",
        title: "location / History API",
        summary: "Read the current URL and update navigation state.",
        explanation: [
          "location describes the current page URL. history.pushState changes a same-origin URL without loading a new document; popstate helps handle back and forward navigation.",
        ],
        code: '// Run on an HTTP(S) page you control.\nconsole.log(location.pathname);\nhistory.pushState({ section: "notes" }, "", "#notes");\nwindow.addEventListener("popstate", event => {\n  console.log(event.state);\n});',
        output: "Logs the current path; Back/Forward can log navigation state.",
        mode: "browser",
        level: "Everyday",
        tags: ["history", "location", "routing", "popstate"],
        pitfall:
          "pushState does not itself fire popstate. A router must also update the page content and manage focus.",
        source: "https://developer.mozilla.org/en-US/docs/Web/API/History_API",
      },
      {
        id: "platform-encoding",
        title: "TextEncoder / TextDecoder",
        summary: "Convert between JavaScript strings and bytes.",
        explanation: [
          "TextEncoder encodes text as UTF-8. TextDecoder turns supported encoded bytes back into text, with options for streaming and invalid input.",
        ],
        code: 'const bytes = new TextEncoder().encode("Hej!");\nconsole.log(Array.from(bytes).join(", "));\nconsole.log(new TextDecoder().decode(bytes));',
        output: "72, 101, 106, 33\nHej!",
        mode: "run",
        level: "Everyday",
        tags: ["TextEncoder", "TextDecoder", "UTF-8", "bytes"],
        pitfall:
          "String length counts UTF-16 code units, not UTF-8 bytes. Use a streaming decoder when a multibyte character may cross chunk boundaries.",
        source: "https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder",
      },
      {
        id: "platform-indexeddb",
        title: "IndexedDB",
        summary: "Store structured browser data asynchronously.",
        explanation: [
          "IndexedDB is an origin-scoped database for larger structured data. Schema changes happen during a version upgrade; reads and writes use transactions.",
        ],
        code: 'const request = indexedDB.open("study-demo", 1);\nrequest.onupgradeneeded = () => {\n  request.result.createObjectStore("notes");\n};\nrequest.onsuccess = () => {\n  const db = request.result;\n  const tx = db.transaction("notes", "readwrite");\n  tx.objectStore("notes").put("Learn arrays", "next");\n  tx.oncomplete = () => {\n    console.log("Saved");\n    db.close();\n  };\n  tx.onerror = () => console.error(tx.error);\n};\nrequest.onerror = () => console.error(request.error);',
        output: "Saved, if database storage is available.",
        mode: "browser",
        level: "Deeper",
        tags: ["IndexedDB", "database", "storage", "transactions"],
        pitfall:
          "This example creates persistent demo data. Handle blocked upgrades and quota failures in real apps; browser storage can be cleared or evicted.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API",
      },
      {
        id: "platform-service-workers",
        title: "Service workers and caching",
        summary: "Add a programmable network layer for a hosted web app.",
        explanation: [
          "Service workers are event-driven workers that can intercept eligible network requests and use caches. They have a separate lifecycle and cannot access the DOM.",
        ],
        code: '// Hosted HTTPS app or a supported localhost origin.\n// Requires a real sw.js file in the chosen scope.\nif ("serviceWorker" in navigator) {\n  navigator.serviceWorker.register("./sw.js")\n    .then(() => console.log("Registered"))\n    .catch(error => console.error(error));\n}',
        output: "Registered, if the script and environment are valid.",
        mode: "browser",
        level: "Deeper",
        tags: ["service worker", "offline", "Cache API", "PWA"],
        pitfall:
          "A downloaded HTML file does not need a service worker to display offline. Registration alone does not cache anything; plan cache updates and avoid caching private responses accidentally.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers",
      },
    ],
    group: "Browser & tools",
  },
  {
    id: "platform-node",
    title: "Node.js and project tools",
    description:
      "Node.js runs JavaScript outside the browser. These recipes are for local Node.js files or terminals, not the guide's example runner.",
    color: "#F5D778",
    cards: [
      {
        id: "platform-node-runtime",
        title: "Node.js versus the browser",
        summary: "The language is shared; available APIs differ.",
        explanation: [
          "Node.js provides server and operating-system APIs such as filesystem access. Browsers provide document and window. Some web APIs, including fetch and URL, are also available in modern Node.js.",
        ],
        code: '// Save as hello.mjs, then run: node hello.mjs\nconsole.log("Hello from Node.js");\nconsole.log(typeof process);\nconsole.log(typeof document);',
        output: "Hello from Node.js\nobject\nundefined",
        mode: "node",
        level: "Start here",
        tags: ["Node.js", "runtime", "browser", "CLI"],
        pitfall:
          "An API available in one runtime is not automatically available in every other runtime.",
        source:
          "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs",
      },
      {
        id: "platform-node-process",
        title: "process.argv / process.env / process.cwd",
        summary: "Read command-line context.",
        explanation: [
          "process.argv contains the executable, script path and following arguments. process.env contains environment-variable strings. process.cwd() is the current working directory.",
        ],
        code: '// node greet.mjs Mustafa\nconst name = process.argv[2] ?? "friend";\nconsole.log("Hello, " + name);\nconsole.log(process.cwd());\nconst port = Number(process.env.PORT ?? 3000);\nconsole.log(Number.isInteger(port));',
        output: "Hello, Mustafa\nYour working directory\ntrue",
        mode: "node",
        level: "Everyday",
        tags: ["process", "arguments", "environment", "cwd"],
        pitfall:
          "Environment variables are strings. Validate values, and never print your full environment because it may contain secrets.",
        source: "https://nodejs.org/api/process.html",
      },
      {
        id: "platform-node-files",
        title: "node:fs/promises",
        summary: "Read files with asynchronous filesystem APIs.",
        explanation: [
          "The promises-based filesystem API works with await. Specify a text encoding for a string result; otherwise readFile returns a Buffer.",
        ],
        code: '// Create a notes.txt file next to this .mjs file.\nimport { readFile } from "node:fs/promises";\ntry {\n  const file = new URL("./notes.txt", import.meta.url);\n  const text = await readFile(file, "utf8");\n  console.log(text);\n} catch (error) {\n  console.error(error.code);\n}',
        output: "The file's text, or an error code such as ENOENT.",
        mode: "node",
        level: "Everyday",
        tags: ["Node.js", "fs", "readFile", "filesystem"],
        pitfall:
          "Relative filesystem paths normally use the working directory. A URL based on import.meta.url resolves relative to this module.",
        source: "https://nodejs.org/api/fs.html",
      },
      {
        id: "platform-node-path",
        title: "node:path / file URLs",
        summary: "Build paths with platform-aware tools.",
        explanation: [
          "node:path joins and analyzes filesystem paths. URLs and filesystem paths are different types of location; use node:url conversion helpers when moving between them.",
        ],
        code: 'import path from "node:path";\nimport { fileURLToPath } from "node:url";\nconst file = fileURLToPath(import.meta.url);\nconsole.log(path.basename(file));\nconsole.log(path.join("notes", "today.txt"));',
        output:
          "Your script's filename\nnotes/today.txt, or the Windows equivalent",
        mode: "node",
        level: "Everyday",
        tags: ["Node.js", "path", "URL", "Windows", "Linux"],
        pitfall:
          "Joining a path is not a security boundary. Validate untrusted paths and ensure access stays inside the intended directory.",
        source: "https://nodejs.org/api/path.html",
      },
      {
        id: "platform-node-modules",
        title: "ES modules and CommonJS",
        summary: "Choose an explicit module format.",
        explanation: [
          "Use .mjs for ES modules, or set type to module in package.json for .js files. Use .cjs for CommonJS. The two systems have different loading and export rules.",
        ],
        code: '// greet.mjs\nexport function greet(name) {\n  return "Hello, " + name;\n}\n// app.mjs (separate file):\n// import { greet } from "./greet.mjs";\n// console.log(greet("Milo"));\n//\n// CommonJS alternative in a .cjs file:\n// module.exports = { greet };',
        output: "Hello, Milo when app.mjs imports and calls greet.",
        mode: "node",
        level: "Everyday",
        tags: ["Node.js", "modules", "CommonJS", "ESM", "package.json"],
        pitfall:
          "Do not assume require and import are interchangeable. Include the extension in relative ES-module imports.",
        source: "https://nodejs.org/api/packages.html",
      },
      {
        id: "platform-npm",
        title: "npm / package.json / lockfiles",
        summary: "Describe a project and manage dependencies.",
        explanation: [
          "package.json holds project metadata, scripts and dependency declarations. npm installs packages; a lockfile records a resolved dependency tree for repeatable installs.",
        ],
        code: '// Terminal commands, not JavaScript:\n// npm init -y\n// npm install\n// npm run test\n//\n// A typical package.json script:\n// "scripts": { "test": "node --test" }\n//\n// In a project with a committed package-lock.json:\n// npm ci',
        output: "Commands run in a terminal inside the project directory.",
        mode: "read",
        level: "Everyday",
        tags: ["npm", "package.json", "lockfile", "dependencies", "scripts"],
        pitfall:
          "Install only packages you have a reason to trust. Package installation can run lifecycle scripts; keep lockfiles with the project.",
        source: "https://docs.npmjs.com/cli/v11/configuring-npm/package-json",
      },
      {
        id: "platform-node-buffer",
        title: "Buffer and byte data",
        summary: "Use Node.js's byte-oriented container.",
        explanation: [
          "Buffer extends Uint8Array and provides convenient encoding methods. Buffer.from converts known data; Buffer.alloc creates zero-filled memory.",
        ],
        code: 'import { Buffer } from "node:buffer";\nconst data = Buffer.from("Hi", "utf8");\nconsole.log([...data].join(", "));\nconsole.log(data.toString("utf8"));\nconsole.log(Buffer.alloc(3).length);',
        output: "72, 105\nHi\n3",
        mode: "node",
        level: "Everyday",
        tags: ["Node.js", "Buffer", "binary", "encoding"],
        pitfall:
          "Avoid Buffer.allocUnsafe until you understand its initialization requirements. Bytes and characters are not interchangeable.",
        source: "https://nodejs.org/api/buffer.html",
      },
    ],
    group: "Browser & tools",
  },
  {
    id: "platform-practice",
    title: "Debugging and good habits",
    description:
      "Practical patterns help make code understandable, testable, accessible and safer to use.",
    color: "#FFAD97",
    cards: [
      {
        id: "platform-console",
        title: "Console tools and breakpoints",
        summary: "Inspect values and step through execution.",
        explanation: [
          "console.log displays values. Browser developer tools also provide breakpoints, stepping, scopes, stack traces and a network panel. Console APIs are host tools, not language keywords.",
        ],
        code: 'const numbers = [2, 4, 6];\nconsole.log("count:", numbers.length);\nconsole.log("total:", numbers.reduce((a, b) => a + b, 0));\n// In DevTools, put a breakpoint on the next line.\nconst doubled = numbers.map(n => n * 2);\nconsole.log(doubled.join(", "));',
        output: "count: 3\ntotal: 12\n4, 8, 12",
        mode: "run",
        level: "Start here",
        tags: ["debugging", "console", "breakpoints", "DevTools"],
        pitfall:
          "Object displays in developer tools may reflect later mutations. Log a snapshot when you need to preserve what the data looked like.",
        source: "https://developer.mozilla.org/en-US/docs/Web/API/console",
      },
      {
        id: "platform-error-handling",
        title: "Useful errors and recovery",
        summary: "Catch errors where you can take meaningful action.",
        explanation: [
          "Include context without exposing private data. Distinguish a recoverable situation from an unexpected programming bug; do not silently discard all errors.",
        ],
        code: 'function parseSettings(text) {\n  try {\n    return JSON.parse(text);\n  } catch {\n    throw new Error("Settings must be valid JSON");\n  }\n}\ntry {\n  parseSettings("broken");\n} catch (error) {\n  console.log(error.message);\n}',
        output: "Settings must be valid JSON",
        mode: "run",
        level: "Everyday",
        tags: ["errors", "debugging", "JSON", "validation"],
        pitfall:
          "A broad catch that does nothing can hide bugs. Keep error messages helpful and avoid including passwords or tokens.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error",
      },
      {
        id: "platform-safe-dom",
        title: "Safe DOM output",
        summary: "Treat outside input as data.",
        explanation: [
          "Prefer textContent for plain text. Avoid evaluating received strings as JavaScript. If you need rich untrusted HTML, use a maintained sanitization approach appropriate to the context.",
        ],
        code: 'const userText = "\u003cimg src=x onerror=alert(1)>";\nconst output = document.createElement("p");\noutput.textContent = userText;\ndocument.body.append(output);\nconsole.log(output.textContent === userText);',
        output: "true; the text is shown literally, not executed.",
        mode: "browser",
        level: "Everyday",
        tags: ["security", "XSS", "textContent", "eval"],
        pitfall:
          "Encoding for one context does not automatically protect another, such as a URL, CSS value or JavaScript source.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS",
      },
      {
        id: "platform-validation",
        title: "Validate input and keep secrets on the server",
        summary: "Client-side code is visible to its users.",
        explanation: [
          "Check the type, shape and allowed range of input before trusting it. Authorization and secret credentials belong on a trusted server, not in downloadable JavaScript.",
        ],
        code: 'function parseAge(input) {\n  const age = Number(input);\n  if (String(input).trim() === "" ||\n      !Number.isInteger(age) || age \u003c 0 || age > 130) {\n    throw new Error("Enter a whole age from 0 to 130");\n  }\n  return age;\n}\nconsole.log(parseAge("25"));',
        output: "25",
        mode: "run",
        level: "Everyday",
        tags: ["validation", "security", "secrets", "authorization"],
        pitfall:
          "Hiding a button or checking a role in browser code does not enforce server authorization.",
        source:
          "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation",
      },
      {
        id: "platform-accessibility",
        title: "Accessible controls and focus",
        summary: "Make interactions work with keyboards and assistive tools.",
        explanation: [
          "Use buttons for actions and links for navigation. Give controls an accessible name and maintain a visible focus indicator. Announce meaningful status changes without interrupting users.",
        ],
        code: 'const button = document.createElement("button");\nbutton.textContent = "Save notes";\nconst status = document.createElement("p");\nstatus.setAttribute("role", "status");\nbutton.addEventListener("click", () => {\n  status.textContent = "Notes saved";\n});\ndocument.body.append(button, status);',
        output: "Clicking Save notes updates the status text.",
        mode: "browser",
        level: "Everyday",
        tags: ["accessibility", "focus", "keyboard", "aria", "semantic HTML"],
        pitfall:
          "Do not replace a native button with a clickable div unless you also reproduce its keyboard and accessibility behavior.",
        source:
          "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML",
      },
      {
        id: "platform-performance",
        title: "Measure before optimizing",
        summary: "Find the actual bottleneck before rewriting code.",
        explanation: [
          "Use developer tools to inspect time, rendering and network activity. Batch DOM work where practical, avoid repeated layout reads and writes, and move suitable heavy computation to a worker.",
        ],
        code: "const start = performance.now();\nlet sum = 0;\nfor (let n = 1; n \u003c= 10000; n++) sum += n;\nconst elapsed = performance.now() - start;\nconsole.log(sum);\nconsole.log(elapsed >= 0);",
        output: "50005000\ntrue",
        mode: "run",
        level: "Deeper",
        tags: ["performance", "profiling", "performance.now", "workers"],
        pitfall:
          "One tiny timing run is not a reliable benchmark. Async functions do not automatically move CPU-heavy work off the main thread.",
        source:
          "https://developer.mozilla.org/en-US/docs/Web/API/Performance/now",
      },
      {
        id: "platform-testing",
        title: "Small, deterministic tests",
        summary: "Check expected behavior, including edge cases.",
        explanation: [
          "A useful test compares an actual result with a specific expectation. Test boundaries and failures as well as the happy path. Pure functions are often easier to test.",
        ],
        code: 'function double(n) {\n  return n * 2;\n}\nfunction expectEqual(actual, expected) {\n  if (!Object.is(actual, expected)) {\n    throw new Error("Expected " + expected + ", got " + actual);\n  }\n}\nexpectEqual(double(3), 6);\nexpectEqual(double(0), 0);\nexpectEqual(double(-2), -4);\nconsole.log("3 checks passed");',
        output: "3 checks passed",
        mode: "run",
        level: "Start here",
        tags: ["testing", "assertions", "unit tests", "determinism"],
        pitfall:
          "A passing test only checks the cases you wrote. Node.js also includes node:test and node:assert for real test suites.",
        source: "https://nodejs.org/api/test.html",
      },
    ],
    group: "Browser & tools",
  },
];
/* 3. REFERENCE PLAYGROUND SANDBOX
  Advanced infrastructure: this HTML string creates an isolated frame and worker.
  The worker runs practice code separately so a loop cannot freeze the study page.
*/
const RUNNER_HTML =
  "\u003c!doctype html>\u003cmeta charset=\"utf-8\">\u003cmeta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob:; worker-src blob:; connect-src 'none';\">\u003cscript>\nlet worker=null, token=null, timer=null;\nfunction stop(){if(worker){worker.terminate();worker=null;}clearTimeout(timer);}\nfunction reply(message){parent.postMessage({...message,token},'*');}\naddEventListener('message',event=>{\n  if(event.source!==parent||!event.data)return;\n  if(event.data.type==='stop'){stop();return;}\n  if(event.data.type!=='run')return;\n  stop();token=event.data.token;\n  try {\n    const url=URL.createObjectURL(new Blob([\"'use strict';\\nfunction format(value,seen=new WeakSet(),depth=0){\\n  if(value===undefined)return 'undefined';if(value===null)return 'null';\\n  if(typeof value==='string')return value;if(typeof value==='bigint')return value+'n';if(typeof value==='symbol')return String(value);if(typeof value==='function')return '[Function'+(value.name?': '+value.name:'')+']';if(typeof value!=='object')return String(value);\\n  if(value instanceof Error)return value.name+': '+value.message;\\n  if(seen.has(value))return '[Circular]';if(depth>4)return '[\\u2026]';seen.add(value);\\n  const fmt=v=>typeof v==='string'?JSON.stringify(v):format(v,seen,depth+1);\\n  if(value instanceof Date)return Number.isNaN(value.getTime())?'Invalid Date':value.toISOString();if(value instanceof RegExp)return String(value);\\n  if(value instanceof Map)return 'Map { '+[...value].slice(0,50).map(([k,v])=>fmt(k)+' => '+fmt(v)).join(', ')+' }';\\n  if(value instanceof Set)return 'Set { '+[...value].slice(0,50).map(fmt).join(', ')+' }';\\n  if(ArrayBuffer.isView(value)&&!(value instanceof DataView))return value.constructor.name+' ['+Array.from(value).slice(0,80).map(fmt).join(', ')+']';\\n  if(value instanceof ArrayBuffer)return 'ArrayBuffer('+value.byteLength+')';\\n  if(Array.isArray(value)){const parts=[];for(let i=0;i\\u003cMath.min(value.length,80);i++)parts.push(i in value?fmt(value[i]):'\\u003cempty>');return '['+parts.join(', ')+(value.length>80?', \\u2026':'')+']';}\\n  return '{ '+Object.keys(value).slice(0,50).map(k=>k+': '+fmt(value[k])).join(', ')+' }';\\n}\\nself.onmessage=async ({data})=>{\\n  let lines=0;const times=new Map();const log=(...args)=>{if(lines++\\u003c100)self.postMessage({type:'log',text:args.map(v=>format(v)).join(' ').slice(0,12000)});};\\n  const output={log,info:log,warn:(...a)=>log('Warning:',...a),error:(...a)=>log('Error:',...a),dir:log,table:log,assert:(condition,...a)=>{if(!condition)log('Assertion failed:',...a);},clear:()=>log('\\u2014 console cleared \\u2014'),time:(name='default')=>times.set(name,performance.now()),timeEnd:(name='default')=>log(name+': '+(performance.now()-(times.get(name)||performance.now())).toFixed(2)+'ms')};\\n  try{const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;await new AsyncFunction('console','\\\"use strict\\\";\\\\n'+data.code)(output);await new Promise(resolve=>setTimeout(resolve,35));self.postMessage({type:'done'});}catch(error){self.postMessage({type:'error',text:error.name+': '+error.message});}\\n};\\nself.addEventListener('unhandledrejection',event=>{self.postMessage({type:'error',text:'Unhandled rejection: '+format(event.reason)});event.preventDefault();});\\n\"],{type:'text/javascript'}));\n    worker=new Worker(url);URL.revokeObjectURL(url);\n    worker.onmessage=({data})=>{reply(data);if(data.type==='done'||data.type==='error')stop();};\n    worker.onerror=event=>{reply({type:'error',text:'Runner error: '+event.message});stop();};\n    worker.postMessage({code:event.data.code});\n    timer=setTimeout(()=>{reply({type:'error',text:'Stopped: the example exceeded the 3-second limit.'});stop();},2850);\n  } catch(error){reply({type:'error',text:'Runner unavailable: '+error.message});stop();}\n});\nparent.postMessage({type:'ready'},'*');\n\u003c/script>";
/* 4. SHARED HELPERS, SETTINGS AND SAVED PROGRESS */
const $ = (s) => document.querySelector(s);
const allCards = DATA.flatMap((section) =>
  section.cards.map((card) => ({
    ...card,
    section: section.id,
    sectionTitle: section.title,
    group: section.group,
  })),
);
const cardsById = new Map(allCards.map((c) => [c.id, c]));
const groups = [
  "Keywords",
  "Core concepts",
  "Standard library",
  "Browser & tools",
];
const escapeHTML = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const KEY = "javascript-study-companion-v1"; // Original guest storage stays intact.
let accounts;
let problemPractice;
let storageOK = true;
let progress = {
  version: 1,
  saved: [],
  done: [],
  settings: { size: "standard", theme: "dark", spacing: "roomy" },
  course: freshCourse(),
  consolePractice: freshConsoleProgress(),
  problemPractice: freshProblemProgress(),
};
try {
  const existing = JSON.parse(localStorage.getItem(KEY));
  if (existing) progress = validateProgress(existing);
  localStorage.setItem(KEY, JSON.stringify(progress));
} catch {
  storageOK = false;
}
function validateProgress(value) {
  if (
    !value ||
    typeof value !== "object" ||
    value.version !== 1 ||
    !Array.isArray(value.saved) ||
    !Array.isArray(value.done)
  )
    throw Error("That is not a study progress backup.");
  const settings = value.settings || {};
  return {
    version: 1,
    course: validateCourse(value.course),
    consolePractice: (() => { try { return cleanConsoleProgress(value.consolePractice); } catch { return freshConsoleProgress(); } })(),
    problemPractice: (() => { try { return cleanProblemProgress(value.problemPractice); } catch { return freshProblemProgress(); } })(),
    saved: [
      ...new Set(
        value.saved.filter((x) => typeof x === "string" && cardsById.has(x)),
      ),
    ],
    done: [
      ...new Set(
        value.done.filter((x) => typeof x === "string" && cardsById.has(x)),
      ),
    ],
    settings: {
      size: ["standard", "large", "extra"].includes(settings.size)
        ? settings.size
        : "standard",
      theme: settings.theme === "light" ? "light" : "dark",
      spacing: settings.spacing === "regular" ? "regular" : "roomy",
    },
  };
}
function persist() {
  if (!accounts?.loading) {
    if (accounts?.signedIn) {
      accounts.save(progress);
      storageOK = accounts.localOK;
    }
    else {
      try {
        localStorage.setItem(KEY, JSON.stringify(progress));
        storageOK = true;
      } catch {
        storageOK = false;
      }
    }
  }
  updateProgress();
  updateCourseBadge();
}
let toastTimer;
function toast(message) {
  $("#toast").textContent = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ($("#toast").textContent = ""), 3200);
}
function applySettings() {
  document.body.classList.toggle("light", progress.settings.theme === "light");
  document.body.classList.toggle(
    "large-text",
    progress.settings.size === "large",
  );
  document.body.classList.toggle(
    "extra-text",
    progress.settings.size === "extra",
  );
  document.body.classList.toggle(
    "roomy",
    progress.settings.spacing === "roomy",
  );
  $("#text-size").value = progress.settings.size;
  $("#theme").value = progress.settings.theme;
  $("#spacing").value = progress.settings.spacing;
}
function updateProgress() {
  const n = progress.done.length;
  $("#progress-count").textContent = n;
  $("#progress-caption").textContent =
    n +
    " / " +
    allCards.length +
    " topics · " +
    Math.round((n / allCards.length) * 100) +
    "%";
  $("#progress-fill").style.width = (n / allCards.length) * 100 + "%";
  $(".progress-track").setAttribute(
    "aria-valuenow",
    Math.round((n / allCards.length) * 100),
  );
  $("#bookmark-count").textContent = progress.saved.length;
  $("#all-count").textContent = allCards.length;
  if (!storageOK)
    $("#storage-note").textContent =
      "Browser storage is unavailable. Your progress works for this session; download a backup before closing the file.";
}
const bookIcon =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z"/></svg>';
const chevron =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>';
function highlight(code) {
  const pattern =
    /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|\b(if|else|switch|case|default|for|while|do|break|continue|let|const|var|function|return|try|catch|finally|throw|class|extends|super|this|new|delete|typeof|instanceof|in|void|import|export|async|await|yield|debugger|with|of|static|get|set|using|true|false|null|undefined)\b|\b(\d+(?:\.\d+)?n?)\b/g;
  let out = "",
    last = 0;
  for (const m of code.matchAll(pattern)) {
    out += escapeHTML(code.slice(last, m.index));
    out +=
      '<span class="' +
      (m[1]
        ? "tok-comment"
        : m[2]
          ? "tok-string"
          : m[3]
            ? "tok-key"
            : "tok-num") +
      '">' +
      escapeHTML(m[0]) +
      "</span>";
    last = m.index + m[0].length;
  }
  return out + escapeHTML(code.slice(last));
}
const modes = {
  run: "Runnable",
  modern: "Check support",
  module: "Module files",
  browser: "Browser API",
  node: "Node.js",
  read: "Reference",
};
const modeNotes = {
  modern:
    "This newer feature needs engine support. You can try it here; an older browser may report a syntax error or missing method. Check the reference for compatibility.",
  module:
    "Module example: use the indicated files in a module-enabled project. Static imports and exports cannot run inside this playground.",
  browser:
    "Browser example: read the setup comments, then use it in a page you control. DOM, network and permission-dependent APIs are not available in this playground.",
  node: "Node.js example: run this in the Node.js environment, following the setup comments. Node APIs do not run in this browser playground.",
  read: "Reference example. Follow the setup and environment notes before using it in a project.",
};
/* 5. REFERENCE DISPLAY — build cards, navigation and search results. */
function cardHTML(card) {
  const saved = progress.saved.includes(card.id),
    done = progress.done.includes(card.id),
    runnable = card.mode === "run" || card.mode === "modern";
  return `<article class="topic-card${done ? " card-complete" : ""}" data-card="${card.id}"><div class="card-meta"><span class="level">${escapeHTML(card.level)}</span><span class="mode-label${card.mode === "run" ? "" : " read"}">${modes[card.mode] || "Reference"}</span><button class="icon-btn save-button" data-save="${card.id}" aria-pressed="${saved}" aria-label="${saved ? "Remove bookmark for" : "Bookmark"} ${escapeHTML(card.title)}">${bookIcon}</button></div><details><summary><span class="card-title">${escapeHTML(card.title)}<span class="plus" aria-hidden="true">+</span></span><span class="card-summary">${escapeHTML(card.summary)}</span></summary><div class="card-body">${card.explanation.map((p) => "<p>" + escapeHTML(p) + "</p>").join("")}${card.mode !== "run" ? '<div class="env-note">' + escapeHTML(modeNotes[card.mode] || modeNotes.read) + "</div>" : ""}<div class="codebox"><div class="code-toolbar"><span>${card.mode === "node" ? "Node.js" : card.mode === "module" ? "Module example" : "JavaScript"}</span><button data-copy="${card.id}" aria-label="Copy example for ${escapeHTML(card.title)}">Copy code</button></div><pre class="code"><code>${highlight(card.code)}</code></pre></div>${card.output ? '<div class="output-example">Expected result<pre>' + escapeHTML(card.output) + "</pre></div>" : ""}${card.pitfall ? '<div class="tip"><strong>Keep in mind</strong>' + escapeHTML(card.pitfall) + "</div>" : ""}<div class="card-actions">${runnable ? '<button class="btn primary" data-run="' + card.id + '">Try this example</button>' : ""}<a class="btn" href="${escapeHTML(card.source)}" target="_blank" rel="noopener noreferrer">Reference ↗</a></div><label class="done-control"><input type="checkbox" data-done="${card.id}" ${done ? "checked" : ""}>I have studied this topic</label></div></details></article>`;
}
let currentView = "start",
  query = "",
  level = "all",
  completion = "all";
function navHTML() {
  return groups
    .map(
      (group, index) =>
        '<div class="nav-group" style="color:var(--' +
        ["accent", "mint", "gold", "pink"][index] +
        ')">' +
        group +
        "</div>" +
        DATA.filter((s) => s.group === group)
          .map(
            (s) =>
              '<button class="nav-button" data-view="' +
              s.id +
              '"><span>' +
              escapeHTML(s.title) +
              '</span><span class="nav-count">' +
              s.cards.length +
              "</span></button>",
          )
          .join(""),
    )
    .join("");
}
$("#navigation").innerHTML = navHTML();
function selected(cards) {
  return cards.filter(
    (c) =>
      (level === "all" || c.level === level) &&
      (completion === "all" ||
        (completion === "done") === progress.done.includes(c.id)),
  );
}
function toolbarHTML() {
  return `<div class="toolbar"><label class="subtle" for="level-filter">Show</label><select id="level-filter" aria-label="Filter by learning level"><option value="all">Every level</option><option value="Start here" ${level === "Start here" ? "selected" : ""}>Start here</option><option value="Everyday" ${level === "Everyday" ? "selected" : ""}>Everyday</option><option value="Deeper" ${level === "Deeper" ? "selected" : ""}>Deeper</option></select><select id="completion-filter" aria-label="Filter by study progress"><option value="all">All progress</option><option value="todo" ${completion === "todo" ? "selected" : ""}>Not studied yet</option><option value="done" ${completion === "done" ? "selected" : ""}>Studied</option></select><span class="spacer"></span><button class="btn" data-expand="open">Expand notes</button><button class="btn" data-expand="close">Collapse notes</button><button class="btn" data-print>Print view</button></div>`;
}
const emptyHTML = (title, desc) =>
  '<div class="empty"><h2>' + title + "</h2><p>" + desc + "</p></div>";
function renderHome() {
  const starts = groups.map((g) => DATA.find((s) => s.group === g));
  const pathText = [
    [
      "Start with keywords",
      "Decisions, loops, variables, functions and the original 37 terms.",
    ],
    [
      "Understand the language",
      "Types, operators, closures, prototypes, modules and execution.",
    ],
    [
      "Use the standard library",
      "Strings, arrays, collections, dates, regular expressions and Promises.",
    ],
    [
      "Work with the platform",
      "The DOM, events, browser APIs, Node.js and practical habits.",
    ],
  ];
  return `<section class="hero"><div class="eyebrow">Your offline study companion</div><h1>JavaScript,<br><span class="soft">one topic at a time.</span></h1><p class="lead">Clear notes. Small examples. Room to experiment.<br>Keep the language close while you learn to build with it.</p><div class="hero-stats"><div><strong>${allCards.length}</strong>searchable topics</div><div><strong>${DATA.length}</strong>organized sections</div><div><strong>${allCards.filter((c) => c.mode === "run").length}</strong>runnable examples</div><div><strong>3 files</strong>no build needed</div></div></section><div class="section-label"><h2>Choose where to begin</h2><span class="subtle">A suggested learning order</span></div><div class="paths">${starts.map((s, i) => '<button class="path" data-view="' + s.id + '"><div class="path-top"><span class="path-number">0' + (i + 1) + "</span>" + chevron + "</div><h3>" + pathText[i][0] + "</h3><p>" + pathText[i][1] + "</p></button>").join("")}</div><section class="comparison"><h2>Stop, skip or return</h2><div class="compare-grid"><div><code>break</code><p>Stop the loop.</p><small>Also exits a switch.</small></div><div><code>continue</code><p>Skip to the next iteration.</p><small>Stays inside the loop.</small></div><div><code>return</code><p>Exit the function, optionally with a value.</p><small>No value supplied? Returns undefined in a normal function.</small></div></div></section><div class="section-label"><h2>Six useful first steps</h2><button class="btn" data-view="all">Explore all topics</button></div><div class="topic-grid">${["kw-let", "kw-const", "kw-if", "kw-for", "kw-function", "kw-return"].map((id) => cardHTML(cardsById.get(id))).join("")}</div>`;
}
function render() {
  problemPractice?.stop();
  const view = $("#view");
  const showCourse = isCourseView() && !query;
  document.body.classList.toggle("course-mode", showCourse);
  document.body.classList.toggle("start-mode", currentView === "start" && !query);
  document.body.classList.toggle("console-mode", currentView === "console" && !query);
  document.body.classList.toggle("problem-mode", currentView === "problems" && !query);
  updateCourseBadge();
  document.querySelectorAll("[data-view]").forEach((b) => {
    if (
      (b.dataset.view === currentView ||
        (b.dataset.view === "course" && showCourse)) &&
      !query
    )
      b.setAttribute("aria-current", "page");
    else b.removeAttribute("aria-current");
  });
  if (currentView === "start" && !query) {
    view.innerHTML = renderStart();
    return;
  }
  if (currentView === "console" && !query) {
    const storageNote = !storageOK ? 'Storage is unavailable. Download a backup in Settings before leaving.'
      : accounts?.signedIn ? 'Your predictions are saved with your account. Check the toolbar for sync status.'
      : 'Your predictions are saved in this browser. Sign in to save across devices.';
    view.innerHTML = renderConsolePractice(progress.consolePractice, escapeHTML, highlight, storageNote);
    return;
  }
  if (currentView === 'problems' && !query) {
    const storageNote = !storageOK ? 'Storage is unavailable. Download a backup in Settings before leaving.'
      : accounts?.signedIn ? 'Your debugging drafts and solved problems are saved with your account. Check the toolbar for sync status.'
      : 'Your debugging drafts are saved in this browser. Sign in to save across devices.';
    view.innerHTML = renderProblemPractice(progress.problemPractice, escapeHTML, highlight, storageNote, problemPractice?.feedback(), problemPractice?.canUndo());
    return;
  }
  if (showCourse) {
    view.innerHTML =
      currentView === "course"
        ? courseDashboard()
        : renderLesson(activeLesson());
    return;
  }
  if (currentView === "home" && !query) {
    view.innerHTML = renderHome();
    return;
  }
  let cards, title, desc, breadcrumb;
  if (query) {
    const terms = query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
    cards = allCards.filter((c) => {
      const hay = [
        c.title,
        c.summary,
        ...c.explanation,
        c.code,
        c.pitfall,
        ...c.tags,
        c.sectionTitle,
        c.group,
      ]
        .join(" ")
        .toLocaleLowerCase();
      return terms.every((t) => hay.includes(t));
    });
    title = "Search your guide";
    desc =
      "Results across all sections. Search matches names, explanations and example code.";
    breadcrumb = "Search";
  } else if (currentView === "saved") {
    cards = allCards.filter((c) => progress.saved.includes(c.id));
    title = "Your bookmarks";
    desc = "A short list of the topics you want to keep close.";
    breadcrumb = "Study desk / Bookmarks";
  } else if (currentView === "all") {
    cards = allCards;
    title = "All JavaScript topics";
    desc =
      "Explore the full study guide or narrow it by learning level and progress.";
    breadcrumb = "Study desk / All topics";
  } else {
    const section = DATA.find((s) => s.id === currentView);
    if (!section) {
      navigate("home");
      return;
    }
    cards = allCards.filter((c) => c.section === currentView);
    title = section.title;
    desc = section.description;
    breadcrumb = section.group + " / " + section.cards.length + " topics";
  }
  const shown = selected(cards);
  view.innerHTML =
    '<div class="view-heading"><div class="breadcrumbs">' +
    escapeHTML(breadcrumb) +
    "</div><h1>" +
    escapeHTML(title) +
    "</h1><p>" +
    escapeHTML(desc) +
    "</p></div>" +
    toolbarHTML() +
    '<p class="subtle" style="margin-bottom:22px" role="status">' +
    shown.length +
    " topic" +
    (shown.length === 1 ? "" : "s") +
    (query ? " matching “" + escapeHTML(query) + "”" : "") +
    "</p>" +
    (shown.length
      ? currentView === "all" || query || currentView === "saved"
        ? DATA.map((s) => {
            const group = shown.filter((c) => c.section === s.id);
            return group.length
              ? '<section class="result-group"><h2>' +
                  escapeHTML(s.title) +
                  '</h2><div class="topic-grid">' +
                  group.map(cardHTML).join("") +
                  "</div></section>"
              : "";
          }).join("")
        : '<div class="topic-grid">' + shown.map(cardHTML).join("") + "</div>"
      : emptyHTML(
          currentView === "saved" && !query
            ? "Your bookmarks start here."
            : "No matching topics.",
          "Try another search or change the filters. Use the bookmark button on any topic to save it.",
        ));
  if (!query && DATA.some((s) => s.id === currentView)) {
    const i = DATA.findIndex((s) => s.id === currentView);
    view.insertAdjacentHTML(
      "beforeend",
      '<div class="section-end">' +
        (i > 0
          ? '<button class="btn" data-view="' +
            DATA[i - 1].id +
            '">← Previous section</button>'
          : "<span></span>") +
        (i < DATA.length - 1
          ? '<button class="btn" data-view="' +
            DATA[i + 1].id +
            '">Next section →</button>'
          : '<button class="btn" data-view="home">Back to study desk</button>') +
        "</div>",
    );
  }
}
const mobileView = matchMedia("(max-width:760px)");
function setMenu(open) {
  document.body.classList.toggle("nav-open", open);
  $("#menu-button").setAttribute("aria-expanded", open);
  $("#menu-button").setAttribute(
    "aria-label",
    open ? "Close topic navigation" : "Open topic navigation",
  );
  $("#study-sidebar").inert = document.body.classList.contains("account-loading") || (mobileView.matches && !open);
}
mobileView.addEventListener("change", () => setMenu(false));
function navigate(id, hash = true) {
  stopCourseRun();
  problemPractice?.stop();
  clearTimeout(courseDraftTimer);
  persist();
  currentView = validView(id) ? id : "start";
  if (currentView.startsWith("lesson-")) {
    progress.course.last = currentView.slice(7);
    persist();
  }
  query = "";
  $("#search").value = "";
  level = "all";
  completion = "all";
  setMenu(false);
  if (hash) {
    try {
      history.replaceState(null, "", "#" + encodeURIComponent(id));
    } catch {
      /* Navigation also works when history is unavailable. */
    }
  }
  render();
  if (currentView === "start") $("#welcome-heading")?.focus({ preventScroll: true });
  if (currentView === "console") $("#console-heading")?.focus({ preventScroll: true });
  if (currentView === 'problems') $('#problem-heading')?.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "instant" });
}
let searchTimer;
$("#search").addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    stopCourseRun();
    query = $("#search").value.trim();
    level = "all";
    completion = "all";
    render();
  }, 140);
});
async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const el = document.createElement("textarea");
    el.value = value;
    el.style.cssText = "position:fixed;top:0;left:-9999px";
    document.body.append(el);
    el.select();
    const ok = document.execCommand("copy");
    el.remove();
    if (!ok) {
      toast("Copy is unavailable here. Select the code and copy it manually.");
      return;
    }
  }
  toast("Code copied.");
}
/* 6. REFERENCE PLAYGROUND — run, stop and reset example code. */
let originalCode = 'console.log("Hello, JavaScript!");',
  activeFrame = null,
  runTimer = null,
  runToken = null,
  logCount = 0;
function stopRun(message) {
  if (activeFrame) {
    activeFrame.contentWindow?.postMessage(
      { type: "stop", token: runToken },
      "*",
    );
    activeFrame.remove();
    activeFrame = null;
  }
  clearTimeout(runTimer);
  runToken = null;
  $("#run-button").disabled = false;
  $("#stop-button").disabled = true;
  if (message) $("#run-state").textContent = message;
}
function openRunner(card) {
  stopRun();
  originalCode = card
    ? card.code
    : 'const name = "JavaScript";\nconsole.log("Hello, " + name + "!");';
  $("#editor").value = originalCode;
  $("#runner-title").textContent = card
    ? "Try it: " + card.title
    : "JavaScript playground";
  $("#console").textContent = "Your output will appear here.";
  $("#console").classList.remove("error");
  $("#run-state").textContent = "Ready";
  $("#runner-dialog").showModal();
  if (card) runCode();
}
function runCode() {
  stopRun();
  const code = $("#editor").value;
  if (code.length > 60000) {
    toast("Please keep playground examples under 60,000 characters.");
    return;
  }
  $("#console").textContent = "";
  $("#console").classList.remove("error");
  $("#run-state").textContent = "Running…";
  $("#run-button").disabled = true;
  $("#stop-button").disabled = false;
  logCount = 0;
  runToken = String(Date.now()) + "-" + Math.random().toString(36).slice(2);
  activeFrame = document.createElement("iframe");
  activeFrame.hidden = true;
  activeFrame.setAttribute("sandbox", "allow-scripts");
  activeFrame.setAttribute("aria-hidden", "true");
  activeFrame.srcdoc = RUNNER_HTML;
  document.body.append(activeFrame);
  runTimer = setTimeout(() => {
    if (!activeFrame) return;
    $("#console").textContent +=
      "\nStopped: the example exceeded the 3-second limit.";
    $("#console").classList.add("error");
    stopRun("Time limit reached");
  }, 3000);
}
window.addEventListener("message", (e) => {
  if (
    !activeFrame ||
    e.source !== activeFrame.contentWindow ||
    !e.data ||
    typeof e.data !== "object"
  )
    return;
  const msg = e.data;
  if (msg.type === "ready") {
    activeFrame.contentWindow.postMessage(
      { type: "run", token: runToken, code: $("#editor").value },
      "*",
    );
    return;
  }
  if (msg.token !== runToken) return;
  if (msg.type === "log") {
    if (logCount++ < 100) {
      $("#console").textContent +=
        (logCount > 1 ? "\n" : "") + String(msg.text).slice(0, 12000);
      $("#console").scrollTop = $("#console").scrollHeight;
    }
  } else if (msg.type === "error") {
    $("#console").textContent +=
      ($("#console").textContent ? "\n" : "") + String(msg.text);
    $("#console").classList.add("error");
    stopRun("Finished with an error");
  } else if (msg.type === "done") {
    if (!$("#console").textContent)
      $("#console").textContent =
        "Finished. No console output. Try console.log(value).";
    stopRun("Finished");
  }
});
$("#run-button").onclick = runCode;
$("#stop-button").onclick = () => {
  stopRun("Stopped");
  $("#console").textContent += "\nStopped by you.";
};
$("#reset-button").onclick = () => {
  stopRun("Ready");
  $("#editor").value = originalCode;
  $("#console").textContent = "Example reset. Press Run code to try it.";
  $("#console").classList.remove("error");
};
$("#copy-editor").onclick = () => copyText($("#editor").value);
$("#runner-dialog").addEventListener("close", () => stopRun());
$("#editor").addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    runCode();
  } else if (e.key === "Tab") {
    e.preventDefault();
    const a = e.target.selectionStart,
      b = e.target.selectionEnd;
    e.target.setRangeText("  ", a, b, "end");
  }
});
/* 7. REFERENCE BUTTONS, BOOKMARKS, BACKUPS AND KEYBOARD SHORTCUTS */
function updateCardState(id) {
  document.querySelectorAll('[data-card="' + id + '"]').forEach((el) => {
    const saved = progress.saved.includes(id),
      done = progress.done.includes(id);
    el.classList.toggle("card-complete", done);
    const b = el.querySelector("[data-save]");
    b.setAttribute("aria-pressed", saved);
    b.setAttribute(
      "aria-label",
      (saved ? "Remove bookmark for " : "Bookmark ") + cardsById.get(id).title,
    );
    el.querySelector("[data-done]").checked = done;
  });
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.view) {
    navigate(b.dataset.view);
    return;
  }
  if (b.dataset.save) {
    const id = b.dataset.save;
    progress.saved = progress.saved.includes(id)
      ? progress.saved.filter((x) => x !== id)
      : [...progress.saved, id];
    persist();
    updateCardState(id);
    if (currentView === "saved" && !query && !progress.saved.includes(id))
      render();
    return;
  }
  if (b.dataset.copy) {
    copyText(cardsById.get(b.dataset.copy).code);
    return;
  }
  if (b.dataset.run) {
    openRunner(cardsById.get(b.dataset.run));
    return;
  }
  if (b.dataset.close) {
    document.getElementById(b.dataset.close).close();
    return;
  }
  if (b.dataset.expand) {
    $("#view")
      .querySelectorAll("details")
      .forEach((d) => (d.open = b.dataset.expand === "open"));
    return;
  }
  if (b.hasAttribute("data-print")) {
    const states = [...$("#view").querySelectorAll("details")].map((d) => [
      d,
      d.open,
    ]);
    states.forEach(([d]) => (d.open = true));
    window.addEventListener(
      "afterprint",
      () => states.forEach(([d, open]) => (d.open = open)),
      { once: true },
    );
    window.print();
  }
});
document.addEventListener("change", (e) => {
  if (e.target.dataset.done) {
    const id = e.target.dataset.done;
    progress.done = e.target.checked
      ? [...new Set([...progress.done, id])]
      : progress.done.filter((x) => x !== id);
    persist();
    updateCardState(id);
    if (completion !== "all") render();
  }
  if (e.target.id === "level-filter") {
    level = e.target.value;
    render();
  }
  if (e.target.id === "completion-filter") {
    completion = e.target.value;
    render();
  }
});
$("#menu-button").onclick = () =>
  setMenu(!document.body.classList.contains("nav-open"));
$("#shade").onclick = () => setMenu(false);
$("#home-link").addEventListener("click", (event) => {
  if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  navigate("start");
});
$("#playground-button").onclick = () => openRunner();
$("#settings-button").onclick = () => {
  $("#settings-dialog").showModal();
};
$("#help-button").onclick = $("#footer-help").onclick = () =>
  $("#help-dialog").showModal();
for (const [id, key] of [
  ["text-size", "size"],
  ["theme", "theme"],
  ["spacing", "spacing"],
])
  $("#" + id).addEventListener("change", (e) => {
    progress.settings[key] = e.target.value;
    applySettings();
    persist();
  });
$("#export-progress").onclick = () => {
  const blob = new Blob([JSON.stringify(progress, null, 2)], {
      type: "application/json",
    }),
    url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = "javascript-study-progress.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("Progress backup downloaded.");
};
$("#import-progress").onclick = () => $("#import-file").click();
$("#import-file").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    if (file.size > MAX_PROGRESS_BYTES)
      throw Error("That file is too large for a progress backup.");
    const incoming = validateProgress(JSON.parse(await file.text()));
    progress.saved = [...new Set([...progress.saved, ...incoming.saved])];
    progress.done = [...new Set([...progress.done, ...incoming.done])];
    progress.settings = incoming.settings;
    progress.course = mergeCourse(incoming.course);
    progress.consolePractice = mergeConsoleProgress(freshConsoleProgress(), incoming.consolePractice, progress.consolePractice);
    progress.problemPractice = mergeProblemProgress(freshProblemProgress(), incoming.problemPractice, progress.problemPractice);
    problemPractice?.reset();
    persist();
    applySettings();
    render();
    toast(
      "Progress restored. Bookmarks, studied topics, and lesson achievements were kept.",
    );
  } catch (err) {
    toast(err.message || "Could not read the progress backup.");
  }
  e.target.value = "";
});
document.addEventListener("keydown", (e) => {
  if (
    e.key === "/" &&
    !e.ctrlKey &&
    !e.metaKey &&
    !e.altKey &&
    !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName) &&
    !document.querySelector("dialog[open]")
  ) {
    e.preventDefault();
    $("#search").focus();
  }
  if (e.key === "Escape") setMenu(false);
});
function readHash() {
  try {
    return decodeURIComponent(location.hash.slice(1));
  } catch {
    return "start";
  }
}
window.addEventListener("hashchange", () => {
  const id = readHash();
  if (id === "main") return;
  navigate(validView(id) ? id : "start", false);
});
/* 8. COURSE PROGRESS — load, validate and merge lesson achievements. */
// Course state lives in the same backup as the original reference progress.
function freshCourse() {
  return { last: "first-program", lessons: {} };
}
function validateCourse(value) {
  const out = freshCourse();
  if (!value || typeof value !== "object") return out;
  if (COURSE.lessons.some((l) => l.id === value.last)) out.last = value.last;
  for (const lesson of COURSE.lessons) {
    for (const key of lessonProgressKeys(lesson)) {
    const v = value.lessons?.[key];
    if (!v || typeof v !== "object") continue;
    const answers = Array.isArray(v.answers)
      ? lesson.quiz.map((q, i) =>
          Number.isInteger(v.answers[i]) &&
          v.answers[i] >= 0 &&
          v.answers[i] < q.choices.length
            ? v.answers[i]
            : null,
        )
      : [null, null, null];
    out.lessons[key] = {
      step: Number.isInteger(v.step) && v.step >= 0 && v.step <= 4 ? v.step : 0,
      extra: (() => { try { return cleanExtraProgress(v.extra); } catch { return {}; } })(),
      extraSelected: isExtraId(v.extraSelected) ? v.extraSelected : null,
      read: Array.isArray(v.read)
        ? [...new Set(v.read.filter((n) => n === 0 || n === 1))]
        : [],
      code:
        typeof v.code === "string"
          ? v.code.slice(0, 60000)
          : initialLessonCode(lesson, key),
      passed: v.passed === true,
      answers,
      submitted: v.submitted === true && answers.every((a) => a !== null),
      best: Number.isInteger(v.best) && v.best >= 0 && v.best <= 3 ? v.best : 0,
      order: Array.isArray(v.order)
        ? [
            ...new Set(
              v.order.filter((n) => Number.isInteger(n) && n >= 0 && n < 3),
            ),
          ]
        : [],
    };
    }
  }
  return out;
}
function lessonState(lesson) {
  if (!progress.course) progress.course = freshCourse();
  return (progress.course.lessons[lessonProgressKey(lesson)] ||= {
    step: 0,
    read: [],
    code: lesson.exercise.starter || "",
    passed: false,
    answers: [null, null, null],
    submitted: false,
    best: 0,
    order: [],
    extra: {},
    extraSelected: null,
  });
}
function extraState(lesson, exercise) {
  const s = lessonState(lesson);
  s.extra ||= {};
  return (s.extra[exercise.id] ||= { code: exercise.starter || '', passed: false, choice: null, submitted: false });
}
function activePractice(lesson) {
  const s = lessonState(lesson);
  if (s.step !== 4) return { exercise: lesson.exercise, state: s, extraId: null };
  const exercise = lesson.extras.find(ex => ex.id === s.extraSelected);
  return exercise ? { exercise, state: extraState(lesson, exercise), extraId: exercise.id } : null;
}
function lessonComplete(lesson) {
  const s = lessonState(lesson);
  return s.read.length === 2 && s.passed && s.best === 3;
}
function previousLessonState(lesson) {
  const previous = progress.course.lessons[lesson.id];
  return hasLessonWork(previous, initialLessonCode(lesson, lesson.id)) ? previous : null;
}
function previousCourseNotice() {
  return COURSE.lessons.some(previousLessonState)
    ? '<aside class="course-update"><strong>More explanation. Fresh practice.</strong><p>These lessons now include detailed walkthroughs and new exercises. Progress here tracks the new version. Your earlier code and results are kept inside each lesson under “Your earlier work”.</p></aside>'
    : '';
}
function earlierWork(lesson) {
  const previous = previousLessonState(lesson);
  if (!previous) return '';
  return `<details class="earlier-work"><summary>Your earlier work is saved</summary><p>This lesson has new exercises and quiz questions. Your previous attempt stays separate, so its answers are not applied to the new questions.</p><p>Earlier version: ${previous.read.length}/2 reading pages · Practice ${previous.passed ? 'passed' : 'not passed'} · Best quiz ${previous.best}/3</p>${previous.code ? `<h3>Your earlier code</h3><pre><code>${escapeHTML(previous.code)}</code></pre>` : '<p>No earlier code draft.</p>'}</details>`;
}
function courseCount() {
  return COURSE.lessons.filter(lessonComplete).length;
}
function mergeCourse(incoming) {
  const current = progress.course || freshCourse();
  for (const lesson of COURSE.lessons) {
    for (const key of lessonProgressKeys(lesson)) {
    const next = incoming.lessons[key];
    if (!next) continue;
    const old = current.lessons[key];
    current.lessons[key] = old
      ? {
          ...next,
          read: [...new Set([...old.read, ...next.read])],
          passed: old.passed || next.passed,
          best: Math.max(old.best, next.best),
          extra: mergeExtraProgress({}, next.extra, old.extra),
        }
      : next;
    }
  }
  current.last = incoming.last;
  return current;
}
function validView(id) {
  return (
    DATA.some((s) => s.id === id) ||
    ["start", "course", "console", "problems", "home", "saved", "all"].includes(id) ||
    COURSE.lessons.some((l) => "lesson-" + l.id === id)
  );
}
function activeLesson() {
  return COURSE.lessons.find((l) => "lesson-" + l.id === currentView);
}
function updateCourseBadge() {
  const badge = document.getElementById("course-count");
  if (badge) badge.textContent = courseCount() + "/" + COURSE.lessons.length;
  const consoleBadge = document.getElementById('console-count');
  if (consoleBadge) consoleBadge.textContent = consoleStats(progress.consolePractice).solved + '/' + consoleQuestionCount;
  const problemBadge = document.getElementById('problem-count');
  if (problemBadge) problemBadge.textContent = problemSolvedCount(progress.problemPractice) + '/' + problemChallengeCount;
}
function isCourseView() {
  return currentView === "course" || !!activeLesson();
}
/* 9. COURSE DISPLAY — welcome page, dashboard, lessons, exercises and quizzes. */
const welcomeExample = {
  title: "Your first JavaScript program",
  code: 'const message = "Hello, JavaScript!";\nconsole.log(message);\nconsole.log(7 + 5);',
};

// The home page introduces the course. Learning path still lists every lesson.
function renderStart() {
  const total = COURSE.lessons.length;
  const done = courseCount();
  const last = COURSE.lessons.find((lesson) => lesson.id === progress.course.last) || COURSE.lessons[0];
  const started = last.id !== "first-program" || COURSE.lessons.some((lesson) => {
    const state = lessonState(lesson);
    return state.step > 0 || state.read.length > 0 || state.passed || state.best > 0 ||
      state.answers.some((answer) => answer !== null) || state.code !== (lesson.exercise.starter || "");
  });
  const finished = done === total;
  const percent = Math.round(done / total * 100);
  const lessonIndex = COURSE.lessons.indexOf(last) + 1;
  const steps = ["Learn the idea", "See it in action", "Practice", "Quiz", "Extra practice (optional)"];
  const action = finished ? 'data-view="course"' : `data-lesson="${started ? last.id : "first-program"}"`;

  return `<div class="welcome-page">
    <section class="welcome-hero" aria-labelledby="welcome-heading">
      <div class="welcome-intro">
        <div class="welcome-kicker"><span aria-hidden="true">JS</span> A free course. A fresh start.</div>
        <h1 id="welcome-heading" tabindex="-1">Your first<br>JavaScript program<span class="welcome-accent"> starts here.</span></h1>
        <p class="welcome-lead">Go from “where do I begin?” to code you understand. Learn one idea, try it yourself, then put it to the test.</p>
        <div class="course-actions">
          <button class="btn course-primary" ${action}>${finished ? "Revisit the course" : started ? "Continue learning" : "Start learning"} <span aria-hidden="true">→</span></button>
          <button class="btn" data-view="course">Explore the course</button>
        </div>
        <p class="welcome-note">No experience needed · Learn at your own pace</p>
      </div>
      <div class="welcome-example" aria-label="A first JavaScript example">
        <div class="welcome-editor-bar"><span><span class="welcome-file-icon" aria-hidden="true">JS</span> hello.js</span><span>YOUR FIRST FEW LINES</span></div>
        <pre><code>${highlight(welcomeExample.code)}</code></pre>
        <div class="welcome-output"><span>EXPECTED OUTPUT</span><pre>Hello, JavaScript!\n12</pre></div>
        <button class="welcome-try" data-welcome-example>Try this code <span aria-hidden="true">↗</span></button>
        <p>Change a word. Run it. See what happens.</p>
      </div>
    </section>

    ${previousCourseNotice()}
    <div class="welcome-facts" aria-label="What is included">
      <div><strong>${total}</strong><span>guided lessons</span></div>
      <div><strong>${total}</strong><span>practice activities</span></div>
      <div><strong>${COURSE.lessons.reduce((count, lesson) => count + lesson.quiz.length, 0)}</strong><span>quiz questions</span></div>
      <div><strong>EN + SV</strong><span>English with Swedish terms</span></div>
    </div>

    ${started ? `<section class="welcome-resume" aria-label="Your saved progress">
      <div><span class="welcome-label">${finished ? "LOOK HOW FAR YOU’VE COME" : "PICK UP WHERE YOU LEFT OFF"}</span>
        <h2>${finished ? `All ${total} lessons complete.` : escapeHTML(last.title)}</h2>
        <p>${finished ? "Revisit an exercise or try something new in the playground." : `Lesson ${lessonIndex} of ${total} · ${steps[lessonState(last).step]}`}</p></div>
      <div class="welcome-progress"><strong>${done} / ${total} <span>complete</span></strong>
        <div class="progress-track" role="progressbar" aria-label="Completed lessons" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}"><div style="width:${percent}%"></div></div></div>
    </section>` : ""}

    <section class="welcome-method" aria-labelledby="welcome-method-heading">
      <div class="welcome-section-heading"><div><span class="welcome-label">A LITTLE PRACTICE, EVERY STEP</span><h2 id="welcome-method-heading">Learn it. Write it. Make it stick.</h2></div><p>You do more than read. Every lesson gives you a chance to use what you just learned.</p></div>
      <ol class="welcome-steps">
        <li><span aria-hidden="true">01</span><h3>Get the idea</h3><p>Short explanations and worked examples make each new concept easier to follow.</p></li>
        <li><span aria-hidden="true">02</span><h3>Make something work</h3><p>Write code in your browser. Use hints and checks to understand what to try next.</p></li>
        <li><span aria-hidden="true">03</span><h3>Check what you know</h3><p>Finish with a three-question quiz. Get an explanation for every answer and retry anytime.</p></li>
      </ol>
    </section>

    ${consolePracticeCard(progress.consolePractice)}
    ${problemPracticeCard(progress.problemPractice)}
    <section class="welcome-curriculum" aria-labelledby="welcome-curriculum-heading">
      <div class="welcome-section-heading"><div><span class="welcome-label">YOUR LEARNING PATH</span><h2 id="welcome-curriculum-heading">Start small. Build on it.</h2></div><button class="btn" data-view="course">See all ${total} lessons <span aria-hidden="true">→</span></button></div>
      <div class="welcome-units">${COURSE.modules.map((unit, index) => {
        const lessons = COURSE.lessons.filter((lesson) => lesson.module === index);
        return `<button class="welcome-unit" data-lesson="${lessons[0].id}">
          <span class="welcome-unit-top"><span>UNIT ${unit.label}</span><span>${lessons.length} lessons</span></span>
          <strong>${escapeHTML(unit.title)}</strong><span class="welcome-unit-description">${escapeHTML(unit.subtitle)}</span>
          <span class="welcome-unit-bottom">Explore this unit <span aria-hidden="true">↗</span></span>
        </button>`;
      }).join("")}</div>
    </section>

    <section class="welcome-save" aria-labelledby="welcome-save-heading">
      <div><span class="welcome-label">KEEP YOUR MOMENTUM</span><h2 id="welcome-save-heading">Your progress, wherever you learn.</h2><p>Start as a guest, or sign in to save your lessons, code and quiz results across devices.</p></div>
      <button class="btn course-primary" data-welcome-account>${accounts?.signedIn ? "My account" : "Sign in / Create account"} <span aria-hidden="true">→</span></button>
    </section>
    <footer class="welcome-footer"><span>Made for learning, one small step at a time.</span><button class="btn" data-view="home">Explore the reference library <span aria-hidden="true">↗</span></button></footer>
  </div>`;
}

function courseDashboard() {
  const done = courseCount(),
    total = COURSE.lessons.length,
    pct = Math.round((done / total) * 100);
  const last = COURSE.lessons.find((l) => l.id === progress.course.last),
    next =
      (last && !lessonComplete(last)
        ? last
        : COURSE.lessons.find((l) => !lessonComplete(l))) || COURSE.lessons[0];
  const started = Object.values(progress.course.lessons).some(
    (s) => s.read.length || s.passed || s.answers.some((a) => a !== null),
  );
  return `<section class="course-hero"><div class="course-kicker">Your guided JavaScript course</div><h1>Small lessons.<br><span class="soft">Real understanding.</span></h1><p class="lead">Learn the idea, write the code, then check what sticks.<br>A hands-on path built from your ${COURSE.modules.length} class websites.</p><div class="course-actions"><button class="btn course-primary" data-lesson="${next.id}">${done === total ? "Revisit the course" : started ? "Continue learning" : "Start learning"} <span aria-hidden="true">→</span></button><button class="btn" data-view="home">Open reference guide</button></div><div class="course-meta"><span><strong>${total}</strong> guided lessons</span><span><strong>${total}</strong> practice activities</span><span><strong>${COURSE.lessons.reduce((n, l) => n + l.quiz.length, 0)}</strong> quiz questions</span><span>English + Swedish terms</span></div></section>
  ${previousCourseNotice()}
  ${consolePracticeCard(progress.consolePractice)}
  ${problemPracticeCard(progress.problemPractice)}
  <section class="course-summary" aria-label="Course progress"><div><h2>${done === total ? "Course completed" : "Your learning journey"}</h2><p>${done} of ${total} lessons complete · Read both pages, pass practice, and score 3/3 on the quiz.</p></div><div class="course-percent">${pct}%</div><div class="progress-track" role="progressbar" aria-label="Lesson completion" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><div style="width:${pct}%"></div></div></section>
  ${done === total ? `<section class="course-finished"><h2>You built a strong foundation.</h2><p>You completed all ${total} lessons, from the basics to higher-order functions and refactoring. Revisit any exercise, try different inputs, or use the reference guide for your next project.</p></section>` : ""}
  ${COURSE.modules
    .map((unit, mi) => {
      const lessons = COURSE.lessons.filter((l) => l.module === mi);
      return `<section class="unit"><div class="unit-heading"><span class="unit-number">${unit.label}</span><div><h2>${escapeHTML(unit.title)}</h2><p>${escapeHTML(unit.subtitle)}</p></div><span class="unit-count">${lessons.filter(lessonComplete).length} / ${lessons.length} complete</span></div><div class="lesson-list">${lessons
        .map((l) => {
          const s = lessonState(l),
            complete = lessonComplete(l),
            active =
              s.read.length || s.passed || s.answers.some((a) => a !== null);
          return `<button class="lesson-row ${complete ? "complete" : active ? "active" : ""}" data-lesson="${l.id}"><span class="lesson-number" aria-hidden="true">${complete ? "✓" : String(COURSE.lessons.indexOf(l) + 1).padStart(2, "0")}</span><span class="lesson-row-text"><strong>${escapeHTML(l.title)}</strong><small>${escapeHTML(l.summary)}</small></span><span class="lesson-row-side">~${l.minutes} min<b>${complete ? "Completed" : active ? "In progress" : "Start lesson"} →</b></span></button>`;
        })
        .join(
          "",
        )}</div><p class="source-note">Class source: <a href="${unit.source}" target="_blank" rel="noopener noreferrer">${escapeHTML(unit.sourceTitle)} ↗</a></p></section>`;
    })
    .join("")}
  <div class="course-how"><div><strong>01 · Understand</strong><p>Two short explanations, worked examples, and a key takeaway in every lesson.</p></div><div><strong>02 · Put it to work</strong><p>Edit real JavaScript with checks and hints. The Git lesson uses a command-order simulation.</p></div><div><strong>03 · Check your learning</strong><p>Three questions with explanations. Retry as often as you need; your best score stays.</p></div></div><p class="course-storage">${storageOK ? "Guest progress is saved in this browser. Sign in to save across devices, or use Settings to download a backup." : "Browser storage is unavailable. Use Settings to download your progress before closing the guide."} Once loaded, lessons can be studied offline. Account sync and source links need internet access.</p>`;
}
function lessonStepStatus(s, index) {
  return index < 2
    ? s.read.includes(index)
    : index === 2
      ? s.passed
      : s.best === 3;
}
function renderLesson(lesson) {
  const s = lessonState(lesson),
    unit = COURSE.modules[lesson.module],
    index = COURSE.lessons.indexOf(lesson),
    labels = ["Learn the idea", "See it in action", "Practice", "Quiz"];
  return `<div class="lesson-topline"><button class="btn" data-view="course">← Learning path</button><span>Lesson ${index + 1} of ${COURSE.lessons.length} · ~${lesson.minutes} min</span></div><header class="lesson-header"><div class="eyebrow">Unit ${unit.label} · ${escapeHTML(unit.subtitle)}</div><h1 id="lesson-heading" class="course-anchor" tabindex="-1">${escapeHTML(lesson.title)}</h1><p>${escapeHTML(lesson.summary)}</p></header><nav class="lesson-steps" aria-label="Lesson steps">${labels.map((label, i) => `<button class="lesson-step ${lessonStepStatus(s, i) ? "is-done" : ""}" data-step="${i}" ${s.step === i ? 'aria-current="step"' : ""}><span class="step-dot" aria-hidden="true">${lessonStepStatus(s, i) ? "✓" : i + 1}</span>${label}${lessonStepStatus(s, i) ? '<span class="sr-only"> (completed)</span>' : ""}</button>`).join("")}</nav>
  <div class="extra-nav"><button class="btn ${s.step === 4 ? 'extra-active' : ''}" data-extra-hub ${s.step === 4 ? 'aria-current="page"' : ''}>Extra practice <span>· optional · <span data-extra-count>${extraCount(lesson)}</span>/10 done</span></button></div>
  ${earlierWork(lesson)}
  ${s.step < 2 ? renderLearn(lesson, s) : s.step === 2 ? renderPractice(lesson, s) : s.step === 3 ? renderQuiz(lesson, s) : renderExtra(lesson, s)}
  <p class="terms"><strong>Swedish connections</strong><br>${escapeHTML(lesson.terms)}</p><p class="source-note lesson-source">Based on the topics in <a href="${unit.source}" target="_blank" rel="noopener noreferrer">${escapeHTML(unit.sourceTitle)} ↗</a>. Explanations, practice checks and quizzes are written for this guide.</p>`;
}
function renderLearn(lesson, s) {
  const part = lesson.steps[s.step];
  return `${s.step === 0 ? `<section class="lesson-goals" aria-label="Learning goals"><div><h2>What you’ll learn</h2><ul>${lesson.objectives.map(goal => `<li>${escapeHTML(goal)}</li>`).join('')}</ul></div><p><strong>Before you start</strong>${escapeHTML(lesson.prerequisites)}</p></section>` : ''}
    <div class="lesson-reading-grid">
      <article class="learn-card lesson-explanation">
        <div class="exercise-label">${s.step === 0 ? 'UNDERSTAND THE IDEA' : 'BUILD ON THE IDEA'}</div>
        <h2>${escapeHTML(part.title)}</h2>
        ${part.paragraphs.map(p => `<p>${escapeHTML(p)}</p>`).join('')}
        <aside class="lesson-takeaway"><strong>The key idea</strong>${escapeHTML(part.takeaway)}</aside>
        <aside class="lesson-mistake"><strong>A common mistake</strong><p>${escapeHTML(part.mistake)}</p></aside>
      </article>
      <section class="lesson-demonstration" aria-label="Worked example and explanation">
        <div class="lesson-example"><div class="lesson-example-label">${part.language === 'html' ? 'HTML · index.html' : part.language === 'terminal' ? 'TERMINAL · Git commands' : 'JAVASCRIPT · worked example'}</div><pre><code>${highlight(part.code)}</code></pre></div>
        <div class="lesson-expected"><strong>${part.language === 'javascript' ? 'Expected console output' : 'What this does'}</strong><pre>${escapeHTML(part.output)}</pre></div>
        ${part.language === 'javascript' ? `<button class="btn" data-run-lesson-example="${s.step}">Run and experiment with this example <span aria-hidden="true">↗</span></button>` : '<p class="course-storage">Read this example here. It belongs in an HTML file or terminal, not in the JavaScript practice editor.</p>'}
        <h3>Let’s walk through it</h3><ol class="lesson-walkthrough">${part.walkthrough.map(([snippet, explanation]) => `<li><code>${escapeHTML(snippet)}</code><p>${escapeHTML(explanation)}</p></li>`).join('')}</ol>
      </section>
    </div>
    <section class="lesson-understanding" aria-labelledby="understanding-heading"><span class="exercise-label">PAUSE AND THINK</span><h2 id="understanding-heading">Check your understanding</h2><p>${escapeHTML(part.check.prompt)}</p><details><summary>Reveal the answer and reasoning</summary><strong>${escapeHTML(part.check.answer)}</strong><p>${escapeHTML(part.check.why)}</p></details></section>
    <div class="lesson-bottom"><button class="btn" ${s.step === 0 ? 'data-view="course"' : 'data-step="0"'}>← ${s.step === 0 ? 'Learning path' : 'Previous explanation'}</button><span class="subtle">Take your time. Try predicting the output before running it.</span><button class="btn course-primary" data-continue>${s.step === 0 ? 'Continue the explanation' : 'Try it yourself'} →</button></div>`;
}
function renderPractice(lesson, s, ex = lesson.exercise, extra = false) {
  return `<div class="practice-grid"><section class="practice-brief"><div class="exercise-label">${ex.kind === 'code' ? 'YOUR TURN · A NEW SITUATION' : 'YOUR TURN · GIT SIMULATION'}</div><h2>${escapeHTML(ex.title)}</h2><p class="practice-intro">Use the same idea in a different example. Work through these steps in order.</p><ol>${ex.instructions.map(t => `<li>${escapeHTML(t)}</li>`).join('')}</ol>
  <aside class="practice-reminder"><strong>Connect it to the lesson</strong><p>${escapeHTML(lesson.steps[1].takeaway)}</p><button class="btn" data-step="0">Review the explanation</button></aside>
  <div class="practice-hints"><h3>Get a little help</h3>${ex.hints.map((hint, i) => `<details class="hint-box"><summary>Hint ${i + 1}${i === 0 ? ' · Where to begin' : i === 1 ? ' · The next step' : ' · Put it together'}</summary><p>${escapeHTML(hint)}</p></details>`).join('')}</div>
  <details class="hint-box"><summary>Worked solution, with reasoning</summary><p>Compare this with your attempt. Reading a solution does not complete the exercise.</p><pre><code>${highlight(ex.solution)}</code></pre><ol>${ex.solutionNotes.map(note => `<li>${escapeHTML(note)}</li>`).join('')}</ol></details>
  ${ex.kind === 'code' ? '<p class="course-storage">Core JavaScript only. No page DOM, network, or terminal access. Each run starts fresh and stops after 3 seconds.</p>' : ''}</section>
  ${ex.kind === "code" ? `<section class="code-workbench" aria-label="Coding practice"><div class="code-tab"><label for="course-editor"><strong>practice.js</strong></label><span>Ctrl / ⌘ + Enter</span></div><textarea id="course-editor" class="course-editor" spellcheck="false" autocapitalize="off" autocorrect="off" aria-label="Practice JavaScript code" maxlength="60000">${escapeHTML(s.code)}</textarea><div class="course-code-actions"><button class="btn course-primary" id="course-run" data-check>▶ Run & check</button><button class="btn" id="course-stop" data-stop disabled>Stop</button><button class="btn" data-reset-code>Reset code</button><span class="course-save-status" id="course-save-status">${storageOK ? "Saved locally" : "Session only"}</span></div><div class="course-console-label">CONSOLE</div><pre id="course-console" class="course-console" aria-label="Exercise output">Run your code to see the output here.</pre><div id="practice-status" class="practice-status ${s.passed ? "success" : ""}" role="status">${s.passed ? "✓ Practice passed previously. You can keep experimenting." : "Ready when you are. Run your code to check it."}</div><section id="practice-feedback" class="practice-feedback" aria-label="Practice feedback" aria-live="polite" hidden></section><ul class="exercise-checks" id="exercise-checks">${ex.tests.map((t) => `<li>○ ${escapeHTML(t.label)}</li>`).join("")}</ul></section>` : renderOrder(ex, s)}</div>
  ${extra ? extraFooter(lesson, ex) : `<div class="lesson-bottom"><button class="btn" data-step="1">← Back to the lesson</button><button class="btn course-primary" data-step="3">${s.passed ? "Practice complete · Take the quiz" : "Take the quiz"} →</button></div>`}`;
}
function extraCount(lesson) {
  const states = lessonState(lesson).extra || {};
  return lesson.extras.filter(ex => states[ex.id]?.passed).length;
}
function nextLessonButton(lesson, primary = false) {
  const next = COURSE.lessons[COURSE.lessons.indexOf(lesson) + 1];
  return `<button class="btn ${primary ? 'course-primary' : ''}" ${next ? `data-lesson="${next.id}"` : 'data-view="course"'}>${next ? 'Next lesson' : 'Back to learning path'} →</button>`;
}
function extraFooter(lesson, exercise) {
  const next = lesson.extras[lesson.extras.indexOf(exercise) + 1];
  return `<div class="lesson-bottom extra-footer"><button class="btn" data-extra-hub>← All 10 exercises</button>${next ? `<button class="btn" data-extra="${next.id}">Try another exercise →</button>` : ''}${nextLessonButton(lesson)}</div>`;
}
function renderExtra(lesson, s) {
  const exercise = lesson.extras.find(ex => ex.id === s.extraSelected);
  const count = extraCount(lesson);
  if (!exercise) return `<section class="extra-practice" aria-labelledby="extra-heading">
    <header class="extra-header"><div><div class="exercise-label">A LITTLE MORE CONFIDENCE · EXTRAÖVNINGAR</div><h2 id="extra-heading">Same idea. New challenges.</h2><p>Choose any of these 10 exercises. Do one, a few, or all of them — this is entirely optional and does not affect lesson completion.</p></div><div class="extra-total"><strong>${count}<span>/10</span></strong><span>extra exercises completed</span></div></header>
    <div class="extra-toolbar"><p>Your drafts and completed exercises are saved separately. Pick any card to begin or continue.</p>${nextLessonButton(lesson, true)}</div>
    <div class="extra-grid">${lesson.extras.map((ex, index) => {
      const saved = s.extra?.[ex.id];
      const started = saved && (saved.code !== (ex.starter || '') || saved.choice !== null);
      return `<button class="extra-card ${saved?.passed ? 'is-complete' : ''}" data-extra="${ex.id}"><span class="extra-card-top"><span class="extra-number">${String(index + 1).padStart(2, '0')}</span><span class="extra-card-status">${saved?.passed ? '✓ Completed' : started ? 'Continue draft' : ex.level}</span></span><strong>${escapeHTML(ex.title)}</strong><span class="extra-description">${escapeHTML(ex.instructions[0])}</span><span class="extra-card-action">${saved?.passed ? 'Practice again' : started ? 'Continue exercise' : 'Try this exercise'} <span aria-hidden="true">↗</span></span></button>`;
    }).join('')}</div><div class="lesson-bottom"><button class="btn" data-step="3">← Back to quiz</button>${nextLessonButton(lesson)}</div></section>`;
  const state = extraState(lesson, exercise);
  return `<section class="extra-detail" aria-label="Optional extra exercise"><header class="extra-detail-header"><button class="btn" data-extra-hub>← All 10 exercises</button><span>Optional exercise ${lesson.extras.indexOf(exercise) + 1} of 10 · ${exercise.level}</span><span class="extra-completion" data-extra-completion>${state.passed ? '✓ Completed' : 'Try it at your own pace'}</span></header><p class="extra-note">Extra practice · You can leave for the next lesson whenever you’re ready. Each exercise has its own saved attempt.</p>
    ${exercise.kind === 'code' ? renderPractice(lesson, state, exercise, true) : renderExtraChoice(lesson, exercise, state)}</section>`;
}
function renderExtraChoice(lesson, exercise, state) {
  const correct = state.choice === exercise.answer;
  return `<section class="extra-choice"><div class="exercise-label">GIT SCENARIO · NO TERMINAL NEEDED</div><h2>${escapeHTML(exercise.title)}</h2><form id="extra-choice"><fieldset class="quiz-question"><legend>${escapeHTML(exercise.instructions[0])}</legend>${exercise.choices.map((choice, i) => `<label class="quiz-option ${state.submitted && i === exercise.answer ? 'correct' : state.submitted && i === state.choice ? 'incorrect' : ''}"><input type="radio" name="extra-choice" value="${i}" ${state.choice === i ? 'checked' : ''} ${state.submitted ? 'disabled' : ''}><span>${escapeHTML(choice)}</span></label>`).join('')}</fieldset><p id="extra-choice-notice" role="alert"></p>${state.submitted ? `<div class="answer-feedback ${correct ? '' : 'wrong'}" role="status"><strong>${correct ? '✓ Exercise completed' : 'Review the reasoning, then try again'}</strong>${escapeHTML(exercise.reasoning)}</div><button type="button" class="btn" data-retry-extra>Try again</button>` : '<button type="submit" class="btn course-primary">Check answer →</button>'}</form></section>${extraFooter(lesson, exercise)}`;
}
function renderOrder(ex, s) {
  return `<section class="code-workbench" style="padding:20px" aria-label="Command order practice"><h3 style="font-size:18px">Choose the next command</h3><div class="order-picks">${ex.commands.map((c, i) => `<button class="btn" data-order="${i}" ${s.order.includes(i) ? "disabled" : ""}>${escapeHTML(c)}</button>`).join("")}</div><div class="order-result" aria-label="Your command order">${s.order.length ? "<ol>" + s.order.map((i) => "<li>" + escapeHTML(ex.commands[i]) + "</li>").join("") + "</ol>" : "Your three commands will appear here."}</div><div class="course-actions"><button class="btn course-primary" data-check-order>Check order</button><button class="btn" data-reset-order>Start over</button></div><p id="practice-status" class="practice-status ${s.passed ? "success" : ""}" role="status">${s.passed ? "✓ You passed this practice." : "Select all three commands, then check your answer."}</p></section>`;
}
function renderQuiz(lesson, s) {
  const score = lesson.quiz.reduce(
      (n, q, i) => n + (s.answers[i] === q.answer),
      0,
    ),
    complete = lessonComplete(lesson);
  return `<section><header class="quiz-head"><h2>Let’s see what stuck.</h2><p>Three questions · Get all three right to pass · Unlimited retries</p><p class="subtle">Best score: ${s.best}/3${s.passed ? " · Practice complete" : " · Complete the practice too to finish this lesson."}</p></header><form id="lesson-quiz">${lesson.quiz.map((q, qi) => `<fieldset class="quiz-question"><legend>${qi + 1}. ${escapeHTML(q.prompt)}</legend>${q.choices.map((option, oi) => `<label class="quiz-option ${s.submitted && oi === q.answer ? "correct" : s.submitted && s.answers[qi] === oi ? "incorrect" : ""}"><input type="radio" name="question-${qi}" value="${oi}" ${s.answers[qi] === oi ? "checked" : ""} ${s.submitted ? "disabled" : ""}><span>${escapeHTML(option)}</span>${s.submitted && oi === q.answer ? '<span class="course-answer-label">✓ Correct answer</span>' : ""}</label>`).join("")}${s.submitted ? `<p class="answer-feedback ${s.answers[qi] !== q.answer ? "wrong" : ""}"><strong>${s.answers[qi] === q.answer ? "✓ Correct" : "↺ Review this one"}</strong>${escapeHTML(q.why)}</p>` : ""}</fieldset>`).join("")}<p id="quiz-notice" class="quiz-notice" role="alert"></p>${!s.submitted ? '<button type="submit" class="btn course-primary">Check my answers →</button>' : ""}</form>
  ${s.submitted ? `<section class="quiz-result" role="status"><h3>${score === 3 ? "✓ Quiz passed" : score + "/3 · Keep going"}${score === 3 ? " · 3/3" : ""}</h3><p>${score === 3 ? (complete ? "Lesson complete. You have read, practiced, and checked your understanding." : !s.passed ? "Your quiz is passed. Finish the practice to complete this lesson." : "Your quiz is passed. Finish both lesson pages using Continue to complete this lesson.") : "Read the explanations above, revisit the lesson if needed, then give it another try. Your best score is saved."}</p><button class="btn" data-retry-quiz>Retry quiz</button> ${!s.passed ? '<button class="btn course-primary" data-step="2">Go to practice →</button>' : s.read.length < 2 ? '<button class="btn course-primary" data-step="0">Review the lesson →</button>' : ""}</section>` : ""}
  ${complete ? `<aside class="extra-invitation"><div><strong>Lesson complete. What would you like to do next?</strong><p>Move on when you’re ready, or build confidence with 10 optional exercises. You don’t need to finish them all.</p></div><div class="course-actions">${nextLessonButton(lesson, true)}<button class="btn" data-extra-hub>Practice more · 10 exercises</button></div></aside>` : ""}
  <div class="lesson-bottom"><button class="btn" data-step="2">← Back to practice</button><button class="btn" data-view="course">Learning path</button></div></section>`;
}
function changeLessonStep(step) {
  const lesson = activeLesson();
  if (!lesson) return;
  stopCourseRun();
  courseUndoCode = null;
  lessonState(lesson).step = step;
  persist();
  render();
  focusLesson();
}
function focusLesson() {
  document.getElementById("lesson-heading")?.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "instant" });
}
function showPracticePassed() {
  const stepButton = document.querySelector('[data-step="2"]');
  if (stepButton) {
    stepButton.classList.add("is-done");
    stepButton.innerHTML =
      '<span class="step-dot" aria-hidden="true">✓</span>Practice<span class="sr-only"> (completed)</span>';
  }
  const nextButton = document.querySelector('.lesson-bottom [data-step="3"]');
  if (nextButton)
    nextButton.textContent = "Practice complete · Take the quiz →";
}
function showPracticeFeedback(feedback) {
  const panel = document.getElementById('practice-feedback');
  if (!panel) return;
  panel.hidden = !feedback;
  if (!feedback) { panel.innerHTML = ''; return; }
  const value = item => `<pre>${escapeHTML(item.text)}</pre>${['requirement', 'undefined'].includes(item.type) ? '' : `<span class="feedback-type">${escapeHTML(item.type)}</span>`}`;
  panel.innerHTML = `<div class="exercise-label">LET’S FIX ONE THING AT A TIME</div><h3>${escapeHTML(feedback.title)}</h3><p>${escapeHTML(feedback.explanation)}</p>
    ${feedback.actual && feedback.expected ? `<dl class="feedback-values"><div><dt>Expected</dt><dd>${value(feedback.expected)}</dd></div><div><dt>Your result</dt><dd>${value(feedback.actual)}</dd></div></dl>` : ''}
    <div class="feedback-hint"><strong>Hint · Try this next</strong><p>${escapeHTML(feedback.hint)}</p></div>
    ${feedback.exerciseHint ? `<details><summary>Hint for this exercise</summary><p>${escapeHTML(feedback.exerciseHint)}</p></details>` : ''}
    ${feedback.technical ? `<details><summary>JavaScript error message</summary><pre>${escapeHTML(feedback.technical)}</pre></details>` : ''}
    <p class="feedback-next">Change one thing, then run your code again. Your draft stays here.</p>`;
}
/* 10. COURSE CODE RUNNER — sandboxed execution with a three-second limit. */
let courseRun = null,
  courseRunTimer = null,
  courseDraftTimer = null,
  courseUndoCode = null;
function stopCourseRun(message) {
  if (courseRun) {
    courseRun.frame.remove();
    courseRun = null;
  }
  clearTimeout(courseRunTimer);
  const run = document.getElementById("course-run"),
    stop = document.getElementById("course-stop");
  if (run) run.disabled = false;
  if (stop) stop.disabled = true;
  if (message && document.getElementById("practice-status"))
    document.getElementById("practice-status").textContent = message;
}
// The frame has an opaque origin and a no-network CSP. The worker keeps loops off the UI thread.
function courseFrameMain(executePracticeChecks, createCheckObserver) {
  let worker;
  function workerMain(executePracticeChecks, createCheckObserver) {
    self.onmessage = async ({ data }) => {
      const logs = [];
      let displayed = 0;
      const format = (value) => {
        if (value === undefined) return "undefined";
        if (typeof value === "string") return value;
        try {
          return (
            JSON.stringify(value, (_, v) =>
              typeof v === "bigint" ? String(v) + "n" : v,
            ) ?? String(value)
          );
        } catch {
          return String(value);
        }
      };
      const log = (...args) => {
        if (logs.length < 100) logs.push(args);
        if (displayed++ < 60)
          self.postMessage({
            type: "log",
            text: args.map(format).join(" ").slice(0, 4000),
          });
      };
      const output = {
        log,
        info: log,
        warn: log,
        error: log,
        table: log,
        dir: log,
      };
      self.postMessage(await executePracticeChecks(data, output, logs, createCheckObserver));
    };
  }
  addEventListener("message", (event) => {
    if (event.source !== parent || event.data?.type !== "run") return;
    const token = event.data.token;
    const send = (data) => parent.postMessage({ ...data, token }, "*");
    try {
      worker?.terminate();
      const url = URL.createObjectURL(
        new Blob(["(" + workerMain.toString() + ")(" + executePracticeChecks.toString() + "," + createCheckObserver.toString() + ")"], {
          type: "text/javascript",
        }),
      );
      worker = new Worker(url);
      URL.revokeObjectURL(url);
      worker.onmessage = ({ data }) => {
        send(data);
        if (data.type === "results" || data.type === "error")
          worker.terminate();
      };
      worker.onerror = (e) => {
        send({ type: "error", text: "Runner error: " + e.message });
        worker.terminate();
      };
      worker.postMessage(event.data);
    } catch (error) {
      send({ type: "error", text: "Runner unavailable: " + error.message });
    }
  });
  parent.postMessage({ type: "ready" }, "*");
}
const COURSE_RUNNER_HTML =
  "<!doctype html><meta charset=\"utf-8\"><meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob:; worker-src blob:; connect-src 'none';\"><script>(" +
  courseFrameMain.toString() +
  ")(" + executePracticeChecks.toString() + "," + createCheckObserver.toString() + ");<\/script>";
function runCourseCode() {
  const lesson = activeLesson();
  const practice = lesson && activePractice(lesson);
  if (!practice || practice.exercise.kind !== "code") return;
  const editor = document.getElementById("course-editor");
  if (!editor) return;
  stopCourseRun();
  showPracticeFeedback(null);
  const { state: s, exercise, extraId } = practice;
  s.code = editor.value;
  persist();
  const output = document.getElementById("course-console");
  output.textContent = "";
  output.classList.remove("has-error");
  document.getElementById("practice-status").textContent =
    "Running your code and checking the results…";
  document.getElementById("practice-status").classList.remove("success");
  document.getElementById("course-run").disabled = true;
  document.getElementById("course-stop").disabled = false;
  document.getElementById("exercise-checks").innerHTML = exercise.tests
    .map((t) => "<li>○ " + escapeHTML(t.label) + "</li>")
    .join("");
  const frame = document.createElement("iframe");
  frame.hidden = true;
  frame.setAttribute("sandbox", "allow-scripts");
  frame.setAttribute("title", "Isolated JavaScript practice");
  courseRun = {
    frame,
    token: Date.now() + "-" + Math.random(),
    lesson,
    exercise,
    extraId,
    code: s.code,
  };
  frame.srcdoc = COURSE_RUNNER_HTML;
  document.body.append(frame);
  courseRunTimer = setTimeout(() => {
    if (!courseRun) return;
    output.textContent +=
      "\nStopped after 3 seconds. Check your loop condition and update.";
    output.classList.add("has-error");
    showPracticeFeedback(timeoutFeedback);
    stopCourseRun("Time limit reached. Revise your code and try again.");
  }, 3000);
}
window.addEventListener("message", (event) => {
  if (
    !courseRun ||
    event.source !== courseRun.frame.contentWindow ||
    !event.data
  )
    return;
  const data = event.data,
    run = courseRun;
  if (data.type === "ready") {
    run.frame.contentWindow.postMessage(
      {
        type: "run",
        token: run.token,
        code: run.code,
        tests: run.exercise.tests,
      },
      "*",
    );
    return;
  }
  if (data.token !== run.token) return;
  const output = document.getElementById("course-console");
  if (!output) {
    stopCourseRun();
    return;
  }
  if (data.type === "log") {
    output.textContent +=
      (output.textContent ? "\n" : "") + String(data.text).slice(0, 4000);
    return;
  }
  if (data.type === "error") {
    output.textContent += (output.textContent ? "\n" : "") + String(data.text);
    output.classList.add("has-error");
    const feedback = explainPracticeError(data.error);
    showPracticeFeedback({ ...feedback, technical: data.error?.message || String(data.text) });
    stopCourseRun(
      "The code stopped. Start with the explanation and hint below.",
    );
    return;
  }
  if (data.type === "results") {
    const results = Array.isArray(data.results) ? data.results : [],
      tests = run.exercise.tests;
    const passed = tests.every((_, i) =>
      results.some((r) => r.index === i && r.pass === true),
    );
    document.getElementById("exercise-checks").innerHTML = tests
      .map((t, i) => {
        const r = results.find((r) => r.index === i);
        return `<li class="${r?.pass ? "pass" : "fail"}">${r?.pass ? "✓" : "↺"} ${escapeHTML(t.label)}${r?.error ? ' — could not check yet' : ''}</li>`;
      })
      .join("");
    if (!output.textContent)
      output.textContent = "Finished with no console output.";
    if (!passed) {
      const index = tests.findIndex((_, i) => !results.some(r => r.index === i && r.pass));
      showPracticeFeedback(feedbackForResult(results.find(r => r.index === index), tests[index], run.exercise));
    }
    if (passed) {
      const state = run.extraId ? extraState(run.lesson, run.exercise) : lessonState(run.lesson);
      state.passed = true;
      persist();
      if (run.extraId) {
        document.querySelectorAll('[data-extra-count]').forEach(el => { el.textContent = extraCount(run.lesson); });
        const completed = document.querySelector('[data-extra-completion]');
        if (completed) completed.textContent = '✓ Completed';
      } else showPracticePassed();
    }
    stopCourseRun(
      passed
        ? run.extraId ? "✓ Extra exercise completed. Try another, or continue to the next lesson whenever you’re ready." : "✓ All checks passed. You’re ready for the quiz."
        : `${tests.filter((_, i) => results.some(r => r.index === i && r.pass)).length} of ${tests.length} checks passed. Start with the feedback below.`,
    );
    document
      .getElementById("practice-status")
      .classList.toggle("success", passed);
  }
});
/* 11. COURSE INTERACTIONS — navigation, practice controls and quiz submission. */
document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.hasAttribute("data-welcome-example")) {
    openRunner(welcomeExample);
    return;
  }
  if (button.hasAttribute("data-welcome-account")) {
    $("#account-button").click();
    return;
  }
  if (button.dataset.lesson) {
    stopCourseRun();
    courseUndoCode = null;
    progress.course.last = button.dataset.lesson;
    persist();
    navigate("lesson-" + button.dataset.lesson);
    focusLesson();
    return;
  }
  const lesson = activeLesson();
  if (!lesson) return;
  const s = lessonState(lesson);
  if (button.hasAttribute('data-extra-hub') || button.hasAttribute('data-extra')) {
    const id = button.dataset.extra;
    if (id && !lesson.extras.some(ex => ex.id === id)) return;
    s.extraSelected = id || null;
    changeLessonStep(4);
    return;
  }
  if (button.hasAttribute('data-retry-extra')) {
    const practice = activePractice(lesson);
    if (!practice?.extraId) return;
    practice.state.choice = null;
    practice.state.submitted = false;
    persist();
    render();
    document.querySelector('#extra-choice input')?.focus();
    return;
  }
  if (button.hasAttribute('data-run-lesson-example')) {
    const part = lesson.steps[Number(button.dataset.runLessonExample)];
    if (part?.language === 'javascript') openRunner({ title: part.title, code: part.code });
    return;
  }
  if (button.hasAttribute("data-step")) {
    changeLessonStep(Number(button.dataset.step));
    return;
  }
  if (button.hasAttribute("data-continue")) {
    s.read = [...new Set([...s.read, s.step])];
    changeLessonStep(Math.min(s.step + 1, 3));
    return;
  }
  if (button.hasAttribute("data-check")) {
    runCourseCode();
    return;
  }
  if (button.hasAttribute("data-stop")) {
    stopCourseRun("Stopped. You can edit and run again.");
    return;
  }
  if (button.hasAttribute("data-reset-code")) {
    stopCourseRun();
    showPracticeFeedback(null);
    const practice = activePractice(lesson);
    if (!practice) return;
    const draft = practice.state;
    const editor = document.getElementById("course-editor");
    const undoing = button.dataset.undo === "true";
    if (undoing) {
      editor.value = courseUndoCode ?? draft.code;
      button.textContent = "Reset code";
      delete button.dataset.undo;
    } else {
      courseUndoCode = editor.value;
      editor.value = practice.exercise.starter;
      button.textContent = "Undo reset";
      button.dataset.undo = "true";
    }
    draft.code = editor.value;
    persist();
    document.getElementById("practice-status").textContent = undoing
      ? "Your previous code was restored."
      : "Starter code restored. You can undo this reset.";
    return;
  }
  if (button.hasAttribute("data-order")) {
    const i = Number(button.dataset.order);
    if (!s.order.includes(i)) s.order.push(i);
    persist();
    render();
    return;
  }
  if (button.hasAttribute("data-reset-order")) {
    s.order = [];
    persist();
    render();
    return;
  }
  if (button.hasAttribute("data-check-order")) {
    const correct =
      JSON.stringify(s.order) === JSON.stringify(lesson.exercise.answer);
    if (correct) {
      s.passed = true;
      persist();
      showPracticePassed();
    }
    const status = document.getElementById("practice-status");
    status.textContent = correct
      ? "✓ Correct: stage → commit locally → push to the remote."
      : s.order.length < 3
        ? "Choose all three commands before checking."
        : "Not quite. Stage first, commit second, then push. Start over and try again.";
    status.classList.toggle("success", correct);
    return;
  }
  if (button.hasAttribute("data-retry-quiz")) {
    s.answers = [null, null, null];
    s.submitted = false;
    persist();
    render();
    focusLesson();
  }
});
document.addEventListener("input", (event) => {
  if (event.target.id !== "course-editor") return;
  const lesson = activeLesson();
  if (!lesson) return;
  const practice = activePractice(lesson);
  if (!practice) return;
  practice.state.code = event.target.value;
  // Capture every keystroke locally; cloud writes are debounced in progress-sync.js.
  persist();
  const label = document.getElementById("course-save-status");
  label.textContent = "Saving…";
  clearTimeout(courseDraftTimer);
  courseDraftTimer = setTimeout(() => {
    if (document.getElementById("course-save-status"))
      document.getElementById("course-save-status").textContent = storageOK
        ? "Saved locally"
        : "Session only";
  }, 250);
});
document.addEventListener("change", (event) => {
  if (event.target.matches('#extra-choice input[type="radio"]')) {
    const lesson = activeLesson();
    const practice = lesson && activePractice(lesson);
    if (!practice?.extraId || practice.state.submitted) return;
    practice.state.choice = Number(event.target.value);
    persist();
    return;
  }
  if (!event.target.matches('#lesson-quiz input[type="radio"]')) return;
  const lesson = activeLesson();
  if (!lesson) return;
  const s = lessonState(lesson);
  if (s.submitted) return;
  const index = Number(event.target.name.split("-")[1]);
  s.answers[index] = Number(event.target.value);
  persist();
});
document.addEventListener("submit", (event) => {
  if (event.target.id === 'extra-choice') {
    event.preventDefault();
    const lesson = activeLesson();
    const practice = lesson && activePractice(lesson);
    if (!practice?.extraId || practice.state.submitted) return;
    if (practice.state.choice === null) {
      document.getElementById('extra-choice-notice').textContent = 'Choose an answer before checking.';
      document.querySelector('#extra-choice input')?.focus();
      return;
    }
    practice.state.submitted = true;
    practice.state.passed ||= practice.state.choice === practice.exercise.answer;
    persist();
    render();
    document.querySelector('[data-retry-extra]')?.focus();
    return;
  }
  if (event.target.id !== "lesson-quiz") return;
  event.preventDefault();
  const lesson = activeLesson(),
    s = lessonState(lesson);
  if (s.submitted) return;
  if (s.answers.some((a) => a === null)) {
    document.getElementById("quiz-notice").textContent =
      "Choose an answer for all three questions before checking.";
    document
      .querySelector(
        `[name="question-${s.answers.findIndex((a) => a === null)}"]`,
      )
      ?.focus();
    return;
  }
  const score = lesson.quiz.reduce(
    (n, q, i) => n + (s.answers[i] === q.answer),
    0,
  );
  s.best = Math.max(s.best, score);
  s.submitted = true;
  persist();
  render();
  document
    .querySelector(".quiz-result")
    ?.scrollIntoView({ behavior: "smooth", block: "center" });
});
document.addEventListener("keydown", (event) => {
  if (event.target.id !== "course-editor") return;
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    runCourseCode();
  }
  // Leave Tab available for normal keyboard navigation.
});
window.addEventListener("pagehide", () => {
  clearTimeout(courseDraftTimer);
  persist();
  stopCourseRun();
});

/* 12. START THE APP
  Apply saved reading preferences, update counters, and open the requested page.
*/
bindConsolePractice({ getProgress: () => progress.consolePractice,
  active: () => currentView === 'console' && !query && !accounts?.loading,
  persist, render, copyText });
problemPractice = bindProblemPractice({ getProgress: () => progress.problemPractice,
  active: () => currentView === 'problems' && !query && !accounts?.loading,
  persist, render, copyText, runnerHTML: COURSE_RUNNER_HTML });
applySettings();
updateProgress();
const initial = readHash();
navigate(validView(initial) ? initial : "start", false);
accounts = createAccounts({
  getProgress: () => validateProgress(progress),
  getGuest(onlyMeaningful = false) {
    try {
      const guest = validateProgress(JSON.parse(localStorage.getItem(KEY)));
      if (!onlyMeaningful) return guest;
      // Rendering the dashboard creates untouched lesson defaults. Do not import
      // those over real drafts already saved in an account.
      for (const lesson of COURSE.lessons) {
        for (const key of lessonProgressKeys(lesson)) {
        const s = guest.course.lessons[key];
        if (s && !hasLessonWork(s, initialLessonCode(lesson, key))) {
          delete guest.course.lessons[key];
        }
        }
      }
      return guest.saved.length || guest.done.length || Object.keys(guest.course.lessons).length || Object.keys(guest.consolePractice.answers).length || Object.keys(guest.problemPractice.challenges).length ? guest : null;
    } catch { return null; }
  },
  applyProgress(value, { resume }) {
    stopCourseRun();
    problemPractice?.reset();
    clearTimeout(courseDraftTimer);
    const focused = document.activeElement;
    const editorFocused = ['course-editor', 'problem-editor'].includes(focused?.id);
    const editorId = editorFocused ? focused.id : null;
    const selection = editorFocused ? [focused.selectionStart, focused.selectionEnd] : null;
    progress = validateProgress(value);
    applySettings();
    updateProgress();
    updateCourseBadge();
    if (resume && !['start', 'console', 'problems'].includes(currentView)) navigate('lesson-' + progress.course.last);
    else render();
    if (editorFocused && document.getElementById(editorId)) {
      document.getElementById(editorId).focus();
      document.getElementById(editorId).setSelectionRange(...selection);
    }
  },
  setBusy(busy) {
    if (busy) problemPractice?.reset();
    document.body.classList.toggle('account-loading', busy);
    $('#main').inert = busy;
    $('#study-sidebar').inert = busy || (mobileView.matches && !document.body.classList.contains('nav-open'));
    document.querySelectorAll('.topbar > :not(.account-control)').forEach(element => { element.inert = busy; });
    if (busy) document.querySelectorAll('dialog[open]:not(#account-dialog)').forEach(dialog => dialog.close());
  },
});
void accounts.start();
