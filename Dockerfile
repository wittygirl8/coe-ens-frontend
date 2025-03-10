FROM node:18-alpine

# Enable Corepack for managing Yarn versions
RUN corepack enable

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock first to leverage Docker caching
COPY package.json yarn.lock ./

# Install the correct Yarn version specified in package.json
RUN corepack prepare yarn@4.6.0 --activate \
    && yarn set version 4.6.0

# Install dependencies
RUN yarn install --immutable

# Copy the rest of the application code
COPY . .

# Verify Yarn version inside the container
RUN ls -la /app/.yarn/releases && yarn --version

# Expose the port for Vite
EXPOSE 5173

# Start the application in production mode
CMD ["yarn", "run", "preview"]
