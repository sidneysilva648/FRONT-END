# Pokédex Retrô

Site estático que consome a [PokéAPI](https://pokeapi.co/) e mostra os 493 Pokémon das quatro primeiras gerações (1996–2006) em cards criados dinamicamente com JavaScript.

> Trabalho da disciplina *Web Development Front-End* — UniFECAF.
> Autor: Sidney Albuquerque da Silva

**Site publicado:** https://sidneysilva648.github.io/front-end/
**Repositório:** https://github.com/sidneysilva648/front-end

## Tecnologias

- HTML5 e CSS3 puros (sem frameworks)
- JavaScript puro (`fetch`, `then`, `async/await`, `createElement`, `appendChild`, `append`)
- PokéAPI v2: gratuita, sem cadastro e sem token

## Funcionalidades

- Cards gerados 100% pelo JavaScript. O HTML tem apenas o container vazio `#grade-cards`.
- Cada card mostra nome, coração de favorito, imagem oficial, número, tipos, categoria, descrição da Pokédex, status base (HP, Ataque, Defesa, Velocidade), altura e peso.
- Busca por nome ou número, filtro por geração e por tipo (os tipos também vêm da API).
- Favoritos salvos no navegador (`localStorage`), com o filtro "Só favoritos".
- Paginação com o botão "Carregar mais" (24 por vez).
- Cards de carregamento enquanto a API responde, além de mensagens de erro e de lista vazia.
- Tela no estilo Game Boy com um Pokémon sorteado da API a cada clique.
- Layout responsivo, do celular ao desktop.

## Como executar

Basta abrir o `index.html` no navegador; não é preciso instalar nada. Também funciona com o Live Server do VS Code.

## Publicação

O site é publicado pelo GitHub Pages a partir da branch `main` (pasta raiz), em https://sidneysilva648.github.io/front-end/.

## Estrutura

```
front-end/
├── index.html      # estrutura da página (sem nenhum card fixo)
├── css/
│   └── style.css   # visual, cores dos tipos e responsividade
├── js/
│   ├── api.js      # requisições à PokéAPI (fetch + cache)
│   ├── cards.js    # criação dos cards com createElement/appendChild
│   └── app.js      # filtros, paginação, favoritos e inicialização
└── docs/
    ├── Pokedex_Retro_Parte_Teorica.pdf   # parte teórica
    ├── roteiro_video.md                  # roteiro do vídeo pitch
    └── captura-*.png                     # capturas de tela
```

## Endpoints usados

| Endpoint | Uso |
|---|---|
| `GET /pokemon?limit=493` | Lista de nomes e números |
| `GET /pokemon/{id}` | Imagem, tipos, status, altura e peso |
| `GET /pokemon-species/{id}` | Descrição da Pokédex e categoria |
| `GET /type` e `GET /type/{nome}` | Opções e resultado do filtro por tipo |

A PokéAPI não traz descrições em português, por isso o site mostra o texto em espanhol (ou em inglês, quando não houver espanhol).
