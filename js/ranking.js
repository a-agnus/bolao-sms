function iniciarRanking() {
  const participante = localStorage.getItem("participante");
  if (!participante) {
    window.location.href = "index.html";
    return;
  }
  carregarRanking();
}

function calcularPontos(palpite, jogo) {
  if (jogo.gols_a_real === null || jogo.gols_b_real === null) return 0;
  if (palpite.gols_a === jogo.gols_a_real && palpite.gols_b === jogo.gols_b_real) return 10;
  const rPalpite = palpite.gols_a > palpite.gols_b ? "A" : palpite.gols_a < palpite.gols_b ? "B" : "E";
  const rReal = jogo.gols_a_real > jogo.gols_b_real ? "A" : jogo.gols_a_real < jogo.gols_b_real ? "B" : "E";
  return rPalpite === rReal ? 5 : 0;
}

async function carregarRanking() {
  const { data: perfis } = await supabaseClient.from("perfis").select("*");
  const { data: palpites, error } = await supabaseClient.from("palpites").select(`participante_id,gols_a,gols_b,jogos(id,gols_a_real,gols_b_real)`);
  if (error) { alert("Erro ao carregar ranking: " + error.message); return }

  const ranking = {};
  palpites.forEach(palpite => {
    const pontos = calcularPontos(palpite, palpite.jogos);
    if (!ranking[palpite.participante_id]) {
      const perfil = perfis?.find(p => p.id === palpite.participante_id);
      ranking[palpite.participante_id] = { nome: perfil?.nome || "Participante", pontos: 0 };
    }
    ranking[palpite.participante_id].pontos += pontos;
  });

  const lista = Object.values(ranking).sort((a,b) => b.pontos - a.pontos);
  const area = document.getElementById("ranking");
  if (lista.length === 0) { area.innerHTML = `<div class="card">Ainda não há palpites no ranking.</div>`; return }
  area.innerHTML = lista.map((item, index) => {
    const medalha = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index+1}º`;
    return `<article class="card ranking-item"><div class="posicao">${medalha}</div><div><h3>${item.nome}</h3><p>Total de pontos</p></div><div class="pontos">${item.pontos}</div></article>`
  }).join("");
}

function sair() { localStorage.removeItem("participante"); window.location.href = "index.html" }

iniciarRanking();
