# Relatório de Implementação — Frontend (Forrage App)

**Projeto:** Forrage App — acompanhamento de plantas forrageiras
**Disciplina:** Projeto Integrador IV — Unicap 2026.1
**Plataforma:** Expo / React Native (Android, iOS e Web)
**Período do relatório:** ciclo de desenvolvimento do frontend

> Observação: os diálogos entre os desenvolvedores ao longo deste documento são
> reconstruções (standups, revisões de PR e pair programming) usadas para
> registrar o **porquê** de cada decisão. Os nomes representam a equipe júnior
> de frontend.

**Equipe (frontend):**
- **Iwerson** — telas e navegação
- **Luana** — componentes e estilização (NativeWind)
- **Guilherme** — integração com a API e camada de dados
- **Marina** — apoio na ponte com o backend
- **Téo** — design/QA e validação visual contra os protótipos

---

## 1. Visão geral

O Forrage App permite que alunos registrem semanalmente o desenvolvimento de
plantas forrageiras (altura, cobertura do solo, checklist de manejo, fotos e
observações) organizadas por **canteiro**, e ao final gerem um **relatório**
acadêmico estruturado a partir desses registros.

A hierarquia de dados que guiou todo o frontend é:

```
Usuário → Canteiro (planta) → Lista de formulários → Formulário (registro semanal) → Relatório
```

### Estratégia geral: "mock-first"

Desde o começo a equipe adotou a estratégia de construir cada tela primeiro com
**dados mockados isolados no topo do arquivo**, e só depois trocar pela API.

> **Téo (kickoff):** "O backend ainda tá mudando o shape dos endpoints. Se a
> gente travar esperando a API, não entrega tela nenhuma."
>
> **Guilherme:** "Então combina assim: todo mock fica num bloco no topo do
> arquivo, com um comentário gritando `// DADOS MOCKADOS — substituir por...`.
> Quando o endpoint existir, é só apagar o bloco e plugar a função."
>
> **Iwerson:** "Fechado. E o formato do mock já imita o shape que a gente espera
> do banco, pra não dar retrabalho no map."

Esse padrão aparece em **todas** as telas (`MOCK_PERFIL`, `MOCK_CANTEIROS`,
`MOCK_FORMULARIOS`, etc.) e foi o que permitiu a migração incremental para SWR +
axios sem reescrever as telas.

---

## 2. Stack e arquitetura

| Camada | Tecnologia | Onde |
|---|---|---|
| UI / navegação | Expo Router (file-based) | `app/` |
| Estilização | NativeWind (Tailwind no RN) | `className` em todos os componentes |
| Ícones | `@expo/vector-icons`, emojis | componentes diversos |
| Data fetching | **SWR** (cache + revalidação) | telas integradas |
| HTTP | **axios** (instância única + interceptor) | `database/index.ts` |
| Sessão/token | **expo-sqlite** | `database/localDb.ts`, `database/tokenStore.ts` |
| Domínio/API | funções por entidade | `database/*.ts` |

> **Guilherme:** "Eu ia usar `fetch` puro, mas a gente ia reescrever
> try/catch e header de auth em todo lugar. Com uma instância axios + um
> interceptor, o token entra sozinho em toda request."
>
> **Marina:** "E o SWR resolve o loading/cache de graça. Cada tela vira um
> `useSWR('chave', fetcher)` e pronto — sem `useEffect` na mão."

### Organização de pastas

```
app/                      → rotas (telas)
components/<feature>/      → componentes agrupados por feature
database/                  → camada de dados (axios, SWR fetchers, SQLite)
docs/                      → este relatório
```

> **Luana:** "Componente novo vai sempre numa pasta da feature: `home/`,
> `registro/`, `canteiros/`, `perfil/`, `relatorios/`. Assim ninguém precisa
> caçar onde mora o card."

---

## 3. Mapa de requisitos implementados

| Req. | Descrição | Tela | Arquivos principais |
|---|---|---|---|
| Auth | Login e cadastro | Login / Cadastro | `app/login.tsx`, `app/cadastro.tsx`, `components/forms/formLogin.tsx`, `database/auth.ts` |
| RF04 / RF12 | Selecionar planta do catálogo e tipo de análise (nova lista) | Nova lista | `app/nova-lista.tsx`, `components/nova-lista/*` |
| 04 — Canteiros | Plantas acompanhadas e suas listas | Aba Canteiros | `app/(tabs)/explore.tsx`, `components/canteiros/CanteiroCard.tsx` |
| RF05 | Registros de uma planta em ordem cronológica | Lista de formulários | `app/canteiros/[id].tsx`, `components/canteiros/*` |
| Registro | Preencher registro semanal | Registro | `app/registro.tsx`, `components/registro/*` |
| Registro | Visualizar registro salvo + sincronizar | Registro salvo | `app/registro-salvo/[id].tsx`, `components/registro-salvo/*` |
| Relatório | Gerar relatório com IA a partir do canteiro | Novo relatório | `app/relatorios/novo.tsx`, `components/relatorios/*` |
| Relatório | Editar relatório (5 seções) | Relatório | `app/relatorios/[id]/*` |
| 11 — Config | Perfil, vínculos e preferências | Perfil | `app/(tabs)/perfil.tsx`, `components/perfil/*` |
| Home | Resumo do aluno e registros recentes | Início | `app/(tabs)/index.tsx`, `components/home/*` |

---

## 4. Implementação por requisito

### 4.1 Autenticação (Login / Cadastro)

A tela de login ([`app/login.tsx`](../app/login.tsx)) usa o componente
[`FormLogin`](../components/forms/formLogin.tsx), que chama
`login({ email, senha })` da camada [`database/auth.ts`](../database/auth.ts).
O login salva `accessToken`, `refreshToken` e `userId` no SQLite via
`tokenStore`, e o interceptor do axios passa a anexar o `Bearer` automaticamente
nas próximas requisições.

> **Iwerson:** "No protótipo o login só dava `router.push('/(tabs)')`. Agora ele
> de fato bate na API e só navega se vier sucesso."
>
> **Guilherme:** "E o token fica no expo-sqlite, então sobrevive a reload. O
> `getUserId()` que as outras telas usam vem dali."

### 4.2 Nova lista de formulários (RF04 / RF12)

Tela [`app/nova-lista.tsx`](../app/nova-lista.tsx): o aluno escolhe a planta
(scroll horizontal de cards), o tipo de análise (1º/2º semestre) e configura o
canteiro (nome, período, turma).

Componentes criados (reutilizáveis):
[`PlantOptionCard`](../components/nova-lista/PlantOptionCard.tsx),
[`AnalysisTypeCard`](../components/nova-lista/AnalysisTypeCard.tsx) e
[`LabeledField`](../components/nova-lista/LabeledField.tsx).

> **Luana:** "Reaproveitei o `HeaderStack` e o `Warning` que já existiam. Só
> precisei criar o card de planta selecionável e o de tipo de análise."
>
> **Téo:** "O `AnalysisTypeCard` ficou tão genérico que depois deu pra usar
> ele de novo no 'Tipo de relatório'. Isso é reuso de verdade."

### 4.3 Aba Canteiros (tela "04 — Canteiros")

[`app/(tabs)/explore.tsx`](../app/(tabs)/explore.tsx) substituiu o placeholder
"Explore" do template. Lista os canteiros do aluno com
[`CanteiroCard`](../components/canteiros/CanteiroCard.tsx) (ícone por categoria,
barra de progresso, último registro, status ATIVO/PAUSADO) e um botão
"＋ Adicionar nova planta" que leva à tela de nova lista.

Na integração, `getCanteirosByUser` é consumido via SWR e mapeado por
`mapCanteiroToCanteiro`, que traduz `plant.category` em emoji e calcula o
progresso a partir do nº de formulários.

> **Guilherme:** "O backend manda `category` tipo `GRAMINEA_PORTE_ALTO`. Fiz um
> `getCategoryIcon` pra virar 🌱/🌾/🍀 sem hardcodar no JSX."
>
> **Marina:** "Coloquei `Skeleton` no loading em vez de spinner. Fica menos
> 'piscando' enquanto o SWR resolve."

### 4.4 Lista de formulários do canteiro (RF05)

[`app/canteiros/[id].tsx`](../app/canteiros/[id].tsx): mostra os registros
semanais de um canteiro em ordem cronológica, com filtros
(Todos/Completos/Rascunhos/Pendentes) e o
[`FormularioCard`](../components/canteiros/FormularioCard.tsx) (semana, status,
data, fotos, checklist X/Y e % de progresso). Um FAB "＋" cria um novo registro
**já com o `list_id` correto** do canteiro.

O fetcher `fetchFormularios` busca a primeira lista do canteiro
(`getCanteiroListas`) e então seus formulários (`getListaFormularios`), mapeando
cada um com `mapFormulario` (deriva o progresso de `checklistDone/checklistTotal`).

> **Iwerson:** "Essa era a tela que faltava pra fechar o ciclo. Antes o
> `registro.tsx` tinha um `MOCK_LIST_ID` hardcoded e ninguém sabia de onde viria
> o `list_id`. Agora ele vem por params daqui."
>
> **Téo:** "Detalhe importante: o card de formulário abre o `registro-salvo`,
> que já existia. Não recriamos tela à toa."

### 4.5 Registro semanal e Registro salvo

[`app/registro.tsx`](../app/registro.tsx) monta o formulário (medições,
observações, fotos, checklist) usando
[`SectionCard`](../components/registro/SectionCard.tsx),
[`FieldBox`](../components/registro/FieldBox.tsx),
[`ChecklistItem`](../components/registro/ChecklistItem.tsx) e
[`PhotoUploadBox`](../components/registro/PhotoUploadBox.tsx). O salvamento cria
o formulário, o checklist e as medições, e finaliza — com fallback visual se a
API falhar.

[`app/registro-salvo/[id].tsx`](../app/registro-salvo/[id].tsx) exibe o registro
salvo com cartões de resumo, fotos, medições e checklist, além do botão
**Sincronizar**.

> **Luana:** "A tela de registro salvo virou quase um 'mini dashboard' do
> registro. Quebrei tudo em componentes pequenos (`SummaryMetricCard`,
> `MeasurementList`, `PhotoPreviewList`...) pra não virar um arquivo gigante."

### 4.6 Novo relatório (Gerar com IA)

[`app/relatorios/novo.tsx`](../app/relatorios/novo.tsx) implementa o fluxo
**Canteiro → Gerar** com um [`Stepper`](../components/relatorios/Stepper.tsx) de
2 passos (o passo "Formulários" do protótipo foi removido a pedido do produto).
O aluno escolhe o canteiro ([`CanteiroSelectCard`](../components/relatorios/CanteiroSelectCard.tsx)),
o tipo de relatório (reaproveitando o `AnalysisTypeCard`) e dispara
`generateRelatorio({ list_id })`, navegando para a tela de edição.

> **Téo:** "O caminho do topo no protótipo tinha 3 passos. O produto pediu só
> 'Canteiro' e 'Gerar', então o `Stepper` virou genérico: recebe os passos como
> array e o índice atual."
>
> **Guilherme:** "O 'Gerar com IA' chama o `relatoriosService`, pega o id do
> relatório criado e empurra pra `/relatorios/[id]`, que já tem as 5 seções."

### 4.7 Edição do relatório (5 seções)

[`app/relatorios/[id]/index.tsx`](../app/relatorios/[id]/index.tsx) lista as 5
seções (Introdução, Objetivo, Desenvolvimento, Considerações finais,
Referências), com telas dedicadas para Objetivo e Desenvolvimento e o componente
[`StepControl`](../components/forms/stepControll.tsx) para navegar entre etapas.

### 4.8 Perfil / Configurações (tela "11")

[`app/(tabs)/perfil.tsx`](../app/(tabs)/perfil.tsx) traz o cabeçalho com avatar
(iniciais geradas a partir do nome), e as seções **Perfil**, **Vínculos
acadêmicos** e **Preferências**, além de **Sair da conta**. Componentes:
[`ProfileHeader`](../components/perfil/ProfileHeader.tsx),
[`ProfileSection`](../components/perfil/ProfileSection.tsx) e
[`ProfileRow`](../components/perfil/ProfileRow.tsx). Já integrado via
`useSWR('perfil', getProfile)`.

> **Luana:** "O `ProfileRow` é uma linha genérica: ícone colorido + label +
> valor + chevron. As três seções inteiras são só repetição dele."

### 4.9 Home

[`app/(tabs)/index.tsx`](../app/(tabs)/index.tsx) mostra o resumo do aluno
(derivado dos próprios registros via SWR), as ações rápidas e os registros
recentes. As ações rápidas agora navegam de verdade (Canteiros, Relatório,
Registro).

---

## 5. Padrões adotados

1. **Mock-first com bloco isolado** — todo mock no topo, com comentário de
   substituição. Migração para API sem reescrever a tela.
2. **Componentização por feature** — pastas `components/<feature>/`, componentes
   pequenos e reutilizáveis (`AnalysisTypeCard` reaproveitado em duas telas,
   `StatusBadge`/`ProgressBar` em várias).
3. **Camada de dados única** — `database/*.ts` concentra axios + SWR fetchers +
   mapeadores (`mapCanteiro`, `mapFormulario`), isolando o "shape do backend" do
   resto do app.
4. **Tolerância ao shape da API** — os mapeadores aceitam variações
   (`f.list?.plant?.name ?? f.canteiro?.name ?? "Canteiro"`) para não quebrar
   enquanto o backend estabiliza.

> **Marina:** "Esse `??` encadeado salvou a gente. Toda vez que o backend muda
> um nome de campo, é só adicionar mais um fallback no mapeador, e nenhuma tela
> precisa mudar."

---

## 6. Problemas enfrentados e como resolvemos

### 6.1 Rota `/relatorios/novo` inexistente
O botão "Novo relatório" apontava para uma rota que não existia (escondido por
um `as any`). Foi criada a tela `app/relatorios/novo.tsx` e a rota registrada no
`_layout.tsx`, removendo o cast.

> **Iwerson:** "Clássico: o `as any` calava o TypeScript e a tela só dava tela
> branca. Criando a rota de verdade, o erro sumiu e o tipo voltou a ajudar."

### 6.2 Campo "Confirmar Senha" aparecendo em texto puro
O `Input1` decidia o `secureTextEntry` por `label === "Senha"`, então o campo
"Confirmar Senha" não era mascarado. Ficou registrado para virar uma prop
explícita.

### 6.3 Require cycle (`index ↔ auth`)
`database/index.ts` importava `getAccessToken` de `auth`, e `auth` importava
`api` de `index`. O Metro avisava *"Require cycles... can result in uninitialized
values"*. Resolvido extraindo o armazenamento de token para
[`database/tokenStore.ts`](../database/tokenStore.ts) (que só depende do
`localDb`), com o `auth` re-exportando os tokens para não quebrar os imports
existentes.

> **Guilherme:** "O ciclo era benigno na maioria das vezes, mas dava pra dar
> ruim em ordem de import. Tirei os getters de token pra um módulo folha e o
> ciclo morreu."

### 6.4 Login retornando 401
O interceptor anexava `Authorization: Bearer <token>` em **toda** requisição,
inclusive no próprio login. Como o token fica no SQLite (persiste entre
sessões), um token velho podia ir junto na requisição de login e o backend
rejeitava com 401. Solução: o interceptor passou a **pular as rotas públicas**
(`users/login` e cadastro) e o `login()` passou a **mostrar a mensagem real do
servidor** em vez de uma genérica.

> **Marina:** "A gente perdeu um tempão achando que era senha errada. Era o
> token zumbi de uma sessão anterior viajando junto no login."
>
> **Guilherme:** "Agora o Alert mostra o motivo que o backend devolve. Debug de
> auth ficou muito mais rápido."

---

## 7. Pendências e próximos passos

- **Captura real de foto** no `PhotoUploadBox` (hoje é visual).
- **Validação de formulário** no cadastro (senha × confirmação, e-mail).
- **Substituir mocks restantes** pelos endpoints conforme o backend estabiliza.
- **Acessibilidade**: adicionar `accessibilityLabel`/`accessibilityRole` (ícones
  são emojis).
- **`SafeAreaView`** no lugar de paddings fixos (`pt-14`) para notch.
- **Aceitar 200 e 201** no sucesso do login.
- **Padronizar nomes** dos componentes de formulário (`input1`, `input10`,
  `stepControll`).

> **Téo (retro):** "Entregamos todas as telas dos protótipos e o ciclo
> canteiro → registro → relatório fechou. O que falta é tirar os mocks e
> caprichar na acessibilidade."
>
> **Iwerson:** "E manter o padrão: mock no topo, componente por feature, dados
> na camada `database/`. Foi isso que deixou a integração ser incremental em vez
> de um big bang."

---

*Documento gerado pela equipe de frontend como registro técnico da
implementação dos requisitos.*
