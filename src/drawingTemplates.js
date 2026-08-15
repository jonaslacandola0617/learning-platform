export const TEMPLATES = [
  {
    id: "cat", category: "animals", label: "Cat",
    elements: [
      ["path", { d: "M250 194 L218 114 L300 152 Q400 110 500 152 L582 114 L550 194 Q598 244 578 330 Q550 432 400 438 Q250 432 222 330 Q202 244 250 194 Z" }],
      ["ellipse", { cx: 400, cy: 292, rx: 108, ry: 86 }],
      ["circle", { cx: 348, cy: 262, r: 10, fill: "#26344a" }], ["circle", { cx: 452, cy: 262, r: 10, fill: "#26344a" }],
      ["path", { d: "M388 289 Q400 300 412 289 M400 300 Q380 320 360 304 M400 300 Q420 320 440 304 M318 290 L238 278 M318 310 L232 318 M482 290 L562 278 M482 310 L568 318" }],
    ],
  },
  {
    id: "fish", category: "animals", label: "Fish",
    elements: [
      ["path", { d: "M174 282 Q265 175 448 186 Q556 190 638 282 Q556 374 448 378 Q265 389 174 282 Z" }],
      ["path", { d: "M174 282 L92 198 L92 366 Z" }],
      ["path", { d: "M316 214 Q346 188 372 214 M316 350 Q346 376 372 350 M470 210 Q520 246 470 282 Q520 318 470 354" }],
      ["circle", { cx: 544, cy: 254, r: 11, fill: "#26344a" }],
      ["path", { d: "M578 292 Q596 306 614 292" }],
    ],
  },
  {
    id: "butterfly", category: "animals", label: "Butterfly",
    elements: [
      ["ellipse", { cx: 400, cy: 286, rx: 30, ry: 140 }],
      ["path", { d: "M372 214 Q282 114 190 136 Q122 152 144 236 Q162 296 350 292 M428 214 Q518 114 610 136 Q678 152 656 236 Q638 296 450 292 M370 322 Q270 290 198 356 Q148 404 222 448 Q304 480 380 366 M430 322 Q530 290 602 356 Q652 404 578 448 Q496 480 420 366" }],
      ["path", { d: "M388 146 Q360 90 326 104 M412 146 Q440 90 474 104" }],
      ["circle", { cx: 270, cy: 208, r: 28 }], ["circle", { cx: 530, cy: 208, r: 28 }],
      ["circle", { cx: 260, cy: 384, r: 22 }], ["circle", { cx: 540, cy: 384, r: 22 }],
    ],
  },
  {
    id: "dog", category: "animals", label: "Dog",
    elements: [
      ["path", { d: "M286 170 Q250 98 190 122 Q146 142 176 230 Q196 280 244 302 M514 170 Q550 98 610 122 Q654 142 624 230 Q604 280 556 302" }],
      ["ellipse", { cx: 400, cy: 292, rx: 138, ry: 132 }],
      ["ellipse", { cx: 400, cy: 318, rx: 86, ry: 66 }],
      ["circle", { cx: 346, cy: 256, r: 10, fill: "#26344a" }], ["circle", { cx: 454, cy: 256, r: 10, fill: "#26344a" }],
      ["ellipse", { cx: 400, cy: 302, rx: 20, ry: 16, fill: "#26344a" }],
      ["path", { d: "M400 317 V338 Q374 362 346 340 M400 338 Q426 362 454 340 M300 374 Q350 404 385 392 M500 374 Q450 404 415 392" }],
    ],
  },
  {
    id: "rabbit", category: "animals", label: "Rabbit",
    elements: [
      ["ellipse", { cx: 332, cy: 138, rx: 46, ry: 112 }], ["ellipse", { cx: 468, cy: 138, rx: 46, ry: 112 }],
      ["ellipse", { cx: 400, cy: 304, rx: 148, ry: 132 }], ["ellipse", { cx: 400, cy: 324, rx: 102, ry: 88 }],
      ["circle", { cx: 348, cy: 276, r: 10, fill: "#26344a" }], ["circle", { cx: 452, cy: 276, r: 10, fill: "#26344a" }],
      ["path", { d: "M387 304 Q400 318 413 304 M400 318 V346 M400 346 Q376 366 352 348 M400 346 Q424 366 448 348 M314 314 L236 304 M314 336 L228 344 M486 314 L564 304 M486 336 L572 344" }],
      ["circle", { cx: 400, cy: 319, r: 9 }],
    ],
  },
  {
    id: "turtle", category: "animals", label: "Turtle",
    elements: [
      ["ellipse", { cx: 378, cy: 282, rx: 180, ry: 124 }],
      ["circle", { cx: 604, cy: 282, r: 52 }],
      ["path", { d: "M222 220 Q158 174 124 216 Q150 262 220 268 M222 344 Q160 390 126 348 Q152 304 220 296 M510 194 Q550 148 590 166 Q578 220 526 242 M510 370 Q550 416 590 398 Q578 344 526 322 M214 282 Q166 252 132 282 Q166 312 214 282" }],
      ["path", { d: "M276 208 L356 282 L278 356 M356 282 L432 208 M356 282 L438 356 M432 208 L510 282 L438 356 M356 282 H510" }],
      ["circle", { cx: 620, cy: 266, r: 9, fill: "#26344a" }],
      ["path", { d: "M622 302 Q640 316 654 302" }],
    ],
  },
  {
    id: "elephant", category: "animals", label: "Elephant",
    elements: [
      ["circle", { cx: 278, cy: 262, r: 76 }], ["circle", { cx: 522, cy: 262, r: 76 }],
      ["ellipse", { cx: 400, cy: 282, rx: 132, ry: 138 }],
      ["path", { d: "M378 330 Q372 446 408 454 Q446 448 436 382 Q430 338 424 304" }],
      ["circle", { cx: 350, cy: 256, r: 10, fill: "#26344a" }], ["circle", { cx: 450, cy: 256, r: 10, fill: "#26344a" }],
      ["path", { d: "M328 304 Q346 324 364 304 M436 304 Q454 324 472 304" }],
    ],
  },
  {
    id: "owl", category: "animals", label: "Owl",
    elements: [
      ["path", { d: "M270 180 L292 102 L348 142 Q400 126 452 142 L508 102 L530 180 Q580 236 564 332 Q542 438 400 450 Q258 438 236 332 Q220 236 270 180 Z" }],
      ["circle", { cx: 344, cy: 252, r: 58 }], ["circle", { cx: 456, cy: 252, r: 58 }],
      ["circle", { cx: 344, cy: 252, r: 18, fill: "#26344a" }], ["circle", { cx: 456, cy: 252, r: 18, fill: "#26344a" }],
      ["path", { d: "M400 274 L374 306 H426 Z M300 360 Q400 392 500 360 M340 430 L316 468 M460 430 L484 468" }],
    ],
  },
  {
    id: "penguin", category: "animals", label: "Penguin",
    elements: [
      ["ellipse", { cx: 400, cy: 286, rx: 122, ry: 172 }],
      ["ellipse", { cx: 400, cy: 320, rx: 84, ry: 118 }],
      ["path", { d: "M294 246 Q232 290 254 370 Q288 338 324 314 M506 246 Q568 290 546 370 Q512 338 476 314" }],
      ["circle", { cx: 360, cy: 228, r: 9, fill: "#26344a" }], ["circle", { cx: 440, cy: 228, r: 9, fill: "#26344a" }],
      ["path", { d: "M400 248 L374 276 H426 Z M350 450 L314 476 M450 450 L486 476" }],
    ],
  },
  {
    id: "lion", category: "animals", label: "Lion",
    elements: [
      ["path", { d: "M400 88 Q438 110 474 98 Q500 126 538 132 Q540 170 572 194 Q556 228 572 262 Q544 288 546 328 Q508 338 488 372 Q452 362 422 388 Q386 366 352 382 Q322 352 286 350 Q284 312 254 286 Q272 252 256 218 Q286 190 286 154 Q324 146 346 114 Q374 126 400 88 Z" }],
      ["circle", { cx: 400, cy: 252, r: 124 }],
      ["ellipse", { cx: 400, cy: 286, rx: 74, ry: 58 }],
      ["circle", { cx: 352, cy: 236, r: 10, fill: "#26344a" }], ["circle", { cx: 448, cy: 236, r: 10, fill: "#26344a" }],
      ["ellipse", { cx: 400, cy: 276, rx: 18, ry: 14, fill: "#26344a" }],
      ["path", { d: "M400 290 Q374 320 346 300 M400 290 Q426 320 454 300" }],
    ],
  },
  {
    id: "house", category: "objects", label: "House",
    elements: [
      ["path", { d: "M190 246 L400 92 L610 246 M236 226 V438 H564 V226 M332 438 V318 H468 V438" }],
      ["rect", { x: 264, y: 266, width: 86, height: 74, rx: 6 }], ["path", { d: "M307 266 V340 M264 303 H350" }],
      ["rect", { x: 450, y: 266, width: 86, height: 74, rx: 6 }], ["path", { d: "M493 266 V340 M450 303 H536" }],
      ["circle", { cx: 440, cy: 378, r: 7, fill: "#26344a" }],
    ],
  },
  {
    id: "rocket", category: "objects", label: "Rocket",
    elements: [
      ["path", { d: "M400 64 Q492 138 470 316 L400 392 L330 316 Q308 138 400 64 Z" }],
      ["circle", { cx: 400, cy: 212, r: 46 }],
      ["path", { d: "M334 274 Q262 310 250 394 L340 356 M466 274 Q538 310 550 394 L460 356 M370 392 Q354 434 400 476 Q446 434 430 392" }],
    ],
  },
  {
    id: "kite", category: "objects", label: "Kite",
    elements: [
      ["path", { d: "M400 74 L584 234 L400 390 L216 234 Z M400 74 V390 M216 234 H584" }],
      ["path", { d: "M400 390 Q340 420 388 454 Q434 484 376 506" }],
      ["path", { d: "M370 424 L338 402 L344 444 Z M406 466 L442 442 L436 484 Z" }],
    ],
  },
  {
    id: "car", category: "objects", label: "Car",
    elements: [
      ["path", { d: "M176 330 L218 248 Q236 210 274 210 H476 Q516 210 548 244 L604 308 Q636 314 648 342 V388 H152 V344 Q152 332 176 330 Z" }],
      ["path", { d: "M250 248 L304 164 H456 L520 248 M304 164 V248 M456 164 V248" }],
      ["circle", { cx: 250, cy: 388, r: 46 }], ["circle", { cx: 550, cy: 388, r: 46 }],
      ["circle", { cx: 250, cy: 388, r: 16 }], ["circle", { cx: 550, cy: 388, r: 16 }],
      ["path", { d: "M184 330 H616" }],
    ],
  },
  {
    id: "boat", category: "objects", label: "Boat",
    elements: [
      ["path", { d: "M236 328 H564 L516 392 H284 Z" }],
      ["path", { d: "M400 120 V328 M400 120 L486 220 H400 M400 120 L312 220 H400" }],
      ["path", { d: "M324 220 V328 M476 220 V328" }],
      ["circle", { cx: 372, cy: 360, r: 8, fill: "#26344a" }], ["circle", { cx: 428, cy: 360, r: 8, fill: "#26344a" }],
      ["path", { d: "M150 408 Q190 390 230 408 T310 408 T390 408 T470 408 T550 408 T630 408" }],
    ],
  },
  {
    id: "airplane", category: "objects", label: "Airplane",
    elements: [
      ["path", { d: "M166 282 Q154 250 192 246 L454 230 L536 114 Q548 96 570 100 L586 102 Q602 104 596 126 L562 238 L646 252 Q666 256 666 280 Q666 304 646 308 L562 322 L596 434 Q602 456 586 458 L570 460 Q548 464 536 446 L454 330 L192 314 Q154 310 166 282 Z" }],
      ["circle", { cx: 524, cy: 280, r: 10, fill: "#26344a" }],
      ["path", { d: "M352 236 L352 324 M302 340 L258 392 M302 220 L258 168" }],
    ],
  },
  {
    id: "balloon", category: "objects", label: "Balloon",
    elements: [
      ["ellipse", { cx: 400, cy: 228, rx: 86, ry: 118 }],
      ["path", { d: "M350 146 Q330 190 336 246" }],
      ["path", { d: "M390 344 L410 344 L402 362 H398 Z M400 362 Q368 392 402 424 Q432 452 394 486" }],
    ],
  },
  {
    id: "backpack", category: "objects", label: "Backpack",
    elements: [
      ["path", { d: "M306 206 Q306 138 400 138 Q494 138 494 206 V430 H306 Z" }],
      ["path", { d: "M338 206 Q338 168 400 168 Q462 168 462 206" }],
      ["path", { d: "M306 238 Q266 262 266 326 V404 M494 238 Q534 262 534 326 V404" }],
      ["rect", { x: 340, y: 284, width: 120, height: 88, rx: 14 }],
      ["path", { d: "M400 284 V372 M340 328 H460" }],
    ],
  },
  {
    id: "bicycle", category: "objects", label: "Bicycle",
    elements: [
      ["circle", { cx: 250, cy: 366, r: 70 }], ["circle", { cx: 552, cy: 366, r: 70 }],
      ["path", { d: "M250 366 L346 366 L414 274 L468 366 L552 366 M346 366 L314 298 H388 M388 298 H442 M504 286 H560 M504 286 L468 366" }],
      ["path", { d: "M306 298 L280 258 M410 274 L432 236" }],
    ],
  },
  {
    id: "icecream", category: "objects", label: "Ice Cream",
    elements: [
      ["path", { d: "M400 446 L330 320 Q310 290 342 266 Q346 210 400 210 Q430 172 476 198 Q534 198 540 264 Q574 290 552 320 Z" }],
      ["path", { d: "M358 320 L400 446 L442 320" }],
      ["path", { d: "M330 320 H470" }],
      ["circle", { cx: 374, cy: 260, r: 8, fill: "#26344a" }], ["circle", { cx: 426, cy: 260, r: 8, fill: "#26344a" }],
      ["path", { d: "M386 286 Q400 298 414 286" }],
    ],
  },
];
