const DHT_Node = require("dht-node");
const Router = require("./src/router");
const dht_config = require("./src/dht_config");
require("dotenv").config();

const TABLE_SIZE = process.env.DHT_TABLESIZE || 1000000;

const args = process.argv.slice(2)
const port = args[1];
const url = args[2] + ":" + args[1];
const id = args[3]
const id_max = process.env.DHT_ID_MAX;
const data_dir = process.env.DHT_DATA_DIR;
const obj_data_dir = process.env.OBJ_DATA_DIR;

var dht = new DHT_Node(dht_config(port, url, id, id_max, data_dir, TABLE_SIZE));
const router = new Router(args[0], url, obj_data_dir);

dht.listen();
router.listen();