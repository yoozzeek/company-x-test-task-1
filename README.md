# company-x-test-task-1
Simple Fastify auth service Rest API with guard, JWT middleware and login/register handlers. 
This project is a part of technical interview for a position of Node.js backend developer.

I don't use Nest.js here because it's overkill for a task, but still use OpenTelemetry 
because whatever framework or library we use for auth service the observability 
as well as security is critical.

### Urls

After installation and start http server will be listening at http://127.0.0.1:3000.

All routes available with `/v1` prefix and follow Rest API spec.
So final handlers be at these urls:
* `/v1/auth/login`: Authorizes user and returns JWT token.
* `/v1/auth/register`: Creates user with email and password.
* `/v1/users`: Returns list of all users if request has valid jwt token.

### API Docs

Check API docs in Swagger UI that is available at http://127.0.0.1:3000/docs

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
Test keys already created and stored in `/test/keys` dir for your convenience,
but in the real project even test keys should not be added to source code and git. 
Sec CI just should reject it.

But in case you need to create new ones follow these instructions.

Generate RSA secret key:
```bash
openssl genpkey -algorithm RSA -out test/private.key -pkeyopt rsa_keygen_bits:2048
```

Derive public key:
```bash
openssl rsa -in test/private.key -pubout -out test/public.key
```

### Run migrations
Pass `DATABASE_URL` env and run postgres migrations: 
```bash
DATABASE_URL=postgres://service:password@localhost:5432/service yarn migrate:up
```

## Start

### Docker compose
Docker compose will start api backend, postgres and all other 
services. It also runs `migrate:up` command before starting backend.
```bash
docker compose up --build
```

### Sources
If you have local postgres on your machine or in a cloud, 
you need to build from the sources and run server without docker.

Then build and start API server:
```bash
yarn build && yarn start
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
2. Open Jaeger UI `http://localhost:16686` to see requests and traces.
