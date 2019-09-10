/**
 * Modules from the community: package.json
 */
var expect = require('chai').expect;

var usaepay = require('./usaepay.js');
var USAEpay = new usaepay(
{
    key: 'xxxx',
    pin: 'xxxx',
    urlsuffix: 'xxxx',
    environment: 'xxxx'
});

var cardForeignId, transactionForeignId;

describe('Card Methods', function ()
{
    this.timeout(10000);

    var data = {
        cardNumber: '4111111111111111',
        exp: '02/20',
        cvv: '232',
        firstName: 'Geoffroy',
        lastName: 'Lesage',
        address: '1 Main Street',
        zipcode: '11201'
    };

    it('should create a credit card on USAEpay', function (done)
    {
        USAEpay.Card.Create(data).then(function (foreignId)
        {
            expect(foreignId).to.exist; // jshint ignore:line
            cardForeignId = foreignId;
            done();
        }).catch(done);
    });

    // NOT YET IMPLEMENTED ON USAEpay
    // it('should get a credit card from USAEpay', function (done)
    // {
    //     USAEpay.Card.Get(
    //     {
    //         foreignKey: cardForeignId

    //     }).then(function (res)
    //     {
    //         expect(res).to.exist; // jshint ignore:line
    //         expect(res.last4).to.exist; // jshint ignore:line
    //         done();
    //     }).catch(done);
    // });

    it('should bill a credit card on USAEpay', function (done)
    {
        USAEpay.Card.Sale(
        {
            foreignKey: cardForeignId,
            amount: 1
        }).then(function (foreignId)
        {
            expect(foreignId).to.exist; // jshint ignore:line
            transactionForeignId = foreignId;
            done();
        }).catch(done);
    });

    it('should void a credit card on USAEpay', function (done)
    {
        USAEpay.Card.Void(
        {
            transactionForeignKey: transactionForeignId
        }).then(function (foreignId)
        {
            expect(foreignId).to.exist; // jshint ignore:line
            done();
        }).catch(done);
    });

    it('should refund a credit card on USAEpay', function (done)
    {
        USAEpay.Card.Refund(
        {
            transactionForeignKey: transactionForeignId
        }).then(function (foreignId)
        {
            expect(foreignId).to.exist; // jshint ignore:line
            done();
        }).catch(done);
    });
});