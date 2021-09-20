'use strict';
var path = require("path");

module.exports = function(port, dht_url, data_dir){
    return {
        "PORT": port,
        "DHT_URL": dht_url,
        "DATA_DIR": data_dir
    };
}