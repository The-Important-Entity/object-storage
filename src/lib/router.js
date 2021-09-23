var Busboy = require('busboy');
const Requester = require("./utils/Requester.js");
const {getNamespaceFiles, putNamespace, deleteNamespace, getObject, putObject, deleteObject} = require("./routes");
const axios = require("axios");

class Router {
    constructor(config, container){
        this.app = container.express();
        this.app.use(container.express.json());
        this.app.use(container.express.urlencoded({extended: false}));

        this.port = config.PORT;
        this.dht_url = config.DHT_URL;
        this.data_dir = config.DATA_DIR;
        this.Requester = new Requester(this.dht_url);
        this.fs = container.fs;
        this.path = container.path;
        this.crypto = container.crypto;
        
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
        this.app.get("/:namespace", [
            this.authenticate.bind(this),
            this.testNamespace.bind(this), 
            getNamespaceFiles.bind(this)
        ]);
        this.app.put("/:namespace", [
            this.authenticate.bind(this),
            this.testNamespace.bind(this), 
            putNamespace.bind(this)
        ]);
        this.app.delete("/:namespace", [
            this.authenticate.bind(this),
            this.testNamespace.bind(this), 
            deleteNamespace.bind(this)
        ]);

        //Operations on files in a namespace
        this.app.get("/:namespace/:filename", [
            this.authenticate.bind(this),
            this.testNamespace.bind(this),
            this.testFilename.bind(this),
            getObject.bind(this)
        ]);
        this.app.put("/:namespace/:filename", [
            this.authenticate.bind(this),
            this.testNamespace.bind(this), 
            this.testFilename.bind(this),
            putObject.bind(this)
        ]);
        this.app.delete("/:namespace/:filename", [
            this.authenticate.bind(this),
            this.testNamespace.bind(this),
            this.testFilename.bind(this),
            deleteObject.bind(this)
        ]);
    }

    async authenticate(req, res, next) {
        if (!req.headers || !req.headers.authorization || !req.headers.date || !req.headers.nonce){
            res.status(400).send("Error: Unauthorized!");
        }
        else {
            try {
                const response = await axios.post("http://localhost:5000/access_key", {
                "auth_token": req.headers.authorization,
                "method": req.method,
                "url": req.url,
                "date": req.headers.date,
                "nonce": req.headers.nonce
                });

                if (response.data == "Authorized") {
                    next();
                    return;
                }
                else {
                    res.status(400).send("Error: Unauthorized!");
                    return;
                }
            }
            catch(err) {
                console.log(err);
                res.status(400).send("Error: Unauthorized!");
            }
        }
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

    testNamespace(req, res, next){
        if (!this.test_name.test(req.params.namespace)) {
            res.status(400).send("Error: bad namespace name");
            return;
        }
        next();
    }

    testFilename(req, res, next){
        if (!this.test_name.test(req.params.filename)) {
            res.status(400).send("Error: bad filename name");
            return;
        }
        next();
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
            var stream = this.fs.createWriteStream(filepath);
    
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