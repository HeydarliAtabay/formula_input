#!/bin/bash

# Install dependencies
npm install

# Install terser explicitly
npm install terser --save-dev

# Build the project
npm run build

# Make sure the output directory exists
mkdir -p dist

# Success message
echo "Build completed successfully!" 