## Description

An URL shortener API, made with [Nest](https://github.com/nestjs/nest), [Kysely](https://github.com/kysely-org/kysely) + PostgreSQL.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# Start the database (it will automatically create the tables)
$ docker compose up -d

# Start the API
$ npm run start
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
