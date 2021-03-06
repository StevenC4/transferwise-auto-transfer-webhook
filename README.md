# TransferWise Auto-Transfer Webhook

## stevenc4/transferwise-auto-transfer-webhook

An API built to handle TransferWise balance-account webhook events.

### Requirements

#### TransferWise

As of the publishing of this repo, the following are requirements for creating a webhook subscription in TransferWise. For more specific information, see the [TransferWise webhook documentation](https://api-docs.transferwise.com/#profile-webhooks).
* Has a valid domain name (IPs are disallowed)
* Listens to HTTPS requests on port 443
* Has a valid HTTPS certificate signed by a trusted Certificate Authority - CA (self-signed or expired certificates are not accepted)
* Does not include any query arguments in the URL

#### Other

* You must create a .env file if you are running the service via the included docker-compose.yaml file
* You must generate a TransferWise API token

#### Running the service

### Recommendations
* To satisfy the first three requirements, I recommend making use of [jwilder/nginx-proxy](https://github.com/jwilder/nginx-proxy) and [JrCs/docker-letsencrypt-nginx-proxy-companion](https://github.com/JrCs/docker-letsencrypt-nginx-proxy-companion) if you don't aready have a framework for exposing services to the internet.
* Set up a [TransferWise sandbox account](https://sandbox.transferwise.tech/) if you want to test any TransferWise API calls.

### Getting Started

1. Clone the github repository.
2. Log into your TransferWise account and generate an API token. Paste the token into a .env file (should be ignored by git), using the [`TRANFERWISE_API_TOKEN`](#TRANFERWISE_API_TOKEN) environment variable.
3. In your terminal, from the project root, run `npm run get-profile`. Copy the `id` field from the response and set it in the .env file for the [TRANSFERWISE_PROFILE_ID](#TRANSFERWISE_PROFILE_ID) environment variable.
4. In your terminal, run `npm run get-accounts`. In the response, find the account that you want to use as your target account for your automatic transfers and copy the `id` field into the .env file for the [TRANSFERWISE_TARGET_ACCOUNT_ID](#TRANSFERWISE_TARGET_ACCOUNT_ID) environment variable.
5. In your terminal, run `npm run get-borderless-accounts`. In the response, find the account and balance that you want to use as the source balance for your automatic transfers. Copy the `id` field from the correct balance into the .env file for the [TRANSFERWISE_SOURCE_BALANCE_ID](#TRANSFERWISE_SOURCE_BALANCE_ID) environment variable.
6. Using the `DOCKER_NETWORK_NAME` in your .env file, specify the existing docker bridge network on which the service will run.
7. From your terminal, run `docker-compose up -d`.


#### Assumptions
* This guide assumes you have already satisfied all of the requirements listed above.
* The included docker-compose file assumes you will be running your container on an existing docker bridge network

If you will be running this project via docker-compose, you can change configurable options by defining environment variables in a .env file.

If you will be running this project via the included docker-compose file, you must define the environment variable `DOCKER_NETWORK_NAME` in a .env file. If you attempt to start the service via the docker-compose file without creating a .env file, it will fail.

### Configuration

The following environment variables can be set to configure the service:

#### `APP_ENV`
Possible values: `development`, `staging`, `test` or `production`

If set to `staging`:
* The loggers will log to the console in addition to the log files
* The service will make API calls against the TransferWise sandbox API
* The service will use the TransferWise sandbox public key for public key verification

If set to `production`:
* The loggers will log only to the log files
* The service will make API calls against the TransferWise production API
* The service will use the TransferWise production public key for public key verification

#### `LOG_TRANSFERWISE_ENTITIES`
Possible values: `true` or `false`

If set to `true`:
* The service will log:
  * Event bodies for incoming TransferWise webhook events
  * Return values for all TransferWise API calls

If set to `false`:
  * The service will not log any of the information mentioned above

#### `TRANSFERWISE_TARGET_ACCOUNT_ID`
The ID of the target account to which inbound money will be automatically transferred.

You can discover this by running `npm run get-accounts` and looking over the list of accounts you get back.

#### `TRANSFERWISE_SOURCE_BALANCE_ID`
The ID of the source TransferWise balance from which money will be automatically transferred whenever it is deposited.

You can discover this by running `npm run get-borderless-accounts` and looking over the list of balances you get back.

#### `TRANFERWISE_API_TOKEN`
The TransferWise API token you generated from your profile page.

#### `TRANSFERWISE_PROFILE_ID`
Your transferwise profile ID. You can discover this by running `npm run get-profile`. This is necessary for creating a quote, executing the funding of a transfer, and getting a list of balances.
