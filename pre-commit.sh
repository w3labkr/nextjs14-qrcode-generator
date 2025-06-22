#!/bin/sh

# Path to the Git pre-commit hook script file
GIT_HOOK_FILE=".git/hooks/pre-commit"

# Create .git/hooks directory if it doesn't exist
mkdir -p "$(dirname "$GIT_HOOK_FILE")"

# Write the pre-commit script content to the file
cat > "$GIT_HOOK_FILE" << 'EOF'
#!/bin/sh

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

echo "Running pre-commit hook: Automatically updating patch version..."
if [ ! -f package.json ]; then
  echo "No package.json found. Skipping version bump."
  exit 0
fi

echo "Incrementing patch version in package.json..."
npm version patch --no-git-tag-version
if [ $? -ne 0 ]; then
  echo "Failed to increment version with 'npm version patch'."
  exit 1
fi

echo "Staging updated package.json and package-lock.json..."
git add package.json package-lock.json
if [ $? -ne 0 ]; then
  echo "Failed to stage package.json and package-lock.json."
  exit 1
fi

echo "Patch version updated and files staged successfully."
exit 0
EOF

# Grant execute permission to the pre-commit hook script
chmod +x "$GIT_HOOK_FILE"

echo "Git pre-commit hook has been set up successfully: $GIT_HOOK_FILE"
