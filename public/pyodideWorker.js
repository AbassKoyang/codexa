importScripts("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js");

let pyodide;
let controlBuffer;
let dataBuffer;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function init(cb, db) {
  try {
    controlBuffer = cb;
    dataBuffer = db;
    
    pyodide = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/",
    });

    pyodide.setStdout({
      batched: (text) => postMessage({ type: 'stdout', content: text })
    });

    pyodide.setStderr({
      batched: (text) => postMessage({ type: 'stderr', content: text })
    });

    // Define the sync input bridge
    const sync_input = (prompt) => {
      postMessage({ type: 'input', prompt });
      Atomics.store(controlBuffer, 0, 0); 
      Atomics.wait(controlBuffer, 0, 0);
      const length = Atomics.load(controlBuffer, 1);
      const sharedView = new Uint8Array(dataBuffer.buffer, dataBuffer.byteOffset, length);
      
      // Copy to a non-shared buffer because TextDecoder.decode 
      // doesn't support SharedArrayBuffer views
      const nonSharedBuffer = new Uint8Array(length);
      nonSharedBuffer.set(sharedView);
      
      return decoder.decode(nonSharedBuffer);
    };

    pyodide.globals.set("sync_input", sync_input);

    pyodide.runPython(`
import builtins
from __main__ import sync_input

def custom_input(prompt=""):
    return sync_input(prompt)

builtins.input = custom_input
    `);

    postMessage({ type: 'ready' });
  } catch (err) {
    postMessage({ type: 'error', message: `Initialization failed: ${err.message}` });
  }
}

onmessage = async (e) => {
  try {
    const { type, code, fileTree, fileName, controlBuffer: cb, dataBuffer: db } = e.data;

    if (type === 'init') {
      await init(cb, db);
      return;
    }

    if (type === 'run') {
      // ... existing run logic ...
      const syncFS = (nodes, path = "/") => {
        nodes.forEach(node => {
          const fullPath = `${path}${node.name}`;
          if (node.type === "file") {
            pyodide.FS.writeFile(fullPath, node.content || "");
          } else {
            try { pyodide.FS.mkdir(fullPath); } catch (e) {}
            syncFS(node.children, `${fullPath}/`);
          }
        });
      };
      syncFS(fileTree);

      await pyodide.runPythonAsync(code);
      postMessage({ type: 'finished' });
    }
  } catch (err) {
    postMessage({ type: 'error', message: err.message });
  }
};
