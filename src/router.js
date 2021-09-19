const express = require("express");
const fs = require("fs");
const path = require("path");
var Busboy = require('busboy');
const { response } = require("express");
const Requester = require("./Requester.js");

class Router {
    constructor(port, dht_url, data_dir){
        this.app = express();
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: false}));

        this.port = port;
        this.dht_url = dht_url;
        this.data_dir = data_dir;
        this.Requester = new Requester(this.dht_url);
        this.test_filename = new RegExp('^[A-Za-z0-9]+[A-Za-z0-9.-]+[A-Za-z0-9]+$');

        this.app.get("/", function(req, res) {
            res.send("Working");
        })

        this.app.get("/:filename", this.download.bind(this));
        this.app.put("/:filename", this.insert.bind(this));
    }

    async download(req, res) {
        const filename = req.params.filename;
        const file_path = path.join(this.data_dir, filename);

        if (!this.test_filename.test(filename)) {
            res.status(400).send("Error: bad filename");
        }
        if (!fs.existsSync(file_path)){
            res.status(400).send("Error: object already exists");
            return;
        }

        const filestream = fs.createReadStream(file_path);
        filestream.pipe(res);
    }

    async insert(req, res) {
        const filename = req.params.filename;
        const file_path = path.join(this.data_dir, filename);

        if (!this.test_filename.test(filename)) {
            res.status(400).send("Error: bad filename");
            return
        }

        var response = await this.Requester.insert_dht_writelock(filename);
        if (response == "Failed") {
            response = await this.Requester.get_locktype(filename);
            if (response.lock_type == "write") {
                res.status(400).send("Error: write lock");
                return;
            }
            else {
                res.status(500).send("Error: potential server outage");
                return;
            }
        }



        var busboy = new Busboy({ headers: req.headers });
        busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
            file.pipe(fs.createWriteStream(file_path));
        });

        busboy.on('finish', async function() {
            await this.Requester.delete_dht_writelock(filename);
            res.writeHead(200, { 'Connection': 'close' });
            res.end("File upload Successful!");
        }.bind(this));
        return req.pipe(busboy);
    }

    listen() {
        this.app.listen(this.port, function(){
            console.log("Object Storage Gateway listening on port " + this.port.toString());
        }.bind(this));
    }
}

module.exports = Router;