<script>
    import "../styles.css";
    import { WebMidi } from "webmidi";
    import { removeSameElementFromSet } from "../lib/index"

    let log = "";
    let midiInputs = [];
    let selectedMidiInput = "";
    $: if (selectedMidiInput) console.log("selectedMidiInput: "+selectedMidiInput)
    let noteOn = new Set([]);
    let noteOff = new Set([]);
    let pedal = false;
    $: if (pedal) console.log("pedal: "+pedal)

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
            noteOn.add(e.note.number)
            console.log(noteOn)
            
            let message = `note on  : ${e.note.name}${e.note.octave} : ${e.message.statusByte.toString(2)} : ${e.note.number}\n`;
            console.log(message);
            log += message
            log+=`on       : [${Array.from(noteOn)}]\nsustain  : [${Array.from(noteOff)}]\n`

            document.getElementById(e.note.name+e.note.number).style["fill"] = "red"

            let logTextArea = document.getElementById("log");
            if (logTextArea.selectionStart == logTextArea.selectionEnd) {
                logTextArea.scrollTop = logTextArea.scrollHeight;
            }
        });
        midiInput.addListener("noteoff", (e) => {
            if (pedal == false) {
                noteOn.delete(e.note.number) 
                console.log(noteOn)
            }
            else {
                noteOff.add(e.note.number)
                console.log(noteOff)
            }

            let message = `note off : ${e.note.name}${e.note.octave} : ${e.message.statusByte.toString(2)} : ${e.note.number}\n`;
            console.log(message);
            log += message;
            log+=`on       : [${Array.from(noteOn)}]\nsustain  : [${Array.from(noteOff)}]\n`

            let key = document.getElementById(e.note.name+e.note.number)
            console.log(key.className.baseVal)
            if (key.className.baseVal == "white-key") 
                key.style["fill"] = "white"
            else 
                key.style["fill"] = "black"
            
            let logTextArea = document.getElementById("log");
            if (logTextArea.selectionStart == logTextArea.selectionEnd) {
                logTextArea.scrollTop = logTextArea.scrollHeight;
            }
        });
        midiInput.addListener("controlchange", (e) => {
            if (e.subtype == "damperpedal") {
                if (e.value) {
                    pedal = true
                    let message = `pedal on\n`;
                    console.log(message);
                    log += message;
                } else {
                    pedal = false
                    removeSameElementFromSet(noteOn,noteOff)
                    noteOff.clear()
                    let message = `pedal off\n`;
                    console.log(message);
                    log += message;
                }
                log+=`on       : [${Array.from(noteOn)}]\nsustain  : [${Array.from(noteOff)}]\n`
                
                let logTextArea = document.getElementById("log");
                if (logTextArea.selectionStart == logTextArea.selectionEnd) {
                    logTextArea.scrollTop = logTextArea.scrollHeight;
                }
            }
        });
    }
    function clear() {
        log = ""
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
<button on:focus={clear}>clear</button>
<textarea id="log" style="width: 200px; height:200px; font-size:xx-small">
{log}
</textarea>
<p>pedal: {pedal}</p>
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


