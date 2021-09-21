module.exports = async function(req, res) {
    const namespace = req.params.namespace;
    const dirpath = this.path.join(this.data_dir, namespace);

    this.lockTable(req.url);
    if (!this.test_name.test(namespace)) {
        res.status(400).send("Error: bad namespace name");
        this.unlockTable(req.url);
        return;
    }

    if (!this.fs.existsSync(dirpath)){
        res.status(400).send("Error: namespace doesn't exist");
        this.unlockTable(req.url);
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
            this.fs.rmdir(dirpath, function(err) {
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