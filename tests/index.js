const ObjectStorageClient = require("object-storage-client");
const ObjectStorageNode = require("../src");
const AuthorizationService = require("../../authentication-service");

const Assert = require("./assert");
const integration_tests = require("./integration/index.js");
const lock_tests = require("./lock_test");
const fs = require("fs");
const path = require("path");
const init = require("./utils/init");
const cleanup = require("./utils/cleanup");
const {exec} = require("child_process");

const dht_config = require("../src/config/dht_config");
const obj_config = require("../src/config/obj_config");
const join_all = require("./utils/join_nodes");

require("dotenv").config();


function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

const authorized_client_config = {
    "APP_ID": "TWBQWFXJUEJB52OLSNGN6JLP1FZHR2N1FU9YYJULPH9CPFXB02",
    'SECRET_KEY': "Z1oQmWh6l8mfmprEApi3ffI0l6pDXbGIQG6DKvtYPBCyeSdjc9GWoOAgP0Vi65IbRpPp8aauH99",
    'URL': "http://localhost:4000"
}

const unauthorized_client_config = {
    "APP_ID": "TWBQWFXJUEJB52OLSNGN6JLP1FZHR2N1FU9YYJULPH9CPFXB02",
    'SECRET_KEY': "Z1oQmWh6l8mfmprEApi3ffI0l6pDXbGIQG6DKvtYPBCyeSdjc9GWoOAgP0Vi65IbRpPp",
    'URL': "http://localhost:4000"
}

const TABLE_SIZE = process.env.DHT_TABLESIZE || 1000000;
const id_max = process.env.DHT_ID_MAX;
const dht_data_dir = path.join(process.env.TESTS_DIR, "dht");
const obj_data_dir = path.join(process.env.TESTS_DIR, "obj");
const download_dir = path.join(process.env.TESTS_DIR, "download");
const upload_dir = path.join(process.env.TESTS_DIR, "upload");

cleanup(dht_data_dir, obj_data_dir, download_dir, upload_dir);
init(dht_data_dir, obj_data_dir, download_dir, upload_dir);


const num_nodes = 10;

const run_all_tests = async function(){

    const postgress_path = path.join(process.env.TESTS_DIR, "postgres-data");
    const script_path = path.join(__dirname, "./db/newscript.sql");

    exec("sudo " + path.join(__dirname, "/db/initdb.sh ") + " " + postgress_path + " " + script_path, (err, stdout, stderr) => {

        console.log(stdout);
    });


    await sleep(5000);
    const auth_server = new AuthorizationService({
        "HOST": "localhost",
        "DB_PORT": 6000,
        "DB_USER": "postgres",
        "DB_PASS": "jds81799",
        "DB": "account_data",
        "PORT": 5000
    });
    auth_server.start();

    var obj_nodes_arr = new Array(num_nodes);
    for (var i = 0; i < num_nodes; i++) {
        const id = Math.floor(id_max / (num_nodes + 1)) * (i+1);
        const dht_url = "http://localhost:300" + i.toString();
        const dhtConfig = dht_config(3000 + i, dht_url, id, id_max, dht_data_dir, TABLE_SIZE);
        const objConfig = obj_config(4000 + i, dht_url, obj_data_dir);
        obj_nodes_arr[i] = new ObjectStorageNode(dhtConfig, objConfig); 
        await obj_nodes_arr[i].start();
    }

    await join_all(num_nodes);
    await sleep(1000);

    const tester = new Assert();
    const authorized_client = new ObjectStorageClient(authorized_client_config);
    const unauthorized_client = new ObjectStorageClient(unauthorized_client_config);
    const url = "http://localhost:4000";
    
    console.log("\nRunning Integration Tests");
    await integration_tests(dht_data_dir, obj_data_dir, download_dir, upload_dir, authorized_client, unauthorized_client, tester, url, num_nodes, id_max);

    console.log("\nRunning Lock Tests");
    await lock_tests(dht_data_dir, obj_data_dir, download_dir, upload_dir, authorized_client, tester, url, num_nodes, id_max);

    tester.printResults();
    cleanup(dht_data_dir, obj_data_dir, download_dir, upload_dir);
    await sleep(1000);
    for (var i = 0; i < num_nodes; i++) {
        await obj_nodes_arr[i].stop();
    }
    auth_server.stop();
    exec(path.join(__dirname, "./db/destroydb.sh") + " " + path.join(process.env.TESTS_DIR, "postgres-data"));
}
run_all_tests();