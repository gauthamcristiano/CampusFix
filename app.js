const KEY="campusfix-demo-reports";
const $=id=>document.getElementById(id);
const form=$("reportForm"),admin=$("admin"),toast=$("toast");
function reports(){try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch{return[]}}
function notify(text){toast.textContent=text;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),2600)}
function inspectDemo(r,old){
  // This is deliberately labelled as a demo ruleset, NOT a live AI model.
  const t=(r.message+" "+r.category+" "+r.location).toLowerCase();
  const urgent=["fire","smoke","sparks","electric shock","exposed wire","gas leak","collapse"].some(x=>t.includes(x));
  const spam=["buy my","discount code","crypto giveaway","casino","click this link"].some(x=>t.includes(x));
  const campus=["class","block","hostel","lab","library","canteen","campus","college","water","fan","light","toilet","bathroom","wifi","computer","leak","wire","clean"].some(x=>t.includes(x));
  const duplicate=old.some(x=>x.location.toLowerCase()===r.location.toLowerCase()&&x.category===r.category&&x.decision!=="QUARANTINE");
  if(urgent)return{decision:"ESCALATE",priority:"Urgent",reason:"Potential safety hazard. Flagged for urgent admin attention.",duplicate};
  if(spam||(!campus&&r.category==="Other"))return{decision:"QUARANTINE",priority:"Low",reason:"Spam-like or unrelated content. Kept out of the main queue.",duplicate};
  if(r.message.length<25||r.location.length<3)return{decision:"CLARIFY",priority:"Review",reason:"More detail is needed to understand this report.",duplicate};
  return{decision:"APPROVE",priority:["Electrical","Water and plumbing","Safety"].includes(r.category)?"High":"Medium",reason:duplicate?"Relevant report accepted; possible similar report exists.":"Relevant campus issue with sufficient details.",duplicate};
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function render(){
 const all=reports(),approved=all.filter(x=>x.decision==="APPROVE"),review=all.filter(x=>["CLARIFY","QUARANTINE"].includes(x.decision)),urgent=all.filter(x=>x.decision==="ESCALATE");
 $("total").textContent=all.length;$("approved").textContent=approved.length;$("review").textContent=review.length;$("urgent").textContent=urgent.length;
 $("list").innerHTML=all.length?all.slice().reverse().map(x=>`<div class="item"><div><b>${esc(x.category)} · ${esc(x.location)}</b><p>${esc(x.message)}</p><p>By ${esc(x.student)} · ${esc(x.reason)}${x.duplicate?" · Possible duplicate":""}</p></div><span class="pill">${esc(x.decision)}</span></div>`).join(""):"No submissions yet. Try the student report form.";
}
$("message").addEventListener("input",e=>$("count").textContent=e.target.value.length+" / 1200");
form.addEventListener("submit",e=>{
 e.preventDefault();if(!form.reportValidity())return;
 const old=reports(),r={student:$("student").value.trim(),category:$("category").value,location:$("location").value.trim(),message:$("message").value.trim(),time:new Date().toLocaleString()};
 const result=inspectDemo(r,old);old.push({...r,...result});localStorage.setItem(KEY,JSON.stringify(old));form.reset();$("count").textContent="0 / 1200";notify("Tefi demo inspection: "+result.decision);if(!admin.hidden)render();
});
function openAdmin(){admin.hidden=false;render();admin.scrollIntoView({behavior:"smooth"})}
$("adminOpen").addEventListener("click",openAdmin);$("adminClose").addEventListener("click",()=>{admin.hidden=true;$("report").scrollIntoView({behavior:"smooth"})});
$("hamb").addEventListener("click",()=>$("navlinks").classList.toggle("open"));
document.querySelectorAll("#navlinks a").forEach(a=>a.addEventListener("click",()=>$("navlinks").classList.remove("open")));
