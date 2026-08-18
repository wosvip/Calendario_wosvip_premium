"use strict";

(() => {
  const tour = document.getElementById("introTour");
  if(!tour) return;

  const STORAGE_KEY = "wosvip_intro_v324_vista";
  const titulo = document.getElementById("introTitulo");
  const kicker = document.getElementById("introKicker");
  const texto = document.getElementById("introTexto");
  const icone = document.getElementById("introIcone");
  const mini = document.getElementById("introMini");
  const dots = document.getElementById("introDots");
  const anterior = document.getElementById("introAnterior");
  const proximo = document.getElementById("introProximo");
  const pular = document.getElementById("introPular");
  const replay = document.getElementById("btnVerIntroducao");

  const etapas = [
    {kicker:"Bem-vindo", titulo:"Calendário WosVIP", texto:"Veja rapidamente como navegar pelo calendário e usar os principais recursos.", icon:"📅", mini:true, botao:"Começar"},
    {kicker:"Navegação", titulo:"Troque mês e selecione dias", texto:"Use as setas ou deslize no calendário. Toque em qualquer dia para ver feriados e compromissos daquela data.", icon:"↔️", mini:true, botao:"Próximo"},
    {kicker:"Compromissos", titulo:"Agende e receba alertas", texto:"Em “+ Novo”, cadastre horário, local e lembrete. Ative as notificações no aparelho para receber os alertas.", icon:"🔔", mini:false, botao:"Próximo"},
    {kicker:"Agenda de atividades", titulo:"Registre o que foi realizado", texto:"Toque em “Agenda” no topo para abrir o diário semanal. Navegue pelas semanas e registre suas atividades por dia.", icon:"📓", mini:false, botao:"Próximo"},
    {kicker:"Pronto", titulo:"Tudo em um só calendário", texto:"Calendário, compromissos, alertas e diário de atividades ficam disponíveis no mesmo aplicativo.", icon:"✅", mini:false, botao:"Começar a usar"}
  ];

  let indice = 0;

  function criarDots(){
    dots.innerHTML = "";
    etapas.forEach((_, i) => {
      const d = document.createElement("button");
      d.type = "button";
      d.className = "intro-dot";
      d.setAttribute("aria-label", `Ir para etapa ${i + 1}`);
      d.addEventListener("click", () => { indice = i; render(); });
      dots.appendChild(d);
    });
  }

  function render(){
    const e = etapas[indice];
    tour.classList.remove("intro-changing");
    void tour.offsetWidth;
    tour.classList.add("intro-changing");
    kicker.textContent = e.kicker;
    titulo.textContent = e.titulo;
    texto.textContent = e.texto;
    icone.textContent = e.icon;
    mini.hidden = !e.mini;
    icone.hidden = e.mini && indice === 0;
    if(indice === 1) icone.hidden = true;
    anterior.hidden = indice === 0;
    proximo.textContent = e.botao;
    [...dots.children].forEach((d, i) => d.classList.toggle("active", i === indice));
  }

  function abrir(forcar=false){
    if(!forcar && localStorage.getItem(STORAGE_KEY) === "1") return;
    indice = 0;
    tour.hidden = false;
    tour.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    render();
  }

  function fechar(){
    localStorage.setItem(STORAGE_KEY, "1");
    tour.hidden = true;
    tour.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  proximo.addEventListener("click", () => {
    if(indice >= etapas.length - 1){ fechar(); return; }
    indice += 1; render();
  });
  anterior.addEventListener("click", () => { if(indice > 0){ indice -= 1; render(); } });
  pular.addEventListener("click", fechar);
  if(replay) replay.addEventListener("click", () => abrir(true));

  let x0 = null;
  tour.addEventListener("touchstart", e => { x0 = e.changedTouches[0].clientX; }, {passive:true});
  tour.addEventListener("touchend", e => {
    if(x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if(Math.abs(dx) > 60){
      if(dx < 0 && indice < etapas.length - 1) indice += 1;
      else if(dx > 0 && indice > 0) indice -= 1;
      render();
    }
    x0 = null;
  }, {passive:true});

  criarDots();
  window.addEventListener("load", () => setTimeout(() => abrir(false), 350));
})();
