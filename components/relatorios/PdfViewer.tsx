import { useMemo } from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";

type PdfViewerProps = {
  // Conteúdo do PDF em base64
  base64: string;
  onError?: (message: string) => void;
};

const PDFJS_VERSION = "3.11.174";
const PDFJS_BASE = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}`;

// Visualizador de PDF para o Expo Go: renderiza as páginas com PDF.js dentro
// de uma WebView (a biblioteca vem do cdnjs; o PDF em si nunca sai do aparelho).
// Ao migrar para o APK, basta trocar o corpo deste componente por um
// visualizador nativo (ex.: react-native-pdf) mantendo as mesmas props.
function buildHtml(base64: string) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=5, user-scalable=yes" />
<style>
  html, body { margin: 0; padding: 0; background: #e2e8f0; }
  #pages { padding: 8px 0 24px; }
  canvas { display: block; margin: 0 auto 10px; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.2); }
  #status { font: 14px sans-serif; color: #475569; text-align: center; padding: 32px 16px; }
</style>
</head>
<body>
<div id="status">Carregando PDF...</div>
<div id="pages"></div>
<script src="${PDFJS_BASE}/pdf.min.js"></script>
<script>
  function notify(type, message) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, message: message }));
  }

  (async function () {
    try {
      if (!window.pdfjsLib) throw new Error('Não foi possível carregar o visualizador. Verifique sua conexão.');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '${PDFJS_BASE}/pdf.worker.min.js';

      var raw = atob('${base64}');
      var bytes = new Uint8Array(raw.length);
      for (var i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);

      var pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      var container = document.getElementById('pages');
      var width = document.documentElement.clientWidth - 16;
      var ratio = Math.min(window.devicePixelRatio || 1, 3);

      for (var n = 1; n <= pdf.numPages; n++) {
        var page = await pdf.getPage(n);
        var base = page.getViewport({ scale: 1 });
        var scale = width / base.width;
        var viewport = page.getViewport({ scale: scale * ratio });

        var canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = width + 'px';
        canvas.style.height = (viewport.height / ratio) + 'px';
        container.appendChild(canvas);

        await page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport }).promise;
        if (n === 1) document.getElementById('status').style.display = 'none';
      }
      notify('ready', String(pdf.numPages));
    } catch (e) {
      document.getElementById('status').textContent = 'Não foi possível exibir o PDF.';
      notify('error', (e && e.message) || 'Erro ao exibir o PDF.');
    }
  })();
</script>
</body>
</html>`;
}

export function PdfViewer({ base64, onError }: PdfViewerProps) {
  const html = useMemo(() => buildHtml(base64), [base64]);

  return (
    <View className="flex-1 bg-slate-200">
      <WebView
        originWhitelist={["*"]}
        source={{ html, baseUrl: "https://localhost" }}
        javaScriptEnabled
        scalesPageToFit
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === "error") onError?.(data.message);
          } catch {
            // mensagem fora do formato esperado: ignora
          }
        }}
        onError={() => onError?.("Não foi possível abrir o visualizador.")}
      />
    </View>
  );
}
