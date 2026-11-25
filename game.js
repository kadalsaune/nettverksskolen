(() => {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";
  // Komponentregisteret deler visningsnavn, ikoner og klientegenskaper mellom UI og nettverkslogikk.
  const components = {
    router: { label: "Ruter", short: "RUTER", icon: '<rect x="3" y="9" width="18" height="10" rx="2"/><path d="M7 9V6m10 3V6m-7 8h.01M14 14h.01M17 14h.01"/>' },
    switch: { label: "Switch", short: "SWITCH", icon: '<rect x="3" y="7" width="18" height="12" rx="2"/><path d="M7 11h.01M10 11h.01M13 11h.01M16 11h.01M7 15h.01M10 15h.01M13 15h.01M16 15h.01"/>' },
    pc: { label: "PC", short: "DATAMASKIN", client: true, icon: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M12 17v3m-4 0h8M8 9l2 2 4-4"/>' },
    laptop: { label: "Bærbar", short: "BÆRBAR", client: true, icon: '<rect x="5" y="4" width="14" height="11" rx="2"/><path d="M3 19h18l-2-4H5l-2 4Z"/>' },
    firewall: { label: "Brannmur", short: "BRANNMUR", icon: '<path d="M12 3 20 6v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3Z"/><path d="m9 12 2 2 4-4"/>' },
    accessPoint: { label: "Aksesspunkt", short: "WI-FI", icon: '<path d="M5 10a10 10 0 0 1 14 0M8 13a6 6 0 0 1 8 0m-5 3a2 2 0 0 1 2 0m-1 3h.01"/>' },
    server: { label: "Server", short: "SERVER", client: true, icon: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8m-8 4h8m-8 4h4m-4 3h.01M16 18h.01"/>' },
    printer: { label: "Skriver", short: "SKRIVER", client: true, icon: '<path d="M7 8V4h10v4M7 17H5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2"/><path d="M7 14h10v6H7zM17 12h.01"/>' },
    iot: { label: "IoT-enhet", short: "IoT", client: true, icon: '<circle cx="12" cy="12" r="5"/><path d="M12 3v2m0 14v2M3 12h2m14 0h2m-13-5 1.4 1.4m5.2 5.2L17 15m0-8-1.4 1.4m-5.2 5.2L7 15"/>' }
  };

  // Oppdragskrav ligger som data her; vurderingsfunksjonene bruker kravene i aktivt nivå.
  const levels = [
    {
      title: "Koble til datasalen",
      subtitle: "Det første nettverket",
      description: "Skolen har fått et nytt datarom. Koble tre datamaskiner til internett, slik at elevene kan jobbe på nett.",
      time: "5 MIN", difficulty: "NYBEGYNNER",
      internetRequired: true,
      goal: "Alle tre datamaskinene skal ha forbindelse til internett.",
      strip: "Tre elev-PC-er trenger en stabil vei ut på internett.",
      required: [{ kind: "router", count: 1, label: "Minst én ruter kobler lokalnettet til internett." }, { kind: "switch", count: 1, label: "En switch gir plass til flere kablede enheter." }, { kind: "pc", count: 3, label: "Koble til alle tre datamaskinene." }],
      palette: ["router", "firewall", "switch", "pc"],
      targetClientCount: 3,
      defaultPositions: { router: [[31, 50]], firewall: [[31, 20]], switch: [[56, 50]], pc: [[81, 20], [81, 50], [81, 80]] }
    },
    {
      title: "Kontoret på nett",
      subtitle: "Kablet og trådløst",
      description: "Et lite kontor trenger sikkert internett, trådløst nett til de ansatte og en skriver alle kan bruke.",
      time: "8 MIN", difficulty: "VIDEREKOMMENDE",
      internetRequired: true,
      goal: "Sikre nettverket, koble til skriveren og gi to bærbare Wi-Fi.",
      strip: "Kontoret trenger både sikkerhet, utskrift og et trådløst nett.",
      required: [{ kind: "router", count: 1, label: "Ruteren gir kontoret tilgang til internett." }, { kind: "firewall", count: 1, label: "Brannmuren beskytter nettverket." }, { kind: "switch", count: 1, label: "Switchen kobler sammen det kablede utstyret." }, { kind: "accessPoint", count: 1, label: "Aksesspunktet gir trådløs dekning." }, { kind: "laptop", count: 2, label: "Begge de ansattes bærbare er koblet til." }, { kind: "printer", count: 1, label: "Skriveren er tilgjengelig på nettverket." }],
      palette: ["router", "switch", "firewall", "accessPoint", "laptop", "printer"],
      targetClientCount: 3,
      defaultPositions: { router: [[31, 50]], firewall: [[56, 20]], switch: [[56, 50]], accessPoint: [[81, 50]], laptop: [[81, 20], [81, 80]], printer: [[56, 80]] }
    },
    {
      title: "Medialab med fart",
      subtitle: "Større nettverk",
      description: "Medielaben har et redigeringsrom og et serverrom. Arbeidsstasjonene produserer store videofiler, mens serveren i det andre rommet lagrer og deler dem. Begge rommene trenger sikker tilgang til Internett. Hvert rom har sin egen switch, og switchene må kobles sammen med en uplink.",
      time: "12 MIN", difficulty: "EKSPERT",
      internetRequired: true,
      goal: "Koble Internett → brannmur → ruter → switch. Koble én arbeidsstasjon til hver rom-switch, serveren til serverrommets switch og aksesspunktet til redigeringsrommets switch. Lag en uplink mellom switchene.",
      strip: "Begge rommene trenger sikker Internett-tilgang, én felles filserver og en rask uplink mellom switchene.",
      required: [{ kind: "router", count: 1, label: "Ruteren kobler medialaben til internett." }, { kind: "firewall", count: 1, label: "Brannmuren beskytter brukere og server." }, { kind: "switch", count: 2, label: "Én switch samler kablene i hvert rom; koble switchene sammen." }, { kind: "accessPoint", count: 1, label: "Aksesspunktet gir trådløs tilgang i redigeringsrommet." }, { kind: "server", count: 1, label: "Serveren i serverrommet deler prosjektfiler." }, { kind: "pc", count: 2, label: "Koble én arbeidsstasjon til hver rom-switch." }, { kind: "laptop", count: 1, label: "En bærbar bruker kobles til via aksesspunktet." }],
      palette: ["router", "switch", "firewall", "accessPoint", "server", "pc", "laptop"],
      targetClientCount: 4,
      defaultPositions: { router: [[31, 50]], firewall: [[56, 20]], switch: [[56, 50], [56, 80]], accessPoint: [[81, 50]], server: [[81, 20]], pc: [[81, 80], [31, 80]], laptop: [[31, 20]] }
    },
    {
      title: "To nett, én infrastruktur",
      subtitle: "VLAN og trunk",
      description: "Ansatte og gjester bruker de samme to switchene, men skal være i hvert sitt VLAN. Begge gruppene trenger Internett, men skal holdes adskilt fra hverandre. Plasser én PC og én bærbar på hver switch. En trunk mellom switchene må føre begge VLAN-ene videre.",
      time: "15 MIN", difficulty: "EKSPERT",
      goal: "Bygg Internett → brannmur → ruter → switch. Sett PC-ene i VLAN 10 (Ansatte), de bærbare i VLAN 20 (Gjester), og før begge VLAN over trunkene.",
      strip: "Begge VLAN skal nå Internett; samme VLAN kommuniserer på tvers av switchene, mens ansatte og gjester holdes adskilt.",
      required: [{ kind: "firewall", count: 1, label: "Brannmuren beskytter nettverket mot Internett." }, { kind: "router", count: 1, label: "Ruteren gir begge VLAN tilgang til Internett." }, { kind: "switch", count: 2, label: "Koble switchene sammen med en trunk." }, { kind: "pc", count: 2, label: "Koble én PC til hver switch." }, { kind: "laptop", count: 2, label: "Koble én bærbar til hver switch." }],
      palette: ["firewall", "router", "switch", "pc", "laptop"],
      targetClientCount: 4,
      vlans: [{ id: 10, name: "Ansatte" }, { id: 20, name: "Gjester" }],
      vlanAssignments: { pc: 10, laptop: 20 },
      accessByKind: { pc: "switch", laptop: "switch" },
      requiredTrunks: [["switch", "switch"], ["router", "switch"]],
      vlanPeerGroups: [{ vlanId: 10, kinds: ["pc"], crossSwitch: true }, { vlanId: 20, kinds: ["laptop"], crossSwitch: true }],
      internetRequired: true,
      isolateVlans: true,
      defaultPositions: { firewall: [[18, 50]], router: [[33, 50]], switch: [[52, 43], [71, 57]], pc: [[49, 12], [72, 12]], laptop: [[49, 88], [72, 88]] },
      mobilePositions: { firewall: [[28, 50]], router: [[28, 30]], switch: [[52, 30], [52, 65]], pc: [[28, 85], [28, 65]], laptop: [[84, 30], [84, 65]] }
    },
    {
      title: "Sikre smarthjemmet",
      subtitle: "IoT og tilgangskontroll",
      description: "Hjemmenettverket skal støtte beboernes PC og hjemmeserver, gjestens bærbare, et kamera og en smart høyttaler. Den bærbare og smarthjemutstyret bruker Wi-Fi. Alle enhetene trenger Internett. PC og hjemmeserver skal kunne dele filer, men gjesten og IoT-enhetene skal ikke kunne kontakte beboernes enheter.",
      time: "18 MIN", difficulty: "EKSPERT",
      goal: "Utform et oppsett som gir alle enhetene nødvendig tilgang, samtidig som gjester og IoT holdes adskilt fra beboernes enheter.",
      strip: "Hvordan gir du alle enhetene tilgang uten å åpne beboernes nett for gjester og IoT?",
      protectedNetworkLabel: "beboernes nettverk",
      required: [{ kind: "router", count: 1, label: "Ruteren gir beboere, gjester og IoT tilgang til Internett." }, { kind: "firewall", count: 1, label: "Brannmuren beskytter hjemmenettverket mot Internett." }, { kind: "switch", count: 1, label: "Switchen samler det kablede utstyret." }, { kind: "accessPoint", count: 1, label: "Aksesspunktet gir trådløs tilgang for gjest og IoT." }, { kind: "pc", count: 1, label: "Beboernes PC bruker VLAN 10." }, { kind: "server", count: 1, label: "Hjemmeserveren bruker VLAN 10." }, { kind: "laptop", count: 1, label: "Gjestens bærbare bruker VLAN 20." }, { kind: "iot", count: 2, label: "Kamera og høyttaler bruker IoT-VLAN 30." }],
      palette: ["router", "firewall", "switch", "accessPoint", "pc", "server", "laptop", "iot"],
      targetClientCount: 5,
      vlans: [{ id: 10, name: "Beboere" }, { id: 20, name: "Gjester" }, { id: 30, name: "IoT" }],
      vlanAssignments: { pc: 10, server: 10, laptop: 20, iot: 30 },
      accessByKind: { pc: "switch", server: "switch", laptop: "accessPoint", iot: "accessPoint" },
      requiredTrunks: [["router", "switch"], ["accessPoint", "switch"]],
      vlanPeerGroups: [{ vlanId: 10, kinds: ["pc", "server"], crossSwitch: false }, { vlanId: 30, kinds: ["iot"], crossSwitch: false }],
      accessPolicies: true,
      internetRequired: true,
      defaultPositions: { router: [[34, 50]], firewall: [[18, 50]], switch: [[52, 50]], accessPoint: [[72, 25]], pc: [[50, 15]], server: [[52, 82]], laptop: [[88, 25]], iot: [[88, 65], [72, 88]] },
      mobilePositions: { router: [[28, 30]], firewall: [[28, 50]], switch: [[52, 50]], accessPoint: [[84, 50]], pc: [[28, 85]], server: [[28, 65]], laptop: [[84, 30]], iot: [[84, 65], [52, 85]] }
    }
  ];

  const sandboxLevel = {
    title: "Bygg ditt eget nettverk",
    subtitle: "Fri bygging",
    description: "Sett sammen nettverkskomponenter slik du vil. Koble til Internett, velg VLAN på kabler, og prøv å simulere trafikk.",
    time: "UTEN TIDSFRIST",
    difficulty: "FRI MODUS",
    goal: "Bygg et nettverk uten faste krav. Trafikksimuleringen viser hvilke klienter som når Internett og hverandre.",
    strip: "Bygg fritt, konfigurer VLAN på kablene og se trafikken bevege seg gjennom nettverket.",
    internetRequired: true,
    palette: Object.keys(components),
    vlans: [{ id: 1, name: "Standard" }, { id: 10, name: "VLAN 10" }, { id: 20, name: "VLAN 20" }, { id: 30, name: "VLAN 30" }],
    vlanPeerGroups: []
  };

  const board = document.querySelector("#network-board");
  const nodesLayer = document.querySelector("#nodes-layer");
  const connectionsSvg = document.querySelector("#connections");
  const palette = document.querySelector("#component-palette");
  const feedback = document.querySelector("#feedback");
  const statusMessage = document.querySelector("#status-message");

  // Noder og kabler er den kanoniske nettverkstilstanden; "internet" er et spesielt kabelendepunkt.
  let currentLevel = 0;
  let sandboxMode = false;
  let nodes = [];
  let connections = [];
  let nextId = 1;
  let selectedNodeId = null;
  let selectedConnectionIndex = null;
  let wireSourceId = null;
  let cableToolActive = false;
  let isSimulating = false;
  let suppressedClickId = null;
  let suppressPaletteClick = false;
  let awardedLevels = new Set(JSON.parse(localStorage.getItem("nettverksskolen-bestatt") || "[]"));
  let pointerDrag = null;
  let paletteDrag = null;
  let activeExportUrl = null;

  function iconMarkup(kind) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${components[kind].icon}</svg>`;
  }

  function activeLevel() {
    return sandboxMode ? sandboxLevel : levels[currentLevel];
  }

  function updateLevelContent() {
    const level = activeLevel();
    board.classList.toggle("vlan-board", Boolean(level.vlans));
    document.querySelector(".mission-topline .eyebrow").textContent = sandboxMode ? "FRI BYGGING" : "DAGENS UTFORDRING";
    document.querySelector("#scenario-title").textContent = level.title;
    document.querySelector("#scenario-description").textContent = level.description;
    document.querySelector("#scenario-time").textContent = level.time;
    document.querySelector("#scenario-difficulty").textContent = level.difficulty;
    document.querySelector("#scenario-goal").textContent = level.goal;
    document.querySelector("#strip-text").textContent = level.strip;
    document.querySelector("#breadcrumb-level").textContent = sandboxMode ? "SANDKASSE" : `OPPDRAG 0${currentLevel + 1}`;
    document.querySelector("#workbench-title").textContent = sandboxMode ? "Sandkasse" : "Arbeidsbenk";
    document.querySelector(".strip-badge").hidden = sandboxMode;
    document.querySelector("#evaluate-button").hidden = sandboxMode;
    document.querySelector("#export-png-button").hidden = !sandboxMode;
    document.querySelector("#export-gif-button").hidden = !sandboxMode;
    document.querySelector("#reset-button").setAttribute("aria-label", sandboxMode ? "Nullstill sandkassen" : "Start oppsettet på nytt");
    document.querySelector("#reset-button").title = sandboxMode ? "Tøm sandkassen" : "Start på nytt";
    document.querySelector(".level-count").textContent = `${awardedLevels.size} / ${levels.length}`;

    document.querySelector(".level-list").innerHTML = levels.map((item, index) => `
      <button class="level-button${index === currentLevel ? " active" : ""}${awardedLevels.has(index) ? " completed" : ""}" type="button" data-level="${index}" aria-current="${index === currentLevel ? "step" : "false"}">
        <span class="level-number">${String(index + 1).padStart(2, "0")}</span>
        <span class="level-copy"><span class="level-name">${item.title}</span><span class="level-subtitle">${item.subtitle}</span></span>
        <span class="level-status" aria-label="${awardedLevels.has(index) ? "Fullført" : ""}">${awardedLevels.has(index) ? "✓" : index === currentLevel ? "↗" : "·"}</span>
      </button>`).join("") + `
      <button class="level-button sandbox-level-button${sandboxMode ? " active" : ""}" type="button" data-sandbox-mode aria-current="${sandboxMode ? "step" : "false"}">
        <span class="level-number">∞</span>
        <span class="level-copy"><span class="level-name">Sandkasse</span><span class="level-subtitle">Bygg fritt</span></span>
        <span class="level-status" aria-label="${sandboxMode ? "Aktiv" : ""}">${sandboxMode ? "↗" : "·"}</span>
      </button>`;
    document.querySelectorAll(".level-button").forEach(button => {
      button.addEventListener("click", () => {
        if (button.hasAttribute("data-sandbox-mode")) loadSandbox();
        else loadLevel(Number(button.dataset.level));
      });
    });

    palette.innerHTML = level.palette.map(kind => `
      <div class="component-card" tabindex="0" role="button" aria-label="Legg til ${components[kind].label}" data-kind="${kind}">
        <span class="component-icon">${iconMarkup(kind)}</span><span class="component-name">${components[kind].label}</span>
      </div>`).join("") + `
      <button class="component-card cable-tool-card${cableToolActive ? " active" : ""}" type="button" data-tool="cable" aria-pressed="${cableToolActive}">
        <span class="component-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7h3v4H7zM14 13h3v4h-3zM10 9h2a3 3 0 0 1 3 3v1"/></svg></span>
        <span class="component-name">Kabel</span>
      </button>`;

    palette.querySelectorAll(".component-card[data-kind]").forEach(card => {
      card.addEventListener("pointerdown", event => {
        if (event.button !== 0) return;
        paletteDrag = { kind: card.dataset.kind, card, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, moved: false, ghost: null };
        card.setPointerCapture(event.pointerId);
      });
      card.addEventListener("pointermove", event => {
        if (!paletteDrag || paletteDrag.card !== card || paletteDrag.pointerId !== event.pointerId) return;
        if (!paletteDrag.moved && Math.abs(event.clientX - paletteDrag.startX) + Math.abs(event.clientY - paletteDrag.startY) > 6) {
          paletteDrag.moved = true;
          card.classList.add("dragging");
          paletteDrag.ghost = card.cloneNode(true);
          paletteDrag.ghost.classList.add("drag-ghost");
          paletteDrag.ghost.setAttribute("aria-hidden", "true");
          document.body.appendChild(paletteDrag.ghost);
        }
        if (!paletteDrag.moved) return;
        const bounds = board.getBoundingClientRect();
        const overBoard = event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
        board.classList.toggle("drag-over", overBoard);
        paletteDrag.ghost.style.left = `${event.clientX}px`;
        paletteDrag.ghost.style.top = `${event.clientY}px`;
      });
      card.addEventListener("pointerup", event => {
        if (!paletteDrag || paletteDrag.card !== card || paletteDrag.pointerId !== event.pointerId) return;
        const drag = paletteDrag;
        paletteDrag = null;
        card.classList.remove("dragging");
        board.classList.remove("drag-over");
        if (drag.ghost) drag.ghost.remove();
        if (!drag.moved) return;
        suppressPaletteClick = true;
        setTimeout(() => { suppressPaletteClick = false; }, 100);
        const bounds = board.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) return;
        addDevice(drag.kind, (event.clientX - bounds.left) / bounds.width * 100, (event.clientY - bounds.top) / bounds.height * 100);
      });
      card.addEventListener("pointercancel", () => {
        if (!paletteDrag || paletteDrag.card !== card) return;
        card.classList.remove("dragging");
        board.classList.remove("drag-over");
        if (paletteDrag.ghost) paletteDrag.ghost.remove();
        paletteDrag = null;
      });
      card.addEventListener("click", () => {
        if (suppressPaletteClick) {
          suppressPaletteClick = false;
          return;
        }
        addDevice(card.dataset.kind);
      });
      card.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          addDevice(card.dataset.kind);
        }
      });
    });
    palette.querySelector(".cable-tool-card").addEventListener("click", toggleCableTool);
    updateVlanPanel();
  }

  function updateVlanPanel() {
    const level = activeLevel();
    const panel = document.querySelector("#vlan-panel");
    panel.hidden = !level.vlans;
    const device = nodes.find(node => node.id === selectedNodeId);
    const policyEditor = document.querySelector("#vlan-policy-editor");
    const showPolicy = Boolean(level.accessPolicies && device?.kind === "router");
    policyEditor.hidden = !showPolicy;
    if (!level.vlans) return;

    const context = document.querySelector("#vlan-context");
    context.textContent = level.accessPolicies
      ? "Velg VLAN på kablene. Velg ruteren for tilgangsregler over arbeidsområdet."
      : sandboxMode
        ? "VLAN 1 er standard. Bruk trunk på forbindelser mellom nettverksutstyr for å føre flere VLAN."
        : "Velg en kabel på kartet for å angi VLAN og lenketype.";
    const protectedNetworkLabel = level.protectedNetworkLabel || "ansattnettverket";
    document.querySelector("#guest-policy-label").textContent = `Blokker gjester fra ${protectedNetworkLabel}`;
    document.querySelector("#iot-policy-label").textContent = `Blokker IoT fra ${protectedNetworkLabel}`;
    if (showPolicy) {
      document.querySelector("#block-guest-to-staff").checked = device.blockGuestToStaff;
      document.querySelector("#block-iot-to-staff").checked = device.blockIotToStaff;
    }
  }

  function toggleCableTool() {
    cableToolActive = !cableToolActive;
    wireSourceId = null;
    selectedConnectionIndex = null;
    selectedNodeId = null;
    render();
    announce(cableToolActive
      ? "Kabelverktøy valgt. Velg første endepunkt på kartet."
      : "Kabelverktøy avslått.");
  }

  function connectionEndpointLabel(id) {
    if (id === "internet") return "Internett";
    const node = nodes.find(item => item.id === id);
    return node ? components[node.kind].label : "Ukjent enhet";
  }

  function syncClientVlans() {
    const nodeById = new Map(nodes.map(node => [node.id, node]));
    nodes.filter(node => components[node.kind]?.client).forEach(node => {
      const accessLink = connections.find(edge => {
        if (edge.mode !== "access" || edge.vlanId === null || edge.vlanId === undefined) return false;
        if (edge.a !== node.id && edge.b !== node.id) return false;
        const peerId = edge.a === node.id ? edge.b : edge.a;
        return ["switch", "accessPoint"].includes(nodeById.get(peerId)?.kind);
      });
      node.vlanId = accessLink ? accessLink.vlanId : null;
    });
  }

  function updateCableEditor() {
    const editor = document.querySelector("#cable-editor");
    const connection = selectedConnectionIndex === null ? null : connections[selectedConnectionIndex];
    editor.hidden = !connection;
    if (!connection) return;

    const level = activeLevel();
    const first = nodes.find(node => node.id === connection.a);
    const second = nodes.find(node => node.id === connection.b);
    const clientLink = [first, second].some(node => components[node?.kind]?.client);
    const kinds = [first?.kind, second?.kind].sort().join(":");
    const fixedAccessLink = connection.a === "internet" || connection.b === "internet" || kinds === "firewall:router";
    document.querySelector("#cable-editor-title").textContent =
      `${connectionEndpointLabel(connection.a)} ↔ ${connectionEndpointLabel(connection.b)}`;
    document.querySelector("#cable-mode-row").hidden = !level.vlans || fixedAccessLink;
    document.querySelector("#cable-mode-select").value = connection.mode || "access";
    document.querySelector("#cable-access-vlan-row").hidden =
      !level.vlans || connection.mode !== "access" || !clientLink;
    document.querySelector("#cable-access-vlan-select").innerHTML =
      `<option value="">Velg VLAN</option>${(level.vlans || []).map(vlan =>
        `<option value="${vlan.id}">VLAN ${vlan.id} · ${vlan.name}</option>`).join("")}`;
    document.querySelector("#cable-access-vlan-select").value =
      connection.vlanId === null || connection.vlanId === undefined ? "" : String(connection.vlanId);
    const trunkRow = document.querySelector("#cable-trunk-vlan-row");
    trunkRow.hidden = !level.vlans || connection.mode !== "trunk";
    document.querySelector("#cable-trunk-vlans").innerHTML = (level.vlans || []).map(vlan => `
      <label><input type="checkbox" value="${vlan.id}"${(connection.allowedVlans || []).includes(vlan.id) ? " checked" : ""}>
        VLAN ${vlan.id} · ${vlan.name}</label>`).join("");
  }

  function loadLevel(index) {
    if (!Number.isInteger(index) || index < 0 || index >= levels.length) return;
    clearBoardStatus();
    stopSimulation();
    sandboxMode = false;
    currentLevel = index;
    nodes = [];
    connections = [];
    selectedNodeId = null;
    selectedConnectionIndex = null;
    wireSourceId = null;
    cableToolActive = false;
    nextId = 1;
    feedback.hidden = true;
    board.classList.remove("has-devices");
    updateLevelContent();
    render();
    announce(`${levels[index].title} er valgt.`);
  }

  function loadSandbox() {
    clearBoardStatus();
    stopSimulation();
    sandboxMode = true;
    nodes = [];
    connections = [];
    nextId = 1;
    selectedNodeId = null;
    selectedConnectionIndex = null;
    wireSourceId = null;
    cableToolActive = false;
    feedback.hidden = true;
    board.classList.remove("has-devices");
    updateLevelContent();
    render();
    announce("Sandkassen er klar. Velg komponenter fra paletten for å bygge nettverket.");
  }

  function sandboxPosition(index) {
    const mobile = window.matchMedia("(max-width: 470px)").matches;
    const columns = mobile ? [28, 56, 84] : [17, 39, 61, 83];
    const rows = mobile ? [16, 34, 52, 70, 88] : [18, 40, 62, 84];
    return [columns[index % columns.length], rows[Math.floor(index / columns.length) % rows.length]];
  }

  function addDevice(kind, x, y) {
    if (!components[kind] || !activeLevel().palette.includes(kind)) return;
    clearBoardStatus();
    if (x === undefined || y === undefined) {
      if (sandboxMode) {
        [x, y] = sandboxPosition(nodes.length);
      } else {
        const level = activeLevel();
        const positionMap = window.matchMedia("(max-width: 470px)").matches
          ? level.mobilePositions || level.defaultPositions
          : level.defaultPositions;
        const positions = positionMap[kind];
        const count = nodes.filter(node => node.kind === kind).length;
        const position = positions[Math.min(count, positions.length - 1)];
        x = position[0];
        y = position[1];
      }
    }
    const id = nextId++;
    nodes.push({
      id,
      kind,
      x: Math.max(13, Math.min(93, x)),
      y: Math.max(12, Math.min(88, y)),
      vlanId: null,
      blockGuestToStaff: false,
      blockIotToStaff: false
    });
    feedback.hidden = true;
    board.classList.add("has-devices");
    render();
    announce(`${components[kind].label} lagt til i nettverkskartet.`);
  }

  function render() {
    nodesLayer.innerHTML = nodes.map(node => `
      <div class="device${selectedNodeId === node.id ? " selected" : ""}${wireSourceId === node.id ? " wire-source" : ""}" data-id="${node.id}" data-kind="${node.kind}" data-vlan="${node.vlanId || ""}" role="group" aria-label="${components[node.kind].label}${node.vlanId ? `, VLAN ${node.vlanId}` : ""}" style="left:${node.x}%;top:${node.y}%;transform:translate(-50%,-50%)">
        <button class="device-select" type="button" aria-label="${components[node.kind].label}${selectedNodeId === node.id ? ", valgt" : ""}" aria-pressed="${selectedNodeId === node.id}">
          <span class="device-icon">${iconMarkup(node.kind)}</span><span class="device-name">${components[node.kind].label}</span><span class="device-kind-label">${components[node.kind].short}</span>${node.vlanId ? `<span class="device-vlan">VLAN ${node.vlanId}</span>` : ""}
        </button>
        ${selectedNodeId === node.id ? `<button class="device-remove" type="button" aria-label="Fjern ${components[node.kind].label}" title="Fjern ${components[node.kind].label}">×</button>` : ""}
      </div>`).join("");

    nodesLayer.querySelectorAll(".device").forEach(element => {
      element.addEventListener("click", event => {
        event.stopPropagation();
        if (event.target.closest(".device-remove")) return;
        const id = Number(element.dataset.id);
        if (suppressedClickId === id) {
          suppressedClickId = null;
          return;
        }
        onDeviceClick(id);
      });
      element.addEventListener("pointerdown", event => {
        if (event.button !== 0 || event.target.closest(".device-remove")) return;
        const node = nodes.find(item => item.id === Number(element.dataset.id));
        if (!node) return;
        const bounds = board.getBoundingClientRect();
        pointerDrag = { id: node.id, startX: event.clientX, startY: event.clientY, x: node.x, y: node.y, moved: false, width: bounds.width, height: bounds.height };
        element.setPointerCapture(event.pointerId);
      });
      element.addEventListener("pointermove", event => {
        if (!pointerDrag || pointerDrag.id !== Number(element.dataset.id)) return;
        const dx = event.clientX - pointerDrag.startX;
        const dy = event.clientY - pointerDrag.startY;
        if (Math.abs(dx) + Math.abs(dy) > 3) pointerDrag.moved = true;
        if (!pointerDrag.moved) return;
        const node = nodes.find(item => item.id === pointerDrag.id);
        node.x = Math.max(8, Math.min(94, pointerDrag.x + dx / pointerDrag.width * 100));
        node.y = Math.max(10, Math.min(90, pointerDrag.y + dy / pointerDrag.height * 100));
        element.style.left = `${node.x}%`;
        element.style.top = `${node.y}%`;
        drawConnections();
      });
      element.addEventListener("pointerup", () => {
        if (pointerDrag && pointerDrag.id === Number(element.dataset.id)) {
          const moved = pointerDrag.moved;
          if (moved) {
            const draggedId = pointerDrag.id;
            suppressedClickId = draggedId;
            setTimeout(() => {
              if (suppressedClickId === draggedId) suppressedClickId = null;
            }, 100);
          }
          pointerDrag = null;
        }
      });
      element.addEventListener("lostpointercapture", () => {
        pointerDrag = null;
      });
      const removeButton = element.querySelector(".device-remove");
      if (removeButton) {
        removeButton.addEventListener("click", event => {
          event.stopPropagation();
          deleteDevice(Number(element.dataset.id));
        });
        removeButton.addEventListener("pointerdown", event => event.stopPropagation());
      }
    });

    const unitCount = nodes.length + 1;
    document.querySelector("#node-count").textContent = `${unitCount} ${unitCount === 1 ? "enhet" : "enheter"}`;
    document.querySelector("#delete-button").disabled = selectedNodeId === null;
    const internetNode = board.querySelector(".internet-node");
    const internetSelected = wireSourceId === "internet";
    internetNode.classList.toggle("wire-source", internetSelected);
    internetNode.setAttribute("aria-pressed", String(internetSelected));
    internetNode.setAttribute("aria-label", internetSelected ? "Internett valgt, velg en enhet for å koble til" : "Internett, velg for å koble til en enhet");
    document.querySelector("#connection-hint").textContent = wireSourceId === "internet"
      ? "Internett valgt · velg brannmur eller ruter"
      : wireSourceId
        ? "Velg det andre endepunktet for å fullføre kabelen"
        : cableToolActive
          ? "Kabelverktøy valgt · velg første endepunkt"
        : activeLevel().vlans
          ? "Velg en kabel for å konfigurere VLAN"
          : "Velg Kabel under komponenter, og klikk to endepunkter";
    const cableToolButton = palette.querySelector(".cable-tool-card");
    cableToolButton.classList.toggle("active", cableToolActive);
    cableToolButton.setAttribute("aria-pressed", String(cableToolActive));
    internetNode.hidden = activeLevel().internetRequired === false;
    updateVlanPanel();
    updateCableEditor();
    drawConnections();
  }

  function onEndpointClick(id) {
    feedback.hidden = true;
    if (cableToolActive) clearBoardStatus();
    if (!cableToolActive) {
      selectedNodeId = id === "internet" ? null : id;
      selectedConnectionIndex = null;
      wireSourceId = null;
      render();
      return;
    }

    if (wireSourceId !== null) {
      if (wireSourceId === id) {
        wireSourceId = null;
        selectedNodeId = id === "internet" ? null : id;
        render();
        announce("Kabelens første endepunkt er fjernet.");
        return;
      } else {
        const existingIndex = connections.findIndex(edge =>
          (edge.a === wireSourceId && edge.b === id) || (edge.a === id && edge.b === wireSourceId)
        );
        if (existingIndex !== -1) {
          announce("Disse enhetene er allerede koblet sammen.");
          selectedConnectionIndex = existingIndex;
        } else {
          const first = nodes.find(node => node.id === wireSourceId);
          const second = nodes.find(node => node.id === id);
          const kinds = [first?.kind, second?.kind].sort().join(":");
          const trunkLink = sandboxMode && ["accessPoint:switch", "router:switch", "switch:switch"].includes(kinds);
          const clientLink = [first, second].some(node => components[node?.kind]?.client);
          const mode = trunkLink ? "trunk" : "access";
          connections.push({
            a: wireSourceId,
            b: id,
            mode,
            vlanId: sandboxMode && clientLink && mode === "access" ? 1 : null,
            allowedVlans: mode === "trunk" ? activeLevel().vlans.map(vlan => vlan.id) : []
          });
          selectedConnectionIndex = null;
          syncClientVlans();
          announce("Nettverkskabel koblet til. Velg kabelen for innstillinger.");
        }
        wireSourceId = null;
        selectedNodeId = null;
      }
    } else {
      wireSourceId = id;
      selectedNodeId = id === "internet" ? null : id;
      selectedConnectionIndex = null;
      announce(`Første endepunkt valgt: ${connectionEndpointLabel(id)}. Velg det andre endepunktet.`);
    }
    render();
  }

  function onDeviceClick(id) {
    onEndpointClick(id);
  }

  function drawConnections() {
    const rect = board.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    connectionsSvg.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
    const anchors = new Map();
    nodes.forEach(node => {
      const element = nodesLayer.querySelector(`.device[data-id="${node.id}"]`);
      if (!element) return;
      const bounds = element.getBoundingClientRect();
      anchors.set(node.id, {
        x: bounds.left - rect.left + bounds.width / 2,
        y: bounds.top - rect.top + bounds.height / 2,
        width: bounds.width,
        height: bounds.height,
        shape: "rectangle"
      });
    });
    const internetIcon = board.querySelector(".internet-icon").getBoundingClientRect();
    anchors.set("internet", {
      x: internetIcon.left - rect.left + internetIcon.width / 2,
      y: internetIcon.top - rect.top + internetIcon.height / 2,
      width: internetIcon.width,
      height: internetIcon.height,
      shape: "circle"
    });

    // Finn skjæringspunktet mot enhetskanten, slik at kablene ikke tegnes gjennom ikonene.
    const boundaryPoint = (anchor, target) => {
      const dx = target.x - anchor.x;
      const dy = target.y - anchor.y;
      const distance = Math.hypot(dx, dy);
      if (!distance) return { x: anchor.x, y: anchor.y, dx: 0, dy: 0 };
      const scale = anchor.shape === "circle"
        ? Math.min(anchor.width, anchor.height) / 2 / distance
        : Math.min(
          Math.abs(dx) ? anchor.width / 2 / Math.abs(dx) : Infinity,
          Math.abs(dy) ? anchor.height / 2 / Math.abs(dy) : Infinity
        );
      return { x: anchor.x + dx * scale, y: anchor.y + dy * scale, dx: dx / distance, dy: dy / distance };
    };

    connectionsSvg.innerHTML = connections.map((edge, index) => {
      const start = anchors.get(edge.a);
      const end = anchors.get(edge.b);
      if (!start || !end) return "";
      const startEdge = boundaryPoint(start, end);
      const endEdge = boundaryPoint(end, start);
      const portOffset = 3;
      const startPort = { x: startEdge.x + startEdge.dx * portOffset, y: startEdge.y + startEdge.dy * portOffset };
      const endPort = { x: endEdge.x - endEdge.dx * portOffset, y: endEdge.y - endEdge.dy * portOffset };
      const lineClass = `connection-line${edge.mode === "trunk" ? " trunk" : ""}${selectedConnectionIndex === index ? " connection-selected" : ""}`;
      const label = edge.mode === "trunk"
        ? `TRUNK${edge.allowedVlans?.length ? ` · ${edge.allowedVlans.join(",")}` : ""}`
        : edge.vlanId ? `VLAN ${edge.vlanId}` : "";
      const trunkLabel = label
        ? `<text class="connection-label" x="${(startEdge.x + endEdge.x) / 2}" y="${(startEdge.y + endEdge.y) / 2 - 5}">${label}</text>`
        : "";
      const title = "Velg kabelen for å konfigurere eller fjerne den";
      return `<path class="connection-hit-area" data-connection-index="${index}" d="M${startEdge.x} ${startEdge.y} L${endEdge.x} ${endEdge.y}"></path><path id="connection-${index}" class="${lineClass}" data-connection-index="${index}" d="M${startEdge.x} ${startEdge.y} L${endEdge.x} ${endEdge.y}"><title>${title}</title></path><circle class="connection-port" cx="${startPort.x}" cy="${startPort.y}" r="3"/><circle class="connection-port" cx="${endPort.x}" cy="${endPort.y}" r="3"/>${trunkLabel}`;
    }).join("");
    connectionsSvg.querySelectorAll(".connection-line, .connection-hit-area").forEach(path => {
      path.addEventListener("click", () => {
        const index = Number(path.dataset.connectionIndex);
        selectedConnectionIndex = index;
        selectedNodeId = null;
        wireSourceId = null;
        cableToolActive = false;
        render();
      });
    });
  }

  function removeConnection(index) {
    clearBoardStatus();
    connections.splice(index, 1);
    selectedConnectionIndex = null;
    syncClientVlans();
    render();
    announce("Nettverkskabel fjernet.");
  }

  function deleteDevice(id) {
    const removed = nodes.find(node => node.id === id);
    if (!removed) return;
    clearBoardStatus();
    nodes = nodes.filter(node => node.id !== id);
    connections = connections.filter(edge => edge.a !== id && edge.b !== id);
    if (selectedNodeId === id) selectedNodeId = null;
    selectedConnectionIndex = null;
    if (wireSourceId === id) wireSourceId = null;
    syncClientVlans();
    board.classList.toggle("has-devices", nodes.length > 0);
    feedback.hidden = true;
    render();
    announce(`${components[removed.kind].label} fjernet.`);
  }

  board.addEventListener("click", event => {
    if (event.target !== board && !event.target.classList.contains("board-grid")) return;
    selectedNodeId = null;
    selectedConnectionIndex = null;
    wireSourceId = null;
    cableToolActive = false;
    render();
  });
  const internetNode = board.querySelector(".internet-node");
  internetNode.addEventListener("click", onInternetClick);
  internetNode.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onInternetClick();
    }
  });

  function onInternetClick() {
    onEndpointClick("internet");
  }

  document.querySelector("#delete-button").addEventListener("click", () => {
    if (selectedNodeId === null) return;
    deleteDevice(selectedNodeId);
    wireSourceId = null;
  });

  document.querySelector("#reset-button").addEventListener("click", () => {
    if (sandboxMode) loadSandbox();
    else loadLevel(currentLevel);
  });
  document.querySelector("#close-feedback").addEventListener("click", () => { feedback.hidden = true; });
  document.querySelector("#evaluate-button").addEventListener("click", evaluateNetwork);
  document.querySelector("#simulate-button").addEventListener("click", () => {
    if (!isSimulating) {
      startSimulation();
      return;
    }
    stopSimulation();
    if (sandboxMode) {
      clearBoardStatus();
      showBoardStatus("Trafikksimuleringen er stoppet.");
    }
  });
  document.querySelector("#export-png-button").addEventListener("click", () => exportNetwork("png"));
  document.querySelector("#export-gif-button").addEventListener("click", () => exportNetwork("gif"));
  document.querySelector("#cable-mode-select").addEventListener("change", event => {
    const connection = selectedConnectionIndex === null ? null : connections[selectedConnectionIndex];
    if (!connection) return;
    clearBoardStatus();
    connection.mode = event.target.value;
    connection.vlanId = null;
    connection.allowedVlans = connection.mode === "trunk"
      ? activeLevel().vlans.map(vlan => vlan.id)
      : [];
    syncClientVlans();
    feedback.hidden = true;
    render();
  });
  document.querySelector("#cable-access-vlan-select").addEventListener("change", event => {
    const connection = selectedConnectionIndex === null ? null : connections[selectedConnectionIndex];
    if (!connection) return;
    clearBoardStatus();
    connection.vlanId = event.target.value ? Number(event.target.value) : null;
    syncClientVlans();
    feedback.hidden = true;
    render();
  });
  document.querySelector("#cable-trunk-vlans").addEventListener("change", () => {
    const connection = selectedConnectionIndex === null ? null : connections[selectedConnectionIndex];
    if (!connection) return;
    clearBoardStatus();
    connection.allowedVlans = [...document.querySelectorAll("#cable-trunk-vlans input:checked")]
      .map(input => Number(input.value));
    feedback.hidden = true;
    render();
  });
  document.querySelector("#block-guest-to-staff").addEventListener("change", event => {
    const router = nodes.find(node => node.id === selectedNodeId && node.kind === "router");
    if (!router) return;
    clearBoardStatus();
    router.blockGuestToStaff = event.target.checked;
    feedback.hidden = true;
  });
  document.querySelector("#block-iot-to-staff").addEventListener("change", event => {
    const router = nodes.find(node => node.id === selectedNodeId && node.kind === "router");
    if (!router) return;
    clearBoardStatus();
    router.blockIotToStaff = event.target.checked;
    feedback.hidden = true;
  });
  document.querySelector("#remove-cable-button").addEventListener("click", () => {
    if (selectedConnectionIndex !== null) removeConnection(selectedConnectionIndex);
  });

  function reachableNodes() {
    // Vanlige oppdrag bruker en uvektet graf: alle kabler gir en forbindelse i begge retninger.
    const adjacency = new Map([["internet", []]]);
    nodes.forEach(node => adjacency.set(node.id, []));
    connections.forEach(edge => {
      if (!adjacency.has(edge.a) || !adjacency.has(edge.b)) return;
      adjacency.get(edge.a).push(edge.b);
      adjacency.get(edge.b).push(edge.a);
    });
    const parent = new Map([["internet", null]]);
    const queue = ["internet"];
    while (queue.length) {
      const current = queue.shift();
      (adjacency.get(current) || []).forEach(neighbor => {
        if (parent.has(neighbor)) return;
        parent.set(neighbor, current);
        queue.push(neighbor);
      });
    }
    return { adjacency, parent };
  }

  function connectionCarriesVlan(edge, vlanId, nodeById) {
    // VLAN passerer bare klientens access-port eller en trunk som uttrykkelig tillater VLAN-et.
    const first = nodeById.get(edge.a);
    const second = nodeById.get(edge.b);
    if (edge.a === "internet" || edge.b === "internet") {
      const peer = first || second;
      return activeLevel().internetRequired && edge.mode === "access" &&
        ["firewall", "router"].includes(peer?.kind);
    }

    const firstIsClient = components[first?.kind]?.client;
    const secondIsClient = components[second?.kind]?.client;
    if (firstIsClient || secondIsClient) {
      if (firstIsClient && secondIsClient) return false;
      const client = firstIsClient ? first : second;
      const peer = firstIsClient ? second : first;
      return client.vlanId === vlanId && edge.vlanId === vlanId && edge.mode === "access" &&
        ["switch", "accessPoint"].includes(peer?.kind);
    }

    const kinds = [first?.kind, second?.kind].sort().join(":");
    if (kinds === "firewall:router") return edge.mode === "access";
    return ["accessPoint:switch", "router:switch", "switch:switch"].includes(kinds) &&
      edge.mode === "trunk" && (edge.allowedVlans || []).includes(vlanId);
  }

  function vlanPath(sourceId, targetId, vlanId) {
    // BFS over bare gyldige VLAN-lenker, og rekonstruer ruten fra foreldrepekere etter søket.
    const nodeById = new Map(nodes.map(node => [node.id, node]));
    const parent = new Map([[sourceId, null]]);
    const queue = [sourceId];
    while (queue.length) {
      const current = queue.shift();
      if (current === targetId) break;
      connections.forEach(edge => {
        if (!connectionCarriesVlan(edge, vlanId, nodeById)) return;
        const neighbor = edge.a === current ? edge.b : edge.b === current ? edge.a : null;
        if (neighbor === null || parent.has(neighbor)) return;
        parent.set(neighbor, current);
        queue.push(neighbor);
      });
    }
    if (!parent.has(targetId)) return null;
    const path = [];
    let current = targetId;
    while (current !== null) {
      path.push(current);
      current = parent.get(current);
    }
    return path.reverse();
  }

  function evaluateNetwork() {
    if (sandboxMode) return;
    if (activeLevel().vlans) {
      evaluateVlanNetwork();
      return;
    }
    const level = activeLevel();
    const findings = [];
    let score = 0;
    const componentPoints = 40;
    const eachRequirement = componentPoints / level.required.length;

    level.required.forEach(requirement => {
      const placed = nodes.filter(node => node.kind === requirement.kind);
      const enough = placed.length >= requirement.count;
      if (enough) score += eachRequirement;
      findings.push({ ok: enough, text: enough ? `${requirement.label} (${placed.length} valgt)` : `${requirement.label} Nå: ${placed.length}, trenger ${requirement.count}.` });
    });

    const { parent } = reachableNodes();
    const connectedClients = nodes.filter(node => components[node.kind].client && parent.has(node.id));
    const nodeById = new Map(nodes.map(node => [node.id, node]));
    const router = nodes.find(node => node.kind === "router");
    const firewallPresent = nodes.some(node => node.kind === "firewall");
    const switchIds = new Set(nodes.filter(node => node.kind === "switch").map(node => node.id));
    const links = new Set(connections.map(edge => `${edge.a}:${edge.b}`));
    const isLinked = (a, b) => links.has(`${a}:${b}`) || links.has(`${b}:${a}`);
    const gatewayOrderIsCorrect = path => {
      const pathKinds = path.map(id => id === "internet" ? "internet" : nodeById.get(id)?.kind);
      const routerIndex = pathKinds.indexOf("router");
      const switchIndex = pathKinds.indexOf("switch");
      const firewallIndex = pathKinds.indexOf("firewall");
      if (currentLevel === 0 && !firewallPresent) return routerIndex === 1 && switchIndex === 2;
      return firewallIndex === 1 && routerIndex === 2 && switchIndex === 3;
    };
    const clientTransitPaths = connectedClients.map(node => {
      const path = shortestPath(node.id, parent);
      const relays = path.slice(1, -1).filter(id => components[nodeById.get(id)?.kind]?.client);
      return relays.length ? { target: node, relays } : null;
    }).filter(Boolean);
    const pcBetweenRouterAndSwitch = currentLevel === 0 && router && nodes.some(node =>
      components[node.kind].client && isLinked(router.id, node.id) &&
      [...switchIds].some(switchId => isLinked(node.id, switchId))
    );
    const clientsBypassingRouter = router
      ? connectedClients.filter(node => !shortestPath(node.id, parent).includes(router.id))
      : [];
    const routerGatewayIssue = clientsBypassingRouter.length > 0;
    const firewallOrderIssue = !routerGatewayIssue && Boolean(router && firewallPresent) &&
      connectedClients.some(node => !gatewayOrderIsCorrect(shortestPath(node.id, parent)));
    const criticalErrors = [];
    if (clientTransitPaths.length) {
      const issue = clientTransitPaths[0];
      const target = components[issue.target.kind].label;
      const relay = components[nodeById.get(issue.relays[0]).kind].label;
      criticalErrors.push(`Trafikken til ${target} går via klienten ${relay}. Klienter videresender ikke trafikk. Koble begge enhetene direkte til aksesspunktet eller switchen i stedet.`);
    } else if (pcBetweenRouterAndSwitch) {
      criticalErrors.push("En PC er koblet mellom ruteren og switchen. PC-er videresender ikke trafikk mellom nettverkskomponenter. Koble ruteren direkte til switchen.");
    }
    if (routerGatewayIssue) {
      const target = components[clientsBypassingRouter[0].kind].label;
      criticalErrors.push(`Trafikken til ${target} går utenom ruteren. Ruteren må ha en WAN-forbindelse mot Internett eller brannmuren og en LAN-forbindelse mot switchen, slik at trafikken går gjennom ruteren.`);
    }
    const requiredPathKinds = currentLevel === 0
      ? ["router", "switch"]
      : currentLevel === 1
        ? ["router", "firewall", "switch"]
        : ["router", "firewall", "switch"];
    const switchesUsedByClients = new Set();
    const topologyClients = connectedClients.filter(node => {
      const path = shortestPath(node.id, parent);
      const pathKinds = new Set(path.map(id => id === "internet" ? "internet" : nodeById.get(id)?.kind).filter(Boolean));
      const hasRequiredInfrastructure = requiredPathKinds.every(kind => pathKinds.has(kind));
      const hasWirelessAccess = !["laptop"].includes(node.kind) || currentLevel === 0 || pathKinds.has("accessPoint");
      const hasNoClientTransit = path.slice(1, -1).every(id => !components[nodeById.get(id)?.kind]?.client);
      if (hasRequiredInfrastructure && hasWirelessAccess && hasNoClientTransit) {
        path.forEach(id => {
          if (nodeById.get(id)?.kind === "switch") switchesUsedByClients.add(id);
        });
      }
      return hasRequiredInfrastructure && hasWirelessAccess && hasNoClientTransit;
    });
    const requiredClients = level.targetClientCount;
    const connectionPoints = 30;
    score += Math.min(connectedClients.length / requiredClients, 1) * connectionPoints;
    findings.push({
      ok: connectedClients.length >= requiredClients,
      text: connectedClients.length >= requiredClients
        ? `Internett når ${connectedClients.length} klientenheter.`
        : `Internett når bare ${connectedClients.length} av ${requiredClients} nødvendige klientenheter.`
    });

    const routerPath = router ? shortestPath(router.id, parent) : null;
    const connectedToRouter = Boolean(routerPath && routerPath.includes("internet"));
    if (connectedToRouter) score += 5;
    findings.push({
      ok: connectedToRouter,
      text: connectedToRouter
        ? "Ruteren har en vei til internett, direkte eller via brannmuren."
        : "Koble ruteren til nettverket slik at det finnes en vei til internett, direkte eller via brannmuren."
    });
    if (firewallOrderIssue) {
      findings.push({
        ok: false,
        warning: true,
        text: "Brannmuren er ikke plassert mellom Internett og ruteren. Nettverket kan fortsatt fungere, men dette gir 15 poeng trekk. Anbefalt rekkefølge: Internett → brannmur → ruter → switch."
      });
    }

    const usesBothSwitches = currentLevel !== 2 || switchesUsedByClients.size >= 2;
    const designPoints = 25;
    const designCoverage = usesBothSwitches && !criticalErrors.length ? Math.min(topologyClients.length / requiredClients, 1) : 0;
    score += designCoverage * designPoints;
    const topologyAdvice = currentLevel === 0
      ? firewallPresent
        ? "Koble Internett → brannmur → ruter → switch, og PC-ene direkte til switchen."
        : "Koble Internett → ruter → switch, og PC-ene direkte til switchen."
      : currentLevel === 2
        ? "Koble Internett → brannmur → ruter → switch. Koble switchene sammen; serveren og én arbeidsstasjon skal bruke serverrommets switch, og den andre arbeidsstasjonen og aksesspunktet redigeringsrommets switch."
        : "Koble Internett → brannmur → ruter → switch, og unngå å bruke klienter som mellomledd.";
    findings.push({
      ok: topologyClients.length >= requiredClients && usesBothSwitches,
      text: !usesBothSwitches
        ? "Koble begge switchene inn i nettverket og la dem føre trafikk videre."
        : topologyClients.length >= requiredClients
          ? "Klientene bruker nettverkskomponentene på en hensiktsmessig måte."
            : `Sjekk kablingen: ${topologyClients.length} av ${requiredClients} klienter bruker riktig vei. ${topologyAdvice}`
    });

    const requiredComponentsPresent = level.required.every(requirement =>
      nodes.filter(node => node.kind === requirement.kind).length >= requirement.count
    );
    const requiredClientConnectionsPresent = level.required.every(requirement =>
      !components[requirement.kind].client ||
      topologyClients.filter(node => node.kind === requirement.kind).length >= requirement.count
    );
    const topologyComplete = topologyClients.length >= requiredClients && usesBothSwitches;
    // Kritiske topologifeil og feil brannmurrekkefølge trekkes separat fra delpoengene.
    const criticalPenalty = criticalErrors.length ? 35 : 0;
    const firewallPenalty = firewallOrderIssue ? 15 : 0;
    const finalScore = Math.max(0, Math.min(100, Math.round(score - criticalPenalty - firewallPenalty)));
    const passed = finalScore >= 80 && !criticalErrors.length && requiredComponentsPresent &&
      requiredClientConnectionsPresent && topologyComplete;
    showEvaluation(finalScore, passed, criticalErrors, findings);
  }

  function evaluateVlanNetwork() {
    const level = activeLevel();
    const findings = [];
    const nodeById = new Map(nodes.map(node => [node.id, node]));
    let score = 0;
    const componentPoints = level.internetRequired ? 15 : 30;
    const requirementPoints = componentPoints / level.required.length;
    let requiredComponentsPresent = true;

    level.required.forEach(requirement => {
      const placed = nodes.filter(node => node.kind === requirement.kind);
      const enough = placed.length >= requirement.count;
      requiredComponentsPresent = requiredComponentsPresent && enough;
      score += Math.min(placed.length / requirement.count, 1) * requirementPoints;
      findings.push({
        ok: enough,
        text: enough
          ? `${requirement.label} (${placed.length} valgt)`
          : `${requirement.label} Nå: ${placed.length}, trenger ${requirement.count}.`
      });
    });

    const requiredClientCount = level.required
      .filter(requirement => components[requirement.kind].client)
      .reduce((sum, requirement) => sum + requirement.count, 0);
    const clientNodes = nodes.filter(node => components[node.kind].client);
    let correctlyAssignedCount = 0;
    level.required.filter(requirement => components[requirement.kind].client).forEach(requirement => {
      const requiredNodes = nodes.filter(node => node.kind === requirement.kind).slice(0, requirement.count);
      correctlyAssignedCount += requiredNodes.filter(node => node.vlanId === level.vlanAssignments[node.kind]).length;
    });
    const allClientAssignmentsCorrect = correctlyAssignedCount >= requiredClientCount &&
      clientNodes.every(node => level.vlanAssignments[node.kind] === node.vlanId);
    const vlanAssignmentPoints = level.internetRequired ? 15 : 20;
    score += requiredClientCount ? correctlyAssignedCount / requiredClientCount * vlanAssignmentPoints : 0;
    findings.push({
      ok: allClientAssignmentsCorrect,
      text: allClientAssignmentsCorrect
        ? "Alle klientene er plassert i riktig VLAN."
        : `${correctlyAssignedCount} av ${requiredClientCount} klienter er plassert i riktig VLAN. Velg VLAN på hver enhet.`
    });

    const accessPointsCorrect = level.required
      .filter(requirement => components[requirement.kind].client)
      .every(requirement => nodes.filter(node => node.kind === requirement.kind).slice(0, requirement.count).every(node => {
        const peerKind = level.accessByKind[node.kind];
        const attachedLinks = connections.filter(edge => edge.a === node.id || edge.b === node.id);
        return attachedLinks.length === 1 && attachedLinks.some(edge => {
          const peerId = edge.a === node.id ? edge.b : edge.a;
          return edge.mode === "access" && nodeById.get(peerId)?.kind === peerKind;
        });
      }));
    const accessPoints = 10;
    if (accessPointsCorrect) score += accessPoints;
    findings.push({
      ok: accessPointsCorrect,
      text: accessPointsCorrect
        ? "Klientene er koblet til riktig switch eller aksesspunkt med access-porter."
        : "Koble hver klient til riktig switch eller aksesspunkt med én access-forbindelse."
    });

    const trunkChecks = level.requiredTrunks.map(([firstKind, secondKind]) =>
      connections.some(edge => {
        const first = nodeById.get(edge.a);
        const second = nodeById.get(edge.b);
        return edge.mode === "trunk" &&
          level.vlans.every(vlan => (edge.allowedVlans || []).includes(vlan.id)) &&
          ((first?.kind === firstKind && second?.kind === secondKind) ||
            (first?.kind === secondKind && second?.kind === firstKind));
      })
    );
    const allRequiredTrunksCorrect = trunkChecks.every(Boolean);
    const trunkPoints = 20;
    score += trunkChecks.length ? trunkChecks.filter(Boolean).length / trunkChecks.length * trunkPoints : 0;
    findings.push({
      ok: allRequiredTrunksCorrect,
      text: allRequiredTrunksCorrect
        ? "Alle nødvendige trunk-lenker er konfigurert."
        : `${trunkChecks.filter(Boolean).length} av ${trunkChecks.length} nødvendige lenker er trunk. Velg kabelen og endre lenketypen til trunk.`
    });

    const peerChecks = level.vlanPeerGroups.map(group => {
      const groupNodes = nodes.filter(node =>
        group.kinds.includes(node.kind) && node.vlanId === group.vlanId
      );
      if (groupNodes.length < 2) return false;
      for (let firstIndex = 0; firstIndex < groupNodes.length; firstIndex += 1) {
        for (let secondIndex = firstIndex + 1; secondIndex < groupNodes.length; secondIndex += 1) {
          const path = vlanPath(groupNodes[firstIndex].id, groupNodes[secondIndex].id, group.vlanId);
          if (!path) return false;
          const switchesOnPath = new Set(path.filter(id => nodeById.get(id)?.kind === "switch"));
          if (group.crossSwitch && switchesOnPath.size < 2) return false;
        }
      }
      return true;
    });
    const allVlanPeersConnected = peerChecks.every(Boolean);
    const peerPoints = level.internetRequired ? 10 : 20;
    score += peerChecks.length ? peerChecks.filter(Boolean).length / peerChecks.length * peerPoints : 0;
    findings.push({
      ok: allVlanPeersConnected,
      text: allVlanPeersConnected
        ? "Enheter i samme VLAN kan kommunisere over nettverket."
        : "Sjekk VLAN-tilordningene og trunkene. Enheter i samme VLAN skal kunne kommunisere, også på tvers av switchene."
    });

    let allInternetPathsCorrect = true;
    let internetPathCount = 0;
    const firewallOrderPaths = [];
    if (level.internetRequired) {
      clientNodes.forEach(node => {
        const path = node.vlanId === null ? null : vlanPath("internet", node.id, node.vlanId);
        if (!path) {
          allInternetPathsCorrect = false;
          return;
        }
        internetPathCount += 1;
        const pathKinds = path.map(id => id === "internet" ? "internet" : nodeById.get(id)?.kind);
        const firewallIndex = pathKinds.indexOf("firewall");
        const routerIndex = pathKinds.indexOf("router");
        const switchIndex = pathKinds.indexOf("switch");
        if (firewallIndex !== 1 || routerIndex !== 2 || switchIndex !== 3) {
          firewallOrderPaths.push(path);
        }
      });
      const internetPoints = level.accessPolicies ? 20 : 30;
      score += clientNodes.length ? internetPathCount / clientNodes.length * internetPoints : 0;
      findings.push({
        ok: allInternetPathsCorrect && clientNodes.length >= requiredClientCount,
        text: allInternetPathsCorrect && clientNodes.length >= requiredClientCount
          ? `Alle ${clientNodes.length} klientene har tilgang til Internett via VLAN-trunkene.`
          : `${internetPathCount} av ${requiredClientCount} klienter har en fungerende VLAN-vei til Internett.`
      });
    }

    const router = nodes.find(node => node.kind === "router");
    const guestPolicyCorrect = !level.accessPolicies || Boolean(router?.blockGuestToStaff);
    const iotPolicyCorrect = !level.accessPolicies || Boolean(router?.blockIotToStaff);
    let policyPoints = 0;
    if (level.accessPolicies) {
      if (guestPolicyCorrect) policyPoints += 5;
      if (iotPolicyCorrect) policyPoints += 5;
      findings.push({
        ok: guestPolicyCorrect,
        text: guestPolicyCorrect
          ? `Gjeste-VLAN-et er blokkert fra ${level.protectedNetworkLabel || "ansattnettverket"}.`
          : `Velg ruteren og blokker trafikk fra gjeste-VLAN til ${level.protectedNetworkLabel || "ansattnettverket"}.`
      });
      findings.push({
        ok: iotPolicyCorrect,
        text: iotPolicyCorrect
          ? `IoT-VLAN-et er blokkert fra ${level.protectedNetworkLabel || "ansattnettverket"}.`
          : `Velg ruteren og blokker trafikk fra IoT-VLAN til ${level.protectedNetworkLabel || "ansattnettverket"}.`
      });
    }
    score += policyPoints;

    const { parent } = reachableNodes();
    const internetClients = nodes.filter(node => components[node.kind].client && parent.has(node.id));
    const clientsBypassingRouter = router
      ? internetClients.filter(node => !shortestPath(node.id, parent).includes(router.id))
      : [];
    const criticalErrors = [];
    if (clientsBypassingRouter.length) {
      const target = components[clientsBypassingRouter[0].kind].label;
      criticalErrors.push(`Trafikken til ${target} går utenom ruteren. Ruteren må ha en WAN-forbindelse mot Internett eller brannmuren og en LAN-forbindelse mot switchen.`);
    }

    const firewallOrderIssue = firewallOrderPaths.length > 0;
    if (firewallOrderIssue) {
      findings.push({
        ok: false,
        warning: true,
        text: "Brannmuren står ikke mellom Internett og ruteren. Dette gir 15 poeng trekk. Anbefalt rekkefølge: Internett → brannmur → ruter → switch."
      });
    }
    const firewallPenalty = firewallOrderIssue ? 15 : 0;
    const finalScore = Math.max(0, Math.min(100, Math.round(score - firewallPenalty - (criticalErrors.length ? 35 : 0))));
    const allRequiredDevicesConnected = level.required
      .filter(requirement => components[requirement.kind].client)
      .every(requirement =>
        nodes.filter(node => node.kind === requirement.kind && node.vlanId === level.vlanAssignments[requirement.kind]).length >= requirement.count
      );
    const passed = finalScore >= 80 && !criticalErrors.length && requiredComponentsPresent &&
      allClientAssignmentsCorrect && accessPointsCorrect && allRequiredTrunksCorrect &&
      allVlanPeersConnected && allRequiredDevicesConnected &&
      allInternetPathsCorrect && (!level.accessPolicies || guestPolicyCorrect && iotPolicyCorrect);
    showEvaluation(finalScore, passed, criticalErrors, findings);
  }

  function showEvaluation(finalScore, passed, criticalErrors, findings) {
    const missing = findings.filter(item => !item.ok).length;
    const grade = criticalErrors.length
      ? "Kritisk feil"
      : passed
        ? finalScore >= 95 ? "Strålende nettverk!" : "Godt jobbet!"
        : finalScore >= 80 ? "Nesten i mål!" : finalScore >= 55 ? "Du er på god vei!" : "Prøv én gang til!";
    document.querySelector("#score-badge").textContent = String(finalScore);
    document.querySelector("#score-badge").classList.toggle("needs-work", !passed);
    document.querySelector("#feedback-title").textContent = grade;
    document.querySelector("#feedback-summary").textContent = criticalErrors.length
      ? "Oppsettet har en kritisk feil og kan ikke bestå. Rett feilen før du tester på nytt."
      : passed
        ? `Oppsettet ditt løser oppgaven. ${missing ? "Se forbedringsforslagene nedenfor for å gjøre det enda bedre." : "Alle målene er nådd."}`
        : `Du har ${finalScore} av 100 poeng. ${missing ? `${missing} mål gjenstår — prøv å endre oppsettet og test igjen.` : "Legg til de manglende enhetene for å nå målet."}`;
    const feedbackItems = [
      ...criticalErrors.map(text => ({ critical: true, ok: false, text })),
      ...findings
    ];
    document.querySelector("#feedback-list").innerHTML = feedbackItems.map(item => `<li><span class="${item.critical ? "critical-icon" : item.warning ? "warning-icon" : item.ok ? "check-icon" : "cross-icon"}" aria-hidden="true">${item.critical ? "!" : item.warning ? "−" : item.ok ? "✓" : "○"}</span><span>${item.text}</span></li>`).join("");
    feedback.hidden = false;
    if (passed && !awardedLevels.has(currentLevel)) {
      awardedLevels.add(currentLevel);
      localStorage.setItem("nettverksskolen-bestatt", JSON.stringify([...awardedLevels]));
      updateLevelContent();
      render();
    }
    announce(`Vurdering: ${finalScore} av 100 poeng. ${grade}`);
  }

  function shortestPath(targetId, parent) {
    if (!parent.has(targetId)) return null;
    const path = [];
    let current = targetId;
    while (current !== null) {
      path.push(current);
      current = parent.get(current);
    }
    return path.reverse();
  }

  function startSimulation() {
    if (activeLevel().vlans) {
      startVlanSimulation();
      return;
    }
    const { parent } = reachableNodes();
    const targets = nodes.filter(node => components[node.kind].client && parent.has(node.id));
    if (!targets.length) {
      announce("Ingen enheter har forbindelse til internett ennå. Koble nettverket først.");
      const hint = document.querySelector("#connection-hint");
      hint.textContent = "Koble en enhet til internett for å starte";
      setTimeout(() => {
        if (!isSimulating) {
          hint.textContent = wireSourceId === "internet"
            ? "Internett valgt · velg brannmur eller ruter"
            : wireSourceId
              ? "Velg en annen enhet for å fullføre kabelen"
              : "Velg en enhet eller Internett · klikk en kabel for å fjerne den";
        }
      }, 2500);
      return;
    }
    const routes = targets.map(target => shortestPath(target.id, parent)).filter(Boolean);
    animateTraffic(routes, `Datatrafikk simulert gjennom nettverket til ${targets.length} enheter.`);
  }

  function vlanSimulationPlan() {
    const level = activeLevel();
    const routes = [];
    let blockedFlows = 0;
    if (level.internetRequired) {
      nodes.filter(node => components[node.kind].client).forEach(node => {
        const route = node.vlanId === null ? null : vlanPath("internet", node.id, node.vlanId);
        if (route) routes.push(route);
        else blockedFlows += 1;
      });
    }

    const peerGroups = sandboxMode
      ? [...new Set(nodes.filter(node => components[node.kind]?.client && node.vlanId !== null).map(node => node.vlanId))]
        .map(vlanId => ({
          vlanId,
          kinds: [...new Set(nodes.filter(node => node.vlanId === vlanId && components[node.kind]?.client).map(node => node.kind))]
        }))
      : level.vlanPeerGroups;
    peerGroups.forEach(group => {
      const peers = nodes.filter(node => group.kinds.includes(node.kind) && node.vlanId === group.vlanId);
      for (let index = 1; index < peers.length; index += 1) {
        const route = vlanPath(peers[0].id, peers[index].id, group.vlanId);
        if (route) routes.push(route);
        else blockedFlows += 1;
      }
    });

    // Trafikk mellom VLAN modelleres via ruteren; tilgangsreglene kan stoppe slike forbindelser.
    if (level.accessPolicies) {
      const router = nodes.find(node => node.kind === "router");
      const staff = nodes.filter(node => [10].includes(node.vlanId) && components[node.kind].client);
      const restricted = nodes.filter(node => [20, 30].includes(node.vlanId) && components[node.kind].client);
      restricted.forEach(source => {
        staff.forEach(target => {
          const blocked = source.vlanId === 20 ? router?.blockGuestToStaff : router?.blockIotToStaff;
          if (blocked) {
            blockedFlows += 1;
            return;
          }
          const outbound = router ? vlanPath(source.id, router.id, source.vlanId) : null;
          const inbound = router ? vlanPath(router.id, target.id, target.vlanId) : null;
          if (outbound && inbound) routes.push([...outbound, ...inbound.slice(1)]);
          else blockedFlows += 1;
        });
      });
    } else if (level.isolateVlans) {
      const router = nodes.find(node => node.kind === "router");
      const clients = nodes.filter(node => node.vlanId !== null && components[node.kind].client);
      for (let firstIndex = 0; firstIndex < clients.length; firstIndex += 1) {
        for (let secondIndex = firstIndex + 1; secondIndex < clients.length; secondIndex += 1) {
          const first = clients[firstIndex];
          const second = clients[secondIndex];
          if (first.vlanId === second.vlanId) continue;
          const firstRoute = router ? vlanPath(first.id, router.id, first.vlanId) : null;
          const secondRoute = router ? vlanPath(router.id, second.id, second.vlanId) : null;
          if (firstRoute && secondRoute) blockedFlows += 1;
        }
      }
    }

    return { routes, blockedFlows };
  }

  function startVlanSimulation() {
    const level = activeLevel();
    const { routes, blockedFlows } = vlanSimulationPlan();
    if (!routes.length) {
      const message = `Ingen trafikkrute kom fram. Koble en klient til Internett eller koble sammen minst to klienter i samme VLAN. Kontroller også VLAN-tilordninger og trunker.${blockedFlows ? ` ${blockedFlows} forbindelser ble blokkert.` : ""}`;
      announce(message);
      if (sandboxMode) showBoardStatus(message, true);
      return;
    }
    const message = sandboxMode
      ? `Trafikk simulert gjennom sandkassen. ${blockedFlows} forbindelser ble blokkert eller mangler en gyldig VLAN-vei.`
      : level.accessPolicies
      ? `VLAN-trafikk simulert. ${blockedFlows} forbindelser mellom VLAN ble blokkert av regler eller manglende trunk.`
      : level.isolateVlans
        ? `Internett- og VLAN-trafikk simulert. ${blockedFlows} forbindelser mellom ulike VLAN er isolert eller blokkert av manglende trunk.`
        : `Trafikk simulert innenfor samme VLAN. ${blockedFlows} forbindelser ble blokkert av VLAN-skille eller manglende trunk.`;
    animateTraffic(routes, message);
    if (sandboxMode) showBoardStatus(message);
  }

  function animateTraffic(routes, message) {
    isSimulating = true;
    const button = document.querySelector("#simulate-button");
    button.classList.add("running");
    button.querySelector("span").textContent = "Stopp simulering";

    routes.forEach((route, targetIndex) => {
      if (!route || route.length < 2) return;
      route.slice(0, -1).forEach((from, edgeIndex) => {
        const to = route[edgeIndex + 1];
        const connectionIndex = connections.findIndex(edge => (edge.a === from && edge.b === to) || (edge.a === to && edge.b === from));
        const path = connectionsSvg.querySelector(`#connection-${connectionIndex}`);
        if (!path) return;
        const packet = document.createElementNS(SVG_NS, "circle");
        packet.setAttribute("r", sandboxMode ? "6" : "4");
        packet.setAttribute("class", "packet");
        if (sandboxMode) {
          packet.setAttribute("stroke", "#fffefa");
          packet.setAttribute("stroke-width", "2");
        }
        const motion = document.createElementNS(SVG_NS, "animateMotion");
        motion.setAttribute("dur", `${1.2 + targetIndex * .18}s`);
        motion.setAttribute("repeatCount", "indefinite");
        motion.setAttribute("begin", `${(targetIndex * .2 + edgeIndex * .1).toFixed(2)}s`);
        motion.setAttribute("rotate", "auto");
        const mpath = document.createElementNS(SVG_NS, "mpath");
        mpath.setAttribute("href", `#connection-${connectionIndex}`);
        const edge = connections[connectionIndex];
        if (edge.a !== from) motion.setAttribute("keyPoints", "1;0");
        if (edge.a !== from) motion.setAttribute("keyTimes", "0;1");
        if (edge.a !== from) motion.setAttribute("calcMode", "linear");
        motion.appendChild(mpath);
        packet.appendChild(motion);
        connectionsSvg.appendChild(packet);
      });
    });
    announce(message);
  }

  function stopSimulation() {
    isSimulating = false;
    connectionsSvg.querySelectorAll(".packet").forEach(packet => packet.remove());
    const button = document.querySelector("#simulate-button");
    if (button) {
      button.classList.remove("running");
      button.querySelector("span").textContent = "Simuler trafikk";
    }
  }

  const exportIconCache = new Map();

  function getCanvasIcon(kind) {
    if (!exportIconCache.has(kind)) {
      const svg = iconMarkup(kind)
        .replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ')
        .replace(/currentColor/g, "#75927a");
      const source = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
      exportIconCache.set(kind, new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`Kunne ikke tegne ikonet for ${components[kind].label}.`));
        image.src = source;
      }));
    }
    return exportIconCache.get(kind);
  }

  function relativeBounds(element, boardBounds) {
    const bounds = element.getBoundingClientRect();
    return {
      x: bounds.left - boardBounds.left,
      y: bounds.top - boardBounds.top,
      width: bounds.width,
      height: bounds.height
    };
  }

  function roundedRect(context, x, y, width, height, radius) {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.arcTo(x + width, y, x + width, y + height, radius);
    context.arcTo(x + width, y + height, x, y + height, radius);
    context.arcTo(x, y + height, x, y, radius);
    context.arcTo(x, y, x + width, y, radius);
    context.closePath();
  }

  function routeSegments(routes, edgePoints) {
    return routes.map(route => {
      const segments = [];
      for (let index = 0; index < route.length - 1; index += 1) {
        const from = route[index];
        const to = route[index + 1];
        const edgeIndex = connections.findIndex(edge =>
          (edge.a === from && edge.b === to) || (edge.a === to && edge.b === from)
        );
        const points = edgePoints.get(edgeIndex);
        if (!points) continue;
        segments.push(connections[edgeIndex].a === from
          ? { start: points.start, end: points.end }
          : { start: points.end, end: points.start });
      }
      return segments;
    }).filter(segments => segments.length);
  }

  function packetLocations(routes, edgePoints, frame, frameCount) {
    // Bevegelsen fordeles etter samlet rutelengde, slik at datapakken ikke starter på nytt ved hver kabel.
    return routeSegments(routes, edgePoints).map((segments, routeIndex) => {
      const lengths = segments.map(segment => Math.hypot(
        segment.end.x - segment.start.x,
        segment.end.y - segment.start.y
      ));
      const totalLength = lengths.reduce((sum, length) => sum + length, 0);
      let distance = ((frame / frameCount + routeIndex * 0.19) % 1) * totalLength;
      for (let index = 0; index < segments.length; index += 1) {
        const segment = segments[index];
        const length = lengths[index];
        if (distance <= length || index === segments.length - 1) {
          const progress = length ? Math.min(1, distance / length) : 0;
          return {
            x: segment.start.x + (segment.end.x - segment.start.x) * progress,
            y: segment.start.y + (segment.end.y - segment.start.y) * progress
          };
        }
        distance -= length;
      }
      return null;
    }).filter(Boolean);
  }

  async function createNetworkCanvas(maxWidth, maxHeight, routes, frame, frameCount) {
    const boardBounds = board.getBoundingClientRect();
    if (!boardBounds.width || !boardBounds.height) throw new Error("Nettverkskartet er ikke synlig.");
    const scale = Math.min(2, maxWidth / boardBounds.width, maxHeight / boardBounds.height);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(boardBounds.width * scale));
    canvas.height = Math.max(1, Math.round(boardBounds.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Nettleseren kunne ikke opprette et bilde av nettverkskartet.");
    context.scale(scale, scale);

    const iconImages = new Map(await Promise.all(nodes.map(async node => [node.id, await getCanvasIcon(node.kind)])));
    context.fillStyle = "#faf9f5";
    context.fillRect(0, 0, boardBounds.width, boardBounds.height);
    context.fillStyle = "#d8d7ce";
    for (let x = 10; x < boardBounds.width; x += 19) {
      for (let y = 10; y < boardBounds.height; y += 19) {
        context.beginPath();
        context.arc(x, y, 0.75, 0, Math.PI * 2);
        context.fill();
      }
    }
    context.fillStyle = "#eeede7";
    context.textAlign = "right";
    context.textBaseline = "bottom";
    context.font = "800 46px Arial, sans-serif";
    context.fillText("NETT", boardBounds.width - 22, boardBounds.height - 44);
    context.fillText("VERK.", boardBounds.width - 22, boardBounds.height - 22);

    const edgePoints = new Map();
    connectionsSvg.querySelectorAll(".connection-line").forEach(path => {
      const values = (path.getAttribute("d") || "").match(/[-+]?(?:\d*\.)?\d+(?:e[-+]?\d+)?/gi);
      if (!values || values.length < 4) return;
      const points = {
        start: { x: Number(values[0]), y: Number(values[1]) },
        end: { x: Number(values[2]), y: Number(values[3]) }
      };
      const index = Number(path.dataset.connectionIndex);
      edgePoints.set(index, points);
      const edge = connections[index];
      context.beginPath();
      context.moveTo(points.start.x, points.start.y);
      context.lineTo(points.end.x, points.end.y);
      context.strokeStyle = edge.mode === "trunk" ? "#75688f" : "#b7c3b4";
      context.lineWidth = edge.mode === "trunk" ? 3 : 2;
      context.setLineDash(edge.mode === "trunk" ? [7, 4] : []);
      context.stroke();
      context.setLineDash([]);
      [points.start, points.end].forEach(point => {
        context.beginPath();
        context.arc(point.x, point.y, 3, 0, Math.PI * 2);
        context.fillStyle = "#fffefa";
        context.fill();
        context.strokeStyle = "#91a58f";
        context.lineWidth = 1.5;
        context.stroke();
      });
      const label = edge.mode === "trunk"
        ? `TRUNK${edge.allowedVlans?.length ? ` · ${edge.allowedVlans.join(",")}` : ""}`
        : edge.vlanId ? `VLAN ${edge.vlanId}` : "";
      if (label) {
        const x = (points.start.x + points.end.x) / 2;
        const y = (points.start.y + points.end.y) / 2 - 5;
        context.font = "700 8px monospace";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.lineWidth = 4;
        context.strokeStyle = "#faf9f5";
        context.strokeText(label, x, y);
        context.fillStyle = "#6f6288";
        context.fillText(label, x, y);
      }
    });

    packetLocations(routes, edgePoints, frame, frameCount).forEach(point => {
      context.beginPath();
      context.arc(point.x, point.y, 4, 0, Math.PI * 2);
      context.fillStyle = "#de896a";
      context.shadowColor = "#de896a77";
      context.shadowBlur = 7;
      context.fill();
      context.shadowBlur = 0;
    });

    const internetIcon = board.querySelector(".internet-icon");
    if (!internetNode.hidden && internetIcon) {
      const iconBounds = relativeBounds(internetIcon, boardBounds);
      const centerX = iconBounds.x + iconBounds.width / 2;
      const centerY = iconBounds.y + iconBounds.height / 2;
      context.beginPath();
      context.arc(centerX, centerY, 29, 0, Math.PI * 2);
      context.strokeStyle = "#e1e7de";
      context.lineWidth = 1;
      context.stroke();
      context.beginPath();
      context.arc(centerX, centerY, 24, 0, Math.PI * 2);
      context.fillStyle = "#f1f5ee";
      context.fill();
      context.strokeStyle = "#dfe5dc";
      context.stroke();
      context.beginPath();
      context.arc(centerX, centerY, 10.5, 0, Math.PI * 2);
      context.strokeStyle = "#75927a";
      context.lineWidth = 1.5;
      context.stroke();
      context.beginPath();
      context.ellipse(centerX, centerY, 5, 10.5, 0, 0, Math.PI * 2);
      context.moveTo(centerX - 10, centerY);
      context.lineTo(centerX + 10, centerY);
      context.stroke();
      const label = relativeBounds(board.querySelector(".internet-label"), boardBounds);
      context.font = "8px monospace";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = "#85877e";
      context.fillText("INTERNETT", label.x + label.width / 2, label.y + label.height / 2);
    }

    nodes.forEach(node => {
      const element = nodesLayer.querySelector(`.device[data-id="${node.id}"]`);
      if (!element) return;
      const box = relativeBounds(element, boardBounds);
      roundedRect(context, box.x, box.y, box.width, box.height, 8);
      context.fillStyle = "#fffefa";
      context.fill();
      context.strokeStyle = "#e5e3db";
      context.lineWidth = 1;
      context.stroke();

      const icon = relativeBounds(element.querySelector(".device-icon"), boardBounds);
      roundedRect(context, icon.x, icon.y, icon.width, icon.height, 7);
      context.fillStyle = "#e8eee7";
      context.fill();
      const image = iconImages.get(node.id);
      if (image) context.drawImage(image, icon.x + (icon.width - 22) / 2, icon.y + (icon.height - 22) / 2, 22, 22);

      const name = relativeBounds(element.querySelector(".device-name"), boardBounds);
      context.font = "600 10px Arial, sans-serif";
      context.fillStyle = "#3e433d";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(components[node.kind].label, name.x + name.width / 2, name.y + name.height / 2, name.width);

      const kindLabel = relativeBounds(element.querySelector(".device-kind-label"), boardBounds);
      context.font = "7px monospace";
      context.fillStyle = "#85877e";
      context.fillText(components[node.kind].short, kindLabel.x + kindLabel.width / 2, kindLabel.y + kindLabel.height / 2);
      if (node.vlanId) {
        const vlan = relativeBounds(element.querySelector(".device-vlan"), boardBounds);
        roundedRect(context, vlan.x, vlan.y, vlan.width, vlan.height, 4);
        context.fillStyle = "#e9edf5";
        context.fill();
        context.font = "7px monospace";
        context.fillStyle = "#596b8a";
        context.fillText(`VLAN ${node.vlanId}`, vlan.x + vlan.width / 2, vlan.y + vlan.height / 2);
      }
    });
    return canvas;
  }

  function simulationRoutes() {
    if (activeLevel().vlans) return vlanSimulationPlan().routes;
    const { parent } = reachableNodes();
    return nodes
      .filter(node => components[node.kind].client && parent.has(node.id))
      .map(node => shortestPath(node.id, parent))
      .filter(Boolean);
  }

  function canvasToBlob(canvas, type) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Nettleseren kunne ikke lagre bildefilen.")), type);
    });
  }

  function quantizeGifFrame(imageData) {
    const pixels = new Uint8Array(imageData.data.length / 4);
    for (let source = 0, target = 0; source < imageData.data.length; source += 4, target += 1) {
      pixels[target] = (imageData.data[source] & 0xe0) |
        ((imageData.data[source + 1] & 0xe0) >> 3) |
        (imageData.data[source + 2] >> 6);
    }
    return pixels;
  }

  function encodeGifLzw(pixels) {
    const clearCode = 256;
    const endCode = 257;
    const output = [];
    let bitBuffer = 0;
    let bitCount = 0;
    let codeSize = 9;
    let nextCode = 258;
    let dictionary = new Map();
    const writeCode = code => {
      bitBuffer |= code << bitCount;
      bitCount += codeSize;
      while (bitCount >= 8) {
        output.push(bitBuffer & 255);
        bitBuffer >>>= 8;
        bitCount -= 8;
      }
    };
    const resetDictionary = () => {
      dictionary = new Map();
      codeSize = 9;
      nextCode = 258;
    };

    // GIF bruker egne clear/end-koder; kodebredden vokser når den neste koden ikke lenger får plass.
    writeCode(clearCode);
    if (pixels.length) {
      let prefix = pixels[0];
      for (let index = 1; index < pixels.length; index += 1) {
        const symbol = pixels[index];
        const key = prefix * 256 + symbol;
        if (dictionary.has(key)) {
          prefix = dictionary.get(key);
          continue;
        }
        writeCode(prefix);
        if (nextCode < 4096) {
          dictionary.set(key, nextCode++);
          if (nextCode > (1 << codeSize) && codeSize < 12) codeSize += 1;
        } else {
          writeCode(clearCode);
          resetDictionary();
        }
        prefix = symbol;
      }
      writeCode(prefix);
    }
    writeCode(endCode);
    if (bitCount) output.push(bitBuffer & 255);
    return new Uint8Array(output);
  }

  function createGif(frames, width, height, delay) {
    const chunks = [];
    const bytes = values => chunks.push(new Uint8Array(values));
    const text = value => chunks.push(new TextEncoder().encode(value));
    bytes([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
    bytes([width & 255, width >> 8, height & 255, height >> 8, 0xf7, 0, 0]);
    for (let color = 0; color < 256; color += 1) {
      bytes([
        Math.round(((color >> 5) & 7) * 255 / 7),
        Math.round(((color >> 2) & 7) * 255 / 7),
        Math.round((color & 3) * 255 / 3)
      ]);
    }
    bytes([0x21, 0xff, 0x0b]);
    text("NETSCAPE2.0");
    bytes([0x03, 0x01, 0x00, 0x00, 0x00]);
    frames.forEach(frame => {
      bytes([0x21, 0xf9, 0x04, 0x00, delay & 255, delay >> 8, 0x00, 0x00]);
      bytes([0x2c, 0, 0, 0, 0, width & 255, width >> 8, height & 255, height >> 8, 0]);
      bytes([0x08]);
      const compressed = encodeGifLzw(frame);
      for (let offset = 0; offset < compressed.length; offset += 255) {
        const block = compressed.subarray(offset, Math.min(offset + 255, compressed.length));
        bytes([block.length]);
        chunks.push(block);
      }
      bytes([0]);
    });
    bytes([0x3b]);
    return new Blob(chunks, { type: "image/gif" });
  }

  async function verifyGif(blob, width, height, expectedFrames) {
    if (typeof ImageDecoder === "function") {
      const decoder = new ImageDecoder({ data: await blob.arrayBuffer(), type: "image/gif" });
      try {
        await decoder.tracks.ready;
        const track = decoder.tracks.selectedTrack;
        if (!track || track.frameCount !== expectedFrames) {
          throw new Error("GIF-filen inneholder ikke alle animasjonsbildene.");
        }
        for (let frameIndex = 0; frameIndex < track.frameCount; frameIndex += 1) {
          const { image } = await decoder.decode({ frameIndex });
          if (image.displayWidth !== width || image.displayHeight !== height) {
            image.close();
            throw new Error("GIF-filen har feil bildestørrelse.");
          }
          image.close();
        }
      } finally {
        decoder.close();
      }
      return;
    }

    // Eldre nettlesere mangler ImageDecoder; Image-elementet kan likevel bekrefte GIF-størrelsen.
    const url = URL.createObjectURL(blob);
    await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        URL.revokeObjectURL(url);
        if (image.naturalWidth !== width || image.naturalHeight !== height) {
          reject(new Error("Den animerte GIF-filen fikk feil bildestørrelse."));
        } else {
          resolve();
        }
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Nettleseren kunne ikke lese den animerte GIF-filen."));
      };
      image.src = url;
    });
  }

  function clearBoardStatus() {
    const status = document.querySelector("#board-status");
    const link = document.querySelector("#board-download-link");
    status.hidden = true;
    status.classList.remove("error");
    document.querySelector("#board-status-message").textContent = "";
    link.hidden = true;
    link.removeAttribute("href");
    link.removeAttribute("download");
    link.textContent = "";
    if (activeExportUrl) {
      const previousUrl = activeExportUrl;
      // Utsett opprydding litt, slik at en nettopp vist nedlastingslenke ikke mister Blob-en sin.
      setTimeout(() => URL.revokeObjectURL(previousUrl), 60000);
      activeExportUrl = null;
    }
  }

  function showBoardStatus(message, isError = false, download = null) {
    const status = document.querySelector("#board-status");
    const link = document.querySelector("#board-download-link");
    status.hidden = false;
    status.classList.toggle("error", isError);
    document.querySelector("#board-status-message").textContent = message;
    link.hidden = !download;
    if (activeExportUrl) {
      const previousUrl = activeExportUrl;
      setTimeout(() => URL.revokeObjectURL(previousUrl), 60000);
      activeExportUrl = null;
    }
    if (download) {
      activeExportUrl = URL.createObjectURL(download.blob);
      link.href = activeExportUrl;
      link.download = download.filename;
      link.textContent = download.label;
    } else {
      link.removeAttribute("href");
      link.removeAttribute("download");
      link.textContent = "";
    }
  }

  async function exportNetwork(format) {
    const pngButton = document.querySelector("#export-png-button");
    const gifButton = document.querySelector("#export-gif-button");
    const buttons = [pngButton, gifButton];
    buttons.forEach(button => { button.disabled = true; });
    clearBoardStatus();
    showBoardStatus(format === "png" ? "Lager nettverkskartet som PNG ..." : "Lager animert GIF med trafikksimulering ...");
    try {
      if (format === "png") {
        const canvas = await createNetworkCanvas(1800, 1200, [], 0, 1);
        const blob = await canvasToBlob(canvas, "image/png");
        const filename = "nettverk-sandkasse.png";
        showBoardStatus("PNG-bildet er klart. Klikk på lenken for å laste det ned.", false, {
          blob,
          filename,
          label: "Last ned PNG"
        });
        announce("PNG-bildet er klart for nedlasting.");
        return;
      }

      const routes = simulationRoutes();
      if (!routes.length) {
        const message = "Ingen trafikkrute å eksportere. Koble klienter til Internett eller til andre klienter i samme VLAN først.";
        showBoardStatus(message, true);
        announce(message);
        return;
      }
      const frameCount = 10;
      const frames = [];
      let gifWidth = 0;
      let gifHeight = 0;
      for (let frame = 0; frame < frameCount; frame += 1) {
        const canvas = await createNetworkCanvas(900, 600, routes, frame, frameCount);
        gifWidth = canvas.width;
        gifHeight = canvas.height;
        const context = canvas.getContext("2d");
        frames.push(quantizeGifFrame(context.getImageData(0, 0, canvas.width, canvas.height)));
      }
      const blob = createGif(frames, gifWidth, gifHeight, 12);
      await verifyGif(blob, gifWidth, gifHeight, frameCount);
      const filename = "nettverk-sandkasse-trafikk.gif";
      showBoardStatus("GIF-en er klar. Klikk på lenken for å laste ned animasjonen.", false, {
        blob,
        filename,
        label: "Last ned GIF"
      });
      announce("GIF-en er klar for nedlasting.");
    } catch (error) {
      showBoardStatus(`Eksporten mislyktes: ${error.message}`, true);
      announce(`Eksporten mislyktes: ${error.message}`);
    } finally {
      buttons.forEach(button => { button.disabled = false; });
    }
  }

  function announce(message) {
    statusMessage.textContent = "";
    requestAnimationFrame(() => { statusMessage.textContent = message; });
  }

  window.addEventListener("resize", drawConnections);
  loadLevel(0);
})();
