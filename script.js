// detect note

window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = null;
var isPlaying = false;
var sourceNode = null;
var analyser = null;
var theBuffer = null;
var mediaStreamSource = null;
var highestNote = 0;
var lastNotes = [null, null, null, null, null, null, null, null, null, null];
var detectorElem, pitchElem, noteElem, highestElem, inputButtonElem;

window.onload = function () {
    detectorElem = document.getElementById('detector');
    pitchElem = document.getElementById('pitch');
    noteElem = document.getElementById('note');
    highestElem = document.getElementById('highest');
    inputButtonElem = document.getElementById('input-button');
};

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
    updatePitch();
}

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

var rafID = null;
var tracks = null;
var buflen = 2048;
var buf = new Float32Array(buflen);
var noteStrings = [
    'C',
    'C#',
    'D',
    'D#',
    'E',
    'F',
    'F#',
    'G',
    'G#',
    'A',
    'A#',
    'B',
];

function noteFromPitch(frequency) {
    var noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
    return Math.round(noteNum) + 69;
}

function frequencyFromNoteNumber(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
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

function updatePitch(time) {
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
        lastNotes.push(noteString);
        lastNotes.shift();
        var allEqual = (arr) => arr.every((v) => v === arr[0]);

        if (note > highestNote && allEqual(lastNotes)) {
            highestElem.innerText = noteString;
            highestNote = note;
        }
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = window.webkitRequestAnimationFrame;
    rafID = window.requestAnimationFrame(updatePitch);
}

function submitUserNote() {
    var param = highestElem.innerText;
    if (param != '-') {
        window.location.href = '/pages/youtube.html?usernote=' + param;
    }
}

function submitYoutube() {
    var currentUrl = new URL(window.location.href);
    var usernote = currentUrl.searchParams.get('usernote');
    var youtubeUrl = new URL(document.getElementById('input').value);
    var youtubeID = youtubeUrl.searchParams.get('v');
    var wrapper = document.getElementById('wrapper');

    wrapper.innerHTML = `
        <h1>❸ Please wait</h1>
    `;

    // <<<<<< 지우지 마세요! >>>>>>>
    // get mp3 file link from youtube link
    // async function getMP3() {
    //     const response = await fetch(
    //         `https://youtube-to-mp32.p.rapidapi.com/yt_to_mp3?video_id=${youtubeID}`,
    //         {
    //             method: 'GET',
    //             headers: {
    //                 'x-rapidapi-key':
    //                     '76b3ab0246mshe435987951b0de0p106ccajsn5eadd7215507',
    //                 'x-rapidapi-host': 'youtube-to-mp32.p.rapidapi.com',
    //             },
    //         }
    //     );
    //     const responseData = await response.json();
    //     console.log(responseData);
    //     wrapper.innerHTML += `
    //         <div><img src="${responseData.Video_Thumbnail}" alt="${responseData.Title}"></div>
    //         <a href="${responseData.Download_url}" id="downloadYT">Download MP3</a>
    //     `;
    //     var downloadEl = document.getElementById('downloadYT');
    //     downloadEl.click();
    // }
    // getMP3();

    // temporary code not to use api
    wrapper.innerHTML += `
        <div><img src="https://img.youtube.com/vi/2ZtHF0UJO3o/hqdefault.jpg" alt="적재-풍경"></div>
        <a href="https://www.bensound.com/bensound-music/bensound-jazzyfrenchy.mp3" id="downloadYT">Download MP3</a>
        `;
    var downloadEl = document.getElementById('downloadYT');
    downloadEl.click();
}
