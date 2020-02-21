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
        USAEpay.Card.Create(data).then(function (cardData)
        {
            /* jshint ignore:start */
            expect(cardData).to.exist;
            expect(cardData.foreignId).to.exist;
            expect(cardData.cardType).to.exist;
            expect(cardData.maskedNumber).to.exist;
            expect(cardData.cardHolderName).to.exist;
            /* jshint ignore:end */

            cardForeignId = cardData.foreignId;

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
        }).then(function (saleData)
        {
            expect(saleData).to.exist; // jshint ignore:line
            expect(saleData.foreignId).to.exist; // jshint ignore:line

            transactionForeignId = saleData.foreignId;

            done();
        }).catch(done);
    });

    it('should void a credit card on USAEpay', function (done)
    {
        USAEpay.Card.Void(
        {
            transactionForeignKey: transactionForeignId
        }).then(function (voidData)
        {
            expect(voidData).to.exist; // jshint ignore:line
            expect(voidData.foreignId).to.exist; // jshint ignore:line

            done();
        }).catch(done);
    });

    it('should refund a credit card on USAEpay', function (done)
    {
        USAEpay.Card.Refund(
        {
            transactionForeignKey: transactionForeignId
        }).then(function (refundData)
        {
            expect(refundData).to.exist; // jshint ignore:line
            expect(refundData.foreignId).to.exist; // jshint ignore:line

            done();
        }).catch(done);
    });
});

describe('Terminal Methods', function ()
{
    cardForeignId = null;
    transactionForeignId = null;

    it('should create a terminal on USAEpay', function (done)
    {
        USAEpay.Terminal.Create(
        {
            name: 'test'
        }).then(function (res)
        {
            expect(res).to.exist; // jshint ignore:line
            expect(res.foreignKey).to.exist; // jshint ignore:line
            expect(res.pairingCode).to.exist; // jshint ignore:line

            cardForeignId = res.foreignKey;

            done();
        }).catch(done);
    });

    it('should start a transaction on a terminal on USAEpay', function (done)
    {
        USAEpay.Terminal.Sale(
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

    it('should get the status of a transaction on a terminal on USAEpay', function (done)
    {
        var transactionDone = false;

        function checkTransactionStatus()
        {
            if (transactionDone) return done();

            USAEpay.Terminal.SaleStatus(
            {
                foreignKey: transactionForeignId
            }).then(function (res)
            {
                expect(res).to.exist; // jshint ignore:line
                expect(res.status).to.exist; // jshint ignore:line

                if (res.status === 'error') return done(res.message);

                if (res.status === 'success') transactionDone = true;

                checkTransactionStatus();

            }).catch(done);
        }

        checkTransactionStatus();
    });

    it('should delete a terminal on USAEpay', function (done)
    {
        USAEpay.Terminal.Delete(
        {
            foreignKey: cardForeignId
        }).then(function (result)
        {
            expect(result).to.equal(true); // jshint ignore:line
            done();
        }).catch(done);
    });
});