// =========================================================
// SKETCH ADAPTADO A P5.JS (WEB) - PANTALLA 800x600 (4:3)
// =========================================================

let cancion;
let amp;
let audioLevel = 0;
let umbralGlitch = 0.8; 

let grabando = false; 

let numElementos = 250; 
let posX = new Array(numElementos);
let posY = new Array(numElementos);
let posZ = new Array(numElementos); 
let rotX = new Array(numElementos);
let rotY = new Array(numElementos);
let velRot = new Array(numElementos);
let tipoElemento = new Array(numElementos);

let imagenes = [];
let imgInicio; 

// --- VARIABLES GLITCH ---
let glitchTimer = 0;
let modoGlitch = false;

// --- VARIABLES TEXTO Y SECUENCIA FINAL ---
let textoActual = "";
let textoObjetivo = ""; 
let tamanoTexto = 100; 
let indiceCaracter = 0;
let ultimoTiempoType = 0;
let escribiendo = true; 
let faseFinal = 0; 
let tiempoProximaFase = 0;
let resetFinalHecho = false;

// --- HIT LIST ---
let segundosHits = [34, 35, 36, 37, 39, 40, 43, 44, 45, 51, 52, 53, 56, 57, 59, 60, 61, 64];

// --- VARIACIONES ---
let variacionesAyer = [
  "MAS QUE AYER", "+ que ayer", "Mas Que Ayer", "+++ Q AYER", "más q ayer", "+ QUE ayer"
];

// --- COLORES ---
let blanco, azulMarino, negro;

// --- TERMINALES ---
let terminalIzq, terminalDer;
let codigoFalso1 = [
  "void initSystem() {", "  inject(KERNEL_ROOT);", "  if (!secure) override();",
  "  connect_to(NODE_07);", "  // Bypass firewall", "  while(true) sync();", "}"
];
let codigoFalso2 = [
  "> ESTABLISHING CONNECTION...", "> HANDSHAKE ACCEPTED", "> DOWNLOADING PACKETS...",
  "> [████████......] 65%", "> WARNING: TRACE DETECTED", "> REROUTING PROXY..."
];

function preload() {
  // Carga de audio e imágenes de forma asíncrona para la web
  cancion = loadSound("musica.mp3");
  
  imagenes[0] = loadImage("data/ok.png");
  imagenes[1] = loadImage("data/sailormoon.png");
  imagenes[2] = loadImage("data/folder.png");
  imagenes[3] = loadImage("data/icarly.png");
  imagenes[4] = loadImage("data/gem.png");
  imagenes[5] = loadImage("data/mono.png");     
  imagenes[6] = loadImage("data/espejo.png");
  imgInicio = loadImage("data/corta.png");
}

function setup() {
  createCanvas(800, 600, WEBGL); 
  noSmooth();
  
  cancion.loop(); 
  amp = new p5.Amplitude();
  amp.setInput(cancion);
  
  blanco = color(255, 255, 255);
  azulMarino = color(0, 62, 219);
  negro = color(0, 0, 0);

  terminalIzq = new HackerTerminal(20 - width/2, 300 - height/2, codigoFalso1, 50); 
  terminalDer = new HackerTerminal((width - 280) - width/2, 300 - height/2, codigoFalso2, 80); 

  for (let i = 0; i < numElementos; i++) {
    posX[i] = random(-2000, 2000); 
    posY[i] = random(-1200, 1200); 
    posZ[i] = random(-4000, 500);  
    rotX[i] = random(TWO_PI);
    rotY[i] = random(TWO_PI);
    velRot[i] = random(-0.015, 0.015);
    if (random(1) < 0.95) tipoElemento[i] = floor(random(imagenes.length)); 
    else tipoElemento[i] = imagenes.length; 
  }
}

function draw() {
  let t_song = cancion.currentTime(); 
  let segActual = floor(t_song); 
  let modoTypewriter = false; 
  let mostrarImgInicio = false; 

  if (t_song < 31) {
    mostrarImgInicio = true; faseFinal = 0; resetFinalHecho = false;
  } else if (t_song >= 78) {
    modoTypewriter = true; tamanoTexto = 80; 
    if (!resetFinalHecho) { textoActual = ""; indiceCaracter = 0; resetFinalHecho = true; }
    if (millis() > tiempoProximaFase) {
      switch(faseFinal) {
        case 0: textoObjetivo = "TRUST IN\nTHE POTENTIAL"; escribiendo = true; if (textoActual === textoObjetivo) { faseFinal = 1; tiempoProximaFase = millis() + 2000; } break;
        case 1: escribiendo = false; if (textoActual.length === 0) { faseFinal = 2; tiempoProximaFase = millis() + 500; } break;
        case 2: textoObjetivo = "POLIDINA"; escribiendo = true; if (textoActual === textoObjetivo) { faseFinal = 3; tiempoProximaFase = millis() + 2000; } break;
        case 3: escribiendo = false; if (textoActual.length === 0) { faseFinal = 4; tiempoProximaFase = millis() + 500; } break;
        case 4: textoObjetivo = "CONFIA EN\nTU POTENCIAL"; escribiendo = true; break;
      }
    }
  } else {
    if (t_song >= 31 && t_song < 34) {
      textoActual = "y yo siempre\nsueño que me amas"; tamanoTexto = 50; 
    } else {
      let esHit = false;
      for (let s of segundosHits) { if (segActual === s) { esHit = true; break; } }
      if (esHit) {
        let indice = segActual % variacionesAyer.length;
        textoActual = variacionesAyer[indice];
        tamanoTexto = map(indice, 0, variacionesAyer.length, 70, 100); 
      } else {
        textoActual = "";
      }
    }
  }

  if (modoTypewriter) {
    let velocidad = escribiendo ? 100 : 30; 
    if (millis() - ultimoTiempoType > velocidad) {
      if (escribiendo) { if (indiceCaracter < textoObjetivo.length()) indiceCaracter++; } 
      else { if (indiceCaracter > 0) indiceCaracter--; }
      indiceCaracter = constrain(indiceCaracter, 0, textoObjetivo.length());
      if (escribiendo) textoActual = textoObjetivo.substring(0, indiceCaracter);
      else if (textoActual.length > 0) textoActual = textoActual.substring(0, textoActual.length - 1);
      ultimoTiempoType = millis();
    }
  }

  audioLevel = amp.getLevel();
  if (audioLevel > umbralGlitch && glitchTimer === 0) glitchTimer = 8;
  modoGlitch = (glitchTimer > 0);
  if (modoGlitch) glitchTimer--;

  let t_color = map(sin(frameCount * 0.003), -1, 1, 0, 2);
  let colorFondo, colorTexto;
  if (!modoGlitch) {
    if (t_color < 1) { colorFondo = lerpColor(blanco, azulMarino, t_color); colorTexto = lerpColor(azulMarino, blanco, t_color); } 
    else { colorFondo = lerpColor(azulMarino, negro, t_color - 1); colorTexto = blanco; }
  } else { colorFondo = color(random(255), random(50), random(50)); colorTexto = color(255); }
  background(colorFondo);
  
  push(); 
  if (modoGlitch) {
    let shake = audioLevel * 50; 
    translate(random(-shake, shake), random(-shake, shake), random(-shake, shake));
    rotateZ(random(-0.2, 0.2));
  }

  push();
  translate(0, 0, -1500); 
  if (mostrarImgInicio && imgInicio) {
    imageMode(CENTER);
    tint(colorTexto, 200); 
    image(imgInicio, 0, 0, 700, 500); 
    noTint(); 
  } else {
    fill(colorTexto, 90); textAlign(CENTER, CENTER); textSize(tamanoTexto); text(textoActual, 0, 0);
  }
  pop();

  push();
  translate(0, 0, 0); rotateY(frameCount * 0.002); rotateZ(frameCount * 0.001);
  for (let i = 0; i < numElementos; i++) {
    posZ[i] += 5; if (posZ[i] > 500) { posZ[i] = -4000; posX[i] = random(-2000, 2000); posY[i] = random(-1200, 1200); }
    push(); translate(posX[i], posY[i], posZ[i]); rotateX(rotX[i] + frameCount * velRot[i]); rotateY(rotY[i] + frameCount * velRot[i]);
    if (tipoElemento[i] < imagenes.length) { 
      let img = imagenes[tipoElemento[i]];
      if (img && img.width > 0) {
        noStroke(); if (modoGlitch) tint(255, 0, 0); else noTint(); fill(255); 
        beginShape(QUADS); texture(img); vertex(-80, -80, 0, 0, 0); vertex(80, -80, 0, img.width, 0); vertex(80, 80, 0, img.width, img.height); vertex(-80, 80, 0, 0, img.height); endShape(); 
      }
    } else { fill(modoGlitch ? color(255, 255, 0) : 255); textAlign(CENTER, CENTER); textSize(30); text(modoGlitch ? "ERROR" : "+++", 0, 0); }
    pop();
  }
  pop(); pop(); 

  // Interfaz superpuesta (fuera del espacio 3D para terminales)
  resetMatrix();
  camera();
  noLights();
  
  if (modoGlitch) { 
    for (let i = 0; i < 5; i++) { 
      fill(random(255), 0, 0, random(200)); 
      rect(0, random(height), width, random(5, 50)); 
    } 
  }
  
  terminalIzq.update(); terminalIzq.display(colorTexto); 
  terminalDer.update(); terminalDer.display(colorTexto);
  
  if (grabando) { 
    fill(255, 0, 0); noStroke(); ellipse(width-40, 40, 25, 25); 
  }
}

function keyPressed() { 
  if (key === 'q' || key === 'Q') { 
    grabando = !grabando; 
    console.log("Grabación: " + grabando); 
  } 
}

class HackerTerminal {
  constructor(x, y, lineas, speed) {
    this.x = x; 
    this.y = y; 
    this.lineasBase = lineas; 
    this.typingSpeed = speed; 
    this.lineasEnPantalla = []; 
    this.lineasEnPantalla.push("");
    this.currentLineIdx = 0;
    this.currentCharIdx = 0;
    this.lastTypingTime = 0;
  }
  
  update() { 
    if (millis() - this.lastTypingTime > this.typingSpeed) { 
      let linea = this.lineasBase[this.currentLineIdx]; 
      let actual = this.lineasEnPantalla[this.lineasEnPantalla.length - 1]; 
      if (this.currentCharIdx < linea.length()) { 
        actual += linea.charAt(this.currentCharIdx); 
        this.lineasEnPantalla[this.lineasEnPantalla.length - 1] = actual; 
        this.currentCharIdx++; 
      } else { 
        this.currentLineIdx = (this.currentLineIdx + 1) % this.lineasBase.length; 
        this.currentCharIdx = 0; 
        this.lineasEnPantalla.push(""); 
        if (this.lineasEnPantalla.size > 5) this.lineasEnPantalla.shift(); 
      } 
      this.lastTypingTime = millis(); 
    } 
  }
  
  display(c) { 
    fill(c); 
    textAlign(LEFT, TOP); 
    textSize(16); 
    let t = ""; 
    for (let s of this.lineasEnPantalla) t += s + "\n"; 
    if (frameCount % 60 < 30) t += "_"; 
    text(t, this.x, this.y); 
  }
}
