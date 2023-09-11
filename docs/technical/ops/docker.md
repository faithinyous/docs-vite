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
