/**
 *
 * test in MasterChain
 *
 **/
var EDX = require('../packages/edx');
var edx;

describe('edx', function() {
    it('edx init', function (done) {
        var provider = new EDX.providers.WebsocketProvider('ws://127.0.0.1:8548');

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
});