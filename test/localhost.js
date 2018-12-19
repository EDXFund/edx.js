/**
 *
 * test in MasterChain
 *
 **/
var EDX = require('../packages/edx');
var edx;

describe('edx', function() {
    it('edx init', function (done) {
        var provider = new EDX.providers.WebsocketProvider('ws://192.168.31.9:8548');

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

            edx.main.getBlock(blockHeader.number).then((result) => {
                console.log(result);

                if (result.shardInfo) {
                    edx.main.getShardBlockByHash(result.shardInfo[0].Hash,result.shardInfo[0].ShardId).then((res) => {
                        console.log(res);
                    }).catch((e) => {
                        console.log(e);
                    })
                }
            }).catch((e) => {
                console.log(e);
            });
        });
        done();
    });
});