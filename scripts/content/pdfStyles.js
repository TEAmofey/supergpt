const pdfStyles = {
  style1: `
      body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-size: 11pt;
          color: #333;
          background: #ffffff;
          padding-right: 20px;
      }
      article {
          margin-top: 10px;
          margin-bottom: 10px;
          padding: 15px;
          border-radius: 8px;
          background: #F7F9FC;
          box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
          border-left: 5px solid #3498DB;
      }
      article:nth-child(odd) {
          border-left-color: #333;
      }
      article:nth-child(even) {
          margin-bottom: 16px;
      }

      h5, h6 {
          font-size: 14pt;
          font-weight: bold;
          color: #2C3E50;
          margin-top: 2px;
          margin-bottom: 10px;
          border-bottom: 2px solid #3498DB;
          padding-bottom: 5px;
      }

      p {
          margin: 0;
          padding: 0;
      }

      footer {
          font-size: 10pt;
          color: #777;
          writing-mode: vertical-rl; /* Makes text vertical */
          text-orientation: mixed; /* Ensures proper character orientation */
          position: fixed; /* Keeps it fixed on the right */
          right: 0; /* Aligns it to the right edge */
          bottom: -100px; /* Centers it vertically */
          transform: translateY(-50%); /* Ensures it stays centered */
          padding-left: 4px;
      }

      footer a {
          color: #3498DB;
          text-decoration: none;
          font-weight: bold;
      }`,
  // Style 2: Dark Minimal
  style2: `
      body {
        font-family: 'Courier New', Courier, monospace;
        font-size: 10pt;
        color: #EEE;
        background: #1E1E1E;
        padding: 20px;
      }
      article {
        margin: 20px 0;
        padding: 20px;
        border-radius: 0;
        background: #2C2C2C;
        border-left: 6px solid #FF9800;
        -webkit-print-color-adjust:exact;
        -webkit-filter:opacity(1);
      }
      article:nth-child(odd) {
        border-left-color: #FF5722;
      }
      article:nth-child(even) {
        margin-bottom: 24px;
      }
      h5, h6 {
        font-size: 16pt;
        font-weight: normal;
        color: #FFF;
        margin-top: 5px;
        margin-bottom: 15px;
        border-bottom: 1px solid #FF9800;
        padding-bottom: 3px;
      }
      p {
        margin: 5px 0;
        line-height: 1.5;
      }
      footer {
        font-size: 9pt;
        color: #BBB;
        writing-mode: vertical-lr;
        text-orientation: upright;
        position: fixed;
        left: 0;
        bottom: 20px;
        transform: translateY(0);
        padding-right: 5px;
      }
      footer a {
        color: #FF9800;
        text-decoration: none;
        font-weight: normal;
      }
    `,

  // Style 3: Elegant Serif
  style3: `
      body {
        font-family: Georgia, 'Times New Roman', Times, serif;
        font-size: 12pt;
        color: #4A4A4A;
        background: #FAF9F6;
        padding: 30px;
      }
      article {
        margin: 15px 0;
        padding: 25px;
        border-radius: 5px;
        background: #FFF;
        border-left: 4px solid #8C8C8C;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
      article:nth-child(odd) {
        border-left-color: #B47D56;
      }
      article:nth-child(even) {
        margin-bottom: 20px;
      }
      h5, h6 {
        font-size: 18pt;
        font-weight: bold;
        color: #333;
        margin-top: 10px;
        margin-bottom: 8px;
        border-bottom: 1px solid #B47D56;
        padding-bottom: 5px;
      }
      p {
        margin: 0 0 10px 0;
        line-height: 1.6;
      }
      footer {
        font-size: 10pt;
        color: #7D7D7D;
        writing-mode: vertical-rl;
        text-orientation: sideways;
        position: fixed;
        right: 10px;
        bottom: 10px;
        transform: rotate(180deg);
        padding-left: 8px;
      }
      footer a {
        color: #B47D56;
        text-decoration: underline;
        font-weight: bold;
      }
    `,

  // Style 4: Retro Neon
  style4: `
      body {
        font-family: 'Lucida Console', Monaco, monospace;
        font-size: 11pt;
        color: #E0E0E0;
        background: #000;
        padding: 20px;
      }
      article {
        margin: 10px 0;
        padding: 20px;
        border-radius: 10px;
        background: #111;
        box-shadow: 0 0 10px #00FFFF;
        border-left: 5px solid #00FF00;
      }
      article:nth-child(odd) {
        border-left-color: #FF00FF;
      }
      article:nth-child(even) {
        margin-bottom: 18px;
      }
      h5, h6 {
        font-size: 15pt;
        font-weight: bold;
        color: #00FFFF;
        margin-top: 5px;
        margin-bottom: 10px;
        border-bottom: 2px dashed #FF00FF;
        padding-bottom: 4px;
      }
      p {
        margin: 0;
        padding: 0;
      }
      footer {
        font-size: 10pt;
        color: #AAAAAA;
        writing-mode: vertical-rl;
        text-orientation: upright;
        position: fixed;
        right: 0;
        bottom: 0;
        transform: translateY(0);
        padding-left: 6px;
      }
      footer a {
        color: #FF00FF;
        text-decoration: none;
        font-weight: bold;
      }
    `,

  // Style 5: Clean and Structured
  style5: `
      body {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-size: 11pt;
        color: #222;
        background: #F5F5F5;
        padding: 25px;
      }
      article {
        margin: 20px 0;
        padding: 20px;
        border-radius: 3px;
        background: #FFF;
        border-left: 4px solid #4CAF50;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
      }
      article:nth-child(odd) {
        border-left-color: #8BC34A;
      }
      article:nth-child(even) {
        margin-bottom: 22px;
      }
      h5, h6 {
        font-size: 14pt;
        font-weight: 600;
        color: #333;
        margin-top: 10px;
        margin-bottom: 12px;
        border-bottom: 3px solid #4CAF50;
        padding-bottom: 6px;
      }
      p {
        margin: 0;
        padding: 0 0 10px 0;
        line-height: 1.6;
      }
      footer {
        font-size: 9pt;
        color: #555;
        writing-mode: vertical-rl;
        text-orientation: sideways;
        position: fixed;
        left: 10px;
        bottom: 10px;
        transform: translateY(0);
        padding-right: 8px;
      }
      footer a {
        color: #4CAF50;
        text-decoration: none;
        font-weight: 600;
      }
    `,
  // Style 6: Vintage Typewriter
  style6: `
      body {
        font-family: 'Courier New', Courier, monospace;
        font-size: 12pt;
        color: #3E3A33;
        background: #F4F1E9;
        padding: 30px;
        line-height: 1.5;
      }
      article {
        margin: 20px 0;
        padding: 20px;
        border-radius: 4px;
        background: #FFF;
        border-left: 4px dotted #A67B5B;
        box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
      }
      article:nth-child(odd) {
        border-left-color: #7D5A50;
      }
      article:nth-child(even) {
        margin-bottom: 25px;
      }
      h5, h6 {
        font-size: 16pt;
        font-weight: bold;
        color: #5B4636;
        margin-top: 10px;
        margin-bottom: 8px;
        border-bottom: 1px dashed #A67B5B;
        padding-bottom: 4px;
      }
      p {
        margin: 0 0 12px 0;
      }
      footer {
        font-size: 10pt;
        color: #7D5A50;
        writing-mode: vertical-rl;
        text-orientation: sideways;
        position: fixed;
        left: 14px;
        bottom: 20px;
        transform: rotate(0deg);
        padding-right: 6px;
      }
      footer a {
        color: #A67B5B;
        text-decoration: underline;
        font-weight: normal;
      }
    `,
  // Style 7: Futuristic Circuit
  style7: `
      body {
        font-family: 'Roboto', sans-serif;
        font-size: 11pt;
        color: #C0C0C0;
        background: linear-gradient(135deg, #0D0D0D, #1A1A1A);
        padding: 25px;
      }
      article {
        margin: 15px 0;
        padding: 20px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.05);
        border-left: 4px solid #00E5FF;
        box-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
      }
      article:nth-child(odd) {
        border-left-color: #FF4081;
      }
      article:nth-child(even) {
        margin-bottom: 18px;
      }
      h5, h6 {
        font-size: 18pt;
        font-weight: 700;
        color: #00E5FF;
        margin-top: 8px;
        margin-bottom: 10px;
        border-bottom: 2px solid #FF4081;
        padding-bottom: 5px;
        text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
      }
      p {
        margin: 0 0 10px 0;
      }
      footer {
        font-size: 10pt;
        color: #BDBDBD;
        writing-mode: vertical-rl;
        text-orientation: mixed;
        position: fixed;
        right: 8px;
        bottom: 30px;
        transform: translateY(-10%);
        padding-left: 8px;
      }
      footer a {
        color: #FF4081;
        text-decoration: none;
        font-weight: 700;
      }
    `,

  // Style 8: Organic Nature
  style8: `
      body {
        font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, serif;
        font-size: 12pt;
        color: #3B2F2F;
        background: #FFF8F0;
        padding: 30px;
        /* Optional: add a subtle paper texture as a background image */
        /* background-image: url('data:image/svg+xml;base64,...'); */
      }
      article {
        margin: 18px 0;
        padding: 22px;
        border-radius: 12px;
        background: #FDF6E3;
        border-left: 5px solid #8F9779;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      }
      article:nth-child(odd) {
        border-left-color: #A3B18A;
      }
      article:nth-child(even) {
        margin-bottom: 20px;
      }
      h5, h6 {
        font-size: 17pt;
        font-weight: bold;
        color: #6B4F4F;
        margin-top: 10px;
        margin-bottom: 10px;
        border-bottom: 2px solid #8F9779;
        padding-bottom: 6px;
        font-style: italic;
      }
      p {
        margin: 0 0 12px 0;
        line-height: 1.7;
      }
      footer {
        font-size: 10pt;
        color: #6B4F4F;
        writing-mode: vertical-rl;
        text-orientation: upright;
        position: fixed;
        left: 4px;
        bottom: 15px;
        transform: translateY(5%);
        padding-right: 6px;
      }
      footer a {
        color: #8F9779;
        text-decoration: none;
        font-weight: bold;
      }
    `,

  // Style 9: Comic Pop
  style9: `
      body {
        font-family: 'Comic Sans MS', cursive, sans-serif;
        font-size: 13pt;
        color: #222;
        background: #FFEB3B;
        padding: 20px;
      }
      article {
        margin: 15px 0;
        padding: 20px;
        border-radius: 15px;
        background: #FFF;
        border-left: 6px solid #F44336;
        box-shadow: 4px 4px 0px #3F51B5;
      }
      article:nth-child(odd) {
        border-left-color: #E91E63;
      }
      article:nth-child(even) {
        margin-bottom: 20px;
      }
      h5, h6 {
        font-size: 20pt;
        font-weight: bold;
        color: #3F51B5;
        margin-top: 12px;
        margin-bottom: 8px;
        border-bottom: 3px dashed #F44336;
        padding-bottom: 5px;
        text-shadow: 2px 2px 0px #FF5722;
      }
      p {
        margin: 0 0 15px 0;
      }
      footer {
        font-size: 10pt;
        color: #3F51B5;
        writing-mode: vertical-rl;
        text-orientation: sideways;
        position: fixed;
        right: 0px;
        bottom: 10px;
        transform: rotate(0deg);
        padding-left: 8px;
      }
      footer a {
        color: #E91E63;
        text-decoration: underline;
        font-weight: bold;
      }
    `,

  // Style 10: Abstract Geometry
  style10: `
      body {
        font-family: 'Arial', sans-serif;
        font-size: 11pt;
        color: #222;
        background: linear-gradient(45deg, #ECE9E6, #FFFFFF);
        padding: 25px;
      }
      article {
        margin: 20px 0;
        padding: 25px;
        border-radius: 10px;
        background: #FFF;
        border-left: 6px double #FF6F61;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        transform: skew(-2deg);
      }
      article:nth-child(odd) {
        border-left-color: #6B5B95;
      }
      article:nth-child(even) {
        margin-bottom: 28px;
        transform: skew(2deg);
      }
      h5, h6 {
        font-size: 16pt;
        font-weight: bold;
        color: #FF6F61;
        margin-top: 8px;
        margin-bottom: 8px;
        border-bottom: 2px solid #6B5B95;
        padding-bottom: 4px;
        letter-spacing: 1px;
      }
      p {
        margin: 0 0 12px 0;
        line-height: 1.5;
      }
      footer {
        font-size: 10pt;
        color: #6B5B95;
        writing-mode: vertical-rl;
        text-orientation: upright;
        position: fixed;
        left: 12px;
        bottom: 25px;
        transform: translateY(0);
        padding-right: 10px;
      }
      footer a {
        color: #FF6F61;
        text-decoration: none;
        font-weight: bold;
      }
    `,
  // Style 11: Celestial Night
  style11: `
      body {
        font-family: 'Montserrat', sans-serif;
        font-size: 12pt;
        color: #E0E8F9;
        background: radial-gradient(circle at center, #1B2735, #090A0F);
        padding: 20px;
      }
      article {
        margin: 20px 0;
        padding: 20px;
        border-radius: 15px;
        background: radial-gradient(circle at center, #1B2735, #090A0F);
        border: 1px dashed #E0E8F9;
        position: relative;
        overflow: hidden;
      }
      article::before {
        content: "";
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(224,232,249,0.2), transparent 10%);
        transform: rotate(45deg);
      }
      h5, h6 {
        font-size: 16pt;
        font-weight: bold;
        color: #F0F8FF;
        margin: 10px 0;
        border-bottom: 2px solid #8BAEDC;
        padding-bottom: 5px;
        text-transform: uppercase;
      }
      p {
        margin: 0 0 15px;
        line-height: 1.6;
      }
      footer {
        font-size: 10pt;
        color: #A0AEC0;
        writing-mode: vertical-rl;
        text-orientation: mixed;
        position: fixed;
        right: 0px;
        bottom: 10px;
        border-left: 2px solid #8BAEDC;
        padding-left: 10px;
      }
      footer a {
        color: #F0F8FF;
        text-decoration: none;
        font-weight: bold;
      }
    `,

  // Style 12: Pop Art Explosion
  style12: `
      body {
        font-family: 'Comic Sans MS', cursive, sans-serif;
        font-size: 13pt;
        color: #000;
        background: repeating-linear-gradient(45deg, #FF6B6B, #FF6B6B 10px, #FFF200 10px, #FFF200 20px);
        padding: 20px;
      }
      article {
        margin: 15px 0;
        padding: 25px;
        border-radius: 0;
        background: #fff;
        border: 3px solid #000;
        transform: rotate(-2deg);
      }
      h5, h6 {
        font-size: 18pt;
        font-weight: bold;
        color: #FF6B6B;
        margin: 10px 0;
        text-decoration: underline wavy #000;
      }
      p {
        margin: 0 0 12px;
      }
      footer {
        font-size: 11pt;
        color: #000;
        writing-mode: vertical-rl;
        text-orientation: upright;
        position: fixed;
        left: 4px;
        bottom: 15px;
        transform: rotate(0deg);
        padding-right: 8px;
      }
      footer a {
        color: #FF6B6B;
        text-decoration: none;
        font-weight: bold;
      }
    `,

  // Style 13: Industrial Blueprint
  style13: `
      body {
        font-family: 'Roboto Mono', monospace;
        font-size: 11pt;
        color: #1C2833;
        background: #ECF0F1;
        padding: 25px;
      }
      article {
        margin: 20px 0;
        padding: 20px;
        background: #fff;
        border: 2px solid #2980B9;
        border-radius: 0;
        position: relative;
      }
      /* A subtle blueprint overlay */
      article::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGgxMnYxMkgweiIgZmlsbD0iI0U0RTVFNiIvPjwvc3ZnPg==');
        opacity: 0.05;
      }
      h5, h6 {
        font-size: 16pt;
        font-weight: bold;
        color: #2980B9;
        margin: 5px 0 10px;
        border-bottom: 1px dashed #1C2833;
        padding-bottom: 4px;
      }
      p {
        margin: 0 0 10px;
        line-height: 1.4;
      }
      footer {
        font-size: 10pt;
        color: #1C2833;
        writing-mode: vertical-rl;
        text-orientation: upright;
        position: fixed;
        right: 10px;
        bottom: 10px;
        transform: translateY(-10%);
        padding-left: 6px;
      }
      footer a {
        color: #2980B9;
        text-decoration: none;
        font-weight: bold;
      }
    `,

  // Style 14: Watercolor Dream
  style14: `
      body {
        font-family: 'Dancing Script', cursive;
        font-size: 12pt;
        color: #4A4A4A;
        background: #FAF3F0;
        padding: 30px;
        background-image: url('https://www.transparenttextures.com/patterns/woven.png');
      }
      article {
        margin: 20px 0;
        padding: 25px;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.8);
        border: none;
        position: relative;
        overflow: hidden;
      }
      article::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, transparent, rgba(255, 183, 197, 0.3));
        mix-blend-mode: multiply;
      }
      h5, h6 {
        font-size: 20pt;
        font-weight: bold;
        color: #D32F2F;
        margin: 10px 0;
        text-shadow: 1px 1px 3px rgba(211,47,47,0.5);
      }
      p {
        margin: 0 0 15px;
        line-height: 1.6;
      }
      footer {
        font-size: 10pt;
        color: #D32F2F;
        writing-mode: vertical-rl;
        text-orientation: upright;
        position: fixed;
        left: 20px;
        bottom: 20px;
        transform: rotate(0deg);
        padding-right: 10px;
      }
      footer a {
        color: #D32F2F;
        text-decoration: none;
        font-weight: bold;
      }
    `,

  // Style 15: Cosmic Space
  style15: `
      body {
        font-family: 'Orbitron', sans-serif;
        font-size: 12pt;
        color: #F8F8F8;
        background: radial-gradient(circle at 50% 50%, #000428, #004e92);
        padding: 20px;
      }
      article {
        margin: 20px 0;
        padding: 25px;
        border-radius: 10px;
        background: rgba(0, 68, 146, 0.8);
        border: 3px solid rgba(255, 255, 255, 0.2);
        position: relative;
      }
      article::after {
        content: "";
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background: url('https://www.transparenttextures.com/patterns/asfalt-light.png');
        opacity: 0.1;
      }
      h5, h6 {
        font-size: 18pt;
        font-weight: bold;
        color: #00FFAB;
        margin: 10px 0;
        letter-spacing: 2px;
      }
      p {
        margin: 0 0 15px;
        line-height: 1.5;
      }
      footer {
        font-size: 10pt;
        color: #00FFAB;
        writing-mode: vertical-rl;
        text-orientation: upright;
        position: fixed;
        right: 4px;
        bottom: 15px;
        transform: rotate(0deg);
        padding-left: 10px;
      }
      footer a {
        color: #00FFAB;
        text-decoration: none;
        font-weight: bold;
      }
    `,

  // Style 16: Botanical Illustration
  style16: `
      body {
        font-family: 'Lora', serif;
        font-size: 12pt;
        color: #2C3E50;
        background: #ECF0F1;
        padding: 25px;
        background-image: url('https://www.transparenttextures.com/patterns/old-wall.png');
      }
      article {
        margin: 20px 0;
        padding: 25px;
        border-radius: 8px;
        background: #FFF;
        border-top: 5px solid #27AE60;
        border-bottom: 5px solid #27AE60;
        position: relative;
      }
      article::before {
        content: "";
        position: absolute;
        top: 0;
        right: 0;
        width: 60px;
        height: 60px;
        background: url('https://via.placeholder.com/60') no-repeat center center;
        background-size: cover;
        opacity: 0.3;
      }
      h5, h6 {
        font-size: 18pt;
        font-weight: bold;
        color: #27AE60;
        margin: 10px 0;
        border-bottom: 2px dotted #2C3E50;
        padding-bottom: 5px;
      }
      p {
        margin: 0 0 15px;
        line-height: 1.5;
      }
      footer {
        font-size: 10pt;
        color: #2C3E50;
        writing-mode: vertical-rl;
        text-orientation: sideways;
        position: fixed;
        left: 20px;
        bottom: 20px;
        transform: rotate(0deg);
        padding-right: 10px;
      }
      footer a {
        color: #27AE60;
        text-decoration: none;
        font-weight: bold;
      }
    `,

  // Style 17: Digital Doodle
  style17: `
      body {
        font-family: 'Indie Flower', cursive;
        font-size: 13pt;
        color: #444;
        background: #FFFBEC;
        padding: 20px;
        background-image: url('https://www.transparenttextures.com/patterns/diagonal-noise.png');
      }
      article {
        margin: 15px 0;
        padding: 20px;
        border-radius: 50px;
        background: #fff;
        border: 4px double #F39C12;
        position: relative;
      }
      h5, h6 {
        font-size: 20pt;
        font-weight: bold;
        color: #F39C12;
        margin: 10px 0;
        text-decoration: overline;
      }
      p {
        margin: 0 0 15px;
        line-height: 1.5;
      }
      footer {
        font-size: 11pt;
        color: #F39C12;
        writing-mode: vertical-rl;
        text-orientation: upright;
        position: fixed;
        left: 4px;
        bottom: 15px;
        transform: translateY(0) rotate(0deg);
        padding-right: 10px;
      }
      footer a {
        color: #F39C12;
        text-decoration: none;
        font-weight: bold;
      }
    `,

  // Style 18: Glitch Art
  style18: `
      body {
        font-family: 'Roboto', sans-serif;
        font-size: 12pt;
        color: #fff;
        background: #000;
        padding: 20px;
      }
      article {
        margin: 20px 0;
        padding: 25px;
        border-radius: 0;
        background: #222;
        position: relative;
        overflow: hidden;
      }
      article::before,
      article::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: inherit;
        mix-blend-mode: difference;
        opacity: 0.1;
        animation: glitch 2s infinite;
      }
      @keyframes glitch {
        0% { clip: rect(5px, 9999px, 15px, 0); }
        20% { clip: rect(15px, 9999px, 25px, 0); }
        40% { clip: rect(10px, 9999px, 20px, 0); }
        60% { clip: rect(0px, 9999px, 10px, 0); }
        80% { clip: rect(20px, 9999px, 30px, 0); }
        100% { clip: rect(5px, 9999px, 15px, 0); }
      }
      h5, h6 {
        font-size: 18pt;
        font-weight: bold;
        color: #FF4081;
        margin: 10px 0;
        text-shadow: 2px 2px 0 #000;
      }
      p {
        margin: 0 0 15px;
        line-height: 1.4;
      }
      footer {
        font-size: 10pt;
        color: #FF4081;
        writing-mode: vertical-rl;
        text-orientation: upright;
        position: fixed;
        right: 10px;
        bottom: 20px;
        transform: rotate(0deg);
        padding-left: 10px;
      }
      footer a {
        color: #FF4081;
        text-decoration: none;
        font-weight: bold;
      }
    `,

  // Style 19: Origami Fold
  style19: `
      body {
        font-family: 'Roboto', sans-serif;
        font-size: 12pt;
        color: #333;
        background: linear-gradient(135deg, #f0f0f0, #ffffff);
        padding: 20px;
      }
      article {
        margin: 20px 0;
        padding: 30px;
        background: #FFF;
        border-radius: 10px;
        transform: perspective(600px) rotateY(5deg);
        border: 2px solid #ccc;
      }
      h5, h6 {
        font-size: 18pt;
        font-weight: bold;
        color: #ff4081;
        margin: 10px 0;
        transform: rotate(-1deg);
      }
      p {
        margin: 0 0 15px;
        line-height: 1.5;
      }
      footer {
        font-size: 10pt;
        color: #ff4081;
        writing-mode: vertical-rl;
        text-orientation: sideways;
        position: fixed;
        left: 20px;
        bottom: 20px;
        transform: translateY(0) rotate(0deg);
        padding-right: 10px;
      }
      footer a {
        color: #ff4081;
        text-decoration: none;
        font-weight: bold;
      }
    `,

  // Style 20: Retro Computer
  style20: `
      body {
        font-family: 'Lucida Console', Monaco, monospace;
        font-size: 10pt;
        color: #33FF00;
        background: linear-gradient(90deg, #000, #222);
        padding: 20px;
      }
      article {
        margin: 20px 0;
        padding: 20px;
        border-radius: 0;
        background: #111;
        border: 1px solid #33FF00;
        position: relative;
      }
      h5, h6 {
        font-size: 14pt;
        font-weight: bold;
        color: #33FF00;
        margin: 10px 0;
        text-shadow: 1px 1px 2px #000;
      }
      p {
        margin: 0 0 12px;
        line-height: 1.4;
      }
      footer {
        font-size: 10pt;
        color: #33FF00;
        writing-mode: vertical-rl;
        text-orientation: upright;
        position: fixed;
        right: 4px;
        bottom: 20px;
        transform: rotate(0deg);
        padding-left: 10px;
      }
      footer a {
        color: #33FF00;
        text-decoration: none;
        font-weight: bold;
      }
    `,
  // Style 21: Underwater Dream
  style21: `
   body {
     font-family: 'Open Sans', sans-serif;
     font-size: 12pt;
     color: #FFFFFF;
     background: linear-gradient(to bottom, #2C3E50, #4CA1AF);
     padding: 20px;
   }
   article {
     margin: 20px 0;
     padding: 20px;
     border-radius: 10px;
     background: linear-gradient(to bottom, #2C3E50, #4CA1AF);
     border: 1px solid rgba(255, 255, 255, 0.3);
     position: relative;
     overflow: hidden;
   }
   article::before {
     content: "";
     position: absolute;
     top: -50%;
     left: -50%;
     width: 200%;
     height: 200%;
     background: radial-gradient(circle at center, rgba(255,255,255,0.2), transparent 70%);
     transform: rotate(30deg);
   }
   h5, h6 {
     font-size: 16pt;
     font-weight: bold;
     color: #E0F7FA;
     margin: 10px 0;
     border-bottom: 2px solid rgba(255,255,255,0.4);
     padding-bottom: 5px;
   }
   p {
     margin: 0 0 15px;
     line-height: 1.6;
   }
   footer {
     font-size: 10pt;
     color: #B2EBF2;
     writing-mode: vertical-rl;
     text-orientation: mixed;
     position: fixed;
     right: 4px;
     bottom: 15px;
     padding-left: 10px;
   }
   footer a {
     color: #E0F7FA;
     text-decoration: none;
     font-weight: bold;
   }
 `,

  // Style 22: Enchanted Forest
  style22: `
   body {
     font-family: 'Merriweather', serif;
     font-size: 12pt;
     color: #2E2E2E;
     background: linear-gradient(135deg, #dfe9f3, #ffffff);
     padding: 25px;
     background-image: url('https://www.transparenttextures.com/patterns/wood-pattern.png');
   }
   article {
     margin: 20px 0;
     padding: 20px;
     border-radius: 12px;
     background: #fff;
     border-left: 5px solid #6B8E23;
     box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
     position: relative;
   }
   article::after {
     content: "";
     position: absolute;
     top: 0;
     right: 0;
     bottom: 0;
     left: 0;
     background: url('https://www.transparenttextures.com/patterns/leather.png');
     opacity: 0.05;
   }
   h5, h6 {
     font-size: 18pt;
     font-weight: bold;
     color: #4E6E1F;
     margin: 10px 0;
     border-bottom: 2px dotted #6B8E23;
     padding-bottom: 6px;
   }
   p {
     margin: 0 0 15px;
     line-height: 1.6;
   }
   footer {
     font-size: 10pt;
     color: #6B8E23;
     writing-mode: vertical-rl;
     text-orientation: upright;
     position: fixed;
     left: 4px;
     bottom: 15px;
     transform: rotate(0deg);
     padding-right: 10px;
   }
   footer a {
     color: #4E6E1F;
     text-decoration: none;
     font-weight: bold;
   }
 `,

  // Style 23: Aurora Sky
  style23: `
   body {
     font-family: 'Lato', sans-serif;
     font-size: 12pt;
     color: #FFFFFF;
     background: linear-gradient(135deg, #0F2027, #203A43, #2C5364);
     padding: 20px;
   }
   article {
     margin: 20px 0;
     padding: 25px;
     border-radius: 8px;
     background: linear-gradient(135deg, #0F2027, #203A43, #2C5364);
     border: 2px solid rgba(255,255,255,0.3);
     position: relative;
   }
   article::before {
     content: "";
     position: absolute;
     top: 0;
     left: 0;
     width: 100%;
     height: 100%;
     background: linear-gradient(45deg, rgba(255,0,150,0.2), rgba(0,229,255,0.2));
     mix-blend-mode: overlay;
     pointer-events: none;
   }
   h5, h6 {
     font-size: 17pt;
     font-weight: bold;
     color: #B2DFDB;
     margin: 10px 0;
     border-bottom: 2px solid rgba(255,255,255,0.5);
     padding-bottom: 5px;
   }
   p {
     margin: 0 0 15px;
     line-height: 1.5;
   }
   footer {
     font-size: 10pt;
     color: #B2DFDB;
     writing-mode: vertical-rl;
     text-orientation: mixed;
     position: fixed;
     right: 4px;
     bottom: 15px;
     padding-left: 10px;
   }
   footer a {
     color: #B2DFDB;
     text-decoration: none;
     font-weight: bold;
   }
 `,

  // Style 24: Desert Mirage
  style24: `
   body {
     font-family: 'Roboto', sans-serif;
     font-size: 12pt;
     color: #4E342E;
     background: linear-gradient(135deg, #D7CCC8, #FFF3E0);
     padding: 25px;
   }
   article {
     margin: 20px 0;
     padding: 20px;
     border-radius: 10px;
     background: #fff7e6;
     position: relative;
   }
   article::after {
     content: "";
     position: absolute;
     top: 0;
     left: 0;
     width: 100%;
     height: 100%;
     background: url('https://www.transparenttextures.com/patterns/sandpaper.png');
     opacity: 0.1;
   }
   h5, h6 {
     font-size: 16pt;
     font-weight: bold;
     color: #8D6E63;
     margin: 10px 0;
     border-bottom: 2px dashed #D7CCC8;
     padding-bottom: 4px;
   }
   p {
     margin: 0 0 15px;
     line-height: 1.5;
   }
   footer {
     font-size: 10pt;
     color: #8D6E63;
     writing-mode: vertical-rl;
     text-orientation: sideways;
     position: fixed;
     left: 4px;
     bottom: 15px;
     transform: rotate(0deg);
     padding-right: 10px;
   }
   footer a {
     color: #8D6E63;
     text-decoration: none;
     font-weight: bold;
   }
 `,

  // Style 25: Mystic Marble
  style25: `
   body {
     font-family: 'Playfair Display', serif;
     font-size: 12pt;
     color: #333;
     background: #f2f2f2;
     padding: 25px;
     background-image: url('https://www.transparenttextures.com/patterns/marble.png');
   }
   article {
     margin: 20px 0;
     padding: 25px;
     border-radius: 15px;
     background: rgba(255, 255, 255, 0.9);
     border: 1px solid #ccc;
     position: relative;
     box-shadow: 0 4px 10px rgba(0,0,0,0.1);
   }
   h5, h6 {
     font-size: 18pt;
     font-weight: bold;
     color: #555;
     margin: 10px 0;
     border-bottom: 2px solid #ccc;
     padding-bottom: 5px;
   }
   p {
     margin: 0 0 15px;
     line-height: 1.6;
   }
   footer {
     font-size: 10pt;
     color: #777;
     writing-mode: vertical-rl;
     text-orientation: mixed;
     position: fixed;
     left: 4px;
     bottom: 15px;
     padding-right: 10px;
   }
   footer a {
     color: #555;
     text-decoration: none;
     font-weight: bold;
   }
 `,

  // Style 26: Tropical Vibes
  style26: `
   body {
     font-family: 'Poppins', sans-serif;
     font-size: 12pt;
     color: #fff;
     background: linear-gradient(135deg, #FF5F6D, #FFC371);
     padding: 20px;
   }
   article {
     margin: 20px 0;
     padding: 25px;
     border-radius: 10px;
     background: linear-gradient(135deg, #FF5F6D, #FFC371);
     border-left: 5px solid #FF5F6D;
     position: relative;
   }
   article::before {
     content: "";
     position: absolute;
     top: 0;
     left: 0;
     width: 100%;
     height: 100%;
     background: url('https://www.transparenttextures.com/patterns/purty-wood.png');
     opacity: 0.05;
   }
   h5, h6 {
     font-size: 18pt;
     font-weight: bold;
     color: #FFF;
     margin: 10px 0;
     border-bottom: 2px solid rgba(255,255,255,0.5);
     padding-bottom: 5px;
   }
   p {
     margin: 0 0 15px;
     line-height: 1.6;
   }
   footer {
     font-size: 10pt;
     color: #FFF;
     writing-mode: vertical-rl;
     text-orientation: upright;
     position: fixed;
     left: 4px;
     bottom: 15px;
     transform: rotate(0deg);
     padding-right: 10px;
   }
   footer a {
     color: #FF5F6D;
     text-decoration: none;
     font-weight: bold;
   }
 `,

  // Style 27: Galactic Nebula
  style27: `
   body {
     font-family: 'Fira Sans', sans-serif;
     font-size: 12pt;
     color: #000;
     background: radial-gradient(ellipse at center, #3a3a3a 0%, #000 80%);
     padding: 20px;
     background-image: url('https://www.transparenttextures.com/patterns/asfalt-light.png');
   }
   article {
     margin: 20px 0;
     color: #FFF;
     padding: 25px;
     border-radius: 10px;
     background: rgba(50, 50, 50, 0.8);
     border: 2px solid #7F00FF;
     position: relative;
   }
   article::after {
     content: "";
     position: absolute;
     top: 0;
     left: 0;
     width: 100%;
     height: 100%;
     background: radial-gradient(circle, rgba(127,0,255,0.2), transparent 70%);
     pointer-events: none;
   }
   h5, h6 {
     font-size: 17pt;
     font-weight: bold;
     color: #D1C4E9;
     margin: 10px 0;
     border-bottom: 2px solid rgba(255,255,255,0.3);
     padding-bottom: 5px;
   }
   p {
     margin: 0 0 15px;
     line-height: 1.5;
   }
   footer {
     font-size: 10pt;
     color: #D1C4E9;
     writing-mode: vertical-rl;
     text-orientation: upright;
     position: fixed;
     right: 4px;
     bottom: 15px;
     transform: rotate(0deg);
     padding-left: 10px;
   }
   footer a {
     color: #7F00FF;
     text-decoration: none;
     font-weight: bold;
   }
 `,

  // Style 28: Cosmic Watercolor
  style28: `
   body {
     font-family: 'Raleway', sans-serif;
     font-size: 12pt;
     color: #333;
     background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
     padding: 25px;
     background-image: url('https://www.transparenttextures.com/patterns/cubes.png');
     background-blend-mode: multiply;
   }
   article {
     margin: 20px 0;
     padding: 25px;
     border-radius: 15px;
     background: rgba(255,255,255,0.8);
     border: 2px dashed #fda085;
     position: relative;
   }
   article::before {
     content: "";
     position: absolute;
     top: 0;
     left: 0;
     width: 100%;
     height: 100%;
     background: linear-gradient(135deg, transparent, rgba(253,160,133,0.2));
     pointer-events: none;
   }
   h5, h6 {
     font-size: 17pt;
     font-weight: bold;
     color: #fda085;
     margin: 10px 0;
     border-bottom: 2px solid #f6d365;
     padding-bottom: 5px;
   }
   p {
     margin: 0 0 15px;
     line-height: 1.6;
   }
   footer {
     font-size: 10pt;
     color: #fda085;
     writing-mode: vertical-rl;
     text-orientation: upright;
     position: fixed;
     left: 4px;
     bottom: 15px;
     transform: rotate(0deg);
     padding-right: 10px;
   }
   footer a {
     color: #f6d365;
     text-decoration: none;
     font-weight: bold;
   }
 `,
};

const commonStyle = `
@media print {
  .hidden-print {
    display: none !important;
  }
}
.hidden-print {
  display: flex;
  align-items: center;
}
body {
  line-height: 2;
}
article {
  -webkit-print-color-adjust:exact;
  -webkit-filter:opacity(1);
}
table {
  table-layout: fixed;
  border-collapse: collapse;
  width: 100%;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
th {
  background-color: #f2f2f230;
}

li > p {
  display: inline;
  text-align: justify;
}
pre {
  text-align: left;
  white-space: normal;
  font-family: inherit;
}
pre code {
  white-space: pre-wrap;
}
code:not(:is(div[data-message-author-role="user"] *)) {
  display: inline-block;
  font-family: 'Fira Code', 'Source Code Pro', monospace;
  font-size: 11pt;
  background-color: #f0f0f0;
  color: #c7254e;
  padding: 2px 4px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin: 8px 0;
}
img {
  max-width: 400px;
  max-height: fit-content;
  object-fit: contain;
  border: 1px solid #ddd;
  border-radius: 16px;
  margin: 8px 0;
}
blockquote, q {
  font-style: italic;
  border-left: 2px solid #ddd;
  padding-left: 8px;
  margin: 8px 0;
}
button:not(:has(img)), select, [role="button"] {
  background-color: rgb(216, 216, 216);
  border-radius: 8px;
  border: 1px solid rgba(51, 51, 51);
  shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  color: #333333;
  cursor: pointer;
  display: inline-block;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  list-style: none;
  margin: 8px;
  padding: 4px 12px;
  text-align: center;
  transition: all 200ms;
  vertical-align: baseline;
  white-space: nowrap;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}
button:has(img) {
  background: none;
  border: none;
  padding: 0;
}
`;
// eslint-disable-next-line no-unused-vars
function getPDFStyle(style) {
  const pdfStyle = pdfStyles[style];
  return `
    ${commonStyle}
    ${pdfStyle}
  `;
}
