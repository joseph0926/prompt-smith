#!/usr/bin/env node
/**
 * PromptShield - Prompt Registry MCP Server
 *
 * Purpose:
 * - Provide a small local registry to store/retrieve versioned prompts.
 * - Expose CRUD-style MCP tools over stdio (JSON-RPC 2.0).
 *
 * Notes on MCP compliance:
 * - Implements lifecycle initialize + notifications/initialized.
 * - Implements tools/list and tools/call.
 * - Tool-level failures are returned via CallToolResult.isError (not protocol errors),
 *   while "unknown tool" is returned as a JSON-RPC error (per MCP schema guidance).
 */

const readline = require("readline");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const SUPPORTED_PROTOCOL_VERSIONS = ["2025-11-25", "2024-11-05"];

const DATA_DIR =
  process.env.PROMPT_REGISTRY_DATA ||
  path.join(process.cwd(), "data");

const REGISTRY_PATH = path.join(DATA_DIR, "prompts.json");

const PROMPT_PAGE_SIZE = 50;

// Prompt names exposed via MCP should be stable, discoverable, and slash-command friendly.
// Claude Code also normalizes names (spaces -> underscores), but we normalize proactively.
function normalizeMcpPromptName(name) {
  const s = String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  return s;
}

function shortHash(input) {
  return crypto.createHash("sha1").update(String(input)).digest("hex").slice(0, 6);
}

function buildPromptNameMap(registry) {
  const reserved = new Set(["registry_help"]);
  const keys = Object.keys((registry && registry.prompts) || {});

  // First pass: compute bases.
  const baseToKeys = new Map();
  for (const key of keys) {
    const base = normalizeMcpPromptName(key) || `prompt_${shortHash(key)}`;
    if (!baseToKeys.has(base)) baseToKeys.set(base, []);
    baseToKeys.get(base).push(key);
  }

  // Second pass: finalize unique MCP names.
  const nameToKey = new Map();
  for (const [base, ks] of baseToKeys.entries()) {
    if (ks.length === 1 && !reserved.has(base)) {
      nameToKey.set(base, ks[0]);
      continue;
    }
    for (const k of ks) {
      const name = `${base}_${shortHash(k)}`;
      nameToKey.set(name, k);
    }
  }

  return nameToKey;
}

function coercePromptArguments(v) {
  if (!Array.isArray(v)) return undefined;
  const out = [];
  for (const item of v) {
    if (!item || typeof item !== "object") continue;
    if (typeof item.name !== "string" || !item.name.trim()) continue;
    out.push({
      name: item.name.trim(),
      description: typeof item.description === "string" ? item.description : undefined,
      required: !!item.required,
    });
  }
  return out.length ? out : undefined;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadRegistry() {
  ensureDataDir();
  if (!fs.existsSync(REGISTRY_PATH)) {
    return { prompts: {} };
  }
  try {
    const raw = fs.readFileSync(REGISTRY_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || typeof parsed.prompts !== "object") {
      return { prompts: {} };
    }
    return parsed;
  } catch {
    // Fail open: don't crash the server for a corrupt registry file.
    return { prompts: {} };
  }
}

function saveRegistry(registry) {
  ensureDataDir();
  const tmp = `${REGISTRY_PATH}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(registry, null, 2), "utf8");
  fs.renameSync(tmp, REGISTRY_PATH);
}

function nowIso() {
  return new Date().toISOString();
}

function isPlainObject(v) {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

// ---------- JSON-RPC helpers ----------

function sendResponse(id, result) {
  const response = { jsonrpc: "2.0", id, result };
  process.stdout.write(JSON.stringify(response) + "\n");
}

function sendError(id, code, message, data) {
  const error = { code, message };
  if (data !== undefined) error.data = data;
  const response = { jsonrpc: "2.0", id, error };
  process.stdout.write(JSON.stringify(response) + "\n");
}

function sendToolResult(id, structuredContent, opts = {}) {
  const isError = !!opts.isError;

  const humanText =
    opts.humanText ??
    (typeof structuredContent === "string"
      ? structuredContent
      : JSON.stringify(structuredContent, null, 2));

  // MCP CallToolResult supports:
  // - content: ContentBlock[]
  // - structuredContent?: object
  // - isError?: boolean
  const result = {
    content: [{ type: "text", text: humanText }],
    structuredContent: isPlainObject(structuredContent) ? structuredContent : undefined,
    ...(isError ? { isError: true } : {}),
  };

  if (result.structuredContent === undefined) {
    delete result.structuredContent;
  }

  sendResponse(id, result);
}

function sendNotification(method, params) {
  const msg = { jsonrpc: "2.0", method };
  if (params !== undefined) msg.params = params;
  process.stdout.write(JSON.stringify(msg) + "\n");
}

// ---------- Prompts (MCP "prompts" capability) ----------

function promptDefinitionsFromRegistry(registry) {
  const defs = [
    {
      name: "registry_help",
      title: "Prompt Registry Help",
      description: "Explains how to use Prompt Registry tools and saved prompts (slash commands).",
    },
  ];

  const nameToKey = buildPromptNameMap(registry);
  for (const [mcpName, key] of nameToKey.entries()) {
    const p = registry.prompts[key];
    if (!p) continue;
    const md = isPlainObject(p.metadata) ? p.metadata : {};
    const args = coercePromptArguments(md.arguments);

    const tags = Array.isArray(p.tags) ? p.tags : [];
    const tagStr = tags.length ? `tags: ${tags.join(", ")}` : "";
    const descFromMd = typeof md.description === "string" ? md.description.trim() : "";
    const description = descFromMd || (tagStr ? `Saved prompt (${tagStr})` : "Saved prompt");

    const def = {
      name: mcpName,
      title: typeof p.name === "string" ? p.name : key,
      description,
    };
    if (args) def.arguments = args;
    defs.push(def);
  }

  // Sort: builtins first, then recent prompts first (best effort).
  const builtins = defs.filter((d) => d.name === "registry_help");
  const saved = defs
    .filter((d) => d.name !== "registry_help")
    .sort((a, b) => a.name.localeCompare(b.name));
  return [...builtins, ...saved];
}

function renderTemplate(template, args) {
  if (typeof template !== "string") return "";
  if (!args || typeof args !== "object") return template;

  let out = template;
  for (const [k, v] of Object.entries(args)) {
    const key = String(k);
    const val = v === undefined || v === null ? "" : String(v);
    // Replace {{ key }} placeholders.
    const re = new RegExp(`\\{\\{\\s*${key.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}\\s*\\}\\}`, "g");
    out = out.replace(re, val);
  }
  return out;
}

function handlePromptsList(id, params) {
  const registry = loadRegistry();
  const all = promptDefinitionsFromRegistry(registry);

  const cursor = params && typeof params.cursor === "string" ? params.cursor : undefined;
  let offset = 0;
  if (cursor !== undefined && cursor !== "") {
    const n = Number.parseInt(cursor, 10);
    if (!Number.isFinite(n) || n < 0) {
      sendError(id, -32602, "Invalid cursor", { cursor });
      return;
    }
    offset = n;
  }

  const page = all.slice(offset, offset + PROMPT_PAGE_SIZE);
  const nextCursor = offset + PROMPT_PAGE_SIZE < all.length ? String(offset + PROMPT_PAGE_SIZE) : undefined;

  const result = { prompts: page };
  if (nextCursor) result.nextCursor = nextCursor;
  sendResponse(id, result);
}

function handlePromptsGet(id, params) {
  if (!params || typeof params !== "object") {
    sendError(id, -32602, "Invalid params: expected object");
    return;
  }
  const name = params.name;
  const args = params.arguments;

  if (typeof name !== "string" || !name.trim()) {
    sendError(id, -32602, "Invalid params: missing prompt name");
    return;
  }

  const promptName = name.trim();

  if (promptName === "registry_help") {
    sendResponse(id, {
      description: "Prompt Registry help",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text:
              "You have access to the Prompt Registry MCP server.\n\n" +
              "1) Saved prompts are exposed as slash commands: /mcp__prompt-registry__<prompt_name>.\n" +
              "2) Use tools to manage prompts:\n" +
              "   - mcp__prompt-registry__prompt_save {name, content, tags?, metadata?}\n" +
              "   - mcp__prompt-registry__prompt_list\n" +
              "   - mcp__prompt-registry__prompt_get {name}\n" +
              "   - mcp__prompt-registry__prompt_search {query}\n" +
              "\nIf the user asks to reuse a saved prompt, fetch it (tool or slash command) and then apply it.\n" +
              "If the user asks to create reusable prompts, propose saving them to the registry.",
          },
        },
      ],
    });
    return;
  }

  if (args !== undefined && !isPlainObject(args)) {
    sendError(id, -32602, "Invalid params: arguments must be an object");
    return;
  }

  const registry = loadRegistry();
  const nameToKey = buildPromptNameMap(registry);
  const key = nameToKey.get(promptName);
  if (!key) {
    // Spec recommends -32602 for invalid prompt names.
    sendError(id, -32602, "Invalid prompt name", { name: promptName });
    return;
  }

  const p = registry.prompts[key];
  if (!p || typeof p.content !== "string") {
    sendError(id, -32602, "Invalid prompt name", { name: promptName });
    return;
  }

  const md = isPlainObject(p.metadata) ? p.metadata : {};
  const argDefs = coercePromptArguments(md.arguments) || [];

  // Validate required args if we have a definition.
  const provided = args || {};
  for (const d of argDefs) {
    if (d.required && (provided[d.name] === undefined || provided[d.name] === null || String(provided[d.name]).trim() === "")) {
      sendError(id, -32602, "Missing required argument", { argument: d.name });
      return;
    }
  }

  const rendered = renderTemplate(p.content, provided);
  const descFromMd = typeof md.description === "string" ? md.description.trim() : "";
  const description = descFromMd || `Saved prompt: ${p.name || key}`;

  sendResponse(id, {
    description,
    messages: [
      {
        role: "user",
        content: { type: "text", text: rendered },
      },
    ],
  });
}

// ---------- MCP handlers ----------

function handleInitialize(id, params) {
  const requested = (params && params.protocolVersion) || SUPPORTED_PROTOCOL_VERSIONS[0];

  if (!SUPPORTED_PROTOCOL_VERSIONS.includes(requested)) {
    // -32602 is JSON-RPC "Invalid params" and is used in MCP examples for unsupported protocol versions.
    sendError(id, -32602, "Unsupported protocol version", {
      supported: SUPPORTED_PROTOCOL_VERSIONS,
      requested,
    });
    return;
  }

  sendResponse(id, {
    protocolVersion: requested,
    capabilities: {
      tools: { listChanged: false },
      prompts: { listChanged: true },
    },
    serverInfo: {
      name: "prompt-registry",
      title: "Prompt Registry",
      version: "1.2.0",
      description: "Local prompt registry (CRUD) for PromptShield",
    },
    instructions:
      "This server stores prompts locally. Saved prompts are also exposed via MCP prompts (slash commands). Tool errors are returned with isError=true so the model can self-correct.",
  });
}

function toolDefinitions() {
  // Minimal outputSchema to encourage structuredContent usage.
  const baseOk = {
    type: "object",
    properties: {
      success: { type: "boolean" },
      message: { type: "string" },
    },
    required: ["success"],
  };

  return [
    {
      name: "prompt_save",
      description: "Save a prompt to the registry (creates or updates, auto-increments version).",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "Prompt identifier (unique key)." },
          content: { type: "string", description: "Prompt content." },
          tags: { type: "array", items: { type: "string" }, description: "Optional tags." },
          metadata: { type: "object", description: "Optional metadata (JSON object)." },
        },
        required: ["name", "content"],
      },
      outputSchema: {
        ...baseOk,
        properties: {
          ...baseOk.properties,
          name: { type: "string" },
          version: { type: "number" },
          updatedAt: { type: "string" },
        },
      },
    },
    {
      name: "prompt_get",
      description: "Get a prompt by name.",
      inputSchema: {
        type: "object",
        properties: { name: { type: "string" } },
        required: ["name"],
      },
      outputSchema: {
        type: "object",
        properties: {
          found: { type: "boolean" },
          prompt: { type: "object" },
        },
        required: ["found"],
      },
    },
    {
      name: "prompt_list",
      description: "List all prompts (summary only).",
      inputSchema: { type: "object", properties: {} },
      outputSchema: {
        type: "object",
        properties: { prompts: { type: "array" } },
        required: ["prompts"],
      },
    },
    {
      name: "prompt_search",
      description: "Search prompts by name/tag/content substring.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string" },
          limit: { type: "number", description: "Max results (default 20)." },
        },
        required: ["query"],
      },
      outputSchema: {
        type: "object",
        properties: { results: { type: "array" } },
        required: ["results"],
      },
    },
    {
      name: "prompt_delete",
      description: "Delete a prompt by name.",
      inputSchema: {
        type: "object",
        properties: { name: { type: "string" } },
        required: ["name"],
      },
      outputSchema: baseOk,
    },
  ];
}

function validateString(name, v) {
  if (typeof v !== "string" || v.trim().length === 0) {
    return `${name} must be a non-empty string`;
  }
  return null;
}

function normalizeTags(tags) {
  if (tags === undefined) return [];
  if (!Array.isArray(tags)) return null;
  const out = [];
  for (const t of tags) {
    if (typeof t === "string" && t.trim()) out.push(t.trim());
  }
  return out;
}

function handleToolCall(id, params) {
  if (!params || typeof params !== "object") {
    sendError(id, -32602, "Invalid params: expected object");
    return;
  }
  const toolName = params.name;
  const args = params.arguments || {};

  if (typeof toolName !== "string" || toolName.trim().length === 0) {
    sendError(id, -32602, "Invalid params: missing tool name");
    return;
  }
  if (!isPlainObject(args)) {
    sendError(id, -32602, "Invalid params: arguments must be an object");
    return;
  }

  const registry = loadRegistry();

  // Tool dispatch
  try {
    switch (toolName) {
      case "prompt_save": {
        const errName = validateString("name", args.name);
        const errContent = validateString("content", args.content);
        if (errName || errContent) {
          sendToolResult(
            id,
            { success: false, message: errName || errContent },
            { isError: true, humanText: `Error: ${errName || errContent}` }
          );
          return;
        }

        const key = args.name.trim();
        const existing = registry.prompts[key];
        const tags = normalizeTags(args.tags);
        if (tags === null) {
          sendToolResult(
            id,
            { success: false, message: "tags must be an array of strings" },
            { isError: true, humanText: "Error: tags must be an array of strings" }
          );
          return;
        }

        const metadata = isPlainObject(args.metadata) ? args.metadata : {};

        const nextVersion = existing && typeof existing.version === "number" ? existing.version + 1 : 1;

        registry.prompts[key] = {
          name: key,
          content: String(args.content),
          tags,
          metadata,
          version: nextVersion,
          updatedAt: nowIso(),
        };

        saveRegistry(registry);

        // Saved prompts are exposed via MCP prompts; notify clients to refresh.
        sendNotification("notifications/prompts/list_changed");

        sendToolResult(id, {
          success: true,
          message: "Saved",
          name: key,
          version: nextVersion,
          updatedAt: registry.prompts[key].updatedAt,
        });
        return;
      }

      case "prompt_get": {
        const errName = validateString("name", args.name);
        if (errName) {
          sendToolResult(id, { found: false, message: errName }, { isError: true, humanText: `Error: ${errName}` });
          return;
        }
        const key = args.name.trim();
        const prompt = registry.prompts[key];
        if (!prompt) {
          sendToolResult(
            id,
            { found: false, message: `Prompt '${key}' not found` },
            { isError: true, humanText: `Not found: ${key}` }
          );
          return;
        }
        sendToolResult(id, { found: true, prompt });
        return;
      }

      case "prompt_list": {
        const prompts = Object.values(registry.prompts || {})
          .map((p) => ({ name: p.name, tags: p.tags || [], version: p.version || 1, updatedAt: p.updatedAt || null }))
          .sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
        sendToolResult(id, { prompts });
        return;
      }

      case "prompt_search": {
        const errQuery = validateString("query", args.query);
        if (errQuery) {
          sendToolResult(id, { results: [], message: errQuery }, { isError: true, humanText: `Error: ${errQuery}` });
          return;
        }
        const q = args.query.trim().toLowerCase();
        const limit = typeof args.limit === "number" && args.limit > 0 ? Math.min(args.limit, 100) : 20;

        const results = Object.values(registry.prompts || [])
          .filter((p) => {
            const name = String(p.name || "").toLowerCase();
            const content = String(p.content || "").toLowerCase();
            const tags = Array.isArray(p.tags) ? p.tags.join(" ").toLowerCase() : "";
            return name.includes(q) || content.includes(q) || tags.includes(q);
          })
          .slice(0, limit)
          .map((p) => ({ name: p.name, tags: p.tags || [], version: p.version || 1, updatedAt: p.updatedAt || null }));

        sendToolResult(id, { results });
        return;
      }

      case "prompt_delete": {
        const errName = validateString("name", args.name);
        if (errName) {
          sendToolResult(id, { success: false, message: errName }, { isError: true, humanText: `Error: ${errName}` });
          return;
        }
        const key = args.name.trim();
        if (!registry.prompts[key]) {
          sendToolResult(
            id,
            { success: false, message: `Prompt '${key}' not found` },
            { isError: true, humanText: `Not found: ${key}` }
          );
          return;
        }
        delete registry.prompts[key];
        saveRegistry(registry);

        // Notify clients to refresh the prompt list.
        sendNotification("notifications/prompts/list_changed");
        sendToolResult(id, { success: true, message: `Deleted '${key}'` });
        return;
      }

      default: {
        // Unknown tool: protocol-level error, per MCP guidance.
        sendError(id, -32601, `Unknown tool: ${toolName}`);
        return;
      }
    }
  } catch (e) {
    // Tool execution failure: return isError=true so the model can see it.
    const msg = e && e.message ? e.message : String(e);
    sendToolResult(id, { success: false, message: msg }, { isError: true, humanText: `Error: ${msg}` });
  }
}

// ---------- Main loop ----------

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on("line", (line) => {
  let msg;
  try {
    msg = JSON.parse(line);
  } catch {
    // Ignore non-JSON lines
    return;
  }

  const { id, method, params } = msg || {};
  if (!method) return;

  if (method === "initialize") {
    handleInitialize(id, params);
    return;
  }

  if (method === "notifications/initialized") {
    // No-op
    return;
  }

  if (method === "tools/list") {
    sendResponse(id, { tools: toolDefinitions() });
    return;
  }

  if (method === "tools/call") {
    handleToolCall(id, params);
    return;
  }

  if (method === "prompts/list") {
    handlePromptsList(id, params);
    return;
  }

  if (method === "prompts/get") {
    handlePromptsGet(id, params);
    return;
  }

  // Unknown method: JSON-RPC method not found
  if (id !== undefined) {
    sendError(id, -32601, `Method not found: ${method}`);
  }
});

rl.on("close", () => {
  process.exit(0);
});

process.on("SIGTERM", () => {
  rl.close();
});
