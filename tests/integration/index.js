const basic_tests = require("./basic_tests");
const unauthorized_tests = require("./unauthorized_tests");

const run_all_tests = async function(dht_dir, obj_dir, download_dir, upload_dir, authorized_client, unauthorized_client, tester, url, num_nodes, id_max) {
    await basic_tests(dht_dir, obj_dir, download_dir, upload_dir, authorized_client, tester, url, num_nodes, id_max);
    await unauthorized_tests(dht_dir, obj_dir, download_dir, upload_dir, unauthorized_client, tester, url, num_nodes, id_max);
}

module.exports = run_all_tests;