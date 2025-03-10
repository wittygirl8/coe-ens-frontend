
# Use a base image with Node.js to build the React app
FROM node:20.10.0 as build

WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package.json .npmrc ./

# Install dependencies
RUN npm install -g yarn --force

# Install dependencies
#RUN yarn install

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm build

# Use Nginx image to serve the static files
#FROM nginx:alpine

# Use Nginx image to serve the static files
FROM nginxinc/nginx-unprivileged:latest
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 5173