/**
 * PromptShield Lint Rules
 *
 * 8-Point Quality Check implementation:
 * - Base 6 dimensions (always evaluated)
 * - Extended 2 dimensions (evaluated when applicable)
 *
 * Scoring: 0 = missing, 1 = weak/partial, 2 = complete
 */

/**
 * ROLE - AI role/persona definition
 * Keywords: you are, act as, role:, persona:, assistant, expert
 */
const ROLE = {
  patterns: {
    strong: [
      /you are (a|an) [a-z]+ (senior|expert|experienced|professional)/i,
      /you are (a|an) (senior|expert|experienced|professional)/i,
      /act as (a|an) (senior|expert|experienced|professional)/i,
      /act as (a|an) [a-z]+ (specialist|engineer|developer|analyst)/i,
      /act as (a|an) (expert|senior) [a-z]+ (analyst|developer|engineer)/i,
      /role:\s*[a-z]/i,
      /persona:\s*[a-z]/i
    ],
    weak: [
      /you are/i,
      /act as/i,
      /역할[:：]/i,
      /전문가/,
      /assistant/i
    ]
  },

  check(content, normalized) {
    // Check for strong patterns first
    for (const p of this.patterns.strong) {
      if (p.test(content)) {
        return { score: 2, message: 'Clear role definition with expertise level' };
      }
    }

    // Check for weak patterns
    for (const p of this.patterns.weak) {
      if (p.test(content)) {
        return { score: 1, message: 'Role mentioned but lacks specificity' };
      }
    }

    return { score: 0, message: 'No role definition found' };
  },

  suggestions: [
    'Add "You are a [specific role]..." at the beginning',
    'Include expertise level (senior, expert, experienced)',
    'Specify domain knowledge (e.g., "with 10 years of experience in...")'
  ]
};

/**
 * CONTEXT - Background, domain, constraints
 * Keywords: context:, background:, given:, domain, ## Context
 */
const CONTEXT = {
  patterns: {
    strong: [
      /##\s*context/i,
      /context:\s*\n/i,
      /background:\s*\n/i,
      /##\s*배경/,
      /domain:\s*[a-z]/i,
      /tech stack:\s*[a-z]/i
    ],
    weak: [
      /context/i,
      /background/i,
      /given/i,
      /맥락/,
      /배경/,
      /제약/
    ]
  },

  check(content, normalized) {
    for (const p of this.patterns.strong) {
      if (p.test(content)) {
        return { score: 2, message: 'Structured context section present' };
      }
    }

    for (const p of this.patterns.weak) {
      if (p.test(content)) {
        return { score: 1, message: 'Context mentioned but not structured' };
      }
    }

    return { score: 0, message: 'No context/background information' };
  },

  suggestions: [
    'Add a "## Context" section',
    'Specify domain, tech stack, and constraints',
    'Include target users and use case'
  ]
};

/**
 * INSTRUCTION - Clear task definition
 * Keywords: instruction:, task:, steps:, ## Instructions, your goal
 */
const INSTRUCTION = {
  patterns: {
    strong: [
      /##\s*instructions?/i,
      /##\s*task/i,
      /##\s*steps/i,
      /##\s*지시/,
      /your (task|goal|job) is to/i,
      /please (do|perform|execute|complete)/i,
      /step\s*\d+[:.]/i,
      /1\.\s+[A-Z]/
    ],
    weak: [
      /instruction/i,
      /task/i,
      /step/i,
      /지시/,
      /작업/,
      /해줘/,
      /해주세요/
    ]
  },

  check(content, normalized) {
    for (const p of this.patterns.strong) {
      if (p.test(content)) {
        return { score: 2, message: 'Clear structured instructions' };
      }
    }

    // Check for numbered steps
    const numberedSteps = content.match(/^\s*\d+[.)]\s+/gm);
    if (numberedSteps && numberedSteps.length >= 3) {
      return { score: 2, message: 'Multi-step instructions present' };
    }

    for (const p of this.patterns.weak) {
      if (p.test(content)) {
        return { score: 1, message: 'Instructions present but lack structure' };
      }
    }

    return { score: 0, message: 'No clear instructions found' };
  },

  suggestions: [
    'Add a "## Instructions" section',
    'Use numbered steps for complex tasks',
    'Avoid vague terms like "잘", "적당히", "깔끔하게"'
  ]
};

/**
 * EXAMPLE - Input-output examples (Few-shot)
 * Keywords: example:, for instance, e.g., input:, output:, code blocks
 */
const EXAMPLE = {
  patterns: {
    strong: [
      /<example>/i,
      /##\s*examples?/i,
      /input:\s*.*\n.*output:/is,
      /예시\s*\d+/
    ],
    weak: [
      /example/i,
      /for instance/i,
      /e\.g\./i,
      /예[시를들]/,
      /```/
    ]
  },

  check(content, normalized) {
    // Count code blocks (potential examples)
    const codeBlocks = content.match(/```[\s\S]*?```/g) || [];

    // Count example-like patterns
    const exampleMatches = content.match(/<example>[\s\S]*?<\/example>/gi) || [];
    const inputOutputPairs = content.match(/input:[\s\S]*?output:/gi) || [];

    const totalExamples = exampleMatches.length + inputOutputPairs.length;

    // Strong: 3+ structured examples
    if (totalExamples >= 3) {
      return { score: 2, message: `${totalExamples} structured examples found` };
    }

    // Check for strong patterns
    for (const p of this.patterns.strong) {
      if (p.test(content)) {
        return { score: 2, message: 'Example section present' };
      }
    }

    // Weak: some examples or code blocks
    if (totalExamples >= 1 || codeBlocks.length >= 2) {
      return { score: 1, message: 'Some examples present but could be more structured' };
    }

    for (const p of this.patterns.weak) {
      if (p.test(content)) {
        return { score: 1, message: 'Example mentioned but not structured' };
      }
    }

    return { score: 0, message: 'No examples found' };
  },

  suggestions: [
    'Add 3-5 input-output example pairs',
    'Use <example> tags for structured examples',
    'Include edge cases in examples'
  ]
};

/**
 * FORMAT - Output format specification
 * Keywords: format:, output:, response:, ## Output Format, JSON schema
 */
const FORMAT = {
  patterns: {
    strong: [
      /##\s*output\s*format/i,
      /##\s*format/i,
      /##\s*출력\s*형식/,
      /return (a |an )?(valid )?json/i,
      /respond with (a |an )?(valid )?json/i,
      /\{\s*"[a-z_]+"\s*:/i,
      /type:\s*(string|number|boolean|array|object)/i
    ],
    weak: [
      /format/i,
      /output/i,
      /response/i,
      /형식/,
      /출력/,
      /json/i,
      /markdown/i
    ]
  },

  check(content, normalized) {
    // Check for JSON schema-like structure
    const hasJsonSchema = /\{\s*"[a-z_]+"\s*:\s*"?(string|number|boolean|array)/i.test(content);
    if (hasJsonSchema) {
      return { score: 2, message: 'JSON schema/structure defined' };
    }

    for (const p of this.patterns.strong) {
      if (p.test(content)) {
        return { score: 2, message: 'Clear output format specification' };
      }
    }

    for (const p of this.patterns.weak) {
      if (p.test(content)) {
        return { score: 1, message: 'Format mentioned but lacks detail' };
      }
    }

    return { score: 0, message: 'No output format specified' };
  },

  suggestions: [
    'Add a "## Output Format" section',
    'Include JSON schema with field types',
    'Specify required vs optional fields'
  ]
};

/**
 * SUCCESS_CRITERIA - Measurable success conditions
 * Keywords: success, criteria, must, should, required, validation
 */
const SUCCESS_CRITERIA = {
  patterns: {
    strong: [
      /##\s*success\s*criteria/i,
      /##\s*성공\s*기준/,
      /##\s*검증/,
      /must (have|include|contain)/i,
      /required:\s*[a-z]/i,
      /\[ \]/,  // Checkbox pattern
      /validation:/i
    ],
    weak: [
      /success/i,
      /criteria/i,
      /must/i,
      /should/i,
      /required/i,
      /성공/,
      /기준/,
      /조건/
    ]
  },

  check(content, normalized) {
    // Check for checkbox-style requirements
    const checkboxes = content.match(/- \[ \]/g) || [];
    if (checkboxes.length >= 3) {
      return { score: 2, message: 'Structured success criteria with checkboxes' };
    }

    for (const p of this.patterns.strong) {
      if (p.test(content)) {
        return { score: 2, message: 'Clear success criteria defined' };
      }
    }

    // Check for measurable criteria
    const measurable = /\d+\s*(자|글자|characters?|words?|items?|%|점|점수)/i.test(content);
    if (measurable) {
      return { score: 1, message: 'Some measurable criteria present' };
    }

    for (const p of this.patterns.weak) {
      if (p.test(content)) {
        return { score: 1, message: 'Success criteria mentioned but vague' };
      }
    }

    return { score: 0, message: 'No success criteria defined' };
  },

  suggestions: [
    'Add a "## Success Criteria" section',
    'Use measurable conditions (length, count, format)',
    'Include validation methods'
  ]
};

/**
 * STATE_TRACKING - State management for long-running tasks
 * Only applicable for multi-step or long-running tasks
 */
const STATE_TRACKING = {
  patterns: {
    strong: [
      /##\s*state\s*tracking/i,
      /##\s*상태\s*관리/,
      /checkpoint/i,
      /"status":\s*"/i,
      /"processed":\s*\d/i,
      /state\.json/i
    ],
    weak: [
      /state/i,
      /tracking/i,
      /progress/i,
      /상태/,
      /진행/,
      /체크포인트/
    ]
  },

  applicabilityPatterns: [
    /multi-?step/i,
    /multiple (files?|items?|steps?)/i,
    /batch/i,
    /\d+ files?/i,
    /all (files?|items?)/i,
    /each (file|item|step)/i,
    /iterate/i,
    /loop/i,
    /long-?running/i,
    /장기/,
    /여러\s*(파일|항목|단계)/,
    /모든\s*(파일|항목)/
  ],

  isApplicable(content, normalized) {
    for (const p of this.applicabilityPatterns) {
      if (p.test(content)) {
        return { applicable: true, reason: 'Multi-step or batch task detected' };
      }
    }
    return { applicable: false, reason: 'Single-step task (STATE_TRACKING not required)' };
  },

  check(content, normalized) {
    for (const p of this.patterns.strong) {
      if (p.test(content)) {
        return { score: 2, message: 'Structured state tracking defined' };
      }
    }

    for (const p of this.patterns.weak) {
      if (p.test(content)) {
        return { score: 1, message: 'State tracking mentioned but incomplete' };
      }
    }

    return { score: 0, message: 'No state tracking for multi-step task' };
  },

  suggestions: [
    'Add checkpoint/resume mechanism',
    'Define state JSON structure',
    'Specify error recovery process'
  ]
};

/**
 * TOOL_USAGE - Tool usage instructions
 * Only applicable when tools are needed
 */
const TOOL_USAGE = {
  patterns: {
    strong: [
      /##\s*tool\s*usage/i,
      /##\s*도구\s*사용/,
      /병렬|순차/,
      /parallel|sequential/i,
      /use (glob|grep|read|edit|bash)/i,
      /도구\s*목록/
    ],
    weak: [
      /tool/i,
      /도구/,
      /glob/i,
      /grep/i,
      /read/i,
      /edit/i,
      /bash/i,
      /file/i,
      /파일/,
      /실행/,
      /execute/i
    ]
  },

  applicabilityPatterns: [
    /read (the |a )?file/i,
    /write (to |a )?file/i,
    /search (for |the )?file/i,
    /find (the |all )?file/i,
    /execute|run|bash/i,
    /api|request|fetch/i,
    /파일\s*(읽|쓰|찾|검색)/,
    /실행/,
    /명령/
  ],

  isApplicable(content, normalized) {
    for (const p of this.applicabilityPatterns) {
      if (p.test(content)) {
        return { applicable: true, reason: 'File/tool operation detected' };
      }
    }
    return { applicable: false, reason: 'No tool operations (TOOL_USAGE not required)' };
  },

  check(content, normalized) {
    for (const p of this.patterns.strong) {
      if (p.test(content)) {
        return { score: 2, message: 'Clear tool usage instructions' };
      }
    }

    for (const p of this.patterns.weak) {
      if (p.test(content)) {
        return { score: 1, message: 'Tool mentioned but usage unclear' };
      }
    }

    return { score: 0, message: 'No tool usage instructions for file/tool task' };
  },

  suggestions: [
    'Specify which tools to use',
    'Define parallel vs sequential execution',
    'Include error handling for tool failures'
  ]
};

module.exports = {
  ROLE,
  CONTEXT,
  INSTRUCTION,
  EXAMPLE,
  FORMAT,
  SUCCESS_CRITERIA,
  STATE_TRACKING,
  TOOL_USAGE
};
