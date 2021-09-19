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
        this.app.delete("/:filename", this.delete.bind(this),);
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

    async download(req, res) {
        const filename = req.params.filename;
        const filepath = path.join(this.data_dir, filename);

        if (!this.test_filename.test(filename)) {
            res.status(400).send("Error: bad filename");
            return;
        }

        if (!fs.existsSync(filepath)){
            res.status(400).send("Error: object doesn't exists");
            return;
        }

        const filestream = fs.createReadStream(filepath);
        filestream.pipe(res);
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
        });

        busboy.on('finish', async function() {
            await this.unlockTable(filename);
            res.writeHead(200, { 'Connection': 'close' });
            res.end("File upload Successful!");
        }.bind(this));
        return busboy;
    }

    async insert(req, res) {
        const filename = req.params.filename;
        const filepath = path.join(this.data_dir, filename);

        if (!this.test_filename.test(filename)) {
            res.status(400).send("Error: bad filename");
            return
        }

        var response = await this.lockTable(filename);
        if (response == 1){
            res.status(400).send("Error: write locked");
            return;
        }
        else if (response == 2){
            res.status(500).send("Error: server outage");
            return;
        }

        var stream = this.initWriteStream(req, res, filename, filepath);

        return req.pipe(stream);
    }

    async delete(req, res) {
        const filename = req.params.filename;
        const filepath = path.join(this.data_dir, filename);

        if (!this.test_filename.test(filename)) {
            res.status(400).send("Error: bad filename");
            return
        }

        var response = await this.lockTable(filename);
        if (response == 1){
            res.status(400).send("Error: write locked");
            return;
        }
        else if (response == 2){
            res.status(500).send("Error: server outage");
            return;
        }

        if (!fs.existsSync(filepath)){
            res.status(400).send("Error: object doesn't exists");
            return;
        }

        fs.unlinkSync(filepath);

        await this.unlockTable(filename);
        res.status(200).send("File delete Successful!");
    }

    listen() {
        this.app.listen(this.port, function(){
            console.log("Object Storage Gateway listening on port " + this.port.toString());
        }.bind(this));
    }
}

module.exports = Router;