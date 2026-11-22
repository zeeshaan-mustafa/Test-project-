// ===== Kingdom of Keys — game data =====
// Finger map: which finger presses which key (standard touch-typing layout).
const FINGERS = {
  lp: { name: 'left pinky',          short: 'Pinky',   hand: 'left',  color: '#b57bff' },
  lr: { name: 'left ring finger',    short: 'Ring',    hand: 'left',  color: '#4fa8ff' },
  lm: { name: 'left middle finger',  short: 'Middle',  hand: 'left',  color: '#3ccf7a' },
  li: { name: 'left pointer finger', short: 'Pointer', hand: 'left',  color: '#ffb02e' },
  th: { name: 'thumb',               short: 'Thumb',   hand: 'both',  color: '#ff6f91' },
  ri: { name: 'right pointer finger',short: 'Pointer', hand: 'right', color: '#ffb02e' },
  rm: { name: 'right middle finger', short: 'Middle',  hand: 'right', color: '#3ccf7a' },
  rr: { name: 'right ring finger',   short: 'Ring',    hand: 'right', color: '#4fa8ff' },
  rp: { name: 'right pinky',         short: 'Pinky',   hand: 'right', color: '#b57bff' },
};

const KEY_FINGER = {
  q: 'lp', a: 'lp', z: 'lp',
  w: 'lr', s: 'lr', x: 'lr',
  e: 'lm', d: 'lm', c: 'lm',
  r: 'li', f: 'li', v: 'li', t: 'li', g: 'li', b: 'li',
  y: 'ri', h: 'ri', n: 'ri', u: 'ri', j: 'ri', m: 'ri',
  i: 'rm', k: 'rm', ',': 'rm',
  o: 'rr', l: 'rr', '.': 'rr',
  p: 'rp', ';': 'rp', '/': 'rp',
  ' ': 'th',
};

const KEY_ROWS = [
  ['q','w','e','r','t','y','u','i','o','p'],
  ['a','s','d','f','g','h','j','k','l',';'],
  ['z','x','c','v','b','n','m',',','.','/'],
];

const HOME_KEY = { lp:'a', lr:'s', lm:'d', li:'f', ri:'j', rm:'k', rr:'l', rp:';', th:' ' };

// ===== Regions of the kingdom =====
const REGIONS = [
  { id: 0, name: 'Meadow Village',    sub: 'The Home Row',          icon: '🏡',
    sky: ['#7ec8ff', '#c9ecff'], hills: '#6cc46c', ground: '#58a83f', groundDark: '#3f7f2c', deco: 'tree',
    enemies: [['slime', '#5cd65c'], ['slime', '#4fb3ff'], ['bat', '#8a6bd1']],
    boss: { name: 'King Wobble the Giant Slime', kind: 'slime', color: '#3fbf5f' } },
  { id: 1, name: 'Whispering Woods',  sub: 'G H E I R U',           icon: '🌲',
    sky: ['#4d8f6a', '#a7d9b0'], hills: '#2f6e45', ground: '#3d7a35', groundDark: '#2a5525', deco: 'pine',
    enemies: [['mushroom', '#e0533d'], ['bat', '#5a3d8a'], ['slime', '#9ad04a']],
    boss: { name: 'Bramblejaw the Thorn Beast', kind: 'beetle', color: '#6b8e23' } },
  { id: 2, name: 'Sunstone Desert',   sub: 'T Y W O Q P',           icon: '🏜️',
    sky: ['#ffb067', '#ffe7b0'], hills: '#e8b866', ground: '#e3c27a', groundDark: '#c49a4f', deco: 'cactus',
    enemies: [['beetle', '#c9672e'], ['slime', '#e0b13a'], ['ghost', '#fff1c9']],
    boss: { name: 'Sandsnap the Dune Crab', kind: 'beetle', color: '#d9822b' } },
  { id: 3, name: 'Frost Peaks',       sub: 'Bottom row: V M B N C', icon: '🏔️',
    sky: ['#9fc6e8', '#eef7ff'], hills: '#dfeefa', ground: '#f4fbff', groundDark: '#b9d4e8', deco: 'snowpine',
    enemies: [['ghost', '#bfe6ff'], ['slime', '#7fd3ff'], ['bat', '#4a6fa5']],
    boss: { name: 'Shiverstone the Ice Golem', kind: 'golem', color: '#8fd0ff' } },
  { id: 4, name: 'Ember Mountain',    sub: 'X . Z / and all letters',icon: '🌋',
    sky: ['#5a1f1f', '#ff8a4a'], hills: '#7a2e1f', ground: '#4a2a22', groundDark: '#2e1913', deco: 'rock',
    enemies: [['imp', '#ff6a2e'], ['bat', '#c0392b'], ['slime', '#ff9f43']],
    boss: { name: 'Cinderwing the Fire Drake', kind: 'drake', color: '#ff5a1f' } },
  { id: 5, name: 'Gloom Castle',      sub: 'Words, sentences & speed', icon: '🏰',
    sky: ['#1e1838', '#5b4a8f'], hills: '#2e2550', ground: '#5a5470', groundDark: '#3a3550', deco: 'pillar',
    enemies: [['ghost', '#b9a6ff'], ['imp', '#8e44ad'], ['beetle', '#6c5ce7']],
    boss: { name: 'The Gloom King', kind: 'king', color: '#4b2c8a' } },
];

// ===== Lessons =====
// kind: 'letters' (new keys drill), 'words', 'phrases', 'sentences'
// newKeys: keys introduced in this lesson (cumulative set is computed automatically)
const LESSONS = [
  { region: 0, title: 'The Two Bumps',     newKeys: 'fj', kind: 'letters', count: 14, wpm: 4,
    story: 'Feel the little bumps on F and J? That is where your pointer fingers live!' },
  { region: 0, title: 'Middle Friends',    newKeys: 'dk', kind: 'letters', count: 16, wpm: 4,
    story: 'Your middle fingers rest on D and K, right next to the bumps.' },
  { region: 0, title: 'Ring Around',       newKeys: 'sl', kind: 'letters', count: 16, wpm: 5,
    story: 'Ring fingers sit on S and L.' },
  { region: 0, title: 'Little Pinkies',    newKeys: 'a;', kind: 'letters', count: 18, wpm: 5,
    story: 'Pinkies on A and the semicolon. Now all eight fingers are home!' },
  { region: 0, title: 'Home Row Words',    newKeys: ' ', kind: 'words', count: 16, wpm: 6,
    story: 'Your thumbs press the big SPACE bar between words.' },
  { region: 0, title: 'BOSS: King Wobble', newKeys: '', kind: 'words', count: 14, wpm: 6, boss: true,
    story: 'A giant slime blocks the village gate! Type to bounce its goo back!' },

  { region: 1, title: 'Pointer Stretch',   newKeys: 'gh', kind: 'letters', count: 16, wpm: 6,
    story: 'Pointer fingers stretch to the middle: G and H.' },
  { region: 1, title: 'Climb to E and I',  newKeys: 'ei', kind: 'letters', count: 16, wpm: 6,
    story: 'Middle fingers reach UP to E and I, then come home.' },
  { region: 1, title: 'Reach for R and U', newKeys: 'ru', kind: 'letters', count: 16, wpm: 7,
    story: 'Pointer fingers reach up to R and U.' },
  { region: 1, title: 'Forest Words',      newKeys: '', kind: 'words', count: 18, wpm: 7,
    story: 'The woods are full of tricky words. Slow and steady!' },
  { region: 1, title: 'BOSS: Bramblejaw',  newKeys: '', kind: 'words', count: 16, wpm: 8, boss: true,
    story: 'A thorny beast guards the forest path!' },

  { region: 2, title: 'T and Y',           newKeys: 'ty', kind: 'letters', count: 16, wpm: 7,
    story: 'Pointer fingers reach up and in for T and Y.' },
  { region: 2, title: 'W and O',           newKeys: 'wo', kind: 'letters', count: 16, wpm: 8,
    story: 'Ring fingers reach up to W and O.' },
  { region: 2, title: 'Q and P',           newKeys: 'qp', kind: 'letters', count: 16, wpm: 8,
    story: 'Pinkies reach up to Q and P. The whole top row is yours!' },
  { region: 2, title: 'Desert Words',      newKeys: '', kind: 'words', count: 18, wpm: 9,
    story: 'Hot sand, cool words!' },
  { region: 2, title: 'BOSS: Sandsnap',    newKeys: '', kind: 'words', count: 16, wpm: 9, boss: true,
    story: 'A giant crab bursts out of the dunes!' },

  { region: 3, title: 'V and M',           newKeys: 'vm', kind: 'letters', count: 16, wpm: 9,
    story: 'Pointer fingers curl DOWN to V and M.' },
  { region: 3, title: 'B and N',           newKeys: 'bn', kind: 'letters', count: 16, wpm: 9,
    story: 'Pointer fingers reach down and in for B and N.' },
  { region: 3, title: 'C and Comma',       newKeys: 'c,', kind: 'letters', count: 16, wpm: 10,
    story: 'Middle fingers curl down to C and the comma.' },
  { region: 3, title: 'Frosty Words',      newKeys: '', kind: 'words', count: 18, wpm: 10,
    story: 'Brrr! Type fast to stay warm!' },
  { region: 3, title: 'BOSS: Shiverstone', newKeys: '', kind: 'words', count: 16, wpm: 10, boss: true,
    story: 'An ice golem stomps down the mountain!' },

  { region: 4, title: 'X and Period',      newKeys: 'x.', kind: 'letters', count: 16, wpm: 10,
    story: 'Ring fingers curl down to X and the period.' },
  { region: 4, title: 'Z and Slash',       newKeys: 'z/', kind: 'letters', count: 16, wpm: 11,
    story: 'Pinkies curl down to Z and slash. You know EVERY letter now!' },
  { region: 4, title: 'Fire Words',        newKeys: '', kind: 'words', count: 20, wpm: 11,
    story: 'All the letters together. You can do it!' },
  { region: 4, title: 'BOSS: Cinderwing',  newKeys: '', kind: 'words', count: 18, wpm: 12, boss: true,
    story: 'A fire drake swoops from the volcano!' },

  { region: 5, title: 'Castle Phrases',    newKeys: '', kind: 'phrases', count: 14, wpm: 12,
    story: 'Two and three words at a time. Use your thumb for space!' },
  { region: 5, title: 'Royal Sentences',   newKeys: '', kind: 'sentences', count: 10, wpm: 13,
    story: 'Whole sentences! Remember the period at the end.' },
  { region: 5, title: 'BOSS: The Gloom King', newKeys: '', kind: 'phrases', count: 16, wpm: 14, boss: true,
    story: 'The Gloom King stole the letters of the kingdom. Type to win them back!' },
];

// Compute the cumulative key set for each lesson.
(function () {
  let acc = '';
  LESSONS.forEach((l, i) => {
    l.id = i;
    for (const ch of l.newKeys) if (!acc.includes(ch)) acc += ch;
    l.keys = acc;
  });
})();

// ===== Word bank (kid friendly) =====
const WORDS = (`
a as ad add all ask dad fad fall falls flask lad lads sad salad alas sass
gas had has half hall glad flag flags dash shall sash lash hash ash gal
see sea fish dish side slide like hide kid kids did fig dig jig egg leg life file she he his is if
idea field shield glide hike kale safe sled fled flee feel heel seed deal heal seal head held
ride rule ruler red rug rush fur sure hug huge her here hear fire hire desk rise juice
are dear dress free fresh green grass glue sugar sign
the to it at tea tree treat tiger tight toy try yes yet you your yell day say way stay
two tow two out our hot shot word world wolf owl water wish wash show slow snow
quest quiet queen quick pot top pet pig pie pup purple happy apple paper pirate
pear pal play pay peas pool path potato puppy party
cat cap can cave coin cool cold cloud clock cake candy
vine van very vest five dive love move gave save wave river silver
man map mom moon magic music monster mud milk camp
bat bag bed big bow box bird boat bear bone brave bridge bubble
nap net nest nose nut sun fun run night night ninja
fox box six mix wax next
zoo zip zap zebra fuzz buzz lazy pizza maze prize
sword shield hero heart key castle dragon fairy arrow horse forest torch potion
king knight princess island tower treasure bomb rock ice wind light dark star
gem jump kick cape crown dungeon lantern goblin troll lake hill
`).trim().split(/\s+/).filter((w, i, a) => a.indexOf(w) === i);

const SENTENCES = [
  'the hero is brave.',
  'find the magic key.',
  'a fairy can fly.',
  'the castle is dark.',
  'get the red gem.',
  'my sword is sharp.',
  'open the big door.',
  'the dragon is asleep.',
  'jump over the lava.',
  'save the kingdom.',
  'i can type fast.',
  'the owl says hoot.',
  'a fox ran by the lake.',
  'we sail on a boat.',
  'the moon is bright.',
  'look out, a bat!',
  'grab the shield, quick.',
  'the king has a crown.',
  'zap the goblin.',
  'the map shows a cave.',
];

const TUNICS = [
  { id: 'green',  name: 'Forest Green', color: '#3fae4a', dark: '#2b7a33', cost: 0 },
  { id: 'blue',   name: 'River Blue',   color: '#3f7fe0', dark: '#2a58a0', cost: 30 },
  { id: 'red',    name: 'Fire Red',     color: '#e04a3f', dark: '#a0302a', cost: 60 },
  { id: 'purple', name: 'Royal Purple', color: '#8e5be0', dark: '#5f3aa0', cost: 100 },
  { id: 'black',  name: 'Shadow Black', color: '#3a3a48', dark: '#1e1e28', cost: 150 },
  { id: 'gold',   name: 'Golden Hero',  color: '#f2c230', dark: '#b88d12', cost: 250 },
];

const SWORDS = [
  { id: 'wood',    name: 'Wooden Sword',  blade: '#c48a4a', glow: null,      cost: 0 },
  { id: 'steel',   name: 'Steel Sword',   blade: '#dfe8f0', glow: null,      cost: 40 },
  { id: 'crystal', name: 'Crystal Blade', blade: '#8ff0ff', glow: '#8ff0ff', cost: 120 },
  { id: 'flame',   name: 'Flame Blade',   blade: '#ff9a3c', glow: '#ff5a1f', cost: 200 },
  { id: 'star',    name: 'Starlight Sword', blade: '#fff6a8', glow: '#ffe14d', cost: 350 },
];

const PRAISE = ['Great job!', 'Awesome!', 'You did it!', 'Super typing!', 'Wow!', 'Nice one!', 'Hero power!', 'Amazing!'];
