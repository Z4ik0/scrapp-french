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
        const avatar = jugador.querySelector("table.inline-table tbody tr td img")?.getAttribute("data-src");
        const nombre = jugador.querySelector("td.hauptlink a")?.innerText?.trim();
        const posicion = jugador.querySelector("table.inline-table tbody tr:nth-child(2n) td")?.innerText.trim();

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
          !avatar ||
          !posicion ||
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
          Avatar: avatar,
          Nombre: nombre,
          Posicion: posicion,
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

  // Guardar en XLSX
  const XLSX = require("xlsx");
  const ws = XLSX.utils.json_to_sheet(todosJugadores);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Jugadores");
  XLSX.writeFile(wb, "Francia.xlsx");
  console.log("✅ Archivo XLSX creado: Francia.xlsx");

  // Guardar en CSV
  const createCsvWriter = require("csv-writer").createObjectCsvWriter;
  const csvWriter = createCsvWriter({
    path: "Francia.csv",
    header: Object.keys(todosJugadores[0]).map((key) => ({ id: key, title: key })),
    encoding: "utf8",
    alwaysQuote: true,
  });
  await csvWriter.writeRecords(todosJugadores);
  console.log("✅ Archivo CSV creado: Francia.csv");

  await browser.close();
})();
