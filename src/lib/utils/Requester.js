'use strict';
const axios = require("axios");

class Requester {
    constructor(dht_url, db_service){
        this.dht_url = dht_url;
        this.db_service = db_service;
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

    async deleteWithUrl() {
        try {
            const response = await axios.get(this.dht_url + "/all_bindings");
            const allBindings = response.data;
            for (var i = 0; i < allBindings.length; i++) {
                if (allBindings[i].value.url == this.dht_url) {
                    this.delete_dht_writelock(allBindings[i].key);
                }
            }
        }
        catch {
            //console.log(1);
        }
    }

    async insertNamespace(namespace, group_id) {
        try {
            const response = await axios.post(this.db_service + "/namespace/security_group", {
                "namespace": namespace,
                "group_id": group_id
            });
            return response.data
        }
        catch(err) {
            console.log(err);
            return err.response.data;
        }
    }

    async deleteNamespace(namespace) {
        try {
            const response = await axios.depete(this.db_service + "/namespace/" + namespace);
            return response.data
        }
        catch(err) {
            console.log(err);
            return err.response.data;
        }
    }

    async insertSecurityPermission(namespace, group_id) {
        try {
            const response = await axios.post(this.db_service + "/security_perm", {
                "namespace": namespace,
                "group_id": group_id,
                "read_perm": 1,
                "write_perm": 1
            });
            return response.data;
        }
        catch(err) {
            console.log(err);
            return err.response.data;
        }
    }

    async getAppId(app_id) {
        try {
            const response = await axios.get(this.db_service + "/access_key/single/" + app_id);
            return response.data;
        }
        catch(err) {
            console.log(err);
            return err.response.data
        }
    }
}

module.exports = Requester;