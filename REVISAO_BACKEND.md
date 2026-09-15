# Revisão Rigorosa do Backend — `sisjuridico/carbocat`

> Revisão manual (linha a linha, cruzando controller → service → repository → entidade)
> combinada com uma passada automatizada (`code-review`, nível `high`) e uma lente de
> simplificação (`ponytail`). Escopo: `src/main/java/sisjuridico/carbocat` (93 arquivos),
> `pom.xml` e `application.yaml`. Sem execução de testes/app — leitura estática de código.

Cada item explica **o que é**, **por que é um problema** e **o que fazer**. A ordem dentro
de cada seção é por gravidade/impacto, não por ordem alfabética.

---

## 🔴 Crítico — corrigir antes de qualquer deploy real

### 1. Qualquer usuário autenticado pode se promover a ADMIN (escalonamento de privilégio)
**Onde:** `controller/UserController.java`, `config/SecurityConfig.java`

`SecurityConfig` só protege um endpoint com `hasRole("ADMIN")`:
```java
.requestMatchers(HttpMethod.PATCH, "/users/{id}/password", "/users/*/password").hasRole("ADMIN")
...
.anyRequest().authenticated()
```
Todo o resto de `UserController` — `POST /users`, `PUT /users/{id}`, `PATCH /users/{id}`,
`DELETE /users/{id}` — exige apenas estar autenticado, **não** exige ser ADMIN. E
`UserCreateDTO`/`UserUpdateDTO` aceitam `role` (`ADMIN` ou `USER`) diretamente no corpo da
requisição.

**Por que é grave:** um usuário comum logado (role `USER`) pode:
- `PUT /users/{seu-proprio-id}` com `"role": "ADMIN"` → se auto-promover a admin;
- `POST /users` com `"role": "ADMIN"` → criar uma conta admin nova;
- `DELETE /users/{id}` → apagar qualquer usuário, inclusive administradores;
- `GET /users` → enumerar todos os usuários e seus papéis.

Isso anula por completo o propósito de ter um enum `Role`/`hasRole("ADMIN")` no sistema:
a única barreira real hoje é a troca de senha.

**Correção:** restringir em `SecurityConfig` tudo que não seja leitura do próprio perfil a
`hasRole("ADMIN")` (ex.: `POST/PUT/PATCH/DELETE /users/**` → ADMIN), ou adicionar
`@PreAuthorize("hasRole('ADMIN')")` nos métodos do `UserService`/`UserController`. Se o
objetivo é permitir que o próprio usuário edite seu nome, isso precisa de um endpoint
separado que **não** aceite o campo `role`.

---

### 2. `ddl-auto: create` recria o schema do banco a cada subida da aplicação
**Onde:** `src/main/resources/application.yaml` (linhas 11-20)

```yaml
jpa:
  hibernate:
    ddl-auto: create
flyway:
  enabled: false
```

`ddl-auto: create` faz o Hibernate **derrubar e recriar todas as tabelas** toda vez que a
aplicação sobe — apagando 100% dos dados. O projeto já tem Flyway como dependência
(`spring-boot-starter-flyway`, `flyway-database-postgresql`, mais o starter de teste),
sinal de que a intenção era usar migrations versionadas, mas está com `enabled: false` e
sem nenhuma migration em `src/main/resources`.

**Por que é grave:** não existe hoje nenhum arquivo `application-prod.yaml` nem uso de
`@Profile`/`spring.profiles.active` no projeto — é o único arquivo de configuração. Se essa
mesma imagem/jar for apontada para um banco de staging ou produção sem que alguém
lembre de sobrescrever manualmente essa propriedade, o próximo restart do serviço apaga o
banco inteiro. Isso não é uma configuração "de exemplo que alguém vai trocar depois", é a
única configuração que existe.

**Correção:** ligar o Flyway (`flyway.enabled: true`), gerar a migration inicial a partir
do schema atual, trocar para `ddl-auto: validate` (ou `none`), e manter `create`/`update`
isolado em um profile `dev`/`test` explícito que não seja o padrão.

---

## 🟠 Alto — impacto real em produção, mas não catastrófico

### 3. Todo `@ManyToOne` do projeto está em fetch EAGER (N+1 sistêmico)
**Onde:** `entities/Contract.java`, `ContractExtension.java`, `Document.java`,
`Lawsuit.java` (4 relações), `RefreshToken.java` — 9 associações no total, **nenhuma**
declara `fetch = FetchType.LAZY`.

Em JPA, `@ManyToOne` sem `fetch` explícito é **EAGER por padrão**. Ou seja, toda vez que
um `Contract`, `Document`, `Lawsuit` ou `RefreshToken` é carregado — inclusive em listagens
via `Specification` (`findByFilters`) — o Hibernate dispara SELECTs adicionais para carregar
`Person`, `Lawyer`, `Contract`, `Lawsuit`, `User` associados, mesmo quando o DTO de
resposta usa só o `id`.

**Exemplo concreto (achado pela passada automatizada):** com a mudança recente que deu a
`Document` duas associações (`contract` **e** `lawsuit`), uma listagem de 100 documentos
via `GET /documents?fileName=x` agora pode gerar até 200 SELECTs extras (um por
`contract`, um por `lawsuit`, por linha), quando antes eram até 100.

**Correção:** `fetch = FetchType.LAZY` em todo `@ManyToOne`/`@OneToOne` (prática padrão
recomendada pelo próprio Hibernate), e usar `JOIN FETCH` ou `@EntityGraph` nos poucos
pontos onde a associação realmente precisa vir junto.

---

### 4. Sem handler genérico de exceção — erros inesperados vazam formato inconsistente
**Onde:** `exception/GlobalExceptionHandler.java`

O handler cobre `ResourceNotFoundException`, `UserNotFoundException`,
`MethodArgumentNotValidException`, `InvalidCredentialsException` e
`IllegalArgumentException`. Não há `@ExceptionHandler(Exception.class)` nem tratamento de:
- `DataIntegrityViolationException` (ex.: `userName` duplicado, viola `unique = true`) →
  hoje vira um 500 cru do Spring, não o `ErrorResponse` padronizado do resto da API;
- `HttpMessageNotReadableException` (JSON malformado no corpo da requisição);
- `AccessDeniedException` (usuário autenticado mas sem permissão).

**Por que importa:** o cliente da API (frontend) tem que lidar com dois formatos de erro
diferentes — o `ErrorResponse`/`ValidationErrorResponse` customizado e o formato padrão do
Spring (`{"timestamp":..,"status":500,"error":"Internal Server Error",...}`), e o segundo
pode incluir detalhes internos dependendo da configuração de `server.error.include-*`.

**Correção:** adicionar um `@ExceptionHandler(Exception.class)` de captura geral (loga e
devolve 500 no formato `ErrorResponse`) e tratar explicitamente
`DataIntegrityViolationException` → 409 Conflict.

---

### 5. `JwtAuthenticationFilter` engole qualquer exceção silenciosamente, sem log
**Onde:** `config/JwtAuthenticationFilter.java`, linhas 42-61

```java
try {
    ...
} catch (Exception exception) {
    SecurityContextHolder.clearContext();
}
```

Qualquer coisa que dê errado ao processar o token — token corrompido, chave JWT trocada,
`ClassCastException`, erro de conexão com o banco ao buscar o `User` — cai nesse
`catch (Exception ...)` genérico e é descartada sem nenhum log. Do ponto de vista de quem
opera o sistema, um bug de infraestrutura (ex.: banco fora do ar) e um token adulterado
por um atacante geram exatamente o mesmo sintoma silencioso: "usuário não autenticado".

**Correção:** logar a exceção (nível `debug`/`warn` conforme o tipo) antes de limpar o
contexto, e considerar não capturar `Exception` genérica — só as exceções esperadas do
`jjwt` (`JwtException`, `IllegalArgumentException`).

---

### 6. `UserNotFoundException` é código morto — nunca é lançada em lugar nenhum
**Onde:** `exception/UserNotFoundException.java`,
`exception/GlobalExceptionHandler.java` (linhas 24-32)

```bash
$ grep -rn "UserNotFoundException" src/main/java
exception/GlobalExceptionHandler.java:24  @ExceptionHandler(UserNotFoundException.class)
exception/GlobalExceptionHandler.java:25  public ResponseEntity<ErrorResponse> handleUserNotFoundException(...)
```
Nenhum `throw new UserNotFoundException(...)` existe no projeto. `UserService` usa
`ResourceNotFoundException.byId(User.class, id)` para todo "usuário não encontrado". O
handler dedicado é puro código morto, e sua presença sugere que a exceção existiu em algum
momento e ficou órfã depois de um refactor — ou que alguém esperava que ela fosse usada e
não foi.

**Correção:** apagar a classe e o handler (é exatamente o cenário que a lente `ponytail`
sinaliza: "existe já no código?" → sim, `ResourceNotFoundException` já cobre isso).

---

### 7. Cobertura de testes: essencialmente zero
**Onde:** `src/test/java/sisjuridico/carbocat/`

```
CarbocatApplicationTests.java     — só verifica que o context Spring sobe
TestCarbocatApplication.java      — bootstrap de teste
TestcontainersConfiguration.java  — config de infra de teste (Testcontainers/Postgres)
```
Nenhum teste de `service`, `controller`, `mapper`, `specification` ou da camada de
segurança. Para 93 arquivos de produção com regras de negócio não triviais (extensão de
contrato com 3 validações de data, XOR de dono do documento, expiração automática de
contrato via scheduler, geração/validação de JWT, refresh token), isso significa que
qualquer regressão só é descoberta manualmente ou em produção. O projeto já traz
Testcontainers como dependência de teste — a infraestrutura para testes de integração
existe, só não está sendo usada.

**Correção:** priorizar testes para os pontos com lógica de negócio e segurança:
`AuthService` (login/refresh/logout/change-password), `ContractService.extend()` (as três
validações de data), `JwtService`/`JwtAuthenticationFilter`, e um teste de integração para
o Finding #1 acima (confirmar que um usuário `USER` recebe 403 ao tentar `PUT /users/{id}`
com `role: ADMIN`).

---

### 8. `PATCH /documents/{id}` pode desvincular o outro dono silenciosamente
**Onde:** `service/DocumentService.java`, método `update()` (linha 54) e `applyOwner()`
(linha 82-86)

Um `Document` pertence a um `Contract` OU a um `Lawsuit` (nunca os dois — ver Finding #9).
Nos demais DTOs de `update` do projeto, campo nulo = "não altere este campo". Mas em
`update()`:
```java
if (dto.contractId() != null || dto.lawsuitId() != null) {
    applyOwner(document, dto.contractId(), dto.lawsuitId());
}
```
`applyOwner` sempre define **os dois** lados (`document.setContract(...)` e
`document.setLawsuit(...)`), usando `null` para o que não veio no DTO. Então um cliente que
só quer trocar o `contractId` de um documento hoje vinculado a um `lawsuit` — e que segue a
convenção "omita o que não quer mudar" usada no resto da API — acaba **removendo** o
vínculo com o `lawsuit` sem ter pedido isso.

**Correção:** em `update()` (PATCH), só chamar `setLawsuit`/`setContract` para o lado que
efetivamente veio no DTO, preservando o valor atual do outro lado quando ele não foi
enviado — comportamento diferente do `updateFull` (PUT), que corretamente substitui tudo.

---

### 9. Invariante "documento pertence a contrato XOR processo" só existe na camada de serviço
**Onde:** `service/DocumentService.java`, `validateOwner()` (linha 88-92)

A regra é validada apenas em Java, dentro de `DocumentService`. Não há `CHECK` constraint
no banco nem validação no nível da entidade `Document`. Qualquer código futuro que salve um
`Document` fora desse método (job de importação em lote, script administrativo, um segundo
service) pode persistir um documento com os dois vínculos nulos ou os dois preenchidos, sem
nenhuma barreira o impedindo.

**Correção:** adicionar uma `CHECK` constraint no banco (via migration Flyway, ver Finding
#2) garantindo `(contract_id IS NULL) <> (lawsuit_id IS NULL)` como defesa em profundidade,
além da validação de aplicação já existente.

---

## 🟡 Médio — simplificação e redução de risco (lente `ponytail`)

### 10. `LawsuitSpecifications.withFilters`: 20 parâmetros, o mesmo idioma repetido 21 vezes
**Onde:** `specification/LawsuitSpecifications.java`

```java
numProcesso == null ? builder.conjunction() : builder.equal(root.get("numProcesso"), numProcesso),
personId == null ? builder.conjunction() : builder.equal(root.get("person").get("id"), personId),
... (mais 19 linhas iguais)
```
O mesmo padrão "se nulo, `conjunction()`, senão `equal(...)`" aparece 21 vezes neste
arquivo, 4 vezes em `ContractSpecifications` e 4 vezes em `DocumentSpecifications` — 29
repetições do mesmo idioma em 3 arquivos, todas usando `root.get("string")`, sem
segurança de tipo (nenhum erro de compilação se o nome do campo mudar).

**Por que simplificar:** é o caso clássico de "shortest diff, not zero diff" — um helper
estático de uma linha elimina a repetição sem introduzir abstração especulativa:
```java
private static <Y> Predicate eq(CriteriaBuilder b, Path<Y> path, Y value) {
    return value == null ? b.conjunction() : b.equal(path, value);
}
// uso: eq(builder, root.get("numProcesso"), numProcesso)
```
Isso reduz `LawsuitSpecifications` de ~20 linhas de ternário para ~20 linhas de chamada de
uma linha só, sem mudar comportamento, e o mesmo helper serve para os outros 5 arquivos de
`specification/`.

---

### 11. `Lawsuit.documents` é um campo morto que espelha um problema já existente em `Contract`
**Onde:** `entities/Lawsuit.java` (linha 126), `entities/Contract.java` (linha 89)

```java
@OneToMany(mappedBy = "lawsuit")
private List<Document> documents;
```
Nenhum lugar do código lê `lawsuit.getDocuments()` — `LawsuitMapper` ignora esse campo
explicitamente em ambas as direções (achado pela passada automatizada). O mesmo já valia
para `Contract.documents`, que também não é lido em lugar nenhum hoje.

**Por que remover:** é superfície sem uso que já é uma armadilha em potencial — se algum
dia alguém adicionar `@ToString` ou `@EqualsAndHashCode` do Lombok em `Document` e
`Lawsuit`/`Contract` (o projeto já usa Lombok pesadamente nessas classes), essa relação
bidirecional não guardada cria recursão infinita (`StackOverflowError`) sem que nenhum
teste hoje capture isso, porque nada exercita esse caminho.

**Correção:** remover os dois campos `documents` das entidades `Contract`/`Lawsuit` — a
navegação inversa já é feita normalmente via `DocumentSpecifications`
(`documentsRepository.findAll(DocumentSpecifications.withFilters(..., contractId, ...))`),
que é a forma como o `DocumentService` já busca isso hoje.

---

### 12. `RefreshTokenRepository` não tem limpeza de tokens expirados
**Onde:** `repository/RefreshTokenRepository.java`, `service/AuthService.java`

Um `RefreshToken` só é removido em três situações: logout explícito
(`deleteByToken`), troca de senha (`deleteByUser`), ou quando alguém tenta usar um refresh
token **já expirado** (`refreshToken()` detecta e deleta na hora). Um token que expira e
nunca mais é usado (o caso comum: usuário troca de dispositivo, esquece a aba aberta, etc.)
fica na tabela para sempre.

**Por que simplificar/corrigir:** não é um bug de segurança (o token expirado continua
sendo rejeitado por `isTokenValid`/checagem de `expiryDate`), mas é crescimento de tabela
sem limite — o tipo de coisa que aparece como "por que essa tabela tem 4 milhões de linhas"
dois anos depois.

**Correção:** um `@Scheduled` simples (mesmo padrão de `ContractExpirationScheduler`) rodando
`DELETE FROM refresh_token WHERE expiry_date < now()` uma vez por dia é suficiente — não
precisa de nada mais sofisticado que isso.

---

### 13. `SecurityConfig`: dois padrões redundantes para o mesmo endpoint
**Onde:** `config/SecurityConfig.java`, linha 28

```java
.requestMatchers(HttpMethod.PATCH, "/users/{id}/password", "/users/*/password").hasRole("ADMIN")
```
`/users/{id}/password` e `/users/*/password` casam exatamente com as mesmas URLs — é o
mesmo matcher escrito de duas formas (variável de path nomeada vs. wildcard). Um dos dois
não faz nada.

**Correção:** manter só `/users/{id}/password` (mais legível) e remover o segundo.

---

## 🟢 Observações — não bloqueantes, mas vale registrar

- **Defaults de produção fracos:** `app.admin.password` cai para `admin123` e
  `security.jwt.secret` cai para uma string fixa (`uma-chave-local-muito-grande-apenas-para-desenvolvimento`)
  se as variáveis de ambiente `ADMIN_PASSWORD`/`JWT_SECRET` não forem definidas. Combinado
  com o Finding #2 (nenhum profile de produção separado), um deploy que esqueça de setar
  essas duas env vars sobe com admin/senha conhecidos e uma chave JWT pública neste
  repositório. Vale, no mínimo, falhar o boot (`fail-fast`) se essas variáveis não
  estiverem definidas fora do perfil `dev`.
- **`show-sql: true` / `format_sql: true`** ativos incondicionalmente — aceitável em dev,
  mas deveria estar atrás do mesmo profile que resolveria o Finding #2, para não poluir logs
  de produção com SQL completo (inclusive de senhas/dados pessoais nos parâmetros, se
  `show-sql` estiver combinado com log de bind parameters).

---

## Resumo

| # | Achado | Severidade |
|---|--------|-----------|
| 1 | Qualquer usuário pode virar ADMIN via `/users` | 🔴 Crítico |
| 2 | `ddl-auto: create` apaga o banco a cada boot | 🔴 Crítico |
| 3 | Todo `@ManyToOne` é EAGER (N+1 sistêmico) | 🟠 Alto |
| 4 | Sem handler genérico de exceção | 🟠 Alto |
| 5 | `JwtAuthenticationFilter` engole exceções sem log | 🟠 Alto |
| 6 | `UserNotFoundException` é código morto | 🟠 Alto |
| 7 | Cobertura de teste ≈ 0 | 🟠 Alto |
| 8 | PATCH de `Document` desvincula o outro dono | 🟠 Alto |
| 9 | Invariante XOR de `Document` só na aplicação | 🟠 Alto |
| 10 | Especificações duplicam idioma de filtro 29x | 🟡 Médio |
| 11 | `documents` morto em `Contract`/`Lawsuit` | 🟡 Médio |
| 12 | `RefreshToken` expirado nunca é limpo | 🟡 Médio |
| 13 | Matcher redundante em `SecurityConfig` | 🟡 Médio |

**Prioridade sugerida de correção:** 1 e 2 primeiro (impacto direto: invasão de conta e
perda de dados), depois 3/7/9 (risco estrutural que cresce com o sistema), o resto pode
entrar como limpeza incremental.
