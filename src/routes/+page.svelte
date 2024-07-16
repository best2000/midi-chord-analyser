<script>
    import { onMount } from "svelte";
    import "../styles/styles.css";
    import { WebMidi } from "webmidi";

    let log = ""
    let midiInputs = [];
    let selectedMidiInput = "";
    $: console.log("selectedMidiInput: " + selectedMidiInput);

    function listenMidiInput() {
        //listen to all midi channels
        const midiInput = WebMidi.getInputByName(selectedMidiInput);
        midiInput.addListener("noteon", (e) => {
            let message = `note on: ${e.note.name}${e.note.octave} ${e.note.number}`
            console.log(message);
            log += message+"\n"
            let logTextArea = document.getElementById("log")
            if(logTextArea.selectionStart == logTextArea.selectionEnd) {
                logTextArea.scrollTop = logTextArea.scrollHeight;
            }

        });
        midiInput.addListener("noteoff", (e) => {
            let message = `note on: ${e.note.name}${e.note.octave} ${e.note.number}`
            console.log(message);
            log += message+"\n"
            let logTextArea = document.getElementById("log")
            if(logTextArea.selectionStart == logTextArea.selectionEnd) {
                logTextArea.scrollTop = logTextArea.scrollHeight;
            }
        });
        midiInput.addListener("controlchange", (e) => {
            if (e.subtype == "damperpedal") {
                if (e.value) {
                    let message = `pedal on`
                    console.log(message);
                    log += message+"\n"
                } else {
                    let message = `pedal off`
                    console.log(message);
                    log += message+"\n"
                }
                let logTextArea = document.getElementById("log")
                if(logTextArea.selectionStart == logTextArea.selectionEnd) {
                    logTextArea.scrollTop = logTextArea.scrollHeight;
                }
            }
        });
    }

    function updateMidiInputs() {
        midiInputs = WebMidi.inputs;
        console.log("midi inputs: " + WebMidi.inputs.length);
        WebMidi.inputs.forEach((input) => {
            console.log(input.manufacturer, input.name);
        });
    }

    function clear() {
        log=""
    }

    WebMidi.enable()
        .then(onEnabled)
        .catch((err) => (log += err));

    function onEnabled() {
        // Inputs
        console.log("midi inputs: " + WebMidi.inputs.length);
        midiInputs = WebMidi.inputs;
        if (midiInputs.length != 0) {
            selectedMidiInput = midiInputs[0].name;
            listenMidiInput();
        }
    }

    
</script>

<div>
    <h1>MIDI Chord Analyser</h1>
</div>
<label for="midi_input">MIDI Input:</label>
<select
    name="midi_input"
    bind:value={selectedMidiInput}
    on:focus={updateMidiInputs}
    on:change={listenMidiInput}
>
    {#each midiInputs as input}
        <option>{input.name}</option>
    {/each}
</select>
<button on:focus={clear}>clear</button>
<textarea id="log" style="width: 100%; height:200px; font-size:xx-small">
{log}
</textarea>
<!-- This keyboard has following properties (x=octave width).
     1. All white keys have equal width in front (W=x/7).
     2. All black keys have equal width (B=x/12).
     3. The narrow part of white keys C, D and E is W - B*2/3
     4. The narrow part of white keys F, G, A, and B is W - B*3/4 -->
<svg xml:space="preserve" width="100%" height="120">
    <!--  White keys   -->
    <rect class="white-key" x="0" y="0" width="20" height="120" />
    <rect class="white-key" x="20" y="0" width="20" height="120" />
    <rect class="white-key" x="40" y="0" width="20" height="120" />
    <rect class="white-key" x="60" y="0" width="20" height="120" />
    <rect class="white-key" x="80" y="0" width="20" height="120" />
    <rect class="white-key" x="100" y="0" width="20" height="120" />
    <rect class="white-key" x="120" y="0" width="20" height="120" />
    <rect class="white-key" x="140" y="0" width="20" height="120" />
    <rect class="white-key" x="160" y="0" width="20" height="120" />
    <rect class="white-key" x="180" y="0" width="20" height="120" />
    <rect class="white-key" x="200" y="0" width="20" height="120" />
    <!--  Black keys (overlap with the white keys)  -->
    <rect style="black-key" x="12.5" y="0" width="15" height="80" />
    <rect style="black-key" x="41.66666" y="0" width="13" height="80" />
    <rect style="black-key" x="82.25" y="0" width="13" height="80" />
    <rect style="black-key" x="108.25" y="0" width="13" height="80" />
    <rect style="black-key" x="134.75" y="0" width="13" height="80" />
</svg>
