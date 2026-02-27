# Othello (オセロ)

A browser-based Othello (Reversi) game that runs on GitHub Pages.

## Features

- Play against CPU with 3 difficulty levels (Easy / Normal / Hard)
- 2-player local mode
- Choose your disc color (Black or White)
- Japanese / English language toggle
- Responsive design (mobile-friendly)
- Smooth disc placement and flip animations
- Valid move highlighting
- AI powered by Minimax with Alpha-Beta pruning

## How to Play

1. Visit the GitHub Pages URL
2. Click on highlighted cells to place your disc
3. Flip your opponent's discs by surrounding them
4. The player with the most discs when the board is full wins!

## Development

No build tools required. Just open `index.html` in a browser.

```
Othello/
├── index.html      # Main HTML
├── css/
│   └── style.css   # Styles
├── js/
│   ├── game.js     # Game logic
│   ├── ai.js       # CPU AI (Minimax + α-β pruning)
│   └── ui.js       # UI controller + i18n
└── README.md
```
