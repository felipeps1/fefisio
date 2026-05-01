# FisioAgenda

Aplicativo mobile (Expo + React Native) para fisioterapeutas que fazem atendimento domiciliar e precisam organizar agendamentos de pacientes.

## Funcionalidades

- Cadastro de agendamentos (paciente, endereço, data/hora, observações)
- Edição e exclusão de agendamentos
- Visualização por **Todos**, **Hoje** e **Semana**
- Filtro extra por data (`YYYY-MM-DD`)
- Ordenação cronológica automática
- Abertura de rota no Google Maps
- Persistência local com AsyncStorage

## Rodar localmente (Expo Go)

```bash
npm install
npm run start
```

## Gerar APK para instalar no seu celular (Android)

Sim, dá para gerar APK. Siga este passo a passo:

1. Instale dependências:

```bash
npm install
```

2. Faça login no Expo (crie conta gratuita se não tiver):

```bash
npx eas login
```

3. Gere o APK (perfil `preview`):

```bash
npm run build:apk
```

4. Ao finalizar, o EAS retorna um link para baixar o `.apk`.
5. Abra o link no seu celular Android e instale.

> Se o Android bloquear, habilite "instalar apps desconhecidos" para o navegador usado no download.

## Publicar na Play Store (quando quiser)

Quando quiser publicar oficialmente, gere o formato AAB:

```bash
npm run build:aab
```

Esse arquivo é o que você envia no Google Play Console.

## Formato de data/hora

Use no campo data/hora: `YYYY-MM-DD HH:mm`

Exemplo: `2026-05-10 14:30`


## Opção 2 sem computador: build remoto no GitHub (você só baixa o APK)

Se você estiver apenas no celular, dá para disparar a build pelo GitHub e depois baixar o APK.

1. Suba este projeto para um repositório no GitHub.
2. No GitHub, configure o segredo `EXPO_TOKEN` (Settings > Secrets and variables > Actions).
3. Em **Actions**, execute o workflow **Build Android APK**.
4. Ao terminar, o link da build fica no **Summary** da execução (e também no log).
5. Abra o link no celular, baixe o APK e instale.

> Observação: esse fluxo usa o workflow `.github/workflows/build-apk.yml` já incluído neste projeto.
