# Use an official Node.js runtime as the base image
FROM node:22-alpine AS build

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if present) to the working directory
# This allows Docker to cache the npm install step, improving build times
COPY package*.json ./

# Install application dependencies
RUN npm install

# Install ncc for bundling
RUN npm install -g @vercel/ncc

# Copy the rest of the application code
COPY . .

# Compile TypeScript files to JavaScript and Bundle the application
RUN npm run bundle

# Use a smaller base image for the final stage
FROM node:22-alpine

# Copy the compiled and bundled application from the build stage
COPY --from=build /usr/src/app/bundle /usr/src/app

# Set the working directory in the final container
WORKDIR /usr/src/app

# Define the command to run your application
CMD [ "node", "index.js" ]