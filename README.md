# Sinergia

Horóscopo diário em português, com previsões escritas por modelo de linguagem a partir de posições planetárias reais, revisadas por uma pessoa antes de publicar.

## Stack

Next.js 15 (App Router), Tailwind, Upstash Redis, Resend, Gemini API (`@google/genai`), Railway (Docker, agendador interno).

## Como a previsão é produzida

```
21h00 BRT  job generate              calcula o céu do dia seguinte (astronomy-engine)
                                     e gera um rascunho por signo com saída estruturada
           /admin                    você lê, edita, aprova (opcional)
06h05 BRT  job publish               promove rascunhos a publicados
                                     aprovado → "approved", sem aprovação → "auto",
                                     sem rascunho → texto de reserva, "fallback"
07h00 BRT  job daily                 envia o publicado por email, agrupado por signo
           GET /api/forecast?sign=   o site só lê o publicado; se ainda não houver,
                                     promove o rascunho ou a reserva na hora
```

O modelo nunca é chamado a partir de um clique do usuário. O custo fica limitado a 12 gerações por dia mais as regenerações manuais no admin.

### Chaves no Redis

| Chave | Conteúdo | TTL |
|---|---|---|
| `sinergia:sky:{period}` | posições, aspectos e fase da Lua do dia | 30 dias |
| `sinergia:draft:{period}:{sign}` | rascunho com status `draft` ou `approved` | 7 dias |
| `sinergia:published:{period}:{sign}` | previsão publicada, com `source` | 30 dias |
| `sinergia:emails` | sorted set de emails cadastrados | sem TTL |
| `sinergia:profile:{email}` | hash com signo, data e hora de nascimento | sem TTL |

`period` é a data em Brasília, virando às 06h00.

## Variáveis de ambiente

| Variável | Uso |
|---|---|
| `GEMINI_API_KEY` | geração das previsões |
| `GEMINI_MODEL` | opcional, padrão `gemini-3.6-flash` |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | armazenamento |
| `RESEND_API_KEY` | envio de emails |
| `CRON_SECRET` | protege as rotas `/api/cron/*` de disparo manual |
| `ENABLE_SCHEDULER` | `1` liga o agendador interno (só em produção, uma réplica) |
| `ADMIN_SECRET` | acesso a `/admin` e `/api/admin/*` |
| `NEXT_PUBLIC_SITE_URL` | opcional, padrão `https://sinergia-astros.app` |

## Agendamento

Os jobs rodam dentro do processo do servidor, via `instrumentation.ts` e a biblioteca `croner`, com fuso `America/Sao_Paulo`. Só ligam quando `ENABLE_SCHEDULER=1`. Mantenha uma réplica, senão os jobs rodam em duplicidade.

## Deploy no Railway

1. Crie um serviço a partir do repositório. O `railway.json` aponta para o `Dockerfile` e o healthcheck em `/api/health`.
2. Configure as variáveis de ambiente da tabela acima, incluindo `ENABLE_SCHEDULER=1`.
3. Gere um domínio público e coloque em `NEXT_PUBLIC_SITE_URL`, que é usado nos links dos emails.
4. Após o primeiro deploy, chame `/api/cron/generate` para criar os rascunhos e abra `/admin`.

## Rotas manuais

Os jobs aceitam disparo manual com `Authorization: Bearer $CRON_SECRET`:

```
GET /api/cron/generate?period=2026-09-23        gera rascunhos que faltam
GET /api/cron/generate?period=2026-09-23&force=1 regenera todos
GET /api/cron/publish?period=2026-09-23         publica o que ainda não foi
GET /api/cron/daily                             envia o email diário
GET /api/cron/weekly                            envia o lembrete semanal
```

O admin em `/admin` pede o `ADMIN_SECRET` e permite gerar, editar, aprovar, publicar e regenerar por signo.

## Desenvolvimento

```
npm install
npm run dev
```

Sem Redis configurado, o site serve os textos de reserva.
