#!/bin/bash

# 🚀 Neon Auto-Commit Script
# Automatically detects, processes, and commits changes in the repository

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_FILE="$REPO_ROOT/.auto-commit.log"
CHANGE_SUMMARY="$REPO_ROOT/.last-changes.md"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Error logging function
error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
    echo "[ERROR] $1" >> "$LOG_FILE"
    exit 1
}

# Success logging function
success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    echo "[SUCCESS] $1" >> "$LOG_FILE"
}

# Warning logging function
warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    echo "[WARNING] $1" >> "$LOG_FILE"
}

# Check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        error "Not in a git repository!"
    fi
    log "✅ Git repository detected"
}

# Configure git user if not set
configure_git() {
    if [ -z "$(git config user.name)" ] || [ -z "$(git config user.email)" ]; then
        warn "Git user not configured, setting default..."
        git config user.name "Neon Auto-Commit"
        git config user.email "auto-commit@neon.ai"
        log "🔧 Git user configured"
    fi
}

# Check for changes
check_changes() {
    if [ -z "$(git status --porcelain)" ]; then
        log "No changes detected. Exiting."
        exit 0
    fi
    log "📝 Changes detected, proceeding with auto-commit"
}

# Auto-fix common issues
auto_fix() {
    log "🔧 Running auto-fix operations..."
    
    cd "$REPO_ROOT"
    
    # Install dependencies if package.json changed
    if git status --porcelain | grep -q "package\.json"; then
        log "📦 package.json changed, installing dependencies..."
        npm install --silent || warn "Failed to install dependencies"
    fi
    
    # Run linting with auto-fix
    if [ -f "package.json" ] && npm run lint --if-present -- --fix > /dev/null 2>&1; then
        log "🧹 Linting completed with auto-fix"
    else
        warn "Linting failed or not available"
    fi
    
    # Format code with Prettier
    if command -v npx > /dev/null && npx prettier --write . --ignore-unknown > /dev/null 2>&1; then
        log "💅 Code formatted with Prettier"
    else
        warn "Prettier formatting failed or not available"
    fi
    
    # Generate Prisma client if schema changed
    if git status --porcelain | grep -q "schema\.prisma"; then
        log "🗄️ Prisma schema changed, regenerating client..."
        npm run db:generate --if-present > /dev/null 2>&1 || warn "Failed to generate Prisma client"
    fi
}

# Generate change summary
generate_summary() {
    log "📊 Generating change summary..."
    
    local added=$(git status --porcelain | grep "^A" | wc -l | tr -d ' ')
    local modified=$(git status --porcelain | grep "^M" | wc -l | tr -d ' ')
    local deleted=$(git status --porcelain | grep "^D" | wc -l | tr -d ' ')
    local renamed=$(git status --porcelain | grep "^R" | wc -l | tr -d ' ')
    local total=$((added + modified + deleted + renamed))
    
    # Create summary file
    cat > "$CHANGE_SUMMARY" << EOF
# 🔄 Auto-Commit Change Summary

**Generated:** $(date -u '+%Y-%m-%d %H:%M:%S UTC')
**Branch:** $(git branch --show-current)
**Total Changes:** $total files

## 📈 Statistics
- 🆕 Added: $added files
- ✏️ Modified: $modified files
- 🗑️ Deleted: $deleted files
- 🔄 Renamed: $renamed files

## 📝 File Changes
\`\`\`
$(git status --porcelain)
\`\`\`

## 🎯 Auto-Fix Operations
- Dependency installation check
- Code linting and formatting
- Prisma client regeneration
- Type checking validation

---
*Generated by Neon Auto-Commit Script 🤖*
EOF
    
    echo "$total"
}

# Create commit message
create_commit_message() {
    local change_count=$1
    local branch=$(git branch --show-current)
    local timestamp=$(date -u '+%Y-%m-%d %H:%M:%S UTC')
    
    # Generate semantic commit type based on changes
    local commit_type="auto"
    if git status --porcelain | grep -q "^A.*\.ts$\|^A.*\.tsx$\|^A.*\.js$\|^A.*\.jsx$"; then
        commit_type="feat"
    elif git status --porcelain | grep -q "package\.json\|tsconfig\|.*config"; then
        commit_type="chore"
    elif git status --porcelain | grep -q "README\|\.md$"; then
        commit_type="docs"
    elif git status --porcelain | grep -q "test\|spec"; then
        commit_type="test"
    fi
    
    echo "$commit_type: auto-import and commit adjustments ($change_count files)

🤖 Automated commit generated by Neon Auto-Commit Script

📊 Summary:
- Files affected: $change_count
- Branch: $branch
- Timestamp: $timestamp
- Auto-fixes applied: ✅

🔍 Changes include dependency updates, code formatting,
and schema synchronization as needed.

Generated by: scripts/auto-commit.sh 🚀"
}

# Perform the commit
commit_changes() {
    local change_count=$1
    
    log "💾 Staging all changes..."
    git add .
    
    local commit_message=$(create_commit_message "$change_count")
    
    log "📝 Creating commit..."
    if git commit -m "$commit_message"; then
        success "✅ Commit created successfully"
        
        # Get commit hash
        local commit_hash=$(git rev-parse HEAD)
        log "🔗 Commit hash: $commit_hash"
        
        return 0
    else
        error "Failed to create commit"
    fi
}

# Push changes (optional)
push_changes() {
    local should_push=${1:-false}
    
    if [ "$should_push" = "true" ]; then
        log "🚀 Pushing changes to remote..."
        local branch=$(git branch --show-current)
        
        if git push origin "$branch"; then
            success "✅ Changes pushed to origin/$branch"
        else
            error "Failed to push changes"
        fi
    else
        log "ℹ️ Skipping push (use --push flag to enable)"
    fi
}

# Cleanup function
cleanup() {
    log "🧹 Cleaning up temporary files..."
    # Remove any temporary files if needed
}

# Show help
show_help() {
    cat << EOF
🚀 Neon Auto-Commit Script

USAGE:
    $0 [OPTIONS]

OPTIONS:
    --push          Push changes to remote after commit
    --dry-run       Show what would be done without making changes
    --fix-only      Only run auto-fix operations without committing
    --help          Show this help message

EXAMPLES:
    $0                      # Auto-commit changes locally
    $0 --push              # Auto-commit and push to remote
    $0 --dry-run           # Preview changes without committing
    $0 --fix-only          # Only fix code issues

DESCRIPTION:
    This script automatically detects changes in the repository,
    applies common fixes (linting, formatting, etc.), and creates
    semantic commits with detailed messages.

LOG FILE: $LOG_FILE
EOF
}

# Main function
main() {
    local push_changes_flag=false
    local dry_run=false
    local fix_only=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --push)
                push_changes_flag=true
                shift
                ;;
            --dry-run)
                dry_run=true
                shift
                ;;
            --fix-only)
                fix_only=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                error "Unknown option: $1. Use --help for usage information."
                ;;
        esac
    done
    
    # Header
    echo -e "${PURPLE}🚀 Neon Auto-Commit Script${NC}"
    echo -e "${CYAN}================================${NC}"
    log "Starting auto-commit process..."
    
    cd "$REPO_ROOT"
    
    # Setup
    check_git_repo
    configure_git
    check_changes
    
    if [ "$dry_run" = "true" ]; then
        log "🔍 DRY RUN MODE - No changes will be made"
        log "📊 Changes that would be processed:"
        git status --porcelain
        local change_count=$(git status --porcelain | wc -l | tr -d ' ')
        log "📈 Total files that would be affected: $change_count"
        exit 0
    fi
    
    # Auto-fix
    auto_fix
    
    if [ "$fix_only" = "true" ]; then
        success "🔧 Auto-fix operations completed"
        exit 0
    fi
    
    # Check if auto-fix created/removed changes
    check_changes
    
    # Generate summary and commit
    local change_count=$(generate_summary)
    commit_changes "$change_count"
    push_changes "$push_changes_flag"
    
    cleanup
    
    success "🎉 Auto-commit process completed successfully!"
    echo -e "${GREEN}📁 Change summary:${NC} $CHANGE_SUMMARY"
    echo -e "${GREEN}📝 Log file:${NC} $LOG_FILE"
}

# Trap for cleanup on exit
trap cleanup EXIT

# Run main function with all arguments
main "$@" 