<p align="center">
    <img width="100" height="100" src="https://d33wubrfki0l68.cloudfront.net/49c2be6f2607b5c12dd27f8ecc8521723447975d/f05c5/logo-small.cbbeba89.svg" alt="NestJS">
    <img width="100" height="100" src="https://upload.wikimedia.org/wikipedia/commons/2/29/Postgresql_elephant.svg" alt="PostgreSQL">
    <img width="100" height="100" src="https://jwt.io/img/pic_logo.svg" alt="jwt">
    <img width="100" height="100" src="https://upload.wikimedia.org/wikipedia/commons/a/ab/Swagger-logo.png" alt="swagger">
</p>

<h1 align="center">
    NestJS v6 Boilerplate
</h1>
  
<p align="center">
  <strong>(WIP)</strong>: Inspired by many examples found at <a href="https://github.com/juliandavidmr/awesome-nestjs">awesome-nestjs</a><br/>
  <p align="center">
      Based heavily (shamelessly stolen) off <a href="https://github.com/NarHakobyan/awesome-nest-boilerplate">awesome-nest-boilerplate</a>
  </p>
</p>

<p align="center">
<a href="https://img.shields.io/github/license/p-mcgowan/nestjs-boilerplate?style=flat-square" target="_blank"><img src="https://img.shields.io/github/license/p-mcgowan/nestjs-boilerplate?style=flat-square" alt="License"/></a>
<a href="https://img.shields.io/snyk/vulnerabilities/github/p-mcgowan/nestjs-boilerplate?style=flat-square" target="_blank"><img src="https://img.shields.io/snyk/vulnerabilities/github/p-mcgowan/nestjs-boilerplate?style=flat-square" alt="Snyk"/></a>
<a href="https://img.shields.io/github/languages/code-size/p-mcgowan/nestjs-boilerplate?style=flat-square" target="_blank"><img src="https://img.shields.io/github/languages/code-size/p-mcgowan/nestjs-boilerplate?style=flat-square" alt="Code Size"/></a>
<a href="https://img.shields.io/github/package-json/v/p-mcgowan/nestjs-boilerplate?style=flat-square" target="_blank"><img src="https://img.shields.io/github/package-json/v/p-mcgowan/nestjs-boilerplate?style=flat-square" alt="Version"/></a>
<a href="https://img.shields.io/github/languages/top/p-mcgowan/nestjs-boilerplate?style=flat-square" target="_blank"><img src="https://img.shields.io/github/languages/top/p-mcgowan/nestjs-boilerplate?style=flat-square" alt="Top Language"/></a>
<!-- <a href="https://img.shields.io/codacy/grade/uuid?style=flat-square" target="_blank"><img src="https://img.shields.io/codacy/grade/uuid?style=flat-square" alt="Codacity Code Quality"/></a> -->
</p>

## Description

Starter kit project made with [Nest](https://github.com/nestjs/nest) that demonstrates CRUD user, JWT authentication, CRUD posts and e2e tests.

### Technologies implemented:

-   [PostgreSQL](https://www.postgresql.org/)
-   [JWT](https://jwt.io/)
-   [Jest](https://jestjs.io/)
-   [Swagger](https://swagger.io/)

## Prerequisites

-   [Node.js](https://nodejs.org/) (>= 10.8.0)
-   [npm](https://www.npmjs.com/) (>= 6.5.0)

## Installation

```bash
$ npm install
```

## Setting up the database for development and test

PostgreSQL database connection options are shown in the following table:

| Option   | Development | Test         |
| -------- | ----------- | ------------ |
| Host     | localhost   | localhost    |
| Port     | 5435        | 5435         |
| Username | postgres    | postgres     |
| Password | postgres    | postgres     |
| Database | nest-db     | test-nest-db |

## Running the app

```bash
# development (watch mode)
$ npm start

# production mode
$ npm run start:prod
```

## Test

```bash
# e2e tests
$ npm run test
```

## Other commands

```bash
# formatting code
$ npm run format

# run linter
$ npm run lint

# create database
$ npm run db:create

# run migrations
$ npm run db:migrate

# run seeders
$ npm run db:seed-dev

# reset database
$ npm run db:reset

# drop database
$ npm run db:drop

```

## Run production configuration

```
NODE_ENV=production \
DATABASE_HOST=db.host.com \
DATABASE_PORT=5432 \
DATABASE_USER=user \
DATABASE_PASSWORD=pass \
DATABASE_DATABASE=database \
JWT_PRIVATE_KEY=jwtPrivateKey \
ts-node -r tsconfig-paths/register src/main.ts
```

## Swagger API docs

This project uses the Nest swagger module for API documentation. [NestJS Swagger](https://github.com/nestjs/swagger) - [www.swagger.io](https://swagger.io/)  
Swagger docs will be available at localhost:app-port/documentation

## Features

<dl>
  <dt><b>Quick scaffolding</b></dt>
  <dd>Create modules, services, controller - right from the CLI!</dd>

  <dt><b>Instant feedback</b></dt>
  <dd>Enjoy the best DX (Developer eXperience) and code your app at the speed of thought! Your saved changes are reflected instantaneously.</dd>

  <dt><b>JWT Authentication</b></dt>
  <dd>Installed and configured JWT authentication.</dd>

  <dt><b>Next generation Typescript</b></dt>
  <dd>Always up to date typescript version.</dd>

  <dt><b>Industry-standard routing</b></dt>
  <dd>It's natural to want to add pages (e.g. /about`) to your application, and routing makes this possible.</dd>

  <dt><b>Environment Configuration</b></dt>
  <dd>development, staging and production environment configurations</dd>

  <dt><b>Swagger Api Documentation</b></dt>
  <dd>Already integrated API documentation. To see all available endpoints visit http://localhost:3000/documentation</dd>

  <dt><b>Linter</b></dt>  
  <dd>tslint + eslint + prettier = ❤️</dd>
</dl>

## Documentation

This project includes a `docs` folder with more details on:

1.  [Setup and development](./docs/development.html#first-time-setup)
1.  [Architecture](./docs/architecture.html)
