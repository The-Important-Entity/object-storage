const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { assert } = require("console");

Array.prototype.equals = function (arr) {
    return this.length == arr.length && this.every((u, i) => u === arr[i]);
}

const compareFiles = function(file1, file2){
    const data1 = fs.readFileSync(file1).toString();
    const data2 = fs.readFileSync(file2).toString();
    return data1 == data2;
}

const run_tests = async function(dht_dir, obj_dir, download_dir, upload_dir, client, tester, url, num_nodes, id_max){
    const test_filename = "test.txt";
    const test_filepath = path.join(upload_dir, test_filename);
    const test_namespace = "joe-namespace";
    for (var i = 0; i < 1000; i++) {
        fs.appendFileSync(test_filepath, "1111111111111111\n");
    }

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

    var info = "Test if all dht node tables are equal";
    tester.assert(info, all_equal, true);

    info = "Test GET namespace files when namespace doesn't exist";
    var res = await client.getNamespaceFiles(test_namespace);
    tester.assert(info, res, "Error: namespace doesn't exist");

    info = "Test DELETE namespace when namespace doesn't exist";
    res = await client.deleteNamespace(test_namespace);
    tester.assert(info, res, "Error: namespace doesn't exist");

    info = "Test PUT object when namespace doesn't exist";
    res = await client.putObject(test_namespace, test_filename, test_filepath);
    tester.assert(info, res, "Error: namespace doesn't exist");

    info = "Test GET object when namespace doesn't exist";
    res = await client.getObject(test_namespace, test_filename, download_dir);
    tester.assert(info, res, "Error: namespace doesn't exist");

    info = "Test DELETE obect when namespace doesn't exist";
    res = await client.deleteObject(test_namespace, test_filename);
    tester.assert(info, res, "Error: namespace doesn't exist");

    info = "Test PUT namespace when namespace doesn't exist";
    res = await client.putNamespace(test_namespace);
    tester.assert(info, res, "Success!");

    info = "Test PUT namespace when namespace already exists";
    res = await client.putNamespace(test_namespace);
    tester.assert(info, res, "Error: namespace already exists");

    info = "Test GET namespace files when namespace is empty"
    res = await client.getNamespaceFiles(test_namespace);
    tester.assert(info, res.equals([]), true);

    info = "Test GET object when object doesn't exist in namespace";
    res = await client.getObject(test_namespace, test_filename, download_dir);
    tester.assert(info, res, "Error: object doesn't exist");

    info = "Test DELETE object when obect doesn't exist in namespace";
    res = await client.deleteObject(test_namespace, test_filename);
    tester.assert(info, res, "Error: object doesn't exist");

    info = "Test PUT obect when object doesn't exist in namespace";
    res = await client.putObject(test_namespace, test_filename, test_filepath);
    tester.assert(info, res, "Success!");

    info = "Test GET object when object exists in namespace";
    res = await client.getObject(test_namespace, test_filename, download_dir);
    tester.assert(info, res, "Success!");

    info = "Test file contents of file uploaded vs file downloaded";
    res = compareFiles(test_filepath, path.join(download_dir, test_filename));
    tester.assert(info, res, true);

    info = "Test GET namespace files when objects exist in namespace";
    res = await client.getNamespaceFiles(test_namespace);
    tester.assert(info, res.equals([test_filename]), true);

    info = "Test DELETE namespace when namespace is not empty";
    res = await client.deleteNamespace(test_namespace);
    tester.assert(info, res, "Error: namespace is not empty");

    info = "Test DELETE object when object exists in namespace";
    res = await client.deleteObject(test_namespace, test_filename);
    tester.assert(info, res, "Success!");

    info = "Test GET object when object doesn't exist in namespace";
    res = await client.getObject(test_namespace, test_filename, download_dir);
    tester.assert(info, res, "Error: object doesn't exist");

    info = "Test DELETE object when obect doesn't exist in namespace";
    res = await client.deleteObject(test_namespace, test_filename);
    tester.assert(info, res, "Error: object doesn't exist");

    info = "Test DELETE namespace when namespace is empty";
    res = await client.deleteNamespace(test_namespace);
    tester.assert(info, res, "Success!");

    info = "Test GET namespace files when namespace doesn't exist";
    var res = await client.getNamespaceFiles(test_namespace);
    tester.assert(info, res, "Error: namespace doesn't exist");
}   

module.exports = run_tests;