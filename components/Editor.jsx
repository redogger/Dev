"use client";
import { useRef, useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";
import dynamic from "next/dynamic";
const MonacoEditor = dynamic(()=>import("@monaco-editor/react"),{ssr:false});

const CLASSIC_THEME = {
  base:"vs", inherit:true,
  rules:[
    {token:"comment",foreground:"006400",fontStyle:"italic"},
    {token:"keyword",foreground:"00008b",fontStyle:"bold"},
    {token:"string",foreground:"a31515"},
    {token:"number",foreground:"098658"},
    {token:"type",foreground:"800080"},
    {token:"function",foreground:"0000aa"},
    {token:"operator",foreground:"000000"},
  ],
  colors:{
    "editor.background":"#ffffff","editor.foreground":"#000000",
    "editor.lineHighlightBackground":"#f5f5f0","editorCursor.foreground":"#000000",
    "editorLineNumber.foreground":"#777777","editorGutter.background":"#e8e6de",
    "editor.selectionBackground":"#3169c455","editorWidget.background":"#d4d0c8",
    "editorWidget.border":"#919b9c","scrollbarSlider.background":"#b8b4ac",
  },
};
const MIDNIGHT_THEME = {
  base:"vs-dark", inherit:true,
  rules:[
    {token:"comment",foreground:"8b949e",fontStyle:"italic"},
    {token:"keyword",foreground:"ff7b72"},
    {token:"string",foreground:"a5d6ff"},
    {token:"number",foreground:"79c0ff"},
    {token:"type",foreground:"ffa657"},
    {token:"function",foreground:"d2a8ff"},
    {token:"operator",foreground:"ff7b72"},
  ],
  colors:{
    "editor.background":"#0d1117","editor.foreground":"#c9d1d9",
    "editor.lineHighlightBackground":"#161b2266","editorCursor.foreground":"#58a6ff",
    "editorLineNumber.foreground":"#484f58","editorGutter.background":"#161b22",
    "editor.selectionBackground":"#264f78","editorWidget.background":"#161b22",
    "editorWidget.border":"#30363d","scrollbarSlider.background":"#30363d88",
  },
};
const NEON_THEME = {
  base:"vs-dark", inherit:true,
  rules:[
    {token:"comment",foreground:"334466",fontStyle:"italic"},
    {token:"keyword",foreground:"ff00cc"},
    {token:"string",foreground:"00ffcc"},
    {token:"number",foreground:"ffcc00"},
    {token:"type",foreground:"ff6600"},
    {token:"function",foreground:"00ff88"},
    {token:"operator",foreground:"ff00cc"},
  ],
  colors:{
    "editor.background":"#080810","editor.foreground":"#d0d0ff",
    "editor.lineHighlightBackground":"#0d0d1a","editorCursor.foreground":"#00ff88",
    "editorLineNumber.foreground":"#334466","editorGutter.background":"#0d0d1a",
    "editor.selectionBackground":"#00ff8825","editorWidget.background":"#0d0d1a",
    "editorWidget.border":"#00ff8833","scrollbarSlider.background":"#00ff8820",
  },
};
const THEME_MAP = {
  classic: {name:"classic-devcpp",def:CLASSIC_THEME},
  midnight:{name:"midnight-eng",def:MIDNIGHT_THEME},
  neon:    {name:"neon-hacker",def:NEON_THEME},
};
const isMobile = ()=>typeof window!=="undefined"&&(window.innerWidth<768||"ontouchstart" in window);

export default function EditorPanel({ code, onChange, onSearch }) {
  const {theme} = useTheme();
  const editorRef=useRef(null), monacoRef=useRef(null);
  const [ready,setReady]=useState(false);
  const mobile=isMobile();

  function beforeMount(monaco) {
    monacoRef.current=monaco;
    Object.values(THEME_MAP).forEach(({name,def})=>monaco.editor.defineTheme(name,def));
    monaco.languages.registerCompletionItemProvider("cpp",{
      provideCompletionItems:(model,pos)=>{
        const word=model.getWordUntilPosition(pos);
        const range={startLineNumber:pos.lineNumber,endLineNumber:pos.lineNumber,startColumn:word.startColumn,endColumn:word.endColumn};
        return {suggestions:[
          {label:"cout",kind:14,insertText:"cout << ",range},
          {label:"cin",kind:14,insertText:"cin >> ",range},
          {label:"endl",kind:14,insertText:"endl",range},
          {label:"string",kind:7,insertText:"string ",range},
          {label:"vector",kind:7,insertText:"vector<${1:int}> ${2:v};",insertTextRules:4,range},
          {label:"for-loop",kind:14,insertText:"for(int ${1:i}=0;${1:i}<${2:n};${1:i}++){\n\t$0\n}",insertTextRules:4,range},
          {label:"while-loop",kind:14,insertText:"while(${1:cond}){\n\t$0\n}",insertTextRules:4,range},
          {label:"if-else",kind:14,insertText:"if(${1:cond}){\n\t$0\n}else{\n\t\n}",insertTextRules:4,range},
          {label:"struct",kind:7,insertText:"struct ${1:Name}{\n\t$0\n};",insertTextRules:4,range},
          {label:"class",kind:7,insertText:"class ${1:Name}{\npublic:\n\t$0\n};",insertTextRules:4,range},
        ]};
      },
    });
  }

  function onMount(editor, monaco) {
    editorRef.current=editor; setReady(true);
    editor.updateOptions({
      fontSize:mobile?12:13, lineHeight:mobile?20:22,
      fontFamily:theme.monoFont, fontLigatures:!mobile,
      minimap:{enabled:!mobile},
      scrollbar:{vertical:"visible",horizontal:"visible",verticalScrollbarSize:6,horizontalScrollbarSize:6},
      padding:{top:14,bottom:14},
      cursorBlinking:mobile?"solid":"smooth",
      smoothScrolling:!mobile,
      wordWrap:mobile?"on":"off",
      tabSize:4, insertSpaces:true,
      renderLineHighlight:"line",
      bracketPairColorization:{enabled:true},
      // Mobile fixes
      contextmenu:!mobile,
      quickSuggestions:!mobile,
      parameterHints:{enabled:!mobile},
      suggestOnTriggerCharacters:!mobile,
      acceptSuggestionOnEnter:mobile?"off":"on",
      hover:{enabled:!mobile},
      links:!mobile,
      // Advanced
      "find.autoFindInSelection":"never",
      formatOnPaste:false,
      formatOnType:false,
    });
    // Expose find command
    if(onSearch) onSearch(()=>editor.getAction("actions.find")?.run());
  }

  useEffect(()=>{
    if(!monacoRef.current||!ready)return;
    monacoRef.current.editor.setTheme(THEME_MAP[theme.id]?.name||"midnight-eng");
    editorRef.current?.updateOptions({fontFamily:theme.monoFont});
  },[theme.id,ready]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{background:theme.colors.editor}}>
      {/* Tab bar */}
      <div className="flex items-stretch flex-shrink-0 select-none"
        style={{background:theme.colors.lineNumBg,borderBottom:`1px solid ${theme.colors.border}`,height:theme.isClassic?22:32}}>
        <div className="flex items-center gap-2 px-4 text-xs"
          style={{background:theme.colors.tabActiveBg,borderBottom:theme.isClassic?"1px solid #ece9d8":`2px solid ${theme.colors.accent}`,
                  borderRight:`1px solid ${theme.colors.border}`,color:theme.isClassic?"#000":theme.colors.accent,
                  fontFamily:theme.isClassic?"Tahoma,sans-serif":theme.font,fontSize:11}}>
          <span>📄</span><span>main.cpp</span>
        </div>
        <div style={{flex:1}} />
        <div className="flex items-center px-4 gap-3 text-xs"
          style={{color:theme.colors.label,fontFamily:"'Courier New',monospace",fontSize:10}}>
          <span>C++17</span><span style={{opacity:0.4}}>·</span><span>UTF-8</span>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <MonacoEditor
          height="100%" language="cpp" value={code}
          theme={THEME_MAP[theme.id]?.name||"midnight-eng"}
          onChange={onChange} beforeMount={beforeMount} onMount={onMount}
          loading={<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",background:theme.colors.editor,color:theme.colors.accent,fontSize:12}}>Loading editor…</div>}
          options={{automaticLayout:true,scrollBeyondLastLine:false,fontSize:mobile?12:13,fontFamily:theme.monoFont,tabSize:4}}
        />
      </div>
    </div>
  );
}
