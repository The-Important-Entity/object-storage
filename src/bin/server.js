'use strict';
const dht_config = require("../config/dht_config");
const obj_config = require("../config/obj_config");
const ObjectStorageNode = require("..");

const TABLE_SIZE = process.env.DHT_TABLESIZE || 1000000;
const id_max = process.env.DHT_ID_MAX;
const dht_data_dir = process.env.DHT_DATA_DIR;
const obj_data_dir = process.env.OBJ_DATA_DIR;

// const args = process.argv.slice(2)
// const dht_port = args[1];
// const obj_port = args[0];
// const url = args[2] + ":" + args[1];
// const id = args[3];

const dht_port = process.env.DHT_PORT;
console.log(dht_port);
const obj_port = process.env.OBJ_PORT;
const url = "http://" + process.env.HOST + ":" + dht_port;
const id = process.env.DHT_ID;

const dhtConfig = dht_config(dht_port, url, id, id_max, dht_data_dir, TABLE_SIZE);
const objConfig = obj_config(obj_port, url, obj_data_dir);

var server = new ObjectStorageNode(dhtConfig, objConfig);

server.start().then(function(serv){
    function terminate() {
        serv.stop().then(function(){
            process.exit(0);
        }).catch(function(err) {
            console.log(err);
            process.exit(1);
        })
    }

    process.on("SIGINT", terminate);
    process.on("SIGTERM", terminate);
}).catch(function(err) {
    console.log(err);
    process.exit(1);
})
