const puppeteer = require("puppeteer");

(async () => {
  const URL = `https://www.transfermarkt.es/ligue-1/marktwerte/wettbewerb/FR1/pos//detailpos/0/altersklasse/alle/land_id/0/plus/1`;
  console.log(`::::: Iniciando Scrapping :::::: `);

  // Crear navegadorsS
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 400,
  });

  const pagina = await browser.newPage();

  // Navegar a pagina y esperar a que se cargue
  await pagina.goto(URL, { waitUntil: "DOMContentLoaded" });

  // Extraer datos
  console.log(":::::::::: Extrayendo datos ::::::::::: ");

  let Jugadores = [];

  const btnSiguientePagina = true;

  while (btnSiguientePagina) {

    const JugadoresObtenidos = await pagina.evaluate(() => {
      const resultados = Array.from(document.querySelectorAll("tbody"));
      return resultados.map((jugador) => {
        const nombre = jugador.querySelector("td:nth-child(4) a.spielprofil_tooltip")?.innerText;
        const nacionalidad = jugador.querySelector("img.flaggenrahmen")?.getAttribute('title');
        const edad = jugador.querySelector("td:nth-child(5)")?.innerText;
        const club = jugador.querySelector("td:nth-child(6) img")?.getAttribute("src");
        const valorMasAlto = jugador.querySelector("td:nth-child(8)")?.innerText;
        const ultmaRevision = jugador.querySelector("td:nth-child(9)")?.innerText;
        const valorMercado = jugador.querySelector("td.rechts.hauptlink")?.innerText;
        
        

        //Validacion campos vacios
        if (!nombre || !nacionalidad || !edad || !club || !valorMasAlto || !valorMercado || !ultmaRevision) {
          return {
            nombre: nombre || "N/A - Dato no recuperado",
            edad: edad || "N/A - Dato no recuperado",
            club: club || "N/A - Dato no recuperado",
            edad: edad || "N/A - Dato no recuperado",
            valorMasAlto: valorMasAlto || "N/A - Dato no recuperado",
            UltimaRevision: ultmaRevision || "N/A - Dato no recuperado",
            valorMercado: valorMercado || "N/A - Dato no recuperado",
          };
        }

        // Retornar los datos como objeto
        // Definir la Estructura del Objeto
        
        //Termina Definicion de Estructura del objeto
        
        return {};
      });
    });

    //Agregar datos a arreglo productos
    Jugadores = [...Jugadores, JugadoresObtenidos];

    // Avanzar a la sig pagina
    btnSiguientePagina = await pagina.evaluate(() => {
    const btnSiguiente = document.querySelector('a.tm-pagination_link')
    console.log("TE encontre");

    if(btnSiguiente){
        btnSiguiente.click();
        console.log('entre al if')
        return true
    }else{
        console.log('entre en else');
        return false    
    }
    })

    //Esperar a que se de el click
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }

  //Resultados
  console.log(`:::::::: Todos los Jugadores Scrapeados ::::::: ${Jugadores}`);

  browser.close();

  // Exportacion de Archivos

  console.log("::::::: Terminando el proceso :::::::::  ::::");
})();


/**
 * nombre : nombre,
 * nacionalidad : nacionalidad
 */
// Guardar en JSON
// fs.writeFileSync("Francia.json", JSON.stringify(resultadosArray, null, 2));
// console.log("✅ Archivo JSON creado: Francia.json");
