# Build on the node:latest image
FROM node

ENV APP_DIR /usr/src/app

# Create an app directory
RUN mkdir -p /usr/src/app
WORKDIR ${APP_DIR}

# Copy package.json file
COPY package.json ${APP_DIR}

# Run npm install to install dependencies
RUN npm install

# Copy server.js and public dir
COPY server.js ${APP_DIR}
COPY public ${APP_DIR}/public

# Export port specified as ${PORT}
ENV PORT 1347
EXPOSE ${PORT}

# Set some environment variables for Node app
ENV NODE_ENV production
ENV NPM_CONFIG_LOGLEVEL info

# Start the application
CMD ["npm", "start"]
