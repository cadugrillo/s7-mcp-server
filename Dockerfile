# Use an official Node.js runtime as the base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if present) to the working directory
# This allows Docker to cache the npm install step, improving build times
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Define the command to run your application
CMD [ "node", "index.js" ]