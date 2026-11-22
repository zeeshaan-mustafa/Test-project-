# ⚔️ Kingdom of Keys

A touch-typing adventure game for young kids (built for a 7-year-old). A young hero and Pip the fairy travel through six lands to win the kingdom's letters back from the Gloom King. Along the way the player learns to type with all ten fingers, without hunt-and-peck.

All art, sound and music are original and generated in code. There are no downloads and no accounts. It runs in any modern browser.

## Play it

Open `index.html` in a browser. To serve it locally instead:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

To put it online for free, turn on **GitHub Pages** for this repo (Settings → Pages → deploy from branch, root folder).

## How it teaches typing

| Feature | Why it helps |
|---|---|
| **Home-row first** | Lessons start with F and J (the "bumps"), then add one finger pair at a time: D K → S L → A ; → space → G H → E I → R U → T Y → W O → Q P → V M → B N → C , → X . → Z / |
| **Color-coded keyboard + hands** | Each finger has its own color. The next key glows, and the matching finger lights up on the hand picture, so he looks at the screen instead of his fingers. |
| **Hints that fade** | In early lessons the next key is always shown. Later the hint only appears after a pause, which builds memory. A mistake always shows the hint. |
| **Accuracy before speed** | While learning new keys, monsters wait patiently and never cause damage. To unlock the next quest he needs 80% correct. Stars reward 90% and 95%+ accuracy. |
| **Speed that adapts** | Monster speed is set from his own measured typing speed, so the challenge grows as he gets faster. |
| **Tricky-key practice** | Missed keys are tracked, and the game shows them more often. |
| **Speed Trial** | A 60-second word dash that records his best WPM to beat. |
| **Fairy voice** | Pip reads the instructions aloud for kids who are still learning to read. |

## The quest

1. 🏡 **Meadow Village**: the home row and space bar. Boss: King Wobble the Giant Slime
2. 🌲 **Whispering Woods**: G H E I R U. Boss: Bramblejaw
3. 🏜️ **Sunstone Desert**: T Y W O Q P. Boss: Sandsnap
4. 🏔️ **Frost Peaks**: V M B N C ,. Boss: Shiverstone the Ice Golem
5. 🌋 **Ember Mountain**: X . Z / and every letter. Boss: Cinderwing the Fire Drake
6. 🏰 **Gloom Castle**: phrases and sentences. Final boss: the Gloom King

Gems earned in battle buy new tunics and swords from the Wandering Merchant.

## Parent Corner

From the map, tap **👪 Parents** to see:
- a speed chart over time
- the trickiest keys
- results for every lesson

You can also change the difficulty (Gentle / Normal / Hero) and the hint style, turn sound and voice on or off, unlock all lessons, or reset progress.

Progress is saved in the browser (localStorage) on the device he plays on.

## Tips for parents

- Sit up straight, wrists floating, and eyes on the screen.
- 10–15 minutes a day beats one long session.
- Praise accuracy, not speed. Speed comes on its own.
- A typical target for a 7-year-old is 5–15 WPM with 90%+ accuracy.

## Files

```
index.html       screens and layout
css/style.css    styles
js/data.js       lessons, regions, word bank, shop items
js/audio.js      synthesized sound effects and fairy voice
js/sprites.js    hero, monsters, bosses and scenery drawn on canvas
js/game.js       game logic, adaptive difficulty, saving, parent corner
```
