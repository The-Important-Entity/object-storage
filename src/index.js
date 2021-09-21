const Router = require("./lib/router");
const container = require("./container");

class ObjectStorageNode {
    constructor(dht_config, obj_config){
        this.dht = new container.DHT_Node(dht_config);
        this.router = new Router(obj_config, container);
    }

    async start(){
        try {
            this.dht.start();
            this.router.start();
            return this;
        }
        catch(err) {
            throw err;
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