'use strict';
const axios = require("axios");

class Requester {
    constructor(dht_url){
        this.dht_url = dht_url;
    }

    async insert_dht_writelock(filename) {
        try {
            const response = await axios.post(this.dht_url + "/insert", {
                "key": filename,
                "lock_type": "write"
            });
            return response.data;
        }
        catch(e) {
            console.log(e);
            return "Failed";
        }
    }

    async delete_dht_writelock(filename) {
        try {
            const response = await axios.post(this.dht_url + "/delete", {
                "key": filename
            });
            return response.data;
        }
        catch {
            return "Failed";
        }
    }

    async get_locktype(filename) {
        try {
            const response = await axios.get(this.dht_url + "/lookup?key=" + filename);
            return response.data;
        }
        catch {
            return "Failed";
        }
    }
}

module.exports = Requester;