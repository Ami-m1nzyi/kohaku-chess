const shapes = {
 p: '<circle cx="22.5" cy="11" r="5"/><path d="M18 16c-4 3-3 8 1 10l-3 7h13l-3-7c4-2 5-7 1-10Z"/><path d="M15 33h15l2 5H13Z"/>',
 r: '<path d="M12 6h6v5h4V6h4v5h4V6h5v11l-5 4v11l3 6H12l3-6V21l-3-4Z"/><path d="M15 21h15M15 32h15M13 16h21" fill="none"/>',
 n: '<path d="m13 35 2-8 8-7-5 1-4 4-6-4 5-9 6-4 1-5 5 5c8 1 12 7 11 16l-3 11Z"/><path d="m19 11-4 6m13-3c4 6 1 13-4 17" fill="none"/><circle cx="21" cy="13" r="1.2" fill="currentColor" stroke="none"/><path d="M12 35h22l1 4H11Z"/>',
 b: '<path d="M22.5 5c-4 4-10 10-8 15 1 4 5 5 5 5l-3 8h13l-3-8s4-1 5-5c2-5-4-11-8.5-15Z"/><path d="m25 10-6 9" fill="none"/><circle cx="22.5" cy="4" r="2"/><path d="M15 33h15l3 5H12Z"/>',
 q: '<path d="m11 13 5 17h13l5-17-8 8-3.5-12-4 12Z"/><circle cx="10" cy="10" r="2.5"/><circle cx="22.5" cy="7" r="2.5"/><circle cx="35" cy="10" r="2.5"/><path d="M16 30h13l3 8H13Z"/><path d="M15 34h15" fill="none"/>',
 k: '<path d="M22.5 3v10m-4-6h8" fill="none" stroke-width="2.8"/><path d="M22.5 15c-7-9-16 0-9 10l4 6h11l4-6c7-10-2-19-9.5-10Z"/><path d="M22.5 15v15M17 31h11l4 7H13Z"/><path d="M15 34h15" fill="none"/>'
};
const posterShapes={
 p:'<path d="M22.5 4 31 13l-3 8H17l-3-8zM14 23h17l4 11H10zM8 35h29v5H8z"/>',
 r:'<path d="M8 5h8v6h5V5h7v6h5V5h6v13l-5 4v10H13V22l-5-4zM10 34h25v6H10z"/>',
 n:'<path d="m11 37 3-11-5-6 9-9 3-7 9 5 6 10-3 8-4 10H11zM12 37h24v4H12z"/>',
 b:'<path d="m22.5 4 9.5 11-5 7 6 11H12l6-11-5-7zM10 34h25v6H10z"/><path d="m25 9-5 8 5 2" fill="none"/>',
 q:'<path d="m8 12 7 6 2-12 5.5 9L28 6l2 12 7-6-4 17H12zM10 30h25v4H10zM9 35h27v5H9z"/>',
 k:'<path d="M19 4h7v5h5v7h-5v4l8 7 2 8H9l2-8 8-7v-4h-5V9h5zM8 35h29v5H8z"/>'
};
const origamiShapes={
 p:'<path d="m22.5 5 8 10-5 5 4 11H15l4-11-5-5zM12 32h21l3 6H9z"/><path d="m22.5 5-1 13 4 3-3 10" fill="none"/>',
 r:'<path d="M10 6h7v6h5V6h7v6h5V6h5v13l-6 4v9H14v-9l-4-4zM10 33h25l3 5H8z"/><path d="M15 23h16m-13 8h10" fill="none"/>',
 n:'<path d="m11 36 4-10-4-7 9-10 7-5 1 7 8 5 2 10-5 10zM10 36h26v4H10z"/><path d="m20 10 6 8-7 5m7-8 5 2" fill="none"/><circle cx="29" cy="14" r="1.2" fill="currentColor" stroke="none"/>',
 b:'<path d="m22.5 4 10 12-6 7 5 9H13l5-9-6-7zM10 32h25l3 6H8z"/><path d="m26 9-7 10 6 3-4 8" fill="none"/>',
 q:'<path d="m9 10 9 8 4.5-13L27 18l9-8-4 18H13zM11 29h24l2 5H9zM8 35h30v5H8z"/><path d="m18 18 4.5 3 4.5-3" fill="none"/>',
 k:'<path d="M20 4h5v5h5v5h-5v5l8 7 3 7H12l3-7 8-7v-5h-5V9h5zM8 33h29v6H8z"/><path d="M22.5 5v8m-3-4h6" fill="none"/>'
};
const waveShapes={
 p:'<path d="M22 7c6 0 8 6 5 10 5 2 7 5 4 9l-3 7H17l-3-7c-2-4 0-7 5-9-4-4-3-10 3-10Z"/><path d="M13 34c4-3 6 3 10 0s6 3 10 0M12 39c4-3 6 3 10 0s6 3 10 0" fill="none"/>',
 r:'<path d="M14 7h5v6h7V7h5v11l-4 4v10l4 4H14l4-4V22l-4-4Z"/><path d="M12 34c4-3 6 3 10 0s6 3 10 0M11 39c4-3 6 3 10 0s6 3 10 0" fill="none"/>',
 n:'<path d="m13 34 2-8 7-6-6 1-5-4 5-8 7-3 4 5c7 2 10 8 8 16l-3 7Z"/><path d="m19 12-4 6m13-3c4 6 1 12-4 16M11 36c5-3 7 3 12 0s7 3 11 0" fill="none"/><circle cx="22" cy="13" r="1.2" fill="currentColor" stroke="none"/>',
 b:'<path d="M22.5 5c-5 5-9 10-7 15 1 3 4 5 7 5s6-2 7-5c2-5-2-10-7-15ZM18 26l-4 7h17l-4-7Z"/><path d="M22.5 8 18 17m5 8v6m-10 4c4-3 6 3 10 0s6 3 10 0" fill="none"/>',
 q:'<path d="m22.5 5 3 8 9-4-5 17H15l-5-17 9 4z"/><circle cx="10" cy="9" r="2"/><circle cx="22.5" cy="5" r="2"/><circle cx="35" cy="9" r="2"/><path d="M16 28h13l3 6H13Zm-2 7c4-3 6 3 10 0s6 3 10 0" fill="none"/>',
 k:'<path d="M22.5 3v8m-4-4h8" fill="none" stroke-width="2.4"/><path d="M22.5 14c-6-7-14-1-10 7l4 8h12l4-8c4-8-4-14-10-7Z"/><path d="M22.5 15v13m-8 7c4-3 6 3 10 0s6 3 10 0" fill="none"/>'
};
const lanternShapes={
 p:'<path d="M22.5 6c-6 0-8 6-5 10l-3 5 3 10h10l3-10-3-5c3-4 1-10-5-10Z"/><path d="M18 17h9m-12 6h15M13 34h19l3 5H10Z" fill="none"/>',
 r:'<path d="M11 6h7v5h4V6h5v5h4V6h5v12l-5 4v9H15v-9l-4-4Z"/><path d="M15 21h15m-13 6h12M11 34h23l2 5H9Z" fill="none"/>',
 n:'<path d="m12 36 3-10-5-5 7-9 7-4 3 5 8 3 2 11-5 9Z"/><path d="m18 12 6 7-7 5m9-8 5 3M11 37h24m-18-9h12" fill="none"/><circle cx="29" cy="15" r="1.2" fill="currentColor" stroke="none"/>',
 b:'<path d="m22.5 4 9 11-4 7 5 10H13l5-10-4-7z"/><path d="m24 8-5 9 7 4-5 8m-7-6h17M10 33h25l3 6H8Z" fill="none"/>',
 q:'<path d="m9 11 8 7 5.5-13L28 18l8-7-4 16H13Z"/><circle cx="9" cy="10" r="2"/><circle cx="22.5" cy="5" r="2"/><circle cx="36" cy="10" r="2"/><path d="M14 29h17l3 5H11Zm-2 7h22" fill="none"/>',
 k:'<path d="M20 4h5v5h5v5h-5v5l8 7 2 7H12l2-7 9-7v-5h-5V9h5z"/><path d="M22.5 5v8m-4-4h8M15 27h15M9 34h27v5H9Z" fill="none"/>'
};
const moonShapes={
 p:'<path d="M28 5c-8 2-12 8-9 15l-4 3 3 9h10l3-9-4-4c-3-5-2-10 1-14Z"/><path d="M15 34h15l3 5H12Z"/>',
 r:'<path d="M12 6h6v5h5V6h6v5h5v11l-5 3v7H15v-7l-3-3Z"/><path d="M15 22h15M12 34h21l3 5H9Z" fill="none"/>',
 n:'<path d="m12 36 3-11 7-7-6 2-5-5 6-8 8-3 2 6c8 2 11 9 8 18l-4 8Z"/><path d="m19 11-5 8m14-4c4 6 1 12-4 16" fill="none"/><circle cx="22" cy="13" r="1.2" fill="currentColor" stroke="none"/><path d="M10 37h25"/>',
 b:'<path d="M22.5 4c-5 5-9 10-8 15 1 4 4 6 8 6s7-2 8-6c1-5-3-10-8-15Z"/><path d="M25 8c-4 4-6 8-5 12 1 2 3 3 5 3-3-3-3-9 0-15Z" fill="currentColor" stroke="none"/><path d="m18 26-4 7h17l-4-7ZM11 34h23l2 5H9Z"/>',
 q:'<path d="m11 12 7 6 4.5-12L27 18l8-6-4 15H14Z"/><circle cx="10" cy="11" r="2"/><circle cx="22.5" cy="6" r="2"/><circle cx="35" cy="11" r="2"/><path d="M15 29h15l3 6H12Z"/>',
 k:'<path d="M22.5 3v10m-4-6h8" fill="none" stroke-width="2.5"/><path d="M22.5 15c-7-9-15 0-9 9l4 7h10l4-7c6-9-2-18-9-9Z"/><path d="M22.5 15v15M13 34h19l3 5H10Z"/>'
};
const koiShapes={
 p:'<path d="M8 23c5-7 13-10 21-7l7-6-1 9 4 4-4 4 1 9-8-6c-8 3-16 0-20-7l-4 5v-10Z"/><path d="M15 19c3 2 3 7 0 9m6-10c2 2 2 7 0 9" fill="none"/><circle cx="31" cy="22" r="1.4" fill="currentColor" stroke="none"/>',
 r:'<path d="M7 22c5-7 13-10 22-7l7-7-1 10 5 5-5 5 1 10-8-7c-8 3-16 0-21-7l-5 5v-11Z"/><path d="M16 18c4 3 4 8 0 11m7-12c3 3 3 8 0 11m7-10c2 2 2 6 0 8" fill="none"/><circle cx="32" cy="23" r="1.4" fill="currentColor" stroke="none"/>',
 n:'<path d="M7 23c5-7 13-10 22-7l7-7-1 10 5 5-5 5 1 10-8-7c-8 3-16 0-21-7l-5 5v-11Z"/><path d="m14 19 5-7 2 8m2-3c3 3 3 8 0 11m-8-9c3 2 3 7 0 10" fill="none"/><circle cx="32" cy="23" r="1.4" fill="currentColor" stroke="none"/>',
 b:'<path d="M7 23c5-7 13-10 22-7l7-7-1 10 5 5-5 5 1 10-8-7c-8 3-16 0-21-7l-5 5v-11Z"/><path d="M15 19c4 2 4 8 0 10m7-11c4 3 4 8 0 11m7-9c2 2 2 6 0 8m-8-5h4" fill="none"/><circle cx="32" cy="23" r="1.4" fill="currentColor" stroke="none"/>',
 q:'<path d="M7 23c5-7 13-10 22-7l7-7-1 10 5 5-5 5 1 10-8-7c-8 3-16 0-21-7l-5 5v-11Z"/><path d="m13 14 2-5 3 5m3-1 2-7 3 7m3 0 4-5 1 7M15 19c4 3 4 8 0 10m8-11c4 3 4 8 0 11" fill="none"/><circle cx="32" cy="23" r="1.4" fill="currentColor" stroke="none"/>',
 k:'<path d="M7 23c5-7 13-10 22-7l7-7-1 10 5 5-5 5 1 10-8-7c-8 3-16 0-21-7l-5 5v-11Z"/><path d="M21 13V5m-4 4h8m-10 10c4 2 4 8 0 10m8-11c4 3 4 8 0 11m7-9c2 2 2 6 0 8" fill="none" stroke-width="1.8"/><circle cx="32" cy="23" r="1.4" fill="currentColor" stroke="none"/>'
};
// Restored smooth-flowing koi design selected by the user.
const koiSmoothShapes={
 p:'<path d="M7 23c4-8 12-12 21-9 5 2 7 6 10 9-3 3-5 7-10 9-9 3-17-1-21-9l-5 6 1-8-2-6 6 3Z"/><path d="M8 21c4-1 6 2 4 6m9-10c-2 3-2 7 2 10m5-10c3 3 3 6 0 9" fill="none"/><path d="M14 18c2-3 6-4 9-2-2 3-5 5-9 5Z" fill="#ef7657" stroke="none"/><circle cx="32" cy="21" r="1.5" fill="#172b38" stroke="none"/>',
 r:'<path d="M7 23c4-8 12-12 21-9 5 2 7 6 10 9-3 3-5 7-10 9-9 3-17-1-21-9l-5 6 1-8-2-6 6 3Z"/><path d="M10 20c4 0 5 4 2 7m9-10c-2 3-2 7 2 10m5-10c3 3 3 6 0 9" fill="none"/><path d="M14 18c2-3 6-4 9-2-2 3-5 5-9 5Zm10 3c3-3 6-3 8-1-2 3-5 4-8 4Z" fill="#ef7657" stroke="none"/><circle cx="32" cy="21" r="1.5" fill="#172b38" stroke="none"/>',
 n:'<path d="M7 23c4-8 12-12 21-9 5 2 7 6 10 9-3 3-5 7-10 9-9 3-17-1-21-9l-5 6 1-8-2-6 6 3Z"/><path d="m12 19 3-9 6 7m-7 3c3 2 3 6 0 9m9-11c-2 3-2 7 2 10m5-9c2 2 2 5 0 7" fill="none"/><path d="M14 18c2-3 6-4 9-2-2 3-5 5-9 5Z" fill="#ef7657" stroke="none"/><path d="M36 16c2-4 5-5 7-6-1 4-1 7-4 9" fill="none"/><circle cx="32" cy="21" r="1.5" fill="#172b38" stroke="none"/>',
 b:'<path d="M7 23c4-8 12-12 21-9 5 2 7 6 10 9-3 3-5 7-10 9-9 3-17-1-21-9l-5 6 1-8-2-6 6 3Z"/><path d="M10 20c4 0 5 4 2 7m9-10c-2 3-2 7 2 10m5-10c3 3 3 6 0 9m-7-8 4 3-4 3" fill="none"/><path d="M21 16c2-3 6-4 9-2-2 3-5 5-9 5Z" fill="#ef7657" stroke="none"/><path d="M36 16c2-4 5-5 7-6-1 4-1 7-4 9m-1 10c3 1 5 4 6 7-4-1-7-2-8-5" fill="none"/><circle cx="32" cy="21" r="1.5" fill="#172b38" stroke="none"/>',
 q:'<path d="M7 23c4-8 12-12 21-9 5 2 7 6 10 9-3 3-5 7-10 9-9 3-17-1-21-9l-5 6 1-8-2-6 6 3Z"/><path d="m12 15 1-7 4 5m4-1 2-7 3 7m3 0 5-5v8M10 20c4 0 5 4 2 7m9-10c-2 3-2 7 2 10" fill="none"/><path d="M14 18c2-3 6-4 9-2-2 3-5 5-9 5Zm11 2c3-3 6-3 8-1-2 3-5 4-8 4Z" fill="#ef7657" stroke="none"/><path d="M36 16c2-4 5-5 7-6-1 4-1 7-4 9m-1 10c3 1 5 4 6 7-4-1-7-2-8-5" fill="none"/><circle cx="32" cy="21" r="1.5" fill="#172b38" stroke="none"/>',
 k:'<path d="M7 23c4-8 12-12 21-9 5 2 7 6 10 9-3 3-5 7-10 9-9 3-17-1-21-9l-5 6 1-8-2-6 6 3Z"/><path d="M20 13V5m-4 4h8m-6 8c-2 3-2 7 2 10m5-9c3 3 3 6 0 9" fill="none" stroke-width="1.8"/><path d="M14 18c2-3 6-4 9-2-2 3-5 5-9 5Z" fill="#ef7657" stroke="none"/><path d="M36 16c2-4 5-5 7-6-1 4-1 7-4 9m-1 10c3 1 5 4 6 7-4-1-7-2-8-5" fill="none"/><circle cx="32" cy="21" r="1.5" fill="#172b38" stroke="none"/>'
};
export const names={p:'пешка',r:'ладья',n:'конь',b:'слон',q:'ферзь',k:'король'};
const palettes={
 kohaku:{w:'#faf5e6',b:'#233e47',sw:'#3c5556',sb:'#bccdc5'},
 ember:{w:'#ff536a',b:'#481827',sw:'#ffd0d5',sb:'#ff9aab'},
 frost:{w:'#53e4f4',b:'#142b62',sw:'#d4fcff',sb:'#99beff'},
 koi:{w:'#f4a7b8',b:'#273f6f',sw:'#ffe0e6',sb:'#b6d1ff'},
 jade:{w:'#b4e4c9',b:'#183f39',sw:'#efffee',sb:'#a2d6c5'},
 amethyst:{w:'#d6b7ff',b:'#34234f',sw:'#f5eaff',sb:'#bea1ed'}
 ,coral:{w:'#ff8f83',b:'#552738',sw:'#ffe0d9',sb:'#f2a8bd'},gold:{w:'#f5cc77',b:'#483527',sw:'#fff0bb',sb:'#d6a86f'},glacier:{w:'#a7e7f2',b:'#203b68',sw:'#e1fbff',sb:'#9abdf0'},plum:{w:'#d8b7df',b:'#442746',sw:'#f5e4fa',sb:'#c89cc7'}
};
export function pieceSVG(type,color,design=document.body.dataset.pieceDesign||'mode',palette=document.body.dataset.piecePalette||'kohaku'){const local=document.body.classList.contains('local-match');const activeDesign=design==='mode'?(local?'poster':'classic'):design;const activePalette=palette==='kohaku'&&local?{w:'#ff3152',b:'#155fe0',sw:'#ffd8df',sb:'#43e6f5'}:palettes[palette]||palettes.kohaku;const fill=color==='w'?activePalette.w:activePalette.b;const stroke=color==='w'?activePalette.sw:activePalette.sb;const shape=({classic:shapes,poster:posterShapes,origami:origamiShapes,wave:waveShapes,lantern:lanternShapes,moon:moonShapes,kohaku:koiSmoothShapes,'koi-fins':koiShapes,'koi-wave':koiSmoothShapes}[activeDesign]||shapes)[type];const koi=activeDesign==='kohaku'||activeDesign==='koi-fins'||activeDesign==='koi-wave';return `<svg class="piece ${color==='w'?'piece-white':'piece-black'}${activeDesign==='poster'?' poster-piece':''}${koi?' koi-piece':''}" aria-hidden="true" viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg" style="color:${color==='w'?activePalette.sw:activePalette.sb}"><g fill="${fill}" stroke="${stroke}" stroke-width="${activeDesign==='poster'?1.5:1.35}" stroke-linejoin="round" stroke-linecap="round">${shape}</g></svg>`;}
