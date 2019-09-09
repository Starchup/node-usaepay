/**
 * Modules from the community: package.json
 */
var xmlP = require('fast-xml-parser');
var rp = require('request-promise');
var got = require('got');

var production = 'https://secure.usaepay.com/api/';
var sandbox = 'https://sandbox.usaepay.com/api/';

/**
 * Constructor
 */
var usaepay = function (config)
{
    var self = this;

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
        }
    };

    self.Util.validateArgument(config.key, 'key');
    self.Util.validateArgument(config.pin, 'pin');
    self.Util.validateArgument(config.urlsuffix, 'urlsuffix');
    self.Util.validateArgument(config.environment, 'environment');

    self.CONFIG = JSON.parse(JSON.stringify(config));

    self.baseUrl = sandbox;
    self.TEST_MODE = 'Y';
    if (self.CONFIG.environment === 'Production')
    {
        self.TEST_MODE = 'N';
        self.baseUrl = production;
    }

    return self;
};

module.exports = usaepay;