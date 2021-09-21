

module.exports = async function(req, res) {
    const filename = this.path.join(req.params.namespace, req.params.filename);
    const filepath = this.path.join(this.data_dir, filename);


    if (!this.fs.existsSync(this.path.join(this.data_dir, req.params.namespace))) {
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

    var stream = this.initWriteStream(req, res, filename, filepath);
    req.on('close', async function (err){
        await this.unlockTable(req.url);
    }.bind(this));
    return req.pipe(stream);
}