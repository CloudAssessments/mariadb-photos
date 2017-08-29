
File System Photo Upload Service
===================

PO: Anthony James

A demo to enable users to get and upload photos using Node.js, MariaDB, Redis, and Docker Compose

## Installation

## Development Installation
1. Clone the repository into your local machine
  - `git clone https://github.com/CloudAssessments/mariadb-photos.git`

## Development Deployment
### With Redis and MariaDB Containers
1. Ensure you have installed Docker and Docker-Compose. (see https://docs.docker.com/compose/install/ for details)
1. Build the image: `docker-compose build`
1. Run `docker-compose up`

### Specify your own external Redis and MariaDB/MySQL Servers
1. Ensure you have installed Docker and Docker-Compose. (see https://docs.docker.com/compose/install/ for details)
1. Specify the host/port and user/password (if applicable) in the environments section of `docker-compose-essential.yml`
1. Build the image: `docker-compose -f docker-compose-essential.yml build`
1. Run `docker-compose -f docker-compose-essential.yml up`

### Verifying Deployment
1. Navigate to the web-client homepage at [localhost:3000](localhost:3000)
1. Select an image file (jpeg, png, bmp only) and upload
1. Observe the image has had a greyscale filter applied to it and added to the list of images
- Note: You may see MySQL Connection errors, this may be because the MariaDB container is still initializing -- wait a couple seconds and refresh the page to see if the issue persists.

## Environment Variables
### Environment Variable Reference

**mariadb-photos:**
- `PORT`:
  - Default: "3000"
  - Description: The port number to listen on
- `MARIA_HOST`:
  - Default:
  - Docker: "mysql"
  - Local Machine: "localhost"
  - Description: The host name of the MariaDB Server to use
- `MARIA_PORT`:
  - Default: "3306"
  - Description: The port number of the MariaDB Server to use
- `MARIA_USER`:
  - Default: "root"
  - Description: The username of the login needed for the MariaDB Server
- `MARIA_PASSWORD`:
  - Default: none
  - Description: The password of the login needed for the MariaDB Server
- `REDIS_HOST`:
  - Default: none
  - Description: The host name of the Redis Server to use
- `REDIS_PORT`
  - Default: none
  - Description: The port number of the Redis Server to use
- `REDIS_URL`:
  - Default: none
  - Description: The url of the Redis Server to use
- `REDIS_PASSWORD`
  - Default: none
  - Description: The Redis server password

## Scripts
### Emptying Images from Upload Directory
There is a script at `src/scripts/empty-uploads` remove all images from the configured MariaDB
- You can run this script via `npm run empty-uploads`

## Debugging
### Environment Variables
You can view the relevant environment variables via: `localhost:3000/debug/app-vars`
### Sys Alive
You can verify the server is up and running via `localhost:3000/sys/alive`
### MariaDB (MySQL)
While deployed, you can access the working database on your host machine via `PORT: 3316`
### Redis
While deployed, you can access the Redis server on your host machine via `PORT: 6389`