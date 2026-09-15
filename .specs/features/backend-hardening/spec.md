# Backend Hardening (correções da revisão `REVISAO_BACKEND.md`) Specification

## Problem Statement

A revisão rigorosa do backend `sisjuridico/carbocat` (`REVISAO_BACKEND.md`) encontrou uma
falha de controle de acesso que permite qualquer usuário autenticado se autopromover a
`ADMIN`, além de lacunas de robustez (exceções não tratadas, log silencioso), um risco de
integridade de dados sem defesa em profundidade, N+1 sistêmico por fetch EAGER, código
morto e duplicação de lógica de filtro. Esta spec cobre a correção de tudo isso, exceto os
itens 2 (já ajustado pelo usuário) e 7 (mantido como backlog de testes, fora de escopo
aqui).

## Goals

- [ ] Fechar a escalação de privilégio em `/users`: qualquer usuário autenticado só pode
      editar o próprio nome e a própria senha; só `ADMIN` altera papel (`role`), cria,
      lista ou remove usuários.
- [ ] Eliminar pontos cegos de observabilidade: exceções não mapeadas e falhas de
      validação de token JWT passam a ser logadas e a responder em formato consistente.
- [ ] Fechar o N+1 sistêmico trocando todo `@ManyToOne` de EAGER (padrão) para LAZY.
- [ ] Reforçar a invariante "documento pertence a contrato OU processo, nunca os dois" com
      uma constraint de banco, e documentar/travar o comportamento correto do PATCH.
- [ ] Impedir crescimento indefinido da tabela `refresh_token` com limpeza agendada.
- [ ] Remover código morto (`UserNotFoundException`, campos `documents` não lidos,
      matcher redundante) e a duplicação de 29 ocorrências do idioma de filtro nas
      classes `*Specifications`.

## Out of Scope

Explicitamente excluído desta spec. Documentado para evitar scope creep.

| Item                                                                 | Motivo                                                                                                                   |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Achado #2 (`ddl-auto`/Flyway)                                          | Já ajustado pelo usuário (`create` → `update`) antes desta spec.                                                        |
| Achado #7 (cobertura de testes quase nula do restante do backend)      | Usuário pediu para manter só como item de backlog de testes; não é tarefa de implementação desta spec.                    |
| Autorização de `GET /users` e `GET /users/{id}`                       | Usuário só pediu edição (nome/senha/papel); leitura permanece `authenticated()` como hoje, sem mudança.                   |
| Unificar `/auth/change-password` com `/users/{id}/password`           | São dois fluxos com posturas de segurança diferentes por design (autoatendimento com senha atual vs. reset por ADMIN); não há pedido para fundi-los. |
| Migrar `contractId`/`lawsuitId` de `Document` para um endpoint dedicado de "transferir dono" | Redesenho de API maior que o necessário para o achado atual; a constraint de banco (DOC-03) já cobre o risco real. |
| Novos endpoints ou campos de DTO                                       | Esta spec corrige comportamento e reforça invariantes existentes; não adiciona funcionalidade nova.                        |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Escopo de autoatendimento em `PATCH /users/{id}` | Usuário autenticado só pode chamar `PATCH /users/{id}` para o próprio `id`, e só pode alterar `name`/`password`; qualquer `role` não nulo no corpo é rejeitado com 403 quando quem chama não é ADMIN. | Frase literal do usuário: "usuário precisa ter acesso a editar seu nome e senha, não papel. Somente admin pode editar seu papel." | y (confirmado pelo usuário) |
| `POST /users`, `PUT /users/{id}` (replace completo), `DELETE /users/{id}`, `GET /users` (listagem) | Restritos a `ADMIN` | `POST`/`PUT` sempre exigem `role` no DTO (`@NotNull`), então nunca podem ser autoatendimento; `DELETE` e a listagem são operações administrativas que a falha original também expunha (ver Achado #1 do review) e o objetivo declarado é fechar a escalação de privilégio por completo, não só a edição de papel. | n — assumido a partir do objetivo geral do achado #1; ajustar se o usuário quiser abrir `DELETE`/listagem para outro papel |
| `PATCH /users/{id}/password` (reset administrativo, sem exigir senha atual) | Continua restrito a `ADMIN`, comportamento inalterado | Já é o único endpoint hoje protegido por `hasRole("ADMIN")`; a via de autoatendimento de senha "com senha atual" já existe em `POST /auth/change-password` (`AuthService.changePassword`) e não precisa ser duplicada. | n — assumido; caminho de autoatendimento de senha do usuário citado na instrução é servido por `/auth/change-password`, que já funciona |
| Comportamento do `PATCH /documents/{id}` ao enviar só `contractId` (achado #8) | **Mantém** o comportamento atual (definir o novo dono e zerar o outro ponteiro automaticamente) — NÃO implementa a sugestão original do review de "preservar o lado não enviado". Em vez disso, documenta o comportamento explicitamente (Javadoc/OpenAPI) e adiciona um teste que trava esse contrato. | Análise mais profunda durante a spec: como `Document` só pode ter um dono por vez (achado #9), "preservar o lado não enviado" deixaria `contract` e `lawsuit` setados ao mesmo tempo sempre que o outro lado já estivesse preenchido — violaria a própria invariante que o achado #9 busca proteger com uma `CHECK` constraint. A sugestão original do review estava equivocada; o comportamento atual é o único correto dado o domínio. | n — decisão técnica tomada durante a spec; sinalizar se o usuário queria de fato uma mudança de comportamento aqui |
| Nome/cron da limpeza agendada de refresh tokens (achado #12) | Nova propriedade `app.refresh-token.cleanup-cron` (default diário, ex. `0 0 1 * * *`), mesmo padrão de `app.contract.expiration-cron`, reaproveitando `security.jwt.expiration...`/`refresh-token.expiration-seconds` já existentes para o timezone (`app.contract.expiration-zone`). | Menor superfície nova possível, segue convenção já estabelecida no projeto (`ContractExpirationScheduler`). | n — assumido por consistência de convenção |
| Formato do handler genérico de exceção (achado #4) | `@ExceptionHandler(Exception.class)` → 500 com `ErrorResponse` padrão + log em nível ERROR; `DataIntegrityViolationException` → 409 com `ErrorResponse` específico. | Menor mudança que fecha a lacuna sem introduzir um novo formato de payload. | n — assumido |
| Total de associações `@ManyToOne` a corrigir (achado #3) | 10 campos: `Contract.contractor`, `Contract.contracted`, `ContractExtension.contract`, `Document.contract`, `Document.lawsuit`, `Lawsuit.person`, `Lawsuit.lawyer`, `Lawsuit.counterPartPerson`, `Lawsuit.counterPartLawyer`, `RefreshToken.user`. | Confirmado por grep em `entities/*.java`; corrige a contagem de "9" citada no texto do `REVISAO_BACKEND.md`. | y (fato verificado no código) |

**Open questions:** none — todas as ambiguidades acima foram resolvidas com um default
explícito e justificado (linhas marcadas `n` são decisões técnicas assumidas nesta fase;
o usuário pode ajustá-las antes da fase de Design).

---

## User Stories

### P1: AUTHZ — Autoatendimento de usuário sem escalação de privilégio ⭐ MVP

**User Story**: Como usuário autenticado, quero editar meu próprio nome e minha própria
senha sem depender de um administrador, mas sem conseguir alterar meu papel (`role`) nem
o de qualquer outro usuário, para que a conta administrativa não possa ser tomada por um
usuário comum.

**Why P1**: É a falha de segurança mais grave do review (escalação de privilégio total) —
bloqueia qualquer deploy real do sistema.

**Acceptance Criteria**:

1. WHEN um usuário autenticado com papel `USER` envia `PATCH /users/{seu-próprio-id}` com
   `name` e/ou `password` preenchidos e `role` ausente/nulo THEN o sistema SHALL aplicar as
   alterações e responder `200 OK` com o usuário atualizado.
2. IF um usuário autenticado sem papel `ADMIN` envia `PATCH /users/{id}` (qualquer `id`,
   inclusive o próprio) com o campo `role` não nulo no corpo THEN o sistema SHALL rejeitar
   com `403 Forbidden` e SHALL NOT persistir nenhuma alteração do payload.
3. IF um usuário autenticado sem papel `ADMIN` envia `PATCH /users/{id}` onde `{id}` é
   diferente do seu próprio id THEN o sistema SHALL rejeitar com `403 Forbidden`.
4. WHEN um usuário autenticado com papel `ADMIN` envia `PATCH /users/{id}` (qualquer `id`)
   com `name`, `password` e/ou `role` THEN o sistema SHALL aplicar todas as alterações
   fornecidas e responder `200 OK`.
5. IF um usuário autenticado sem papel `ADMIN` chama `POST /users`, `PUT /users/{id}`,
   `DELETE /users/{id}` ou `GET /users` (listagem) THEN o sistema SHALL rejeitar com
   `403 Forbidden`.
6. WHEN um usuário autenticado com papel `ADMIN` chama `POST /users`, `PUT /users/{id}`,
   `DELETE /users/{id}` ou `GET /users` THEN o sistema SHALL processar normalmente
   (comportamento inalterado em relação ao existente).
7. The system SHALL continuar exigindo papel `ADMIN` para `PATCH /users/{id}/password`
   (reset administrativo sem senha atual) — comportamento inalterado.
8. The system SHALL manter `POST /auth/change-password` (autoatendimento com verificação
   de senha atual) sem nenhuma alteração de comportamento.

**Independent Test**: Criar dois usuários (`USER` e `ADMIN`) via seed de teste; como
`USER`, confirmar que `PATCH /users/{id-do-USER}` com `name` funciona (200), que o mesmo
request com `role: "ADMIN"` retorna 403 e não altera o papel no banco, e que
`PATCH /users/{id-do-ADMIN}` (outro usuário) retorna 403. Como `ADMIN`, confirmar que
`PATCH /users/{qualquer-id}` com `role` funciona (200).

---

### P1: ERR — Tratamento de exceção consistente e observável

**User Story**: Como responsável por operar o sistema, quero que qualquer erro não
mapeado explicitamente ainda responda no formato padrão da API e fique registrado em log,
para que eu consiga diagnosticar falhas em produção em vez de só ver um 500 genérico do
Spring.

**Why P1**: Sem isso, falhas de infraestrutura e bugs reais ficam indistinguíveis de
"token inválido" (ver ERR-03) e o cliente da API recebe dois formatos de erro diferentes.

**Acceptance Criteria**:

1. WHEN uma exceção não tratada por nenhum `@ExceptionHandler` específico propaga de um
   controller THEN o sistema SHALL responder `500 Internal Server Error` no formato
   `ErrorResponse` já usado pelos demais handlers E SHALL registrar a exceção completa
   (stack trace) em nível `ERROR`.
2. WHEN uma `DataIntegrityViolationException` ocorre (ex.: violação de `unique` em
   `userName` ou `RefreshToken.token`) THEN o sistema SHALL responder `409 Conflict` no
   formato `ErrorResponse`, em vez do 500 genérico atual.
3. IF `JwtAuthenticationFilter` captura qualquer exceção ao processar um token Bearer
   THEN o sistema SHALL registrar em log (nível `WARN`, incluindo tipo e mensagem da
   exceção, nunca o valor bruto do token) antes de limpar o `SecurityContext` e continuar a
   cadeia de filtros — comportamento de resposta ao cliente permanece o mesmo (requisição
   segue como não autenticada).

**Independent Test**: Forçar uma `DataIntegrityViolationException` (criar dois usuários
com o mesmo `userName`) e confirmar resposta 409 no formato `ErrorResponse`; forçar uma
exceção genérica em um ponto de teste e confirmar 500 no formato `ErrorResponse` + entrada
de log; enviar um `Authorization: Bearer <token-corrompido>` e confirmar que a requisição
segue como não autenticada E que uma entrada de log em nível WARN é registrada.

---

### P1: DOC — Integridade do vínculo de `Document` (contrato XOR processo)

**User Story**: Como mantenedor do sistema, quero que a regra "um documento pertence a
exatamente um contrato ou a exatamente um processo, nunca os dois nem nenhum" seja
garantida pelo próprio banco de dados, não só pela camada de serviço, para que nenhum
caminho de escrita futuro consiga violar essa invariante silenciosamente.

**Why P1**: É a única invariante de integridade de dados do domínio sem nenhuma defesa em
profundidade hoje — um bug em qualquer código novo que chame `documentsRepository.save`
diretamente (fora de `DocumentService`) pode corromper o dado sem que nada acuse o erro.

**Acceptance Criteria**:

1. The system SHALL impedir, a nível de banco de dados, que uma linha de `documents` seja
   gravada com `contract_id` e `lawsuit_id` ambos nulos ou ambos preenchidos.
2. IF uma tentativa de escrita (por qualquer caminho, incluindo fora de `DocumentService`)
   violar a regra acima THEN o banco SHALL rejeitar a escrita, e o sistema SHALL propagar
   isso como `409 Conflict` via o handler de `DataIntegrityViolationException` (ver ERR-02).
3. WHEN `PATCH /documents/{id}` é chamado com `contractId` não nulo (e `lawsuitId`
   ausente/nulo) em um documento atualmente vinculado a um `lawsuit` THEN o sistema SHALL
   reatribuir o documento ao novo `contract` E SHALL desvincular o `lawsuit` anterior —
   este é o único comportamento possível dado DOC-01, e SHALL estar documentado na
   assinatura do endpoint (OpenAPI/Javadoc) para deixar de ser uma surpresa.

**Independent Test**: Tentar inserir (via teste de repositório, bypassando
`DocumentService`) um `Document` com `contract_id` e `lawsuit_id` ambos nulos e confirmar
que o banco rejeita; idem para ambos preenchidos; via API, criar um documento vinculado a
um `lawsuit`, fazer `PATCH` só com `contractId` e confirmar que o documento resultante tem
`lawsuit = null` e `contract` = valor enviado.

---

### P2: PERF — Fetch LAZY em todas as associações `@ManyToOne`

**User Story**: Como responsável por performance do sistema, quero que nenhuma associação
`@ManyToOne` carregue dados relacionados automaticamente quando eu só preciso da entidade
principal, para que listagens não gerem consultas extras desnecessárias.

**Why P2**: É um risco real de performance que cresce com o volume de dados, mas não é uma
falha de segurança/integridade — pode ser corrigido logo após os itens P1.

**Acceptance Criteria**:

1. The system SHALL declarar `fetch = FetchType.LAZY` nas 10 associações `@ManyToOne`
   listadas na tabela de Assumptions (`Contract.contractor`, `Contract.contracted`,
   `ContractExtension.contract`, `Document.contract`, `Document.lawsuit`, `Lawsuit.person`,
   `Lawsuit.lawyer`, `Lawsuit.counterPartPerson`, `Lawsuit.counterPartLawyer`,
   `RefreshToken.user`).
2. WHEN qualquer mapper (`ContractMapper`, `DocumentMapper`, `LawsuitMapper`,
   `ContractExtensionMapper`, `AuthMapper`) acessa uma associação para montar um DTO de
   resposta dentro do mesmo método de serviço `@Transactional` que carregou a entidade
   THEN o valor SHALL continuar correto e nenhuma `LazyInitializationException` SHALL
   ocorrer — todos os pontos de acesso hoje já ocorrem dentro de uma sessão Hibernate
   aberta (métodos de `*Service` anotados `@Transactional`), então essa troca não muda
   nenhum contrato de resposta de API existente.
3. WHEN uma listagem via `*Specifications.withFilters` é executada (ex.:
   `GET /documents?...`) THEN o sistema SHALL NOT emitir mais de uma consulta SQL por
   associação necessária à resposta (sem N+1 implícito por fetch EAGER).

**Independent Test**: Rodar as listagens existentes (`findByFilters` de Contract, Document,
Lawsuit) com `show-sql` habilitado e confirmar, antes/depois da mudança, que o número de
SELECTs emitidos por listagem não cresce com fetch EAGER residual; confirmar que os testes
de resposta de API (campos de `contractor`/`lawyer`/etc.) continuam batendo.

---

### P2: SCHED — Limpeza agendada de refresh tokens expirados

**User Story**: Como responsável por operar o banco de dados, quero que tokens de
atualização expirados sejam removidos periodicamente, para que a tabela `refresh_token`
não cresça indefinidamente com lixo que ninguém mais vai usar.

**Why P2**: É crescimento de dado sem limite, não uma falha de segurança (tokens
expirados já são rejeitados por `AuthService.refreshToken`) — mas cresce sozinho com o
tempo, então vale corrigir logo.

**Acceptance Criteria**:

1. The system SHALL executar, em um agendamento configurável via
   `app.refresh-token.cleanup-cron` (mesmo padrão de `app.contract.expiration-cron`), uma
   rotina que remove todas as linhas de `refresh_token` cujo `expiry_date` já passou.
2. WHEN a rotina de limpeza executa THEN o sistema SHALL remover somente as linhas
   expiradas E SHALL NOT remover nenhum `refresh_token` ainda válido.
3. IF não houver nenhum `refresh_token` expirado no momento da execução THEN o sistema
   SHALL concluir a rotina sem erro e sem remover nenhuma linha.

**Independent Test**: Inserir um `refresh_token` expirado e um válido; disparar a rotina
manualmente (chamando o método do scheduler diretamente em teste, sem esperar o cron);
confirmar que só o token expirado foi removido.

---

### P3: CLEAN — Remoção de código morto e duplicação

**User Story**: Como desenvolvedor mantendo este backend, quero que o código não tenha
classes nunca usadas, campos nunca lidos nem a mesma lógica de filtro repetida 29 vezes,
para reduzir a superfície que preciso entender e manter.

**Why P3**: Não corrige nenhum bug em produção — é redução de risco futuro e de esforço de
manutenção; adequado para ficar por último.

**Acceptance Criteria**:

1. The system SHALL NOT conter a classe `UserNotFoundException` nem seu
   `@ExceptionHandler` em `GlobalExceptionHandler` após a limpeza — nenhum outro
   comportamento SHALL mudar, já que a exceção nunca era lançada.
2. The system SHALL NOT conter os campos `@OneToMany private List<Document> documents`
   em `Contract` e `Lawsuit` após a limpeza — a consulta de documentos por contrato/processo
   SHALL continuar funcionando exclusivamente via `DocumentSpecifications`/
   `DocumentService`, como já ocorre hoje.
3. WHEN `ContractSpecifications`, `DocumentSpecifications` e `LawsuitSpecifications`
   forem refatoradas para usar um helper compartilhado (substituindo o idioma
   `campo == null ? builder.conjunction() : builder.equal(...)` repetido 29 vezes) THEN
   o predicado SQL gerado para cada combinação de filtros SHALL permanecer idêntico ao
   comportamento atual (mesmo resultado para os mesmos parâmetros, incluindo o caso de
   todos os filtros nulos).
4. The system SHALL expor exatamente um matcher de path para o endpoint de reset de senha
   em `SecurityConfig` (`/users/{id}/password`), removendo o matcher redundante
   (`/users/*/password`), sem nenhuma mudança nas URLs efetivamente protegidas.

**Independent Test**: Compilação/testes existentes continuam passando após a remoção
(nenhum ponto do código referenciava os itens removidos, confirmado por grep durante o
review); testes de `*SpecificationsTest` (novos, ver Tasks) comparando o SQL/resultado
antes e depois da refatoração do helper para os mesmos conjuntos de filtros.

---

## Edge Cases

- IF um `ADMIN` tenta usar `PATCH /users/{seu-próprio-id}` para remover seu único papel
  `ADMIN` restante (`role: "USER"`) THEN o sistema SHALL permitir a operação normalmente
  (fora de escopo desta spec impedir "auto-rebaixamento" — nenhuma regra de "deixar pelo
  menos um admin" existe hoje, e adicionar uma é uma decisão de produto não pedida).
- IF o corpo de `PATCH /users/{id}` de um não-ADMIN contiver `"role": null` explícito
  (mesmo valor do padrão "ausente") THEN o sistema SHALL tratar como ausente e permitir a
  operação (AUTHZ-02 só rejeita `role` **não nulo**).
- IF `PATCH /documents/{id}` for chamado sem `contractId` nem `lawsuitId` no corpo THEN o
  sistema SHALL manter o vínculo atual inalterado (comportamento já correto hoje, sem
  mudança).
- IF a rotina de limpeza de refresh tokens (SCHED-01) rodar enquanto um `AuthService.refreshToken()`
  concorrente está prestes a expirar o mesmo token THEN ambos os caminhos de remoção
  (`delete` da rotina, `delete` do fluxo de refresh) SHALL ser idempotentes — remover um
  registro já removido não é erro (`deleteByToken`/`delete` no Spring Data JPA não lançam
  exceção para zero linhas afetadas).

---

## Requirement Traceability

| Requirement ID | Story                    | Phase  | Status  |
| --------------- | ------------------------- | ------ | ------- |
| AUTHZ-01        | P1: AUTHZ                 | Design | Pending |
| AUTHZ-02        | P1: AUTHZ                 | Design | Pending |
| AUTHZ-03        | P1: AUTHZ                 | Design | Pending |
| AUTHZ-04        | P1: AUTHZ                 | Design | Pending |
| AUTHZ-05        | P1: AUTHZ                 | Design | Pending |
| AUTHZ-06        | P1: AUTHZ                 | Design | Pending |
| AUTHZ-07        | P1: AUTHZ                 | Design | Pending |
| AUTHZ-08        | P1: AUTHZ                 | Design | Pending |
| ERR-01          | P1: ERR                   | Design | Pending |
| ERR-02          | P1: ERR                   | Design | Pending |
| ERR-03          | P1: ERR                   | Design | Pending |
| DOC-01          | P1: DOC                   | Design | Pending |
| DOC-02          | P1: DOC                   | Design | Pending |
| DOC-03          | P1: DOC                   | Design | Pending |
| PERF-01         | P2: PERF                  | Design | Pending |
| PERF-02         | P2: PERF                  | Design | Pending |
| PERF-03         | P2: PERF                  | Design | Pending |
| SCHED-01        | P2: SCHED                 | Design | Pending |
| SCHED-02        | P2: SCHED                 | Design | Pending |
| SCHED-03        | P2: SCHED                 | Design | Pending |
| CLEAN-01        | P3: CLEAN                 | Design | Pending |
| CLEAN-02        | P3: CLEAN                 | Design | Pending |
| CLEAN-03        | P3: CLEAN                 | Design | Pending |
| CLEAN-04        | P3: CLEAN                 | Design | Pending |

**ID format:** `[CATEGORY]-[NUMBER]` (ex.: `AUTHZ-01`, `ERR-02`, `DOC-03`, `PERF-01`,
`SCHED-01`, `CLEAN-01`)

**Status values:** Pending → In Design → In Tasks → Implementing → Verified

**Coverage:** 24 total, 0 mapeados a tasks ainda (fase Tasks não executada), 24 sem
mapeamento ⚠️ (esperado neste ponto — Design/Tasks ainda não rodaram)

---

## Success Criteria

- [ ] Um usuário com papel `USER` não consegue, por nenhum endpoint, alterar seu próprio
      `role` nem o de outro usuário, nem criar/listar/remover usuários — confirmado por
      teste automatizado (AUTHZ-01 a AUTHZ-08).
- [ ] Nenhuma exceção não mapeada retorna no formato padrão do Spring — sempre
      `ErrorResponse` + log correspondente (ERR-01 a ERR-03).
- [ ] Nenhuma consulta de listagem (`Contract`, `Document`, `Lawsuit`) emite SELECT extra
      por associação `@ManyToOne` não solicitada pela resposta (PERF-01 a PERF-03).
- [ ] O banco rejeita fisicamente qualquer `Document` com dono ambíguo, mesmo se escrito
      fora de `DocumentService` (DOC-01, DOC-02).
- [ ] `refresh_token` não acumula linhas expiradas além de um ciclo de limpeza (SCHED-01 a
      SCHED-03).
- [ ] `grep -rn "UserNotFoundException|List<Document> documents"` não retorna nenhum
      resultado em `src/main/java` (CLEAN-01, CLEAN-02).
