const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  const URL = `https://www.transfermarkt.es/ligue-1/marktwerte/wettbewerb/FR1/pos//detailpos/0/altersklasse/alle/land_id/0/plus/1`;
  console.log(`::::: Iniciando Scrapping :::::: `);

  // Crear navegador
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 400,
  });

  const pagina = await browser.newPage();

  // Navegar a página y esperar a que se cargue
  await pagina.goto(URL, { waitUntil: "domcontentloaded" });

  // Extraer datos
  console.log(":::::::::: Extrayendo datos ::::::::::: ");

  let todosJugadores = [];
  let continuarbtn = true;

  while (continuarbtn) {
    const jugadoresObtenidos = await pagina.evaluate(() => {
      const arreglojugadores = [];
      const resultados = document.querySelectorAll("tbody > tr");

      resultados.forEach((jugador) => {
        const lugar = jugador.querySelector("td:nth-child(1n)")?.innerText;
        const nombre = jugador.querySelector("td.hauptlink a")?.innerText?.trim();
        const nacionalidades = Array.from(jugador.querySelectorAll("img.flaggenrahmen"))
          .map((img) => img.getAttribute("title"))
          .filter(Boolean);
        const edad = jugador.querySelector("td.zentriert:nth-child(2n)")?.innerText;
        const club = jugador.querySelector("td.zentriert a img")?.getAttribute("title");
        const valorMasAlto = jugador.querySelector("td.rechts span.cp")?.innerText?.trim();
        const ultmaRevision = jugador.querySelector("td:nth-child(7n)")?.innerText;
        const valorMercado = jugador.querySelector("td.rechts.hauptlink")?.innerText?.trim();

        if (
          !lugar ||
          !nombre ||
          !nacionalidades ||
          !edad ||
          !club ||
          !valorMasAlto ||
          !ultmaRevision ||
          !valorMercado
        )
          return;

        const resultados = {
          Lugar: lugar,
          Nombre: nombre,
          Nacionalidades: nacionalidades.join(" / "),
          Edad: edad,
          Club: club,
          ValorMasAlto: valorMasAlto,
          UltmaRevision: ultmaRevision,
          ValorMercado: valorMercado,
        };

        arreglojugadores.push(resultados);
      });



      return arreglojugadores;
    });

    todosJugadores = [...todosJugadores, ...jugadoresObtenidos];

    continuarbtn = await pagina.evaluate(() => {
        const btnSiguiente = document.querySelector("li.tm-pagination__list-item.tm-pagination__list-item--icon-next-page > a.tm-pagination__link");

        if (btnSiguiente) {
          btnSiguiente.click();
          return true;
        } else {
          return false;
        }
      });

      await new Promise((resolve)=>setTimeout(resolve, 2000));

  }

  console.log(todosJugadores);

  // Guardar en JSON
  fs.writeFileSync("Francia.json", JSON.stringify(todosJugadores, null, 2));
  console.log("✅ Archivo JSON creado: Francia.json");

  await browser.close();
})();
