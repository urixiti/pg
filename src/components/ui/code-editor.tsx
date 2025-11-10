import { FC, useEffect } from "react";
import { cn } from "@/utils/classnames";
import { Editor, EditorProps, useMonaco } from "@monaco-editor/react";
import { useDarkMode } from "../hooks/use-dark-mode";

// Define custom themes when Monaco is loaded
const setupThemes = (monacoInstance: any) => {
  if (!monacoInstance) return;

  try {
    monacoInstance.editor.defineTheme("tr-light", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#ffffff00",
      },
    });

    monacoInstance.editor.defineTheme("tr-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#00000000",
      },
    });
  } catch (error) {
    console.error('Error setting up Monaco themes:', error);
  }
};

export const CodeEditor: FC<EditorProps> = ({
  options,
  className,
  ...props
}) => {
  const { isDarkMode } = useDarkMode();
  const monaco = useMonaco();

  // Setup themes when Monaco is loaded
  useEffect(() => {
    if (monaco) {
      setupThemes(monaco);
    }
  }, [monaco]);

  return (
    <Editor
      className={cn(className)}
      theme={isDarkMode ? "tr-dark" : "tr-light"}
      options={{
        fontLigatures: true,
        fontFamily: "JetBrains Mono",
        minimap: {
          enabled: false,
        },
        ...options,
      }}
      {...props}
    />
  );
};
