# company-x-test-task-1
Simple Fastify auth service Rest API with guard, JWT middleware and login/register handlers. 
This project is a part of technical interview for a position of Node.js backend developer.

I don't use Nest.js here because it's overkill for a task, but still use OpenTelemetry 
because whatever framework or library we use for auth service the observability 
as well as security is critical.

## Installation
The app requires you have `Postgres` database installed and running. 
Obviously, we'll use docker compose for development and tests for simplicity.

### Setup env
Add and setup `.env` file. You need to pass correct postgres database URL. 
It's configured for docker compose in the example env.
```base
cp .env.example .env
```

### Generate jwt keys
We don't allow simple secret strings for jwt in purpose of security, 
jwt server secret key should be cryptographically safe and random. 
Test keys already created and stored in `dev` dir.
But in case you need to create new ones follow these instructions.

Generate RSA secret key:
```bash
openssl genpkey -algorithm RSA -out dev/private.key -pkeyopt rsa_keygen_bits:2048
```

Derive public key:
```bash
openssl rsa -in dev/private.key -pubout -out dev/public.key
```


### Docker
Docker compose will start api backend, postgres and all other 
services. It also runs `migrate:up` command before starting backend.
```bash
docker compose up --build
```

### Sources
If you have local postgres on your machine or in a cloud, 
you need to build from the sources and run server without docker.
```bash
yarn build && yarn start
```

#### Up migrations
Now you need to up apply migrations to database:
```bash
yarn migrate:up
```

## Tests
Auth logic unit and E2E tests are critical and simple, 
so we cannot omit them for even a test task.

One command will just run all unit tests, and programmatically 
create test postgres container with `testcontainers` package and 
run E2E tests of API. Ensure you have docker installed.
```bash
yarn test
```

## Monitoring
OpenTelemetry tracer and metric providers integrated and a few simple counters added.
Every API requests stays observed, errors are tracked. We use Prometheus collector, 
Jaeger for traces, and Graphana for metrics visualization.

1. Run `docker compose up --build`.
2. Open Jaeger dashboard `http://localhost:11111` to see requests and traces.
3. Open Graphana charts `http://localhost:111111` to see live metrics.
