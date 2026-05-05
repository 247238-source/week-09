# Arcade Nexus Project Explanation

This is a simple academic static website with three small browser games.

The main project focus is **HTML and Bootstrap 5**. JavaScript is only used because games need basic movement, collision, score, and drawing.

---

## Bootstrap 5 Status

Yes, Bootstrap 5 is implemented.

Every HTML page includes Bootstrap with this line:

```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
```

That means we can use Bootstrap classes directly in HTML instead of writing many custom CSS classes.

Example:

```html
<div class="container">
<div class="row">
<div class="col-md-4">
<div class="card">
<a class="btn btn-primary">Play Game</a>
```

This is the simple Bootstrap style used in the project now.

---

## What the Project Uses

- HTML for page structure
- Bootstrap 5 for most styling and layout
- a small `style.css` file for canvas/game overlay styling
- simple JavaScript for the games

The project does not use:

- backend
- database
- login system
- local storage
- saved scores

---

## File Structure

```text
index.html
games/
  platformer.html
  runner.html
  survivor.html
assets/
  css/
    style.css
  js/
    platformer.js
    runner.js
    survivor.js
PROJECT_EXPLANATION.md
```

There is no `storage.js` now because saved scores are not used.

---

## Simple Bootstrap Classes Used

| Class | Meaning |
|---|---|
| `container` | Centers the page content |
| `row` | Creates a Bootstrap row |
| `col-md-4` | Creates 3 equal columns on medium screens |
| `col-lg-9` | Creates a large game area column |
| `col-lg-3` | Creates a smaller side column |
| `card` | Creates a simple box |
| `card-body` | Adds spacing inside a card |
| `btn` | Makes an element look like a button |
| `btn-primary` | Makes the button blue |
| `badge` | Creates a small label |
| `bg-light` | Adds a light background |
| `text-primary` | Makes text blue |
| `text-muted` | Makes text gray |
| `border-bottom` | Adds a bottom border |
| `py-3`, `py-4` | Adds top and bottom padding |
| `mb-3`, `mb-4` | Adds bottom margin |
| `mt-3` | Adds top margin |
| `d-block` | Makes an element behave like a block |
| `d-none` | Hides an element |

These are simple and academic enough to explain in class.

---

## `index.html`

`index.html` is the home page.

It contains:

- site name
- navigation links
- introduction
- game cards
- about section
- scope section
- footer

### Bootstrap Link

```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
```

This loads Bootstrap 5.

### Custom CSS Link

```html
<link rel="stylesheet" href="assets/css/style.css">
```

This loads the small custom CSS file.

### Body

```html
<body class="bg-light">
```

`bg-light` gives the page a light background.

### Container

```html
<div class="container">
```

`container` keeps the content centered and not too wide.

### Header

```html
<header class="border-bottom py-3 mb-4">
```

This creates the top area of the page.

`border-bottom` adds a line under it.

`py-3` adds vertical padding.

`mb-4` adds space below it.

### Navigation

```html
<nav class="nav">
```

This uses Bootstrap's simple navigation style.

```html
<a class="nav-link" href="#games">Games</a>
```

This creates a navigation link.

The `#games` part jumps to the section with `id="games"`.

### Main Introduction

```html
<section class="py-4">
```

This creates a section with top and bottom padding.

```html
<p class="text-muted">Static Gaming Portal</p>
```

`text-muted` makes the text gray.

```html
<a class="btn btn-primary" href="#games">View Games</a>
```

This creates a blue Bootstrap button.

### Game Cards

```html
<div class="row">
```

This starts a Bootstrap row.

```html
<div class="col-md-4 mb-3">
```

This creates one column.

`col-md-4` means three cards fit in one row on medium screens:

```text
4 + 4 + 4 = 12
```

```html
<div class="card">
```

This creates a Bootstrap card.

```html
<div class="card-body">
```

This adds spacing inside the card.

```html
<span class="badge bg-secondary mb-2">Platformer</span>
```

This creates a small label.

```html
<a class="btn btn-primary" href="games/platformer.html">Play Game</a>
```

This opens the platformer page.

---

## Game HTML Pages

The game pages are:

```text
games/platformer.html
games/runner.html
games/survivor.html
```

They all use the same simple structure:

- Bootstrap link
- custom CSS link
- header
- game title
- canvas area
- score boxes
- side controls
- JavaScript file

### Game Page CSS Link

```html
<link rel="stylesheet" href="../assets/css/style.css">
```

The `../` means go back one folder.

This is needed because game pages are inside the `games` folder.

### Game Layout

```html
<section class="row">
```

This creates a Bootstrap row.

```html
<div class="col-lg-9 mb-3">
```

This is the large game area.

```html
<aside class="col-lg-3">
```

This is the smaller controls/status area.

Together they make 12 columns:

```text
9 + 3 = 12
```

### Canvas

```html
<canvas id="gameCanvas" class="game-canvas" width="960" height="540"></canvas>
```

This is the drawing area for the game.

JavaScript finds it using:

```text
gameCanvas
```

### Start Overlay

```html
<div class="game-overlay" id="gameOverlay">
```

This is the start screen shown over the game.

JavaScript hides it by adding Bootstrap's `d-none` class.

### Start Button

```html
<button class="btn btn-primary" id="startGameButton">Start Game</button>
```

This is the button that starts the game.

The `btn btn-primary` classes come from Bootstrap.

The `id="startGameButton"` is used by JavaScript.

### Game Message

```html
<div class="game-message" id="gameMessage">
```

This shows a small message over the game.

### HUD

HUD means "heads-up display."

It shows values like:

- score
- lives
- shards
- speed
- streak
- health
- time

Example:

```html
<strong class="d-block" id="scoreValue">0</strong>
```

JavaScript changes this number while the game runs.

### Status Text

```html
<p id="statusText">Ready to start.</p>
```

JavaScript updates this text during the game.

---

## Custom CSS

Most styling is Bootstrap.

The custom CSS is only for canvas-related things.

```css
body {
    background: #eef2f7;
}
```

This gives the page a soft background.

```css
.canvas-box {
    position: relative;
    overflow: hidden;
    background: #111827;
    border-radius: 6px;
}
```

This makes the canvas wrapper work like a game area.

`position: relative` lets the overlay and message sit on top of the canvas.

```css
.game-canvas {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 16 / 9;
    background: #111827;
}
```

This keeps the canvas responsive and widescreen.

```css
.game-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: rgba(0, 0, 0, 0.45);
}
```

This places the start screen over the canvas and centers its card.

```css
.game-panel {
    max-width: 440px;
}
```

This keeps the instruction card from becoming too wide.

```css
.game-message {
    position: absolute;
    left: 12px;
    bottom: 12px;
    padding: 8px 12px;
    color: white;
    background: rgba(0, 0, 0, 0.65);
    border-radius: 4px;
}
```

This places the small message at the bottom-left of the game.

---

# JavaScript Explanation

JavaScript is not the main part of the project.

You can say:

"I used JavaScript only because games need basic logic. The main website is HTML and Bootstrap 5. The JavaScript is only for movement, keyboard input, collision, score, and canvas drawing."

The JavaScript is intentionally basic.

It uses:

- `var`
- normal functions
- `if` and `else`
- basic `for` loops
- simple objects
- simple arrays

It avoids:

- `const`
- `let`
- arrow functions
- `map`
- `filter`
- `forEach`
- backend/storage code

---

## Important IDs Used by JavaScript

These ids must stay the same:

```text
gameCanvas
gameOverlay
startGameButton
gameMessage
statusText
scoreValue
```

Some games also use:

```text
shardsValue
livesValue
speedValue
streakValue
healthValue
timeValue
```

Bootstrap classes can be changed, but these ids should not be changed unless the JavaScript is updated too.

---

## Simple JavaScript Summary

Each game script does these steps:

1. Find the canvas and HTML score elements.
2. Set starting values like score, lives, health, or speed.
3. Wait for the Start button.
4. Read keyboard keys.
5. Move the player.
6. Check collisions.
7. Update score/status text.
8. Draw the game on the canvas.
9. Repeat the game loop every 20 milliseconds.

---

## Presentation Line

You can say this:

"The website uses simple HTML and Bootstrap 5 for layout. I used basic Bootstrap classes like `container`, `row`, `col`, `card`, and `btn`. I kept a small CSS file only for the canvas overlay. JavaScript is used only for the games because games need movement and collision. There is no backend, database, storage, or advanced JavaScript framework."
