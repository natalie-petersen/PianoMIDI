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
    const whiteKeyWidth = 16;
    const blackKeyWidth = whiteKeyWidth * bkwMod; //adjust
    const whiteKeyHeight = 195;
    const blackKeyHeight = whiteKeyHeight * bkhMod;

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

        let keyX = 0 + 2*whiteKeyWidth; //offsets to match up with graphic
        let keyY = 0;
        if (whiteKeys.includes(noteMod)) {
            //key is white, so calculate position based on that
            keyX += Math.floor(note / 12) * 7 * whiteKeyWidth + whiteKeys.indexOf(noteMod) * whiteKeyWidth;
        }
        else {
            // Calculate position for black keys 
            const blackKeys = [1, 3, 6, 8, 10]; // C#, D#, F#, G#, A# 
            // Offsets based on white key positions
            const blackOffsets = {1: 1.1, 3: 1.6, 6: 3.0, 8: 3.25, 10: 3.5}; 
            const whiteKeyX = Math.floor(note / 12) * 7 * whiteKeyWidth + blackKeys.indexOf(noteMod) * whiteKeyWidth + whiteKeyWidth * bkwMod * blackOffsets[noteMod]; 
            keyX += whiteKeyX;
        }
        if(isOn){
            ctx.fillStyle = 'rgba(0,0,255,0.5'; //highlight color
            if(whiteKeys.includes(noteMod)) {
                //key is white
                ctx.fillRect(keyX, keyY, whiteKeyWidth, whiteKeyHeight);
            } else {
                //key is black
                ctx.fillRect(keyX, keyY, blackKeyWidth, blackKeyHeight);
            }
        } else{
            //clear highlight
            if(whiteKeys.includes(noteMod)){
                ctx.clearRect(keyX, keyY, whiteKeyWidth, whiteKeyHeight);
            } else {
                ctx.clearRect(keyX, keyY, blackKeyWidth, blackKeyHeight);
            }
        }
    }
});
