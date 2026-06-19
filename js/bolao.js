let participanteAtual = null;

function iniciar() {
  const participante = localStorage.getItem("participante");
  if (!participante) {
    window.location.href = "index.html";
    return;
  }
  participanteAtual = JSON.parse(participante);
  document.getElementById("usuarioNome").innerText = `Olá, ${participanteAtual.nome}`;
  carregarJogos();
}

function formatarData(dataISO) {
  return new Date(dataISO).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function jogoBloqueado(dataJogo) {
  return new Date() >= new Date(dataJogo);
}

async function carregarJogos() {
  const { data: jogos, error } = await supabaseClient.from("jogos").select("*").order("data_jogo", { ascending: true });
  if (error) {
    alert("Erro ao carregar jogos: " + error.message);
    return;
  }

  const { data: meusPalpites } = await supabaseClient.from("palpites").select("*").eq("participante_id", participanteAtual.id);

  const area = document.getElementById("jogos");
  area.innerHTML = "";

  jogos.forEach((jogo) => {
    const palpite = meusPalpites?.find((p) => p.jogo_id === jogo.id);
    const bloqueado = jogoBloqueado(jogo.data_jogo);

    area.innerHTML += `
      <article class="card">
        <div class="match">${jogo.time_a} x ${jogo.time_b}</div>
        <div class="meta">
          <div>${jogo.fase} - ${jogo.rodada}ª rodada</div>
          <div>📅 ${formatarData(jogo.data_jogo)}</div>
          <div>🏟 ${jogo.estadio || ""}</div>
          <div>📍 ${jogo.cidade || ""}</div>
        </div>
        <span class="status ${bloqueado ? "fechado" : "aberto"}">${bloqueado ? "Palpite encerrado" : "Aberto para palpites"}</span>
        <div class="placar">
          <input type="number" min="0" id="a-${jogo.id}" value="${palpite?.gols_a ?? ""}" ${bloqueado ? "disabled" : ""}>
          <strong>x</strong>
          <input type="number" min="0" id="b-${jogo.id}" value="${palpite?.gols_b ?? ""}" ${bloqueado ? "disabled" : ""}>
        </div>
        <button onclick="salvarPalpite(${jogo.id})" ${bloqueado ? "disabled" : ""}>${palpite ? "Atualizar palpite" : "Salvar palpite"}</button>
      </article>`;
  });
}

async function salvarPalpite(jogoId) {
  const golsA = document.getElementById(`a-${jogoId}`).value;
  const golsB = document.getElementById(`b-${jogoId}`).value;

  if (golsA === "" || golsB === "") {
    alert("Preencha os dois placares.");
    return;
  }

  const { data: jogo } = await supabaseClient
    .from("jogos")
    .select("*")
    .eq("id", jogoId)
    .single();

  if (new Date() >= new Date(jogo.data_jogo)) {
    alert("Palpites encerrados para esta partida.");
    carregarJogos();
    return;
  }

  const { error } = await supabaseClient.from("palpites").upsert(
    {
      participante_id: participanteAtual.id,
      jogo_id: jogoId,
      gols_a: Number(golsA),
      gols_b: Number(golsB),
    },
    { onConflict: "participante_id,jogo_id" }
  );

  if (error) {
    alert("Erro ao salvar: " + error.message);
    return;
  }

  alert("Palpite salvo!");
  carregarJogos();
}

function sair() {
  localStorage.removeItem("participante");
  window.location.href = "index.html";
}

iniciar();
