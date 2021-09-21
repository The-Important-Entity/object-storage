const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { assert } = require("console");

const run_tests = async function(dht_dir, obj_dir, download_dir, upload_dir, client, tester, url, num_nodes, id_max){

    var all_equal = true;
    try {
        const node_data = JSON.parse(fs.readFileSync(path.join(dht_dir, Math.floor(id_max/(num_nodes+ 1)).toString(), "node_data.json")));
        for (var i = 0; i < num_nodes; i++) {
            const this_node_data = JSON.parse(fs.readFileSync(path.join(dht_dir, (Math.floor(id_max/(num_nodes+ 1)) * (i + 1)).toString(), "node_data.json")));

            if (node_data.toString() != this_node_data.toString()) {
                all_equal = 0;
            }
        }
    }
    catch(err) {
        console.log(err);
        all_equal = false;
    }
    tester.assert(all_equal, true);
    
    const test_filename = "test.txt";
    for (var i = 0; i < 1000; i++) {
        fs.appendFileSync(path.join(upload_dir, test_filename), "1111111111111111\n");
    }

    var res = await client.getNamespaceFiles("joe-namespace");
    tester.assert(res, "Error: namespace doesn't exist");

}   

module.exports = run_tests;