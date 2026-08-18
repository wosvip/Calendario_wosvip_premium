# 📅 Calendário WosVIP Premium

<p align="center">
  <img src="assets/icons/icone-512.png" width="140" alt="Calendário WosVIP">
</p>

<p align="center">
  <strong>Calendário moderno, responsivo e instalável como aplicativo (PWA).</strong>
</p>

<p align="center">

![Versão](https://img.shields.io/badge/Versão-3.2.7-blue?style=for-the-badge)
![PWA](https://img.shields.io/badge/PWA-Ready-success?style=for-the-badge)
![Android](https://img.shields.io/badge/Android-Compatível-brightgreen?style=for-the-badge)
![Windows](https://img.shields.io/badge/Windows-Compatível-blue?style=for-the-badge)

</p>

---

# 📖 Sobre

O **Calendário WosVIP Premium** é um calendário moderno desenvolvido com **HTML5, CSS3 e JavaScript**, otimizado para uso em computadores, tablets e smartphones.

O projeto foi desenvolvido para funcionar diretamente no navegador e também como um **Progressive Web App (PWA)**, permitindo instalação no **Android** e **Windows**.

---

# ✨ Recursos

- 📅 Calendário mensal
- 📆 Numeração das semanas (ISO 8601)
- 🇧🇷 Feriados nacionais do Brasil
- 📍 Destaque automático do dia atual
- 📌 Seleção de datas
- 📱 Layout responsivo
- ⚡ Instalação como aplicativo (PWA)
- 🌐 Funcionamento Offline
- 💻 Compatível com Windows
- 📲 Compatível com Android
- 🌙 Interface moderna
- ⏰ Compromissos com alertas
- 📝 Agenda de Atividades / diário
- ❓ Tela Sobre integrada ao aplicativo

---

# 🚀 Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript ES6
- Progressive Web App (PWA)
- Service Worker
- Web Manifest
- GitHub Pages

---

# 📱 Compatibilidade

| Plataforma | Status |
|------------|:------:|
| Android | ✅ |
| Windows | ✅ |
| Linux | ✅ |
| Chrome | ✅ |
| Microsoft Edge | ✅ |
| GitHub Pages | ✅ |

---

# 📂 Estrutura do Projeto

```text
Calendario_Premium/

├── index.html
├── manifest.json
├── sw.js
│
├── css/
│   └── style.css
│
├── js/
│   ├── app.js
│   ├── calendar.js
│   └── holidays.js
│
└── assets/
    └── icons/
        ├── icone-192.png
        └── icone-512.png
```

---

# 🌍 Demonstração

O projeto está publicado em:

### https://wosvip.github.io/Calendario_Premium/

---

# 📲 Instalação

## Android

1. Abra o calendário.
2. Aguarde o carregamento.
3. Escolha **Instalar aplicativo**.
4. Confirme.

---

## Windows

Abra o projeto pelo **Microsoft Edge** ou **Google Chrome**.

Depois selecione:

```
Instalar aplicativo
```

O calendário será instalado como um aplicativo independente.

---

# 📅 Funcionalidades

- Alteração de mês
- Alteração de ano
- Navegação por gestos
- Destaque do dia atual
- Seleção de datas
- Lista de feriados
- Funcionamento offline
- Interface otimizada para smartphones

---

# 🆕 Versão Atual

## Base Premium

### Melhorias

- Interface completamente redesenhada
- Melhor desempenho
- Novo sistema de cache
- Compatibilidade aprimorada com PWA
- Instalação Android
- Instalação Windows
- Melhor organização do código
- Layout responsivo
- Animações suaves
- Melhor experiência do usuário

---

# 🔮 Próximas Atualizações

- 📌 Eventos personalizados
- 🔔 Lembretes
- 📄 Exportação para PDF
- 📊 Exportação para Excel
- 🏙️ Feriados estaduais
- 🏛️ Feriados municipais
- 🔎 Pesquisa por datas
- 🌙 Tema claro
- 🌑 Tema escuro
- ⚙️ Tema automático
- ☁️ Sincronização com Google Calendar

---

# 👨‍💻 Desenvolvedor

## WosVIP®

Projeto desenvolvido com foco em:

- desempenho;
- simplicidade;
- compatibilidade entre plataformas;
- experiência do usuário.

---

# ⭐ Apoie o Projeto

Se este projeto foi útil para você, considere deixar uma ⭐ no GitHub.

Isso ajuda a divulgar o projeto e incentiva novas melhorias.

---

# © Licença

Copyright © 2026 **WosVIP®**

Todos os direitos reservados.
## Versão 3.2 — Agenda de atividades / Diário

- Botão **Agenda** no cabeçalho alterna entre o calendário e o diário de atividades.
- Diário semanal em formato de folha, com navegação por semanas e transição visual discreta.
- Identificador da semana no topo (ex.: **Semana 34**), com período de domingo a sábado.
- Domingos em vermelho e feriados destacados.
- Registro de múltiplas atividades por dia, com horário inicial/final e observações.
- Os registros do diário não geram lembretes; a agenda de compromissos continua independente.
- Dados do diário salvos localmente no aparelho.
- Refinos de layout para telas pequenas.
