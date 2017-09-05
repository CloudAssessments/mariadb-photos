FROM node:8.4

# Deps
RUN apt-get update && apt-get install -y ca-certificates git-core ssh

# Our source
RUN mkdir /app
WORKDIR /app

# Copy over only files needed to install dependencies
# This will allow Docker to reuse a cached image if no dependencies have changed
# effectively speeding up image build times on local machines
ADD ./package.json /app
ADD ./package-lock.json /app
RUN npm install -q

# Copy over all source
ADD . /app