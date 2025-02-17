# Wallet

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

[![Run Unit Tests](https://github.com/alissonsv/wallet/actions/workflows/run-unit-tests.yml/badge.svg)](https://github.com/alissonsv/wallet/actions/workflows/run-unit-tests.yml)
[![Run E2E Tests](https://github.com/alissonsv/wallet/actions/workflows/run-e2e-tests.yml/badge.svg)](https://github.com/alissonsv/wallet/actions/workflows/run-e2e-tests.yml)

> BackEnd de uma carteira financeira em que os usuários possam realizar transferência de saldo.

## Como rodar local:

```bash
# Sobe a aplicação com o PostgreSQL
docker compose up

# Remove os containers, imagens e network
docker compose down --rmi all
```

### Testes:

```bash
# inicia o postgres
docker compose -f docker-compose-dev.yml up -d

# instalar as dependências
npm i

# rodar os testes
npm t

# parar o postgres
docker compose -f docker-compose-dev.yml down
```

### Rotas:

- Swagger: [http://localhost:3333/api/docs](http://localhost:3000/api/docs)
