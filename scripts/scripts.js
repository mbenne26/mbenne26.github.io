//load Youtube API
var tag = document.createElement("script");
tag.src = "https://www.youtube.com/player_api";
var firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var player;
var myInterval;
var earlySeekClick = false;
var result2;

//load player
function onYouTubePlayerAPIReady() {
  var myVideoID = prompt("watch?v=***********", getUrlParam('YTVID',
    'hENgrbIMiy4'));
  player = new YT.Player('player', {
    height: $(window).height() * .4985,
    width: '42%',
    videoId: myVideoID
  });
  $("#seekInterval").val(Interval);
}

//main function
$(window).load(function() {
  //click Seek btn
  $("#seek").click(function() {
    //reinitialize pause state, and btn name
    var isPaused = true;
    earlySeekClick = true;
    $(".pause").text("Pause Seek");
    clearInterval(myInterval);

    //create an array of seek points from input box "seek"
    var seekPoints = $("#seekto").val().split(",");
    //create interval between seek points, multiply by 1000 (from milliseconds to seconds), from input box "interval"
    var seekInterval = ($("#seekInterval").val() * 1000) + 1000;

    //starts per-second display until next seek point interval
    xSecondCountdown(true);

    //goto first seek point
    player.seekTo(parseDuration(seekPoints[0]));
    document.getElementById("title").textContent = result2[0];

    //create interval object, in order to iterate through all seek points
    var i = 1;
    myInterval = setInterval(function() {
      //starts per-second display until next ` point interval
      xSecondCountdown(true);

      //goto next seekpoint
      player.seekTo(parseDuration(seekPoints[i]));

      //display new title
      document.getElementById("title").textContent = result2[i];

      i++;

      //quit seeking at end of points
      if (i == seekPoints.length || earlySeekClick === true) {
        clearInterval(myInterval);
      }
    }, seekInterval); //interval to wait (in ms)
    earlySeekClick = false;
    //click pause btn
    $(".pause").click(function() {
      //(paused) toggle btn text, pause boolean, and stop interval
      if (isPaused === true) {
        $(this).text("Resume Seek");
        isPaused = false;
        clearInterval(myInterval);
        xSecondCountDown(false);
        //(resumed) toggle btn text, pause boolean, and immediately play next seek point, THEN restart interval
      } else {
        $(this).text("Pause Seek");
        isPaused = true;
        //starts per-second display until next seek point interval
        xSecondCountdown(true);

        //goto point that was next in queue
        player.seekTo(parseDuration(seekPoints[i]));
        i++;

        //increment queue, restart interval
        myInterval = setInterval(function() {
          player.seekTo(parseDuration(seekPoints[i]));
          i++;
          //starts per-second display until next seek point interval
          xSecondCountdown(true);
        }, seekInterval);
        //quit at queue end
        if (i == seekPoints.length) {
          clearInterval(myInterval);
        }
      }
    });
    return false;
  });
});

//convert seek points from ##m##s to #...# (in seconds)
function parseDuration(duration) {
  var total = 0;
  //var hours = duration.match(/(\d+)h/);
  //parses from 00m00s or 00:00
  var minutes = duration.match(/(\d+)(m|:)/);
  var seconds = duration.match(/(m|:)(\d+)/);
  //if (hours) total += parseInt(hours[1]) * 3600;
  if (minutes)
    total += parseInt(minutes[1]) * 60;
  if (seconds)
    total += parseInt(seconds[2]);
  return total;
}

//provides per-second display until next seek point interval
function xSecondCountdown(onOff) {
  if (onOff === false) {
    clearInterval(countDown);
  } else {
    var countdownTime = $("#seekInterval").val();
    //var myCountDown = this.countDown;
    var countDown = setInterval(
      function() {
        countdownTime--;
        document.getElementById("countdowntimer").textContent = countdownTime;
        if (countdownTime <= 0) {
          countdownTime = $("#seekInterval").val();
          clearInterval(countDown);
        }
      }, 1000);
  }
}

function extractYTcomments() {
  var url = 'https://www.googleapis.com/youtube/v3/commentThreads?key=AIzaSyAV3IXgSPDBjpY1vaL7tIC4N-uBb0w3CBU&part=snippet&videoId=hENgrbIMiy4&order=relevance'

  fetch(url)
    .then((res) => res.json())
    .then(output => {
      var data = output;
      var regex = /\d+:\d+/gm;
      var regex2 = /\d+:\d+.*\W+/gm;
      var regex3 = /\d+:\d+\W*/gm

      //obtain first comment
      var firstComment = data.items[5].snippet.topLevelComment.snippet.textOriginal;
      var result = firstComment.match(regex);
      result2 = firstComment.match(regex2);

      //remove timecodes, saving only titles
      for (var i = 0; i < result2.length; i++) {
        result2[i] = result2[i].replace(regex3, '');
      }
      console.log(result2);

      $("#seekto").val(result.toString());
    })
}
