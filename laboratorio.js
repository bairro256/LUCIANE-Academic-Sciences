import React,{useEffect,useRef,useState} from "https://esm.sh/react@18.3.1";
import {createRoot} from "https://esm.sh/react-dom@18.3.1/client";

const h=React.createElement;
function safeEvaluate(source){
 const tokens=String(source).replace(/×/g,"*").replace(/÷/g,"/").replace(/,/g,".").match(/(?:\d+(?:\.\d*)?|\.\d+)|[A-Za-z]+|[()+\-*/^]/g)||[];
 let i=0;
 function peek(){return tokens[i]}
 function take(){return tokens[i++]}
 function expression(){let v=term();while(peek()==="+"||peek()==="-"){const op=take(),r=term();v=op==="+"?v+r:v-r}return v}
 function term(){let v=unary();while(peek()==="*"||peek()==="/"){const op=take(),r=unary();v=op==="*"?v*r:v/r}return v}
 function unary(){if(peek()==="+"){take();return unary()}if(peek()==="-"){take();return -unary()}return power()}
 function power(){let v=primary();if(peek()==="^"){take();v=Math.pow(v,unary())}return v}
 function primary(){
  const t=take();if(t==="("){const v=expression();if(take()!==")")throw Error();return v}
  if(t&&(/^[0-9]/.test(t)||t[0]==="."))return Number(t);
  if(t==="pi")return Math.PI;if(t==="e")return Math.E;
  if(t&&/^[A-Za-z]+$/.test(t)){if(take()!=="(")throw Error();const x=expression();if(take()!==")")throw Error();const f={sqrt:Math.sqrt,sin:Math.sin,cos:Math.cos,tan:Math.tan,log:Math.log10,ln:Math.log,abs:Math.abs};if(!f[t])throw Error();return f[t](x)}
  throw Error();
 }
 const result=expression();if(i!==tokens.length||!Number.isFinite(result))throw Error();return result;
}
const exercises={
 "1":[
  {d:"Matemática",q:"Resolve: 3x + 5 = 20",a:"5",hint:"Subtrai 5 aos dois membros e depois divide por 3.",solution:"3x + 5 = 20 → 3x = 15 → x = 5."},
  {d:"Matemática",q:"Calcula: 25% de 200",a:"50",hint:"25% corresponde a 25/100. Multiplica 200 por 0,25.",solution:"200 × 25/100 = 50."},
  {d:"Física",q:"Um móvel percorre 120 m em 10 s. Qual é a velocidade média em m/s?",a:"12",hint:"Usa v = distância ÷ tempo.",solution:"v = 120 ÷ 10 = 12 m/s."},
  {d:"Química",q:"Quantos protões tem um átomo neutro de carbono (Z = 6)?",a:"6",hint:"O número atómico Z é igual ao número de protões.",solution:"O carbono tem 6 protões."}
 ],
 "2":[
  {d:"Matemática",q:"Resolve: x² − 5x + 6 = 0. Indica a menor raiz.",a:"2",hint:"Procura dois números cujo produto seja 6 e cuja soma seja −5.",solution:"x² − 5x + 6 = (x − 2)(x − 3). As raízes são 2 e 3."},
  {d:"Matemática",q:"Deriva f(x) = 3x² + 2x. Calcula f'(2).",a:"14",hint:"A derivada é f'(x) = 6x + 2.",solution:"f'(2) = 6 × 2 + 2 = 14."},
  {d:"Física",q:"Um corpo de 2 kg acelera a 3 m/s². Qual é a força resultante em newtons?",a:"6",hint:"Aplica a segunda lei de Newton: F = m × a.",solution:"F = 2 × 3 = 6 N."},
  {d:"Química",q:"Quantos mol existem em 36 g de água? Usa M(H₂O) = 18 g/mol.",a:"2",hint:"Usa n = m/M.",solution:"n = 36/18 = 2 mol."}
 ]
};
const formulas={
 Matemática:["Equação do 1.º grau: ax + b = 0 → x = −b/a","Equação do 2.º grau: ax² + bx + c = 0","Discriminante: Δ = b² − 4ac","Trigonometria: sen(θ) = cateto oposto/hipotenusa","Pitágoras: a² + b² = c²","Derivada: (xⁿ)' = n·xⁿ⁻¹"],
 Física:["Velocidade média: v = Δs/Δt","Aceleração: a = Δv/Δt","2.ª lei de Newton: F = m·a","Peso: P = m·g","Energia cinética: Ec = ½mv²","Lei de Ohm: U = R·I"],
 Química:["Quantidade de matéria: n = m/M","Concentração molar: C = n/V","Densidade: ρ = m/V","pH = −log[H₃O⁺]","Número de massa: A = Z + N","Gases ideais: pV = nRT"]
};
const elements=[["H","Hidrogénio",1],["He","Hélio",2],["Li","Lítio",3],["Be","Berílio",4],["B","Boro",5],["C","Carbono",6],["N","Azoto",7],["O","Oxigénio",8],["F","Flúor",9],["Ne","Néon",10],["Na","Sódio",11],["Mg","Magnésio",12],["Al","Alumínio",13],["Si","Silício",14],["P","Fósforo",15],["S","Enxofre",16],["Cl","Cloro",17],["Ar","Árgon",18],["K","Potássio",19],["Ca","Cálcio",20]];
function App(){
 const [cycle,setCycle]=useState("1");const [subject,setSubject]=useState("Matemática");const [tool,setTool]=useState("quadro");
 const [expression,setExpression]=useState("");const [calcResult,setCalcResult]=useState("");const [selected,setSelected]=useState(null);
 const [exercise,setExercise]=useState(null);const [answer,setAnswer]=useState("");const [feedback,setFeedback]=useState("");
 const canvasRef=useRef(null);const drawing=useRef(false);const last=useRef(null);
 useEffect(()=>{const c=canvasRef.current;if(!c)return;const resize=()=>{const r=c.getBoundingClientRect(),d=window.devicePixelRatio||1;c.width=r.width*d;c.height=r.height*d;const x=c.getContext("2d");x.scale(d,d);x.lineWidth=2.2;x.lineCap="round";x.strokeStyle="#19334e"};resize();window.addEventListener("resize",resize);return()=>window.removeEventListener("resize",resize)},[tool]);
 function point(e){const r=canvasRef.current.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
 function start(e){drawing.current=true;last.current=point(e);canvasRef.current.setPointerCapture(e.pointerId)}
 function move(e){if(!drawing.current)return;const p=point(e),ctx=canvasRef.current.getContext("2d");ctx.beginPath();ctx.moveTo(last.current.x,last.current.y);ctx.lineTo(p.x,p.y);ctx.stroke();last.current=p}
 function stop(){drawing.current=false;last.current=null}
 function clearBoard(){const c=canvasRef.current;c.getContext("2d").clearRect(0,0,c.width,c.height)}
 function calculate(){try{const v=safeEvaluate(expression);setCalcResult(String(v))}catch(e){setCalcResult("Expressão inválida. Verifica os sinais e parênteses.")}}
 function newExercise(){const list=exercises[cycle].filter(item=>item.d===subject);const pool=list.length?list:exercises[cycle];setExercise(pool[Math.floor(Math.random()*pool.length)]);setAnswer("");setFeedback("")}
 function check(){if(!exercise||!answer.trim())return;const ok=answer.trim().replace(",",".").toLowerCase()===exercise.a.toLowerCase();setFeedback((ok?"✓ Correcto! ":"Ainda não está correcto. ")+exercise.solution)}
 const tab=(name)=>h("button",{key:name,className:"lab-tab "+(subject===name?"active":""),onClick:()=>{setSubject(name);setSelected(null)}},name);
 return h("div",{className:"lab-backdrop",onMouseDown:e=>{if(e.target===e.currentTarget)window.dispatchEvent(new Event("luciane-lab-close"))}},
  h("section",{className:"lab-window","aria-label":"Laboratório de Cálculos"},
   h("header",{className:"lab-head"},h("div",null,h("div",{className:"lab-kicker"},"LUCIANE · ESPAÇO DE EXPERIMENTAÇÃO"),h("h2",null,"Laboratório de Cálculos"),h("p",null,"Explora, calcula, testa e aprende.")),h("button",{className:"lab-close",onClick:()=>window.dispatchEvent(new Event("luciane-lab-close")),"aria-label":"Fechar laboratório"},"×")),
   h("div",{className:"lab-controls"},h("span",null,"CICLO DE ENSINO"),h("button",{className:"lab-cycle "+(cycle==="1"?"chosen":""),onClick:()=>{setCycle("1");setExercise(null);setFeedback("")}},"I Ciclo · 7.ª–9.ª"),h("button",{className:"lab-cycle "+(cycle==="2"?"chosen":""),onClick:()=>{setCycle("2");setExercise(null);setFeedback("")}},"II Ciclo · 10.ª–12.ª")),
   h("nav",{className:"lab-subjects"},["Matemática","Física","Química"].map(tab)),
   h("div",{className:"lab-body"},
    h("aside",{className:"lab-tools"},h("span",{className:"lab-kicker"},"FERRAMENTAS"),[["quadro","Quadro digital"],["calculadora","Calculadora científica"],["formulas","Banco de fórmulas"],["pratica","Prática interactiva"],...(subject==="Química"?[["elementos","Tabela periódica"]]:[])].map(([id,label])=>h("button",{key:id,className:tool===id?"selected":"",onClick:()=>setTool(id)},label))),
    h("main",{className:"lab-workspace"},
     tool==="quadro"?h(React.Fragment,null,h("div",{className:"lab-work-title"},h("div",null,h("h3",null,"Quadro de resolução"),h("p",null,"Escreve ou desenha directamente com o dedo ou rato.")),h("button",{className:"lab-small",onClick:clearBoard},"Limpar quadro")),h("canvas",{ref:canvasRef,className:"lab-canvas",onPointerDown:start,onPointerMove:move,onPointerUp:stop,onPointerCancel:stop,onPointerLeave:stop}),h("p",{className:"lab-hint"},"Dica: usa o quadro para resolver exercícios por etapas."))
     :tool==="calculadora"?h(React.Fragment,null,h("h3",null,"Calculadora científica"),h("p",{className:"lab-desc"},"Aceita operações, potências, raízes, funções trigonométricas e logaritmos. Usa radianos nas funções trigonométricas."),h("input",{className:"lab-expression",value:expression,onChange:e=>setExpression(e.target.value),placeholder:"Ex.: sqrt(81) + 2^3"}),h("div",{className:"lab-keypad"},["7","8","9","÷","4","5","6","×","1","2","3","−","0",".","(",")","+","^","sqrt(","sin(","cos(","tan(","log(","pi"].map(k=>h("button",{key:k,onClick:()=>setExpression(v=>v+(k==="pi"?"pi":k))},k))),h("button",{className:"lab-primary",onClick:calculate},"Calcular"),calcResult?h("div",{className:"lab-answer"},h("span",null,"RESULTADO"),h("strong",null,calcResult)):null)
     :tool==="formulas"?h(React.Fragment,null,h("h3",null,"Banco de fórmulas · "+subject),h("p",{className:"lab-desc"},"Consulta as relações fundamentais e identifica as grandezas antes de substituir valores."),h("div",{className:"lab-formula-list"},formulas[subject].map((f,i)=>h("article",{key:i},h("span",null,String(i+1).padStart(2,"0")),h("strong",null,f))))
     :tool==="elementos"?h(React.Fragment,null,h("h3",null,"Tabela periódica · primeiros 20 elementos"),h("p",{className:"lab-desc"},"Selecciona um elemento para consultar o símbolo, nome e número atómico."),h("div",{className:"lab-elements"},elements.map(el=>h("button",{key:el[0],className:"lab-element "+(selected?.[0]===el[0]?"picked":""),onClick:()=>setSelected(el)},h("small",null,el[2]),h("strong",null,el[0]),h("span",null,el[1])))),selected?h("div",{className:"lab-answer"},h("strong",null,selected[1]+" ("+selected[0]+")"),h("p",null,"Número atómico: "+selected[2]+" · Protões: "+selected[2])):null
     :h(React.Fragment,null,h("h3",null,"Desafio interactivo"),h("p",{className:"lab-desc"},"Questões adaptadas ao "+(cycle==="1"?"I Ciclo (7.ª–9.ª)":"II Ciclo (10.ª–12.ª)")+". A correcção apresenta a resolução."),exercise?h("article",{className:"lab-exercise"},h("span",{className:"lab-kicker"},exercise.d.toUpperCase()),h("p",null,exercise.q),h("details",null,h("summary",null,"Ver pista"),h("p",null,exercise.hint)),h("input",{className:"lab-expression",value:answer,onChange:e=>setAnswer(e.target.value),placeholder:"Escreve a tua resposta"}),h("button",{className:"lab-primary",onClick:check},"Verificar resposta"),feedback?h("div",{className:"lab-answer"},feedback):null):h("button",{className:"lab-primary",onClick:newExercise},"Gerar exercício"),h("button",{className:"lab-secondary",onClick:newExercise},"Outro exercício"))
    )
   ),
   h("footer",{className:"lab-footer"},h("span",null,"APRENDER FAZENDO · LUCIANE ACADEMIC SCIENCES"),h("span",null,cycle==="1"?"I CICLO":"II CICLO"))
  )
 );
}
let root=null,host=null;
function openLab(){if(root)return;host=document.createElement("div");host.id="luciane-lab-host";document.body.appendChild(host);root=createRoot(host);root.render(h(App));document.body.style.overflow="hidden"}
function syncLabRoute(){if(location.hash==="#/laboratorio")openLab();else closeLab()}
function closeLab(){if(root){root.unmount();root=null}host?.remove();host=null;document.body.style.overflow=""}
window.addEventListener("luciane-lab-open",()=>{if(location.hash!=="#/laboratorio")history.pushState(null,"",location.pathname+location.search+"#/laboratorio");openLab()});
window.addEventListener("luciane-lab-close",()=>{if(location.hash==="#/laboratorio")history.pushState(null,"",location.pathname+location.search+"#/dashboard");closeLab()});
window.addEventListener("hashchange",syncLabRoute);
window.addEventListener("popstate",syncLabRoute);
if(location.hash==="#/laboratorio")openLab();
