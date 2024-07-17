<script>
    import "../styles.css";
    import { WebMidi } from "webmidi";

    let log = "";
    let midiInputs = [];
    let selectedMidiInput = "";

    WebMidi.enable()
        .then(onEnabled)
        .catch((err) => (log += err));

    function onEnabled() {
        console.log("midi inputs: " + WebMidi.inputs.length);
        midiInputs = WebMidi.inputs;
        if (midiInputs.length != 0) {
            selectedMidiInput = midiInputs[0].name;
            listenMidiInput();
        }
    }

    function listenMidiInput() {
        //listen to all midi channels
        const midiInput = WebMidi.getInputByName(selectedMidiInput);
        midiInput.addListener("noteon", (e) => {
            document.getElementById(e.note.name+e.note.number).style["fill"] = "red"

            let message = `note on: ${e.note.name}${e.note.octave} ${e.note.number}`;
            console.log(message);
            log += message + "\n";

            let logTextArea = document.getElementById("log");
            if (logTextArea.selectionStart == logTextArea.selectionEnd) {
                logTextArea.scrollTop = logTextArea.scrollHeight;
            }
        });
        midiInput.addListener("noteoff", (e) => {
            let key = document.getElementById(e.note.name+e.note.number)
            console.log(key.className.baseVal)
            if (key.className.baseVal == "white-key") {
                key.style["fill"] = "white"
            }
            else {
                key.style["fill"] = "black"
            } 
                            
            let message = `note on: ${e.note.name}${e.note.octave} ${e.note.number}`;
            console.log(message);
            log += message + "\n";

            let logTextArea = document.getElementById("log");
            if (logTextArea.selectionStart == logTextArea.selectionEnd) {
                logTextArea.scrollTop = logTextArea.scrollHeight;
            }
        });
        midiInput.addListener("controlchange", (e) => {
            if (e.subtype == "damperpedal") {
                if (e.value) {
                    let message = `pedal on`;
                    console.log(message);
                    log += message + "\n";
                } else {
                    let message = `pedal off`;
                    console.log(message);
                    log += message + "\n";
                }
                
                let logTextArea = document.getElementById("log");
                if (logTextArea.selectionStart == logTextArea.selectionEnd) {
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
<button on:focus={log = ""}>clear</button>
<textarea id="log" style="width: 100%; height:200px; font-size:xx-small">
    {log}
</textarea>
<!-- This keyboard has following properties (x=octave width).
     1. All white keys have equal width in front (W=x/7).
     2. All black keys have equal width (B=x/12).
     3. The narrow part of white keys C, D and E is W - B*2/3
     4. The narrow part of white keys F, G, A, and B is W - B*3/4 -->
     <svg xml:space="preserve" width="100%" height="125">
        <!--  White keys   -->
        <rect id="C60" class="white-key"  x="0" y="0" width="23" height="120"/>
        <rect id="D62" class="white-key"  x="23" y="0" width="23" height="120"/>
        <rect id="E64" class="white-key"  x="46" y="0" width="23" height="120"/>
        <rect id="F65" class="white-key"  x="69" y="0" width="23" height="120"/>
        <rect id="G67" class="white-key"  x="92" y="0" width="23" height="120"/>
        <rect id="A69" class="white-key"  x="115" y="0" width="23" height="120"/>
        <rect id="B71" class="white-key"  x="138" y="0" width="23" height="120"/>
        <!--  Black keys (overlap with the white keys)  -->
        <rect id="C61" class="black-key"  x="14.33333" y="0" width="13" height="80"/>
        <rect id="D63" class="black-key"  x="41.66666" y="0" width="13" height="80"/>
        <rect id="F66" class="black-key"  x="82.25" y="0" width="13" height="80"/>
        <rect id="G68" class="black-key"  x="108.25" y="0" width="13" height="80"/>
        <rect id="A70" class="black-key"  x="134.75" y="0" width="13" height="80"/>
    </svg>


