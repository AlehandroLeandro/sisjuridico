# Graph Report - sisjuridico  (2026-09-14)

## Corpus Check
- Corpus is ~7,166 words - fits in a single context window. You may not need a graph.

## Summary
- 518 nodes · 1433 edges · 21 communities (16 shown, 5 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 103 edges (avg confidence: 0.8)
- Token cost: 38,776 input · 0 output

## Community Hubs (Navigation)
- Contract & Document DTOs
- JPA Entities (Contract)
- Contract REST Controller
- User REST Controller
- Lawyer Controller & DTOs
- Person Controller & DTOs
- PositionClient Enum
- Legal Action Types Enum
- Court Organization Enum
- Legal Nature Enum
- Court Types Enum
- Procedure Type (Rit) Enum
- Test Config & Password Setup
- Global Exception Handling
- Maven Wrapper Script
- Lawsuit Filtering & Specifications
- Application Entry Point
- Lawsuit Create Flow
- Application Configuration (YAML)
- Test Application Entry
- Root Package Marker

## God Nodes (most connected - your core abstractions)
1. `TypeContract` - 41 edges
2. `PositionClient` - 40 edges
3. `Action` - 39 edges
4. `InitialOrganization` - 35 edges
5. `Court` - 33 edges
6. `Nature` - 31 edges
7. `Rit` - 30 edges
8. `Lawsuit` - 28 edges
9. `Contract` - 26 edges
10. `Person` - 26 edges

## Surprising Connections (you probably didn't know these)
- `ContractController` --references--> `ContractService`  [EXTRACTED]
  src/main/java/sisjuridico/carbocat/controller/ContractController.java → src/main/java/sisjuridico/carbocat/service/ContractService.java
- `LawsuitCreateDTO` --references--> `Action`  [EXTRACTED]
  src/main/java/sisjuridico/carbocat/dto/request/create/LawsuitCreateDTO.java → src/main/java/sisjuridico/carbocat/enums/Action.java
- `LawsuitCreateDTO` --references--> `Court`  [EXTRACTED]
  src/main/java/sisjuridico/carbocat/dto/request/create/LawsuitCreateDTO.java → src/main/java/sisjuridico/carbocat/enums/Court.java
- `LawsuitCreateDTO` --references--> `InitialOrganization`  [EXTRACTED]
  src/main/java/sisjuridico/carbocat/dto/request/create/LawsuitCreateDTO.java → src/main/java/sisjuridico/carbocat/enums/InitialOrganization.java
- `LawsuitCreateDTO` --references--> `Nature`  [EXTRACTED]
  src/main/java/sisjuridico/carbocat/dto/request/create/LawsuitCreateDTO.java → src/main/java/sisjuridico/carbocat/enums/Nature.java

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Spring Boot Application Configuration Group** — src_main_resources_application_carbocat_app, src_main_resources_application_datasource_config, src_main_resources_application_jpa_config, src_main_resources_application_flyway_config [EXTRACTED 1.00]

## Communities (21 total, 5 thin omitted)

### Community 0 - "Contract & Document DTOs"
Cohesion: 0.06
Nodes (39): org.mapstruct.BeanMapping, org.mapstruct.Mapper, org.mapstruct.Mapping, ContractCreateDTO, DocumentCreateDTO, ContractUpdateDTO, DocumentUpdateDTO, ContractResponseDTO (+31 more)

### Community 1 - "JPA Entities (Contract)"
Cohesion: 0.10
Nodes (33): AssertTrue, Inheritance, jakarta.persistence.Entity, jakarta.persistence.Table, lombok.AllArgsConstructor, lombok.Getter, lombok.NoArgsConstructor, lombok.Setter (+25 more)

### Community 2 - "Contract REST Controller"
Cohesion: 0.11
Nodes (15): org.springframework.http.ResponseEntity, org.springframework.web.bind.annotation.DeleteMapping, org.springframework.web.bind.annotation.GetMapping, org.springframework.web.bind.annotation.PatchMapping, org.springframework.web.bind.annotation.PostMapping, org.springframework.web.bind.annotation.PutMapping, org.springframework.web.bind.annotation.RequestMapping, org.springframework.web.bind.annotation.RestController (+7 more)

### Community 3 - "User REST Controller"
Cohesion: 0.10
Nodes (19): org.springframework.security.crypto.password.PasswordEncoder, org.springframework.stereotype.Service, DeleteMapping, GetMapping, PatchMapping, PostMapping, PutMapping, RequestMapping (+11 more)

### Community 4 - "Lawyer Controller & DTOs"
Cohesion: 0.12
Nodes (10): LawyerController, LawyerCreateDTO, LawyerUpdateDTO, LawyerResponseDTO, ResourceNotFoundException, BeanMapping, Mapper, Mapping (+2 more)

### Community 5 - "Person Controller & DTOs"
Cohesion: 0.14
Nodes (11): org.springframework.transaction.annotation.Transactional, PersonController, PersonCreateDTO, PersonUpdateDTO, PersonResponseDTO, BeanMapping, Mapper, Mapping (+3 more)

### Community 6 - "PositionClient Enum"
Cohesion: 0.07
Nodes (27): PositionClient, AGRAVADO, AGRAVANTE, AMICUS_CURIAE, APELADO, APELANTE, ASSISTENTE, AUTOR (+19 more)

### Community 7 - "Legal Action Types Enum"
Cohesion: 0.07
Nodes (26): Action, ACAO_CIVIL_PUBLICA, ACAO_CONSIGNATORIA, ACAO_DE_ALIMENTOS, ACAO_DE_COBRANCA, ACAO_DE_EXECUCAO, ACAO_DE_EXIGIR_CONTAS, ACAO_DE_INDENIZACAO (+18 more)

### Community 8 - "Court Organization Enum"
Cohesion: 0.09
Nodes (22): InitialOrganization, AUDITORIA_MILITAR, COMARCA, FORO, JUIZADO_ESPECIAL, PRIMEIRO_GRAU, SECAO_JUDICIARIA, SEGUNDO_GRAU (+14 more)

### Community 9 - "Legal Nature Enum"
Cohesion: 0.10
Nodes (19): LawsuitUpdateDTO, Nature, ADMINISTRATIVA, AMBIENTAL, CONSUMIDOR, CONTRATUAL, CRIMINAL, DIREITO_CIVIL (+11 more)

### Community 10 - "Court Types Enum"
Cohesion: 0.10
Nodes (20): Court, CNJ, JUIZADO_ESPECIAL_CIVEL, JUIZADO_ESPECIAL_CRIMINAL, JUIZADO_ESPECIAL_DA_FAZENDA_PUBLICA, JUIZADO_ESPECIAL_FEDERAL, JUSTICA_DO_TRABALHO, JUSTICA_ELEITORAL (+12 more)

### Community 11 - "Procedure Type (Rit) Enum"
Cohesion: 0.11
Nodes (17): Rit, CUMPRIMENTO_DE_SENTENCA, EXECUCAO, JUIZADO_ESPECIAL, PROCEDIMENTO_COMUM, PROCEDIMENTO_DE_ACOES_DE_FAMILIA, PROCEDIMENTO_DE_ACOES_POSSESSORIAS, PROCEDIMENTO_DE_CONSIGNACAO_EM_PAGAMENTO (+9 more)

### Community 12 - "Test Config & Password Setup"
Cohesion: 0.17
Nodes (12): org.junit.jupiter.api.Test, org.springframework.boot.test.context.SpringBootTest, org.springframework.boot.test.context.TestConfiguration, org.springframework.boot.testcontainers.service.connection.ServiceConnection, org.springframework.context.annotation.Bean, org.springframework.context.annotation.Configuration, org.springframework.context.annotation.Import, org.testcontainers.postgresql.PostgreSQLContainer (+4 more)

### Community 13 - "Global Exception Handling"
Cohesion: 0.20
Nodes (7): org.springframework.web.bind.annotation.ExceptionHandler, org.springframework.web.bind.annotation.RestControllerAdvice, org.springframework.web.bind.MethodArgumentNotValidException, ValidationErrorResponse, ErrorResponse, GlobalExceptionHandler, UserNotFoundException

### Community 14 - "Maven Wrapper Script"
Cohesion: 0.38
Nodes (8): mvnw script, clean(), die(), exec_maven(), hash_string(), set_java_home(), trim(), verbose()

### Community 18 - "Application Configuration (YAML)"
Cohesion: 0.83
Nodes (4): carbocat (Spring Application), Datasource Configuration (PostgreSQL), Flyway Migration Configuration, JPA/Hibernate Configuration

## Knowledge Gaps
- **153 isolated node(s):** `sisjuridico:carbocat`, `ACAO_CIVIL_PUBLICA`, `ACAO_CONSIGNATORIA`, `ACAO_DE_ALIMENTOS`, `ACAO_DE_COBRANCA` (+148 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 201 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `TypeContract` connect `Contract & Document DTOs` to `JPA Entities (Contract)`, `Contract REST Controller`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **Why does `Lawsuit` connect `JPA Entities (Contract)` to `Contract & Document DTOs`, `Contract REST Controller`, `PositionClient Enum`, `Legal Action Types Enum`, `Court Organization Enum`, `Legal Nature Enum`, `Court Types Enum`, `Procedure Type (Rit) Enum`, `Lawsuit Filtering & Specifications`, `Lawsuit Create Flow`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._
- **Why does `PositionClient` connect `PositionClient Enum` to `JPA Entities (Contract)`, `Contract REST Controller`, `Legal Nature Enum`, `Procedure Type (Rit) Enum`, `Lawsuit Filtering & Specifications`, `Lawsuit Create Flow`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **What connects `sisjuridico:carbocat`, `ACAO_CIVIL_PUBLICA`, `ACAO_CONSIGNATORIA` to the rest of the system?**
  _153 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Contract & Document DTOs` be split into smaller, more focused modules?**
  _Cohesion score 0.056189640035118525 - nodes in this community are weakly interconnected._
- **Should `JPA Entities (Contract)` be split into smaller, more focused modules?**
  _Cohesion score 0.10317460317460317 - nodes in this community are weakly interconnected._
- **Should `Contract REST Controller` be split into smaller, more focused modules?**
  _Cohesion score 0.11312764670296431 - nodes in this community are weakly interconnected._