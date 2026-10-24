/* =========================================================
   api.js — Comunicação com a PokéAPI (https://pokeapi.co)
   Tudo que faz requisição HTTP fica neste arquivo.
   ========================================================= */

const API_BASE = "https://pokeapi.co/api/v2";

// Faixas de número de cada geração (Pokédex Nacional)
const GERACOES = {
  1: { inicio: 1,   fim: 151 },  // Kanto  - 1996
  2: { inicio: 152, fim: 251 },  // Johto  - 1999
  3: { inicio: 252, fim: 386 },  // Hoenn  - 2002
  4: { inicio: 387, fim: 493 },  // Sinnoh - 2006
};
const ULTIMO_POKEMON = 493;

// Cache em memória: a PokéAPI pede, na política de uso justo, que as respostas
// sejam guardadas localmente para não repetir a mesma requisição.
const cacheRequisicoes = new Map();

/**
 * Busca uma URL e devolve o JSON já convertido em objeto.
 * Usa fetch + then: fetch() devolve uma Promise com a resposta HTTP;
 * o primeiro then verifica o status e lê o corpo com resposta.json().
 */
function buscarJSON(url) {
  if (cacheRequisicoes.has(url)) {
    return cacheRequisicoes.get(url);
  }

  const promessa = fetch(url).then((resposta) => {
    if (!resposta.ok) {
      throw new Error(`A API respondeu com status ${resposta.status} para ${url}`);
    }
    return resposta.json();
  });

  cacheRequisicoes.set(url, promessa);
  promessa.catch(() => cacheRequisicoes.delete(url)); // se falhar, permite tentar de novo
  return promessa;
}

/** Lista resumida (nome + url) dos 493 Pokémon das gerações I a IV. */
function buscarListaPokemon() {
  return buscarJSON(`${API_BASE}/pokemon?limit=${ULTIMO_POKEMON}&offset=0`).then((dados) =>
    dados.results.map((item) => ({
      nome: item.name,
      id: extrairId(item.url),
    }))
  );
}

/** Lista dos tipos (fire, water...) para preencher o filtro. */
function buscarTipos() {
  return buscarJSON(`${API_BASE}/type?limit=50`).then((dados) =>
    dados.results
      .map((tipo) => tipo.name)
      .filter((nome) => NOMES_TIPOS[nome]) // ignora tipos especiais (unknown, shadow, stellar)
  );
}

/** Conjunto com os números de todos os Pokémon de um tipo. */
function buscarIdsDoTipo(tipo) {
  return buscarJSON(`${API_BASE}/type/${tipo}`).then(
    (dados) => new Set(dados.pokemon.map((p) => extrairId(p.pokemon.url)))
  );
}

/**
 * Dados completos de um Pokémon. Faz duas requisições em paralelo:
 *  - /pokemon/{id}          → nome, imagem, tipos, status, altura e peso
 *  - /pokemon-species/{id}  → descrição da Pokédex e categoria
 * e junta tudo em um único objeto simples, já pronto para o card.
 */
async function buscarDetalhesPokemon(id) {
  const [pokemon, especie] = await Promise.all([
    buscarJSON(`${API_BASE}/pokemon/${id}`),
    buscarJSON(`${API_BASE}/pokemon-species/${id}`),
  ]);

  return {
    id: pokemon.id,
    nome: pokemon.name,
    imagem:
      pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default,
    sprite: pokemon.sprites.front_default,
    tipos: pokemon.types.map((t) => t.type.name),
    altura: pokemon.height / 10, // API usa decímetros → metros
    peso: pokemon.weight / 10,   // API usa hectogramas → quilos
    status: pokemon.stats.map((s) => ({ nome: s.stat.name, valor: s.base_stat })),
    categoria: escolherIdioma(especie.genera, "genus"),
    descricao: limparTexto(escolherIdioma(especie.flavor_text_entries, "flavor_text")),
  };
}

/* ---------- funções auxiliares ---------- */

/** "https://pokeapi.co/api/v2/pokemon/25/" → 25 */
function extrairId(url) {
  return Number(url.split("/").filter(Boolean).pop());
}

/**
 * A PokéAPI não tem descrições em português.
 * Ordem de preferência: português → espanhol → inglês.
 */
function escolherIdioma(lista, campo) {
  const ordem = ["pt-br", "es", "es-419", "en"];
  for (const idioma of ordem) {
    const item = lista.find((entrada) => entrada.language.name === idioma);
    if (item) return { texto: item[campo], idioma };
  }
  return { texto: "", idioma: "" };
}

/** Os textos antigos de Game Boy vêm com quebras de linha e caracteres de controle. */
function limparTexto(entrada) {
  return { ...entrada, texto: entrada.texto.replace(/[\n\f\r­]+/g, " ").replace(/\s+/g, " ").trim() };
}
