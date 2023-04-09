# Use official pre-build image ver 19 (on debian)
FROM node:19

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production 
# RUN npm ci --only=production

# Copy rest of the files (index.ts, etc)
COPY . .
EXPOSE 3000

#  CONFIG DATABASE
# RUN apk add postgresql-client
# COPY init.sh /usr/src/app
# RUN chmod 755 /usr/src/app/init.sh
# ENTRYPOINT []


