"use strict";

window.WosVipAgenda = (() => {
  const STORAGE_KEY = "wosvip_agenda_v1";
  const NOTIFIED_KEY = "wosvip_agenda_notificados_v1";

  function carregar(){
    try{
      const dados = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(dados) ? dados : [];
    }catch(error){
      console.warn("Agenda: não foi possível ler os compromissos.", error);
      return [];
    }
  }

  function salvar(lista){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  }

  function gerarId(){
    if(window.crypto && typeof window.crypto.randomUUID === "function"){
      return window.crypto.randomUUID();
    }
    return `evt-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function normalizar(evento){
    return {
      id: evento.id || gerarId(),
      titulo: String(evento.titulo || "").trim(),
      data: String(evento.data || ""),
      horaInicio: String(evento.horaInicio || "09:00"),
      horaFim: String(evento.horaFim || ""),
      local: String(evento.local || "").trim(),
      descricao: String(evento.descricao || "").trim(),
      lembreteMinutos: Math.max(0, Number(evento.lembreteMinutos || 0)),
      criadoEm: evento.criadoEm || new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    };
  }

  function listar(){
    return carregar().sort((a, b) => dataHora(a) - dataHora(b));
  }

  function listarPorData(chaveData){
    return listar().filter(item => item.data === chaveData);
  }

  function obter(id){
    return carregar().find(item => item.id === id) || null;
  }

  function gravar(evento){
    const item = normalizar(evento);
    const lista = carregar();
    const indice = lista.findIndex(atual => atual.id === item.id);

    if(indice >= 0){
      item.criadoEm = lista[indice].criadoEm || item.criadoEm;
      lista[indice] = item;
    }else{
      lista.push(item);
    }

    salvar(lista);
    return item;
  }

  function excluir(id){
    const lista = carregar().filter(item => item.id !== id);
    salvar(lista);
    limparNotificacao(id);
  }

  function dataHora(evento){
    const hora = evento.horaInicio || "00:00";
    const valor = new Date(`${evento.data}T${hora}:00`);
    return Number.isNaN(valor.getTime()) ? new Date(0) : valor;
  }

  function proximoEventos(limite = 6){
    const agora = new Date();
    const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
    return listar()
      .filter(item => dataHora(item) >= inicioHoje)
      .slice(0, limite);
  }

  function carregarNotificados(){
    try{
      const dados = JSON.parse(localStorage.getItem(NOTIFIED_KEY) || "{}");
      return dados && typeof dados === "object" ? dados : {};
    }catch(_){
      return {};
    }
  }

  function salvarNotificados(mapa){
    localStorage.setItem(NOTIFIED_KEY, JSON.stringify(mapa));
  }

  function limparNotificacao(id){
    const mapa = carregarNotificados();
    Object.keys(mapa).forEach(chave => {
      if(chave.startsWith(`${id}|`)) delete mapa[chave];
    });
    salvarNotificados(mapa);
  }

  async function solicitarPermissao(){
    if(!("Notification" in window)){
      return "unsupported";
    }
    if(Notification.permission === "granted"){
      return "granted";
    }
    return Notification.requestPermission();
  }

  async function mostrarNotificacao(evento){
    const titulo = `Agenda WosVIP: ${evento.titulo}`;
    const partes = [];
    if(evento.horaInicio) partes.push(`Horário: ${evento.horaInicio}`);
    if(evento.local) partes.push(`Local: ${evento.local}`);
    const body = partes.join(" • ") || "Você tem um compromisso agendado.";

    try{
      if("serviceWorker" in navigator){
        const registro = await navigator.serviceWorker.ready;
        await registro.showNotification(titulo, {
          body,
          icon:"./assets/icons/icone-192.png",
          badge:"./assets/icons/icone-192.png",
          tag:`wosvip-${evento.id}`,
          renotify:true,
          data:{ url:"./", data:evento.data }
        });
        return;
      }
      new Notification(titulo, { body, icon:"./assets/icons/icone-192.png" });
    }catch(error){
      console.warn("Agenda: falha ao mostrar notificação.", error);
    }
  }

  async function verificarAlertas(){
    if(!("Notification" in window) || Notification.permission !== "granted") return;

    const agora = Date.now();
    const tolerancia = 90 * 1000;
    const mapa = carregarNotificados();
    let alterou = false;

    for(const evento of listar()){
      const inicio = dataHora(evento).getTime();
      const alerta = inicio - (Number(evento.lembreteMinutos || 0) * 60000);
      const chave = `${evento.id}|${alerta}`;

      const limiteAtraso = Math.max(alerta + tolerancia, inicio + 60000);
      if(!mapa[chave] && agora >= alerta && agora <= limiteAtraso){
        await mostrarNotificacao(evento);
        mapa[chave] = new Date().toISOString();
        alterou = true;
      }
    }

    if(alterou) salvarNotificados(mapa);
  }

  return {
    listar,
    listarPorData,
    obter,
    gravar,
    excluir,
    dataHora,
    proximoEventos,
    solicitarPermissao,
    verificarAlertas
  };
})();
