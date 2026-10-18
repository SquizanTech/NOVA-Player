
const form = document.getElementById("magnet-form");
const input = document.getElementById("magnet");
const player = document.getElementById("player");
const message = document.getElementById("message");
const button = form.querySelector("button");

let sdkLoaded = false;
let sdkLoading = false;

function loadWebtor() {
  return new Promise((resolve, reject) => {
    if (sdkLoaded) {
      resolve();
      return;
    }

    if (sdkLoading) {
      const check = setInterval(() => {
        if (sdkLoaded) {
          clearInterval(check);
          resolve();
        }
      }, 200);

      setTimeout(() => {
        clearInterval(check);
        if (!sdkLoaded) reject(new Error("Webtor tardó demasiado."));
      }, 15000);

      return;
    }

    sdkLoading = true;

    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/@webtor/embed-sdk-js/dist/index.min.js";
    script.async = true;

    script.onload = () => {
      sdkLoaded = true;
      sdkLoading = false;
      resolve();
    };

    script.onerror = () => {
      sdkLoading = false;
      reject(new Error("No se pudo cargar el reproductor de Webtor."));
    };

    document.body.appendChild(script);
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const magnet = input.value.trim();

  if (!/^magnet:\?xt=urn:btih:/i.test(magnet)) {
    message.textContent = "Introduce un enlace magnet válido.";
    input.focus();
    return;
  }

  button.disabled = true;
  button.textContent = "CARGANDO...";
  message.textContent = "Conectando con Webtor…";

  player.innerHTML = `
    <div class="player-placeholder">
      <div class="play-icon">⏳</div>
      <h2>Preparando reproducción</h2>
      <p>Puede tardar un poco según el torrent.</p>
    </div>
  `;

  try {
    await loadWebtor();

    // Reiniciamos el contenedor para el nuevo enlace.
    player.innerHTML = "";
    player.id = "webtor-player";

    window.webtor = window.webtor || [];
    window.webtor.push({
      id: "webtor-player",
      magnet: magnet,
      width: "100%",
      height: "100%",
      lang: "es",
      userLang: "es",
      features: {
        subtitles: true,
        settings: true,
        fullscreen: true,
        playpause: true,
        currentTime: true,
        timeline: true,
        duration: true,
        volume: true
      }
    });

    message.textContent =
      "Enlace enviado. Espera a que Webtor encuentre y prepare el vídeo.";
  } catch (error) {
    message.textContent = error.message;
    player.innerHTML = `
      <div class="player-placeholder">
        <h2>No se pudo cargar</h2>
        <p>Comprueba tu conexión e inténtalo de nuevo.</p>
      </div>
    `;
  } finally {
    button.disabled = false;
    button.innerHTML = 'REPRODUCIR <span>▶</span>';
  }
});
