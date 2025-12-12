const IRREGULAR_VERBS: Record<string, string> = {
  was: 'be',
  were: 'be',
  been: 'be',
  am: 'be',
  is: 'be',
  are: 'be',
  had: 'have',
  has: 'have',
  did: 'do',
  does: 'do',
  done: 'do',
  went: 'go',
  gone: 'go',
  goes: 'go',
  came: 'come',
  come: 'come',
  saw: 'see',
  seen: 'see',
  took: 'take',
  taken: 'take',
  made: 'make',
  got: 'get',
  gotten: 'get',
  said: 'say',
  knew: 'know',
  known: 'know',
  thought: 'think',
  found: 'find',
  gave: 'give',
  given: 'give',
  told: 'tell',
  felt: 'feel',
  became: 'become',
  left: 'leave',
  brought: 'bring',
  began: 'begin',
  begun: 'begin',
  kept: 'keep',
  held: 'hold',
  wrote: 'write',
  written: 'write',
  stood: 'stand',
  heard: 'hear',
  let: 'let',
  meant: 'mean',
  set: 'set',
  met: 'meet',
  ran: 'run',
  paid: 'pay',
  sat: 'sit',
  spoke: 'speak',
  spoken: 'speak',
  lay: 'lie',
  led: 'lead',
  read: 'read',
  grew: 'grow',
  grown: 'grow',
  lost: 'lose',
  fell: 'fall',
  fallen: 'fall',
  sent: 'send',
  built: 'build',
  spent: 'spend',
  won: 'win',
  wore: 'wear',
  worn: 'wear',
  broke: 'break',
  broken: 'break',
  chose: 'choose',
  chosen: 'choose',
  drew: 'draw',
  drawn: 'draw',
  drove: 'drive',
  driven: 'drive',
  ate: 'eat',
  eaten: 'eat',
  flew: 'fly',
  flown: 'fly',
  forgot: 'forget',
  forgotten: 'forget',
  froze: 'freeze',
  frozen: 'freeze',
  hid: 'hide',
  hidden: 'hide',
  rode: 'ride',
  ridden: 'ride',
  rose: 'rise',
  risen: 'rise',
  sang: 'sing',
  sung: 'sing',
  sank: 'sink',
  sunk: 'sink',
  slept: 'sleep',
  stole: 'steal',
  stolen: 'steal',
  swam: 'swim',
  swum: 'swim',
  threw: 'throw',
  thrown: 'throw',
  woke: 'wake',
  woken: 'wake',
}

const IRREGULAR_NOUNS: Record<string, string> = {
  children: 'child',
  men: 'man',
  women: 'woman',
  feet: 'foot',
  teeth: 'tooth',
  geese: 'goose',
  mice: 'mouse',
  people: 'person',
  leaves: 'leaf',
  lives: 'life',
  knives: 'knife',
  wives: 'wife',
  selves: 'self',
  halves: 'half',
  wolves: 'wolf',
  thieves: 'thief',
  shelves: 'shelf',
  loaves: 'loaf',
  potatoes: 'potato',
  tomatoes: 'tomato',
  heroes: 'hero',
  echoes: 'echo',
  vetoes: 'veto',
  criteria: 'criterion',
  phenomena: 'phenomenon',
  analyses: 'analysis',
  theses: 'thesis',
  hypotheses: 'hypothesis',
  crises: 'crisis',
  bases: 'basis',
  axes: 'axis',
  indices: 'index',
  appendices: 'appendix',
}

export function getLemma(word: string): string {
  const lower = word.toLowerCase()

  if (IRREGULAR_VERBS[lower]) {
    return IRREGULAR_VERBS[lower]
  }

  if (IRREGULAR_NOUNS[lower]) {
    return IRREGULAR_NOUNS[lower]
  }

  if (lower.endsWith('ies') && lower.length > 4) {
    return lower.slice(0, -3) + 'y'
  }

  if (lower.endsWith('ves') && lower.length > 4) {
    const base = lower.slice(0, -3)
    if (['lea', 'li', 'kni', 'wi', 'sel', 'hal', 'wol', 'thie', 'shel', 'loa'].includes(base)) {
      return base + 'f'
    }
    return base + 'fe'
  }

  if (lower.endsWith('es') && lower.length > 3) {
    const base = lower.slice(0, -2)
    if (base.endsWith('ss') || base.endsWith('sh') || base.endsWith('ch') || base.endsWith('x') || base.endsWith('z')) {
      return base
    }
    if (base.endsWith('i')) {
      return base.slice(0, -1) + 'y'
    }
    return lower.slice(0, -1)
  }

  if (lower.endsWith('s') && lower.length > 2 && !lower.endsWith('ss')) {
    return lower.slice(0, -1)
  }

  if (lower.endsWith('ing') && lower.length > 4) {
    const base = lower.slice(0, -3)
    if (base.endsWith('e')) {
      return base
    }
    const doubleConsonant = /([^aeiou])\1$/.test(base)
    if (doubleConsonant && base.length > 2) {
      return base.slice(0, -1)
    }
    return base + 'e'
  }

  if (lower.endsWith('ed') && lower.length > 3) {
    const base = lower.slice(0, -2)
    if (base.endsWith('i')) {
      return base.slice(0, -1) + 'y'
    }
    const doubleConsonant = /([^aeiou])\1$/.test(base)
    if (doubleConsonant && base.length > 2) {
      return base.slice(0, -1)
    }
    if (!base.endsWith('e')) {
      return base + 'e'
    }
    return base
  }

  if (lower.endsWith('er') && lower.length > 3) {
    const base = lower.slice(0, -2)
    if (/[aeiou]/.test(base.slice(-1))) {
      return base
    }
  }

  if (lower.endsWith('est') && lower.length > 4) {
    const base = lower.slice(0, -3)
    if (/[aeiou]/.test(base.slice(-1))) {
      return base
    }
  }

  if (lower.endsWith('ly') && lower.length > 3) {
    return lower.slice(0, -2)
  }

  return lower
}

export function isInflectedForm(word: string, lemma: string): boolean {
  return getLemma(word) === lemma.toLowerCase()
}
