var x = 0;


/**
 *
 */

function initStory() {
	console.log('init');
	$("#stories").load("stories/stories.html", function() {
		
		var stories = d3.selectAll(".story");
		var size = stories.size();
		var htmlText = "";

		for (var i = 0; i < size; i++) {

			var title = d3.select("#storyTitle" + i).text();

			htmlText += '<div id="storyTab' + i + '" class="storyTab" onclick="goToStoryNr(' + i + ');">' + title + '</div>';
		}

		var currentHTMLText = d3.select("#storyPanel").html();

		d3.select("#storyPanel").html(htmlText + currentHTMLText);
		d3.select("#storyTab0")
			.classed("storyTabActive", true);

	});

}


/**
 * Function to show or hide the answer element in the story
 * @param {Object} thisP	the <a> element to hide/show answer
 */
function hideShowToggle(thisP) {
	
	console.log($(thisP).parent().next());
	$(thisP).parent().next().toggle('fast');
	$(thisP).html($(thisP).html() == 'show answer' ? 'hide answer' : 'show answer');
}

/**
 * Function to navigate to the next story
 */
function nextStory() {

	document.getElementById("storyNextNavigationButton").style.pointerEvents = "none";
	document.getElementById("storyPreviousNavigationButton").style.pointerEvents = "none";

	var numberOfStories = $(".story").length;
	var storyPanel = $("#stories");
	var currentStoryID = parseInt(storyPanel.attr("value"));
	var nextStoryID = (currentStoryID + 1) % numberOfStories;
	var storyWidth = parseInt(d3.select("#storyPanel").style("width"));
	storyPanel.attr("value", nextStoryID);

	var duration = 1500;

	d3.select("#story" + nextStoryID)
		.style("left", (storyWidth + 120) + "px")
		.style("display", "block")
		.transition()
		.duration(duration)
		.style("left", "0px");

	d3.select("#story" + currentStoryID)
		.transition()
		.duration(duration)
		.style("left", "-" + parseInt(storyWidth+120) + "px")
		.transition()
		.delay(duration)
		.style("display", "none");

	d3.selectAll(".storyTab")
		.transition()
		.delay(duration/2)
		.attr("class", function(d,i) {
			if (i == nextStoryID) {
				return "storyTab storyTabActive"
			} else {
				return "storyTab"
			}
		});

	setTimeout(function () {
		document.getElementById("storyNextNavigationButton").style.pointerEvents = "auto";
		document.getElementById("storyPreviousNavigationButton").style.pointerEvents = "auto";
	}, duration + 100);

}

/**
 * Function to navigate to the previous story
 */
function previousStory() {

	document.getElementById("storyNextNavigationButton").style.pointerEvents = "none";
	document.getElementById("storyPreviousNavigationButton").style.pointerEvents = "none";

	var numberOfStories = $(".story").length;
	var storyPanel = $("#stories");
	var currentStoryID = parseInt(storyPanel.attr("value"));
	var nextStoryID = ((currentStoryID - 1) + numberOfStories) % numberOfStories;
	var storyWidth = parseInt(d3.select("#storyPanel").style("width"));
	storyPanel.attr("value", nextStoryID);

	var duration = 1500;

	d3.select("#story" + nextStoryID)
		.style("left", -(storyWidth) - 120 + "px")
		.style("display", "block")
		.transition()
		.duration(duration)
		.style("left", "0px");

	d3.select("#story" + currentStoryID)
		.transition()
		.duration(duration)
		.style("left", "+" + (storyWidth + 120) + "px")
		.transition()
		.delay(duration)
		.style("display", "none");

	d3.selectAll(".storyTab")
		.transition()
		.delay(duration / 2)
		.attr("class", function (d, i) {
			if (i == nextStoryID) {
				return "storyTab storyTabActive"
			} else {
				return "storyTab"
			}
		});

	setTimeout(function () {
		document.getElementById("storyNextNavigationButton").style.pointerEvents = "auto";
		document.getElementById("storyPreviousNavigationButton").style.pointerEvents = "auto";
	}, duration + 100);

}


/**
 * Function to jump to a specific StoryNr
 * @param storyNr	Number of story (starting with 0)
 */
function goToStoryNr(storyNr) {

	var storyPanel = $("#stories");
	var currentStoryID = parseInt(storyPanel.attr("value"));

	var nextStoryID = storyNr;
	storyPanel.attr("value", nextStoryID);

	d3.select("#story" + currentStoryID)
		.style("display", "none");

	d3.select("#story" + nextStoryID)
		.style("left", "0px")
		.style("display", "block");

	d3.selectAll(".storyTab")
		.attr("class", function(d,i) {
			if (i == nextStoryID) {
				return "storyTab storyTabActive"
			} else {
				return "storyTab"
			}
		});
}