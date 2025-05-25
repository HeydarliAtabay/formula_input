#!/bin/bash

# Install dependencies
npm install

# Build the project
npm run build

# Make sure the output directory exists
mkdir -p dist

# Success message
echo "Build completed successfully!" 