# TransferWise Auto-Transfer Webhook

## stevenc4/transferwise-auto-transfer-webhook

An API built to handle TransferWise balance-account webhook events.

### Requirements

As of the publishing of this repo, the following are requirements for creating a webhook subscription in TransferWise. For more specific information, see the [TransferWise webhook documentation](https://api-docs.transferwise.com/#profile-webhooks).
* Has a valid domain name (IPs are disallowed)
* Listens to HTTPS requests on port 443
* Has a valid HTTPS certificate signed by a trusted Certificate Authority - CA (self-signed or expired certificates are not accepted)
* Does not include any query arguments in the URL

### Recommendations
* To satisfy the first three requirements, I recommend making use of [jwilder/nginx-proxy](https://github.com/jwilder/nginx-proxy) and [JrCs/docker-letsencrypt-nginx-proxy-companion](https://github.com/JrCs/docker-letsencrypt-nginx-proxy-companion) if you don't aready have a framework for exposing services to the internet.
* Set up a [TransferWise sandbox account](https://sandbox.transferwise.tech/) if you want to test any TransferWise API calls.
