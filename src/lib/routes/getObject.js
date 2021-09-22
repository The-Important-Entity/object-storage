module.exports = async function(req, res) {
    const filename = this.path.join(req.params.namespace, req.params.filename);
    const filepath = this.path.join(this.data_dir, filename);

    const response = await this.getLock(filename);

    if (response) {
        res.status(401).send("Error: object is " + response.lock_type + " locked");
        return;
    }

    if (!this.fs.existsSync(this.path.join(this.data_dir, req.params.namespace))) {
        
        res.status(402).send("Error: namespace doesn't exist");
        return;
    }

    if (!this.fs.existsSync(filepath)){
        res.status(403).send("Error: object doesn't exist");
        return;
    }

    const filestream = this.fs.createReadStream(filepath);
    filestream.pipe(res);
}