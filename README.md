# FinanTech - Sistema de Organização Financeira

A FinanTech é um sistema web completo desenvolvido com o objetivo de ajudar usuários a organizar suas finanças de forma simples, intuitiva e eficiente.

O projeto foi construído utilizando uma arquitetura fullstack, com banco de dados, backend e frontend integrados, além de autenticação de usuários e uso combinado de RESTful API e GraphQL.

---

## Objetivo do Projeto

O sistema permite que o usuário:

- controlar receitas e despesas
- visualizar saldo financeiro
- gerenciar despesas fixas
- criar e acompanhar metas financeiras
- analisar desempenho financeiro ao longo do tempo

---

## Tecnologias Utilizadas

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- JWT (autenticação)
- GraphQL

### Frontend
- HTML
- CSS
- JavaScript puro
- Chart.js

---

## Autenticação e Autorização

O sistema possui:

- cadastro de usuários
- login com geração de token JWT
- proteção de rotas
- controle de acesso por usuário (cada usuário acessa apenas seus dados)

---

## Funcionalidades

### Transações
- cadastro de receitas e despesas
- listagem das transações
- edição e exclusão
- visualização detalhada em modal
- indicadores visuais:
  - receita (seta para cima)
  - despesa (seta para baixo)

---

### Metas Financeiras
- criação de metas
- exibição de valor e prazo
- marcação de meta como concluída (checkbox)
- alteração visual quando concluída

---

### Despesas Fixas
- cadastro de despesas recorrentes (internet, aluguel, luz, etc.)
- marcação como paga
- edição e exclusão

Status automático:
- vencida
- vence hoje
- próxima do vencimento
- paga

---

### Dashboard
- saldo atual
- total de receitas
- total de despesas
- gráfico dinâmico

---

### Resumo Mensal
- filtro por período (data inicial e final)
- exibição de:
  - receitas
  - despesas
  - despesas fixas
  - saldo do período
- gráfico comparativo
- listagem de despesas fixas no período

---

## Arquitetura da API

O sistema utiliza uma arquitetura híbrida, combinando REST e GraphQL.

### RESTful API

Utilizado para operações de:

- cadastro
- edição
- exclusão

Exemplos:

POST /transaction
GET /transactions
PUT /transaction/:id
DELETE /transaction/:id


---

### GraphQL

Utilizado para consultas analíticas.

No sistema, o GraphQL foi implementado para:

- resumo mensal

Isso permite consultas mais flexíveis e eficientes, retornando apenas os dados necessários.

---

## Interface

O sistema foi desenvolvido com foco em:

- simplicidade
- usabilidade
- clareza visual

Principais elementos:

- sidebar de navegação
- cards interativos
- modais para edição
- feedback visual com cores
- layout inspirado em sistemas SaaS

---

## Estrutura do Projeto

/public → frontend (HTML, CSS, JS)
/src
/controllers → regras de negócio
/models → estrutura do banco
/routes → rotas REST
/middlewares → autenticação
/graphql → schema e resolvers
server.js → inicialização do servidor


---

## Como Rodar o Projeto

1. Instalar dependências
   npm install

2. Rodar o servidor
  node server.js

3. Acessar no navegador
http://localhost:3000


---

## Melhorias Implementadas

Durante o desenvolvimento foram adicionadas melhorias como:

- modal interativo para transações
- edição e exclusão completas
- sistema de despesas fixas com status automático
- resumo mensal com filtros
- integração com GraphQL
- sidebar de navegação
- melhoria geral de interface
- uso de gráficos dinâmicos

---

## Considerações Finais

O FinanTech se mostrou um sistema:

- funcional
- intuitivo
- escalável
- de fácil utilização

Mesmo usuários com pouca experiência conseguiram utilizá-lo com sucesso, o que demonstra a eficiência da interface desenvolvida.


---

## Resultado Final

- aplicação web completa
- banco de dados integrado
- backend e frontend funcionando
- autenticação e autorização
- RESTful API implementada
- GraphQL implementado
- interface responsiva




   
