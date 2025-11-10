import "@/styles/globals.css";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/plus-jakarta-sans";

import App from "./app";
import React from "react";
import ReactDOM from "react-dom/client";
import { loader } from "@monaco-editor/react";
import * as monaco from 'monaco-editor';

// Import Monaco workers
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

// Configure Monaco to use local workers instead of CDN
// This MUST be done before any Monaco Editor component is mounted
// @ts-ignore
self.MonacoEnvironment = {
  getWorker(_: any, label: string) {
    console.log('Monaco initialization: requesting worker for', label);
    try {
      if (label === 'json') {
        return new jsonWorker();
      }
      if (label === 'css' || label === 'scss' || label === 'less') {
        return new cssWorker();
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return new htmlWorker();
      }
      if (label === 'typescript' || label === 'javascript') {
        return new tsWorker();
      }
      return new editorWorker();
    } catch (error) {
      console.error('Monaco initialization: error:', error);
      throw error;
    }
  }
};

// Configure the loader to use the local Monaco instance
loader.config({ monaco });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
