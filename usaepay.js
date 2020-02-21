/**
 * Modules from the community: package.json
 */
var crypto = require('crypto');
var got = require('got');

var production = 'https://secure.usaepay.com/api/';
var sandbox = 'https://sandbox.usaepay.com/api/';

/**
 * Constructor
 */
var usaepay = function (config)
{
    var self = this;

    self.Card = {
        Create: function (options)
        {
            self.Util.validateArgument(options, 'options');
            self.Util.validateArgument(options.cardNumber, 'options.cardNumber');
            self.Util.validateArgument(options.exp, 'options.exp');

            var data = {
                'command': 'cc:save',
                'creditcard':
                {
                    'number': options.cardNumber,
                    'expiration': options.exp
                }
            };

            if (options.firstName && options.lastName)
            {
                data.creditcard.cardholder = options.firstName + ' ' + options.lastName;
            }
            if (options.address)
            {
                data.creditcard.avs_street = options.address;
            }
            if (options.zipcode)
            {
                data.creditcard.avs_zip = options.zipcode;
            }
            if (options.cvv)
            {
                data.creditcard.cvc = options.cvv;
            }

            return got.post(self.baseUrl + 'transactions',
            {
                body: data,
                json: true,
                headers:
                {
                    'Authorization': 'Basic ' + self.authKey,
                    'Content-Type': 'application/json'
                }
            }).then(function (res)
            {
                if (!res) self.Util.throwInvalidDataError(res);

                if (!res.body || res.body.result_code !== 'A')
                {
                    throw new Error('Card not approved');
                }

                if (!res.body.savedcard || !res.body.savedcard.key)
                {
                    throw new Error('Card could not be saved');
                }

                return {
                    foreignId: res.body.savedcard.key,
                    cardType: res.body.savedcard.type,
                    maskedNumber: res.body.savedcard.cardnumber,
                    cardHolderName: res.body.creditcard ? res.body.creditcard.cardholder : data.creditcard.cardholder
                };
            });
        },
        Sale: function (options)
        {
            self.Util.validateArgument(options, 'options');
            self.Util.validateArgument(options.amount, 'options.amount');
            self.Util.validateArgument(options.foreignKey, 'options.foreignKey');

            var data = {
                'command': 'cc:sale',
                'creditcard':
                {
                    'number': options.foreignKey,
                    'expiration': '0000'
                },
                'amount': options.amount
            };
            if (options.cardholderName)
            {
                data.creditcard.cardholder = options.cardholderName;
            }

            return got.post(self.baseUrl + 'transactions',
            {
                body: data,
                json: true,
                headers:
                {
                    'Authorization': 'Basic ' + self.authKey,
                    'Content-Type': 'application/json'
                }
            }).then(function (res)
            {
                if (!res) self.Util.throwInvalidDataError(res);

                if (!res.body || res.body.result_code !== 'A' || !res.body.refnum)
                {
                    throw new Error('Transaction not approved');
                }

                return {
                    foreignId: res.body.refnum,
                    amount: res.body.auth_amount
                };
            });
        },
        Void: function (options)
        {
            self.Util.validateArgument(options, 'options');
            self.Util.validateArgument(options.transactionForeignKey, 'options.transactionForeignKey');

            var data = {
                'command': 'void',
                'refnum': options.transactionForeignKey
            };

            return got.post(self.baseUrl + 'transactions',
            {
                body: data,
                json: true,
                headers:
                {
                    'Authorization': 'Basic ' + self.authKey,
                    'Content-Type': 'application/json'
                }
            }).then(function (res)
            {
                if (!res) self.Util.throwInvalidDataError(res);

                if (!res.body || res.body.result_code !== 'A' || !res.body.refnum)
                {
                    throw new Error('Transaction not voided');
                }

                return {
                    foreignId: res.body.refnum
                };
            });
        },
        Refund: function (options)
        {
            self.Util.validateArgument(options, 'options');
            self.Util.validateArgument(options.transactionForeignKey, 'options.transactionForeignKey');

            var data = {
                'command': 'refund',
                'amount': options.amount,
                'refnum': options.transactionForeignKey
            };

            return got.post(self.baseUrl + 'transactions',
            {
                body: data,
                json: true,
                headers:
                {
                    'Authorization': 'Basic ' + self.authKey,
                    'Content-Type': 'application/json'
                }
            }).then(function (res)
            {
                if (!res) self.Util.throwInvalidDataError(res);

                if (!res.body || res.body.result_code !== 'A' || !res.body.refnum)
                {
                    throw new Error('Transaction not refunded');
                }

                return {
                    foreignId: res.body.refnum
                };
            });
        }
    };

    self.Terminal = {
        Create: function (options)
        {
            self.Util.validateArgument(options, 'options');
            self.Util.validateArgument(options.name, 'options.name');

            var data = {
                'terminal_type': 'standalone',
                'name': options.name
            };

            if (options.config)
            {
                data.terminal_config = options.config;
            }
            if (options.settings)
            {
                data.settings = options.settings;
            }

            return got.post(self.baseUrl + 'paymentengine/devices',
            {
                body: data,
                json: true,
                headers:
                {
                    'Authorization': 'Basic ' + self.authKey,
                    'Content-Type': 'application/json'
                }
            }).then(function (res)
            {
                if (!res) self.Util.throwInvalidDataError(res);

                if (!res.body || !res.body.key || !res.body.pairing_code)
                {
                    throw new Error('Terminal could not be created');
                }

                return {
                    foreignKey: res.body.key,
                    pairingCode: res.body.pairing_code
                };
            });
        },
        Delete: function (options)
        {
            self.Util.validateArgument(options, 'options');
            self.Util.validateArgument(options.foreignKey, 'options.foreignKey');

            return got.delete(self.baseUrl + 'paymentengine/devices/' + options.foreignKey,
            {
                json: true,
                headers:
                {
                    'Authorization': 'Basic ' + self.authKey,
                    'Content-Type': 'application/json'
                }
            }).then(function (res)
            {
                if (!res) self.Util.throwInvalidDataError(res);

                if (!res.body)
                {
                    throw new Error('Terminal not removed');
                }

                return true;
            });
        },
        Sale: function (options)
        {
            self.Util.validateArgument(options, 'options');
            self.Util.validateArgument(options.amount, 'options.amount');
            self.Util.validateArgument(options.foreignKey, 'options.foreignKey');

            var data = {
                'devicekey': options.foreignKey,
                'amount': options.amount,
                'command': 'sale'
            };

            return got.post(self.baseUrl + 'paymentengine/payrequests',
            {
                body: data,
                json: true,
                headers:
                {
                    'Authorization': 'Basic ' + self.authKey,
                    'Content-Type': 'application/json'
                }
            }).then(function (res)
            {
                if (!res) self.Util.throwInvalidDataError(res);

                if (!res.body || !res.body.key)
                {
                    throw new Error('Terminal transaction not created');
                }

                return res.body.key;
            });
        },
        SaleStatus: function (options)
        {
            self.Util.validateArgument(options, 'options');
            self.Util.validateArgument(options.foreignKey, 'options.foreignKey');

            return got.get(self.baseUrl + 'paymentengine/payrequests/' + options.foreignKey,
            {
                json: true,
                headers:
                {
                    'Authorization': 'Basic ' + self.authKey,
                    'Content-Type': 'application/json'
                }
            }).then(function (res)
            {
                if (!res) self.Util.throwInvalidDataError(res);

                if (!res.body || !res.body.key || !res.body.status)
                {
                    throw new Error('Terminal transaction not available');
                }

                var pendingStatuses = [
                    'sending to device',
                    'sent to device',
                    'waiting for card dip',
                    'changing interfaces',
                    'customer see phone and tap again',
                    'processing payment',
                    'completing payment',
                    'capturing signature'
                ];

                var successStatuses = ['transaction complete'];
                // var errorStatuses = [
                //     'signature capture error',
                //     'canceled',
                //     'transaction canceled',
                //     'transaction failed',
                //     'timeout',
                //     'error'
                // ];

                if (res.body.transaction && res.body.transaction.result_code === 'E')
                {
                    return {
                        status: 'error',
                        message: res.body.transaction.error
                    };
                }

                if (res.body.transaction && res.body.transaction.result_code === 'D')
                {
                    return {
                        status: 'error',
                        message: res.body.transaction.error
                    };
                }

                if (successStatuses.indexOf(res.body.status) > -1)
                {
                    return {
                        status: 'success',
                        transaction: res.body.transaction.refnum
                    };
                }
                if (pendingStatuses.indexOf(res.body.status) > -1)
                {
                    return {
                        status: 'pending',
                        message: res.body.status
                    };
                }

                return {
                    status: 'error',
                    message: res.body.status
                };
            });
        }
    };

    self.Util = {
        validateArgument: function (arg, name)
        {
            if (arg === null || arg === undefined)
            {
                throw new Error('Required argument missing: ' + name);
            }
        },
        throwInvalidDataError: function (res)
        {
            throw new Error('Invalid response data: ' + JSON.stringify(res));
        },
        authenticate: function ()
        {
            var seed = "abcdefghijklmnop";
            var prehash = config.key + seed + config.pin;
            var apihash = 's2/' + seed + '/' + crypto.createHash('sha256').update(prehash).digest('hex');

            return Buffer.from(config.key + ":" + apihash).toString('base64');
        }
    };

    self.Util.validateArgument(config.key, 'key');
    self.Util.validateArgument(config.pin, 'pin');
    self.Util.validateArgument(config.urlsuffix, 'urlsuffix');
    self.Util.validateArgument(config.environment, 'environment');

    self.CONFIG = JSON.parse(JSON.stringify(config));

    self.baseUrl = sandbox;
    if (self.CONFIG.environment === 'Production')
    {
        self.baseUrl = production;
    }
    self.baseUrl = self.baseUrl + config.urlsuffix + '/';

    self.authKey = self.Util.authenticate();

    return self;
};

module.exports = usaepay;