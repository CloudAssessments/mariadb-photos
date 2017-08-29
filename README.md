
File System Photo Upload Service
===================

PO: Anthony James

A demo to enable users to get and upload photos using Node.js, MariaDB, Redis, and Docker Compose

## Installation

## Development Installation
1. Clone the repository into your local machine

## Development Deployment
1. Ensure you have installed Docker and Docker-Compose. (see https://docs.docker.com/compose/install/ for details)
1. Build the image: `docker-compose build`
1. Run `docker-compose up`

### Verifying Deployment
1. Naviate to the web-client homepage at [localhost:3000](localhost:3000)
1. Select an image file (jpeg, png, bmp only) and upload
1. Observe the image has had a greyscale filter applied to it and added to the list of images

## Troubleshooting
### MariaDB (MySQL)
While deployed, you can access the working database on your host machine via `PORT: 3316`
### Redis
While deployed, you can access the Redis server on your host machine via `PORT: 6389`