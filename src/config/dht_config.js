'use strict';
var path = require("path");

module.exports = function(port, url, id, id_max, data_dir, size){
    return {
        "PORT": port,
        "URL": url,
        "ID": id,
        "ID_MAX": id_max,
        "DATA_DIR": path.join(data_dir),
        "SIZE": size
    };
}