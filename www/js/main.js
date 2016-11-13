



//  Transition globals


var transitionCurrentStep = 0;   // What step are we currently on
var timer; // Contains the setInterval() object, used to stop the animation.
var transitionInProgess = false;   //  Used to disable functionality whilst transition in progress







// Draw the transition region as the event expands
function drawTransition() {

    var c = document.getElementById("transitionCanvas");
    var ctx = c.getContext("2d");

    ctx.moveTo(1200, 0);

    for (var i = 0; i < 80; i++) {
        ctx.moveTo(1200 - 1200 * i / 80, i / 2);
        ctx.lineTo(1740, i / 2);
        ctx.stroke();


    }


}


// Display the current mouse coordinates
function SetValues() {
    var s = 'X=' + window.event.clientX + ' Y=' + window.event.clientY;
    //  document.getElementById('divCoord').innerText = s;
    // TODO Remove call to this method

}


// Display a debug message
function debugalert(x) {
    var debugregion = document.getElementById("debugRegion");
    debugregion.innerText = x

}


// Pause for the given number of milliseconds
function pausecomp(millis) {
    var date = new Date();
    var curDate = null;

    do { curDate = new Date(); }
    while (curDate - date < millis);
}


// Initialise
function initialiseTimelineApp() {
    initEvents();

    

    addfirstline();

   // var head = document.createElement("h1");
    //head.innerHTML = "xxx";
    //var dc = document.getElementById("divCoord")
    //    dc.appendChild(head);
    

}





// Add the first timeline (getting the details of the period covered from the event definitions)
function addfirstline() {

    addnextline(eventDefinitions.firstLineStartTime, eventDefinitions.firstLineStartTimeDef.time, eventDefinitions.firstLineStartTimeDef.type,eventDefinitions.firstLineEndTime, eventDefinitions.firstLineEndTimeDef.time, eventDefinitions.firstLineEndTimeDef.type ) ;
    moveToNextEvent() ;
}


// Add the next timeline with the given definition
function addnextline(startTime, startTimeDefTime, startTimeDefType, endTime, endTimeDefTime, endTimeDefType  ) {


    // update the state
    state.currentTimelineID = state.currentTimelineID + 1;
    state.currentTimeline = state.timelines[state.currentTimelineID];
    state.currentTimeline.startTime = startTime;
    state.currentTimeline.startTimeDef.time = startTimeDefTime;
    state.currentTimeline.startTimeDef.type = startTimeDefType;
    state.currentTimeline.endTime = endTime;
    state.currentTimeline.endTimeDef.time = endTimeDefTime;
    state.currentTimeline.endTimeDef.type = endTimeDefType;
    state.currentTimeline.period = endTime - startTime;

    // update the text on the line
    setTimelineStartText(state.currentTimelineID);
    setTimelineEndText(state.currentTimelineID);

    // create the events
    summonEvents(state.currentTimelineID);



    // TODO Remove comments
    // If not the first, display the transition region
    //  if (state.currentTimelineID != 0) {
    //    setTransitionVisibility(state.currentTimelineID, "visible");
    //    setTransitionPoints(state.currentTimelineID);
    //  }
    //-------

    // If this is the first timeline simply position the events on it and make it visible now.
    // If it is not, then start the transition to it

    if (state.currentTimelineID == 0) {
        setTimelineVisibility(state.currentTimelineID, "visible");
        setTimelineTextVisibility(state.currentTimelineID, "visible");
        positionevents(state.currentTimelineID);
    }
    else {
        startTransitionOfLine(state.currentTimelineID);
        // note that code <here> after starting a new transition isnt called
    }

}


// Start the transition to the given line
// Reset the global that gives the # steps, position line for step 0, and start the timer
function startTransitionOfLine(timelineID) {

    transitionCurrentStep = 0;
    positionTimelineInTransition(timelineID, 0);
    setTimelineVisibility(timelineID, "visible");
    setTransitionVisibility(timelineID, "visible");

    transitionInProgess = true;
    timer = setInterval(doTransitionAnim, TRANSITIONDELAY); // Call the doAnim() function every "delay" milliseconds until "timer" is cleared.  
}

// Do the actual transition. This function is called by setInterval() every "delay" milliseconds.
function doTransitionAnim() {


    transitionCurrentStep = transitionCurrentStep + 1;
    positionTimelineInTransition(state.currentTimelineID, transitionCurrentStep)

    // If this is last step, display the text and stop the timer
    if (transitionCurrentStep == TRANSITIONNUMBEROFSTEPS_SAMESIZE + TRANSITIONNUMBEROFSTEPS_GROWING) {

        finishTransitionOfLine(state.currentTimelineID);

    }

    
}


// Finish off the tranistion.
// Display the text, and move onto the Next Event on this line, and clear the timer
function finishTransitionOfLine(timelineID) {
    clearInterval(timer); // The transition is done, instruct the browser to stop calling the doAnim() function.
    transitionInProgess = false;
    setTimelineTextVisibility(timelineID, "visible");
    moveToNextEvent();
   // note that code after starting a new transition isnt called

}


// Position the timeline during the transition
// This just sets the positions for it and the events, and the trailing transition region.
// The line has already been made visible, and events created
// This also positions the events and the shape (points on) the transition region 
// CHANGES HERE SHOULD BE REFLECTED IN setTransitionPoints
function positionTimelineInTransition(timelineID, step) {
      

    var TIMELINELEFTX = getTransitionPositionX(timelineID, step);
    var TIMELINELEFTY = getTransitionPositionY(timelineID, step);
    var TIMELINERIGHTX = getTransitionPositionRightX(timelineID, step);

    setTimelinePosition(timelineID, TIMELINELEFTX, TIMELINELEFTY, TIMELINERIGHTX - TIMELINELEFTX);

    positionevents(timelineID);
    setTransitionPoints(timelineID, step);


}

// Set the transition points on the transition region for the current step, transitioning *to* this timeline. 
// This effectively just mirrors the points used in the positionTimelineInTransition fn, leaving a trace of where the timeline has been
// If the points for the timeline for the different steps were 
//      (XL0, YL0), (XR0, YR0), (XL1, YL1), (XR1, YR1),..., (XL9, YL9), (XR9, YR9), 
// then the transition region points are
//      XL0 YL0 XL1 YL1 ... XL9 YL9 XR9 YR9....XR1 YR1 XR0 YR0

function setTransitionPoints(timelineID,step) {

    var leftPoints= "";         //   the series of left side points
    var rightPoints = "";        //   the series of right side points
    var points = "";

    var previousStep  = 0  ;     // to iterate thru previous steps to this one


    for (previousStep; previousStep <= step; previousStep++ ) {             // iterate, building up the sequence of paths
        // this part simply copies positionTimelineInTransition
        var TIMELINELEFTX = getTransitionPositionX(timelineID, previousStep);
        var TIMELINELEFTY = getTransitionPositionY(timelineID, previousStep);
        var TIMELINERIGHTX = getTransitionPositionRightX(timelineID, previousStep);
        leftPoints = leftPoints + " " + TIMELINELEFTX + " " + TIMELINELEFTY + " ";
        rightPoints = TIMELINERIGHTX + " " + TIMELINELEFTY + " " + rightPoints;
    }


    points = leftPoints + " " + rightPoints;
    var transitionElement = getTransitionElement(timelineID);
    transitionElement.setAttribute("points", points);

}




// Create the events on the given line
// Events appear if in the range, and their maxPeriod is small enough (or blank)
// Events are positioned and made visible in other routine
// Each event is within the timeline group, and is of the form:
//         <!--line id="event-0-0" eventid="0" proportion="0"  class="event" style="visibility:hidden" x1="160" y1="40" x2="160" y2="60"  /-->
function summonEvents(timelineID) {

    var timelineGroupElement = getTimelineGroupElement(timelineID);
    var timeline = state.currentTimeline;

    var timelineElement = getTimelineElement(timelineID);

    for (var i = 0 ; i < events.length; i++) {

        var event = events[i];

        if (shouldAppearOnLine(i,timelineID)) {    // ensure should create on line

            var eventElement = document.createElementNS("http://www.w3.org/2000/svg","line");    //Need to create element using svg namespace
            timelineGroupElement.appendChild(eventElement);

            eventElement.setAttribute("id", eventElementID(timelineID, i));
            eventElement.setAttribute("eventid", i);
            eventElement.setAttribute("proportion",   (event.time - timeline.startTime) / timeline.period);
            eventElement.setAttribute("class","event");
            setEventVisibility(timelineID,i,"hidden") ;
            eventElement.setAttribute("y1", parseInt(timelineElement.getAttribute("y"))) ;    // position on the timeline
            eventElement.setAttribute("y2", parseInt(timelineElement.getAttribute("y"))+parseInt(timelineElement.getAttribute("height"))) ;    // position on the timeline
            eventElement.setAttribute("x1", 100) 
            eventElement.setAttribute("x2", 100);

        }

    }
  
}


// Position the events on the given line
// Go thru all the events in the timeline group, and set the x position 
function positionevents(timelineID) {

    var timelineGroupElement = getTimelineGroupElement(timelineID);
    var timelineElement = getTimelineElement(timelineID);
    var lineLeftX = parseInt(timelineElement.getAttribute("x"));
    var lineRightX = lineLeftX + parseInt(timelineElement.getAttribute("width"));
    var lineTopY = parseInt(timelineElement.getAttribute("y"));
    var lineBottomY = lineTopY + parseInt(timelineElement.getAttribute("height"));


    for (var i = 0 ; i < timelineGroupElement.childNodes.length; i++) {

        if (timelineGroupElement.childNodes[i].nodeType == 1) {    // go thru all child nodes of the group, ignoring text
            var event = timelineGroupElement.childNodes[i];
            if (event.getAttribute("class") == "event" || event.getAttribute("class") == "selectedevent") {
                var eventX = lineLeftX + (lineRightX - lineLeftX) * parseFloat(event.getAttribute("proportion"));
                event.setAttribute("x1",eventX );
                event.setAttribute("y1", lineTopY);
                event.setAttribute("x2", eventX);
                event.setAttribute("y2", lineBottomY);

                setEventVisibility(timelineID, event.getAttribute("eventid"), "visible");
            }
        }



    }


}



// Handle the click of the right button. Clear selection on old event, then move to next
// Do nothing if a transition in progress
function handleMoveToNextEvent() {

    if (transitionInProgess == true) {
        return
    }


    var previousEventID = state.currentEventID;

    // Make old event unselected (if there is one)
    if (previousEventID != -1) {
        var previousEventElement = getEventElement(state.currentTimelineID, state.currentEventID);
        previousEventElement.setAttribute("class", "event");
    }

    moveToNextEvent();

}


// Move onto the next event. Add new lines if need be if go past zoom point
function moveToNextEvent() {

    var currentEvent = state.currentevent;
    var zoompoint = eventDefinitions.zoomPoints[state.currentTimelineID];

    var nextEventID = getNextEventID();                 // returns -1 if non on this line

    if (nextEventID != -1  && events[nextEventID].time <= zoompoint.time ) { 
        moveToNextEventOnCurrentLine(nextEventID);
    }
    else {
        // TO DO - handle case where no nextEvent, or past the zoom point
        if (events.length > state.currentEventID + 1 && state.currentTimelineID
 < MAXNUMBEROFTIMELINES) {
            addnextline(zoompoint.time, zoompoint.timeDef.time, zoompoint.timeDef.type, state.currentTimeline.endTime, state.currentTimeline.endTimeDef.time, state.currentTimeline.endTimeDef.type);
          //  moveToNextEvent();
        }
    }
}




// Handle the event moving to the next event , where already know this is on the current timeline. 
    function moveToNextEventOnCurrentLine(nextEventID) {


        // Make new event selected
        var nextEventElement = getEventElement(state.currentTimelineID,nextEventID);
        nextEventElement.setAttribute("class", "selectedevent");

        // Update display on new event
        updateEventDisplay(nextEventID);

        // update the state;
        state.currentEventID = nextEventID;
        state.currentEvent = events[nextEventID];


    }




// Update the display to show the details of the given eventID . 
function updateEventDisplay(EventID) {

    var eventElement =  getEventElement(state.currentTimelineID,EventID);

    // Update display on new event
    document.getElementById("connecter").setAttribute("x1", eventElement.getAttribute("x1"));
    document.getElementById("connecter").setAttribute("y1", eventElement.getAttribute("y2"));
    document.getElementById("eventImage").setAttribute("src", events[EventID].image.url);
    document.getElementById("eventTitle").innerHTML = events[EventID].title;
    document.getElementById("eventTime").innerHTML = timeOrPeriodDescription(events[EventID].timeDef.time, events[EventID].timeDef.type, events[EventID].endTimeDef.time, events[EventID].endTimeDef.type);
    document.getElementById("eventDescription").innerHTML = events[EventID].description;

}




// Handle the event moving to the next event on the current timeline. 
function getNextEventID() {

    var currentEvent = state.currentevent;
    var nextEventID = -1;

    for (var i = state.currentEventID+1 ; i < events.length; i++) {     // look at remaining events past current one

        if (shouldAppearOnLine(i, state.currentTimelineID)) {    // should go on line
            nextEventID  = i ;
            break ;   // no need to check anymore
        }
    }


    return nextEventID  ;


}


// TEST OF ANIMATION ----------------------------------------------------------------------------------------------------------------------------------//

/* CONSTANTS */
var currentTranslate = 0; // The initial rotation angle, in degrees.
var translateLimit = 0; // The maximum number of degrees to rotate the square.

/* 
  Note that it will take the square (angularLimit/thetaDelta)*delay milliseconds to rotate an angularLimit
  number of degrees. For example, (90/0.3)*10 = 3000 ms (or 3 seconds) to rotate the square 90 degrees.
*/

/* GLOBALS */
var theSquare; // Will contain a reference to the square element, as well as other things.


function init()
    /*
      Assumes that this function is called after the page loads.
    */ {
    translateLimit = translateLimit + 100;
    theSquare = document.getElementById("mySquare"); // Set this custom property after the page loads.
    timer = setInterval(doAnim, delay); // Call the doAnim() function every "delay" milliseconds until "timer" is cleared.     
}

function doAnim()
    /*
      This function is called by setInterval() every "delay" milliseconds.
    */ {
    if (currentTranslate > translateLimit) {
        clearInterval(timer); // The square has rotated enough, instruct the browser to stop calling the doAnim() function.
        return; // No point in continuing; stop now.
    }

    theSquare.setAttribute("transform", "translate(" + currentTranslate + ")"); // Rotate the square by a small amount.


    // Test: Bulk move

    var line1 = document.getElementById("line1");
    // line1.setAttribute("transform", "rotate(30deg)");



    for (var i = 0 ; i < line1.childNodes.length; i++) {
        //   debugalert(line1.childNodes.length);
        var childevent = line1.childNodes[i];

        if (childevent.nodeType != 3) {

            if (childevent.getAttribute("class") == "event") {
                // childevent.setAttribute("transform", "translate(" + currentTranslate + ")");
                childevent.setAttribute("x1", currentTranslate + i * 5);
                childevent.setAttribute("x2", currentTranslate + i * 5);
            }
        }

    }






    currentTranslate = currentTranslate + 5 ;  // Increase the angle that the square will be rotated to, by a small amount.
}