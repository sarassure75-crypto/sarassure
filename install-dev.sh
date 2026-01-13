#!/bin/bash
# Installation script for development dependencies
# Usage: bash install-dev.sh

echo "📦 Installing development dependencies..."

# Install dev tools
npm install -D \
  eslint \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  prettier \
  vitest \
  @vitest/ui \
  husky

echo ""
echo "🪝 Setting up git hooks..."
npx husky install

echo ""
echo "✅ Development dependencies installed!"
echo ""
echo "📝 Next steps:"
echo "1. Run 'npm run quality' to check code"
echo "2. Run 'npm test' to run tests"
echo "3. Configure Sentry (optional):"
echo "   - npm install @sentry/react"
echo "   - Add VITE_SENTRY_DSN to .env.production"
echo ""
