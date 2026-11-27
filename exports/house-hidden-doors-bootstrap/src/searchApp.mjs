import {start,tick,remaining,select,hint,TARGETS,OBJECTS} from "./timedSearch.mjs";
const scene=document.querySelector("#scene"), list=document.querySelector("#targets"), feedback=document.querySelector("#feedback");
const labels={key:"Brass eye key",watch:"Pocket watch",feather:"Quill feather",bell:"Small bell",moon:"Crescent ornament",letter:"Sealed letter",book:"Book",vase:"Vase",cup:"Cup",apple:"Apple",bottle:"Bottle",candle:"Candle",globe:"Globe",frame:"Picture frame",bowl:"Bowl",dice:"Die",leaf:"Leaf",lamp:"Lamp"};
// Original vector composition: intentional fixed placement; not competitor artwork.
const props={
key:[719,405,'<circle cx="0" cy="0" r="9" fill="none" stroke="#c6a05b" stroke-width="5"/><path d="M8 0h27v9h-7V3h-6v6" fill="none" stroke="#c6a05b" stroke-width="5"/>'],
watch:[266,256,'<circle r="18" fill="#b39a66" stroke="#65533c" stroke-width="4"/><circle r="12" fill="#d6c8a1"/><path d="M0 -8V0L7 4" fill="none" stroke="#443a2b" stroke-width="2"/><circle cy="-22" r="4" fill="none" stroke="#aa8d55" stroke-width="3"/>'],
feather:[503,405,'<path d="M-18 22Q-13 -13 18 -25Q29 -1 -9 15Z" fill="#a49e8b" stroke="#786e59"/><path d="M-22 29L16 -22" stroke="#b5a68b" stroke-width="2"/>'],
bell:[839,218,'<path d="M-16 12Q-8 3 -9 -10Q0 -26 9 -10Q8 3 16 12Z" fill="#b29455" stroke="#6b5232" stroke-width="2"/><circle cy="15" r="4" fill="#b29455"/>'],
moon:[141,125,'<path d="M9 -21A25 25 0 1 0 18 19A21 21 0 0 1 9 -21Z" fill="#a6a596" stroke="#686b61"/>'],
letter:[589,470,'<rect x="-25" y="-15" width="50" height="30" rx="2" fill="#c4ac81"/><path d="M-25 -15L0 3L25 -15" stroke="#82694d" fill="none"/><circle cy="3" r="5" fill="#76382e"/>'],
book:[99,255,'<rect x="-19" y="-27" width="38" height="54" rx="2" fill="#623b3a" stroke="#b39560" stroke-width="2"/><path d="M-12 -18h24M-12 18h24" stroke="#b39560"/>'],
vase:[367,120,'<path d="M-10 -25h20v9Q27 7 16 24H-16Q-27 7 -10 -16Z" fill="#647a77" stroke="#91a19b"/>'],
cup:[787,405,'<path d="M-16 -10h32l-5 22h-22Z" fill="#bdb6a0"/><path d="M16 -8q22 0 0 14" fill="none" stroke="#bdb6a0" stroke-width="5"/>'],
apple:[201,396,'<path d="M0 -10Q-26 -25 -20 8Q-8 33 0 20Q16 31 23 5Q26 -24 0 -10" fill="#824b42"/><path d="M0 -10l3 -12" stroke="#7f8651" stroke-width="4"/>'],
bottle:[852,125,'<path d="M-6 -27h12v15l10 10v30h-32V-2l10 -10Z" fill="#596b5b" stroke="#a0a082"/>'],
candle:[334,255,'<rect x="-7" y="-13" width="14" height="38" fill="#bbaf88"/><path d="M0 -17Q-9 -24 0 -35Q9 -24 0 -17" fill="#e5b45b"/>'],
globe:[468,113,'<circle r="30" fill="#526e75" stroke="#b89a60" stroke-width="3"/><path d="M-24 -10l14 -13 17 14 -8 12 -17 3 6 16M13 -16l12 10 -9 14" fill="#9c9e70"/><path d="M0 30v10m-20 0h40" stroke="#b89a60" stroke-width="4"/>'],
frame:[639,117,'<rect x="-25" y="-33" width="50" height="66" fill="#514334" stroke="#a28251" stroke-width="5"/><path d="M-20 22l18 -28 11 18 11 -8v17Z" fill="#7c7964"/>'],
bowl:[864,470,'<ellipse rx="27" ry="9" fill="#a88865"/><path d="M-27 0Q-20 24 20 24L27 0" fill="#775e4a"/>'],
dice:[659,405,'<rect x="-12" y="-12" width="24" height="24" rx="4" fill="#c5bca4"/><circle cx="-6" cy="-6" r="2" fill="#40392e"/><circle cx="6" cy="6" r="2" fill="#40392e"/><circle r="2" fill="#40392e"/>'],
leaf:[420,402,'<path d="M-19 17Q-12 -27 24 -19Q23 17 -19 17Z" fill="#788350"/><path d="M-19 17L24 -19" stroke="#a8a073"/>'],
lamp:[95,399,'<path d="M-22 -12L-12 -44H12L22 -12Z" fill="#c6a775"/><path d="M0 -12v38m-20 0h40" stroke="#827050" stroke-width="5"/>']
};
const bg='<defs><linearGradient id="wall" x2="0" y2="1"><stop stop-color="#39372e"/><stop offset="1" stop-color="#181d20"/></linearGradient><radialGradient id="light"><stop stop-color="#d1a96b" stop-opacity=".25"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs><rect width="960" height="560" fill="url(#wall)"/><path d="M0 490L960 490 960 560H0Z" fill="#4a362d"/><g fill="#35281f" stroke="#72563a" stroke-width="7"><rect x="35" y="35" width="370" height="287"/><rect x="545" y="35" width="380" height="287"/></g><g fill="#76543b"><rect x="35" y="157" width="370" height="13"/><rect x="35" y="285" width="370" height="13"/><rect x="545" y="157" width="380" height="13"/><rect x="545" y="285" width="380" height="13"/></g><path d="M420 298V77Q480 3 540 77V298Z" fill="#233843" stroke="#73634c" stroke-width="7"/><path d="M480 43v255M421 144h118" stroke="#73634c" stroke-width="5"/>';
let books="";for(const y of [154,282])for(const startX of [50,550])for(let i=0;i<19;i++){const x=startX+i*17,h=32+((i*13+y)%45);books+=`<rect x="${x}" y="${y-h}" width="13" height="${h}" rx="1" fill="${["#574338","#6c5244","#45544c","#53566a","#806648"][i%5]}"/><path d="M${x+2} ${y-h+9}h9" stroke="#97805e" stroke-width="1"/>`;}
scene.innerHTML=bg+books+'<path d="M27 427L180 350H780L934 427 900 525H60Z" fill="#6c4d36" stroke="#392c24" stroke-width="8"/><path d="M42 429h881M75 495h815" stroke="#8a6849" stroke-width="3"/><ellipse cx="480" cy="300" rx="450" ry="290" fill="url(#light)" pointer-events="none"/>'+OBJECTS.map(id=>{const [x,y,shape]=props[id];return `<g data-id="${id}" role="button" tabindex="-1" aria-label="${labels[id]}" transform="translate(${x} ${y})"><rect x="-28" y="-36" width="58" height="70" fill="transparent"/>${shape}</g>`;}).join("");
let state=null;
for(const id of TARGETS){const li=document.createElement("li");li.dataset.target=id;li.textContent=labels[id];list.append(li);}
const groups=[...scene.querySelectorAll("[data-id]")];
function render(){
 if(!state)return;
 document.querySelector("#time").textContent=remaining(state);
 document.querySelector("#count").textContent=state.found.length+" / "+TARGETS.length;
 document.querySelector("#score").textContent=state.score;
 const active=state.status==="running";
 scene.setAttribute("aria-disabled",String(!active));
 document.querySelector("#hint").disabled=!active||!state.hints||!!state.highlighted;
 document.querySelector("#hint").textContent="Hint ("+state.hints+" left, −5s)";
 for(const g of groups){const found=state.found.includes(g.dataset.id);g.classList.toggle("found",found);g.classList.toggle("hinted",state.highlighted===g.dataset.id);g.setAttribute("tabindex",active&&!found?"0":"-1");g.setAttribute("aria-disabled",String(!active||found));}
 for(const li of list.children)li.classList.toggle("found",state.found.includes(li.dataset.target));
 if(state.status==="won")feedback.textContent="Search complete! You found all six objects. Score: "+state.score;
 if(state.status==="lost")feedback.textContent="Time expired. Try again.";
}
function choose(id){if(!state||state.status!=="running")return;const old=state;state=select(state,id,performance.now());if(state.found.length>old.found.length)feedback.textContent="Found: "+labels[id];else if(state.mistakes>old.mistakes)feedback.textContent="Not on the list. Three seconds lost.";render();}
for(const g of groups){g.addEventListener("click",()=>choose(g.dataset.id));g.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();choose(g.dataset.id);}});}
document.querySelector("#start").addEventListener("click",()=>{state=start(performance.now());feedback.textContent="Find the six listed objects.";document.querySelector("#start").textContent="Restart search";render();});
document.querySelector("#hint").addEventListener("click",()=>{if(!state)return;state=hint(state,performance.now());if(state.highlighted)feedback.textContent="Hint: "+labels[state.highlighted]+" is highlighted.";render();});
setInterval(()=>{if(state?.status==="running"){state=tick(state,performance.now());render();}},100);
