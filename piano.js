import * as Tone from 'https://cdn.skypack.dev/tone';

document.addEventListener('DOMContentLoaded', () => {
    if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
    } else {
        console.error('Web MIDI API is not supported in this browser.');
    }

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
                } else {
                    stopNote(note);
                }
                break;
            case 128: // note off
                stopNote(note);
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
});
