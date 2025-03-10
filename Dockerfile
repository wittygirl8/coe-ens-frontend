# Use a base image
FROM node:18

# Set working directory
WORKDIR /app

# Install dependencies
RUN corepack enable && corepack prepare yarn@stable --activate

# Verify Yarn installation
RUN yarn --version

# Copy the project files
COPY . .

# Install project dependencies
RUN yarn install

# Expose the port for Vite
EXPOSE 5173

# Start the frontend
CMD ["yarn", "dev"]
