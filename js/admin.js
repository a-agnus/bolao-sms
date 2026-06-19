const CODIGO_ADMIN = "PINHA947";
let adminLiberado = false;

function iniciarAdmin() {
  const codigo = prompt("Digite o código de administrador:");
  if (codigo !== CODIGO_ADMIN) {
    alert("Acesso negado.");
    window.location.href = "bolao.html";
    return;
  }
  adminLiberado = true;
  carregarAdminJogos();
}

function formatarData(dataISO){ return new Date(dataISO).toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short"}) }

async function carregarAdminJogos(){
  const { data: jogos, error } = await supabaseClient.from("jogos").select("*").order("data_jogo",{ascending:true});
  if(error){ alert("Erro ao carregar jogos: " + error.message); return }
  const area = document.getElementById("adminJogos");
  area.innerHTML = jogos.map(jogo=>`<article class="card"><div class="match">${jogo.time_a} x ${jogo.time_b}</div><div class="meta">📅 ${formatarData(jogo.data_jogo)}</div><label>Resultado real</label><div class="placar"><input type="number" min="0" id="real-a-${jogo.id}" value="${jogo.gols_a_real??""}"><strong>x</strong><input type="number" min="0" id="real-b-${jogo.id}" value="${jogo.gols_b_real??""}"></div><button onclick="salvarResultado(${jogo.id})">Salvar resultado</button></article>`).join("");
}

async function salvarResultado(jogoId){
  const golsA = document.getElementById(`real-a-${jogoId}`).value;
  const golsB = document.getElementById(`real-b-${jogoId}`).value;
  if(golsA===""||golsB===""){ alert("Preencha o resultado completo."); return }
  const { error } = await supabaseClient.from("jogos").update({gols_a_real:Number(golsA),gols_b_real:Number(golsB),encerrado:true}).eq("id",jogoId);
  if(error){ alert("Erro ao salvar resultado: " + error.message); return }
  alert("Resultado salvo!"); carregarAdminJogos();
}

function sair(){ localStorage.removeItem("participante"); window.location.href = "index.html" }

iniciarAdmin();
