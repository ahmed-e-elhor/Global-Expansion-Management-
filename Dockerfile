FROM node:20-alpine

WORKDIR /usr/src/app

RUN npm install -g @nestjs/cli ts-node typescript

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps --only=production

# Copy source files
COPY . .

# Build app
RUN npm run build

# Expose NestJS default port
EXPOSE 3000

# Run in production mode
CMD ["npm", "run", "start:prod"]
