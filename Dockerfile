FROM node:18-alpine

# Enable Corepack
RUN corepack enable 

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install the exact version of Yarn specified in package.json
RUN corepack prepare yarn@4.6.0 --activate && yarn set version 4.6.0

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Ensure Yarn is accessible
RUN yarn --version

# Expose port 5173 for Vite
EXPOSE 5173

# Start the application in production mode
CMD ["yarn", "run", "preview"]
