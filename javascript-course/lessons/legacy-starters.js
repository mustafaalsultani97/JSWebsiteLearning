// Used only to distinguish untouched old starter code from a learner draft.
export const legacyStarters = {
  "first-program": "// Write two console.log calls below.\n",
  "variables": "// Declare your three variables, then log them.\n",
  "arrays": "const foods = [\"pasta\", \"salad\", \"tacos\"];\n// Replace, append, then log.\n",
  "objects": "// Create phone, then change its properties.\n",
  "debugging": "const order = { price: \"14\", delivery: 4 };\nconst total = order.Price;\nconsole.log(total);",
  "git": "",
  "conditions": "const age = 13;\nconst hasTicket = true;\nconst withAdult = true;\n// Define canEnter and choose an output.\n",
  "switch": "const weather = \"rain\";\nlet advice;\n// Write a switch and then log advice.\n",
  "for-loop": "// Write your countdown loop here.\n",
  "while-loop": "let battery = 3;\nconst readings = [];\n// Add your while loop.\n",
  "for-of": "const cart = [\"milk\", \"candy\", \"bread\", \"candy\"];\nconst messages = [];\n// Fill messages, then log each message.\n",
  "function-forms": "const double = (value) => {\n  // Return the doubled value.\n};\nconsole.log(double(4));\nconsole.log(double(7));",
  "parameters": "const welcome = (name, title = \"Member\") => {\n  // Return your greeting.\n};\nconsole.log(welcome(\"Iris\", \"Admin\"));\nconsole.log(welcome(\"Omar\"));",
  "scope": "function result(points) {\n  if (points >= 50) {\n    const label = \"Passed\";\n  }\n  return label;\n}\nconsole.log(result(60));",
  "averages": "const average = (scores) => {\n  // Handle an empty list.\n  // Add the values and return their mean.\n};\nconsole.log(average([12, 18, 15, 19]));",
  "vip-project": "const customers = [\n  { name: \"Eli\", isVip: true, spent: 200 },\n  { name: \"Sam\", isVip: false, spent: 150 },\n  { name: \"Lina\", isVip: true, spent: 80 }\n];\nconst getVipDeals = (customers) => {\n  // Select VIPs and build a new array.\n};\nconsole.log(getVipDeals(customers));",
  "callbacks": "const uppercase = (text) => {\n  // Return capital letters.\n};\nconst quote = (text) => {\n  // Return text wrapped in double quotes.\n};\nconst formatText = (text, callback) => {\n  // Use the callback passed in.\n};\nconsole.log(formatText(\"hello\", uppercase));\nconsole.log(formatText(\"hello\", quote));",
  "array-filter": "const aboveLimit = (numbers, limit) => {\n  // Return the filtered array.\n};\nconsole.log(aboveLimit([6, 14, 10, 21], 10));",
  "array-map-pipeline": "const boostLarge = (numbers) => {\n  // First select, then transform.\n};\nconsole.log(boostLarge([6, 14, 10, 21]));",
  "modular-helpers": "const formatEmail = (text) => {\n  // Remove surrounding spaces and lowercase the text.\n};\nconst hasAtSign = (text) => {\n  // Return a boolean.\n};\nconst cleanContacts = (list) => {\n  // Combine the two helpers.\n};\nconsole.log(cleanContacts([\" HELLO@EXAMPLE.COM \", \"missing\", \" Team@Example.org \"]));",
  "ai-refactoring": "// A flawed suggestion: review its behavior before keeping it.\nconst saleLabels = (products) => products\n  .filter(product => product.price >= 10)\n  .map(product => {\n    product.price -= 2;\n  });\n\nconsole.log(saleLabels([{ name: \"Pen\", price: 10 }, { name: \"Book\", price: 24 }]));"
};
