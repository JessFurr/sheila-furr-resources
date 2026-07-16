(function(){
  var NS='http://www.w3.org/2000/svg';
  var KEY='windPath2:'+location.pathname.replace(/^.*\//,'');
  var EDIT=/[?&]drawpath/.test(location.search);
  var custom=null;
  try{custom=JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){custom=null;}

  function el(t){return document.createElementNS(NS,t);}
  function pageW(){return document.documentElement.clientWidth||window.innerWidth;}
  function pageH(){return Math.max(document.body.scrollHeight,document.documentElement.scrollHeight);}

  function ensure(){
    var wp=document.querySelector('.wind-path');
    if(!wp) return null;
    var svg=wp.querySelector('svg');
    if(!svg){
      svg=el('svg');
      svg.setAttribute('preserveAspectRatio','none');
      svg.style.position='absolute';svg.style.top='0';svg.style.left='0';
      var defs=el('defs');
      var mask=el('mask');mask.setAttribute('id','windmask');mask.setAttribute('maskUnits','userSpaceOnUse');
      defs.appendChild(mask);svg.appendChild(defs);
      var m=el('path');m.setAttribute('class','wind-measure');
      m.setAttribute('fill','none');m.setAttribute('stroke','none');
      svg.appendChild(m);
      var p=el('path');
      p.setAttribute('fill','none');p.setAttribute('stroke','#8BC0D6');
      p.setAttribute('stroke-width','2.4');p.setAttribute('stroke-linecap','round');p.setAttribute('stroke-linejoin','round');
      svg.appendChild(p);
      var dots=el('g');dots.setAttribute('class','wind-dots');svg.appendChild(dots);
      wp.appendChild(svg);
    }
    var W=pageW(),H=pageH();
    svg.setAttribute('width',W);svg.setAttribute('height',H);
    svg.setAttribute('viewBox','0 0 '+W+' '+H);
    return svg;
  }

  /* break the line wherever it would cross real content */
  var HIDE_SEL='h1,h2,h3,h4,h5,p,ul,ol,table,img,.btn,.cred,.form-card,.cta-band,.stay-map,.hero-photo,.video-card,.book,.svc-item,.approach,.cred-tabs,.card,.compare,.head-icon,.contact-info,.bio-photo';
  function collectRects(){
    var PAD=16,out=[];
    [].forEach.call(document.querySelectorAll(HIDE_SEL),function(n){
      if(n.closest('.wind-path')||n.closest('#windbar')||n.closest('footer')||n.closest('.topbar'))return;
      if(n.classList&&n.classList.contains('hero-name'))return; /* let the line touch the D in Ph.D */
      var r=n.getBoundingClientRect();
      if(r.width<4||r.height<4)return;
      out.push({l:r.left+window.pageXOffset-PAD,t:r.top+window.pageYOffset-PAD,
                r:r.right+window.pageXOffset+PAD,b:r.bottom+window.pageYOffset+PAD});
    });
    return out;
  }
  function inRects(x,y,rects){
    for(var i=0;i<rects.length;i++){var r=rects[i];
      if(x>=r.l&&x<=r.r&&y>=r.t&&y<=r.b) return true;}
    return false;
  }
  function toPoly(seg){
    var s=' M'+Math.round(seg[0].x)+' '+Math.round(seg[0].y);
    for(var i=1;i<seg.length;i++) s+=' L'+Math.round(seg[i].x)+' '+Math.round(seg[i].y);
    return s;
  }

  function smooth(route){
    /* vertical tangents at every waypoint -> turns are broad rounded C-curves, never cusps */
    if(route.length<2) return '';
    var d='M'+route[0].x+' '+route[0].y;
    for(var j=0;j<route.length-1;j++){
      var a=route[j],b=route[j+1];
      if(a.arc){
        /* fluid opening arc: lift gently off the D, crest, then swoop down into the route */
        var c1x=Math.round(a.x+(b.x-a.x)*0.42), c1y=Math.round(a.y-88);
        var c2x=b.x, c2y=Math.round(b.y-(b.y-a.y)*0.55);
        d+=' C'+c1x+' '+c1y+' '+c2x+' '+c2y+' '+b.x+' '+b.y;
        continue;
      }
      var dy=b.y-a.y,ady=Math.abs(dy);
      var h=Math.max(44,ady*0.5);
      if(h>ady*0.9&&ady>0) h=ady*0.9;
      if(ady===0) h=44;
      var sh=dy<0?-h:h;
      d+=' C'+a.x+' '+Math.round(a.y+sh)+' '+b.x+' '+Math.round(b.y-sh)+' '+b.x+' '+b.y;
    }
    return d;
  }

  function topOf(n){return n.getBoundingClientRect().top+window.pageYOffset;}
  function botOf(n){return n.getBoundingClientRect().bottom+window.pageYOffset;}

  function autoRoute(){
    var W=pageW();
    var lx=Math.max(26,Math.round(W*0.07)),rx=Math.min(W-26,Math.round(W*0.93));
    var secs=[].slice.call(document.querySelectorAll('section.block, .page-hero, .hero'));
    secs.sort(function(a,b){return topOf(a)-topOf(b);});
    if(secs.length<2) return [];
    var start=document.querySelector('.hero-pitch h2');
    var anchors=secs.map(function(s,i){
      var side=i%2?0:1;
      var r=s.getBoundingClientRect();
      var y=Math.round(topOf(s)+r.height*0.5);
      var gx=side?rx:lx;
      if(i===0&&start){y=Math.round(topOf(start)+start.getBoundingClientRect().height*0.4);gx=rx;}
      return {x:gx,y:y};
    });
    /* clean, evenly spaced meander — no jitter, generous spacing, pure arcs */
    var route=[anchors[0]];
    for(var i=0;i<anchors.length-1;i++){
      var a=anchors[i],b=anchors[i+1];
      var dy=b.y-a.y;
      var cx=Math.round((a.x+b.x)/2);
      var dir=(i%2?1:-1);
      if(dy>460){
        var amp=Math.round(W*0.14);
        route.push({x:Math.max(lx,Math.min(rx,cx+dir*amp)),y:Math.round(a.y+dy*0.34)});
        route.push({x:Math.max(lx,Math.min(rx,cx-dir*amp)),y:Math.round(a.y+dy*0.67)});
      }else if(dy>240){
        route.push({x:Math.max(lx,Math.min(rx,cx+dir*Math.round(W*0.10))),y:Math.round(a.y+dy*0.5)});
      }
      route.push(b);
    }
    /* start at the "D" in Ph.D with one fluid rising arc over the wavy rule, down into the route */
    var phd=document.querySelector('.hero-name .phd');
    if(phd){
      var pr=phd.getBoundingClientRect();
      route.unshift({x:Math.round(pr.right+window.pageXOffset+26),
                     y:Math.round(pr.top+window.pageYOffset+pr.height*0.5),
                     arc:true});
    }
    return route;
  }

  function customRoute(){
    if(!custom||custom.length<2) return null;
    var W=pageW(),H=pageH();
    return custom.map(function(p){return {x:Math.round(p.fx*W),y:Math.round(p.fy*H)};});
  }

  function draw(){
    var svg=ensure(); if(!svg) return;
    var route=customRoute()||autoRoute();
    var meas=svg.querySelector('.wind-measure');
    var vis=svg.querySelector('path:not(.wind-measure)');
    meas.setAttribute('d',smooth(route));
    var d='',L=0;
    try{L=meas.getTotalLength();}catch(e){L=0;}
    if(L>0){
      var rects=collectRects(),STEP=7,MIN=10,seg=[];
      for(var s=0;s<=L;s+=STEP){
        var pt=meas.getPointAtLength(s);
        if(!inRects(pt.x,pt.y,rects)){seg.push(pt);}
        else{if(seg.length>=MIN)d+=toPoly(seg);seg=[];}
      }
      if(seg.length>=MIN)d+=toPoly(seg);
    }
    vis.setAttribute('d',d);
    var dots=svg.querySelector('.wind-dots');
    while(dots.firstChild) dots.removeChild(dots.firstChild);
    if(EDIT&&custom){custom.forEach(function(p){
      var c=el('circle');
      c.setAttribute('cx',Math.round(p.fx*pageW()));c.setAttribute('cy',Math.round(p.fy*pageH()));
      c.setAttribute('r','6');c.setAttribute('fill','#1E90FF');
      dots.appendChild(c);});}
  }

  /* ---------- draw-it-yourself mode (?drawpath) ---------- */
  if(EDIT){
    custom=custom||[];
    var wp=document.querySelector('.wind-path');
    if(wp){wp.style.zIndex='998';}
    document.documentElement.style.cursor='crosshair';
    document.body.style.userSelect='none';
    document.body.style.webkitUserSelect='none';
    var bar=document.createElement('div');
    bar.setAttribute('id','windbar');
    bar.style.cssText='position:fixed;top:12px;right:12px;z-index:9999;background:#16181C;color:#fff;font:14px/1.5 sans-serif;padding:12px 14px;border-radius:6px;max-width:260px;cursor:default;user-select:none;';
    bar.innerHTML='<div style="font-weight:700;margin-bottom:6px;">Draw the path</div>'+
      '<div style="font-size:12.5px;opacity:.85;margin-bottom:10px;"><b>Click and drag</b> to draw a freehand curve. Single clicks drop waypoints. It saves as you go.</div>'+
      '<button data-a="undo" style="margin:0 6px 6px 0;">Undo</button>'+
      '<button data-a="clear" style="margin:0 6px 6px 0;">Clear</button>'+
      '<button data-a="copy" style="margin:0 6px 6px 0;">Copy path</button>'+
      '<button data-a="done" style="margin:0 6px 6px 0;">Done</button>'+
      '<div data-a="msg" style="font-size:12px;color:#7FFFD4;min-height:16px;"></div>';
    document.body.appendChild(bar);
    function save(){localStorage.setItem(KEY,JSON.stringify(custom));}
    function addPt(x,y){custom.push({fx:x/pageW(),fy:y/pageH()});save();draw();}
    bar.addEventListener('click',function(e){
      var a=e.target&&e.target.getAttribute('data-a');
      if(!a) return;
      e.stopPropagation();
      var msg=bar.querySelector('[data-a="msg"]');
      if(a==='undo'){custom.splice(-8);save();draw();}
      if(a==='clear'){custom=[];save();draw();}
      if(a==='copy'){
        var txt=KEY+' = '+JSON.stringify(custom);
        (navigator.clipboard&&navigator.clipboard.writeText(txt).then(function(){msg.textContent='Copied — paste it to Claude.';}))||window.prompt('Copy this:',txt);
      }
      if(a==='done'){location.href=location.pathname;}
    });
    /* freehand drag drawing */
    var dragging=false,drew=false,last=null,SP=26;
    document.addEventListener('pointerdown',function(e){
      if(bar.contains(e.target))return;
      dragging=true;drew=false;last={x:e.pageX,y:e.pageY};
    },true);
    document.addEventListener('pointermove',function(e){
      if(!dragging)return;
      var dx=e.pageX-last.x,dy=e.pageY-last.y;
      if(dx*dx+dy*dy>=SP*SP){
        if(!drew){addPt(last.x,last.y);drew=true;}
        last={x:e.pageX,y:e.pageY};
        addPt(e.pageX,e.pageY);
      }
      if(drew)e.preventDefault();
    },true);
    document.addEventListener('pointerup',function(){
      dragging=false;
      setTimeout(function(){drew=false;},0);
    },true);
    document.addEventListener('click',function(e){
      if(bar.contains(e.target)) return;
      e.preventDefault();e.stopPropagation();
      if(drew) return; /* drag already recorded the stroke */
      addPt(e.pageX,e.pageY);
    },true);
    document.addEventListener('keydown',function(e){
      if(e.key==='z'||e.key==='Z'){custom.pop();save();draw();}
    });
  }

  window.addEventListener('load',draw);
  window.addEventListener('resize',draw);
  document.addEventListener('DOMContentLoaded',draw);
  setTimeout(draw,500);setTimeout(draw,1400);
})();
