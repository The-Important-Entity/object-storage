const express = require("express");
const fs = require("fs");
const path = require("path");
var Busboy = require('busboy');
const { response } = require("express");
const Requester = require("./Requester.js");

const {getNamespaceFiles, putNamespace, deleteNamespace, getObject, putObject, deleteObject} = require("./routes");

class Router {
    constructor(config){
        this.app = express();
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: false}));

        this.port = config.PORT;
        this.dht_url = config.DHT_URL;
        this.data_dir = config.DATA_DIR;
        this.Requester = new Requester(this.dht_url);
        this.fs = require("fs");
        this.path = require("path");
        
        try {
            this.Requester.deleteWithUrl();
        }
        catch {
            
        }
        
        this.test_name = new RegExp('^[A-Za-z0-9]+[A-Za-z0-9.-]+[A-Za-z0-9]+$');

        this.app.get("/", function(req, res) {
            res.send("Working");
        })

        //Operations on namespaces
        this.app.get("/:namespace", getNamespaceFiles.bind(this));
        this.app.put("/:namespace", putNamespace.bind(this));
        this.app.delete("/:namespace", deleteNamespace.bind(this));

        //Operations on files in a namespace
        this.app.get("/:namespace/:filename", getObject.bind(this));
        this.app.put("/:namespace/:filename", putObject.bind(this));
        this.app.delete("/:namespace/:filename", deleteObject.bind(this));
    }

    async lockTable(filename) {
        var response = await this.Requester.insert_dht_writelock(filename);
        if (response == "Failed") {
            response = await this.Requester.get_locktype(filename);
            if (response.lock_type == "write") {
                return 1;
            }
            else {
                return 2;
            }
        }
        return 0;
    }

    async unlockTable(filename) {
        await this.Requester.delete_dht_writelock(filename);
        return 0;
    }

    async getLock(filename) {
        return await this.Requester.get_locktype(filename);
    }
    
    initWriteStream(req, res, filename, filepath) {
        var busboy = new Busboy({ headers: req.headers });
        busboy.on("error", function(err) {
            console.log("Busboy error catching......>>>>>>>>>>>>>>", err);
        });
    
        busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
            var stream = fs.createWriteStream(filepath);
    
            file.on("error", function(err) {
                console.log("fstream error catching......>>>>>>>>>>>>>>", err);
            });
    
            file.pipe(stream);
        }.bind(this));
    
        busboy.on('finish', async function() {
            await this.unlockTable(req.url);
            res.writeHead(200, { 'Connection': 'close' });
            res.end("Success!");
        }.bind(this));
        return busboy;
    }

    start() {
        try {
            this.server = this.app.listen(this.port, function(){
                console.log("Object Storage Gateway listening on port " + this.port.toString());
            }.bind(this));
        }
        catch(err) {
            console.log(err);
            throw err;
        }
    }

    stop() {
        try {
            this.server.close();
        }
        catch(err) {
            throw err;
        }
    }
}

module.exports = Router;