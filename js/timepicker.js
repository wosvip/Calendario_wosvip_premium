"use strict";

(() => {
  const modal = document.getElementById("timePickerModal");
  const title = document.getElementById("timePickerTitle");
  const display = document.getElementById("timePickerDisplay");
  const hour = document.getElementById("timePickerHour");
  const minute = document.getElementById("timePickerMinute");
  const clear = document.getElementById("timePickerClear");
  const confirm = document.getElementById("timePickerConfirm");
  const close = document.getElementById("timePickerClose");
  if(!modal || !title || !display || !hour || !minute || !clear || !confirm || !close) return;

  let target = null;
  let previousBodyModalState = false;

  const pad = value => String(value).padStart(2, "0");

  function fillSelects(){
    hour.replaceChildren();
    minute.replaceChildren();
    for(let h = 0; h < 24; h += 1){
      const option = document.createElement("option");
      option.value = pad(h);
      option.textContent = pad(h);
      hour.appendChild(option);
    }
    for(let m = 0; m < 60; m += 1){
      const option = document.createElement("option");
      option.value = pad(m);
      option.textContent = pad(m);
      minute.appendChild(option);
    }
  }

  function currentValue(){
    return `${hour.value}:${minute.value}`;
  }

  function updateDisplay(){
    display.textContent = currentValue();
  }

  function parseValue(value){
    const match = /^(\d{2}):(\d{2})$/.exec(String(value || ""));
    if(match) return { h:match[1], m:match[2] };
    const now = new Date();
    return { h:pad(now.getHours()), m:pad(now.getMinutes()) };
  }

  function labelFor(input){
    const label = input.closest("label");
    const text = label?.querySelector("span")?.textContent?.trim();
    return text ? `Selecionar ${text.toLowerCase()}` : "Selecionar horário";
  }

  function open(input){
    target = input;
    const parsed = parseValue(input.value);
    hour.value = parsed.h;
    minute.value = parsed.m;
    title.textContent = labelFor(input);
    clear.hidden = input.dataset.timePicker === "required";
    updateDisplay();
    previousBodyModalState = document.body.classList.contains("modal-open");
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    document.body.classList.add("time-picker-open");
    setTimeout(() => hour.focus(), 20);
  }

  function closePicker(){
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("time-picker-open");
    if(!previousBodyModalState) document.body.classList.remove("modal-open");
    const lastTarget = target;
    target = null;
    if(lastTarget) setTimeout(() => lastTarget.focus({preventScroll:true}), 20);
  }

  function apply(){
    if(!target) return;
    target.value = currentValue();
    target.dispatchEvent(new Event("input", {bubbles:true}));
    target.dispatchEvent(new Event("change", {bubbles:true}));
    closePicker();
  }

  function clearValue(){
    if(!target || target.dataset.timePicker === "required") return;
    target.value = "";
    target.dispatchEvent(new Event("input", {bubbles:true}));
    target.dispatchEvent(new Event("change", {bubbles:true}));
    closePicker();
  }

  fillSelects();
  updateDisplay();

  document.querySelectorAll("[data-time-picker]").forEach(input => {
    input.addEventListener("click", () => open(input));
    input.addEventListener("keydown", event => {
      if(event.key === "Enter" || event.key === " "){
        event.preventDefault();
        open(input);
      }
    });
  });

  hour.addEventListener("change", updateDisplay);
  minute.addEventListener("change", updateDisplay);
  confirm.addEventListener("click", apply);
  clear.addEventListener("click", clearValue);
  close.addEventListener("click", closePicker);
  modal.addEventListener("click", event => {
    if(event.target.closest("[data-time-picker-cancel='true']")) closePicker();
  });
  document.addEventListener("keydown", event => {
    if(event.key === "Escape" && !modal.hidden) closePicker();
  });
})();
