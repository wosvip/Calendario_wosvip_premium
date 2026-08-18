"use strict";

window.WosVipHolidays = (() => {
  function zerarHora(data){
    return new Date(data.getFullYear(), data.getMonth(), data.getDate());
  }

  function adicionarDias(data, dias){
    const nova = new Date(data);
    nova.setDate(nova.getDate() + dias);
    return zerarHora(nova);
  }

  function calcularPascoa(ano){
    const a = ano % 19;
    const b = Math.floor(ano / 100);
    const c = ano % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const mes = Math.floor((h + l - 7 * m + 114) / 31);
    const dia = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(ano, mes - 1, dia);
  }

  function listar(ano){
    const pascoa = calcularPascoa(ano);

    return [
      { data:new Date(ano, 0, 1), nome:"Confraternização Universal", tipo:"Feriado nacional" },
      { data:adicionarDias(pascoa, -48), nome:"Carnaval (segunda-feira)", tipo:"Ponto facultativo" },
      { data:adicionarDias(pascoa, -47), nome:"Carnaval (terça-feira)", tipo:"Ponto facultativo" },
      { data:adicionarDias(pascoa, -2), nome:"Paixão de Cristo", tipo:"Data observada" },
      { data:pascoa, nome:"Páscoa", tipo:"Data comemorativa" },
      { data:new Date(ano, 3, 21), nome:"Tiradentes", tipo:"Feriado nacional" },
      { data:new Date(ano, 4, 1), nome:"Dia Mundial do Trabalho", tipo:"Feriado nacional" },
      { data:adicionarDias(pascoa, 60), nome:"Corpus Christi", tipo:"Ponto facultativo/local" },
      { data:new Date(ano, 8, 7), nome:"Independência do Brasil", tipo:"Feriado nacional" },
      { data:new Date(ano, 9, 12), nome:"Nossa Senhora Aparecida", tipo:"Feriado nacional" },
      { data:new Date(ano, 10, 2), nome:"Finados", tipo:"Feriado nacional" },
      { data:new Date(ano, 10, 15), nome:"Proclamação da República", tipo:"Feriado nacional" },
      { data:new Date(ano, 10, 20), nome:"Dia Nacional de Zumbi e da Consciência Negra", tipo:"Feriado nacional" },
      { data:new Date(ano, 11, 25), nome:"Natal", tipo:"Feriado nacional" }
    ].map(item => ({ ...item, data:zerarHora(item.data) }));
  }

  return { listar };
})();
