# API Quickstart Tests

Tests for [API Quickstart samples](https://auth0.com/docs/quickstart/backend).

## Getting Started

Clone the repo and install the dependencies.

```bash
npm install
```

## Configure Auth0's API and Clients

[Create an API](https://manage.auth0.com/#/apis), and set the scopes of `read:messages` and `write:messages`.

[Create four clients](https://manage.auth0.com/#/clients) of type **Non Interactive Clients**.

Configure the following grant between clients and API:
* A client grant without any scope.
* A client grant with a scope of `read:messages`.
* A client grant with a scope of `write:messages`.
* A client grant with the scopes of `read:messages` and `write:messages`.

## Set up the `.env` file

Rename `.env.example` to `.env` and replace the values for variables:
* `AUTH0_DOMAIN` with your Auth0's domain.
* `AUTH0_AUDIENCE` with your api identifier configured above.
* `AUTH0_CLIENT_ID_1` and `AUTH0_CLIENT_SECRET_1` with **client id** and **client secret** from the client without any scope granted.
* `AUTH0_CLIENT_ID_2` and `AUTH0_CLIENT_SECRET_2` with **client id** and **client secret** from the client with a scope of `read:messages` granted.
* `AUTH0_CLIENT_ID_3` and `AUTH0_CLIENT_SECRET_3` with **client id** and **client secret** from the client with a scope of `write:messages` granted.
* `AUTH0_CLIENT_ID_4` and `AUTH0_CLIENT_SECRET_4` with **client id** and **client secret** from the client with the scopes of `read:messages` and `write:messages` granted.

## Running the tests

In order to run the tests execute:

```bash
npm test
```
