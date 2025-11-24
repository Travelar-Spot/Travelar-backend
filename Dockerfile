FROM node:18-alpine AS base

WORKDIR /usr/src/app

# Copy package definition first to leverage Docker cache
COPY package*.json ./

# Install dependencies (Clean Install is safer, but 'install' is more flexible for dev)
RUN npm install

# Copy the rest of the application code
COPY . .

EXPOSE 3000

# Use sh -c to ensure npm install runs before starting dev server
# This fixes issues with volume sync on Windows where modules might be missing
CMD sh -c "npm install && npm run dev"