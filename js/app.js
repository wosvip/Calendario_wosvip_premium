"use strict";

(() => {
  const Calendar = window.WosVipCalendar;
  const Holidays = window.WosVipHolidays;
  const Agenda = window.WosVipAgenda;

  const hoje = Calendar.zerarHora(new Date());
  let dataSelecionada = null;

  const selectMes = document.getElementById("mes");
  const selectAno = document.getElementById("ano");
  const calendario = document.getElementById("calendario");
  const listaFeriados = document.getElementById("listaFeriados");
  const infoSelecionada = document.getElementById("dataSelecionada");
  const selectedTitle = document.getElementById("selectedTitle");
  const selectedSubtitle = document.getElementById("selectedSubtitle");
  const dataAtualCabecalho = document.getElementById("dataAtualCabecalho");
  const resumoDias = document.getElementById("resumoDias");
  const resumoSemanas = document.getElementById("resumoSemanas");
  const resumoFeriados = document.getElementById("resumoFeriados");
  const resumoHoje = document.getElementById("resumoHoje");
  const calendarShell = document.querySelector(".calendar-shell");
  const app = document.querySelector(".app");

  const agendaDia = document.getElementById("agendaDia");
  const proximosCompromissos = document.getElementById("proximosCompromissos");
  const btnNovoCompromisso = document.getElementById("btnNovoCompromisso");
  const btnNotificacoes = document.getElementById("btnNotificacoes");
  const statusNotificacoes = document.getElementById("statusNotificacoes");
  const agendaModal = document.getElementById("agendaModal");
  const agendaForm = document.getElementById("agendaForm");
  const agendaModalTitulo = document.getElementById("agendaModalTitulo");
  const btnFecharAgenda = document.getElementById("btnFecharAgenda");
  const btnExcluirCompromisso = document.getElementById("btnExcluirCompromisso");
  const eventoId = document.getElementById("eventoId");
  const eventoTitulo = document.getElementById("eventoTitulo");
  const eventoData = document.getElementById("eventoData");
  const eventoHoraInicio = document.getElementById("eventoHoraInicio");
  const eventoHoraFim = document.getElementById("eventoHoraFim");
  const eventoLembrete = document.getElementById("eventoLembrete");
  const eventoLocal = document.getElementById("eventoLocal");
  const eventoDescricao = document.getElementById("eventoDescricao");

  function preencherSeletores(){
    Calendar.meses.forEach((mes, indice) => {
      const option = document.createElement("option");
      option.value = indice;
      option.textContent = mes;
      selectMes.appendChild(option);
    });

    const anoAtual = hoje.getFullYear();
    for(let ano = anoAtual - 50; ano <= anoAtual + 50; ano++){
      const option = document.createElement("option");
      option.value = ano;
      option.textContent = ano;
      selectAno.appendChild(option);
    }

    selectMes.value = hoje.getMonth();
    selectAno.value = hoje.getFullYear();
  }

  function atualizarCabecalho(){
    dataAtualCabecalho.textContent = new Intl.DateTimeFormat("pt-BR", {
      weekday:"long",
      day:"2-digit",
      month:"long",
      year:"numeric"
    }).format(hoje);
  }

  function eventosDaData(data){
    return Agenda.listarPorData(Calendar.chaveData(data));
  }

  function atualizarInfoSelecionada(data, feriado){
    const referencia = data || hoje;
    const ehHoje = Calendar.mesmaData(referencia, hoje);
    const eventos = eventosDaData(referencia);

    const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
      weekday:"long",
      day:"2-digit",
      month:"long",
      year:"numeric"
    }).format(referencia);

    infoSelecionada.querySelector(".selected-label").textContent =
      ehHoje ? "Hoje" : "Data selecionada";

    selectedTitle.textContent = dataFormatada;

    const informacoes = [];
    if(feriado) informacoes.push(`${feriado.nome} — ${feriado.tipo}`);
    if(eventos.length === 1) informacoes.push("1 compromisso cadastrado");
    if(eventos.length > 1) informacoes.push(`${eventos.length} compromissos cadastrados`);

    selectedSubtitle.textContent = informacoes.length
      ? informacoes.join(" • ")
      : "Nenhum evento cadastrado para esta data.";
  }

  function atualizarResumoMes(ano, mes, feriados){
    const totalDias = new Date(ano, mes + 1, 0).getDate();
    const grade = Calendar.criarGrade(ano, mes);
    const semanasComDiasDoMes = grade.filter(semana =>
      semana.dias.some(data => data.getMonth() === mes)
    ).length;
    const totalFeriados = feriados.filter(item =>
      item.data.getMonth() === mes &&
      item.tipo.toLowerCase().includes("feriado nacional")
    ).length;
    const hojeNoMes = hoje.getFullYear() === ano && hoje.getMonth() === mes
      ? String(hoje.getDate()).padStart(2, "0")
      : "—";

    resumoDias.textContent = totalDias;
    resumoSemanas.textContent = semanasComDiasDoMes;
    resumoFeriados.textContent = totalFeriados;
    resumoHoje.textContent = hojeNoMes;
  }

  function renderizarFeriados(feriados, mes){
    listaFeriados.innerHTML = "";

    const feriadosMes = feriados
      .filter(item => item.data.getMonth() === mes)
      .sort((a, b) => a.data - b.data);

    if(feriadosMes.length === 0){
      const li = document.createElement("li");
      li.textContent = "Não há datas nacionais cadastradas neste mês.";
      listaFeriados.appendChild(li);
      return;
    }

    feriadosMes.forEach(feriado => {
      const li = document.createElement("li");
      li.innerHTML =
        `<strong>${String(feriado.data.getDate()).padStart(2,"0")}/${String(mes + 1).padStart(2,"0")}</strong>`
        + ` — ${feriado.nome}<br><small>${feriado.tipo}</small>`;
      listaFeriados.appendChild(li);
    });
  }

  function selecionarDia(data, feriado){
    dataSelecionada = data;
    atualizarInfoSelecionada(dataSelecionada, feriado);
    gerarCalendario();
    renderizarAgenda();
  }

  function gerarCalendario(){
    calendario.innerHTML = "";

    const mes = Number(selectMes.value);
    const ano = Number(selectAno.value);
    const feriados = Holidays.listar(ano);
    const mapaFeriados = new Map(
      feriados.map(item => [Calendar.chaveData(item.data), item])
    );
    const datasComEventos = new Set(Agenda.listar().map(item => item.data));

    const inicioSemanaAtual = Calendar.inicioSemanaDomingo(hoje);
    const grade = Calendar.criarGrade(ano, mes);

    grade.forEach(semana => {
      const linha = document.createElement("tr");

      if(Calendar.mesmaData(semana.inicio, inicioSemanaAtual)){
        linha.classList.add("current-week");
      }

      const celulaSemana = document.createElement("td");
      celulaSemana.className = "week-number";
      celulaSemana.textContent = semana.numeroISO;
      linha.appendChild(celulaSemana);

      semana.dias.forEach(data => {
        const celula = document.createElement("td");
        const chave = Calendar.chaveData(data);
        const feriado = mapaFeriados.get(chave);

        celula.classList.add("day");
        celula.textContent = data.getDate();
        celula.dataset.date = chave;
        celula.setAttribute("role", "button");
        celula.setAttribute("tabindex", "0");
        celula.setAttribute(
          "aria-label",
          `${data.getDate()} de ${Calendar.meses[data.getMonth()]} de ${data.getFullYear()}`
          + (feriado ? `, ${feriado.nome}` : "")
          + (datasComEventos.has(chave) ? ", possui compromisso" : "")
        );

        if(data.getMonth() !== mes) celula.classList.add("other-month");
        if(data.getDay() === 0) celula.classList.add("sunday");
        if(data.getDay() === 6) celula.classList.add("saturday");
        if(datasComEventos.has(chave)) celula.classList.add("has-event");

        if(feriado){
          celula.classList.add("holiday");
          const ponto = document.createElement("span");
          ponto.className = "holiday-dot";
          ponto.setAttribute("aria-hidden", "true");
          celula.appendChild(ponto);
        }
        if(Calendar.mesmaData(data, hoje)) celula.classList.add("today");
        if(dataSelecionada && Calendar.mesmaData(data, dataSelecionada)) celula.classList.add("selected");

        const executarSelecao = () => selecionarDia(data, feriado);
        celula.addEventListener("click", executarSelecao);
        celula.addEventListener("keydown", event => {
          if(event.key === "Enter" || event.key === " "){
            event.preventDefault();
            executarSelecao();
          }
        });

        linha.appendChild(celula);
      });

      calendario.appendChild(linha);
    });

    renderizarFeriados(feriados, mes);
    atualizarResumoMes(ano, mes, feriados);

    calendarShell.classList.remove("calendar-animating");
    void calendarShell.offsetWidth;
    calendarShell.classList.add("calendar-animating");

    const referencia = dataSelecionada || hoje;
    const feriadoSelecionado = Holidays.listar(referencia.getFullYear())
      .find(item => Calendar.mesmaData(item.data, referencia));
    atualizarInfoSelecionada(dataSelecionada, feriadoSelecionado);
  }

  function formatarDataCurta(chave){
    const [ano, mes, dia] = chave.split("-").map(Number);
    return `${String(dia).padStart(2,"0")}/${String(mes).padStart(2,"0")}`;
  }

  function textoLembrete(minutos){
    const mapa = {
      0:"no horário",
      10:"10 min antes",
      30:"30 min antes",
      60:"1 h antes",
      120:"2 h antes",
      1440:"1 dia antes"
    };
    return mapa[Number(minutos)] || `${minutos} min antes`;
  }

  function criarCardEvento(evento){
    const card = document.createElement("article");
    card.className = "agenda-event";
    card.tabIndex = 0;
    card.innerHTML = `
      <div class="agenda-event-top">
        <strong></strong>
        <time></time>
      </div>
      <small class="agenda-event-meta"></small>
      <small class="agenda-event-description"></small>
    `;
    card.querySelector("strong").textContent = evento.titulo;
    card.querySelector("time").textContent = evento.horaFim
      ? `${evento.horaInicio}–${evento.horaFim}`
      : evento.horaInicio;

    const metas = [`🔔 ${textoLembrete(evento.lembreteMinutos)}`];
    if(evento.local) metas.unshift(`📍 ${evento.local}`);
    card.querySelector(".agenda-event-meta").textContent = metas.join(" • ");

    const descricao = card.querySelector(".agenda-event-description");
    if(evento.descricao){
      descricao.textContent = evento.descricao;
    }else{
      descricao.remove();
    }

    const editar = () => abrirModal(evento);
    card.addEventListener("click", editar);
    card.addEventListener("keydown", event => {
      if(event.key === "Enter" || event.key === " "){
        event.preventDefault();
        editar();
      }
    });
    return card;
  }

  function renderizarAgenda(){
    const referencia = dataSelecionada || hoje;
    const chave = Calendar.chaveData(referencia);
    const eventos = Agenda.listarPorData(chave);
    agendaDia.innerHTML = "";

    if(eventos.length === 0){
      const vazio = document.createElement("p");
      vazio.className = "agenda-empty";
      vazio.textContent = `Nenhum compromisso em ${formatarDataCurta(chave)}. Toque em “+ Novo” para agendar.`;
      agendaDia.appendChild(vazio);
    }else{
      eventos.forEach(evento => agendaDia.appendChild(criarCardEvento(evento)));
    }

    proximosCompromissos.innerHTML = "";
    const proximos = Agenda.proximoEventos(6);
    if(proximos.length === 0){
      const vazio = document.createElement("p");
      vazio.className = "agenda-empty";
      vazio.textContent = "Nenhum compromisso futuro cadastrado.";
      proximosCompromissos.appendChild(vazio);
    }else{
      proximos.forEach(evento => {
        const item = document.createElement("div");
        item.className = "agenda-next-item";
        item.innerHTML = `
          <div class="agenda-next-date"></div>
          <div class="agenda-next-text"><strong></strong><small></small></div>
        `;
        item.querySelector(".agenda-next-date").textContent = formatarDataCurta(evento.data);
        item.querySelector("strong").textContent = evento.titulo;
        item.querySelector("small").textContent = `${evento.horaInicio}${evento.local ? ` • ${evento.local}` : ""}`;
        item.addEventListener("click", () => {
          const [ano, mes, dia] = evento.data.split("-").map(Number);
          selectAno.value = ano;
          selectMes.value = mes - 1;
          dataSelecionada = new Date(ano, mes - 1, dia);
          gerarCalendario();
          renderizarAgenda();
          abrirModal(evento);
        });
        proximosCompromissos.appendChild(item);
      });
    }

    atualizarStatusNotificacoes();
  }

  function abrirModal(evento = null){
    const referencia = dataSelecionada || hoje;
    agendaForm.reset();

    if(evento){
      agendaModalTitulo.textContent = "Editar compromisso";
      eventoId.value = evento.id;
      eventoTitulo.value = evento.titulo;
      eventoData.value = evento.data;
      eventoHoraInicio.value = evento.horaInicio;
      eventoHoraFim.value = evento.horaFim || "";
      eventoLembrete.value = String(evento.lembreteMinutos ?? 0);
      eventoLocal.value = evento.local || "";
      eventoDescricao.value = evento.descricao || "";
      btnExcluirCompromisso.hidden = false;
    }else{
      agendaModalTitulo.textContent = "Novo compromisso";
      eventoId.value = "";
      eventoData.value = Calendar.chaveData(referencia);
      eventoHoraInicio.value = "09:00";
      eventoLembrete.value = "30";
      btnExcluirCompromisso.hidden = true;
    }

    agendaModal.hidden = false;
    document.body.classList.add("modal-open");
    setTimeout(() => eventoTitulo.focus(), 50);
  }

  function fecharModal(){
    agendaModal.hidden = true;
    document.body.classList.remove("modal-open");
  }

  function atualizarStatusNotificacoes(){
    if(!("Notification" in window)){
      btnNotificacoes.disabled = true;
      statusNotificacoes.textContent = "Este navegador não oferece notificações para este PWA.";
      return;
    }

    if(Notification.permission === "granted"){
      btnNotificacoes.textContent = "🔔 Alertas ativados";
      btnNotificacoes.classList.add("is-active");
      statusNotificacoes.textContent = "Permissão concedida. O PWA verifica os lembretes enquanto estiver em execução.";
    }else if(Notification.permission === "denied"){
      btnNotificacoes.textContent = "🔕 Alertas bloqueados";
      btnNotificacoes.classList.remove("is-active");
      statusNotificacoes.textContent = "As notificações foram bloqueadas nas configurações do navegador/aparelho.";
    }else{
      btnNotificacoes.textContent = "🔔 Ativar alertas no aparelho";
      btnNotificacoes.classList.remove("is-active");
      statusNotificacoes.textContent = "Ative a permissão para receber os lembretes dos compromissos.";
    }
  }

  function mudarMes(delta){
    const data = new Date(
      Number(selectAno.value),
      Number(selectMes.value) + delta,
      1
    );

    selectMes.value = data.getMonth();
    selectAno.value = data.getFullYear();
    dataSelecionada = null;
    gerarCalendario();
    renderizarAgenda();
  }

  selectMes.addEventListener("change", () => {
    dataSelecionada = null;
    gerarCalendario();
    renderizarAgenda();
  });

  selectAno.addEventListener("change", () => {
    dataSelecionada = null;
    gerarCalendario();
    renderizarAgenda();
  });

  document.getElementById("mesAnterior").addEventListener("click", () => mudarMes(-1));
  document.getElementById("mesSeguinte").addEventListener("click", () => mudarMes(1));


  btnNovoCompromisso.addEventListener("click", () => abrirModal());
  btnFecharAgenda.addEventListener("click", fecharModal);

  agendaModal.addEventListener("click", event => {
    if(event.target.closest("[data-fechar-modal='true']")) fecharModal();
  });

  document.addEventListener("keydown", event => {
    if(event.key === "Escape" && !agendaModal.hidden) fecharModal();
  });

  agendaForm.addEventListener("submit", event => {
    event.preventDefault();

    const item = Agenda.gravar({
      id:eventoId.value || undefined,
      titulo:eventoTitulo.value,
      data:eventoData.value,
      horaInicio:eventoHoraInicio.value,
      horaFim:eventoHoraFim.value,
      lembreteMinutos:Number(eventoLembrete.value),
      local:eventoLocal.value,
      descricao:eventoDescricao.value
    });

    const [ano, mes, dia] = item.data.split("-").map(Number);
    selectAno.value = ano;
    selectMes.value = mes - 1;
    dataSelecionada = new Date(ano, mes - 1, dia);
    fecharModal();
    gerarCalendario();
    renderizarAgenda();
    Agenda.verificarAlertas();
  });

  btnExcluirCompromisso.addEventListener("click", () => {
    const id = eventoId.value;
    if(!id) return;
    if(window.confirm("Excluir este compromisso?")){
      Agenda.excluir(id);
      fecharModal();
      gerarCalendario();
      renderizarAgenda();
    }
  });

  btnNotificacoes.addEventListener("click", async () => {
    await Agenda.solicitarPermissao();
    atualizarStatusNotificacoes();
    Agenda.verificarAlertas();
  });

  let toqueInicialX = null;
  let toqueInicialY = null;

  calendarShell.addEventListener("touchstart", event => {
    const toque = event.changedTouches[0];
    toqueInicialX = toque.clientX;
    toqueInicialY = toque.clientY;
  }, { passive:true });

  calendarShell.addEventListener("touchend", event => {
    if(toqueInicialX === null || toqueInicialY === null) return;

    const toque = event.changedTouches[0];
    const deltaX = toque.clientX - toqueInicialX;
    const deltaY = toque.clientY - toqueInicialY;

    if(Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3){
      mudarMes(deltaX < 0 ? 1 : -1);
    }

    toqueInicialX = null;
    toqueInicialY = null;
  }, { passive:true });

  preencherSeletores();
  atualizarCabecalho();
  gerarCalendario();
  renderizarAgenda();

  if("serviceWorker" in navigator){
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(error => {
        console.warn("Service Worker não registrado:", error);
      });
    });
  }

  Agenda.verificarAlertas();
  setInterval(() => Agenda.verificarAlertas(), 30000);
  document.addEventListener("visibilitychange", () => {
    if(!document.hidden) Agenda.verificarAlertas();
  });
})();
