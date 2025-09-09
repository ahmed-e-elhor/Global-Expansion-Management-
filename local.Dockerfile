FROM node:20-alpine

WORKDIR /usr/src/app

# Install NestJS CLI and ts-node globally
RUN npm install -g @nestjs/cli ts-node typescript

# Copy package files
COPY package*.json ./

# Install dependencies with --legacy-peer-deps flag
RUN npm install --legacy-peer-deps

# Copy application files
COPY . .

# Expose NestJS default port
EXPOSE 3000

# Set NODE_ENV to development and enable polling
ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

# Run in development mode with nodemon
CMD ["npm", "run", "start:dev:nodemon"]