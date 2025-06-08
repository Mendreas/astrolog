// Obs.js

// ================================
// LISTA DE PLANETAS
// ================================
const planetsList = [
  { id: "sun", name: "Sol", body: "Sun" },
  { id: "moon", name: "Lua", body: "Moon" },
  { id: "mercury", name: "Mercúrio", body: "Mercury" },
  { id: "venus", name: "Vénus", body: "Venus" },
  { id: "mars", name: "Marte", body: "Mars" },
  { id: "jupiter", name: "Júpiter", body: "Jupiter" },
  { id: "saturn", name: "Saturno", body: "Saturn" },
  { id: "uranus", name: "Úrano", body: "Uranus" },
  { id: "neptune", name: "Neptuno", body: "Neptune" }
];

let messierCatalog = [];

// ================================
// FETCH AO CATÁLOGO MESSIER LOCAL
// ================================
async function fetchMessierAndFill() {
  try {
    const res = await fetch('/messier.json');
    messierCatalog = await res.json();
    fillObsDropdownVisible();
  } catch (err) {
    document.getElementById('obsCard').textContent = 'Erro a carregar messier.json';
    console.error(err);
  }
}

// ================================
// PREENCHE DROPDOWN SÓ COM VISÍVEIS AGORA
// ================================
async function fillObsDropdownVisible() {
  const sel = document.getElementById("obsObjectSelect");
  if (!sel) return;
  sel.innerHTML = "";

  const now = document.getElementById("obsDateTime").value 
    ? new Date(document.getElementById("obsDateTime").value) : new Date();
  const lat = parseFloat(document.getElementById("obsLat").value) || 38.72;
  const lng = parseFloat(document.getElementById("obsLng").value) || -9.14;
  const observer = new Astronomy.Observer(lat, lng, 0);

  // Helper: verifica se o objeto estará acima do horizonte nas próximas 24h
  function isVisibleInNext24h(body, ra, dec) {
    for (let h = 0; h < 24; h += 1) {
      const t = new Date(now.getTime() + h*3600*1000);
      let alt = 0;
      try {
        if (body) {
          const eq = Astronomy.Equator(Astronomy.Body[body], t, observer, true, true);
          const hor = Astronomy.Horizontal(t, observer, eq.ra, eq.dec, "normal");
          alt = hor.altitude;
        } else {
          const hor = Astronomy.Horizontal(t, observer, ra, dec, "normal");
          alt = hor.altitude;
        }
        if (alt > 0) return true;
      } catch (e) {}
    }
    return false;
  }

  // PLANETAS/LUA/SOL
  for (const p of planetsList) {
    if (isVisibleInNext24h(p.body)) {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.name;
      sel.appendChild(opt);
    }
  }

  // MESSIER
  if (messierCatalog && messierCatalog.length > 0) {
    for (const obj of messierCatalog) {
      const ra = parseFloat(obj.ra);
      const dec = parseFloat(obj.dec);
      if (isVisibleInNext24h(null, ra, dec)) {
        const opt = document.createElement("option");
        opt.value = obj.id || obj.messier;
        opt.textContent = `${obj.id} - ${obj.name}`;
        sel.appendChild(opt);
      }
    }
  }

  if (sel.options.length === 0) {
    const opt = document.createElement("option");
    opt.textContent = "Nenhum objeto visível nas próximas 24h";
    opt.disabled = true;
    sel.appendChild(opt);
  }

  showObsCard();
}


// ================================
// EVENTOS
// ================================
document.addEventListener("DOMContentLoaded", () => {
  const dt = new Date();
  document.getElementById("obsDateTime").value = dt.toISOString().slice(0,16);
  document.getElementById("obsLat").value = 38.72;
  document.getElementById("obsLng").value = -9.14;
  fetchMessierAndFill();

  ["obsDateTime", "obsLat", "obsLng"].forEach(id => {
    document.getElementById(id).addEventListener("change", fillObsDropdownVisible);
  });

  document.getElementById("obsObjectSelect").addEventListener("change", showObsCard);

  // Botão para detetar localização
  document.getElementById("obsGeoBtn").onclick = function() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(pos => {
        document.getElementById("obsLat").value = pos.coords.latitude.toFixed(2);
        document.getElementById("obsLng").value = pos.coords.longitude.toFixed(2);
        fillObsDropdownVisible();
      });
    }
  };

  // Botão para atualizar hora
  document.getElementById("obsRefreshBtn").onclick = function() {
    document.getElementById("obsDateTime").value = new Date().toISOString().slice(0,16);
    fillObsDropdownVisible();
  };
});

// ================================
// MOSTRA O CARTÃO INFORMATIVO DO OBJETO
// ================================
function showObsCard() {
  const date = document.getElementById("obsDateTime").value ? new Date(document.getElementById("obsDateTime").value) : new Date();
  const lat = parseFloat(document.getElementById("obsLat").value) || 38.72;
  const lng = parseFloat(document.getElementById("obsLng").value) || -9.14;
  const objId = document.getElementById("obsObjectSelect").value;
  let card = "";

  // Planetas/Lua/Sol
  const pl = planetsList.find(x => x.id === objId);
  if (pl) {
    try {
      const observer = new Astronomy.Observer(lat, lng, 0);
      let body = Astronomy.Body[pl.body];
      const eq = Astronomy.Equator(body, date, observer, true, true);
      const hor = Astronomy.Horizontal(date, observer, eq.ra, eq.dec, "normal");
      const rise = Astronomy.SearchRiseSet(body, observer, +1, date, 300);
      const set = Astronomy.SearchRiseSet(body, observer, -1, date, 300);
      let mag = eq.mag ? eq.mag.toFixed(1) : "-";
      let dist = eq.dist ? eq.dist.toFixed(2) + " UA" : "-";
      card = `
      <div style="background:#39396a;padding:1em 1.3em;border-radius:1em;color:#fff;max-width:380px;">
        <div style="font-size:1.2em;font-weight:bold;">${pl.name}
          <span style="float:right; color: gold; font-size:1em">Magnitude: <b>${mag}</b></span>
        </div>
        <hr>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.3em 1.2em;">
          <span>Nascimento:</span><span><b>${rise ? rise.date.toTimeString().slice(0,5) : "-"}</b></span>
          <span>Ocaso:</span><span><b>${set ? set.date.toTimeString().slice(0,5) : "-"}</b></span>
          <span>Altitude:</span><span><b>${hor.altitude.toFixed(1)}º</b></span>
          <span>Azimute:</span><span><b>${hor.azimuth.toFixed(1)}º</b></span>
          <span>RA:</span><span><b>${formatRA(eq.ra)}</b></span>
          <span>DEC:</span><span><b>${formatDEC(eq.dec)}</b></span>
          <span>Distância:</span><span><b>${dist}</b></span>
        </div>
      </div>`;
    } catch (err) { card = "Erro ao calcular efemérides."; }
  } else if (messierCatalog && messierCatalog.length > 0) {
    // Messier
    const obj = messierCatalog.find(x => objId === x.id || objId === x.messier);
    if (obj) {
      try {
        const ra = parseFloat(obj.ra);
        const dec = parseFloat(obj.dec);
        const observer = new Astronomy.Observer(lat, lng, 0);
        const hor = Astronomy.Horizontal(date, observer, ra, dec, "normal");
        card = `
        <div style="background:#39396a;padding:1em 1.3em;border-radius:1em;color:#fff;max-width:380px;">
          <div style="font-size:1.2em;font-weight:bold;">${obj.name} <span style="color:#8fa">(${obj.messier})</span>
            <span style="float:right; color: gold; font-size:1em">Magnitude: <b>${obj.mag || "-"}</b></span>
          </div>
          <hr>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.3em 1.2em;">
            <span>Altitude:</span><span><b>${hor.altitude ? hor.altitude.toFixed(1) : "-"}º</b></span>
            <span>Azimute:</span><span><b>${hor.azimuth ? hor.azimuth.toFixed(1) : "-"}º</b></span>
            <span>RA:</span><span><b>${formatRA(ra)}</b></span>
            <span>DEC:</span><span><b>${formatDEC(dec)}</b></span>
            <span>Distância:</span><span><b>${obj.distance_ly ? obj.distance_ly + " ly" : "-"}</b></span>
          </div>
        </div>`;
      } catch (err) { card = "Erro ao calcular efemérides Messier."; }
    }
  }
  document.getElementById("obsCard").innerHTML = card;
}

// Helpers
function formatRA(ra) {
  const h = Math.floor(ra);
  const m = Math.floor((ra-h)*60);
  const s = Math.round((((ra-h)*60)-m)*60);
  return `${h.toString().padStart(2,"0")}h ${m.toString().padStart(2,"0")}m ${s.toString().padStart(2,"0")}s`;
}
function formatDEC(dec) {
  const sign = dec < 0 ? "-" : "+";
  const d = Math.abs(Math.floor(dec));
  const m = Math.abs(Math.floor((Math.abs(dec)-d)*60));
  const s = Math.abs(Math.round((((Math.abs(dec)-d)*60)-m)*60));
  return `${sign}${d.toString().padStart(2,"0")}° ${m.toString().padStart(2,"0")}' ${s.toString().padStart(2,"0")}"`;
}
