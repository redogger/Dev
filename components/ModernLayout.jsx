"use client";
import { useTheme } from "@/components/ThemeProvider";
import EditorPanel from "@/components/Editor";
import SidebarPanel from "@/components/Sidebar";

export default function ModernLayout({
  code, setCode, buildStatus, isRunning, output,
  onBuild, onExecute, onBuildAndRun, onRandomize, onReset,
  onExportCpp, onExportPDF, onMacExport, onOpenProfile, onOpenAdmin,
  mutationEnabled, setMutationEnabled, consoleOpen, setConsoleOpen,
  onLoadAssignment, onFileSelect, activeFile,
}) {
  const { theme: t } = useTheme();
  return (
    <div style={{display:"flex",flexDirection:"column",height:"100vh",background:t.colors.bg,fontFamily:t.font}}>
      {/* Top header */}
      <header style={{background:t.colors.header,borderBottom:`1px solid ${t.colors.border}`,height:40,
        display:"flex",alignItems:"center",gap:12,padding:"0 16px",flexShrink:0}}>
        <span className="greg-logo" data-text="GReg">GReg</span>
        <span style={{color:t.colors.label,fontSize:9,opacity:0.5,letterSpacing:"0.1em"}}>ENTERPRISE IDE</span>
        <div style={{flex:1}}/>
        {isRunning&&<><div style={{width:7,height:7,borderRadius:"50%",background:t.colors.accent}} className="animate-pulse2"/><span style={{color:t.colors.label,fontSize:10}}>Executing…</span></>}
        <span style={{color:t.colors.label,fontSize:9,letterSpacing:"0.06em",textTransform:"uppercase"}}>JUDGE0 CE · C++17 · GCC 11.2</span>
      </header>

      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        <SidebarPanel
          onBuildAndRun={onBuildAndRun} onBuild={onBuild} onExecute={onExecute}
          onRandomize={onRandomize} onReset={onReset}
          onExportCpp={onExportCpp} onExportPDF={onExportPDF} onMacExport={onMacExport}
          onOpenProfile={onOpenProfile} onOpenAdmin={onOpenAdmin}
          mutationEnabled={mutationEnabled} setMutationEnabled={setMutationEnabled}
          consoleOpen={consoleOpen} setConsoleOpen={setConsoleOpen}
          onLoadAssignment={onLoadAssignment} onFileSelect={onFileSelect} activeFile={activeFile}
          buildStatus={buildStatus} isRunning={isRunning}
          codeLines={code.split("\n").length}
        />
        <EditorPanel code={code} onChange={setCode}/>
      </div>
    </div>
  );
}
