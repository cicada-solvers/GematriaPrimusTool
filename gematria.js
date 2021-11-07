var gp=[
["\u16A0",'F','','2'],
["\u16A2",'U','V','3'],
["\u16A6",'TH','','5'],
["\u16A9",'O','','7'],
["\u16B1",'R','','11'],
["\u16B3",'C','K','13'],
["\u16B7",'G','','17'],
["\u16B9",'W','','19'],
["\u16BB",'H','','23'],
["\u16BE",'N','','29'],
["\u16C1",'I','','31'],
["\u16C4",'J','','37'],//used to be \u16C2 due to error.
["\u16C7",'EO','','41'],
["\u16C8",'P','','43'],
["\u16C9",'X','','47'],
["\u16CB",'S','Z','53'],
["\u16CF",'T','','59'],
["\u16D2",'B','','61'],
["\u16D6",'E','','67'],
["\u16D7",'M','','71'],
["\u16DA",'L','','73'],
["\u16DD",'NG','ING','79'],
["\u16DF",'OE','','83'],
["\u16DE",'D','','89'],
["\u16AA",'A','','97'],
["\u16AB",'AE','','101'],
["\u16A3",'Y','','103'],
["\u16E1",'IA','IO','107'],
["\u16E0",'EA','','109']
];

//Preprocess:
//bullets to spaces
// Q -> C

String.prototype.replaceAll = function(target, replacement) {
  return this.split(target).join(replacement);
};


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
	if(d>=0x20 && d<=0x2F) return true;
	if(d>=0x3A && d<=0x40) return true;
	if(d>=0x5B && d<=0x60) return true;
	if(d>=0x7B && d<=0xFF) return true;
	return false;
}



//---------------------------------------------------
function gp_getcolumn(type){
	if(type=="r" ) return  0
	if(type=="l" || type=="t") return  1
	if(type=="ll") return  2;//***DEPRECATE: do not need to support extended replacements as a frontend.
	if(type=="v" ) return  3
	return -1
}
function gp_get(row,column){
	if(row>28) return " ";//special case values that only convert to spaces. ***DEPRECATE: should pre-process any one-way replacements.
	if(column==-1) return row;
	return gp[row][column];
}
function gp_find(v,i){
	if(i==-1) return v;
	for(var h=0;h<gp.length;h++)
		if( ((typeof gp[h][i]) == (typeof v)) && gp[h][i]==v) return h;
	return -1;
}
function gp_replace_single(v, columnA, columnB){
	var r=gp_find(v,columnA)
	if(r==-1 && columnA==1) r=gp_find(v,2);//2 is also a letters column.
	if(r==-1) return "?";
	return gp_get(r,columnB);
}
function gp_replace_array(arr, from, to){
	var columnA=gp_getcolumn(from);
	var columnB=gp_getcolumn(to);
	for(var i=0;i<arr.length;i++) arr[i]=gp_replace_single(arr[i], columnA, columnB);
	return arr;
}
//-----------------------------------------------------
function gp_isDelimitingSpace(isValuePreceeding,countOfDelimsInRow){
	return (isValuePreceeding && (countOfDelimsInRow==1));
}
function gp_split_char(s){
	var values=[];
	var format=[];
	var delims=0;
	var lastTokenValue=false;
	var currentToken="";
	var wasValue=false;
	var isValue=false;
	for(var i=0;i<s.length;i++){
		var c=s.substr(i,1);
		var n=gp_noconv(c);

		if(isValue && n){//switched from Value-char to delimiting char, push value.
			values.push(currentToken);
			currentToken="";
			isValue=false;
			lastTokenValue=true;
		}else if( (!isValue) && (!n)){//switched from delimiting char to value char, push formating.
			format.push(currentToken);
			currentToken="";
			isValue=true;
			lastTokenValue=false;
		}

		wasValue=isValue;
		isValue=!n;


		if(isValue && currentToken.length>0){//max token length for a value is 1, so push the value and a blank format to indicate no delims.
			format.push("");
			values.push(currentToken);
			currentToken="";
			lastTokenValue=true;
		}


		currentToken+=c;
	}
	if(currentToken.length)
		if(isValue) values.push(currentToken);
		else        format.push(currentToken);


	var split=[values,format];
	return split;
}
function gp_split_spaced(s){
	var values=[];
	var format=[];
	var delims=0;
	var lastTokenValue=false;
	var currentToken="";
	var wasValue=false;
	var isValue=false;
	for(var i=0;i<s.length;i++){
		var c=s.substr(i,1);
		var n=gp_noconv(c);

		if(isValue && n){//switched from Value-char to delimiting char, push value.
			values.push(currentToken);
			currentToken="";
			isValue=false;
			lastTokenValue=true;
		}else if( (!isValue) && (!n)){//switched from delimiting char to value char, push formating.
			format.push(currentToken);
			currentToken="";
			isValue=true;
			lastTokenValue=false;
		}
		wasValue=isValue;
		isValue=!n;

		if(n) delims++;
		else  delims=0;
		//console.log(delims+" "+gp_isDelimitingSpace(lastTokenValue,delims)+" `"+c+"`")

		if(c==" " && gp_isDelimitingSpace(lastTokenValue,delims)) ;
		else currentToken+=c;
	}
	if(currentToken.length)
		if(isValue) values.push(currentToken);
		else        format.push(currentToken);


	var split=[values,format];
	return split;
}
function gp_split_text(s){
	var values=[];
	var format=[];
	var delims=0;
	var lastTokenValue=false;
	var currentToken="";
	var wasValue=false;
	var isValue=false;
	for(var i=0;i<s.length;i++){
		var c=s.substr(i,1);
		var n=gp_noconv(c);

		if( (!isValue) && (!n)){//switched from delimiting char to value char, push formating.
			format.push(currentToken);
			currentToken="";
			isValue=true;
			lastTokenValue=false;
		}

		wasValue=isValue;
		isValue=!n;

		if(lastTokenValue && isValue) format.push("");


		if(isValue){
			//alert("i="+i+" c="+c);
			var l=1;
			for(l=3;l>1;l--){
				//alert("** i="+i+" l="+l+" sub="+s.substr(i,l))
				var w=s.substr(i,l);
				l=w.length;//end of string may yield lower lengths than desired
				if(l==1 || gp_find(w,1)>=0 || gp_find(w,2)>=0) break;
			}
			//alert("i="+i+" l="+l+" push="+s.substr(i,l))
			values.push(s.substr(i,l));//push the length the loop ends on - 3 or 2 if matched, 1 if not.
			currentToken="";
			lastTokenValue=true;
			i+=(l-1);//increment the loop by the length of the match, +1 is already being done in the for().
		}else currentToken+=c;
	}
	if(currentToken.length)
		if(isValue) values.push(currentToken);
		else        format.push(currentToken);


	var split=[values,format];
	return split;
}
function gp_split(s, from){
	if(from=="l" || from=="v" || from=="p") return gp_split_spaced(s);
	if(from=="r") return gp_split_char(s);
	if(from=="t") return gp_split_text(s);
}
function gp_join(a, to){
	var spaces=true;
	if(to=="r" || to=="t") spaces=false;
	var values=a[0];
	var format=a[1];
	var o="";
	var i=0;
	var validF,validV;
	do{
		validF=(i<format.length);
		validV=(i<values.length);
		if(validF)  o+=format[i];
		if(validV) {o+=values[i]; if(spaces) o+=" "; }
		i++;
	}while(validF || validV);
	return o;
}

//-----------------------------------------------------

function gp_preprocess(s,from){
	if(from=="t" || from=="l") s=s.toUpperCase();
	if(from=="t") s = s.replaceAll(/QU/g,"CW");
	if(from=="l") s = s.replaceAll(/Q\s+/g,"C W");
	if(from=="t" || from=="l") s = s.replaceAll(/Q/g,"C");
	return s.replaceAll(/\u2022/g," ").replaceAll(/\u2019/g," ").replaceAll(/\u25E6/g," ").replaceAll(/\u16C2/,"\u16C4");
}
function gp_postprocess(s,to){
	return s;
}

function gp_replace(s,from,to){
	s=gp_preprocess(s,from);
	var a=gp_split(s,from);
	a[0]=gp_replace_array(a[0], from, to);
	var o=gp_join(a,to);
	o=gp_postprocess(o,to);
	return o;
}
//-----------------------------------------------------
