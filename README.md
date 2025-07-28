# company-x-test-task-1
A simple Fastify-based REST API for auth with JWT middleware and login/register handlers.
This project is part of a Node.js backend developer technical interview.

Nest.js isn't used here it's too heavy for this task. Funny, but OpenTelemetry is 
still included, since observability and security are essential no matter what framework we use.

### Endpoints
After setup, the HTTP server runs at:
http://127.0.0.1:3000

All routes are prefixed with `/v1` and follow REST API conventions:
* `POST /v1/auth/login` – Authenticate and return a JWT token
* `POST /v1/auth/register` – Register a new user
* `GET /v1/users` – Return list of users (JWT required)

### API Docs
Swagger UI is available at:
http://127.0.0.1:3000/docs


## Installation
You need a running Postgres database. We use Docker Compose for development and tests.

### Setup .env
Copy the example and edit as needed:
```base
cp .env.example .env
```

Make sure to set the correct Postgres connection params.

### Generate jwt keys
JWT tokens can be signed using either RSA or HMAC algorithms.

#### HMAC
HMAC is significantly faster (up to 100x compared to RSA) and is suitable 
when a single server issues and validates tokens. To use HMAC signing, provide a secret 
key via the env variable `JWT_HMAC_SECRET_KEY`.

Generate a secure random key:
```bash
openssl rand -hex 32
```

#### RSA
RSA signing is slower but supports public-key rotation and validation across multiple clients.
Test keys are included in `/test/keys` for convenience. However, in production and even during 
tests, never commit RSA keys into the repository. CI pipeline should enforce this rule.

Generate a new RSA key pair:
```bash
# Private key
openssl genpkey -algorithm RSA -out test/private.key -pkeyopt rsa_keygen_bits:2048

# Public key
openssl rsa -in test/private.key -pubout -out test/public.key
```

After generating the keys, specify their paths using these environment variables:
* `JWT_PRIVATE_KEY_PATH`: Path to your priv key.
* `JWT_PUBLIC_KEY_PATH`: Path to your pub key.

## Start API
A server will run all migrations automatically on start.

### With Docker compose
Runs API backend, Postgres, and other services:
```bash
docker compose up --build
```

### From Source
If you already have Postgres running locally or in the cloud:
```bash
yarn build && yarn start
```

## Tests
This project includes both unit and E2E tests. We'll use Docker and `testcontainers`.
```bash
yarn test
```

## Monitoring
OpenTelemetry is integrated with simple counters and error tracking. We use:
* Jaeger for tracing
* Prometheus for metrics
* Grafana for visualization

To run everything:
```bash
docker compose up --build
```

Then open Jaeger UI:
http://localhost:16686
