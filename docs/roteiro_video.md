# Roteiro do vídeo pitch — Pokédex Retrô (até 4 minutos)

**Antes de gravar**, deixe abertos:
- o site publicado no GitHub Pages, no Chrome;
- o VS Code com o projeto;
- o DevTools do Chrome (F12), já nas abas **Console** e **Network/Rede**.

Grave a tela com o OBS ou com Win + Alt + R e publique no YouTube como **não listado**.

| Tempo | Tela | O que mostrar e falar |
|---|---|---|
| 0:00–0:20 | Topo do site | "Olá, sou Sidney Albuquerque. Este é o Pokédex Retrô, um site em HTML, CSS e JavaScript puro que consome a PokéAPI e mostra os 493 Pokémon das quatro primeiras gerações, de 1996 a 2006. Escolhi Pokémon porque é um dos desenhos de maior sucesso dos anos 90 e 2000, e a PokéAPI é gratuita e não exige token." |
| 0:20–1:00 | Site funcionando | Clique em **Sortear outro** duas vezes ("cada clique faz uma nova requisição à API"). Role até a Pokédex e mostre os cards carregando. Pesquise "char" e depois filtre por tipo **Fantasma**. Marque um coração e ative **Só favoritos**. Clique em **Carregar mais**. "Os dados chegam em tempo real: busca, geração, tipo e favoritos." |
| 1:00–1:40 | DevTools → Network (filtro **Fetch/XHR**) | Recarregue a página. "Aqui estão as requisições do fetch: a lista de Pokémon, os tipos e, para cada card, /pokemon e /pokemon-species." Clique em uma requisição e abra **Preview/Resposta** para mostrar o JSON com name, types, stats e sprites. Na aba **Console**, mostre o log "PokéAPI: 493 Pokémon e 18 tipos recebidos". |
| 1:40–2:05 | VS Code: `index.html` | "No HTML não existe nenhum card. Só existe esta div vazia, grade-cards, que recebe os elementos do JavaScript." Mostre também o filtro e a ordem dos três scripts. |
| 2:05–2:45 | VS Code: `js/api.js` | Mostre `buscarJSON`: "o fetch envia a requisição, o then verifica se a resposta deu certo e converte com resposta.json(). Também guardo as respostas em cache, como pede a política de uso da API." Em seguida, mostre `buscarDetalhesPokemon`: "uso Promise.all para buscar dados e descrição em paralelo e devolver um objeto já pronto para o card." |
| 2:45–3:20 | VS Code: `js/cards.js` → `criarCard` | "Aqui o card é criado pelo JavaScript: document.createElement para o article, o h3 com o nome, a imagem, os tipos e as barras de status. Uso textContent por segurança e, no final, card.append monta tudo." Depois, em `app.js`, mostre `carregarProximaPagina`: "o card de carregamento é trocado pelo card real, e é aqui que ele entra na grade." |
| 3:20–3:40 | VS Code: `css/style.css` | Mostre rapidamente: as variáveis de cor dos tipos, o `grid-template-columns: repeat(auto-fill, minmax(250px, 1fr))` que deixa a grade responsiva e o filtro que deixa o sprite verde como no Game Boy. |
| 3:40–4:00 | DevTools → Elements | Abra a `div#grade-cards` e mostre os vários `<article class="card">` lá dentro. "Isto prova que os cards foram gerados dinamicamente: no arquivo HTML a div está vazia, mas no navegador ela tem os cards criados pelo JavaScript. Obrigado!" |
