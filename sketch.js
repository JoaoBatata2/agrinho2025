// =========================================================
// VARIÁVEIS GLOBAIS DO JOGO
// =========================================================
let dinheiro = 100;
let agua = 100; // Porcentagem de água disponível para regar
let saudeSolo = 100; // Porcentagem de saúde geral do solo (afeta o crescimento)

let terras = []; // Array de objetos para cada pedaço de terra
const NUM_TERRAS_INICIAIS = 4; // Começaremos com 4 pedaços de terra

// Constantes para os estados da terra e fases de crescimento
const ESTADO_VAZIO = 0;
const ESTADO_PLANTADO = 1;

const FASE_SEMENTE = 0;
const FASE_BROTO = 1;
const FASE_JOVEM = 2;
const FASE_MADURA = 3; // Pronta para colher

// Tipos de plantas com atributos de cor e forma para representação visual
const PLANTAS = {
  TOMATE: {
    nome: "Tomate",
    custo: 25, // Custo aumentado
    tempoTotalCrescimento: 1200, // Muito mais lento (20 segundos * 60 fps)
    valorVenda: 20, // Valor de venda reduzido
    cor: [255, 0, 0], // Vermelho para tomate
    forma: 'circulo'
  },
  ALFACE: {
    nome: "Alface",
    custo: 18, // Custo aumentado
    tempoTotalCrescimento: 900, // Muito mais lento (15 segundos * 60 fps)
    valorVenda: 15, // Valor de venda reduzido
    cor: [0, 180, 0], // Verde para alface
    forma: 'retangulo'
  }
  // Adicione mais plantas aqui, definindo uma cor e forma
};

// =========================================================
// VARIÁVEIS DE PROGRESSÃO DE DIFICULDADE (AGORA EXTREMAS)
// =========================================================
let diasDeJogo = 0; // Contará quantos "dias" se passaram no jogo
const TEMPO_POR_DIA = 600; // Dias passam mais rápido (10 segundos * 60 fps)
let contadorDia = 0; // Contador de frames para o dia

// Para o sistema de pragas
let chancePraga = 0.05; // Chance inicial de praga (5%) - já começa com chance
const AUMENTO_CHANCE_PRAGA_POR_DIA = 0.02; // Aumenta 2% por dia (muito mais rápido)
const PRAGA_TEMPO_ATIVO = 120; // Praga destrói a planta muito mais rápido (2 segundos)

// Custos de ações (ajustados para serem mais caros)
const CUSTO_REGAR = 10;
const CUSTO_ADUBAR = 30;
const CUSTO_TRATAR_PRAGA = 40;


// =========================================================
// FUNÇÃO PRELOAD - Vazia, pois não carregaremos imagens
// =========================================================
function preload() {
  // Não precisamos carregar nada aqui, pois não usaremos imagens externas.
}

// =========================================================
// FUNÇÃO SETUP - Configura o ambiente do jogo uma única vez
// =========================================================
function setup() {
  createCanvas(900, 600); // Define o tamanho da tela do jogo
  inicializarTerras(); // Chama a função para configurar as terras
  textAlign(CENTER, CENTER); // Alinha o texto ao centro por padrão
  rectMode(CORNER); // Desenha retângulos do canto superior esquerdo
}

// =========================================================
// FUNÇÃO DRAW - O loop principal do jogo, executado continuamente
// =========================================================
function draw() {
  background(135, 206, 235); // Cor de fundo (céu azul claro)

  // --- Desenha o Sol ---
  noStroke();
  fill(255, 200, 0); // Amarelo/Laranja para o sol
  ellipse(width - 100, 80, 100, 100); // Posição: canto superior direito (X, Y, largura, altura)
  // --- Fim do Sol ---

  drawFazenda(); // Desenha todos os elementos da fazenda, incluindo o celeiro
  drawUI(); // Desenha a interface do usuário (dinheiro, água, botões)
  gerenciarLogicaJogo(); // Executa a lógica de crescimento, eventos, etc.
}

// =========================================================
// FUNÇÕES AUXILIARES DO JOGO
// =========================================================

// Função para inicializar os objetos das terras
function inicializarTerras() {
  for (let i = 0; i < NUM_TERRAS_INICIAIS; i++) {
    terras.push({
      x: 80 + i * 200, // Posição X de cada terra (ajuste o espaçamento)
      y: 400, // Posição Y: Mais para baixo
      largura: 160,
      altura: 160,
      estado: ESTADO_VAZIO, // Começa vazia
      planta: null, // Nenhuma planta plantada inicialmente
      tempoCrescimentoAtual: 0, // Contador de tempo de crescimento da planta
      faseCrescimento: FASE_SEMENTE, // Fase atual da planta
      pragaAtiva: false, // Indica se há uma praga ativa nesta terra
      contadorPraga: 0 // Contador para tempo de vida da praga
    });
  }
}

// Função para desenhar a fazenda e suas terras
function drawFazenda() {
  // Desenha os pedaços de terra
  for (let i = 0; i < terras.length; i++) {
    let t = terras[i]; // Atalho para o objeto da terra atual

    // Desenha a terra arado (retângulo marrom)
    fill(139, 69, 19); // Cor de terra
    stroke(50); // Contorno escuro para separar as terras
    strokeWeight(2);
    rect(t.x, t.y, t.largura, t.altura, 5); // Retângulo com cantos arredondados

    // Desenha a planta se houver uma e ela estiver atribuída
    if (t.estado === ESTADO_PLANTADO && t.planta) {
      noStroke(); // Sem contorno para as plantas
      fill(t.planta.cor[0], t.planta.cor[1], t.planta.cor[2]); // Cor da planta

      // Desenha a planta baseada na fase de crescimento e forma
      let centroX = t.x + t.largura / 2;
      let centroY = t.y + t.altura / 2;
      let tamanhoBase = 20;

      if (t.faseCrescimento === FASE_SEMENTE) {
        fill(100, 50, 0); // Cor de semente
        ellipse(centroX, centroY + 20, 15, 10); // Semente no chão
      } else if (t.faseCrescimento === FASE_BROTO) {
        fill(50, 150, 50); // Verde broto
        rect(centroX - 5, centroY + 10, 10, 30); // Pequeno broto
      } else if (t.faseCrescimento === FASE_JOVEM) {
        fill(t.planta.cor[0], t.planta.cor[1], t.planta.cor[2]);
        if (t.planta.forma === 'circulo') {
          ellipse(centroX, centroY, tamanhoBase * 1.5, tamanhoBase * 1.5);
          fill(50, 150, 50); // Caule
          rect(centroX - 3, centroY + 10, 6, 40);
        } else if (t.planta.forma === 'retangulo') {
          rect(centroX - 20, centroY - 10, 40, 50); // Folhas para alface
        }
      } else if (t.faseCrescimento === FASE_MADURA) {
        fill(t.planta.cor[0], t.planta.cor[1], t.planta.cor[2]);
        if (t.planta.forma === 'circulo') {
          ellipse(centroX, centroY - 20, tamanhoBase * 2.5, tamanhoBase * 2.5); // Fruto grande
          fill(50, 150, 50); // Caule
          rect(centroX - 4, centroY + 5, 8, 50);
        } else if (t.planta.forma === 'retangulo') {
          rect(centroX - 30, centroY - 20, 60, 70); // Alface madura
        }
      }
    }

    // --- Indicação visual de Praga ---
    if (t.pragaAtiva) {
      // Pisca um X vermelho sobre a planta ou a terra
      let tempoPiscando = frameCount % 30; // Pisca a cada meio segundo (aprox)
      if (tempoPiscando < 15) { // Metade do tempo visível
        stroke(255, 0, 0); // Vermelho
        strokeWeight(4);
        line(t.x + 20, t.y + 20, t.x + t.largura - 20, t.y + t.altura - 20); // Linha \
        line(t.x + t.largura - 20, t.y + 20, t.x + 20, t.y + t.altura - 20); // Linha /
      }
    }
  }

  // Desenha o Ponto de Venda (um celeiro simples)
  stroke(0);
  strokeWeight(2);
  fill(100, 50, 0); // Marrom para o corpo do celeiro
  // NOVAS POSIÇÕES E TAMANHO DO CELEIRO
  rect(width - 300, height - 380, 200, 150); // Corpo (X mais à esquerda para o celeiro ficar mais centralizado no canto, Y mais alto)
  fill(150, 75, 0); // Marrom mais claro para o telhado
  triangle(width - 300, height - 380, width - 100, height - 380, width - 200, height - 460); // Telhado (ajustado para o novo corpo)
  fill(200, 100, 0); // Porta
  rect(width - 210, height - 280, 30, 50); // Porta no novo celeiro
  fill(255);
  textSize(20);
  text("Ponto de Venda", width - 200, height - 300); // Texto alinhado ao novo celeiro
}

// Função para desenhar a interface do usuário (UI)
function drawUI() {
  fill(0); // Cor do texto principal
  textSize(22);
  textStyle(BOLD);

  // Indicadores de recursos
  text(`Dinheiro: R$ ${dinheiro.toFixed(2)}`, 120, 40);
  text(`Água: ${agua.toFixed(0)}%`, 120, 75); // toFixed(0) para remover casas decimais
  text(`Solo: ${saudeSolo.toFixed(0)}%`, 120, 110);

  textStyle(BOLD); // Destaca os dias de jogo
  fill(0, 0, 150); // Cor diferente para o dia
  textSize(24);
  text(`Dia: ${diasDeJogo}`, width / 2, 40); // Centralizado na parte superior
  textStyle(NORMAL);
  fill(0); // Volta a cor padrão

  // Botões de ação (Regar e Adubar)
  let btnLargura = 120;
  let btnAltura = 50;
  let btnRegarX = width - 180;
  let btnRegarY = 40;
  let btnAdubarX = width - 180;
  let btnAdubarY = 110;

  // Botão Regar
  fill(50, 150, 50); // Cor do botão verde
  stroke(20);
  rect(btnRegarX, btnRegarY, btnLargura, btnAltura, 10);
  fill(255); // Cor do texto do botão
  textSize(18);
  text("Regar", btnRegarX + btnLargura / 2, btnRegarY + btnAltura / 2);
  textSize(14);
  text(`(R$ ${CUSTO_REGAR})`, btnRegarX + btnLargura / 2, btnRegarY + btnAltura / 2 + 18); // Exibe o custo

  // Desenha um ícone de regador simples no botão
  fill(50, 100, 200); // Azul para o corpo do regador
  ellipse(btnRegarX + 30, btnRegarY + 25, 25, 25);
  rect(btnRegarX + 35, btnRegarY + 15, 10, 20); // Alça
  rect(btnRegarX + 20, btnRegarY + 20, 10, 5); // Bico

  // Botão Adubar
  fill(150, 100, 50); // Cor do botão marrom
  stroke(20);
  rect(btnAdubarX, btnAdubarY, btnLargura, btnAltura, 10);
  fill(255); // Cor do texto do botão
  textSize(18);
  text("Adubar", btnAdubarX + btnLargura / 2, btnAdubarY + btnAltura / 2);
  textSize(14);
  text(`(R$ ${CUSTO_ADUBAR})`, btnAdubarX + btnLargura / 2, btnAdubarY + btnAltura / 2 + 18); // Exibe o custo

  // Desenha um ícone de saco de adubo simples no botão
  fill(100, 50, 0); // Cor do saco
  rect(btnAdubarX + 15, btnAdubarY + 15, 30, 25, 5);
  fill(150, 75, 0); // Boca do saco
  ellipse(btnAdubarX + 30, btnAdubarY + 15, 35, 10);
}

// Função para gerenciar a lógica do jogo (crescimento, degradação, etc.)
function gerenciarLogicaJogo() {
  // --- Atualiza os dias de jogo e a dificuldade ---
  contadorDia++;
  if (contadorDia >= TEMPO_POR_DIA) {
    diasDeJogo++;
    contadorDia = 0; // Reseta o contador para o próximo dia
    console.log(`NOVO DIA: Dia ${diasDeJogo}`);

    // Aumenta a chance de praga com o tempo
    chancePraga = min(0.8, chancePraga + AUMENTO_CHANCE_PRAGA_POR_DIA); // Limita a chance a 80%

    // Tenta adicionar uma praga a uma terra aleatória (se houver chance e terras plantadas)
    if (random() < chancePraga) {
      let terrasPlantadas = terras.filter(t => t.estado === ESTADO_PLANTADO && !t.pragaAtiva);
      if (terrasPlantadas.length > 0) {
        let terraAlvo = random(terrasPlantadas);
        terraAlvo.pragaAtiva = true;
        terraAlvo.contadorPraga = 0; // Inicia um contador para a praga
        console.log(`Praga surgiu na terra com ${terraAlvo.planta.nome}!`);
      }
    }
  }

  // Lógica de crescimento das plantas
  for (let i = 0; i < terras.length; i++) {
    let t = terras[i];
    if (t.estado === ESTADO_PLANTADO && t.planta) {
      // Degradação da planta por praga
      if (t.pragaAtiva) {
        t.contadorPraga++;
        // Se a praga ficar ativa por muito tempo, a planta murcha
        if (t.contadorPraga >= PRAGA_TEMPO_ATIVO) {
          console.log(`Planta na terra ${i+1} murchou devido à praga!`);
          t.estado = ESTADO_VAZIO;
          t.planta = null;
          t.pragaAtiva = false;
          t.contadorPraga = 0;
          continue; // Pula para a próxima terra
        }
      }

      // Fator de crescimento: quanto mais dias, mais lento o crescimento
      // Multiplicador inicial de 1.0 (normal) que diminui com os dias.
      // Ex: Dia 10: 1 - (10 * 0.05) = 0.5 de velocidade
      let velocidadeBaseCrescimento = 1 - (diasDeJogo * 0.05); // Diminui 5% da velocidade por dia
      velocidadeBaseCrescimento = max(0.1, velocidadeBaseCrescimento); // Garante que não fique muito lento (mínimo 10% da velocidade normal)

      // Saúde do solo também afeta o crescimento
      let fatorSaudeSolo = map(saudeSolo, 0, 100, 0.2, 1.0); // 0.2x a 1.0x velocidade
      let fatorCrescimentoTotal = velocidadeBaseCrescimento * fatorSaudeSolo;

      t.tempoCrescimentoAtual += fatorCrescimentoTotal;

      let progresso = t.tempoCrescimentoAtual / t.planta.tempoTotalCrescimento;

      if (progresso >= 0.95) {
        t.faseCrescimento = FASE_MADURA;
      } else if (progresso >= 0.65) {
        t.faseCrescimento = FASE_JOVEM;
      } else if (progresso >= 0.3) {
        t.faseCrescimento = FASE_BROTO;
      } else {
        t.faseCrescimento = FASE_SEMENTE;
      }
    }
  }

  // Degradação da água e solo ao longo do tempo (acelera com os dias)
  // Base de degradação: 2% água/seg, 1% solo/seg
  let fatorDegradacaoAgua = 1 + (diasDeJogo * 0.1); // Aumenta 10% da degradação por dia
  let fatorDegradacaoSolo = 1 + (diasDeJogo * 0.05); // Aumenta 5% da degradação por dia

  if (frameCount % 60 === 0) { // A cada segundo (aproximadamente)
    agua = max(0, agua - (2 * fatorDegradacaoAgua));
    saudeSolo = max(0, saudeSolo - (1 * fatorDegradacaoSolo));
  }
}

// =========================================================
// FUNÇÃO MOUSEPRESSED - Lida com os cliques do mouse
// =========================================================
function mousePressed() {
  // --- Lógica de clique nas terras ---
  for (let i = 0; i < terras.length; i++) {
    let t = terras[i];
    // Verifica se o clique ocorreu dentro da área da terra
    if (mouseX > t.x && mouseX < t.x + t.largura && mouseY > t.y && mouseY < t.y + t.altura) {

      // Prioridade: Tratar praga
      if (t.pragaAtiva) {
        if (dinheiro >= CUSTO_TRATAR_PRAGA) {
          t.pragaAtiva = false;
          t.contadorPraga = 0;
          dinheiro -= CUSTO_TRATAR_PRAGA;
          console.log(`Praga na terra ${i+1} foi tratada! Dinheiro: R$ ${dinheiro.toFixed(2)}`);
          return;
        } else {
          console.log("Dinheiro insuficiente para tratar a praga!");
          return;
        }
      }
      // Se não tem praga, verifica outras ações
      else if (t.estado === ESTADO_VAZIO) {
        // Exemplo: Planta Tomate na terra vazia.
        // Futuramente, podemos adicionar um menu de seleção de planta aqui.
        if (dinheiro >= PLANTAS.TOMATE.custo) {
          t.estado = ESTADO_PLANTADO;
          t.planta = PLANTAS.TOMATE; // Atribui a planta Tomate
          t.tempoCrescimentoAtual = 0;
          t.faseCrescimento = FASE_SEMENTE;
          dinheiro -= t.planta.custo;
          console.log(`Plantou ${t.planta.nome} na Terra ${i+1}! Dinheiro: R$ ${dinheiro.toFixed(2)}`);
          return;
        } else {
          console.log("Dinheiro insuficiente para plantar Tomate!");
        }
      } else if (t.estado === ESTADO_PLANTADO && t.faseCrescimento === FASE_MADURA) {
        // Se a planta estiver madura, colhe
        dinheiro += t.planta.valorVenda;
        t.estado = ESTADO_VAZIO;
        t.planta = null;
        console.log(`Colheu ${t.planta.nome} da Terra ${i+1}! Dinheiro: R$ ${dinheiro.toFixed(2)}`);
        return;
      }
    }
  }

  // --- Lógica para clicar nos botões da UI ---
  let btnLargura = 120;
  let btnAltura = 50;
  let btnRegarX = width - 180;
  let btnRegarY = 40;
  let btnAdubarX = width - 180;
  let btnAdubarY = 110;

  // Botão Regar
  if (mouseX > btnRegarX && mouseX < btnRegarX + btnLargura && mouseY > btnRegarY && mouseY < btnRegarY + btnAltura) {
    if (agua < 100 && dinheiro >= CUSTO_REGAR) {
      agua = min(100, agua + 25);
      dinheiro -= CUSTO_REGAR;
      console.log(`Regou! Água: ${agua.toFixed(0)}% Dinheiro: R$ ${dinheiro.toFixed(2)}`);
    } else if (agua >= 100) {
      console.log("A água já está no máximo!");
    } else {
      console.log("Dinheiro insuficiente para regar!");
    }
    return;
  }

  // Botão Adubar
  if (mouseX > btnAdubarX && mouseX < btnAdubarX + btnLargura && mouseY > btnAdubarY && mouseY < btnAdubarY + btnAltura) {
    if (saudeSolo < 100 && dinheiro >= CUSTO_ADUBAR) {
      saudeSolo = min(100, saudeSolo + 40);
      dinheiro -= CUSTO_ADUBAR;
      console.log(`Adubou! Saúde do Solo: ${saudeSolo.toFixed(0)}% Dinheiro: R$ ${dinheiro.toFixed(2)}`);
    } else if (saudeSolo >= 100) {
      console.log("A saúde do solo já está no máximo!");
    } else {
      console.log("Dinheiro insuficiente para adubar!");
    }
    return;
  }
}