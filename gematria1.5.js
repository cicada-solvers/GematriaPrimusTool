//outdated code from before the tokenization rewrite (previous to 2.0)

var gp=[
["\u16A0",'F','',2],
["\u16A2",'U','V',3],
["\u16A6",'TH','',5],
["\u16A9",'O','',7],
["\u16B1",'R','',11],
["\u16B3",'C','K',13],
["\u16B7",'G','',17],
["\u16B9",'W','',19],
["\u16BB",'H','',23],
["\u16BE",'N','',29],
["\u16C1",'I','',31],
["\u16C2",'J','',37],
["\u16C7",'EO','',41],
["\u16C8",'P','',43],
["\u16C9",'X','',47],
["\u16CB",'S','Z',53],
["\u16CF",'T','',59],
["\u16D2",'B','',61],
["\u16D6",'E','',67],
["\u16D7",'M','',71],
["\u16DA",'L','',73],
["\u16DD",'NG','ING',79],
["\u16DF",'OE','',83],
["\u16DE",'D','',89],
["\u16AA",'A','',97],
["\u16AB",'AE','',101],
["\u16A3",'Y','',103],
["\u16E1",'IA','IO',107],
["\u16E0",'EA','',109],
["\u2022",' ','',' '],
["\u2019",' ','',' '],
["\u25E6",' ','',' '],
];
// Q -> C

function isBlank(x){
	if((typeof x)=="string")
		if(x.length==0) return true;
	return false;
}
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}


function gp_noconv(c){
    if( (typeof c)=="number" ) return false;
	if(isBlank(c)) return true;
	var d=String(c).charCodeAt(0);
	if(d>=0x0A && d<=0x0D) return true;
	if(d>=0x20 && d<=0x3F) return true;
	if(d>=0x5B && d<=0x60) return true;
	if(d>=0x7B && d<=0xFF) return true;
	return false;
}
function gp_find(v,i){
	for(var h=0;h<gp.length;h++)
		if( ((typeof gp[h][i]) == (typeof v)) && gp[h][i]==v) return h;
	return -1;
}

function gp_split_t(s){
	var o=[ ];
	var p=0;
	while(p<s.length){
		var found=false;
		for(var l=3;l>0;l--){
			var w=s.substr(p,l);
			l=w.length;//ensure we don't repeat attempt for end of the string.
			//alert("looking for "+w);
			if(gp_find(w,1)>=0 || gp_find(w,2)>=0){
				found=true;
				o.push(w);
				p+=l;
				break;
			}
		}
		if(!found){ o.push(w); p++;}//we can't find this value, go to the next one.
	}
	return o;
}


function gp_split(s,f){
	if(f=='t') return gp_split_t(s);
	if(f=='l' || f=='ll' || f=='v' || f=='p') return s.split(" ");
	if(f=='r') return s.split("");
}
function gp_join(a,t){
	if(t=='l' || t=='ll' || t=='v' || t=='p') return a.join(" ");
	if(t=='r' || t=='t') return a.join("");
}


function gp_replace(s,f,t){
	var i=0;
	var j=0;
	var o=[ ];
	if(f=='l' || f=='ll') s=s.toUpperCase();
	var a=gp_split(s,f);

	if(f=='l')  i=1;
	if(f=='t')  i=1;
	if(f=='ll') i=2;
	if(f=='v')  i=3;

	if(t=='l')  j=1;
	if(t=='t')  j=1;
	if(t=='ll') j=2;
	if(t=='v')  j=3;


	if(f=='v' || f=='p')
		for(var p=0;p<a.length;p++){ if(isNumber(a[p])) a[p]=parseInt(a[p]); }

	if(f=='p')
		for(var p=0;p<a.length;p++)
			if(gp_noconv(a[p])){ o.push(a[p]); continue; }
			else if(a[p]>=0 && a[p]<gp.length) o.push(gp[a[p]][j]);
			else o.push('?');
	else
		for(var p=0;p<a.length;p++){
			var found=false;
			if(gp_noconv(a[p]) || a[p]==" "){ o.push(a[p]); continue; }


			var h=gp_find(a[p],i);
			if(h==-1 && (f=='l' || f=='t')) h=gp_find(a[p],2);
			if(h==-1) o.push("?");
			else{
				if(h>28) o.push(" ");
				else if(t=='p') o.push(h);
				else o.push(gp[h][j]);
			}
		}
	return gp_join(o,t);
}