//  Functions for determining which events appear
//-----------------------------------------------

// Succeed if the event should apear on the line, given theperiod shown by the line, and the max period of the event
function shouldAppearOnLine(eventID, lineID) {

    var event = events[eventID] ;
    var timeline = state.timelines[lineID] ;

    if ((event.maxPeriod == "" || event.maxPeriod <= timeline.period) &&     // max period blank or < period
            event.time >= timeline.startTime &&                             // start and end ok
         //   event.time <= timeline.endTime &&
            (event.endTime == "" || event.endTime <= timeline.endTime)) {    // and if event is a period, then fits
        return true;
    }
    else {
        return false;
    }

}






// Functions getting or changing the various UI elements




function setTimelineStartText(lineID) {

    var textelement = document.getElementById("timelineStartText-" + lineID);
    textelement.textContent = formTimeText(state.currentTimeline.startTimeDef.time, state.currentTimeline.startTimeDef.type);

}



// Start text on a timeline
function setTimelineStartText(lineID) {

    var textelement = document.getElementById("timelineStartText-" + lineID);
    textelement.textContent = formTimeText(state.currentTimeline.startTimeDef.time, state.currentTimeline.startTimeDef.type);

}

// End text on a timeline
function setTimelineEndText(lineID) {

    var textElement = document.getElementById("timelineEndText-" + lineID);
    textElement.textContent = formTimeText(state.currentTimeline.endTimeDef.time, state.currentTimeline.endTimeDef.type);

}


// Set the timeline X,Y and width
function setTimelinePosition(timelineID, x, y, width) {

    var timeline = getTimelineElement(timelineID);
    timeline.setAttribute("x", x);
    timeline.setAttribute("y", y);
    timeline.setAttribute("width", width);
}








// Form the text given the time and type of a TimeDef
function formTimeText(time, type) {

    // To do - think about each type more
    var timeText

    timeText = time + " " + type;

    if (type == "Present") {
        timeText = "Present"
    }

    return timeText 
}

// Form the text describing the time for the given time, or period
function timeOrPeriodDescription(time, type, endTime, endType) {

    var timeDescription
    // If a period, and the same type of time, then dont repeat the type description 

    if (endTime == "" ) { timeDescription = addCommas(time) + timeTypeDescription(time, type)}
    else {

        if (type == endType) {timeDescription = addCommas(time) + " - " + addCommas(endTime) + timeTypeDescription(time, type)}
        else {
            timeDescription = adCommas(time) + timeTypeDescription(time, type) + " - " + addCommas(endTime) + timeTypeDescription(endTime, endType)
        }
    }
    return timeDescription

}




    // Form the text describing the type of the given time
    function timeTypeDescription(time, type) {

    var timeTypeText

    switch (type) {
        case "bya": timeTypeText = " billion years ago"; break;
        case "mya": timeTypeText = " million years ago"; break;
        case "ya": timeTypeText = " years ago"; break;
        case "BC": timeTypeText = " BC"; break;
        case "": if (time < 1000) { timeTypeText = " AD" } else { timeTypeText = "" }; break;
        default: timeTypeText = "";
    }

    return timeTypeText
}

// Add commas to a numeric string

    function addCommas(nStr) {
        nStr += '';
        x = nStr.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }


// --- Visibility ---

// Set the timeline visibility
function setTimelineVisibility(lineID, visibility) {

    var timelineElement = getTimelineElement(lineID);
    timelineElement.style.visibility = visibility
}

// Set the time line text visiblity (after first setting vertical position
function setTimelineTextVisibility(lineID, visibility) {

    var timeline = getTimelineElement(lineID);
    var textY = parseInt(timeline.getAttribute("y")) + TEXTVERTICALOFFSET;


    var textElement = document.getElementById("timelineStartText-" + lineID);
    textElement.setAttribute("y", textY); 
    textElement.style.visibility = visibility;

    var textElement = document.getElementById("timelineEndText-" + lineID);
    textElement.setAttribute("y", textY);
    textElement.style.visibility = visibility;
}


// Set the event visibility
function setEventVisibility(lineID, eventID, visibility) {
    getTransitionElement
}


// Set the transition region visibility
function setTransitionVisibility(lineID, visibility) {

    var transitionElement = getTransitionElement(lineID);
    transitionElement.style.visibility = visibility
}




// Get the transition position for the left side of the new timeline, for the given transition step.
// This will be called numerous times, first with Step 0, meaning the new line is displayed over the old line, with length depending on zoom point
// The line just moves down initialy, then starts growing

// For the curved growth, take it in a series of N steps
//   0, a, 2a, 3a, 4a, .....  (N-1)a
//   This totals (N-1)N/2 * a,   so we just choose a such that grow enough in the required number of steps

function getTransitionPositionX(lineID, step) {

    var CURRENTX;

    // find the very initial position for step 0
    var INITIALTOPLEFTX = FIRSTTIMELINEX + TIMELINEWIDTH * (state.timelines[lineID].startTime - state.timelines[lineID - 1].startTime) / state.timelines[lineID - 1].period;


    // If the step is currently below the number where stays same size, then just is initial size
    // Otherise it is growing to full width
    if (step <= TRANSITIONNUMBEROFSTEPS_SAMESIZE) {
        CURRENTX = INITIALTOPLEFTX;
    }
    else {
        //  For curved growth
        var growthSoFar = 0;
        var numberStepsGrowing = (step - TRANSITIONNUMBEROFSTEPS_SAMESIZE);


        // Arithmetic  0, a, 2a, 3a, 4a, .....  (N-1)a
        //var a = (INITIALTOPLEFTX - FIRSTTIMELINEX) / ((TRANSITIONNUMBEROFSTEPS_GROWING - 1) * TRANSITIONNUMBEROFSTEPS_GROWING / 2); //  Calc what 'a' must be
        //growthSoFar = a * (numberStepsGrowing - 1) * numberStepsGrowing / 2;
 
        // Growth = a * Steps ^2
        var a = (INITIALTOPLEFTX - FIRSTTIMELINEX) / (TRANSITIONNUMBEROFSTEPS_GROWING * TRANSITIONNUMBEROFSTEPS_GROWING * TRANSITIONNUMBEROFSTEPS_GROWING); //  Calc what 'a' must be
        growthSoFar = a * numberStepsGrowing * numberStepsGrowing * numberStepsGrowing ;


        // The formular below is for a simple straight line
        //growthSoFar =  (INITIALTOPLEFTX - FIRSTTIMELINEX) * numberStepsGrowing / TRANSITIONNUMBEROFSTEPS_GROWING

       
        
        CURRENTX = INITIALTOPLEFTX - growthSoFar;


    }

    return CURRENTX;
}

function getTransitionPositionY(lineID, step) {

    var CURRENTY;

    // find the very initial position for step 0
    var INITIALY = FIRSTTIMELINEY + TIMELINEGAP * (lineID - 1);

    // If the step is currently below the number where stays same size, then just pro rata the timeline height. 
    // Otherise pro rate down to final Y
    if (step <= TRANSITIONNUMBEROFSTEPS_SAMESIZE) {
        CURRENTY = INITIALY + (TIMELINEHEIGHT * step / TRANSITIONNUMBEROFSTEPS_SAMESIZE )  ;
    }
    else {
        //  
        CURRENTY = INITIALY + TIMELINEHEIGHT + ((TIMELINEGAP - TIMELINEHEIGHT) * (step - TRANSITIONNUMBEROFSTEPS_SAMESIZE) / TRANSITIONNUMBEROFSTEPS_GROWING);

    }

    return CURRENTY;
}


// Get the transition position for the **right** side of the new timeline, for the given transition step.
// This will be called numerous times, first with Step 0, meaning the new line is displayed over the old line, based on the zoom point and period being zoomed to
// The line just moves down initialy, then starts growing
// Only need worry about X - the Y position of the right hand is same as left
function getTransitionPositionRightX(lineID, step) {

    var CURRENTRIGHTX;

    // find the very initial position for step 0
    var INITIALTOPRIGHTX = FIRSTTIMELINEX + TIMELINEWIDTH    // TODO - handle case where zoom to particular period (i.e end period of this line not same as end of previous one)

    // If the step is currently below the number where stays same size, then just is initial size
    // Otherise it is growing to full width
    if (step <= TRANSITIONNUMBEROFSTEPS_SAMESIZE) {
        CURRENTRIGHTX = INITIALTOPRIGHTX;
    }
    else {
        // TODO: Make curved path?
        CURRENTRIGHTX = INITIALTOPRIGHTX + (FIRSTTIMELINEX + TIMELINEWIDTH - INITIALTOPRIGHTX) * (step - TRANSITIONNUMBEROFSTEPS_SAMESIZE) / TRANSITIONNUMBEROFSTEPS_GROWING

    }

    return CURRENTRIGHTX;
}




// Simply get elements
//-------------------

function getTimelineGroupElement(lineID)  {

    return document.getElementById("timelinegroup-" + lineID)
}

function getTransitionElement(lineID) {

    return document.getElementById("transition-" + lineID)
}

// Get timeline  by timelineID
function getTimelineElement(lineID) {
    var textelement = document.getElementById("timeline-" + lineID);
    return textelement

}

// Get the element for an event, by timelineID and eventID
function getEventElement(lineID,eventID) {
    var textelement = document.getElementById(eventElementID(lineID,eventID));
    return textelement

}


// Form event element ID from timelineID and eventID
function eventElementID(lineID,eventID) {
    var textelement = "event-" + lineID + "-" + eventID;
    return textelement

}


