#!/usr/bin/env node

/**
 * 🚀 Neon Watch & Auto-Commit Script
 *
 * Watches for file changes and automatically commits them after a debounce period.
 * This script is perfect for development environments where you want automatic
 * version control without manual intervention.
 */

const fs = require("fs");
const path = require("path");
const { spawn, exec } = require("child_process");
const chokidar = require("chokidar");

// Configuration
const CONFIG = {
  // Directories to watch
  watchPaths: [
    "apps/**/*",
    "packages/**/*",
    "*.json",
    "*.md",
    "*.yml",
    "*.yaml",
    "*.js",
    "*.ts",
  ],

  // Files/directories to ignore
  ignored: [
    "**/node_modules/**",
    "**/.git/**",
    "**/.next/**",
    "**/dist/**",
    "**/build/**",
    "**/*.log",
    "**/.turbo/**",
    "**/.cache/**",
    "**/coverage/**",
    "**/.auto-commit.log",
    "**/.last-changes.md",
  ],

  // Debounce delay in milliseconds
  debounceDelay: 5000,

  // Auto-push after commit
  autoPush: process.argv.includes("--auto-push"),

  // Verbose logging
  verbose: process.argv.includes("--verbose"),

  // Dry run mode
  dryRun: process.argv.includes("--dry-run"),
};

// State management
let debounceTimer = null;
let pendingChanges = new Set();
let isProcessing = false;

// Logging utilities
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(level, message, color = colors.cyan) {
  const timestamp = new Date().toISOString();
  const prefix = `${color}[${timestamp}] [${level}]${colors.reset}`;
  console.log(`${prefix} ${message}`);
}

function info(message) {
  log("INFO", message, colors.blue);
}

function warn(message) {
  log("WARN", message, colors.yellow);
}

function error(message) {
  log("ERROR", message, colors.red);
}

function success(message) {
  log("SUCCESS", message, colors.green);
}

function verbose(message) {
  if (CONFIG.verbose) {
    log("VERBOSE", message, colors.magenta);
  }
}

// Utility functions
function execPromise(command, options = {}) {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stderr, stdout });
      } else {
        resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
      }
    });
  });
}

async function hasGitChanges() {
  try {
    const { stdout } = await execPromise("git status --porcelain");
    return stdout.length > 0;
  } catch (err) {
    error(`Failed to check git status: ${err.stderr || err.error.message}`);
    return false;
  }
}

async function getChangeStats() {
  try {
    const { stdout } = await execPromise("git status --porcelain");
    const lines = stdout.split("\n").filter((line) => line.trim());

    const stats = {
      added: lines.filter((line) => line.startsWith("A")).length,
      modified: lines.filter(
        (line) => line.startsWith("M") || line.startsWith(" M"),
      ).length,
      deleted: lines.filter((line) => line.startsWith("D")).length,
      renamed: lines.filter((line) => line.startsWith("R")).length,
      untracked: lines.filter((line) => line.startsWith("??")).length,
      total: lines.length,
    };

    return stats;
  } catch (err) {
    error(`Failed to get change stats: ${err.stderr || err.error.message}`);
    return {
      total: 0,
      added: 0,
      modified: 0,
      deleted: 0,
      renamed: 0,
      untracked: 0,
    };
  }
}

async function runAutoFix() {
  info("🔧 Running auto-fix operations...");

  try {
    // Run linting with auto-fix
    try {
      await execPromise("npm run lint -- --fix", { timeout: 30000 });
      verbose("✅ Linting completed");
    } catch (err) {
      verbose("⚠️ Linting failed or not available");
    }

    // Run Prettier formatting
    try {
      await execPromise("npx prettier --write . --ignore-unknown", {
        timeout: 30000,
      });
      verbose("✅ Prettier formatting completed");
    } catch (err) {
      verbose("⚠️ Prettier formatting failed or not available");
    }

    // Generate Prisma client if needed
    try {
      const { stdout } = await execPromise("git status --porcelain");
      if (stdout.includes("schema.prisma")) {
        await execPromise("npm run db:generate", { timeout: 60000 });
        verbose("✅ Prisma client regenerated");
      }
    } catch (err) {
      verbose("⚠️ Prisma generation failed or not needed");
    }

    success("🔧 Auto-fix operations completed");
  } catch (err) {
    warn("Some auto-fix operations failed, continuing with commit...");
  }
}

function generateCommitMessage(stats) {
  const timestamp = new Date().toISOString();
  const branch = process.env.GIT_BRANCH || "unknown";

  // Determine commit type based on changes
  let commitType = "auto";
  if (stats.added > stats.modified + stats.deleted) {
    commitType = "feat";
  } else if (stats.deleted > 0) {
    commitType = "refactor";
  } else if (stats.modified > 0) {
    commitType = "chore";
  }

  const summary = `${commitType}: auto-watch commit (${stats.total} files)`;

  const details = `
🤖 Automated commit from file watcher

📊 Change Statistics:
- 🆕 Added: ${stats.added} files
- ✏️ Modified: ${stats.modified} files  
- 🗑️ Deleted: ${stats.deleted} files
- 🔄 Renamed: ${stats.renamed} files
- 📄 Untracked: ${stats.untracked} files

🕐 Auto-committed at: ${timestamp}
🌿 Branch: ${branch}
🔍 Watcher: Node.js file monitoring

Generated by: scripts/watch-and-commit.js 🚀`;

  return { summary, details };
}

async function commitChanges() {
  if (CONFIG.dryRun) {
    info("🔍 DRY RUN MODE - Would commit changes but not actually doing it");
    const stats = await getChangeStats();
    info(`📊 Would commit ${stats.total} files`);
    return true;
  }

  try {
    info("💾 Staging changes...");
    await execPromise("git add .");

    const stats = await getChangeStats();
    const { summary, details } = generateCommitMessage(stats);

    info(`📝 Creating commit: ${summary}`);
    await execPromise(`git commit -m "${summary}" -m "${details}"`);

    const { stdout: commitHash } = await execPromise("git rev-parse HEAD");
    success(
      `✅ Changes committed successfully (${commitHash.substring(0, 8)})`,
    );

    if (CONFIG.autoPush) {
      info("🚀 Auto-pushing to remote...");
      try {
        await execPromise("git push");
        success("✅ Changes pushed to remote");
      } catch (err) {
        warn(`Failed to push: ${err.stderr || err.error.message}`);
      }
    }

    return true;
  } catch (err) {
    error(`Failed to commit changes: ${err.stderr || err.error.message}`);
    return false;
  }
}

async function processChanges() {
  if (isProcessing) {
    verbose("Already processing changes, skipping...");
    return;
  }

  isProcessing = true;

  try {
    info("🔄 Processing detected changes...");

    // Check if there are actually any changes
    if (!(await hasGitChanges())) {
      verbose("No git changes detected, skipping commit");
      return;
    }

    const stats = await getChangeStats();
    info(`📊 Detected ${stats.total} changed files`);

    // Run auto-fix operations
    await runAutoFix();

    // Commit the changes
    await commitChanges();

    // Clear pending changes
    pendingChanges.clear();
  } catch (err) {
    error(`Error processing changes: ${err.message}`);
  } finally {
    isProcessing = false;
  }
}

function debounceCommit() {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    processChanges();
  }, CONFIG.debounceDelay);

  verbose(`⏱️ Debounce timer set for ${CONFIG.debounceDelay}ms`);
}

function setupWatcher() {
  info("👀 Setting up file watcher...");

  const watcher = chokidar.watch(CONFIG.watchPaths, {
    ignored: CONFIG.ignored,
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100,
    },
  });

  watcher.on("ready", () => {
    success("🎯 File watcher ready and monitoring changes");
    info(`📁 Watching: ${CONFIG.watchPaths.join(", ")}`);
    info(
      `🚫 Ignoring: ${CONFIG.ignored.slice(0, 3).join(", ")}${CONFIG.ignored.length > 3 ? "..." : ""}`,
    );
    info(`⏱️ Debounce delay: ${CONFIG.debounceDelay}ms`);
    info(`🚀 Auto-push: ${CONFIG.autoPush ? "enabled" : "disabled"}`);
    info(`🔍 Dry run: ${CONFIG.dryRun ? "enabled" : "disabled"}`);
  });

  watcher.on("add", (path) => {
    verbose(`📄 File added: ${path}`);
    pendingChanges.add(path);
    debounceCommit();
  });

  watcher.on("change", (path) => {
    verbose(`✏️ File changed: ${path}`);
    pendingChanges.add(path);
    debounceCommit();
  });

  watcher.on("unlink", (path) => {
    verbose(`🗑️ File deleted: ${path}`);
    pendingChanges.add(path);
    debounceCommit();
  });

  watcher.on("addDir", (path) => {
    verbose(`📁 Directory added: ${path}`);
  });

  watcher.on("unlinkDir", (path) => {
    verbose(`📁 Directory deleted: ${path}`);
  });

  watcher.on("error", (error) => {
    error(`Watcher error: ${error}`);
  });

  return watcher;
}

function showHelp() {
  console.log(`
🚀 Neon Watch & Auto-Commit Script

USAGE:
    node scripts/watch-and-commit.js [OPTIONS]

OPTIONS:
    --auto-push     Automatically push commits to remote
    --verbose       Enable verbose logging  
    --dry-run       Show what would be done without making changes
    --help          Show this help message

EXAMPLES:
    node scripts/watch-and-commit.js                    # Watch and auto-commit
    node scripts/watch-and-commit.js --auto-push        # Watch, commit, and push
    node scripts/watch-and-commit.js --verbose          # Watch with detailed logs
    node scripts/watch-and-commit.js --dry-run          # Preview mode

DESCRIPTION:
    This script watches for file changes in the repository and automatically
    commits them after a debounce period. It includes auto-fix operations
    like linting and formatting before committing.

DEBOUNCE DELAY: ${CONFIG.debounceDelay}ms
WATCH PATHS: ${CONFIG.watchPaths.join(", ")}

Press Ctrl+C to stop watching.
`);
}

// Main execution
async function main() {
  if (process.argv.includes("--help")) {
    showHelp();
    process.exit(0);
  }

  console.log(`${colors.magenta}🚀 Neon Watch & Auto-Commit${colors.reset}`);
  console.log(`${colors.cyan}==============================${colors.reset}`);

  try {
    // Check if we're in a git repository
    await execPromise("git rev-parse --git-dir");
    info("✅ Git repository detected");
  } catch (err) {
    error("Not in a git repository!");
    process.exit(1);
  }

  // Setup watcher
  const watcher = setupWatcher();

  // Graceful shutdown
  process.on("SIGINT", () => {
    info("📴 Shutting down file watcher...");
    watcher.close();

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    success("👋 File watcher stopped");
    process.exit(0);
  });

  // Keep the process alive
  process.stdin.resume();
}

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  error(`Uncaught exception: ${err.message}`);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  error(`Unhandled rejection at: ${promise}, reason: ${reason}`);
});

// Start the application
if (require.main === module) {
  main().catch((err) => {
    error(`Failed to start: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { setupWatcher, processChanges };
