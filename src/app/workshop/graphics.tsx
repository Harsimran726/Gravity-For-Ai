import { ArrowUpRight, Check, Code2, Database, Globe2, Layers3, MousePointer2, Sparkles } from 'lucide-react';

export function OutcomeGraphic({ step }: { step: string }) {
  return <div className={`ws-outcome-art ws-outcome-${step}`} aria-hidden="true">
    {step === '01' ? <><div className="ws-mini-browser"><div className="ws-mini-bar"><i/><i/><i/></div><div className="ws-mini-page"><span/><b/><b/><em/></div></div><div className="ws-art-badge"><Globe2 size={14}/> Your app is live <ArrowUpRight size={14}/></div><MousePointer2 className="ws-art-pointer" size={28}/></>
      : step === '02' ? <><div className="ws-mini-inputs"><span/><span/><b><Check size={14}/> Submitted</b></div><div className="ws-art-connector"/><Database className="ws-art-database" size={50} strokeWidth={1.3}/><div className="ws-art-badge"><Check size={14}/> Saved to your database</div></>
      : <><div className="ws-art-orbit"/><div className="ws-art-core"><Sparkles size={32} strokeWidth={1.4}/></div><span className="ws-orbit-label ws-orbit-a">IDEA</span><span className="ws-orbit-label ws-orbit-b">BUILD</span><span className="ws-orbit-label ws-orbit-c">REFINE</span><div className="ws-art-badge"><Layers3 size={14}/> A process you can repeat</div></>}
  </div>;
}

export function BuildGraphic() {
  return <div className="ws-build-graphic" aria-label="Illustrative build journey: prompt, interface, data and published app">
    <div className="ws-build-line" aria-hidden="true"/>
    {[{Icon:Sparkles,title:'Prompt',caption:'Start with an idea',content:'Build a booking app for my studio.'},{Icon:Code2,title:'Build',caption:'Shape your interface',content:'<form> → <button />'},{Icon:Database,title:'Connect',caption:'Make the data flow',content:'New enquiry → saved ✓'},{Icon:Globe2,title:'Publish',caption:'Share your first link',content:'your-first-app / live ↗'}].map(({Icon,title,caption,content},i)=><div className="ws-build-node" key={title}><div className="ws-build-icon"><Icon size={25} strokeWidth={1.5}/></div><span className="ws-build-index">0{i+1}</span><h3>{title}</h3><p>{caption}</p><div className="ws-build-screen">{content}</div></div>)}
  </div>;
}

export function SessionGraphic({ connected = false }: { connected?: boolean }) {
  return <div className="ws-session-art" aria-hidden="true"><div className="ws-session-window"><div className="ws-mini-bar"><i/><i/><i/></div><div className="ws-session-layout"><div><span/><span/><span/></div><div><b/><em/><em/><strong/></div></div></div><div className="ws-session-float">{connected?<><Database size={19}/><span>Connected & published</span><Check size={17}/></>:<><Sparkles size={19}/><span>Prompt → your first interface</span></>}</div></div>;
}
