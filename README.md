node-usaepay
=============
USAEpay API wrapper for Node.js, fully promisified

## Functionality
* Card Not Present (`transactions` API)
	* Card tokenization
	* Sale with card token
	* Void sale
	* Refund amount
 * Card Present (`paymentengine` API)
	 * Create a Terminal and get a pairing code from USAEPay
	 * Delete a Terminal
     * Trigger a sale on a Terminal
     * Get the status of a sale on a Terminal (See below for details)

## Updating the framework
* `git tag x.x.x`
* `git push --tags`
* `nom publish`
* 
## Initialization

```
var usaepay = require('node-usaepay');
var conf = {
    key: '_your_key_',
    pin: '_your_pin_'
    urlsuffix: _you_url_key_,
    environment: 'sandbox'
};
var USAEpay = new usaepay(conf);
```

## Usage
See tests https://github.com/Starchup/node-usaepay/blob/master/test.js

## Terminal Sale Statuses
* A sale is considered pending when the status returned is: `signature capture error`, `canceled`, `transaction canceled`, `transaction failed`, `timeout`, `error`
* A sale is considered completed when the status returned is `transaction complete`
* A sale is considered failed when the result code of the request is `E`, `D`, or anything that isn't captured in the above statuses
