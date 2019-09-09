# node-usaepay
USAEPay API wrapper for Node.js, fully promisified

#### Initialization

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

#### Usage

```
USAEpay.Card.Create(
{
    cardNumber: 'xxxxxxxxxxxxxxxx',
    exp: 'xx/xx',
    cvv: 'xxx',
    firstName: 'x',
    lastName: 'x',
    address: 'x',
    zipcode: 'xxxxx'
});
```
```
USAEpay.Card.Sale(
{
    foreignKey: __your_card_id__,
    amount: 1
});
```