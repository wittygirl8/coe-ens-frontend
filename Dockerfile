FROM node:18-alpine

# Enable Corepack to manage Yarn versions
RUN corepack enable && corepack prepare yarn@4.6.0 --activate

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies using the correct Yarn version
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Expose port 5173 for Vite
EXPOSE 5173

# Start the application in production mode
CMD ["yarn", "run", "preview"]
