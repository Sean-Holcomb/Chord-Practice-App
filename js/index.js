let startTime = 0;
let endTime = 0;
let sequenceString = "1 2 3 4";
let sequence = [1, 2, 3, 4];
let seqLength = 4;
let currentPosition = 0;

let activeChord = [];
let correctChords = [];

let currentMode = 5;
let currentRoot = 7;

let modNotes = ['C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B'];
let diatonic = [2,2,1,2,2,2,1];
let modes = ['Major', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Minor', 'Locrian'];

getProgression();

if (navigator.requestMIDIAccess) {
	console.log('This browser supports WebMIDI!');

	navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);

} else {
	console.log('WebMIDI is not supported in this browser.');
	document.querySelector('#instructions').innerHTML = 'Error: This browser does not support WebMIDI.';
}

function onMIDISuccess(midiAccess) {
	var inputs = midiAccess.inputs;
	var outputs = midiAccess.outputs;
	for (var input of midiAccess.inputs.values()) {
		input.onmidimessage = getMIDIMessage;
	}
}

function onMIDIFailure() {
	document.querySelector('#instructions').innerHTML = 'Error: Could not access MIDI devices. Connect a device and refresh to try again.';
	document.querySelector('#instructions').classList += ' red';
}

function getMIDIMessage(message) {
	document.querySelector('#instructions').classList += ' red';
	var command = message.data[0];
	var note = message.data[1];
	var velocity = (message.data.length > 2) ? message.data[2] : 0; // a velocity value might not be included with a noteOff command

	switch (command) {
		case 144: // noteOn
			if (velocity > 0) {
				noteOnListener(note, velocity);
			} else {
				noteOffListener(note);
			}
			break;
		case 128: // noteOff
			noteOffListener(note);
			break;
	}
}


function noteOnListener(note, velocity) {
			if (currentPosition === 0 && startTime === 0){
				startTimer();
			}

			activeChord.push(note);
			activeChord = activeChord.sort();

			// Todo display notes being played

			checkChord();

}


function noteOffListener(note) {

	// Remove the note value from the active chord array
	activeChord.splice(activeChord.indexOf(note), 1);
	checkChord();

}

function checkChord() {
	let activeNotes = [];
	activeChord.forEach(function(note){
		activeNotes.push(note%12);
	});
	let match = true;
	for (let index = 0; index < activeNotes.length; index++) {
		if (correctChords[currentPosition].indexOf(activeNotes[index]) < 0) {
			match = false;
			return;
		}
	}


	for (let index = 0; index < correctChords[currentPosition].length; index++) {
		if (activeNotes.indexOf(correctChords[currentPosition][index]) < 0) {
			match = false;
			return;
		}
	}

	if (match) {
		if (currentPosition === seqLength - 1){
			endTimer();
			resetEnv();
		} else {
			currentPosition++;
			createSequenceString();
		}
	}
}

function resetEnv(){
	startTime = 0;
	endTime = 0;
	currentPosition = 0;
	getProgression();
}




function startTimer(){
	// set timer for 60 minutes from start
	startTime = new Date();
}
/**
 * Function to calculate BPM of previous chord progression
 */
function endTimer() {
	endTime = new Date();
	let distance = endTime.getTime() - startTime.getTime();
	let minutes = distance / (1000. * 60.);
	let bpm = seqLength / minutes;
	bpm = Math.round(100.*bpm)/100.;
	document.querySelector('#bpm').innerText = "Tempo: " + bpm;
}

function getProgression() {
	// Create chord progression
	sequence = [];
	for (let i = 0; i < seqLength; i++){
		let value = Math.floor(Math.random() * 7)+1;
		sequence.push(value);
	}
	createSequenceString();
	setCorrectChords();
}

function createSequenceString() {
	// Generate Sequence String
	sequenceString = '';
	for (let i = 0; i<seqLength; i++) {

		let textColor = 'white';
		if (i < currentPosition){
			textColor = 'green';
		}
		if (i === currentPosition) {
			textColor = 'blue';
		}
		sequenceString += '<span class="' + textColor +'">';
		sequenceString += sequence[i] + '</span> '

	}
	document.querySelector('#sequence').innerHTML = sequenceString;
}


function setCorrectChords() {
	//construct scale
	correctChords = [];
	let scale = [currentRoot];
	let pos = currentRoot;
	for (let i = 0; i<6; i++) {
		pos = (pos + diatonic[(i+currentMode)%7])%12;
		scale.push(pos);
	}
	//construct correct triads
	for (let i in sequence) {
		i = (sequence[i]-1);
		let chord = [scale[i],scale[(i+2)%7], scale[(i+4)%7]];
		correctChords.push(chord);
	}
}
