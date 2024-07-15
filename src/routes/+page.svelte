<!-- src/routes/+page.svelte -->
<!-- src/routes/+page.svelte -->
<script>
    import Navbar from '../lib/Navbar.svelte';
    import '../styles.css';
    import {WebMidi} from "webmidi";
    console.log(WebMidi)
    WebMidi.enable()

</script>

<Navbar />
<div class="home_hero">
    <h1>Enjoy Static Site Hosting With TESTTTTTTTETETETETETETET.</h1>
    <p>Fast, Secure, Reliable Hosting Solution.</p>
    <a href="https://kinsta.com/static-site-hosting">
        <div class="btn">Read more</div>
    </a>
</div>
<svg xml:space="preserve" width="161px" height="120">
    <script/>
    <!--  
         Copyright (c)  2005 Lauri Kaila.
         Permission is granted to copy, distribute and/or modify this document
         under the terms of the GNU Free Documentation License, Version 1.2
         or any later version published by the Free Software Foundation;
         with no Invariant Sections, no Front-Cover Texts, and no Back-Cover Texts.
         A copy of the license is included in the section entitled "GNU
         Free Documentation License".
         
         
         
         Intented to create a keyboard where key widths are
         accurately in position. 
         
         See http://www.mathpages.com/home/kmath043.htm
         for the math.
         
         This keyboard has following properties (x=octave width).
         1. All white keys have equal width in front (W=x/7).
         2. All black keys have equal width (B=x/12).
         3. The narrow part of white keys C, D and E is W - B*2/3
         4. The narrow part of white keys F, G, A, and B is W - B*3/4
         
     -->
    <!--  White keys   -->
    <rect style="fill:white;stroke:black" x="0" y="0" width="23" height="120"/>
    <rect style="fill:white;stroke:black" x="23" y="0" width="23" height="120"/>
    <rect style="fill:white;stroke:black" x="46" y="0" width="23" height="120"/>
    <rect style="fill:white;stroke:black" x="69" y="0" width="23" height="120"/>
    <rect style="fill:white;stroke:black" x="92" y="0" width="23" height="120"/>
    <rect style="fill:white;stroke:black" x="115" y="0" width="23" height="120"/>
    <rect style="fill:white;stroke:black" x="138" y="0" width="23" height="120"/>
    <!--  Black keys (overlap with the white keys)  -->
    <rect style="fill:black;stroke:black" x="14.33333" y="0" width="13" height="80"/>
    <rect style="fill:black;stroke:black" x="41.66666" y="0" width="13" height="80"/>
    <rect style="fill:black;stroke:black" x="82.25" y="0" width="13" height="80"/>
    <rect style="fill:black;stroke:black" x="108.25" y="0" width="13" height="80"/>
    <rect style="fill:black;stroke:black" x="134.75" y="0" width="13" height="80"/>
    </svg>

<style>
    .home_hero {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        text-align: center;
    }
    .home_hero h1 {
        font-size: 60px;
        width: 70%;
    }
    .home_hero p {
        color: #6e7076;
        font-size: 20px;
    }
    .btn {
        background-color: #5333ed;
        padding: 20px 30px;
        margin-top: 40px;
        border-radius: 5px;
        color: #fff;
    }
    @media (max-width: 700px) {
        .home_hero h1 {
            font-size: 40px;
        }
        .home_hero p {
            font-size: 16px;
        }
    }
</style>
