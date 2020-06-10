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
                json: data,
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
                    throw new Error('Card could not be created');
                }

                var result = JSON.parse(res.body);

                if (result.result_code !== 'A')
                {
                    throw new Error('Card not approved');
                }

                if (!result.savedcard || !result.savedcard.key)
                {
                    throw new Error('Card could not be saved');
                }

                return {
                    foreignId: result.savedcard.key,
                    cardType: result.savedcard.type,
                    maskedNumber: result.savedcard.cardnumber,
                    cardHolderName: result.creditcard ? result.creditcard.cardholder : result.creditcard.cardholder
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
                json: data,
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
                    throw new Error('Transaction could not be created');
                }

                var result = JSON.parse(res.body);

                if (result.result_code !== 'A' || !result.refnum)
                {
                    throw new Error('Transaction not approved');
                }

                return {
                    foreignId: result.refnum,
                    amount: result.auth_amount
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
                json: data,
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
                    throw new Error('Transaction could not be voided');
                }

                var result = JSON.parse(res.body);

                if (result.result_code !== 'A' || !result.refnum)
                {
                    throw new Error('Transaction not voided');
                }

                return {
                    foreignId: result.refnum
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
                json: data,
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
                    throw new Error('Transaction could not be refunded');
                }

                var result = JSON.parse(res.body);

                if (result.result_code !== 'A' || !result.refnum)
                {
                    throw new Error('Transaction not refunded');
                }

                return {
                    foreignId: result.refnum,
                    amount: options.amount
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
                json: data,
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
                    throw new Error('Terminal could not be created');
                }

                var result = JSON.parse(res.body);

                if (!result.key || !result.pairing_code)
                {
                    throw new Error('Terminal could not be created');
                }

                return {
                    foreignKey: result.key,
                    pairingCode: result.pairing_code
                };
            });
        },
        Delete: function (options)
        {
            self.Util.validateArgument(options, 'options');
            self.Util.validateArgument(options.foreignKey, 'options.foreignKey');

            return got.delete(self.baseUrl + 'paymentengine/devices/' + options.foreignKey,
            {
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
                json: data,
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
                    throw new Error('Terminal transaction could not be created');
                }

                var result = JSON.parse(res.body);

                if (!result || !result.key)
                {
                    throw new Error('Terminal transaction not created');
                }

                return result.key;
            });
        },
        SaleStatus: function (options)
        {
            self.Util.validateArgument(options, 'options');
            self.Util.validateArgument(options.foreignKey, 'options.foreignKey');

            return got.get(self.baseUrl + 'paymentengine/payrequests/' + options.foreignKey,
            {
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
                    throw new Error('Terminal transaction not available');
                }

                var result = JSON.parse(res.body);

                if (!result || !result.key || !result.status)
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

                if (result.transaction && result.transaction.result_code === 'E')
                {
                    return {
                        status: 'error',
                        message: result.transaction.error
                    };
                }

                if (result.transaction && result.transaction.result_code === 'D')
                {
                    return {
                        status: 'error',
                        message: result.transaction.error
                    };
                }

                if (successStatuses.indexOf(result.status) > -1)
                {
                    return {
                        status: 'success',
                        transaction: result.transaction.refnum
                    };
                }
                if (pendingStatuses.indexOf(result.status) > -1)
                {
                    return {
                        status: 'pending',
                        message: result.status
                    };
                }

                return {
                    status: 'error',
                    message: result.status
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