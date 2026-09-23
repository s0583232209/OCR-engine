export interface OCRWord {
  text: string;
  box: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalized to 0-1000
}

export interface LeetCodeEvaluation {
  problemName: string;
  problemUrl: string;
  correctnessScore: number;
  complexityScore: number;
  readabilityScore: number;
  totalGrade: number;
  correctnessFeedback: string;
  complexityFeedback: string;
  readabilityFeedback: string;
  timeComplexity: string;
  spaceComplexity: string;
  optimizedCode: string;
  optimizedTimeComplexity: string;
  optimizedSpaceComplexity: string;
  language: string;
}

export interface PreloadedSample {
  id: string;
  title: string;
  studentName: string;
  email: string;
  language: string;
  lines: string[];
  transcription: string;
  words: OCRWord[];
  evaluation: LeetCodeEvaluation;
}

export const PRELOADED_SAMPLES: PreloadedSample[] = [
  {
    id: "sample-1",
    title: "Reverse Linked List",
    studentName: "Esti Toledano",
    email: "Esti.Toledano@grunitech.com",
    language: "python",
    lines: [
      "Esti Toledano",
      "Esti.Toledano@grunitech.com",
      "",
      "class Solution:",
      "    def revesList(self, head: Optional[ListNode]) -> Optional[ListNode]:",
      "        prev = None",
      "        curr = head",
      "        while curr is not None:",
      "            next_node = curr.next",
      "            curr.next = prev",
      "            prev = curr",
      "            curr = next_node",
      "        return prev"
    ],
    transcription: "class Solution:\n    def revesList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        prev = None\n        curr = head\n        while curr is not None:\n            next_node = curr.next\n            curr.next = prev\n            prev = curr\n            curr = next_node\n        return prev",
    words: [
      { text: "Esti", box: [65, 140, 100, 200] },
      { text: "Toledano", box: [65, 210, 100, 360] },
      { text: "Esti.Toledano@grunitech.com", box: [105, 140, 140, 520] },
      { text: "class", box: [180, 160, 215, 240] },
      { text: "Solution:", box: [180, 255, 215, 380] },
      { text: "def", box: [215, 210, 250, 260] },
      { text: "revesList", box: [215, 275, 250, 410] },
      { text: "(self,", box: [215, 415, 250, 490] },
      { text: "head:", box: [215, 500, 250, 570] },
      { text: "Optional[ListNode])", box: [215, 580, 250, 800] },
      { text: "->", box: [215, 810, 250, 845] },
      { text: "Optional[ListNode]:", box: [215, 855, 250, 1000] },
      { text: "prev", box: [255, 270, 288, 335] },
      { text: "=", box: [255, 345, 288, 365] },
      { text: "None", box: [255, 375, 288, 435] },
      { text: "curr", box: [288, 270, 320, 335] },
      { text: "=", box: [288, 345, 320, 365] },
      { text: "head", box: [288, 375, 320, 440] },
      { text: "while", box: [320, 270, 352, 345] },
      { text: "curr", box: [320, 360, 352, 420] },
      { text: "is", box: [320, 430, 352, 460] },
      { text: "not", box: [320, 470, 352, 515] },
      { text: "None:", box: [320, 530, 352, 605] },
      { text: "next_node", box: [352, 340, 385, 470] },
      { text: "=", box: [352, 480, 385, 500] },
      { text: "curr.next", box: [352, 510, 385, 630] },
      { text: "curr.next", box: [385, 340, 418, 460] },
      { text: "=", box: [385, 475, 418, 495] },
      { text: "prev", box: [385, 510, 418, 570] },
      { text: "prev", box: [418, 340, 450, 400] },
      { text: "=", box: [418, 415, 450, 435] },
      { text: "curr", box: [418, 450, 450, 510] },
      { text: "curr", box: [450, 340, 482, 400] },
      { text: "=", box: [450, 415, 482, 435] },
      { text: "next_node", box: [450, 450, 482, 580] },
      { text: "return", box: [480, 310, 515, 395] },
      { text: "prev", box: [480, 415, 515, 480] }
    ],
    evaluation: {
      problemName: "206. Reverse Linked List",
      problemUrl: "https://leetcode.com/problems/reverse-linked-list/",
      correctnessScore: 46,
      complexityScore: 30,
      readabilityScore: 17,
      totalGrade: 93,
      timeComplexity: "O(N)",
      spaceComplexity: "O(1)",
      correctnessFeedback: `The algorithm is **logically perfect** and correctly implements the standard iterative 3-pointer reversal of a singly linked list. It successfully handles edge cases, such as an empty list (\`head = None\`) and a list with a single node.

### ⚠️ Interface & Syntax Warnings
* **Spelling typo in method name**: The method is declared as \`revesList\` instead of \`reverseList\`. While perfectly valid Python syntactically, this will fail LeetCode's automated grading environment because it expects the exact name \`reverseList\` defined by the template class.
* **Typing imports**: Note that \`Optional\` requires importing from the \`typing\` module (\`from typing import Optional\`). In whiteboard interviews, this is typically excused, but in code execution, it will fail without the import.`,
      complexityFeedback: `### 🚀 Optimal Complexity Achieved!
* **Time Complexity**: **O(N)**, where **N** is the number of nodes in the linked list. The algorithm visits each node exactly once.
* **Space Complexity**: **O(1)** auxiliary space. The reversal is done in-place by altering node references rather than creating new nodes. This is the absolute optimal space footprint and is highly preferred over the recursive alternative, which uses **O(N)** call stack space.`,
      readabilityFeedback: `### 📝 Legibility & Handwriting Analysis
* **Outstanding Indentation**: You have written beautifully neat, consistent block indentations. In Python, where indentation represents code blocks, this is incredibly vital and hard to do consistently on paper!
* **Clean spacing**: Spacing between variables, assignments, and structural operators is excellent.
* **Self-correction**: There are no messy scribbles, indicating that the solution was well thought-out before putting pen to paper.`,
      optimizedCode: `from typing import Optional

# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        prev = None
        curr = head
        while curr is not None:
            next_node = curr.next
            curr.next = prev
            prev = curr
            curr = next_node
        return prev`,
      optimizedTimeComplexity: "O(N)",
      optimizedSpaceComplexity: "O(1)",
      language: "python"
    }
  },
  {
    id: "sample-2",
    title: "Valid Parentheses",
    studentName: "Esti Toledano",
    email: "Esti.Toledano@grunitech.com",
    language: "python",
    lines: [
      "Esti Toledano",
      "Esti.Toledano@grunitech.com",
      "",
      "class Solution:",
      "    def isValid(self, s: str) -> bool:",
      "        stack = []",
      "        matching = { '[': ']', '{': '}', '(': ')' }",
      "        for c in s:",
      "            if c in ['[', '{', '(']:",
      "                stack.append(c)",
      "            else:",
      "                if (len(stack) == 0):",
      "                    return False",
      "                last = stack.pop()",
      "                if (matching[last] != c):",
      "                    return False",
      "        return len(stack) == 0"
    ],
    transcription: "class Solution:\n    def isValid(self, s: str) -> bool:\n        stack = []\n        matching = { '[': ']', '{': '}', '(': ')' }\n        for c in s:\n            if c in ['[', '{', '(']:\n                stack.append(c)\n            else:\n                if (len(stack) == 0):\n                    return False\n                last = stack.pop()\n                if (matching[last] != c):\n                    return False\n        return len(stack) == 0",
    words: [
      { text: "Esti", box: [45, 180, 80, 240] },
      { text: "Toledano", box: [45, 250, 80, 400] },
      { text: "Esti.Toledano@grunitech.com", box: [85, 180, 115, 550] },
      { text: "class", box: [125, 140, 160, 220] },
      { text: "Solution:", box: [125, 235, 160, 360] },
      { text: "def", box: [150, 190, 185, 240] },
      { text: "isValid", box: [150, 255, 185, 360] },
      { text: "(self,", box: [150, 370, 185, 450] },
      { text: "s:str)", box: [150, 460, 185, 560] },
      { text: "->bool:", box: [150, 570, 185, 680] },
      { text: "stack", box: [200, 280, 230, 350] },
      { text: "=", box: [200, 365, 230, 385] },
      { text: "[]", box: [200, 400, 230, 440] },
      { text: "matching", box: [230, 280, 260, 400] },
      { text: "=", box: [230, 415, 260, 435] },
      { text: "{", box: [230, 450, 260, 465] },
      { text: "'[':", box: [230, 475, 260, 520] },
      { text: "']',", box: [230, 530, 260, 580] },
      { text: "'{':", box: [230, 595, 260, 640] },
      { text: "'}',", box: [230, 650, 260, 700] },
      { text: "'(':", box: [230, 715, 260, 760] },
      { text: "')'", box: [230, 770, 260, 810] },
      { text: "}", box: [230, 820, 260, 835] },
      { text: "for", box: [260, 280, 292, 325] },
      { text: "c", box: [260, 340, 292, 360] },
      { text: "in", box: [260, 375, 292, 410] },
      { text: "s:", box: [260, 425, 292, 460] },
      { text: "if", box: [292, 335, 322, 365] },
      { text: "c", box: [292, 380, 322, 400] },
      { text: "in", box: [292, 415, 322, 445] },
      { text: "['[',", box: [292, 460, 322, 530] },
      { text: "'{',", box: [292, 540, 322, 595] },
      { text: "'(']:", box: [292, 605, 322, 680] },
      { text: "stack.append(c)", box: [322, 390, 352, 570] },
      { text: "else:", box: [340, 335, 372, 410] },
      { text: "if", box: [362, 430, 392, 460] },
      { text: "(len(stack)", box: [362, 470, 392, 600] },
      { text: "==" , box: [362, 610, 392, 645] },
      { text: "0):", box: [362, 655, 392, 700] },
      { text: "return", box: [390, 480, 420, 560] },
      { text: "False", box: [390, 580, 420, 650] },
      { text: "last", box: [450, 435, 480, 495] },
      { text: "=", box: [450, 510, 480, 530] },
      { text: "stack.pop()", box: [450, 545, 480, 685] },
      { text: "if", box: [480, 455, 510, 485] },
      { text: "(matching[last]", box: [480, 495, 510, 675] },
      { text: "!=", box: [480, 690, 510, 725] },
      { text: "c):", box: [480, 740, 510, 785] },
      { text: "return", box: [510, 510, 542, 590] },
      { text: "False", box: [510, 610, 542, 685] },
      { text: "retun", box: [555, 335, 592, 420] },
      { text: "len(stack)", box: [555, 435, 592, 570] },
      { text: "==", box: [555, 580, 592, 615] },
      { text: "0", box: [555, 630, 592, 650] }
    ],
    evaluation: {
      problemName: "20. Valid Parentheses",
      problemUrl: "https://leetcode.com/problems/valid-parentheses/",
      correctnessScore: 35,
      complexityScore: 28,
      readabilityScore: 12,
      totalGrade: 75,
      timeComplexity: "O(N)",
      spaceComplexity: "O(N)",
      correctnessFeedback: `### ❌ Syntactic & Logical Failures

* **Fatal syntax error**: On the last line of the function, you wrote \`retun len(stack) == 0\` instead of \`return\`. In Python, this will trigger a \`NameError\` or \`SyntaxError\` at runtime as \`retun\` is an unrecognized identifier.
* **Double Bracket Lists**: In your conditional, \`if c in ['[', '{', '(']:\` is syntactically fine but contains a minor illegibility in handwriting, which might be read as nested brackets or double quotes.
* **Incorrect Stack Initialization**: There are several scribbles at the top of the function where you initially wrote another stack name and scratched it out. Planning your structure first is always highly recommended on standard paper.`,
      complexityFeedback: `### 📊 Complexity Assessment
* **Time Complexity**: **O(N)**, where **N** is the length of string \`s\`. We iterate through the string once. Dict lookups and stack pop/push operations are **O(1)**.
* **Space Complexity**: **O(N)**. In the worst-case scenario (e.g., input consists solely of opening brackets \`"(((((("\`), the stack size grows linearly with the input size.`,
      readabilityFeedback: `### 📝 Handwriting & Style Review
* **Messy Scratches**: There are 3 separate heavily scratched-out lines. On a whiteboard or paper, scribbling heavily looks disorganized. Draw a single clean line through crossed-out code to maintain a clean workspace.
* **Inconsistent Indentation**: Indentation inside the \`else\` block is slightly shifted, making the nesting of \`last = stack.pop()\` and the subsequent \`if\` condition somewhat ambiguous. In Python, strict whitespace discipline is vital.`,
      optimizedCode: `class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        # Mapping of closing brackets to their corresponding opening brackets
        matching = {")": "(", "}": "{", "]": "["}
        
        for char in s:
            if char in matching:
                # If stack is empty or top of stack doesn't match
                if not stack or stack.pop() != matching[char]:
                    return False
            else:
                # If it is an opening bracket, push to stack
                stack.append(char)
                
        return len(stack) == 0`,
      optimizedTimeComplexity: "O(N)",
      optimizedSpaceComplexity: "O(N)",
      language: "python"
    }
  }
];
