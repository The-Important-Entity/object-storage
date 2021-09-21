module.exports = async function(req, res) {
    const filename = this.path.join(req.params.namespace, req.params.filename);
    const filepath = this.path.join(this.data_dir, filename);

    if (!this.test_name.test(req.params.namespace)) {
        res.status(400).send("Error: bad namespace name");
        return;
    }

    if (!this.test_name.test(req.params.filename)) {
        res.status(400).send("Error: bad file name");
        return;
    }

    if (!this.fs.existsSync(this.path.join(this.data_dir, req.params.namespace))) {
        res.status(400).send("Error: namespace doesn't exist");
        return;
    }

    if (!this.fs.existsSync(filepath)){
        res.status(400).send("Error: object doesn't exist");
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

    this.fs.unlinkSync(filepath);

    await this.unlockTable(req.url);
    res.status(200).send("Success!");
}