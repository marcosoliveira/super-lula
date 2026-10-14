/* SUPER LULA — Reconstrução 2027
 * content.js: TODOS os textos de tela. Base: especificação v2 (13/10/2026); aberturas e comandos revisados na v1.1.
 * Não reescreva, não resuma, não invente. Tokens {PULO} {ACAO} {PAUSA} são trocados pelo motor
 * (Z / X / Esc no desktop, A / B / II no celular).
 * revisaoJuridica: true marca os itens com [REVISÃO JURÍDICA] na especificação.
 */
window.SL = window.SL || {};

SL.C = {
  selo: "Conteúdo produzido com IA",
  seloLongo: "Conteúdo produzido com inteligência artificial",
  disclaimer: "Paródia baseada em fatos reais. Fontes checadas e exibidas após cada fase.",

  rotate: {
    titulo: "Gire o celular para começar",
    texto: "O jogo é na horizontal, com os controles na tela.",
    rodape: "Paródia baseada em fatos reais. Fontes checadas e exibidas após cada fase."
  },

  abertura: {
    logoTopo: "SUPER",
    logo: "LULA",
    subtitulo: "WORLD",
    aperte: "Aperte {PULO} para começar",
    rodape: "Paródia baseada em fatos reais. Fontes checadas e exibidas após cada fase."
  },

  legenda: "Setas andam · Z pula · X ação da fase · Esc pausa · M som",

  mapa: {
    entrar: "Aperte {PULO} para entrar na fase",
    andar: "◄ ► para andar · VIDAS {N}"
  },

  missao: { etiqueta: "MISSÃO", continuar: "Aperte {PULO} para continuar ▶", rolar: "Aperte {PULO} para rolar ▼" },
  concluida: "FASE CONCLUÍDA!",
  resultado: { voltar: "Aperte {PULO} para voltar ao mapa" },
  pausa: { titulo: "PAUSA", linha: "Z continua · X volta ao mapa", linhaToque: "A continua · B volta ao mapa", som: "M som" },
  pular: "PULAR ▸▸",

  tropeco: {
    tentar: "Aperte {PULO} para tentar de novo",
    chefe: "Aperte {PULO} para voltar no chefão",
    buraco: { titulo: "Cuidado com o buraco!", linha: "Ainda tem muito buraco para tapar." }
  },
  povo: "O POVO TE LEVANTA. +13 VIDAS",

  picanha: "Hmmm, picanha!",
  normalidade: "O Brasil volta a ter cor!",
  bone: { tela: "Bandeira do Brasil: Lula usa de capa e ela protege de 1 golpe. Se perder, pegue de novo num bloco ?", pega: "BANDEIRA DO BRASIL!" },
  alckmin: {
    // fala real do debate da Band, 8/10/2006, quando Alckmin disputava a presidência contra Lula
    fala1: "Quanta mentira. Como o Lula mudou.",
    legenda: "16 anos depois",
    fala2: "Lula representa a própria democracia",
    fontes: ["cfAlckmin06", "globo22"]
  },

  /* ---------- Placar do Ato 1 (seção 5.6) ---------- */
  placarAto1: {
    titulo: "Com Bolsonaro e depois, com Lula",
    colunas: ["Indicador", "Com Bolsonaro", "Com Lula"],
    linhas: [
      ["Desemprego", "14,9% (2021)", "5,1% (fim de 2025)"],
      ["Extrema pobreza", "9,0% (2021)", "3,5% (2024)"],
      ["Mapa da Fome da ONU", "Dentro", "Fora (2025–26)"],
      ["Inflação no ano", "10,1% (2021)", "4,3% (2025)"],
      ["Salário mínimo real", "R$ 1.423 (2022)", "R$ 1.621 (2026)"],
      ["Desmatamento (km²)", "11.594 (2022)", "5.731 (2025)"]
    ],
    rodape: "Fontes: IBGE; FAO; Inpe; Ipeadata (valores de set/2026)",
    compartilhar: "Compartilhar",
    continuar: "Continuar"
  },

  /* ---------- Abertura do Ato 2 (seção 6.0) ---------- */
  condenacao: {
    revisaoJuridica: true,
    quadros: [
      "11/09/2025: o STF condena Jair Bolsonaro a 27 anos e 3 meses por tentativa de golpe de Estado.",
      "Inelegível desde 2023, por atacar as urnas sem provas.",
      "Janeiro de 2026: transferido para a Papudinha. Hoje cumpre prisão domiciliar.",
      "ATO 2 — BRASIL 2027"
    ],
    fontes: ["stfGolpe", "stfPena", "tse"]
  },

  /* ---------- Cartela de entrada do Ato 2 (depois da condenação, antes do mapa de 2027) ---------- */
  ato2Cartela: {
    tag: "ATO 2 · BRASIL 2027",
    titulo: "A névoa do retrocesso ameaça o país novamente",
    texto: "Ela cobre o mapa de 2027 e quer desfazer tudo o que foi reconstruído. Cada fase vencida afasta a névoa de uma região."
  },

  /* ---------- Urna (seção 6.10) ---------- */
  urna: {
    texto: "Reconstruiu o que estava quebrado. Desemprego no menor nível da série. Fora do Mapa da Fome. Agora tem um mapa inteiro pela frente. Em 25 de outubro, CONFIRMA.",
    confirma: "CONFIRMA",
    equipe: "Equipe: (a preencher)"
  },

  /* ---------- Fases ---------- */
  fases: [
    { // 0
      n: 0, nome: "O Tribunal do PowerPoint", ano: "PRÓLOGO", ato: 1,
      chefeNome: ["PROCURADOR DO POWERPOINT", "JUIZ SUSPEITO"],
      abertura: "Era uma vez um PowerPoint: um monte de setas apontando para o nome do Lula e nenhuma prova. E o juiz ainda combinava o jogo com a acusação. Missão: atravessar o tribunal e desmontar a armação, slide por slide.",
      comando: "{PULO} pula; segure {ACAO} para correr. No fim do tribunal, o projetor desce para carregar os slides: aproveite e pule nos 3 botões dele.",
      tropeco: ["Convicção não é prova!", "O slide acertou você, mas não provou nada."],
      final: "Fim da apresentação. O STF declarou Sergio Moro parcial e o processo caiu. Mensagens reveladas pelo Intercept mostraram o juiz orientando o procurador Deltan Dallagnol. O Comitê de Direitos Humanos da ONU concluiu que Lula não teve julgamento imparcial, e o ministro Dias Toffoli, do STF, disse que a prisão foi ‘armação’.",
      placar: null,
      fontes: ["stfMoro", "intercept", "globoToffoli", "onu"],
      revisaoJuridica: true,
      textoMotor: { carimbo: "JUIZ PARCIAL" }
    },
    { // 1
      n: 1, nome: "A Posse", ano: "2023", ato: 1,
      abertura: "1º de janeiro de 2023. Lula sobe a rampa do Planalto ao lado de representantes do povo e recebe a faixa. A ferramenta dele é a caneta: a tinta para reescrever o estrago que os vândalos deixaram. Missão: arrumar a casa e religar a sala de comando.",
      comando: "Aperte {ACAO} para atirar tinta com a Caneta: a peça quebrada atingida vira chão firme. Bata por baixo no bloco VICE para chamar o Alckmin.",
      tropeco: ["Caco de vidro!", "Ainda tem muita coisa quebrada no Palácio."],
      final: "Em 8 de janeiro de 2023, golpistas depredaram o Planalto, o Congresso e o STF. Para o STF, o ataque fez parte da tentativa de golpe liderada por Jair Bolsonaro, condenado a 27 anos e 3 meses. Até abril de 2026, 1.402 pessoas tinham sido condenadas pelos atos.",
      placar: null,
      fontes: ["correio", "stfGolpe", "cfAlckmin06", "globo22", "agSenado8jan"],
      revisaoJuridica: true, revisaoNota: "imagem do menor na cutscene"
    },
    { // 2
      n: 2, nome: "Rei Desemprego", ano: "2023", ato: 1,
      chefeNome: ["REI DESEMPREGO"],
      abertura: "Entre 2020 e 2021, o desemprego bateu 14,9%. Fábrica de portão fechado, lojinha com placa de FECHADO e um rei sentado num trono de currículos. Missão: reabrir as portas do emprego, da fábrica à lojinha do bairro.",
      comando: "Aperte {ACAO} para gritar no Megafone. As carteiras de trabalho reabrem as 4 portas e devolvem o emprego a quem estava na rua.",
      tropeco: ["Vaga encerrada!", "Uma placa de FECHADO entrou no caminho."],
      final: "A desocupação caiu de 14,9% para 5,1% no fim de 2025. Na média do ano ficou em 5,6%, a menor desde o início da série do IBGE, em 2012. E 103 milhões de pessoas estavam trabalhando, um recorde. Lula ajudou a esvaziar a pilha de currículos parados.",
      placar: ["Desemprego", "14,9% → 5,1%"],
      falaInicio: "Sem armas! Vamos gerar empregos!",
      fontes: ["ibge", "ibgeAnual"]
    },
    { // 3
      n: 3, nome: "Dona Fome", ano: "2023", ato: 1,
      chefeNome: ["DONA FOME"],
      abertura: "Julho de 2021, Cuiabá: famílias fazem fila na porta de um açougue para ganhar ossos. Em 2022, 33 milhões de brasileiros passavam fome. Missão: entregar o Bolsa Família e encher as geladeiras de novo.",
      comando: "Aperte {ACAO} para entregar o cartão do Bolsa Família às 5 famílias. Com ele, cada uma compra a cesta básica e enche a geladeira.",
      tropeco: ["Barriga roncando!", "A Dona Fome passou na frente."],
      final: "Com o novo Bolsa Família (mínimo de R$ 600 por família e mais R$ 150 por criança de até 6 anos), o Brasil saiu de novo do Mapa da Fome da ONU em 2025 e continuou fora em 2026. A insegurança alimentar severa caiu de 6,6% para 0,6% da população. Lula mais uma vez ajudando a acabar com a fome.",
      placar: ["Mapa da Fome", "dentro → fora"],
      fontes: ["opovoOsso", "penssan", "fao", "abFome", "lei14601"],
      revisaoJuridica: false
    },
    { // 4
      n: 4, nome: "A Fortaleza da Boiada", ano: "2023", ato: 1,
      chefeNome: ["MINISTRO DA BOIADA"],
      abertura: "2020, plena pandemia. Numa reunião ministerial gravada em vídeo, o ministro do Meio Ambiente, Ricardo Salles, defendeu aproveitar a distração para ‘ir passando a boiada’ nas regras ambientais. Missão: plantar de volta e fechar a porteira.",
      comando: "Pegue as mudas pelo caminho e passe nas clareiras para plantar: cada muda vira árvore. No fim, aperte {ACAO} para assinar com a Caneta e fechar as porteiras.",
      tropeco: ["Passou a boiada!", "Feche a porteira antes do próximo boi."],
      final: "Segundo o Inpe, o desmatamento na Amazônia caiu de 11.594 km² em 2022 para 5.731 km² em 2025: menos da metade. Lula fazendo a boiada voltar para o pasto.",
      placar: ["Desmatamento (km²)", "11.594 → 5.731"],
      fontes: ["opovoSalles", "inpe"],
      revisaoJuridica: true, revisaoNota: "fase inteira, antes de publicar",
      falaCutscene: "passar a boiada!"
    },
    { // 5
      n: 5, nome: "Relógio de Ponto Infinito", ano: "2027", ato: 2,
      chefeNome: ["RELÓGIO DE PONTO INFINITO"],
      abertura: "Seis dias de trabalho para um de folga, na fábrica ou na tela do home office. O domingo virou lenda. Missão: bater o ponto, parar o relógio infinito e devolver tempo para descansar e ficar com a família.",
      comando: "Segure {ACAO} para correr. Pule em cima dos relógios de ponto pelo caminho: bata 6 dos 7 pontos para chegar ao chefão.",
      tropeco: ["Hora extra!", "O relógio de ponto não deixou você sair."],
      final: "O fim da escala 6x1, com no máximo 40 horas por semana e sem corte de salário, passou na Câmara por 472 x 22 e está em debate no Senado. Flavinho é contra esse texto: quer reduzir a jornada com corte proporcional do salário. Logo ele, que segundo reportagem da BBC News Brasil teve um cargo fantasma na Câmara, na escala 0x7.",
      placar: ["Jornada", "44 h → 40 h"],
      fontes: ["camara6x1", "globo6x1", "planoLula75", "cmFlavio6x1", "agSenado8jan", "ibgeAnual", "lei14601", "petroLucro", "poderRenan", "bbcFantasma"],
      revisaoJuridica: true, revisaoNota: "frase final",
      cameo: "40 h com corte de salário",
      // fala real (Correio da Manhã, 7/10/2026), ao criticar o fim da escala 6x1
      cameo2: "Quem quer trabalhar mais, vai trabalhar mais. Quem quer trabalhar menos, vai trabalhar menos.",
      pontoBatido: "PONTO BATIDO"
    },
    { // 6
      n: 6, nome: "O Feirão do Flavinho", ano: "2027", ato: 2,
      chefeNome: ["O FLAVINHO"],
      abertura: "Na Esplanada, o Flavinho quer montar um feirão: refinaria, usina, banco e correio, tudo com etiqueta VENDE-SE e lance em dólar. Só que o que é do povo não está à venda. Missão: derrubar as etiquetas e salvar o patrimônio público.",
      comando: "Aperte {ACAO} para atirar bandeirinhas do Brasil e derrubar as 5 etiquetas VENDE-SE.",
      tropeco: ["Arrematado!", "Quase foi vendido no feirão. Tente de novo."],
      final: "O plano de governo do Flavinho prevê um Programa Nacional de Desestatização, no caminho de Bolsonaro, que privatizou a Eletrobras. Lula manteve Petrobras, Banco do Brasil e Correios públicos e quer a Petrobras de volta aos postos de combustível, com mais refino no Brasil. E pública dá lucro: no 2º trimestre de 2026, o lucro da Petrobras quase dobrou e chegou a R$ 52,4 bilhões.",
      placar: ["Petrobras", "volta a vender combustível"],
      fontes: ["planoFlavio", "g1Estatais", "planoLula67", "petroLucro"],
      revisaoJuridica: true, revisaoNota: "fase inteira, antes de publicar; o leilão para compradores dos EUA é licença da paródia"
    },
    { // 7
      n: 7, nome: "A Serpente do Tesouraço", ano: "2027", ato: 2,
      chefeNome: ["SERPENTE DO TESOURAÇO"],
      abertura: "Na Farmácia Popular, remédio de diabetes e até fralda geriátrica saem de graça, e os exames vêm aí. Mas a Serpente do Tesouraço chegou com um monte de tesouras e uma ideia fixa: cortar. Missão: salvar a Farmácia Popular.",
      comando: "Aperte {ACAO} para entregar remédio aos 5 pacientes da fila. Cuidado com as tesouras voadoras.",
      tropeco: ["Cortado!", "A tesoura passou antes do remédio."],
      final: "Com Lula, a Farmácia Popular ficou 100% gratuita: os 41 itens, do remédio de diabetes à fralda geriátrica, não custam nada. Foram 27,3 milhões de pessoas atendidas em 2025, e o plano de Lula inclui exames. O plano do Flavinho promete um ‘tesouraço’, que certamente deve impactar a Farmácia Popular!",
      placar: ["Farmácia Popular", "remédio + exame grátis"],
      fontes: ["g1Farmacia", "planoLula36", "planoFlavio"],
      revisaoJuridica: true, revisaoNota: "tela final: “certamente deve impactar” é opinião"
    },
    { // 8
      n: 8, nome: "A Evasão", ano: "2027", ato: 2,
      chefeNome: ["A EVASÃO"],
      abertura: "Escola o dia inteiro, internet na sala e o Pé-de-Meia: R$ 200 por mês para o jovem que segue estudando. Mas a Evasão chegou com uma placa de SAÍDA e um monte de ‘PRECISA-SE’. Missão: juntar os alunos e levar a fila inteira de volta à escola.",
      comando: "Encoste nos alunos e leve a fila até a escola. O bico puxa quem está na fila e um golpe espalha todo mundo. Moedas pegas com a fila enchem o Pé-de-Meia.",
      tropeco: ["A fila se espalhou!", "Volte e junte os alunos de novo."],
      espalhou: "A FILA SE ESPALHOU!", meiaCheia: "PÉ-DE-MEIA CHEIO! +1 VIDA", escola: "ESCOLA", bico: "PRECISA-SE", onibus: "ÔNIBUS?",
      voltou: "VOLTOU!", evadiu: "EVADIU!", peDeMeia: "PÉ-DE-MEIA",
      final: "O Pé-de-Meia, criado por lei em 2024, é uma poupança para estudantes do ensino médio público de famílias do CadÚnico. Segundo o plano de Lula, já atendeu 7,3 milhões de jovens, e o tempo integral ganhou 1,8 milhão de matrículas. O tesouraço do Flavinho também ameaça esses programas.",
      placar: ["Alfabetização", "66% → 80%"],
      fontes: ["lei14818", "planoLula31", "planoFlavio"]
    },
    { // 9
      n: 9, nome: "A Draga Estrangeira", ano: "2027", ato: 2,
      chefeNome: ["DRAGA ESTRANGEIRA"],
      abertura: "Terras raras: o nome é esquisito, mas elas estão no seu celular, no carro elétrico e na turbina eólica. Uma draga estrangeira quer levar tudo embora em estado bruto, com ajuda do Flavinho, e nos vender mais caro depois. Missão: proteger a mina e processar o minério aqui, no Brasil (até o Renan Santos é a favor!).",
      comando: "Aperte {ACAO} perto das alavancas para desviar o minério para a usina brasileira. Longe delas, {ACAO} atira com a Caneta.",
      tropeco: ["Sugado!", "A draga levou o minério e quase levou você."],
      final: "Terras raras são a riqueza do futuro, e o plano de Lula quer processá-las aqui, gerando emprego aqui. Do outro lado, um plano com a marca do Flavinho prevê parceria com os Estados Unidos para as terras raras brasileiras.",
      placar: ["Terras raras", "processadas no Brasil"],
      fontes: ["planoLula52", "emTerras", "poderRenan"],
      revisaoJuridica: true, revisaoNota: "abertura: “com ajuda do Flavinho, e nos vender mais caro depois” é leitura da paródia"
    },
    { // 10
      n: 10, nome: "O Tarifaço", ano: "2027", ato: 2,
      chefeNome: ["CARIMBOS DO TARIFAÇO"],
      abertura: "Julho de 2025: os Estados Unidos carimbam tarifa de 50% em produtos brasileiros, e café, carne e frutas ficam presos no porto. Apesar do impacto no bolso de todos os brasileiros, Flavinho agradeceu a Trump. Missão: desviar dos carimbos, liberar a carga e fazê-la zarpar.",
      comando: "Segure {ACAO} para correr por baixo dos carimbos. Pule em cima deles quando pararem no chão.",
      tropeco: ["Carimbado!", "Levou uma tarifa de 50% na cabeça."],
      final: "Para impor a tarifa, Trump citou os processos contra Jair Bolsonaro. Horas depois, Flavinho escreveu: ‘Thank you President Trump’. Lula respondeu com o Plano Brasil Soberano e negociou: em novembro de 2025, café, carne e frutas ficaram livres da taxa extra de 40%.",
      placar: ["Exportação", "liberada"],
      fontes: ["mp1309", "sbtTrump", "abTarifas"],
      revisaoJuridica: true, revisaoNota: "tela final"
    },
    { // 11
      n: 11, nome: "O Polvo do Cofre", ano: "2027", ato: 2,
      chefeNome: ["POLVO DO COFRE"],
      abertura: "O crime organizado tem tentáculos em tudo, mas o coração dele é o cofre. Missão: seguir o dinheiro, cano por cano, até o cofre do Polvo.",
      comando: "Aperte {ACAO} para atirar nos canos por onde passa o dinheiro do crime. Os moradores mostram o caminho.",
      tropeco: ["Enrolado!", "Um tentáculo do Polvo pegou você."],
      final: "Lula vai atrás do dinheiro do crime: R$ 35,8 bilhões de prejuízo às facções, Lei Antifacção e forças integradas nos estados. No Senado, Flavinho nunca aprovou um projeto de lei seu, nem contra o crime: foram 53 como primeiro autor e nenhum virou lei. Na Alerj, deu a Medalha Tiradentes a Adriano da Nóbrega quando ele estava preso, acusado de homicídio. Adriano foi depois apontado como chefe do Escritório do Crime.",
      placar: ["Facções", "asfixia financeira"],
      fontes: ["senado", "bbcAdriano", "planoLula27"],
      revisaoJuridica: true, revisaoNota: "tela final"
    },
    { // 12
      n: 12, nome: "A Mordida do Leão", ano: "2027", ato: 2,
      chefeNome: ["O LEÃO FAMINTO"],
      abertura: "Até 2025, quem ganhava R$ 5 mil por mês pagava imposto de renda, enquanto muita gente que ganhava milhões por ano pagava quase nada. O leão mordia sempre o mesmo lado. Missão: tirar o leão do contracheque do trabalhador.",
      comando: "Segure {ACAO} para correr atrás do leão. Pegue os contracheques que ele deixa cair e devolva à fila.",
      tropeco: ["Mordida do Leão!", "Ele ainda está com fome de contracheque."],
      final: "Promessa cumprida: desde janeiro de 2026, quem ganha até R$ 5 mil por mês não paga imposto de renda. São 10 milhões que deixaram de pagar e 5 milhões que pagam menos. A conta foi para quem ganha mais de R$ 600 mil por ano, com imposto mínimo de até 10%. A Câmara aprovou por 493 x 0 e o Senado, por unanimidade. Bolsonaro prometeu o mesmo em 2018 e não cumpriu. Na votação, Flavinho ainda tentou se beneficiar, livrando da nova cobrança os lucros de sociedades como o escritório de advocacia dele.",
      placar: ["IR zero até R$ 5 mil", "15 milhões pagam menos ou nada"],
      fontes: ["lei15270", "camaraIR", "senadoIR", "dieese", "agenciaGov", "jovemPan", "sbtEmenda"],
      revisaoJuridica: true, revisaoNota: "frase final",
      textoMotor: { placa: "NÃO PERTURBE", isento: "ISENTO", zzz: "ZZZ" }
    },
    { // 13
      n: 13, nome: "O Trator do Atraso", ano: "2027", ato: 2,
      chefeNome: ["TRATOR DO ATRASO"],
      abertura: "Hora do chefão: o Trator do Atraso, dirigido pelo Flavinho, quer passar por cima do seu salário, dos seus direitos, da nossa soberania e da democracia. Com o Alckmin de copiloto, missão: defender a Constituição e o Brasil.",
      comando: "Aperte {ACAO} para atirar com a Caneta. O bloco VICE leva você até o trator.",
      tropeco: ["Atropelado pelo atraso!", "A Constituição ainda pode ser salva. Tente de novo."],
      final: "Lula defende a democracia, a Constituição e a soberania: o país resistiu ao 8 de janeiro e não se curvou ao tarifaço. Flavinho disse que quer maioria no Congresso ‘para gente mudar a Constituição’. Aproveitar a maioria para mudar a Constituição foi exatamente o mesmo caminho seguido pelo nazismo e o fascismo.",
      placar: null,
      fontes: ["g1Constituicao"],
      revisaoJuridica: true, revisaoNota: "tela final: comparação com nazismo e fascismo é opinião, não decisão de tribunal"
    }
  ],

  /* Legendas de lugar no topo das cutscenes (só rótulos de lugar/tempo, sem fatos novos) */
  cutLegendas: [
    ["SALA ESCURA", "O SLIDE", "O MARTELO"],
    ["RAMPA DO PLANALTO · 1º/01/2023", "DENTRO DO PALÁCIO"],
    ["PORTAS FECHADAS", "A FILA DO EMPREGO", "NO FIM DA RUA"],
    ["NA PORTA DO AÇOUGUE", "AS GELADEIRAS"],
    ["NO MEIO DA FLORESTA", "OS PORTÕES SE ABREM"],
    ["NA FÁBRICA · EM CASA", "O DOMINGO SUMIU"],
    ["LEILÃO NA ESPLANADA", "VENDE-SE O BRASIL"],
    ["NA FARMÁCIA"],
    ["NA PORTA DA ESCOLA", "O PÉ-DE-MEIA"],
    ["MINA NO CERRADO", "A DRAGA"],
    ["NO CAIS"],
    ["NO ALTO DO MORRO"],
    ["DIA DE PAGAMENTO", "NA COBERTURA"],
    ["PRAÇA DOS TRÊS PODERES", "O TRATOR"]
  ],

  /* Instruções mostradas junto do nome do chefe na apresentação */
  chefeDicas: {
    projetor: "Desvie das setas. Quando o projetor descer para carregar os slides, pule nos 3 botões vermelhos.",
    juiz: "Pule as ondas do martelinho. Depois de desviar de 3 ondas, o carimbo cai em cima dele.",
    rei: "Aperte {ACAO} e acerte a coroa com as carteiras de trabalho 3 vezes. Desvie das placas.",
    fome: "Ela puxa você e joga talheres. Acerte a boca dela 4 vezes com o cartão do Bolsa Família ({ACAO}).",
    boiada: "Pule os bois. Atire com a Caneta ({ACAO}) nas 3 porteiras abertas para fechá-las.",
    relogio: "Suba nos ponteiros e pule 3 vezes no centro dourado do relógio.",
    herdeiro: "Quando a bússola piscar, pule a onda do martelo. Acerte o Flavinho 4 vezes com as bandeirinhas ({ACAO}).",
    serpente: "Ela atira 3 tesouras e depois dá o bote. Desvie: a cabeça fica presa no chão, aí é só pular em cima dela. 3 vezes.",
    evasao: "A placa de SAÍDA estica as mãos para puxar os alunos. Quando uma mão agarrar um aluno, pule nela para soltá-lo. 3 vezes.",
    draga: "Suba nos trilhos e acerte o motor amarelo 3 vezes com a Caneta ({ACAO}). Resista à sucção.",
    carimbos: "Corra ({ACAO}) por baixo dos carimbos. Quando um parar no chão, pule em cima dele.",
    polvo: "Atire com a Caneta ({ACAO}) nos 4 canos verdes. Fuja dos tentáculos que saem do chão.",
    leao: "Bata por baixo nos 4 cofres dourados: o leão corre para comer as moedas. Desvie dos botes.",
    trator: "Pule o braço do trator e atire ({ACAO}) no ponto que pisca: 3 acertos em cada forma."
  },

  /* Objetivos do HUD (seção 5/6) */
  objetivos: ["BOTÕES", "PEÇAS", "PORTAS", "GELADEIRAS", "PORTEIRAS", "PONTOS", "ETIQUETAS", "PACIENTES", "NA ESCOLA", "CARGAS", "CARGAS", "COFRES", "CONTRACHEQUES", "CONSTITUIÇÃO"],
  metas: [3, 5, 4, 5, 3, 6, 5, 5, 5, 3, 3, 4, 10, 0],

  /* ---------- Fontes (seção 10). Todas com link. ---------- */
  fontes: {
    planoLula:      ["Plano de governo de Lula 2026 (TSE)", "https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017016005"],
    planoLula75:    ["Plano de governo de Lula 2026 (TSE), p. 75", "https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017016005"],
    planoLula67:    ["Plano de governo de Lula 2026 (TSE), p. 67", "https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017016005"],
    planoLula36:    ["Plano de governo de Lula 2026 (TSE), p. 36", "https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017016005"],
    planoLula31:    ["Plano de governo de Lula 2026 (TSE), p. 31–33", "https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017016005"],
    planoLula52:    ["Plano de governo de Lula 2026 (TSE), p. 52", "https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017016005"],
    planoLula27:    ["Plano de governo de Lula 2026 (TSE), p. 27–30", "https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017016005"],
    planoFlavio:    ["Plano de governo de Flávio (TSE)", "https://www.tse.jus.br/eleicoes/eleicoes-2026-content/propostas-de-governo-dos-candidatos-ao-cargo-de-presidente-da-republica-eleicoes-2026/flavio-bolsonaro"],
    stfMoro:        ["STF: suspeição de Moro", "https://portal.stf.jus.br/noticias/verNoticiaDetalhe.asp?idConteudo=468086&ori=1"],
    globoToffoli:   ["O Globo: Toffoli e a \"armação\"", "https://oglobo.globo.com/politica/noticia/2023/09/06/toffoli-do-stf-anula-todas-as-provas-do-acordo-de-leniencia-da-odebrecht-e-diz-que-prisao-de-lula-foi-fruto-de-armacao.ghtml"],
    correio:        ["Correio Braziliense: quem subiu a rampa", "https://www.correiobraziliense.com.br/politica/2023/01/5063027-veja-quem-sao-os-representantes-do-povo-brasileiro-que-subiram-a-rampa-com-lula.html"],
    stfGolpe:       ["STF: condenação por tentativa de golpe", "https://noticias.stf.jus.br/postsnoticias/stf-fixa-penas-de-16-a-27-anos-para-condenados-por-tentativa-de-golpe-de-estado/"],
    stfPena:        ["STF: execução da pena de Bolsonaro", "https://noticias.stf.jus.br/postsnoticias/stf-mantem-ex-presidente-bolsonaro-em-prisao-domiciliar/"],
    ibge:           ["IBGE: desocupação de 2025 (PNAD Contínua)", "https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/45923-em-2025-vinte-unidades-da-federacao-registram-a-menor-taxa-de-desocupacao-da-serie"],
    opovoOsso:      ["O Povo: fila do osso em Cuiabá", "https://www.opovo.com.br/noticias/brasil/2021/07/18/familias-fazem-fila-para-receber-doacao-de-ossos-com-restos-de-carne-em-cuiaba.html"],
    abFome:         ["Agência Brasil: Mapa da Fome 2026", "https://agenciabrasil.ebc.com.br/direitos-humanos/noticia/2026-07/brasil-continua-fora-do-mapa-da-fome-aponta-relatorio-da-onu"],
    opovoSalles:    ["O Povo: Salles e a boiada", "https://www.opovo.com.br/noticias/politica/2020/05/22/ricardo-salles-video-coronavirus-leis-ambientais-passar-a-boiada.html"],
    inpe:           ["Inpe: desmatamento 2025", "https://www.gov.br/inpe/pt-br/assuntos/ultimas-noticias/sistema-do-inpe-aponta-5-731-km2-de-desmatamento-na-amazonia-em-2025"],
    camara6x1:      ["Câmara: fim da 6x1", "https://www.camara.leg.br/noticias/1277141-camara-aprova-em-dois-turnos-fim-da-escala-6x1-com-jornada-maxima-de-40-horas-semanais/"],
    bbcFantasma:    ["BBC News Brasil, 14/05/2026: o cargo de Flávio na Câmara (investigação jornalística, sem condenação)", "https://www.bbc.com/portuguese/articles/crmpv9r7mz9o"],
    cmFlavio6x1:    ["Correio da Manhã: Flávio contra o fim da 6x1", "https://www.correiodamanha.com.br/politica/2026/10/325178-contra-fim-da-6x1-flavio-defende-jornada-flexivel-quem-quer-trabalhar-mais-vai-trabalhar-mais.html"],
    globo6x1:       ["O Globo: 6x1 no Senado", "https://oglobo.globo.com/economia/noticia/2026/10/08/fim-da-escala-6x1-senado-faz-3a-sessao-de-debate-da-pec-governo-tenta-votar-antes-do-2o-turno.ghtml"],
    emTerras:       ["Estado de Minas: terras raras", "https://www.em.com.br/politica/2026/09/7499166-terras-raras-plano-com-marca-de-flavio-bolsonaro-preve-parceria-com-eua.html"],
    sbtTrump:       ["SBT News: Flávio agradece a Trump", "https://sbtnews.sbt.com.br/colunas/coluna-do-ranier/flavio-tambem-agradeceu-a-trump-por-tarifas-em-2025"],
    bbcAdriano:     ["BBC: Flávio e Adriano da Nóbrega", "https://www.bbc.com/portuguese/brasil-51447905"],
    g1Constituicao: ["g1: Flávio e a Constituição", "https://g1.globo.com/go/goias/eleicoes/2026/noticia/2026/10/06/flavio-bolsonaro-fala-em-usar-maioria-na-camara-e-no-senado-para-mudar-constituicao-e-redemocratizar-o-pais.ghtml"],
    dieese:         ["Dieese: isenção do IR beneficia 15 milhões", "https://www.cut.org.br/noticias/isencao-do-ir-beneficia-mais-de-15-milhoes-de-trabalhadores-diz-estudo-do-dieese-a94c"],
    agenciaGov:     ["Agência Gov: isenção vale para 10 milhões", "https://agenciagov.ebc.com.br/noticias/202601/isencao-total-do-ir-passa-a-valer-oficialmente-para-10-milhoes-de-brasileiros-que-ganham-ate-r-5-mil"],
    lei15270:       ["Planalto: Lei 15.270/2025", "https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15270.htm"],
    camaraIR:       ["Agência Câmara: aprovação por 493 x 0", "https://www.camara.leg.br/noticias/1206672-camara-aprova-projeto-que-isenta-do-imposto-de-renda-quem-ganha-ate-r-5-mil-por-mes/"],
    senadoIR:       ["Agência Senado: aprovação unânime", "https://www12.senado.leg.br/noticias/materias/2025/11/05/isencao-de-ir-para-quem-ganha-ate-r-5-mil-segue-para-sancao"],
    jovemPan:       ["Jovem Pan: Guedes e a promessa não cumprida", "https://jovempan.com.br/economia/macroeconomia/guedes-diz-que-bolsonaro-nao-conseguiu-cumprir-promessa-de-isencao-no-ir-para-quem-recebe-ate-5-salarios-minimos/"],
    sbtEmenda:      ["SBT News: emenda de Flávio no IR", "https://sbtnews.sbt.com.br/noticia/politica/flavio-propos-isencao-no-ir-que-beneficiaria-escritorio-dele"],
    /* links adicionados na v1.1 (antes sem URL) */
    intercept:      ["Intercept (Vaza Jato, 09/06/2019)", "https://www.intercept.com.br/2019/06/09/chat-moro-deltan-telegram-lava-jato/"],
    onu:            ["Comitê de Direitos Humanos da ONU (2022)", "https://www.ohchr.org/en/press-releases/2022/04/brazil-criminal-proceedings-against-former-president-lula-da-silva-violated"],
    penssan:        ["Rede Penssan (2022)", "https://jornal.usp.br/wp-content/uploads/2022/06/Relatorio-II-VIGISAN-2022.pdf"],
    fao:            ["FAO", "https://www.fao.org/brasil/noticias/detail-events/en/c/1741586/"],
    ipeadata:       ["Ipeadata", "https://www.ipeadata.gov.br/"],
    g1Farmacia:     ["Ministério da Saúde (Farmácia Popular)", "https://www.gov.br/saude/pt-br/assuntos/noticias/2025/fevereiro/ministerio-da-saude-anuncia-100-de-gratuidade-no-farmacia-popular-e-abre-credenciamento-a-todos-os-municipios-do-pais"],
    g1Estatais:     ["Bloomberg Línea (estatais fora da privatização)", "https://www.bloomberglinea.com.br/2023/04/07/governo-lula-retira-correios-e-mais-nove-estatais-de-programas-de-privatizacao/"],
    lei14818:       ["Lei 14.818 (Pé-de-Meia)", "https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/lei/l14818.htm"],
    mp1309:         ["MP 1.309", "https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/mpv/mpv1309.htm"],
    abTarifas:      ["Agência Brasil (retirada das tarifas, 20/11/2025)", "https://agenciabrasil.ebc.com.br/internacional/noticia/2025-11/trump-retira-tarifa-de-40-sobre-produtos-do-brasil-como-cafe-e-carne"],
    agSenado8jan:   ["Agência Senado: 1.402 condenados pelo 8 de janeiro (balanço do STF)", "https://www12.senado.leg.br/noticias/materias/2026/05/08/promulgada-lei-que-possibilita-reducao-de-penas-pelo-8-de-janeiro"],
    ibgeAnual:      ["IBGE: desocupação média de 5,6% em 2025", "https://agenciadenoticias.ibge.gov.br/agencia-sala-de-imprensa/2013-agencia-de-noticias/releases/45759-pnad-continua-em-2025-taxa-anual-de-desocupacao-foi-de-5-6-enquanto-taxa-de-subutilizacao-foi-14-5"],
    lei14601:       ["Lei 14.601/2023 (novo Bolsa Família)", "https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14601.htm"],
    petroLucro:     ["DGABC, 06/08/2026: lucro da Petrobras sobe 96,8% no 2º trimestre", "https://www.dgabc.com.br/Noticia/4339821/lucro-liquido-da-petrobras-sobe-96-8-no-2-trimestre-para-r-52-4-bilhoes"],
    poderRenan:     ["Poder360, 22/05/2026: Renan Santos defende processar terras raras no Brasil", "https://www.poder360.com.br/poder-eleicoes/renan-santos-defende-processamento-de-terras-raras-no-brasil/"],
    senado:         ["Senado (dados abertos)", "https://www12.senado.leg.br/dados-abertos"],
    tse:            ["TSE (inelegibilidade)", "https://www.tse.jus.br/comunicacao/noticias/2023/Junho/por-maioria-de-votos-tse-declara-bolsonaro-inelegivel-por-8-anos"],
    cfAlckmin06:    ["Congresso em Foco: frases da campanha de 2006 (Alckmin)", "https://www.congressoemfoco.com.br/noticia/97222/frases-inesqueciveis-da-campanha-eleitoral"],
    globo22:        ["Congresso em Foco (Alckmin, 2022)", "https://congressoemfoco.com.br/area/pais/lula-representa-a-propria-democracia-e-e-a-esperanca-do-brasil-diz-geraldo-alckmin"]
  },

  /* ordem da lista de fontes nos créditos (seção 10) */
  creditosFontes: ["planoLula", "planoFlavio", "stfMoro", "globoToffoli", "correio", "stfGolpe", "stfPena", "ibge", "opovoOsso", "abFome", "opovoSalles", "inpe", "camara6x1", "globo6x1", "cmFlavio6x1", "bbcFantasma", "emTerras", "sbtTrump", "bbcAdriano", "g1Constituicao", "dieese", "agenciaGov", "lei15270", "camaraIR", "senadoIR", "jovemPan", "sbtEmenda", "intercept", "onu", "penssan", "fao", "ipeadata", "g1Farmacia", "g1Estatais", "lei14818", "mp1309", "abTarifas", "senado", "tse", "cfAlckmin06", "globo22"]
};
