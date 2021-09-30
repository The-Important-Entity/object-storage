module.exports = async function(req, res) {
    const namespace = req.params.namespace;
    const dirpath = this.path.join(this.data_dir, namespace);

    if (this.fs.existsSync(dirpath)){
        res.status(400).send("Error: namespace already exists");
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

    const arr = req.headers.authorization.split(":");
    const app_id = arr[0];
    const response = await this.requester.getAppId(app_id);
    const group_id = response[0].group_id;

    const postNamespace = await this.requester.insertNamespace(namespace, group_id);
    if (!Array.isArray(postNamespace)) {
        res.status(500).send("Error: internal server error");
        return;
    };

    this.fs.mkdir(dirpath, function(err) {
        if (err) {
            res.status(500).send("Error: creating namespace");
            this.unlockTable(req.url);
            await this.requester.deleteNamespace(namespace);
            return;
        }
        res.status(200).send("Success!");
    }.bind(this));
    this.unlockTable(req.url);
}