module.exports = async function(req, res) {
    const namespace = req.params.namespace;
    const dirpath = this.path.join(this.data_dir, namespace);

    if (!this.fs.existsSync(dirpath)){
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

    this.fs.readdir(dirpath, function (err, files) {
        //handling error
        if (err) {
            res.status(400).send("Error: deleting namespace");
            this.unlockTable(req.url);
            return;
        } 
        if (files.length == 0) {
            this.fs.rmdir(dirpath, async function(err) {
                if (err) {
                    res.status(500).send("Error: deleting namespace");
                    this.unlockTable(req.url);
                    return;
                }
                await this.Requester.deleteNamespace(namespace);
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