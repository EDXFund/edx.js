"use strict";


var version = require('../package.json').version;
var core = require('web3-core');
var MC = require('../dex-mc');
var Net = require('web3-net');

var utils = require('web3-utils');

var edx = function edx() {
    var _this = this;

    // sets _requestmanager etc
    core.packageInit(this, arguments);

    this.version = version;
    this.utils = utils;

    this.main = new Eth(this);


    // overwrite package setProvider
    var setProvider = this.setProvider;
    this.setProvider = function (provider, net) {
        setProvider.apply(_this, arguments);

        this.eth.setProvider(provider, net);

        return true;
    };
};

edx.version = version;
edx.utils = utils;
edx.modules = {
    MC: MC,
    Net: Net
};

core.addProviders(edx);

module.exports = edx;

