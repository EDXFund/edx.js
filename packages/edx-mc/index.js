"use strict";

var _ = require('underscore');
var core = require('web3-core');
var helpers = require('web3-core-helpers');
var Subscriptions = require('web3-core-subscriptions').subscriptions;
var Method = require('web3-core-method');
var utils = require('web3-utils');
var Net = require('web3-net');

var getNetworkType = require('./getNetworkType.js');
var formatter = helpers.formatters;


var blockCall = function (args) {
    return (_.isString(args[0]) && args[0].indexOf('0x') === 0) ? "eth_getBlockByHash" : "eth_getBlockByNumber";
};

var transactionFromBlockCall = function (args) {
    return (_.isString(args[0]) && args[0].indexOf('0x') === 0) ? 'eth_getTransactionByBlockHashAndIndex' : 'eth_getTransactionByBlockNumberAndIndex';
};

var uncleCall = function (args) {
    return (_.isString(args[0]) && args[0].indexOf('0x') === 0) ? 'eth_getUncleByBlockHashAndIndex' : 'eth_getUncleByBlockNumberAndIndex';
};

var getBlockTransactionCountCall = function (args) {
    return (_.isString(args[0]) && args[0].indexOf('0x') === 0) ? 'eth_getBlockTransactionCountByHash' : 'eth_getBlockTransactionCountByNumber';
};

var uncleCountCall = function (args) {
    return (_.isString(args[0]) && args[0].indexOf('0x') === 0) ? 'eth_getUncleCountByBlockHash' : 'eth_getUncleCountByBlockNumber';
};


var MC = function MC() {
    var _this = this;

    // sets _requestmanager
    core.packageInit(this, arguments);

    // overwrite setProvider
    var setProvider = this.setProvider;
    this.setProvider = function () {
        setProvider.apply(_this, arguments);
        _this.net.setProvider.apply(_this, arguments);
    };


    var defaultAccount = null;
    var defaultBlock = 'latest';

    Object.defineProperty(this, 'defaultAccount', {
        get: function () {
            return defaultAccount;
        },
        set: function (val) {
            if(val) {
                defaultAccount = utils.toChecksumAddress(formatter.inputAddressFormatter(val));
            }

            // also set on the Contract object
            // _this.Contract.defaultAccount = defaultAccount;
            _this.personal.defaultAccount = defaultAccount;

            // update defaultBlock
            methods.forEach(function(method) {
                method.defaultAccount = defaultAccount;
            });

            return val;
        },
        enumerable: true
    });
    Object.defineProperty(this, 'defaultBlock', {
        get: function () {
            return defaultBlock;
        },
        set: function (val) {
            defaultBlock = val;
            // also set on the Contract object
            // _this.Contract.defaultBlock = defaultBlock;
            _this.personal.defaultBlock = defaultBlock;

            // update defaultBlock
            methods.forEach(function(method) {
                method.defaultBlock = defaultBlock;
            });

            return val;
        },
        enumerable: true
    });

    this.clearSubscriptions = _this._requestManager.clearSubscriptions;

    // add net
    this.net = new Net(this.currentProvider);
    // add chain detection
    this.net.getNetworkType = getNetworkType.bind(this);

    var methods = [
        new Method({
            name: 'getNodeInfo',
            call: 'web3_clientVersion'
        }),
        new Method({
            name: 'getProtocolVersion',
            call: 'eth_protocolVersion',
            params: 0
        }),
        new Method({
            name: 'getCoinbase',
            call: 'eth_coinbase',
            params: 0
        }),
        new Method({
            name: 'isMining',
            call: 'eth_mining',
            params: 0
        }),
        new Method({
            name: 'getHashrate',
            call: 'eth_hashrate',
            params: 0,
            outputFormatter: utils.hexToNumber
        }),
        new Method({
            name: 'isSyncing',
            call: 'eth_syncing',
            params: 0,
            outputFormatter: formatter.outputSyncingFormatter
        }),
        new Method({
            name: 'getGasPrice',
            call: 'eth_gasPrice',
            params: 0,
            outputFormatter: formatter.outputBigNumberFormatter
        }),
        new Method({
            name: 'getAccounts',
            call: 'eth_accounts',
            params: 0,
            outputFormatter: utils.toChecksumAddress
        }),
        new Method({
            name: 'getBlockNumber',
            call: 'eth_blockNumber',
            params: 0,
            outputFormatter: utils.hexToNumber
        }),
        new Method({
            name: 'getBalance',
            call: 'eth_getBalance',
            params: 2,
            inputFormatter: [formatter.inputAddressFormatter, formatter.inputDefaultBlockNumberFormatter],
            outputFormatter: formatter.outputBigNumberFormatter
        }),
        new Method({
            name: 'getStorageAt',
            call: 'eth_getStorageAt',
            params: 3,
            inputFormatter: [formatter.inputAddressFormatter, utils.numberToHex, formatter.inputDefaultBlockNumberFormatter]
        }),
        new Method({
            name: 'getCode',
            call: 'eth_getCode',
            params: 2,
            inputFormatter: [formatter.inputAddressFormatter, formatter.inputDefaultBlockNumberFormatter]
        }),
        new Method({
            name: 'getBlock',
            call: blockCall,
            params: 2,
            inputFormatter: [formatter.inputBlockNumberFormatter, function (val) { return !!val; }],
            outputFormatter: formatter.outputBlockFormatter
        }),
        new Method({
            name: 'getShardBlockByHash',
            call: 'eth_getShardBlockByHash',
            params: 2,
            outputFormatter: formatter.outputBlockFormatter
        }),
        new Method({
            name: 'getUncle',
            call: uncleCall,
            params: 2,
            inputFormatter: [formatter.inputBlockNumberFormatter, utils.numberToHex],
            outputFormatter: formatter.outputBlockFormatter,
        }),
        new Method({
            name: 'getBlockTransactionCount',
            call: getBlockTransactionCountCall,
            params: 1,
            inputFormatter: [formatter.inputBlockNumberFormatter],
            outputFormatter: utils.hexToNumber
        }),
        new Method({
            name: 'getBlockUncleCount',
            call: uncleCountCall,
            params: 1,
            inputFormatter: [formatter.inputBlockNumberFormatter],
            outputFormatter: utils.hexToNumber
        }),
        new Method({
            name: 'getTransaction',
            call: 'eth_getTransactionByHash',
            params: 1,
            inputFormatter: [null],
            outputFormatter: formatter.outputTransactionFormatter
        }),
        new Method({
            name: 'getTransactionFromBlock',
            call: transactionFromBlockCall,
            params: 2,
            inputFormatter: [formatter.inputBlockNumberFormatter, utils.numberToHex],
            outputFormatter: formatter.outputTransactionFormatter
        }),
        new Method({
            name: 'getTransactionReceipt',
            call: 'eth_getTransactionReceipt',
            params: 1,
            inputFormatter: [null],
            outputFormatter: formatter.outputTransactionReceiptFormatter
        }),
        new Method({
            name: 'getTransactionCount',
            call: 'eth_getTransactionCount',
            params: 2,
            inputFormatter: [formatter.inputAddressFormatter, formatter.inputDefaultBlockNumberFormatter],
            outputFormatter: utils.hexToNumber
        }),
        new Method({
            name: 'sendSignedTransaction',
            call: 'eth_sendRawTransaction',
            params: 1,
            inputFormatter: [null]
        }),
        new Method({
            name: 'signTransaction',
            call: 'eth_signTransaction',
            params: 1,
            inputFormatter: [formatter.inputTransactionFormatter]
        }),
        new Method({
            name: 'sendTransaction',
            call: 'eth_sendTransaction',
            params: 1,
            inputFormatter: [formatter.inputTransactionFormatter]
        }),
        new Method({
            name: 'sendTestTxs',
            call: 'eth_sendTestTxs',
            params: 2
        }),
        new Method({
            name: 'sign',
            call: 'eth_sign',
            params: 2,
            inputFormatter: [formatter.inputSignFormatter, formatter.inputAddressFormatter],
            transformPayload: function (payload) {
                payload.params.reverse();
                return payload;
            }
        }),
        new Method({
            name: 'call',
            call: 'eth_call',
            params: 2,
            inputFormatter: [formatter.inputCallFormatter, formatter.inputDefaultBlockNumberFormatter]
        }),
        new Method({
            name: 'estimateGas',
            call: 'eth_estimateGas',
            params: 1,
            inputFormatter: [formatter.inputCallFormatter],
            outputFormatter: utils.hexToNumber
        }),
        new Method({
            name: 'submitWork',
            call: 'eth_submitWork',
            params: 3
        }),
        new Method({
            name: 'getWork',
            call: 'eth_getWork',
            params: 0
        }),
        new Method({
            name: 'getPastLogs',
            call: 'eth_getLogs',
            params: 1,
            inputFormatter: [formatter.inputLogFormatter],
            outputFormatter: formatter.outputLogFormatter
        }),

        // subscriptions
        new Subscriptions({
            name: 'subscribe',
            type: 'eth',
            subscriptions: {
                'newBlockHeaders': {
                    // TODO rename on RPC side?
                    subscriptionName: 'newHeads', // replace subscription with this name
                    params: 0,
                    outputFormatter: formatter.outputBlockFormatter
                },
                'pendingTransactions': {
                    subscriptionName: 'newPendingTransactions', // replace subscription with this name
                    params: 0
                },
                'logs': {
                    params: 1,
                    inputFormatter: [formatter.inputLogFormatter],
                    outputFormatter: formatter.outputLogFormatter,
                    // DUBLICATE, also in web3-eth-contract
                    subscriptionHandler: function (output) {
                        if(output.removed) {
                            this.emit('changed', output);
                        } else {
                            this.emit('data', output);
                        }

                        if (_.isFunction(this.callback)) {
                            this.callback(null, output, this);
                        }
                    }
                },
                'syncing': {
                    params: 0,
                    outputFormatter: formatter.outputSyncingFormatter,
                    subscriptionHandler: function (output) {
                        var _this = this;

                        // fire TRUE at start
                        if(this._isSyncing !== true) {
                            this._isSyncing = true;
                            this.emit('changed', _this._isSyncing);

                            if (_.isFunction(this.callback)) {
                                this.callback(null, _this._isSyncing, this);
                            }

                            setTimeout(function () {
                                _this.emit('data', output);

                                if (_.isFunction(_this.callback)) {
                                    _this.callback(null, output, _this);
                                }
                            }, 0);

                            // fire sync status
                        } else {
                            this.emit('data', output);
                            if (_.isFunction(_this.callback)) {
                                this.callback(null, output, this);
                            }

                            // wait for some time before fireing the FALSE
                            clearTimeout(this._isSyncingTimeout);
                            this._isSyncingTimeout = setTimeout(function () {
                                if(output.currentBlock > output.highestBlock - 200) {
                                    _this._isSyncing = false;
                                    _this.emit('changed', _this._isSyncing);

                                    if (_.isFunction(_this.callback)) {
                                        _this.callback(null, _this._isSyncing, _this);
                                    }
                                }
                            }, 500);
                        }
                    }
                }
            }
        })
    ];

    methods.forEach(function(method) {
        method.attachToObject(_this);
        method.setRequestManager(_this._requestManager, _this.accounts); // second param means is eth.accounts (necessary for wallet signing)
        method.defaultBlock = _this.defaultBlock;
        method.defaultAccount = _this.defaultAccount;
    });

};

core.addProviders(MC);


module.exports = MC;

