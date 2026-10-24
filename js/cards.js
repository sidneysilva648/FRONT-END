/* =========================================================
   cards.js — Criação dinâmica dos cards com o DOM
   Nenhum card existe no HTML: todos são montados aqui com
   document.createElement + appendChild/append.
   ========================================================= */

// Tradução dos tipos para português
const NOMES_TIPOS = {
  normal: "Normal", fire: "Fogo", water: "Água", grass: "Planta", electric: "Elétrico",
  ice: "Gelo", fighting: "Lutador", poison: "Venenoso", ground: "Terrestre", flying: "Voador",
  psychic: "Psíquico", bug: "Inseto", rock: "Pedra", ghost: "Fantasma", dragon: "Dragão",
  dark: "Sombrio", steel: "Aço", fairy: "Fada",
};

// Status exibidos no card (a API traz 6; mostramos os 4 mais conhecidos)
const STATUS_EXIBIDOS = {
  hp: "HP",
  attack: "Ataque",
  defense: "Defesa",
  speed: "Velocidade",
};
const STATUS_MAXIMO = 160; // referência para o tamanho da barra

/**
 * Atalho para criar um elemento com classe e texto.
 * Usa textContent (e não innerHTML) para nunca interpretar
 * como HTML um texto que veio da API.
 */
function criarElemento(tag, classe, texto) {
  const elemento = document.createElement(tag);
  if (classe) elemento.className = classe;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

/** Formata o número no padrão da Pokédex: 25 → "#025" */
function formatarNumero(id) {
  return `#${String(id).padStart(3, "0")}`;
}

/** "mr-mime" → "Mr Mime" */
function formatarNome(nome) {
  return nome
    .split("-")
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(" ");
}

/** Ícone de coração em SVG (precisa de createElementNS por ser SVG). */
function criarIconeCoracao() {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  const caminho = document.createElementNS(ns, "path");
  caminho.setAttribute(
    "d",
    "M12 20.6s-7.6-4.6-9.6-9.3C1 7.9 3.3 4.4 6.8 4.4c2.1 0 3.6 1.2 5.2 3.1 1.6-1.9 3.1-3.1 5.2-3.1 3.5 0 5.8 3.5 4.4 6.9-2 4.7-9.6 9.3-9.6 9.3z"
  );
  svg.appendChild(caminho);
  return svg;
}

/**
 * Monta o card completo de um Pokémon, seguindo o layout pedido:
 * nome no topo, coração (favorito) no canto, imagem e texto descritivo.
 */
function criarCard(pokemon, ehFavorito, aoAlternarFavorito) {
  const tipoPrincipal = pokemon.tipos[0];

  // <article class="card">
  const card = criarElemento("article", "card");
  card.style.setProperty("--cor-tipo", `var(--tipo-${tipoPrincipal})`);

  // Botão de favorito (coração)
  const botaoFavorito = criarElemento("button", "card__favorito");
  botaoFavorito.type = "button";
  botaoFavorito.setAttribute("aria-pressed", String(ehFavorito));
  botaoFavorito.setAttribute("aria-label", `Favoritar ${formatarNome(pokemon.nome)}`);
  botaoFavorito.appendChild(criarIconeCoracao());
  botaoFavorito.addEventListener("click", () => {
    const agoraFavorito = aoAlternarFavorito(pokemon.id);
    botaoFavorito.setAttribute("aria-pressed", String(agoraFavorito));
  });

  // Nome do personagem
  const titulo = criarElemento("h3", "card__nome", formatarNome(pokemon.nome));

  // Imagem
  const moldura = criarElemento("div", "card__imagem");
  const imagem = document.createElement("img");
  imagem.src = pokemon.imagem;
  imagem.alt = `Ilustração de ${formatarNome(pokemon.nome)}`;
  imagem.loading = "lazy";
  imagem.width = 240;
  imagem.height = 240;
  moldura.appendChild(imagem);

  // Número + tipos
  const linhaInfo = criarElemento("div", "card__info");
  linhaInfo.appendChild(criarElemento("span", "card__numero", formatarNumero(pokemon.id)));
  const listaTipos = criarElemento("ul", "card__tipos");
  pokemon.tipos.forEach((tipo) => {
    const etiqueta = criarElemento("li", "tipo", NOMES_TIPOS[tipo] || tipo);
    etiqueta.style.setProperty("--cor-tipo", `var(--tipo-${tipo})`);
    listaTipos.appendChild(etiqueta);
  });
  linhaInfo.appendChild(listaTipos);

  // Categoria e descrição da Pokédex
  const categoria = criarElemento("p", "card__categoria", pokemon.categoria.texto);
  const descricao = criarElemento("p", "card__descricao", pokemon.descricao.texto);
  if (pokemon.descricao.idioma && pokemon.descricao.idioma !== "pt-br") {
    descricao.lang = pokemon.descricao.idioma; // ajuda leitores de tela a pronunciar certo
  }

  // Status base em barras
  const listaStatus = criarElemento("dl", "card__status");
  pokemon.status
    .filter((s) => STATUS_EXIBIDOS[s.nome])
    .forEach((s) => {
      const linha = criarElemento("div", "status");
      const rotulo = criarElemento("dt", "status__nome", STATUS_EXIBIDOS[s.nome]);
      const valor = criarElemento("dd", "status__valor");
      const numero = criarElemento("span", "status__numero", String(s.valor));
      const barra = criarElemento("span", "status__barra");
      const preenchimento = criarElemento("span", "status__preenchimento");
      preenchimento.style.width = `${Math.min(100, (s.valor / STATUS_MAXIMO) * 100)}%`;
      barra.appendChild(preenchimento);
      valor.append(numero, barra);
      linha.append(rotulo, valor);
      listaStatus.appendChild(linha);
    });

  // Altura e peso
  const medidas = criarElemento(
    "p",
    "card__medidas",
    `Altura ${pokemon.altura.toLocaleString("pt-BR")} m  ·  Peso ${pokemon.peso.toLocaleString("pt-BR")} kg`
  );

  // Monta a árvore do card na ordem do layout
  card.append(botaoFavorito, titulo, moldura, linhaInfo, categoria, descricao, listaStatus, medidas);
  return card;
}

/** Card "fantasma" exibido enquanto os dados ainda estão chegando. */
function criarCardCarregando() {
  const card = criarElemento("div", "card card--carregando");
  card.setAttribute("aria-hidden", "true");
  card.append(
    criarElemento("span", "esqueleto esqueleto--titulo"),
    criarElemento("span", "esqueleto esqueleto--imagem"),
    criarElemento("span", "esqueleto esqueleto--linha"),
    criarElemento("span", "esqueleto esqueleto--linha"),
    criarElemento("span", "esqueleto esqueleto--linha curta")
  );
  return card;
}
