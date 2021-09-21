const fs = require("fs");

const init = function(dht_dir, ob_dir, download_dir, upload_dir) {
    if (fs.existsSync(dht_dir)) {
        fs.rmSync(dht_dir, { recursive: true, force: true });
    }
    
    if (fs.existsSync(ob_dir)) {
        fs.rmSync(ob_dir, { recursive: true, force: true });
    }
    
    if (fs.existsSync(download_dir)) {
        fs.rmSync(download_dir, { recursive: true, force: true });
    }
    
    if (fs.existsSync(upload_dir)) {
        fs.rmSync(upload_dir, { recursive: true, force: true });
    }
    fs.mkdirSync(dht_dir);
    fs.mkdirSync(ob_dir);
    fs.mkdirSync(download_dir);
    fs.mkdirSync(upload_dir);
}
module.exports = init;