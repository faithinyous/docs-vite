# Docker Commands and templates

## Postgres

```yaml
postgres:
  image: postgis/postgis:15-3.3-alpine
  container_name: postgis
  environment:
    POSTGRES_USER: ${POSTGRES_USERNAME}
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    POSTGRES_DB: ${POSTGRES_DATABASE}
  volumes:
    - ./data/pgdata:/var/lib/postgresql/data
  ports:
    - "5432:5432"
  networks:
    - my-network
```

## Redis

```yml
redis:
  image: redis:latest
  container_name: redis_test
  ports:
    - "6379:6379"
  volumes:
    - ./data/redis:/data
  networks:
    - my-network
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 5s
    timeout: 5s
    retries: 5
```

## Backend Service Sample

```yml
backend:
  container_name: backend
  build:
    context: .
  ports:
    - "5001:5001"
  links: #<< make sure that the database are ready before starting the backend
    - redis
    - postgres
  depends_on:
    postgres:
      condition: service_healthy
    redis:
      condition: service_healthy
  volumes:
    - ./src:/src
  environment:
    POSTGRES_PORT: ${POSTGRES_PORT}
    POSTGRES_USERNAME: ${POSTGRES_USERNAME}
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    POSTGRES_HOST_REPLICA1: ${POSTGRES_HOST_REPLICA1}
    POSTGRES_DATABASE: ${POSTGRES_DATABASE}
    PORT: ${PORT}
  networks:
    - my-network
```

## Setup network

```yml
networks:
  property-network:
    driver: bridge
    ipam:
      config:
        - subnet: 10.6.0.0/16
```

## Start Docker

```bash
docker-compose up -d
```

## Stop Docker

```bash
docker-compose down
```

## Monitoring

```bash
brew install ctop
ctop
```

# Extra

## Setting up postgres replication

docker-compose.yml

```yml
version: "1"
services:
  redis:
    image: redis:latest
    container_name: redis_test
    ports:
      - "6379:6379"
    volumes:
      - ./data/redis:/data
    networks:
      - my-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5
  pg_master:
    container_name: pg_master
    build: ./postgres/master
    ports:
      - "5432:5432"
    volumes:
      - ./data/pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: ${POSTGRES_USERNAME}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DATABASE}
      PG_REP_USER: ${POSTGRES_REPLICA_USER}
      PG_REP_PASSWORD: ${POSTGRES_PASSWORD}
    networks:
      - my-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  pg_slave:
    container_name: pg_slave
    ports:
      - "5433:5432"
    links:
      - pg_master
    depends_on:
      pg_master:
        condition: service_healthy
    build: ./postgres/slave
    environment:
      POSTGRES_USER: ${POSTGRES_USERNAME}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DATABASE}
      PG_REP_USER: ${POSTGRES_REPLICA_USER}
      PG_REP_PASSWORD: ${POSTGRES_PASSWORD}
      PG_MASTER_HOST: pg_master
      PG_MASTER_PORT: ${POSTGRES_PORT}
    networks:
      - my-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  networks:
    my-network:
      driver: bridge
      ipam:
        config:
          - subnet: 10.5.0.0/16
```

master docker

```Dockerfile
FROM postgres:latest

RUN apt-get update
RUN apt-get install -y iputils-ping htop

COPY ./setup-master.sh /docker-entrypoint-initdb.d/setup-master.sh

RUN chmod 0666 /docker-entrypoint-initdb.d/setup-master.sh
```

slave docker

```Dockerfile
FROM postgres:latest


RUN apt-get update
RUN apt-get install -y iputils-ping htop


COPY ./docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]

CMD ["gosu", "postgres", "postgres"]
```

setup-master.sh

```bash
#!/bin/bash
echo "host replication postgres_replica 10.5.0.0/16 trust" >> "$PGDATA/pg_hba.conf"
tail "$PGDATA/pg_hba.conf"
set -e
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER $PG_REP_USER REPLICATION LOGIN CONNECTION LIMIT 100 ENCRYPTED PASSWORD '$PG_REP_PASSWORD';
EOSQL

cat >> ${PGDATA}/postgresql.conf <<EOF

wal_level = logical
wal_log_hints = on
archive_mode = on
archive_command = 'cd .'
max_wal_senders = 8
hot_standby = on
EOF
```

docker-entrypoint.sh

```bash
#!/bin/bash

tail "$PGDATA/pg_hba.conf"
if [ ! -s "$PGDATA/PG_VERSION" ]; then
echo "*:*:*:$PG_REP_USER:$PG_REP_PASSWORD" > ~/.pgpass

chmod 0600 ~/.pgpass

until ping -c 1 -W 1 ${PG_MASTER_HOST:?missing environment variable. PG_MASTER_HOST must be set}
    do
        echo "Waiting for master to ping..."
        sleep 1s
done
#until pg_basebackup -h ${PG_MASTER_HOST} -D ${PGDATA} -U ${PG_REP_USER} -vP -W
until pg_basebackup -h ${PG_MASTER_HOST} -D ${PGDATA} -U ${PG_REP_USER} -X stream -C -S replica_1 -v -R -W
    do
        echo "Waiting for master to connect..."
        sleep 1s
done

echo "host all all all scram-sha-256" >> "$PGDATA/pg_hba.conf"
echo "host replication postgres_replica 10.5.0.0/16 trust" >> "$PGDATA/pg_hba.conf"



set -e

cat > ${PGDATA}/standby.signal <<EOF
primary_conninfo = 'host=$PG_MASTER_HOST port=${PG_MASTER_PORT:-5432} user=$PG_REP_USER password=$PG_REP_PASSWORD'
promote_trigger_file = '/tmp/touch_me_to_promote_to_me_master'
EOF

cat > ${PGDATA}/recovery.signal <<EOF
primary_conninfo = 'host=$PG_MASTER_HOST port=${PG_MASTER_PORT:-5432} user=$PG_REP_USER password=$PG_REP_PASSWORD'
promote_trigger_file = '/tmp/touch_me_to_promote_to_me_master'
EOF

chown postgres. ${PGDATA} -R
chmod 700 ${PGDATA} -R
fi

sed -i 's/wal_level = hot_standby/wal_level = replica/g' ${PGDATA}/postgresql.conf

exec "$@"

```

File structure

- Project folder
  - master
    - Dockerfile # < master Docker
    - setup-master.sh # < master setup script
  - slave
    - Dockerfile # < slave Docker
    - docker-entrypoint.sh # < slave setup script
  - docker-compose.yml # < docker-compose file
