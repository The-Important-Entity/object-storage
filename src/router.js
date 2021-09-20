const express = require("express");
const fs = require("fs");
const path = require("path");
var Busboy = require('busboy');
const { response } = require("express");
const Requester = require("./Requester.js");



class Router {
    constructor(config){
        this.app = express();
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: false}));

        this.port = config.PORT;
        this.dht_url = config.DHT_URL;
        this.data_dir = config.DATA_DIR;
        this.Requester = new Requester(this.dht_url);
        
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
        this.app.get("/:namespace", this.getNamespaceFiles.bind(this));
        this.app.put("/:namespace", this.createNamespace.bind(this));
        this.app.delete("/:namespace", this.deleteNamespace.bind(this));

        //Operations on files in a namespace
        this.app.get("/:namespace/:filename", this.download.bind(this));
        this.app.put("/:namespace/:filename", this.insert.bind(this));
        this.app.delete("/:namespace/:filename", this.delete.bind(this));
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

    async getNamespaceFiles(req, res) {
        const namespace = req.params.namespace;
        const dirpath = path.join(this.data_dir, namespace);

        if (!this.test_name.test(namespace)) {
            res.status(400).send("Error: bad namespace name");
            return;
        }

        // if (!fs.existsSync(dirpath)){
        //     res.status(400).send("Error: namespace doesn't exist");
        //     return;
        // }

        fs.readdir(dirpath, function (err, files) {
            //handling error
            if (err) {
                res.status(400).send("Error: namespace doesn't exist");
                return;
            } 
            //listing all files using forEach
            res.status(200).send(files);
            return;
        });
    }

    async createNamespace(req, res) {
        const namespace = req.params.namespace;
        const dirpath = path.join(this.data_dir, namespace);

        this.lockTable(req.url);
        if (!this.test_name.test(namespace)) {
            res.status(400).send("Error: bad namespace name");
            return;
        }

        if (fs.existsSync(dirpath)){
            res.status(400).send("Error: namespace already exists");
            return;
        }

        fs.mkdir(dirpath, function(err) {
            if (err) {
                res.status(500).send("Error: creating namespace");
                this.unlockTable(req.url);
                return;
            }
            res.status(200).send("Success!");
        }.bind(this));
        this.unlockTable(req.url);
    }

    async deleteNamespace(req, res) {
        const namespace = req.params.namespace;
        const dirpath = path.join(this.data_dir, namespace);

        this.lockTable(req.url);
        if (!this.test_name.test(namespace)) {
            res.status(400).send("Error: bad namespace name");
            this.unlockTable(req.url);
            return;
        }

        if (!fs.existsSync(dirpath)){
            res.status(400).send("Error: namespace doesn't exist");
            this.unlockTable(req.url);
            return;
        }

        fs.readdir(dirpath, function (err, files) {
            //handling error
            if (err) {
                res.status(400).send("Error: deleting namespace");
                this.unlockTable(req.url);
                return;
            } 
            if (files.length == 0) {
                fs.rmdir(dirpath, function(err) {
                    if (err) {
                        res.status(500).send("Error: deleting namespace");
                        this.unlockTable(req.url);
                        return;
                    }
                    res.status(200).send("Success!");
                }.bind(this));
            }
            else {
                res.status(400).send("Error: namespace is not empty");
                this.unlockTable(req.url);
                return;
            }
        }.bind(this));
        this.unlockTable(req.url);
    }

    async download(req, res) {
        const filename = req.url;
        const filepath = path.join(this.data_dir, filename);

        const response = await this.getLock(filename);
        if (response) {
            res.status(400).send("Error: object is " + response.lock_type + " locked");
            return;
        }

        if (!this.test_name.test(req.params.namespace)) {
            res.status(400).send("Error: bad namespace name");
            return;
        }

        if (!this.test_name.test(req.params.filename)) {
            res.status(400).send("Error: bad file name");
            return;
        }

        if (!fs.existsSync(path.join(this.data_dir, req.params.namespace))) {
            res.status(400).send("Error: namespace doesn't exist");
            return;
        }

        if (!fs.existsSync(filepath)){
            res.status(400).send("Error: object doesn't exist");
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
        }.bind(this));

        busboy.on('finish', async function() {
            await this.unlockTable(req.url);
            res.writeHead(200, { 'Connection': 'close' });
            res.end("Success!");
        }.bind(this));
        return busboy;
    }

    async insert(req, res) {
        const filename = path.join(req.params.namespace, req.params.filename);
        const filepath = path.join(this.data_dir, filename);

        if (!this.test_name.test(req.params.namespace)) {
            res.status(400).send("Error: bad namespace name");
            return;
        }

        if (!this.test_name.test(req.params.filename)) {
            console.log(req.params.filename);
            res.status(400).send("Error: bad file name");
            return;
        }

        if (!fs.existsSync(path.join(this.data_dir, req.params.namespace))) {
            res.status(400).send("Error: namespace doesn't exist");
            return;
        }

        var response = await this.lockTable(req.url);
        if (response == 1){
            res.status(400).send("Error: write locked");
            return;
        }
        else if (response == 2){
            res.status(500).send("Error: server outage");
            return;
        }

        var stream = this.initWriteStream(req, res, filename, filepath);
        req.on('close', async function (err){
            await this.unlockTable(req.url);
        }.bind(this));
        return req.pipe(stream);
    }

    async delete(req, res) {
        const filename = path.join(req.params.namespace, req.params.filename);
        const filepath = path.join(this.data_dir, filename);

        if (!this.test_name.test(req.params.namespace)) {
            res.status(400).send("Error: bad namespace name");
            return;
        }

        if (!this.test_name.test(req.params.filename)) {
            res.status(400).send("Error: bad file name");
            return;
        }

        if (!fs.existsSync(path.join(this.data_dir, req.params.namespace))) {
            res.status(400).send("Error: namespace doesn't exist");
            return;
        }

        if (!fs.existsSync(filepath)){
            res.status(400).send("Error: object doesn't exist");
            return;
        }

        var response = await this.lockTable(req.url);
        if (response == 1){
            res.status(400).send("Error: write locked");
            return;
        }
        else if (response == 2){
            res.status(500).send("Error: server outage");
            return;
        }

        fs.unlinkSync(filepath);

        await this.unlockTable(req.url);
        res.status(200).send("Success!");
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