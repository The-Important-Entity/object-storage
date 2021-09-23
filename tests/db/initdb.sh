#!/bin/bash

sudo docker pull postgres
mkdir $1
sudo docker run -d --name dev-postgres -e POSTGRES_PASSWORD=jds81799 -v $1:/var/lib/postgresql/data -e PGDATA=/var/lib/postgresql/data/pgdata -p 6000:5432 postgres
sudo docker cp $2 dev-postgres:/docker-entrypoint-initdb.d/newscript.sql
sudo docker exec -u postgres dev-postgres psql postgres postgres -f docker-entrypoint-initdb.d/newscript.sql