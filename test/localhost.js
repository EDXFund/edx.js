/**
 *
 * test with Ganache
 *
 **/
var EDX = require('../packages/edx');
var edx;

describe('edx', function() {
    it('edx init', function (done) {
        var provider = new EDX.providers.WebsocketProvider('ws://127.0.0.1:8545');

        edx = new EDX(provider);
        done();
    });
});

describe('main', function() {
    it('subscribe newBlockHeaders', function (done) {
        edx.main.subscribe('newBlockHeaders',(error,result) => {
            if (error)
                console.log(error);
        }).on("data", function(blockHeader){
            console.log(blockHeader);
        });
        done();
    });

    it('sendTransaction', function (done) {
        edx.main.sendTransaction({
            from: '0xEa3a1E0735507dBd305555A48411457D03AD4e88',
            to: '0xc9f0D74dAf30a47A3e425dE5202886f86B3Ec39d',
            value: 1
        }).on("transactionHash", function(hash){
            console.log(`transactionHash is ${hash}`);
        }).on("receipt",(receipt) => {
            console.log(`receipt is ${JSON.stringify(receipt)}`);
            done();
        }).on("confirmation",(confirmation) => {
            console.log(`confirmation is ${confirmation}`);
        }).on("error",(error) => {
            console.log(`transaction error is ${error}`);
            done();
        });
    });
});