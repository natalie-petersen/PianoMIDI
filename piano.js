import * as Tone from 'https://cdn.skypack.dev/tone';

document.addEventListener('DOMContentLoaded', () => {
    if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
    } else {
        console.error('Web MIDI API is not supported in this browser.');
    }

    //initializing constants for website interactions
    const canvas = document.getElementById('pianoCanvas');
    const ctx = canvas.getContext('2d');
    const bkwMod = 0.53; //ratio for width
    const bkhMod = 0.67; //ratio for height
    const whiteKeyWidth = 16.65;
    const blackKeyWidth = whiteKeyWidth * bkwMod; //adjust
    const whiteKeyHeight = 195;
    const blackKeyHeight = whiteKeyHeight * bkhMod;

    canvas.addEventListener('click', handleCanvasClick);

    function onMIDISuccess(midiAccess) {
        for (let input of midiAccess.inputs.values()) {
            input.onmidimessage = getMIDIMessage;
        }
    }

    function onMIDIFailure() {
        console.error('Could not access your MIDI devices.');
    }

    function getMIDIMessage(midiMessage) {
        const [command, note, velocity] = midiMessage.data;
        switch (command) {
            case 144: // note on
                if (velocity > 0) {
                    playNote(note);
                    highlightKey(note, true);
                } else {
                    stopNote(note);
                    highlightKey(note, false);
                }
                break;
            case 128: // note off
                stopNote(note);
                highlightKey(note, false);
                break;
        }
    }

    function handleCanvasClick(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top; // Determine which key is clicked based on x-coordinate 
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        console.log('(' + x + "," + y + ")");
        console.log(pixel);
        const note = determineNoteFromPosition(x, y);
        if (note !== null) {
            playNote(note);
            highlightKey(note, true);
            setTimeout(() => highlightKey(note, false), 200); // Clear highlight after a short duration 
        }
    }

    async function playNote(note) {
        // Implement your piano sound playing logic here
        console.log('Playing note:', note);
        await Tone.start();
        const synth = new Tone.Synth().toDestination();
        synth.triggerAttackRelease(Tone.Midi(note).toFrequency(), '8n');
    }
    async function stopNote(note) {
        // Implement your note stop logic here
        console.log('Stopping note:', note);
    }

    function highlightKey(note, isOn) {
        const whiteKeys = [0, 2, 4, 5, 7, 9, 11]; //initializing which notes are white (C, D, E,F,G, A, B)
        const noteMod = note % 12;

        let keyX = 0; //offsets to match up with graphic
        let keyY = 0;
        if (whiteKeys.includes(noteMod)) {
            //key is white, so calculate position based on that
            keyX += Math.floor(note / 12) * 7 * whiteKeyWidth + whiteKeys.indexOf(noteMod) * whiteKeyWidth;
        }
        else {
            // Calculate position for black keys 
            const blackKeys = [1, 3, 6, 8, 10]; // C#, D#, F#, G#, A# 
            // Offsets based on white key positions
            const blackOffsets = { 1: 1.75, 3: 2.25, 6: 3.6, 8: 3.9, 10: 4.15 };
            const whiteKeyX = Math.floor(note / 12) * 7 * whiteKeyWidth + blackKeys.indexOf(noteMod) * whiteKeyWidth + whiteKeyWidth * bkwMod * blackOffsets[noteMod];
            keyX += whiteKeyX;
        }
        if (isOn) {
            ctx.fillStyle = 'rgba(0,0,255,0.5'; //highlight color
            if (whiteKeys.includes(noteMod)) {
                //key is white
                ctx.fillRect(keyX, keyY, whiteKeyWidth, whiteKeyHeight);
            } else {
                //key is black
                ctx.fillRect(keyX - 5, keyY, blackKeyWidth, blackKeyHeight);
            }
        } else {
            //clear highlight
            if (whiteKeys.includes(noteMod)) {
                ctx.clearRect(keyX, keyY, whiteKeyWidth, whiteKeyHeight);
            } else {
                ctx.clearRect(keyX - 5, keyY, blackKeyWidth, blackKeyHeight);
            }
        }
    }
    function determineNoteFromPosition(x, y) {
        const whiteKeys = [0, 2, 4, 5, 7, 9, 11]; // C, D, E, F, G, A, B (MIDI note % 12) 
        const blackKeys = [1, 3, 6, 8, 10]; // C#, D#, F#, G#, A# (MIDI note % 12) 
        const blackOffsets = { 1: 30, 3: 48, 6: 28, 8: 3.9, 10: 4.15 };
        const wkWidth = 52;
        const bkWidth = wkWidth * bkwMod;
        const bkHeight = whiteKeyHeight * bkhMod;
        const img = new Image(); img.src = 'piano.png'; img.onload = () => { //temp
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
            console.log(ctx);
            console.log(ctx.getImageData(x, y, 1, 1).data);
            for (let octave = 0; octave < 9; octave++) { // Assuming 9 octaves 
                if (y <= bkHeight) {
                    console.log('searching for black keys');
                    for (let i = 0; i < blackKeys.length; i++) {
                        const keyX = (octave * 7 * wkWidth) + blackOffsets[blackKeys[i] * wkWidth]; //this is the problem, I think
                        console.log(x + ',' + keyX);
                        if (x >= keyX && x < keyX + bkWidth) {
                            const note = octave * 12 + blackKeys[i];
                            console.log(keyX + " and " + octave + "so " + note);
                            return note;
                        }
                    }
                    console.log('found no black keys :(');
                }
                for (let i = 0; i < whiteKeys.length; i++) {
                    const keyX = (octave * 7 * wkWidth) + (i * wkWidth);
                    if (x >= keyX && x < keyX + wkWidth) {
                        const note = octave * 12 + whiteKeys[i];
                        console.log(keyX + " and " + octave + "so " + note);
                        return note;
                    }
                }
            } return null; // No key found 
        }
    }
);
