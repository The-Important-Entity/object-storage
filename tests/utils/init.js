const fs = require("fs");

const init = function(dht_dir, ob_dir, download_dir, upload_dir) {
    fs.mkdirSync(dht_dir);
    fs.mkdirSync(ob_dir);
    fs.mkdirSync(download_dir);
    fs.mkdirSync(upload_dir);
}
module.exports = init;