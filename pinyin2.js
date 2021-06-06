var ProgramName = 'Pinyin Tuner';
var Version = 20210321;

// カテゴリー 0から4まで
var PinyinClasses = ["上平聲", "下平聲", "上聲", "去聲", "入聲"];

// 通韻 平聲だけ
var Compatibles = [["0_1", "0_2", "0_3"],["0_4", "0_5"],["0_6", "0_7"],["0_8", "0_9", "0_10"],
	["0_11", "0_12", "0_13", "0_14", "0_15", "1_1"], ["1_2", "1_3", "1_4"], ["1_5", "1_6"],
	["1_8", "1_9", "1_10"], ["1_12", "1_13", "1_14", "1_15"]];

// 發音
var Pronouns =[
	["uŋ","uoŋ","ʌŋ","iᴇ","ʉi","ɨʌ","ɨo","ei","ɛ","uʌi","iɪn","ɨun","ʉɐn","ɑn", "an"],
	["en","eu","au","ɑu","ɑ","a","ɐŋ","æŋ","eŋ","ɨŋ","ɨu","iɪm","ʌm","iᴇm","ɛm"],
	["uŋX","ɨoŋX","ʌŋX","ʉiX","ɨʌX","uo|ɨoX","eiX","ɛX","uʌiX","iɪnX","ɨunX","ʉɐnX","ɑnX","an|anX","enX","euX","auX|auH","ɑuX","ɑX","aX","ɨɐŋX","æŋX","eŋX","ɨuX","iɪmX","ʌmX","iᴇmX","ɨɐmX"],
	["uŋH","uoŋH","ʌŋH","iɪH|iuɪH|iuɪt̚","ʉiH","ɨʌH","ɨoH","eiH","ɑiH","uɛH","uʌiH","iɪnH","ɨunH","ʉɐnH","ɑn|ɑnH","anH","enH","euH","auH","ɑuH","ɑH","aH","ɨɐŋH","iæŋH","eŋH","ɨuH","iɪmH","ʌmH","emH","ɛmH"],
	["uk̚","uok̚","ʌk̚","iɪt̚","ɨut̚","ʉɐt̚","ɑt̚","ɛt̚","et̚","ɨɐk̚","æk̚","ek̚","ɨk̚","iɪp̚","ʌp̚","iᴇp̚","ɛp̚"]];
	
var pinyin_line = function(str){
	var retval = [];
	$.each(str.split(""), function(i0, v0){// 文字列を文字に分解
		var hits = [];
		$.each(LETTERS, function(i1, v1){// 上平聲、下平聲、上聲、去聲、入聲
			$.each(v1, function(i2, v2){
				if(v2.indexOf(v0) >= 0){
					hits.push([i1,i2,v2[0]]); 
				};
			});
		});
		retval.push([v0, hits]);
	});
	return retval;
};

var numLines;// 行の數
var lineLength;// 行の長さ

var lineByLine = function(line){
	var tmp = '';
	var column = 0;
	$.each(line.split(""), function(index, char){
		var values = CHARACTERS[char];
		var accent0 = 'unknown', accent1 = 5, results = [];
		if(null != values){
			accent0 = values[0];
			accent1 = values[1];
			results = values[2];
		}
		var numObliq = 0;// 仄の數
		var numLevel = 0;// 平の數
		var rhymes = []; // 韻

		var tmp2 = '';
		column += 1;
		$.each(results, function(i1, v1){
			var tone = "";
			if(v1[0] <= 1){
				numLevel += 1;
				tone = "level";
			} else {
				numObliq += 1;
				tone = "oblique";
			}
			var rhyme = v1[0] + '_' + (v1[1] + 1);
			rhymes.push(rhyme); 
			tmp2 += '<span class="' + rhyme + ' ' + tone + ' ruby">' + v1[2] + '<span class="hint">' + v1[3] + '</span></span>';
		});
		
		if(results.length > 1){ // 複數判定
			if(numObliq == 0){ // 平
				tone = "level";
			} else if(numLevel == 0){ // 仄
				tone = "oblique";
			} else {
				tone = "mixed";
			}
		} else if(results.length < 1){ // 判定不能
			tone = "unknown";
		} else { // 1種類
			if(numLevel == 1){
				tone = "level";
			} else {
				tone = "oblique";
			}
		}
		
		tmp += '<div class="charbox ';
		switch(accent1){
		case 1:
			tmp += 'bg1';
			break;
		case 2:
			tmp += 'bg2';
			break;
		case 3:
			tmp += 'bg3';
			break;
		case 4:
			tmp += 'bg4';
			break;
		default:
			tmp += 'bg_unknown';
		}
		tmp += '">';
		tmp += '<a class="large ' + tone; // 平仄
		if(column == lineLength){// 末尾の文字
			tmp += ' rhyme" data-x="' + rhymes.join(' '); // カスタム屬性 data-x に韻を入れる。
		}
		tmp += '" href="' + encodeURI('http://ja.wiktionary.org/wiki/' + char) + '">' + char + '</a><br>';
		tmp += '<span>' + tmp2 + '</span>';
		tmp += '<br><span class="mruby">' + accent0 + accent1 + '</span>';// 北京語のルビ
		tmp += '</div>';
		if(line.length == 7){// 七言のとき、2字目と4字目の後に空白を入れる。
			if(column == 2 || column == 4){
				tmp += '<div class="spacebox"></div>';
			}
		} else if(line.length == 5 && column == 2){// 五言のとき 2字目の後に空白を入れる。
			tmp += '<div class="spacebox"></div>';
		}
	});
	tmp += '</span><br clear="all">';
	$('#matrix').append(tmp);
};

var showMatches = function(chr, cls){
	var tmp = chr.split('_');
	$('#messages').append('<h4 class="' + cls + '">' + PinyinClasses[tmp[0]] + tmp[1] + LETTERS[tmp[0]][tmp[1] - 1][0] + ' /' +
		Pronouns[tmp[0]][tmp[1] - 1] + '/</h4>' + LETTERS[tmp[0]][tmp[1] - 1].join(' '));
};

var verticalView = function(){// LightBox に縱書き表示
	var tbl = [];
	var arr;
	var j = 0;

	$('.large').each(function(i, v){
		if(0 == j % lineLength){
			arr = [];
		}
		var val1 = 0, val2 = 0;
		if($(v).hasClass('level')) {
			val1 = 1;
		} else if($(v).hasClass('mixed')) {
			val1 = 2;
		}
		if($(v).hasClass('rhyme')){
			val2 = 1;
		}
		arr.push([$(v).text(), val1, val2]);
		j += 1;
		if(j % lineLength == 0){
			tbl.push(arr);
		}
	});

	var tmp = '';
	j = 0;
	var i = 0;
	for(j = 0; numLines > j; j += 1){
		tmp += '<div class="vline">';
		for(i = 0; lineLength > i; i += 1){
			tmp += '<div class="';
			if(tbl[j][i][2] == 1){
				tmp += 'rhyme ';
			}
			switch(tbl[j][i][1]){
			case 0:
				tmp += 'voblique';
				break;
			case 1:
				tmp += 'vlevel';
				break;
			case 2:
				tmp += 'vmixed';
				break;
			}
			tmp += '">' + tbl[j][i][0] + '</div>';
		}
		tmp += '</div>';
		if(j == numLines - 1){
			break;
		}
		tmp += '<div class="vline">';
		for(i = 0; lineLength > i; i += 1){
			tmp += '<div class="vlevel">';
			if(i % 2 == 0){
				tmp += ' ';
			} else if(tbl[j][i][1] != 2 && tbl[j + 1][i][1] != 2){
				if(tbl[j][i][1] == tbl[j + 1][i][1]){
					tmp += '＝';
				} else {
					tmp += '↔';
				}
			}
			tmp += '</div>';
		}
		tmp += '</div>';
	}

	$('#lightbox').css('width', 56 * (2 * numLines - 1))// lightbox 全體の大きさ
		.css('height', 65 * lineLength)
		.html(tmp);
	$('#lightbox').fadeIn('slow');// じわっと浮き出る。
	$('#darkbox').show();
};

var isDuplicate = function(data1, data2) {
	var retval = false;
	if(null != data1){// quick hack
	$.each(data1.split(' '), function(i, v){
		if(data2.includes(v)){
			retval = true;
		}
	});
	}
	return retval;
};

var mainProc = function(){
	var author = $('input[name="author"]').val();
	var title = $('input[name="title"]').val();
	var poetry = $('textarea[name="poetry"]').val();
	var lines = poetry.split(/\n|\s/);
	numLines = lines.length;
	lineLength = lines[0].length;
	$('#main').html('<h2><a href="' +  encodeURI('http://ja.wikipedia.org/wiki/' + author) + '">' +
		author + '</a> ' + title + '</h2><div id="matrix"></div>');
	
	$.each(lines, function(i, v){
		lineByLine(v.replace(/^\s+|\s+$/g, ""));
	});
	var rhymes = [];
	$('.rhyme').each(function(i, v){
		rhymes.push(v);
	});
	var rhymelast = rhymes.pop();
	var data1 = $(rhymelast).attr('data-x');
	$.each(rhymes, function(i, v){
		var data2 =  $(v).attr('data-x');
		var retval = isDuplicate(data1, data2);
		//console.log(data1 + ',' + data2 + ',' + retval);
		if(!retval){
			$(v).removeClass('rhyme');
		}
	});
	
	$(".ruby").click(
		function(){
			var char = $(this).parent().prev().prev();
			if($(this).hasClass("oblique")){
				char.removeClass("mixed level").addClass("oblique");
			} else if($(this).hasClass("level")){
				char.removeClass("mixed oblique").addClass("level");
			};
		}
	);
	$(".ruby").hover( // ルビのマウスオーバーの處理（再描畫されるたびにイベントを再登錄する必要がある）
		function(e){// マウスオーバー開始
			var c = this.className.split(' ')[0];// 同一韻
			var d = [];// 通韻
			
			$('#baloon').css('margin-left', e.pageX - 10).css('margin-top', e.pageY + 10).html($(this).children().html()).show();
			$('#messages').html("");
			$.each(Compatibles, function(i, v){
				if(v.indexOf(c) >= 0){
					d = v;
				}
			});
			
			$(".ruby").each(function(i0, v0){
				if($(v0).hasClass(c)){
					v0.style.color = 'black';
					v0.style.backgroundColor = 'yellow';
				} else {
					$.each(d, function(i1, v1){
						if(v1 != c && $(v0).hasClass(v1)){
							v0.style.color = 'black';
							v0.style.backgroundColor = 'lightgreen';
						}
					});
				}
			});

			showMatches(c, "same");
			$.each(d, function(i, v){
				if(v != c){
					showMatches(v, "compat");
				}
			});
		},
		function(){// マウスオーバー終了
			$('#baloon').hide();
			$(".ruby").each(function(i, v){
				v.style.color = '';
				v.style.backgroundColor = '';
			});
		}
	);
};

$(function(){// ページが讀み込まれた直後に一度だけ呼ばれる關數
	// プログラムの名前やバージョンなどを html の中に埋め込む
	$('.program_name').html(ProgramName);
	$('.version').html(Version);
	$('title').html(ProgramName + ' ' + Version);

	// デフォルトの詩を埋め込む
	var author = DefaultPoem[0];
	var title = DefaultPoem[1];
	$("input[name='author']").val(author);
	$("input[name='title']").val(title);
	$('textarea').val(DefaultPoem[2].replace(/\s/g, "\n"));
	
	$('#button2').on('click', verticalView);
	$('#lightbox').click(function(){// ライトボックスをクリックしたら
		$('#lightbox').fadeOut('fast');// じわっと消える。
		$('#darkbox').hide();
	});

	$('#button1').on('click', mainProc);// 送信ボタンを押したら
	mainProc();// 送信ボタンを押さなくても最初の1囘は
	
	// 例文のリスト
	var count = 0;
	$.each(POEMS.reverse(), function(i, v){
		$.each(v, function(i0, v0){// i0 奈良時代 v0 名前 タイトル 詩 ...
			$('#sidebar2').prepend('<div class="menu"><div class="menutitle">' + i0 + '</div><div class="ex box"><ul id="epoc' + i + '"></ul>');
			$.each(v0, function(author, v1){
				$.each(v1, function(title, poem){
					$('#epoc' + i).append('<li id="poem' + count + '">' + author + ' ' + title + '</li><br>');
					$('#poem' + count).on('click', function(){
						$('input[name="author"]').val(author);
						$('input[name="title"]').val(title);
						$('textarea[name="poetry"]').val(poem.replace(/\s/g, "\n"));
						mainProc();
					});
					count += 1;
				});
			});
		});
	});

	// いわゆるアコーディオン
	$('.box').on('click', function (ev) { // 親へ傳播不可にする（メニューの中身をクリックしても反應しないように）。
       	ev.stopPropagation();
	});
	$('.menu').click(function() {// メニューをクリックしたら
		var thisbox = $(this).children('.box');// そのメニューの子のボックスを取り出し
		thisbox.slideToggle();// ボックスを開け閉めして、
		$('.box').not(thisbox).slideUp();// それ以外のボックスを閉じる
	});
});
