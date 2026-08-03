# 🛢️ Domínio Lubrificantes - API & Sistema de Gestão

API REST desenvolvida em Java com Spring Boot para gestão de atendimento, veículos e disparos automáticos de lembretes de troca de óleo para a **Domínio Lubrificantes**.

O foco principal do sistema é a **fidelização de clientes**, simplificando o cadastro no balcão e agendando alertas automáticos via WhatsApp após 6 meses da última troca efetuada.

---

## 🚀 Tecnologias Utilizadas

- **Linguagem:** Java 17 / 21
- **Framework Principal:** Spring Boot 3.x
- **Persistência & Dados:** Spring Data JPA + Hibernate
- **Banco de Dados:** PostgreSQL
- **Utilitários & Validações:** Lombok, Bean Validation
- **Agendamento de Tarefas:** `@Scheduled` (Spring Task Scheduler)
- **Gerenciador de Dependências:** Maven

---

## 📁 Estrutura do Projeto

```text
br.com.dominiolubrificantes.api
├── config/         # Configurações do ecossistema Spring (CORS, Beans)
├── controller/     # Endpoints da API REST (Recebe requisições do front-end)
├── dto/            # Objetos de transferência de dados (Request / Response)
├── entity/         # Entidades de domínio JPA (Cliente, Veiculo, TrocaOleo)
├── repository/     # Interfaces de acesso ao banco de dados (Spring Data JPA)
├── scheduler/      # Tarefas agendadas em segundo plano (Lembrete de 6 meses)
└── service/        # Regras de negócio e integração com API de mensagens