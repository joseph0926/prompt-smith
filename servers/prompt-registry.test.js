/**
 * PromptShield - Prompt Registry v2 Tests
 *
 * Run with: node --test servers/prompt-registry.test.js
 *
 * Tests Registry v2 features:
 * - Version history (prompt_save increments version)
 * - Version retrieval (prompt_get with version param)
 * - Version listing (prompt_versions)
 * - Version diff (prompt_diff)
 * - Rollback (prompt_rollback)
 * - Corrupted data handling (missing versions array)
 */

const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const TEST_DATA_DIR = path.join(__dirname, ".test-data");
const SERVER_PATH = path.join(__dirname, "prompt-registry.js");

// Helper to send JSON-RPC request and get response
function createMcpClient() {
  const server = spawn("node", [SERVER_PATH], {
    env: { ...process.env, PROMPT_REGISTRY_DATA: TEST_DATA_DIR },
    stdio: ["pipe", "pipe", "pipe"],
  });

  let buffer = "";
  const pending = new Map();
  let nextId = 1;

  server.stdout.on("data", (data) => {
    buffer += data.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const msg = JSON.parse(line);
        if (msg.id && pending.has(msg.id)) {
          pending.get(msg.id).resolve(msg);
          pending.delete(msg.id);
        }
      } catch {
        // Ignore non-JSON lines
      }
    }
  });

  return {
    async request(method, params = {}) {
      const id = nextId++;
      const promise = new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        setTimeout(() => {
          if (pending.has(id)) {
            pending.delete(id);
            reject(new Error(`Timeout waiting for response to ${method}`));
          }
        }, 5000);
      });

      const msg = JSON.stringify({ jsonrpc: "2.0", id, method, params });
      server.stdin.write(msg + "\n");

      return promise;
    },

    async initialize() {
      return this.request("initialize", {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "test", version: "1.0.0" },
      });
    },

    async callTool(name, args = {}) {
      const response = await this.request("tools/call", { name, arguments: args });
      if (response.error) {
        throw new Error(response.error.message);
      }
      // Parse the JSON content from the tool result
      const content = response.result?.content?.[0]?.text;
      if (!content) return response.result;
      // Try to parse as JSON, fallback to wrapping error text
      try {
        return JSON.parse(content);
      } catch {
        // Error responses may have humanText format
        return { found: false, success: false, message: content };
      }
    },

    close() {
      server.kill();
    },
  };
}

// Clean up test data directory
function cleanTestData() {
  if (fs.existsSync(TEST_DATA_DIR)) {
    fs.rmSync(TEST_DATA_DIR, { recursive: true });
  }
}

describe("prompt-registry v2", () => {
  let client;

  beforeEach(async () => {
    cleanTestData();
    client = createMcpClient();
    await client.initialize();
  });

  afterEach(() => {
    if (client) client.close();
    cleanTestData();
  });

  describe("prompt_save - version history", () => {
    it("creates version 1 for new prompt", async () => {
      const result = await client.callTool("prompt_save", {
        name: "test-prompt",
        content: "Version 1 content",
      });

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.version, 1);
      assert.strictEqual(result.name, "test-prompt");
    });

    it("increments version on subsequent saves", async () => {
      await client.callTool("prompt_save", {
        name: "test-prompt",
        content: "Version 1",
      });

      const result2 = await client.callTool("prompt_save", {
        name: "test-prompt",
        content: "Version 2",
      });

      assert.strictEqual(result2.version, 2);

      const result3 = await client.callTool("prompt_save", {
        name: "test-prompt",
        content: "Version 3",
      });

      assert.strictEqual(result3.version, 3);
    });
  });

  describe("prompt_get - version retrieval", () => {
    it("returns latest version by default", async () => {
      await client.callTool("prompt_save", { name: "test", content: "v1" });
      await client.callTool("prompt_save", { name: "test", content: "v2" });
      await client.callTool("prompt_save", { name: "test", content: "v3" });

      const result = await client.callTool("prompt_get", { name: "test" });

      assert.strictEqual(result.found, true);
      assert.strictEqual(result.prompt.content, "v3");
      assert.strictEqual(result.prompt.version, 3);
      assert.strictEqual(result.prompt.currentVersion, 3);
    });

    it("returns specific version when requested", async () => {
      await client.callTool("prompt_save", { name: "test", content: "v1" });
      await client.callTool("prompt_save", { name: "test", content: "v2" });
      await client.callTool("prompt_save", { name: "test", content: "v3" });

      const result = await client.callTool("prompt_get", { name: "test", version: 2 });

      assert.strictEqual(result.found, true);
      assert.strictEqual(result.prompt.content, "v2");
      assert.strictEqual(result.prompt.version, 2);
    });

    it("returns error for non-existent version", async () => {
      await client.callTool("prompt_save", { name: "test", content: "v1" });

      const result = await client.callTool("prompt_get", { name: "test", version: 99 });

      assert.strictEqual(result.found, false);
      assert.ok(result.message.includes("not found"));
    });
  });

  describe("prompt_versions - version listing", () => {
    it("lists all versions with summaries", async () => {
      await client.callTool("prompt_save", { name: "test", content: "First version" });
      await client.callTool("prompt_save", { name: "test", content: "Second version" });
      await client.callTool("prompt_save", { name: "test", content: "Third version" });

      const result = await client.callTool("prompt_versions", { name: "test" });

      assert.strictEqual(result.found, true);
      assert.strictEqual(result.name, "test");
      assert.strictEqual(result.currentVersion, 3);
      assert.strictEqual(result.totalVersions, 3);
      assert.strictEqual(result.versions.length, 3);

      // Check version summaries
      assert.strictEqual(result.versions[0].version, 1);
      assert.ok(result.versions[0].contentPreview.includes("First"));
      assert.strictEqual(result.versions[2].version, 3);
    });

    it("returns error for non-existent prompt", async () => {
      const result = await client.callTool("prompt_versions", { name: "nonexistent" });

      assert.strictEqual(result.found, false);
    });
  });

  describe("prompt_diff - version comparison", () => {
    it("shows diff between two versions", async () => {
      await client.callTool("prompt_save", { name: "test", content: "Line 1\nLine 2" });
      await client.callTool("prompt_save", { name: "test", content: "Line 1\nLine 2 modified\nLine 3" });

      const result = await client.callTool("prompt_diff", {
        name: "test",
        fromVersion: 1,
        toVersion: 2,
      });

      assert.strictEqual(result.found, true);
      assert.strictEqual(result.name, "test");
      assert.strictEqual(result.fromVersion, 1);
      assert.strictEqual(result.toVersion, 2);
      assert.ok(result.diff.includes("-") || result.diff.includes("+"));
      assert.ok(result.fromCreatedAt);
      assert.ok(result.toCreatedAt);
    });

    it("defaults toVersion to current version", async () => {
      await client.callTool("prompt_save", { name: "test", content: "v1" });
      await client.callTool("prompt_save", { name: "test", content: "v2" });
      await client.callTool("prompt_save", { name: "test", content: "v3" });

      const result = await client.callTool("prompt_diff", {
        name: "test",
        fromVersion: 1,
      });

      assert.strictEqual(result.toVersion, 3);
    });

    it("returns error for non-existent fromVersion", async () => {
      await client.callTool("prompt_save", { name: "test", content: "v1" });

      const result = await client.callTool("prompt_diff", {
        name: "test",
        fromVersion: 99,
      });

      assert.strictEqual(result.found, false);
    });
  });

  describe("prompt_rollback - version rollback", () => {
    it("creates new version with old content", async () => {
      await client.callTool("prompt_save", { name: "test", content: "Original content" });
      await client.callTool("prompt_save", { name: "test", content: "Bad update" });

      const rollbackResult = await client.callTool("prompt_rollback", {
        name: "test",
        toVersion: 1,
      });

      assert.strictEqual(rollbackResult.success, true);
      assert.strictEqual(rollbackResult.rolledBackTo, 1);
      assert.strictEqual(rollbackResult.newVersion, 3);

      // Verify the content is restored
      const getResult = await client.callTool("prompt_get", { name: "test" });
      assert.strictEqual(getResult.prompt.content, "Original content");
      assert.strictEqual(getResult.prompt.version, 3);
    });

    it("returns error for non-existent version", async () => {
      await client.callTool("prompt_save", { name: "test", content: "v1" });

      const result = await client.callTool("prompt_rollback", {
        name: "test",
        toVersion: 99,
      });

      assert.strictEqual(result.success, false);
    });

    it("returns error for non-existent prompt", async () => {
      const result = await client.callTool("prompt_rollback", {
        name: "nonexistent",
        toVersion: 1,
      });

      assert.strictEqual(result.success, false);
    });
  });

  describe("corrupted data handling", () => {
    it("handles missing versions array in prompt_save", async () => {
      // First create a valid prompt
      await client.callTool("prompt_save", { name: "test", content: "v1" });

      // Manually corrupt the data by removing versions array
      const registryPath = path.join(TEST_DATA_DIR, "prompts.json");
      const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
      delete registry.prompts["test"].versions;
      fs.writeFileSync(registryPath, JSON.stringify(registry));

      // Close and reopen client to reload corrupted data
      client.close();
      client = createMcpClient();
      await client.initialize();

      // prompt_save should handle the corrupted data gracefully
      const result = await client.callTool("prompt_save", {
        name: "test",
        content: "v2 after corruption",
      });

      assert.strictEqual(result.success, true);
      // Version should be calculated from currentVersion, not versions array
    });

    it("handles missing versions array in prompt_get", async () => {
      // Create and corrupt
      await client.callTool("prompt_save", { name: "test", content: "v1" });

      const registryPath = path.join(TEST_DATA_DIR, "prompts.json");
      const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
      delete registry.prompts["test"].versions;
      fs.writeFileSync(registryPath, JSON.stringify(registry));

      client.close();
      client = createMcpClient();
      await client.initialize();

      // prompt_get should return error for corrupted data
      const result = await client.callTool("prompt_get", { name: "test" });

      assert.strictEqual(result.found, false);
      assert.ok(result.message.includes("no version history") || result.message.includes("corrupted"));
    });
  });

  describe("v1 to v2 migration", () => {
    it("migrates v1 schema to v2 on load", async () => {
      // Create v1 format data directly
      fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
      const v1Data = {
        prompts: {
          "legacy-prompt": {
            name: "legacy-prompt",
            content: "Legacy content",
            tags: ["legacy"],
            metadata: {},
            version: 1,
            updatedAt: "2024-01-01T00:00:00.000Z",
          },
        },
      };
      fs.writeFileSync(
        path.join(TEST_DATA_DIR, "prompts.json"),
        JSON.stringify(v1Data)
      );

      // Start client - should trigger migration
      client.close();
      client = createMcpClient();
      await client.initialize();

      // Verify migration worked
      const result = await client.callTool("prompt_get", { name: "legacy-prompt" });

      assert.strictEqual(result.found, true);
      assert.strictEqual(result.prompt.content, "Legacy content");
      assert.strictEqual(result.prompt.version, 1);

      // Verify versions array was created
      const versionsResult = await client.callTool("prompt_versions", { name: "legacy-prompt" });
      assert.strictEqual(versionsResult.totalVersions, 1);
    });
  });
});
