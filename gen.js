var width = 10;
var height = 10;
var maxHeight = 14;
var maxWidth = 16;
var maxScore = 0;
var isGenerating = false;
var isPaused = false;
var isStopped = false;
var mainIntervalId;
var grid = [];

function onLoad() {
	var gridHtml = "";
	for (var y = 0; y < maxHeight; y++) {
		gridHtml += "<tr>";
		for (var x = 0; x < maxWidth; x++) {
			gridHtml += "<td><div id=\"" + x + "-" + y + "\"></div></td>";
		}
		gridHtml += "</tr>";
	}
	$("#crosswords table").html(gridHtml);

	for (var x = 0; x < maxWidth; x++) {
		grid.push([]);
		for (var y = 0; y < maxHeight; y++) {
			grid[x].push(null);
		}
	}

	//	generate();
	mainIntervalId = setInterval(generate, 200);
}

function generate() {
	if (isGenerating) {
		return;
	}
	isGenerating = true;
	console.log("generating...");

	for (var x = 0; x < maxWidth; x++) {
		for (var y = 0; y < maxHeight; y++) {
			grid[x][y] = null;
			var cell = $("#" + x + "-" + y);
			cell.html(null);
		}
	}

	//	var totalDepth = 0;
	//	var numWords = 0;
	var word = findWord(".{" + height + "," + maxHeight + "}");
	writeWord(word, 0, 0, true);

	for (var y = 0; getChar(0, y); y += 2) {
		var word = findWord(getChar(0, y) + ".{" + width + "," + maxWidth + "}");
		if (word) {
			writeWord(word, 0, y, false);
		}
	}

	for (var x = 2; x < maxWidth; x++) {
		for (var y = 0; y < maxHeight; y++) {
			if (isStopped) {
				return;
			}
			var word = null;
			for (var maxLength = maxHeight; maxLength > 2 && !word; maxLength -= 2) {
				var regex = getRegexFrom(x, y, maxLength);
				word = findWord(regex);
				if (word) {
					writeWord(word, x, y, true);
				}
			}
		}
	}

	//	if (numWords > 0) {
	//		var score = totalDepth;
	//		var score = totalDepth / numWords;
	//	var score = countLetters();
	var score = 0;
	for ( var x in grid) {
		x = parseInt(x);
		for ( var y in grid[x]) {
			y = parseInt(y);
			if (grid[x][y] && grid[x - 1] && grid[x - 1][y] && grid[x + 1] && grid[x + 1][y] && grid[x][y - 1] && grid[x][y + 1]) {
				score++;
			}
		}
	}
	score += countLetters() / (maxHeight * maxWidth);

	$("#current-score").html(score.toFixed(2));
	if (score > maxScore) {
		maxScore = score;
		$("#best-score").html(maxScore.toFixed(2));
		$("#best-crosswords").html($("#crosswords").html());
		var date = new Date();
		var dateStr = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " " + date.getHours() + ":"
			+ (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
		$("#best-date").html(dateStr);
	}
	//	}
	isGenerating = false;
}

function getRegexFrom(x, y, maxLength) {
	var regex = "";
	var hasAtLeastOneLetter = false;
	if (!getChar(x, y - 1)) {
		while (!isBottom(x, y) && regex.length < maxLength) {
			var ch = getChar(x, y);
			if (ch) {
				hasAtLeastOneLetter = true;
				regex += ch;
			} else {
				if (getChar(x - 1, y) || getChar(x + 1, y)) {
					break;
				}
				regex += ".";
			}
			y++;
		}
	}

	if (regex.endsWith(".") && getChar(x, y)) {
		regex = regex.substring(0, regex.length - 1);
	}

	if (!hasAtLeastOneLetter || !regex) {
		console.log("searchFrom: regex null");
		return null;
	}
	if (!getChar(x - 1, y) && !getChar(x + 1, y) && isBottom(x, y)) {
		var i = 0;
		for (var _y = y; _y < maxHeight && !(getChar(x - 1, _y) || getChar(x + 1, _y)); _y++) {
			i++;
		}
		regex += ".{0," + i + "}";
	}
	console.log("searchFrom: regex", regex);
	return regex;
}

function isBottom(x, y) {
	for (var _y = y; _y < maxHeight; _y++) {
		if (getChar(x, _y)) {
			return false;
		}
	}
	return true;
}

function countLetters() {
	var count = 0;
	for (var y = 0; y < maxHeight; y++) {
		for (var x = 0; x < maxWidth; x++) {
			if (getChar(x, y)) {
				count++;
			}
		}
	}
	return count;
}

function getChar(x, y) {
	return grid[x] ? grid[x][y] : null;
	//	var cell = $("#" + x + "-" + y + " .grid-letter");
	//	return cell.html() ? cell.html().toLowerCase() : null;
}

function writeWord(word, x, y, isVertical) {
	for (var i = 0; i < word.length; i++) {
		var ch = word.charAt(i);
		grid[x][y] = ch;
		var cell = $("#" + x + "-" + y);
		cell.html("<div class=\"grid-letter\">" + ch.toUpperCase() + "</div>");
		if (isVertical) {
			y++;
		} else {
			x++;
		}
	}
}

function findWord(regex) {
	if (regex && regex.length > 1) {
		regex = "^" + regex + "$";
		var matchingWords = [];
		for ( var i in words) {
			if (words[i].match(regex)) {
				matchingWords.push(words[i]);
			}
		}
		if (matchingWords.length > 0) {
			return matchingWords[parseInt(Math.random() * matchingWords.length)];
		}
	}
	return null;
}

function togglePause() {
	isPaused = !isPaused;
	$("#pause-play-button").html(isPaused ? "GO" : "Pause");
	if (isPaused) {
		clearInterval(mainIntervalId);
	} else {
		mainIntervalId = setInterval(generate, 200);
	}
}
