const {exec }= require("child_process");
const path = require("path");

const run_tests = async function(dht_dir, obj_dir, download_dir, upload_dir, client, tester, url, num_nodes, id_max){
    const test_filename = "test.txt";
    const test_filepath = path.join(upload_dir, test_filename);
    const test_namespace = "joe-namespace";

    exec("dd if=/dev/zero of=" + path.join(upload_dir, test_filename) + " bs=1 count=0 seek=100M");
    await client.putNamespace(test_namespace);

    var r = new Array(10);
    for (var i = 0; i < 10; i++) {
        r[i] = client.putObject(test_namespace, test_filename, test_filepath);
    }

    var succeeded = 0;
    var write_locked = 0;
    var other = 0;
    for (var i = 0; i < 10; i++) {
        const response = await r[i];
        if (response == "Success!") {
            succeeded++;
        }
        else if (response == "Error: write locked") {
            write_locked++;
        }
        else {
            other++;
        }
    }

    var info = "Test PUT object when several requests are sent at once";
    tester.assert(info, succeeded == 1 && write_locked == 9 && other == 0, true);

    await client.deleteNamespace(test_namespace);
}

module.exports = run_tests;