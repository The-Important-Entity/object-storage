const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
var Busboy = require('busboy');

const uploadFile = (req, filePath) => {
    return new Promise((resolve, reject) => {
        const stream = fs.createWriteStream(filePath);
        // With the open - event, data will start being written
        // from the request to the stream's destination path
        stream.on('open', () => {
            req.pipe(stream);
        });

        // When the stream is finished, print a final message
        // Also, resolve the location of the file to calling function
        stream.on('close', () => {
            resolve(filePath);
        });

        // If something goes wrong, reject the primise
        stream.on('error', err => {
            reject(err);
        });
    });
};

class Router {
    constructor(port, dht_url, data_dir){
        this.app = express();
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: false}));

        this.port = port;
        this.dht_url = dht_url;
        this.data_dir = data_dir;
        this.app.get("/", function(req, res) {
            res.send("Working");
        })

        this.app.put("/insert/:filename", async function(req, res) {
            const filename = req.params.filename;
            const file_path = path.join(this.data_dir, filename);
            var response = await axios.get(this.dht_url + "/lookup?key=" + filename);
            if (response.data){
                if (response.data.lock_type == "write") {
                    res.status(400).send("Error: write lock");
                    return;
                }
            }
            response = await axios.post(this.dht_url + "/insert", {
                "key": filename,
                "lock_type": "write"
            });

            if (fs.existsSync(file_path)){
                res.status(400).send("Error: object already exists");
                await axios.post(this.dht_url + "/delete", {
                    "key": filename
                });
                return;
            }



            var busboy = new Busboy({ headers: req.headers });
            busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
                console.log('Uploading: ' + file_path);
                file.pipe(fs.createWriteStream(file_path));
            });

            busboy.on('finish', async function() {
                await axios.post(this.dht_url + "/delete", {
                    "key": filename
                });
                console.log('Upload complete');
                res.writeHead(200, { 'Connection': 'close' });
                res.end("That's all folks!");
            }.bind(this));
            return req.pipe(busboy);

        }.bind(this));
    }

    listen() {
        this.app.listen(this.port, function(){
            console.log("Object Storage Gateway listening on port " + this.port.toString());
        }.bind(this));
    }
}

module.exports = Router;