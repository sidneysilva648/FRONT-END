/* =========================================================
   app.js — Controle da página: filtros, paginação,
   favoritos e o Pokémon sorteado da tela do topo.
   ========================================================= */

const POR_PAGINA = 24;
const CHAVE_FAVORITOS = "pokedex-retro:favoritos";

// Referências aos elementos fixos do HTML
const grade = document.getElementById("grade-cards");
const campoBusca = document.getElementById("busca");
const filtroGeracao = document.getElementById("filtro-geracao");
const filtroTipo = document.getElementById("filtro-tipo");
const soFavoritos = document.getElementById("so-favoritos");
const contador = document.getElementById("contador");
const aviso = document.getElementById("aviso");
const botaoCarregar = document.getElementById("btn-carregar");
const lcd = document.getElementById("lcd");
const botaoSortear = document.getElementById("btn-sortear");

// Estado da aplicação
const estado = {
  todos: [],          // lista completa (nome + id) vinda da API
  filtrados: [],      // resultado depois dos filtros
  exibidos: 0,        // quantos cards já estão na tela
  idsDoTipo: null,    // Set com os ids do tipo escolhido
  favoritos: carregarFavoritos(),
  versao: 0,          // evita misturar resultados se o filtro mudar durante o carregamento
};

/* ---------- Favoritos (salvos no navegador) ---------- */

function carregarFavoritos() {
  try {
    return new Set(JSON.parse(localStorage.getItem(CHAVE_FAVORITOS)) || []);
  } catch {
    return new Set();
  }
}

function alternarFavorito(id) {
  if (estado.favoritos.has(id)) estado.favoritos.delete(id);
  else estado.favoritos.add(id);
  try {
    localStorage.setItem(CHAVE_FAVORITOS, JSON.stringify([...estado.favoritos]));
  } catch {
    /* navegação privada: favoritos valem só nesta visita */
  }
  if (soFavoritos.checked) aplicarFiltros();
  return estado.favoritos.has(id);
}

/* ---------- Filtros ---------- */

function aplicarFiltros() {
  const termo = campoBusca.value.trim().toLowerCase().replace(/^#/, "");
  const geracao = GERACOES[filtroGeracao.value];

  estado.filtrados = estado.todos.filter((p) => {
    if (geracao && (p.id < geracao.inicio || p.id > geracao.fim)) return false;
    if (estado.idsDoTipo && !estado.idsDoTipo.has(p.id)) return false;
    if (soFavoritos.checked && !estado.favoritos.has(p.id)) return false;
    if (termo) {
      const porNumero = /^\d+$/.test(termo) && p.id === Number(termo);
      const porNome = p.nome.includes(termo);
      if (!porNumero && !porNome) return false;
    }
    return true;
  });

  // Recomeça a grade do zero
  estado.exibidos = 0;
  estado.versao++;
  grade.replaceChildren();
  aviso.hidden = true;
  atualizarContador();

  if (estado.filtrados.length === 0) {
    mostrarAviso(
      soFavoritos.checked && estado.favoritos.size === 0
        ? "Você ainda não tem favoritos. Toque no coração de um card para guardá-lo aqui."
        : "Nenhum Pokémon encontrado com esses filtros. Tente outro nome ou limpe os filtros."
    );
    botaoCarregar.hidden = true;
    return;
  }
  carregarProximaPagina();
}

function atualizarContador() {
  const total = estado.filtrados.length;
  contador.textContent =
    total === 1 ? "1 Pokémon encontrado" : `${total} Pokémon encontrados`;
}

function mostrarAviso(texto) {
  aviso.textContent = texto;
  aviso.hidden = false;
}

/* ---------- Carregamento dos cards ---------- */

async function carregarProximaPagina() {
  const versaoAtual = estado.versao;
  const lote = estado.filtrados.slice(estado.exibidos, estado.exibidos + POR_PAGINA);
  botaoCarregar.hidden = true;

  // 1) Mostra cards "fantasma" enquanto espera a API
  const fantasmas = lote.map(() => criarCardCarregando());
  grade.append(...fantasmas);

  // 2) Busca os detalhes de todos do lote em paralelo
  const resultados = await Promise.allSettled(lote.map((p) => buscarDetalhesPokemon(p.id)));

  // Se o usuário mudou o filtro no meio do caminho, descarta este lote
  if (versaoAtual !== estado.versao) return;

  // 3) Troca cada fantasma pelo card real, criado no cards.js
  let falhas = 0;
  resultados.forEach((resultado, i) => {
    if (resultado.status === "fulfilled") {
      const pokemon = resultado.value;
      const card = criarCard(pokemon, estado.favoritos.has(pokemon.id), alternarFavorito);
      fantasmas[i].replaceWith(card);
    } else {
      falhas++;
      fantasmas[i].remove();
    }
  });

  estado.exibidos += lote.length;
  botaoCarregar.hidden = estado.exibidos >= estado.filtrados.length;

  if (falhas > 0) {
    mostrarAviso(
      `${falhas} Pokémon não carregaram. Verifique sua conexão e use “Carregar mais” ou recarregue a página.`
    );
    botaoCarregar.hidden = false;
    estado.exibidos -= falhas; // permite tentar de novo
  }
}

/* ---------- Tela do topo: Pokémon sorteado ---------- */

async function sortearPokemon() {
  botaoSortear.disabled = true;
  const id = Math.floor(Math.random() * ULTIMO_POKEMON) + 1;
  try {
    const pokemon = await buscarDetalhesPokemon(id);
    const imagem = document.createElement("img");
    imagem.src = pokemon.sprite;
    imagem.alt = `Sprite de ${formatarNome(pokemon.nome)}`;
    imagem.className = "lcd__sprite";

    const nome = criarElemento("p", "lcd__nome", formatarNome(pokemon.nome));
    const numero = criarElemento("p", "lcd__numero", `${formatarNumero(pokemon.id)} ${pokemon.tipos.map((t) => NOMES_TIPOS[t]).join("/")}`);
    lcd.replaceChildren(imagem, nome, numero);
  } catch (erro) {
    console.error(erro);
    lcd.replaceChildren(criarElemento("p", "lcd__mensagem", "Sem sinal. Tente de novo."));
  } finally {
    botaoSortear.disabled = false;
  }
}

/* ---------- Inicialização ---------- */

async function iniciar() {
  sortearPokemon();

  try {
    const [lista, tipos] = await Promise.all([buscarListaPokemon(), buscarTipos()]);
    console.log(`PokéAPI: ${lista.length} Pokémon e ${tipos.length} tipos recebidos`, lista.slice(0, 3));
    estado.todos = lista;

    // Preenche o <select> de tipos com dados da API
    tipos
      .sort((a, b) => NOMES_TIPOS[a].localeCompare(NOMES_TIPOS[b], "pt-BR"))
      .forEach((tipo) => {
        const opcao = document.createElement("option");
        opcao.value = tipo;
        opcao.textContent = NOMES_TIPOS[tipo];
        filtroTipo.appendChild(opcao);
      });

    aplicarFiltros();
  } catch (erro) {
    console.error(erro);
    contador.textContent = "";
    mostrarAviso("Não foi possível conectar à PokéAPI. Verifique sua internet e recarregue a página.");
  }
}

// Eventos
let esperaDigitacao;
campoBusca.addEventListener("input", () => {
  clearTimeout(esperaDigitacao);
  esperaDigitacao = setTimeout(aplicarFiltros, 250); // espera o usuário parar de digitar
});
filtroGeracao.addEventListener("change", aplicarFiltros);
soFavoritos.addEventListener("change", aplicarFiltros);
filtroTipo.addEventListener("change", async () => {
  const tipo = filtroTipo.value;
  try {
    estado.idsDoTipo = tipo === "todos" ? null : await buscarIdsDoTipo(tipo);
    aplicarFiltros();
  } catch (erro) {
    console.error(erro);
    mostrarAviso("Não foi possível carregar esse tipo agora. Tente novamente.");
  }
});
botaoCarregar.addEventListener("click", carregarProximaPagina);
botaoSortear.addEventListener("click", sortearPokemon);

iniciar();
