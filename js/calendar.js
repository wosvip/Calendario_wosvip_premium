"use strict";

window.WosVipCalendar = (() => {
  const meses = [
    "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
  ];

  function zerarHora(data){
    return new Date(data.getFullYear(), data.getMonth(), data.getDate());
  }

  function mesmaData(a, b){
    return Boolean(a && b)
      && a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate();
  }

  function chaveData(data){
    return [
      data.getFullYear(),
      String(data.getMonth() + 1).padStart(2, "0"),
      String(data.getDate()).padStart(2, "0")
    ].join("-");
  }

  function adicionarDias(data, dias){
    const nova = new Date(data);
    nova.setDate(nova.getDate() + dias);
    return zerarHora(nova);
  }

  function numeroSemanaISO(data){
    const d = new Date(Date.UTC(data.getFullYear(), data.getMonth(), data.getDate()));
    const dia = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dia);
    const inicioAno = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - inicioAno) / 86400000) + 1) / 7);
  }

  function inicioSemanaDomingo(data){
    return adicionarDias(data, -data.getDay());
  }

  function criarGrade(ano, mes){
    const primeiroDoMes = new Date(ano, mes, 1);
    const inicioGrade = inicioSemanaDomingo(primeiroDoMes);
    const semanas = [];

    for(let semana = 0; semana < 6; semana++){
      const inicioLinha = adicionarDias(inicioGrade, semana * 7);
      const dias = [];

      for(let coluna = 0; coluna < 7; coluna++){
        dias.push(adicionarDias(inicioLinha, coluna));
      }

      semanas.push({
        inicio: inicioLinha,
        numeroISO: numeroSemanaISO(adicionarDias(inicioLinha, 1)),
        dias
      });
    }

    return semanas;
  }

  return {
    meses,
    zerarHora,
    mesmaData,
    chaveData,
    adicionarDias,
    inicioSemanaDomingo,
    criarGrade
  };
})();
