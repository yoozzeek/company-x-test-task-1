# company-x-test-task-1
Simple Fastify Rest API with auth guard, JWT middleware and login/register methods. 
This project is a part of technical interview for a position of Node.js backend developer.  

## Installation
The app requires you have postgres database installed and running. 
Obviously, we'll use docker compose for development and tests for simplicity.

Add and setup `.env` file. You need to pass correct postgres database URL. 
It's configured for docker compose in the example env.
```base
cp .env.example .env
```

### Docker
Run rest api server and all necessary services:
```bash
docker compose up --build
```

### Local
If you have local postgres on your machine or in a cloud, 
you need to build from the sources and run server without docker.
```bash
yarn build && yarn start
```

## Tests
Auth logic unit and E2E tests are critical and simple, 
so we cannot omit them for even a test task.

One command will just run all unit tests, and programmatically 
create test postgres container with `testcontainers` and run E2E tests of API. 
Ensure you have docker installed.
```bash
yarn test
```