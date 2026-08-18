"use strict";

(() => {
  const btnAbrir = document.getElementById("btnSobreApp");
  const modal = document.getElementById("sobreAppModal");
  const btnFechar = document.getElementById("btnFecharSobre");

  if(!btnAbrir || !modal) return;

  function abrirSobre(){
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    requestAnimationFrame(() => btnFechar?.focus());
  }

  function fecharSobre(){
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    btnAbrir.focus();
  }

  btnAbrir.addEventListener("click", abrirSobre);
  btnFechar?.addEventListener("click", fecharSobre);

  modal.addEventListener("click", event => {
    if(event.target.closest("[data-about-close='true']")) fecharSobre();
  });

  document.addEventListener("keydown", event => {
    if(event.key === "Escape" && !modal.hidden){
      event.preventDefault();
      fecharSobre();
    }
  });
})();
