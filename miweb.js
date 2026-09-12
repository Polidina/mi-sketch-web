// =========================================================
// SKETCH ADAPTADO: PANTALLA 800x600 (4:3)
// =========================================================

import processing.sound.*;

SoundFile cancion;
Amplitude amp;
float audioLevel = 0;
float umbralGlitch = 0.8; 

boolean grabando = false; 

int numElementos = 250; // Reducido ligeramente para evitar saturación en 800x600
float[] posX = new float[numElementos];
float[] posY = new float[numElementos];
float[] posZ = new float[numElementos]; 
float[] rotX = new float[numElementos];
float[] rotY = new float[numElementos];
float[] velRot = new float[numElementos];
int[] tipoElemento = new int[numElementos];

PImage[] imagenes = new PImage[7];
PImage imgInicio; 

// --- VARIABLES GLITCH ---
int glitchTimer = 0;
boolean modoGlitch = false;

// --- VARIABLES TEXTO Y SECUENCIA FINAL ---
String textoActual = "";
String textoObjetivo = ""; 
float tamanoTexto = 100; // Reducido para encajar en 800x600
int indiceCaracter = 0;
int ultimoTiempoType = 0;
boolean escribiendo = true; 
int faseFinal = 0; 
int tiempoProximaFase = 0;
boolean resetFinalHecho = false;

// --- HIT LIST ---
int[] segundosHits = {34, 35, 36, 37, 39, 40, 43, 44, 45, 51, 52, 53, 56, 57, 59, 60, 61, 64};

// --- VARIACIONES ---
String[] variacionesAyer = {
  "MAS QUE AYER", "+ que ayer", "Mas Que Ayer", "+++ Q AYER", "más q ayer", "+ QUE ayer"
};

// --- COLORES ---
color blanco = #FFFFFF;
color azulMarino = #003EDB;
color negro = #000000; 

// --- TERMINALES ---
HackerTerminal terminalIzq, terminalDer;
String[] codigoFalso1 = {
  "void initSystem() {", "  inject(KERNEL_ROOT);", "  if (!secure) override();",
  "  connect_to(NODE_07);", "  // Bypass firewall", "  while(true) sync();", "}"
};
String[] codigoFalso2 = {
  "> ESTABLISHING CONNECTION...", "> HANDSHAKE ACCEPTED", "> DOWNLOADING PACKETS...",
  "> [████████......] 65%", "> WARNING: TRACE DETECTED", "> REROUTING PROXY..."
};

void setup() {
  // --- RESOLUCIÓN 800x600 ---
  size(800, 600, P3D); 
  noSmooth();
  
  cancion = new SoundFile(this, "musica.mp3"); 
  cancion.loop(); 
  amp = new Amplitude(this);
  amp.input(cancion);
  
  // Carga de imágenes
  imagenes[0] = loadImage("data/ok.png");
  imagenes[1] = loadImage("data/sailormoon.png");
  imagenes[2] = loadImage("data/folder.png");
  imagenes[3] = loadImage("data/icarly.png");
  imagenes[4] = loadImage("data/gem.png");
  imagenes[5] = loadImage("data/mono.png");    
  imagenes[6] = loadImage("data/espejo.png");
  imgInicio = loadImage("data/corta.png"); 
  
  // *** AJUSTE DE POSICIÓN Y TAMAÑO DE TERMINALES PARA 800x600 ***
  terminalIzq = new HackerTerminal(20, 300, codigoFalso1, 50); // Abajo a la izquierda
  terminalDer = new HackerTerminal(width - 280, 300, codigoFalso2, 80); // Abajo a la derecha

  for (int i = 0; i < numElementos; i++) {
    posX[i] = random(-2000, 2000); // Rango adaptado a 800x600
    posY[i] = random(-1200, 1200); 
    posZ[i] = random(-4000, 500);  
    rotX[i] = random(TWO_PI);
    rotY[i] = random(TWO_PI);
    velRot[i] = random(-0.015, 0.015);
    if (random(1) < 0.95) tipoElemento[i] = (int)random(imagenes.length); 
    else tipoElemento[i] = imagenes.length; 
  }
}

void draw() {
  float t_song = cancion.position(); 
  int segActual = (int)t_song; 
  boolean modoTypewriter = false; 
  boolean mostrarImgInicio = false; 

  if (t_song < 31) {
    mostrarImgInicio = true; faseFinal = 0; resetFinalHecho = false;
  } else if (t_song >= 78) {
    modoTypewriter = true; tamanoTexto = 80; // Reducido para 800x600
    if (!resetFinalHecho) { textoActual = ""; indiceCaracter = 0; resetFinalHecho = true; }
    if (millis() > tiempoProximaFase) {
      switch(faseFinal) {
        case 0: textoObjetivo = "TRUST IN\nTHE POTENTIAL"; escribiendo = true; if (textoActual.equals(textoObjetivo)) { faseFinal = 1; tiempoProximaFase = millis() + 2000; } break;
        case 1: escribiendo = false; if (textoActual.length() == 0) { faseFinal = 2; tiempoProximaFase = millis() + 500; } break;
        case 2: textoObjetivo = "POLIDINA"; escribiendo = true; if (textoActual.equals(textoObjetivo)) { faseFinal = 3; tiempoProximaFase = millis() + 2000; } break;
        case 3: escribiendo = false; if (textoActual.length() == 0) { faseFinal = 4; tiempoProximaFase = millis() + 500; } break;
        case 4: textoObjetivo = "CONFIA EN\nTU POTENCIAL"; escribiendo = true; break;
      }
    }
  } else {
    if (t_song >= 31 && t_song < 34) {
      textoActual = "y yo siempre\nsueño que me amas"; tamanoTexto = 50; // Reducido para 800x600
    } else {
      boolean esHit = false;
      for (int s : segundosHits) { if (segActual == s) { esHit = true; break; } }
      if (esHit) {
        int indice = segActual % variacionesAyer.length;
        textoActual = variacionesAyer[indice];
        tamanoTexto = map(indice, 0, variacionesAyer.length, 70, 100); // Reducido
      } else {
        textoActual = "";
      }
    }
  }

  if (modoTypewriter) {
    int velocidad = escribiendo ? 100 : 30; 
    if (millis() - ultimoTiempoType > velocidad) {
      if (escribiendo) { if (indiceCaracter < textoObjetivo.length()) indiceCaracter++; } 
      else { if (indiceCaracter > 0) indiceCaracter--; }
      indiceCaracter = constrain(indiceCaracter, 0, textoObjetivo.length());
      if (escribiendo) textoActual = textoObjetivo.substring(0, indiceCaracter);
      else if (textoActual.length() > 0) textoActual = textoActual.substring(0, textoActual.length() - 1);
      ultimoTiempoType = millis();
    }
  }

  audioLevel = amp.analyze();
  if (audioLevel > umbralGlitch && glitchTimer == 0) glitchTimer = 8;
  modoGlitch = (glitchTimer > 0);
  if (modoGlitch) glitchTimer--;

  float t_color = map(sin(frameCount * 0.003), -1, 1, 0, 2);
  color colorFondo, colorTexto;
  if (!modoGlitch) {
    if (t_color < 1) { colorFondo = lerpColor(blanco, azulMarino, t_color); colorTexto = lerpColor(azulMarino, blanco, t_color); } 
    else { colorFondo = lerpColor(azulMarino, negro, t_color - 1); colorTexto = blanco; }
  } else { colorFondo = color(random(255), random(50), random(50)); colorTexto = color(255); }
  background(colorFondo);
  
  pushMatrix(); 
  if (modoGlitch) {
    float shake = audioLevel * 50; // Reducido acorde a la nueva pantalla
    translate(random(-shake, shake), random(-shake, shake), random(-shake, shake));
    rotateZ(random(-0.2, 0.2));
  }

  pushMatrix();
  translate(width/2, height/2, -1500); // Profundidad ajustada
  if (mostrarImgInicio && imgInicio != null) {
    imageMode(CENTER);
    tint(colorTexto, 200); 
    image(imgInicio, 0, 0, 700, 500); // Tamaño ajustado a proporción 800x600
    noTint(); 
  } else {
    fill(colorTexto, 90); textAlign(CENTER, CENTER); textSize(tamanoTexto); text(textoActual, 0, 0);
  }
  popMatrix();

  pushMatrix();
  translate(width/2, height/2, 0); rotateY(frameCount * 0.002); rotateZ(frameCount * 0.001);
  for (int i = 0; i < numElementos; i++) {
    posZ[i] += 5; if (posZ[i] > 500) { posZ[i] = -4000; posX[i] = random(-2000, 2000); posY[i] = random(-1200, 1200); }
    pushMatrix(); translate(posX[i], posY[i], posZ[i]); rotateX(rotX[i] + frameCount * velRot[i]); rotateY(rotY[i] + frameCount * velRot[i]);
    if (tipoElemento[i] < imagenes.length) { 
      PImage img = imagenes[tipoElemento[i]];
      if (img != null && img.width > 0) {
        noStroke(); if (modoGlitch) tint(255, 0, 0); else noTint(); fill(255); 
        beginShape(QUAD); texture(img); vertex(-80, -80, 0, 0, 0); vertex(80, -80, 0, img.width, 0); vertex(80, 80, 0, img.width, img.height); vertex(-80, 80, 0, 0, img.height); endShape(); // Elementos 3D reducidos de 200 a 80
      }
    } else { fill(modoGlitch ? color(255, 255, 0) : 255); textAlign(CENTER, CENTER); textSize(30); text(modoGlitch ? "ERROR" : "+++", 0, 0); }
    popMatrix();
  }
  popMatrix(); popMatrix(); 

  hint(DISABLE_DEPTH_TEST); camera(); noLights();
  if (modoGlitch) { for (int i = 0; i < 5; i++) { fill(random(255), 0, 0, random(200)); rect(0, random(height), width, random(5, 50)); } }
  terminalIzq.update(); terminalIzq.display(colorTexto); terminalDer.update(); terminalDer.display(colorTexto);
  if (grabando) { saveFrame("frames/img-######.png"); fill(255, 0, 0); noStroke(); ellipse(width-40, 40, 25, 25); }
  hint(ENABLE_DEPTH_TEST); 
}

void keyPressed() { if (key == 'q' || key == 'Q') { grabando = !grabando; println("Grabación: " + grabando); } }

class HackerTerminal {
  float x, y; String[] lineasBase; ArrayList<String> lineasEnPantalla; int currentLineIdx = 0, currentCharIdx = 0, lastTypingTime = 0, typingSpeed;
  HackerTerminal(float x, float y, String[] lineas, int speed) { this.x = x; this.y = y; this.lineasBase = lineas; this.typingSpeed = speed; this.lineasEnPantalla = new ArrayList<String>(); this.lineasEnPantalla.add(""); }
  void update() { 
    if (millis() - lastTypingTime > typingSpeed) { 
      String linea = lineasBase[currentLineIdx]; 
      String actual = lineasEnPantalla.get(lineasEnPantalla.size()-1); 
      if (currentCharIdx < linea.length()) { 
        actual += linea.charAt(currentCharIdx); 
        lineasEnPantalla.set(lineasEnPantalla.size()-1, actual); 
        currentCharIdx++; 
      } else { 
        currentLineIdx = (currentLineIdx + 1) % lineasBase.length; 
        currentCharIdx = 0; 
        lineasEnPantalla.add(""); 
        if (lineasEnPantalla.size() > 5) lineasEnPantalla.remove(0); // Reducido para evitar solapamiento vertical en 600px
      } 
      lastTypingTime = millis(); 
    } 
  }
  void display(color c) { 
    fill(c); 
    textAlign(LEFT, TOP); 
    textSize(16); // Reducido de 32 a 16 para que quepa bien
    String t = ""; 
    for (String s : lineasEnPantalla) t += s + "\n"; 
    if (frameCount % 60 < 30) t += "_"; 
    text(t, x, y); 
  }
}
