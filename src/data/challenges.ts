export interface TestCase {
  input: unknown[];
  expected: unknown;
  label: string;
}

export interface Challenge {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  functionName: string;
  starterCode: string;
  solution: string;
  testCases: TestCase[];
  timeLimit: number; // seconds
  keystrokes: string[]; // pre-recorded keystroke array for replay
}

export const challenges: Challenge[] = [
  {
    id: 'reverse-string',
    title: 'Reverse String',
    difficulty: 'easy',
    description: 'Write a function that reverses a string.',
    functionName: 'reverseString',
    starterCode: 'function reverseString(str) {\n  // your code here\n}',
    solution: 'function reverseString(str) {\n  return str.split("").reverse().join("");\n}',
    testCases: [
      { input: ['hello'], expected: 'olleh', label: 'reverseString("hello") === "olleh"' },
      { input: ['world'], expected: 'dlrow', label: 'reverseString("world") === "dlrow"' },
      { input: [''], expected: '', label: 'reverseString("") === ""' },
      { input: ['a'], expected: 'a', label: 'reverseString("a") === "a"' },
    ],
    timeLimit: 120,
    keystrokes: [
      'function reverseString(str) {\n',
      '  return str',
      '.split("")',
      '.reverse()',
      '.join("");\n',
      '}',
    ],
  },
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'medium',
    description: 'Given an array of numbers and a target, return indices of two numbers that add up to the target.',
    functionName: 'twoSum',
    starterCode: 'function twoSum(nums, target) {\n  // your code here\n}',
    solution: 'function twoSum(nums, target) {\n  const map = {};\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map[complement] !== undefined) {\n      return [map[complement], i];\n    }\n    map[nums[i]] = i;\n  }\n  return [];\n}',
    testCases: [
      { input: [[2, 7, 11, 15], 9], expected: [0, 1], label: 'twoSum([2,7,11,15], 9) === [0,1]' },
      { input: [[3, 2, 4], 6], expected: [1, 2], label: 'twoSum([3,2,4], 6) === [1,2]' },
      { input: [[3, 3], 6], expected: [0, 1], label: 'twoSum([3,3], 6) === [0,1]' },
    ],
    timeLimit: 180,
    keystrokes: [
      'function twoSum(nums, target) {\n',
      '  const map = {};\n',
      '  for (let i = 0; i < nums.length; i++) {\n',
      '    const complement = target - nums[i];\n',
      '    if (map[complement] !== undefined) {\n',
      '      return [map[complement], i];\n',
      '    }\n',
      '    map[nums[i]] = i;\n',
      '  }\n',
      '  return [];\n',
      '}',
    ],
  },
  {
    id: 'palindrome',
    title: 'Palindrome Check',
    difficulty: 'easy',
    description: 'Write a function that checks if a string is a palindrome (ignoring case and non-alphanumeric characters).',
    functionName: 'isPalindrome',
    starterCode: 'function isPalindrome(str) {\n  // your code here\n}',
    solution: 'function isPalindrome(str) {\n  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, "");\n  return cleaned === cleaned.split("").reverse().join("");\n}',
    testCases: [
      { input: ['racecar'], expected: true, label: 'isPalindrome("racecar") === true' },
      { input: ['hello'], expected: false, label: 'isPalindrome("hello") === false' },
      { input: ['A man a plan a canal Panama'], expected: true, label: 'isPalindrome("A man a plan...") === true' },
      { input: [''], expected: true, label: 'isPalindrome("") === true' },
    ],
    timeLimit: 120,
    keystrokes: [
      'function isPalindrome(str) {\n',
      '  const cleaned = str.toLowerCase()',
      '.replace(/[^a-z0-9]/g, "");\n',
      '  return cleaned === cleaned',
      '.split("").reverse().join("");\n',
      '}',
    ],
  },
  {
    id: 'fizzbuzz',
    title: 'FizzBuzz',
    difficulty: 'easy',
    description: 'Write a function that returns an array from 1 to n. For multiples of 3 use "Fizz", multiples of 5 use "Buzz", multiples of both use "FizzBuzz".',
    functionName: 'fizzBuzz',
    starterCode: 'function fizzBuzz(n) {\n  // your code here\n}',
    solution: 'function fizzBuzz(n) {\n  const result = [];\n  for (let i = 1; i <= n; i++) {\n    if (i % 15 === 0) result.push("FizzBuzz");\n    else if (i % 3 === 0) result.push("Fizz");\n    else if (i % 5 === 0) result.push("Buzz");\n    else result.push(i);\n  }\n  return result;\n}',
    testCases: [
      { input: [5], expected: [1, 2, 'Fizz', 4, 'Buzz'], label: 'fizzBuzz(5)' },
      { input: [15], expected: [1, 2, 'Fizz', 4, 'Buzz', 'Fizz', 7, 8, 'Fizz', 'Buzz', 11, 'Fizz', 13, 14, 'FizzBuzz'], label: 'fizzBuzz(15)' },
      { input: [1], expected: [1], label: 'fizzBuzz(1)' },
    ],
    timeLimit: 150,
    keystrokes: [
      'function fizzBuzz(n) {\n',
      '  const result = [];\n',
      '  for (let i = 1; i <= n; i++) {\n',
      '    if (i % 15 === 0) result.push("FizzBuzz");\n',
      '    else if (i % 3 === 0) result.push("Fizz");\n',
      '    else if (i % 5 === 0) result.push("Buzz");\n',
      '    else result.push(i);\n',
      '  }\n',
      '  return result;\n',
      '}',
    ],
  },
  {
    id: 'flatten-array',
    title: 'Flatten Array',
    difficulty: 'medium',
    description: 'Write a function that flattens a nested array to a single level.',
    functionName: 'flattenArray',
    starterCode: 'function flattenArray(arr) {\n  // your code here\n}',
    solution: 'function flattenArray(arr) {\n  const result = [];\n  function flatten(items) {\n    for (const item of items) {\n      if (Array.isArray(item)) flatten(item);\n      else result.push(item);\n    }\n  }\n  flatten(arr);\n  return result;\n}',
    testCases: [
      { input: [[[1, [2, [3, 4], 5]]]], expected: [1, 2, 3, 4, 5], label: 'flattenArray([1,[2,[3,4],5]])' },
      { input: [[[1, 2, 3]]], expected: [1, 2, 3], label: 'flattenArray([1,2,3])' },
      { input: [[[]]], expected: [], label: 'flattenArray([])' },
    ],
    timeLimit: 180,
    keystrokes: [
      'function flattenArray(arr) {\n',
      '  const result = [];\n',
      '  function flatten(items) {\n',
      '    for (const item of items) {\n',
      '      if (Array.isArray(item)) flatten(item);\n',
      '      else result.push(item);\n',
      '    }\n',
      '  }\n',
      '  flatten(arr);\n',
      '  return result;\n',
      '}',
    ],
  },
];
