const DHT_Node = require("dht-node");
const Router = require("./router");

class ObjectStorageNode {
    constructor(dht_config, obj_config){
        this.dht = new DHT_Node(dht_config);
        this.router = new Router(obj_config);
    }

    async start(){
        try {
            this.dht.start();
            this.router.start();
            return this;
        }
        catch(err) {
            console.log(err);
        }
    }

    async stop(){
        try {
            this.dht.stop();
            this.router.stop();
        }
        catch(err) {
            throw err;
        }
    }
}

module.exports = ObjectStorageNode;