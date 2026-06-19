async function cadastrar() {
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;
  const mensagem = document.getElementById("mensagem");

  if (!nome || !email || !senha) {
    mensagem.innerText = "Preencha nome, e-mail e senha.";
    return;
  }

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password: senha,
    options: {
      data: { nome }
    }
  });

  if (error) {
    mensagem.innerText = "Erro: " + error.message;
    return;
  }

  if (data.user) {
    await supabaseClient.from("perfis").upsert({
      id: data.user.id,
      nome,
      email
    });
  }

  mensagem.innerText = "Cadastro feito! Agora clique em Entrar.";
}

async function entrar() {
  const codigo = document.getElementById("codigo").value.trim().toUpperCase();
  const mensagem = document.getElementById("mensagem");

  if (!codigo) {
    mensagem.innerText = "Digite seu código de acesso.";
    return;
  }

  const { data, error } = await supabaseClient
    .from("participantes")
    .select("*")
    .eq("codigo", codigo)
    .single();

  if (error || !data) {
    mensagem.innerText = "Código inválido.";
    return;
  }

  localStorage.setItem("participante", JSON.stringify(data));
  window.location.href = "bolao.html";
}
