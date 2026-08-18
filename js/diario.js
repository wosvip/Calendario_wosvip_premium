"use strict";

window.WosVipDiario = (() => {
  const STORAGE_KEY = "wosvip_diario_atividades_v1";

  function carregar(){
    try{
      const dados = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(dados) ? dados : [];
    }catch(error){
      console.warn("Diário: não foi possível ler os registros.", error);
      return [];
    }
  }

  function salvar(lista){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  }

  function gerarId(){
    if(window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
    return `dia-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function normalizar(item){
    return {
      id:item.id || gerarId(),
      data:String(item.data || ""),
      atividade:String(item.atividade || "").trim(),
      horaInicio:String(item.horaInicio || ""),
      horaFim:String(item.horaFim || ""),
      observacao:String(item.observacao || "").trim(),
      criadoEm:item.criadoEm || new Date().toISOString(),
      atualizadoEm:new Date().toISOString()
    };
  }

  function listar(){
    return carregar().sort((a,b) => {
      const da = `${a.data}T${a.horaInicio || "00:00"}`;
      const db = `${b.data}T${b.horaInicio || "00:00"}`;
      return da.localeCompare(db);
    });
  }

  function listarPorData(data){
    return listar().filter(item => item.data === data);
  }

  function obter(id){
    return carregar().find(item => item.id === id) || null;
  }

  function gravar(item){
    const novo = normalizar(item);
    const lista = carregar();
    const indice = lista.findIndex(atual => atual.id === novo.id);
    if(indice >= 0){
      novo.criadoEm = lista[indice].criadoEm || novo.criadoEm;
      lista[indice] = novo;
    }else{
      lista.push(novo);
    }
    salvar(lista);
    return novo;
  }

  function excluir(id){
    salvar(carregar().filter(item => item.id !== id));
  }

  return { listar, listarPorData, obter, gravar, excluir };
})();

(() => {
  const Calendar = window.WosVipCalendar;
  const Holidays = window.WosVipHolidays;
  const Diario = window.WosVipDiario;
  if(!Calendar || !Holidays || !Diario) return;

  const btnTopo = document.getElementById("btnAgendaTopo");
  const view = document.getElementById("diarioView");
  const papel = document.getElementById("diarioPapel");
  const dias = document.getElementById("diarioDias");
  const periodo = document.getElementById("diarioPeriodo");
  const btnAnterior = document.getElementById("diarioAnterior");
  const btnSeguinte = document.getElementById("diarioSeguinte");
  const btnHoje = document.getElementById("diarioHoje");
  const modal = document.getElementById("diarioModal");
  const form = document.getElementById("diarioForm");
  const tituloModal = document.getElementById("diarioModalTitulo");
  const fechar = document.getElementById("btnFecharDiario");
  const excluir = document.getElementById("btnExcluirAtividade");
  const campoId = document.getElementById("atividadeId");
  const campoData = document.getElementById("atividadeData");
  const campoTitulo = document.getElementById("atividadeTitulo");
  const campoInicio = document.getElementById("atividadeInicio");
  const campoFim = document.getElementById("atividadeFim");
  const campoObs = document.getElementById("atividadeObservacao");

  const hoje = Calendar.zerarHora(new Date());
  let inicioSemana = Calendar.inicioSemanaDomingo(hoje);
  let aberto = false;

  function somaDias(data, quantidade){
    const nova = new Date(data);
    nova.setDate(nova.getDate() + quantidade);
    return Calendar.zerarHora(nova);
  }

  function formatarPeriodo(inicio, fim){
    const mesmoMes = inicio.getMonth() === fim.getMonth() && inicio.getFullYear() === fim.getFullYear();
    if(mesmoMes){
      return `${String(inicio.getDate()).padStart(2,"0")}–${String(fim.getDate()).padStart(2,"0")} de ${Calendar.meses[inicio.getMonth()]} de ${inicio.getFullYear()}`;
    }
    const fmt = data => `${String(data.getDate()).padStart(2,"0")} ${Calendar.meses[data.getMonth()].slice(0,3)}`;
    return `${fmt(inicio)} – ${fmt(fim)} ${fim.getFullYear()}`;
  }

  function acharFeriado(data){
    return Holidays.listar(data.getFullYear()).find(item => Calendar.mesmaData(item.data, data)) || null;
  }

  function formatarDiaSemana(data){
    return new Intl.DateTimeFormat("pt-BR", { weekday:"long" }).format(data);
  }

  function renderizar(animacao = ""){ 
    const fim = somaDias(inicioSemana, 6);
    periodo.textContent = formatarPeriodo(inicioSemana, fim);
    dias.innerHTML = "";

    for(let i=0; i<7; i++){
      const data = somaDias(inicioSemana, i);
      const chave = Calendar.chaveData(data);
      const feriado = acharFeriado(data);
      const registros = Diario.listarPorData(chave);
      const linha = document.createElement("section");
      linha.className = "diario-dia";
      if(data.getDay() === 0) linha.classList.add("is-sunday");
      if(feriado) linha.classList.add("is-holiday");
      if(Calendar.mesmaData(data, hoje)) linha.classList.add("is-today");

      linha.innerHTML = `
        <div class="diario-date">
          <strong>${String(data.getDate()).padStart(2,"0")}</strong>
          <span>${formatarDiaSemana(data)}</span>
          ${feriado ? `<small></small>` : ""}
        </div>
        <div class="diario-records"></div>
        <button class="diario-add" type="button" aria-label="Adicionar atividade em ${chave}">+</button>
      `;
      if(feriado) linha.querySelector(".diario-date small").textContent = feriado.nome;

      const container = linha.querySelector(".diario-records");
      if(registros.length === 0){
        const vazio = document.createElement("button");
        vazio.type = "button";
        vazio.className = "diario-empty-line";
        vazio.textContent = "Toque para registrar uma atividade";
        vazio.addEventListener("click", () => abrirModal(null, chave));
        container.appendChild(vazio);
      }else{
        registros.forEach(registro => {
          const item = document.createElement("button");
          item.type = "button";
          item.className = "diario-record";
          const horario = registro.horaInicio
            ? `${registro.horaInicio}${registro.horaFim ? `–${registro.horaFim}` : ""}`
            : "";
          item.innerHTML = `<span class="diario-record-time"></span><span class="diario-record-text"><strong></strong><small></small></span>`;
          item.querySelector(".diario-record-time").textContent = horario;
          item.querySelector("strong").textContent = registro.atividade;
          const obs = item.querySelector("small");
          if(registro.observacao) obs.textContent = registro.observacao;
          else obs.remove();
          item.addEventListener("click", () => abrirModal(registro, chave));
          container.appendChild(item);
        });
      }

      linha.querySelector(".diario-add").addEventListener("click", () => abrirModal(null, chave));
      dias.appendChild(linha);
    }

    if(animacao){
      papel.classList.remove("flip-next", "flip-prev");
      void papel.offsetWidth;
      papel.classList.add(animacao);
    }
  }

  function mudarSemana(delta){
    inicioSemana = somaDias(inicioSemana, delta * 7);
    renderizar(delta > 0 ? "flip-next" : "flip-prev");
  }

  function abrirView(){
    aberto = true;
    document.body.classList.add("diario-mode");
    view.hidden = false;
    btnTopo.textContent = "Calendário";
    btnTopo.setAttribute("aria-pressed", "true");
    renderizar();
    window.scrollTo({ top:0, behavior:"smooth" });
  }

  function fecharView(){
    aberto = false;
    document.body.classList.remove("diario-mode");
    view.hidden = true;
    btnTopo.textContent = "Agenda";
    btnTopo.setAttribute("aria-pressed", "false");
    window.scrollTo({ top:0, behavior:"smooth" });
  }

  function abrirModal(registro = null, data = null){
    form.reset();
    campoId.value = "";
    campoData.value = data || Calendar.chaveData(hoje);
    excluir.hidden = true;
    tituloModal.textContent = "Nova atividade";

    if(registro){
      tituloModal.textContent = "Editar atividade";
      campoId.value = registro.id;
      campoData.value = registro.data;
      campoTitulo.value = registro.atividade;
      campoInicio.value = registro.horaInicio || "";
      campoFim.value = registro.horaFim || "";
      campoObs.value = registro.observacao || "";
      excluir.hidden = false;
    }

    modal.hidden = false;
    document.body.classList.add("modal-open");
    setTimeout(() => campoTitulo.focus(), 50);
  }

  function fecharModal(){
    modal.hidden = true;
    document.body.classList.remove("modal-open");
  }

  btnTopo.addEventListener("click", () => aberto ? fecharView() : abrirView());
  btnAnterior.addEventListener("click", () => mudarSemana(-1));
  btnSeguinte.addEventListener("click", () => mudarSemana(1));
  btnHoje.addEventListener("click", () => {
    inicioSemana = Calendar.inicioSemanaDomingo(hoje);
    renderizar("flip-next");
  });

  fechar.addEventListener("click", fecharModal);
  modal.addEventListener("click", event => {
    if(event.target.closest("[data-fechar-diario='true']")) fecharModal();
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    Diario.gravar({
      id:campoId.value || undefined,
      data:campoData.value,
      atividade:campoTitulo.value,
      horaInicio:campoInicio.value,
      horaFim:campoFim.value,
      observacao:campoObs.value
    });
    const [ano, mes, dia] = campoData.value.split("-").map(Number);
    inicioSemana = Calendar.inicioSemanaDomingo(new Date(ano, mes - 1, dia));
    fecharModal();
    renderizar();
  });

  excluir.addEventListener("click", () => {
    if(!campoId.value) return;
    if(window.confirm("Excluir este registro do diário?")){
      Diario.excluir(campoId.value);
      fecharModal();
      renderizar();
    }
  });

  let toqueX = null;
  let toqueY = null;
  papel.addEventListener("touchstart", event => {
    const toque = event.changedTouches[0];
    toqueX = toque.clientX;
    toqueY = toque.clientY;
  }, { passive:true });
  papel.addEventListener("touchend", event => {
    if(toqueX === null || toqueY === null) return;
    const toque = event.changedTouches[0];
    const dx = toque.clientX - toqueX;
    const dy = toque.clientY - toqueY;
    if(Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.25){
      mudarSemana(dx < 0 ? 1 : -1);
    }
    toqueX = toqueY = null;
  }, { passive:true });
})();
