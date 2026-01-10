#!/usr/bin/env node
/**
 * Prompt Smith - Prompt Registry MCP Server
 *
 * A local MCP server for managing prompt templates and quality metrics.
 *
 * Features:
 * - Store and retrieve prompt templates
 * - Track quality scores and versions
 * - Search prompts by tags and content
 *
 * Usage:
 *   node prompt-registry.js [--data-dir <path>]
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Data directory - defaults to plugin root
const DATA_DIR = process.env.PROMPT_REGISTRY_DATA ||
                 path.join(process.env.CLAUDE_PLUGIN_ROOT || __dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const REGISTRY_FILE = path.join(DATA_DIR, 'prompts.json');

// Load or initialize registry
function loadRegistry() {
  try {
    if (fs.existsSync(REGISTRY_FILE)) {
      return JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error(`[Registry] Error loading: ${e.message}`);
  }
  return { prompts: {}, version: '1.0.0' };
}

function saveRegistry(registry) {
  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2));
}

// MCP Protocol handlers
const tools = [
  {
    name: 'prompt_save',
    description: 'Save a prompt template to the registry with quality metadata',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Unique prompt name' },
        content: { type: 'string', description: 'Prompt content' },
        score: { type: 'number', description: 'Quality score (0-10)' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Tags for categorization' },
        description: { type: 'string', description: 'Brief description' }
      },
      required: ['name', 'content']
    }
  },
  {
    name: 'prompt_get',
    description: 'Retrieve a prompt template by name',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Prompt name to retrieve' }
      },
      required: ['name']
    }
  },
  {
    name: 'prompt_list',
    description: 'List all saved prompts with optional tag filter',
    inputSchema: {
      type: 'object',
      properties: {
        tag: { type: 'string', description: 'Filter by tag' },
        minScore: { type: 'number', description: 'Minimum quality score' }
      }
    }
  },
  {
    name: 'prompt_search',
    description: 'Search prompts by content or description',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' }
      },
      required: ['query']
    }
  },
  {
    name: 'prompt_delete',
    description: 'Delete a prompt from the registry',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Prompt name to delete' }
      },
      required: ['name']
    }
  }
];

function handleToolCall(name, args) {
  const registry = loadRegistry();

  switch (name) {
    case 'prompt_save': {
      const { name: promptName, content, score = 0, tags = [], description = '' } = args;
      const existing = registry.prompts[promptName];
      const version = existing ? existing.version + 1 : 1;

      registry.prompts[promptName] = {
        content,
        score,
        tags,
        description,
        version,
        createdAt: existing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      saveRegistry(registry);
      return { success: true, message: `Saved prompt '${promptName}' (v${version})` };
    }

    case 'prompt_get': {
      const prompt = registry.prompts[args.name];
      if (!prompt) {
        return { error: `Prompt '${args.name}' not found` };
      }
      return { name: args.name, ...prompt };
    }

    case 'prompt_list': {
      let prompts = Object.entries(registry.prompts);

      if (args.tag) {
        prompts = prompts.filter(([_, p]) => p.tags.includes(args.tag));
      }
      if (args.minScore) {
        prompts = prompts.filter(([_, p]) => p.score >= args.minScore);
      }

      return {
        count: prompts.length,
        prompts: prompts.map(([name, p]) => ({
          name,
          score: p.score,
          tags: p.tags,
          version: p.version,
          description: p.description
        }))
      };
    }

    case 'prompt_search': {
      const query = args.query.toLowerCase();
      const results = Object.entries(registry.prompts)
        .filter(([name, p]) =>
          name.toLowerCase().includes(query) ||
          p.content.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
        )
        .map(([name, p]) => ({
          name,
          score: p.score,
          tags: p.tags,
          description: p.description
        }));

      return { count: results.length, results };
    }

    case 'prompt_delete': {
      if (!registry.prompts[args.name]) {
        return { error: `Prompt '${args.name}' not found` };
      }
      delete registry.prompts[args.name];
      saveRegistry(registry);
      return { success: true, message: `Deleted prompt '${args.name}'` };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// MCP stdio communication
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

function sendResponse(id, result) {
  const response = {
    jsonrpc: '2.0',
    id,
    result
  };
  console.log(JSON.stringify(response));
}

function sendError(id, code, message) {
  const response = {
    jsonrpc: '2.0',
    id,
    error: { code, message }
  };
  console.log(JSON.stringify(response));
}

rl.on('line', (line) => {
  try {
    const request = JSON.parse(line);
    const { id, method, params } = request;

    switch (method) {
      case 'initialize':
        sendResponse(id, {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: { name: 'prompt-registry', version: '1.0.0' }
        });
        break;

      case 'tools/list':
        sendResponse(id, { tools });
        break;

      case 'tools/call':
        const result = handleToolCall(params.name, params.arguments || {});
        sendResponse(id, { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] });
        break;

      case 'notifications/initialized':
        // No response needed for notifications
        break;

      default:
        sendError(id, -32601, `Method not found: ${method}`);
    }
  } catch (e) {
    console.error(`[Registry] Parse error: ${e.message}`);
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
