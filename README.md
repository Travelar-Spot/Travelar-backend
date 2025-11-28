# **Travelar Backend**

## **1. Visão Geral do Projeto**

O **Travelar Backend** é o núcleo responsável por todas as regras de negócio da plataforma Travelar.
Diferentemente da API de Autenticação, este serviço gerencia todo o domínio principal de hospedagem: **Imóveis, Reservas, Avaliações e Upload de Imagens**.

O projeto foi desenvolvido com foco em **robustez, escalabilidade e testabilidade**, integrando serviços externos como **Cloudinary**, e utilizando **Docker** para garantir portabilidade e facilidade de execução.

[Link da documentação do projeto Travelar](https://travelar-spot.github.io/Travelar-docs/)

### **Principais Responsabilidades**

* CRUD completo de Imóveis e controle de disponibilidade
* Processamento de Reservas (Check-in, Check-out, cancelamento e gerenciamento)
* Sistema de Avaliações e Comentários
* Upload de imagens via Cloudinary
* Documentação automática com Swagger
* Estrutura modular orientada a domínios

---

## **2. Tecnologias Utilizadas**

A stack foi definida para garantir organização, consistência e alta qualidade.

| Tecnologia                  | Categoria      | Uso                                              |
| --------------------------- | -------------- | ------------------------------------------------ |
| **Node.js + TypeScript**    | Core           | Base do backend e regras de negócio              |
| **TypeORM**                 | ORM            | Mapeamento de entidades e relações complexas     |
| **PostgreSQL**              | Banco de Dados | Persistência relacional                          |
| **Jest**                    | Testes         | Testes unitários, parametrizados e de integração |
| **Swagger**                 | Documentação   | Documentação interativa da API                   |
| **Docker + Docker Compose** | Infraestrutura | Containerização da aplicação e banco             |
| **Cloudinary**              | Mídia          | Upload, otimização e entrega de imagens          |

---

## **3. Estrutura de Pastas e Arquitetura**

A arquitetura segue uma divisão por **domínios/módulos**, garantindo organização e independência entre contextos.

```
Travelar-backend/
├── src/
│   ├── config/                
│   │   ├── cloudinary.ts      
│   │   ├── env.config.ts      
│   │   └── passport.config.ts 
│   ├── database/
│   │   └── data-source.ts     
│   ├── Imovel/
│   │   ├── controller.ts      
│   │   ├── entity.ts          
│   │   ├── routes.ts          
│   │   ├── service.ts         
│   │   └── Testes/
│   │       ├── integracao.test.ts
│   │       ├── parametrizados.test.ts
│   │       └── unitarios.test.ts
│   ├── Reserva/               
│   ├── Avaliacao/             
│   ├── Usuario/               
│   ├── UploadImagens/         
│   │   └── routes.ts
│   ├── swagger/               
│   │   └── swagger.json
│   ├── app.ts                 
│   └── server.ts              
├── coverage/                  
├── docker-compose.yml         
├── Dockerfile                 
├── jest.config.js             
└── package.json
```

---

## **4. Endpoints da API**

A API segue um padrão REST sólido, com autenticação via tokens JWT e documentação acessível em **/api-docs**.

### **4.1. Imóveis (/imoveis)**

Gerencia o catálogo principal da plataforma.

| Método     | Rota          | Descrição                         |
| ---------- | ------------- | --------------------------------- |
| **POST**   | /imoveis      | Cria um novo imóvel               |
| **GET**    | /imoveis      | Lista imóveis com filtros         |
| **GET**    | /imoveis/{id} | Retorna detalhes de um imóvel     |
| **PUT**    | /imoveis/{id} | Atualiza um imóvel (proprietário) |
| **DELETE** | /imoveis/{id} | Remove imóvel                     |

---

### **4.2. Reservas (/reservas)**

Responsável pelo fluxo de aluguel.

| Método     | Rota           | Descrição                 |
| ---------- | -------------- | ------------------------- |
| **POST**   | /reservas      | Cria uma reserva          |
| **GET**    | /reservas      | Lista reservas do usuário |
| **PUT**    | /reservas/{id} | Altera datas ou status    |
| **DELETE** | /reservas/{id} | Cancela reserva           |

---

### **4.3. Avaliações (/avaliacoes)**

Sistema de feedback dos usuários.

| Método   | Rota                    | Descrição                   |
| -------- | ----------------------- | --------------------------- |
| **POST** | /avaliacoes             | Cria uma avaliação          |
| **GET**  | /avaliacoes/imovel/{id} | Lista avaliações por imóvel |

---

### **4.4. Upload (/upload)**

| Método   | Rota    | Descrição                      |
| -------- | ------- | ------------------------------ |
| **POST** | /upload | Realiza upload para Cloudinary |

---

## **5. Estratégia de Testes**

Os testes são executados pelo Jest e ficam dentro da pasta `Testes` de cada módulo.

### **5.1. Tipos de Testes**

* **Unitários**: Funções isoladas, sem banco
* **Integração**: Fluxo completo rota → controller → service → database
* **Parametrizados**: Executados com diferentes cenários de entrada

### **5.2. Comandos de Teste**

```bash
npm test
npm run test:coverage
npm run test:watch
```

Relatórios são gerados na pasta **/coverage**.

---

## **6. Instalação e Execução (via Docker)**

Este processo sobe tudo automaticamente:

* Backend
* PostgreSQL
* PgAdmin
* Swagger

---

### **6.1. Pré-requisitos**

* Docker
* Docker Compose
* Git

---

### **6.2. Clonar o repositório**

```bash
git clone https://github.com/Travelar-Spot/Travelar-backend.git
cd Travelar-backend
```

---

### **6.3. Criar arquivo `.env`**

Crie o arquivo `.env` com o seguinte conteúdo:

```env
PORT=3000
NODE_ENV=production

DB_HOST=db
DB_PORT=5432
DB_DATABASE=travelar
DB_USERNAME=developer
DB_PASSWORD=password_exemplo

JWT_SECRET=sua_chave_jwt
```

---

### **6.4. Subir o projeto**

#### **Construir e iniciar**

```bash
docker compose up --build
```

#### **Rodar em segundo plano**

```bash
docker compose up -d
```

#### **Parar**

```bash
docker compose down
```

---

## **6.5. Acessos Importantes**

| Serviço        | URL                                                              |
| -------------- | ---------------------------------------------------------------- |
| **Backend**    | [http://localhost:3000](http://localhost:3000)                   |
| **Swagger**    | [http://localhost:3000/api-docs](http://localhost:3000/api-docs) |
| **PgAdmin**    | [http://localhost:5050](http://localhost:5050)                   |
| **PostgreSQL** | localhost:5432                                                   |

#### **Credenciais PgAdmin (padrão)**

```
Email: admin@admin.com
Senha: admin
```

---

## **6.6. Executar Migrations**

### **Acessar o container**

```bash
docker exec -it travelar-backend sh
```

### **Rodar migrations**

```bash
npm run typeorm -- migration:run -d src/database/data-source.ts
```

---

## **6.7. Logs**

### Backend

```bash
docker logs -f travelar-backend
```

### Banco de Dados

```bash
docker logs -f travelar-db
```

---

## **6.8. Testes Localmente (fora do Docker)**

```bash
npm test
npm run test:watch
npm run test:coverage
```

