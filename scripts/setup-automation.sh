#!/bin/bash

# 🚀 Neon Automation Pipeline Setup Script
# Initializes the complete automation system for the repository

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Logging functions
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log "🔍 Checking prerequisites..."
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        error "Not in a git repository! Please run this script from the repository root."
    fi
    
    # Check Node.js
    if ! command -v node > /dev/null 2>&1; then
        error "Node.js is not installed! Please install Node.js 18+ to continue."
    fi
    
    # Check npm
    if ! command -v npm > /dev/null 2>&1; then
        error "npm is not installed! Please install npm to continue."
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        warn "Node.js version is $NODE_VERSION. Recommended version is 18+."
    fi
    
    success "✅ All prerequisites met"
}

# Install dependencies
install_dependencies() {
    log "📦 Installing dependencies..."
    
    cd "$REPO_ROOT"
    
    if npm install; then
        success "✅ Dependencies installed successfully"
    else
        error "Failed to install dependencies"
    fi
    
    # Install automation-specific dependencies if needed
    if ! npm list chokidar > /dev/null 2>&1; then
        log "Installing file watcher dependencies..."
        npm install --save-dev chokidar
    fi
    
    if ! npm list husky > /dev/null 2>&1; then
        log "Installing git hooks dependencies..."
        npm install --save-dev husky
    fi
    
    if ! npm list prettier > /dev/null 2>&1; then
        log "Installing code formatter..."
        npm install --save-dev prettier
    fi
}

# Setup Git hooks
setup_git_hooks() {
    log "🪝 Setting up Git hooks..."
    
    cd "$REPO_ROOT"
    
    # Initialize Husky
    if npm run prepare > /dev/null 2>&1; then
        success "✅ Husky initialized"
    else
        warn "Husky initialization failed, continuing..."
    fi
    
    # Make pre-commit hook executable
    if [ -f ".husky/pre-commit" ]; then
        chmod +x .husky/pre-commit
        success "✅ Pre-commit hook configured"
    else
        warn "Pre-commit hook not found"
    fi
}

# Configure scripts
configure_scripts() {
    log "📝 Configuring automation scripts..."
    
    cd "$REPO_ROOT"
    
    # Make shell scripts executable
    if [ -f "scripts/auto-commit.sh" ]; then
        chmod +x scripts/auto-commit.sh
        success "✅ Auto-commit script configured"
    else
        warn "Auto-commit script not found"
    fi
    
    # Test Node.js watcher script
    if [ -f "scripts/watch-and-commit.js" ]; then
        if node -c scripts/watch-and-commit.js 2>/dev/null; then
            success "✅ File watcher script validated"
        else
            warn "File watcher script has syntax issues"
        fi
    else
        warn "File watcher script not found"
    fi
}

# Setup GitHub Actions
setup_github_actions() {
    log "🔄 Configuring GitHub Actions..."
    
    if [ -f ".github/workflows/auto-import-commit.yml" ]; then
        success "✅ GitHub Actions workflow found"
        info "   Workflow will run on: push, PR, schedule, manual dispatch"
    else
        warn "GitHub Actions workflow not found"
    fi
}

# Initialize database if needed
setup_database() {
    log "🗄️ Setting up database..."
    
    cd "$REPO_ROOT"
    
    if [ -f "packages/database/prisma/schema.prisma" ]; then
        log "Generating Prisma client..."
        if npm run db:generate > /dev/null 2>&1; then
            success "✅ Prisma client generated"
        else
            warn "Prisma client generation failed"
        fi
        
        log "Pushing database schema..."
        if npm run db:push > /dev/null 2>&1; then
            success "✅ Database schema synchronized"
        else
            warn "Database schema push failed (this may be normal for new setups)"
        fi
    else
        info "No Prisma schema found, skipping database setup"
    fi
}

# Create initial configuration files
create_config_files() {
    log "⚙️ Creating configuration files..."
    
    cd "$REPO_ROOT"
    
    # Create .prettierrc if it doesn't exist
    if [ ! -f ".prettierrc" ]; then
        cat > .prettierrc << EOF
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid"
}
EOF
        success "✅ Prettier configuration created"
    fi
    
    # Create .gitignore additions if needed
    if ! grep -q ".auto-commit.log" .gitignore 2>/dev/null; then
        echo "" >> .gitignore
        echo "# Automation logs" >> .gitignore
        echo ".auto-commit.log" >> .gitignore
        echo ".last-changes.md" >> .gitignore
        echo ".auto-import-log" >> .gitignore
        success "✅ Git ignore patterns added"
    fi
}

# Test automation pipeline
test_automation() {
    log "🧪 Testing automation pipeline..."
    
    cd "$REPO_ROOT"
    
    # Test shell script in dry-run mode
    if [ -f "scripts/auto-commit.sh" ]; then
        log "Testing auto-commit script..."
        if ./scripts/auto-commit.sh --dry-run > /dev/null 2>&1; then
            success "✅ Auto-commit script test passed"
        else
            warn "Auto-commit script test failed"
        fi
    fi
    
    # Test file watcher in dry-run mode
    if [ -f "scripts/watch-and-commit.js" ]; then
        log "Testing file watcher..."
        # Note: Can't easily test watcher in CI, just validate syntax
        if node -c scripts/watch-and-commit.js 2>/dev/null; then
            success "✅ File watcher syntax validated"
        else
            warn "File watcher has syntax issues"
        fi
    fi
    
    # Test npm scripts
    log "Testing npm scripts..."
    if npm run format:check > /dev/null 2>&1; then
        success "✅ Prettier formatting test passed"
    else
        warn "Prettier test failed (may need to run npm run format first)"
    fi
}

# Display usage instructions
show_usage_instructions() {
    echo ""
    echo -e "${PURPLE}🎉 Automation Pipeline Setup Complete!${NC}"
    echo -e "${CYAN}==============================================${NC}"
    echo ""
    echo -e "${GREEN}Available Commands:${NC}"
    echo ""
    echo -e "${BLUE}Local Automation:${NC}"
    echo "  npm run auto-commit         # Auto-commit changes locally"
    echo "  npm run auto-commit:push    # Auto-commit and push to remote"
    echo ""
    echo -e "${BLUE}Real-time Watching:${NC}"
    echo "  npm run watch-commit        # Watch files and auto-commit"
    echo "  npm run watch-commit:push   # Watch, commit, and push"
    echo "  npm run watch-commit:verbose # Watch with detailed logging"
    echo ""
    echo -e "${BLUE}Manual Commands:${NC}"
    echo "  ./scripts/auto-commit.sh --dry-run  # Preview changes"
    echo "  ./scripts/auto-commit.sh --fix-only # Only auto-fix code"
    echo ""
    echo -e "${BLUE}Git Hooks:${NC}"
    echo "  git commit -m \"message\"     # Auto-fixes applied before commit"
    echo ""
    echo -e "${GREEN}GitHub Actions:${NC}"
    echo "  • Runs automatically on push/PR"
    echo "  • Manual trigger available in GitHub UI"
    echo "  • Scheduled runs every hour"
    echo ""
    echo -e "${GREEN}Documentation:${NC}"
    echo "  📖 docs/AUTOMATION_PIPELINE.md"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "  1. Test with: npm run auto-commit -- --dry-run"
    echo "  2. Start file watcher: npm run watch-commit:verbose"
    echo "  3. Make some changes and see automation in action!"
    echo ""
}

# Main setup function
main() {
    echo -e "${PURPLE}🚀 Neon Automation Pipeline Setup${NC}"
    echo -e "${CYAN}====================================${NC}"
    
    cd "$REPO_ROOT"
    
    # Run setup steps
    check_prerequisites
    install_dependencies
    setup_git_hooks
    configure_scripts
    setup_github_actions
    setup_database
    create_config_files
    test_automation
    
    # Show final instructions
    show_usage_instructions
    
    success "🎉 Setup completed successfully!"
    echo ""
    echo -e "${GREEN}Your repository is now fully automated! 🤖${NC}"
}

# Run setup if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 