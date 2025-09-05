# Use the official Node.js runtime as the base image
FROM node:22-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Install gulp globally first
RUN npm install -g gulp-cli

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Copy gulpfile.js for the postinstall script
COPY gulpfile.js ./

# Copy bower_components and other_components needed for gulp tasks
COPY bower_components/ ./bower_components/
COPY other_components/ ./other_components/
COPY app/ ./app/

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Create uploads directory if needed
RUN mkdir -p uploads

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the application
CMD ["npm", "start"]
