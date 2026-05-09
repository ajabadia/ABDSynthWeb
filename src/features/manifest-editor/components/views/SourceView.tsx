'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';

interface SourceViewProps {
  tabId: string;
  manifestId: string;
  value: string;
  language?: 'json';
  editorViewState?: unknown | null;
  onChange: (nextValue: string) => void;
  onCaptureViewState: (viewState: unknown) => void;
}

export function SourceView({
  tabId,
  manifestId,
  value,
  language = 'json',
  editorViewState,
  onChange,
  onCaptureViewState,
}: SourceViewProps) {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);
  const lastModelUriRef = useRef<string | null>(null);
  
  // Refs to avoid useEffect re-runs when callbacks change
  const onChangeRef = useRef(onChange);
  const onCaptureViewStateRef = useRef(onCaptureViewState);

  useEffect(() => {
    onChangeRef.current = onChange;
    onCaptureViewStateRef.current = onCaptureViewState;
  }, [onChange, onCaptureViewState]);

  const modelPath = useMemo(
    () => `file:///omega/${manifestId}/${tabId}.${language}`,
    [manifestId, tabId, language]
  );

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      enableSchemaRequest: false,
      schemas: [
        {
          uri: 'https://omega.abd.io/schemas/manifest.json',
          fileMatch: ['*'],
          schema: {
            type: 'object',
            required: ['id', 'type', 'metadata'],
            properties: {
              id: { type: 'string' },
              type: { enum: ['control', 'jack', 'processor'] },
              metadata: { type: 'object' },
              ui: { type: 'object' },
              containers: { type: 'array' }
            }
          }
        }
      ],
    });

    // Initial model setup on mount if refs are ready
    const uri = monaco.Uri.parse(modelPath);
    let model = monaco.editor.getModel(uri);
    if (!model) {
      model = monaco.editor.createModel(value, language, uri);
    }
    editor.setModel(model);
    if (editorViewState) {
      editor.restoreViewState(editorViewState as any);
    }
    lastModelUriRef.current = modelPath;
  };

  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    const uri = monaco.Uri.parse(modelPath);

    // 1. If we are switching MODELS
    if (lastModelUriRef.current && lastModelUriRef.current !== modelPath) {
      // Capture state of the OLD model
      const oldUri = monaco.Uri.parse(lastModelUriRef.current);
      const oldModel = monaco.editor.getModel(oldUri);
      if (oldModel) {
        onCaptureViewStateRef.current(editor.saveViewState());
      }

      // Load/Create NEW model
      let model = monaco.editor.getModel(uri);
      if (!model) {
        model = monaco.editor.createModel(value, language, uri);
      }
      editor.setModel(model);
      
      // Restore state if available for the new model
      if (editorViewState) {
        editor.restoreViewState(editorViewState as any);
      }
      
      lastModelUriRef.current = modelPath;
    } else {
      // 2. We are in the SAME model, just checking for external value updates
      const model = editor.getModel();
      if (model && model.getValue() !== value) {
        model.setValue(value);
      }
    }
  }, [modelPath, value, language]); // Removed editorViewState and callbacks from here to break the loop

  // Handle unmount capture
  useEffect(() => {
    return () => {
      if (editorRef.current) {
        onCaptureViewStateRef.current(editorRef.current.saveViewState());
      }
    };
  }, []);

  return (
    <div className="h-full w-full overflow-hidden wb-bg">
      <Editor
        height="100%"
        defaultLanguage={language}
        theme="vs-dark"
        onMount={handleMount}
        onChange={(next) => onChangeRef.current(next ?? '')}
        options={{
          minimap: { enabled: false },
          fontSize: 12,
          automaticLayout: true,
          wordWrap: 'on',
          tabSize: 2,
          renderWhitespace: 'selection',
          formatOnPaste: true,
          formatOnType: true,
          padding: { top: 16, bottom: 16 },
          scrollbar: {
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
        }}
      />
    </div>
  );
}
