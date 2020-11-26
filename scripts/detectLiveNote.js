window.AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext = null;
var isPlaying = false;
var sourceNode = null;
var analyser = null;
var theBuffer = null;
var mediaStreamSource = null;
var highestNote = 0;
var highestNoteString = '';
var lastNoteStrings = [null, null, null, null, null, null, null, null, null, null];
var detectorElem, pitchElem, noteElem, highestElem, inputButtonElem;

window.onload = function () {
    // get elements
    detectorElem = document.getElementById('detector');
    pitchElem = document.getElementById('pitch');
    noteElem = document.getElementById('note');
    highestElem = document.getElementById('highest');
    inputButtonElem = document.getElementById('input-button');
};

function toggleLiveInput() {
    if (isPlaying) {
        //stop playing and return
        inputButtonElem.innerText = 'Start';
        mediaStreamSource = null;
        analyser = null;
        isPlaying = false;
        highestNote = 0;
        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = window.webkitCancelAnimationFrame;
        window.cancelAnimationFrame(rafID);
        return;
    }
    audioContext = new AudioContext();
    getUserMedia({
        audio: {
            mandatory: {
                googEchoCancellation: 'false',
                googAutoGainControl: 'false',
                googNoiseSuppression: 'false',
                googHighpassFilter: 'false',
            },
            optional: [],
        },
    });
    return;
}

async function getUserMedia(dictionary) {
    let stream = null;
    try {
        stream = await navigator.mediaDevices.getUserMedia(dictionary);
        gotStream(stream);
        inputButtonElem.innerText = 'Stop';
        isPlaying = true;
    } catch (e) {
        alert('getUserMedia threw exception :' + e);
    }
}

function gotStream(stream) {
    mediaStreamSource = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    mediaStreamSource.connect(analyser);
    updatePitchLive();
}

var rafID = null;
var tracks = null;
var buflen = 2048;
var buf = new Float32Array(buflen);
var noteStrings = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function noteFromPitch(frequency) {
    var noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
    return Math.round(noteNum) + 69;
}

function autoCorrelate(buf, sampleRate) {
    // Implements the ACF2+ algorithm
    var SIZE = buf.length;
    var rms = 0;

    for (var i = 0; i < SIZE; i++) {
        var val = buf[i];
        rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01)
        // not enough signal
        return -1;

    var r1 = 0,
        r2 = SIZE - 1,
        thres = 0.2;
    for (var i = 0; i < SIZE / 2; i++)
        if (Math.abs(buf[i]) < thres) {
            r1 = i;
            break;
        }
    for (var i = 1; i < SIZE / 2; i++)
        if (Math.abs(buf[SIZE - i]) < thres) {
            r2 = SIZE - i;
            break;
        }

    buf = buf.slice(r1, r2);
    SIZE = buf.length;

    var c = new Array(SIZE).fill(0);
    for (var i = 0; i < SIZE; i++)
        for (var j = 0; j < SIZE - i; j++) c[i] = c[i] + buf[j] * buf[j + i];

    var d = 0;
    while (c[d] > c[d + 1]) d++;
    var maxval = -1,
        maxpos = -1;
    for (var i = d; i < SIZE; i++) {
        if (c[i] > maxval) {
            maxval = c[i];
            maxpos = i;
        }
    }
    var T0 = maxpos;

    var x1 = c[T0 - 1],
        x2 = c[T0],
        x3 = c[T0 + 1];
    a = (x1 + x3 - 2 * x2) / 2;
    b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);

    return sampleRate / T0;
}

function octaveFromPitch(pitch) {
    if (pitch >= 2093.005) return 7;
    if (pitch >= 1046.502) return 6;
    if (pitch >= 523.2511) return 5;
    if (pitch >= 261.6256) return 4;
    if (pitch >= 130.8128) return 3;
    if (pitch >= 65.40639) return 2;
    if (pitch >= 32.7032) return 1;
    return 0;
}

function updatePitchLive(time) {
    var cycles = new Array();
    analyser.getFloatTimeDomainData(buf);
    var ac = autoCorrelate(buf, audioContext.sampleRate);

    if (ac == -1) {
        detectorElem.className = 'vague';
        pitchElem.innerText = '-';
        noteElem.innerText = '-';
    } else {
        detectorElem.className = 'confident';
        pitch = ac;
        pitchElem.innerText = Math.round(pitch);
        var note = noteFromPitch(pitch);
        var noteString = noteStrings[note % 12] + octaveFromPitch(pitch);
        noteElem.innerHTML = noteString;
        lastNoteStrings.push(noteString);
        lastNoteStrings.shift();
        var allEqual = (arr) => arr.every((v) => v === arr[0]);

        if (note > highestNote && allEqual(lastNoteStrings)) {
            highestNoteString = noteString;
            highestElem.innerText = highestNoteString;
            highestNote = note;
        }
    }
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = window.webkitRequestAnimationFrame;
    rafID = window.requestAnimationFrame(updatePitchLive);
}