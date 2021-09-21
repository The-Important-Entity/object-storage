module.exports = async function(req, res) {
    const namespace = req.params.namespace;
    const dirpath = this.path.join(this.data_dir, namespace);

    this.lockTable(req.url);
    if (!this.test_name.test(namespace)) {
        res.status(400).send("Error: bad namespace name");
        return;
    }

    if (this.fs.existsSync(dirpath)){
        res.status(400).send("Error: namespace already exists");
        return;
    }

    this.fs.mkdir(dirpath, function(err) {
        if (err) {
            res.status(500).send("Error: creating namespace");
            this.unlockTable(req.url);
            return;
        }
        res.status(200).send("Success!");
    }.bind(this));
    this.unlockTable(req.url);
}