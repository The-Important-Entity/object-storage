const fs = require("fs");

const cleanup = function(dht_dir, ob_dir, download_dir, upload_dir) {
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
}
module.exports = cleanup;