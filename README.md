# Forrage App — Frontend

Aplicativo mobile (Expo / React Native) para **acompanhamento de plantas
forrageiras**: alunos registram semanalmente o desenvolvimento das plantas por
canteiro (medições, checklist de manejo, fotos e observações) e geram
relatórios acadêmicos a partir desses registros.

Projeto Integrador IV — Unicap 2026.1.

## Equipe

| Nome                              | RA     |
| --------------------------------- | ------ |
| Iwerson Guilherme da Silva Souza  | 855213 |
| Deivyson Ricardo Silva dos Santos | 855214 |
| Júlia Muniz Cavalheiro de Oliveira| 855158 |
| Ingrid Beatriz Silva              | 855232 |
| Luana Cabral da Silva             | 853756 |
| Ailton Cesar Anizio dos Santos    | 29548​  |
| João Vitor Nascimento Paraizo     |        |

## Stack

- **Expo / React Native** com **Expo Router** (rotas por arquivos)
- **NativeWind** (Tailwind no React Native) para estilização
- **SWR** + **axios** para consumo da API
- **expo-sqlite** para sessão/token local

## Como rodar

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Inicie o app:

   ```bash
   npx expo start
   ```

No output você pode abrir em emulador Android, simulador iOS, web ou no
[Expo Go](https://expo.dev/go).

## Estrutura

```
app/                  → telas (Expo Router)
components/<feature>/  → componentes agrupados por feature
database/              → camada de dados (axios, SWR, SQLite)
docs/                  → documentação do projeto
```

O fluxo principal é: **Canteiros → Nova lista → Registros semanais → Relatório**.

Mais detalhes da implementação em
[`docs/RELATORIO-FRONTEND.md`](docs/RELATORIO-FRONTEND.md).
