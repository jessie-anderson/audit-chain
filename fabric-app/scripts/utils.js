module.exports.makeString = () => {
  const chars = '1234567890abcdefghijklmnoopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let s = ''
  for (let i = 0; i < 10; i += 1) {
    const idx = Math.floor(Math.random() * chars.length)
    s = `${s}${chars.charAt(idx)}`
  }
  return s
}

module.exports.getRandomIntBetween = (min, max) => {
  return Math.floor((Math.random() * (max - min)) + min)
}

module.exports.firstNames = [
  'Lacie',
  'Linh',
  'Nelly',
  'Venus',
  'Eleanor',
  'Von',
  'Yolanda',
  'Kara',
  'Clare',
  'Florance',
  'Terri',
  'Nikita',
  'Kalyn',
  'Leeanne',
  'Alfreda',
  'Danica',
  'Ida',
  'Josette',
  'Celia',
  'Latoya',
  'Sandi',
  'Jeraldine',
  'Clement',
  'Heidy',
  'Clinton',
  'Glendora',
  'Catina',
  'Gala',
  'Angelyn',
  'Florine',
  'Britteny',
  'Jannie',
  'Rosanne',
  'Janyce',
  'Mari',
  'Kathlyn',
  'Bess',
  'Donny',
  'Tyrell',
  'Alan',
  'Hershel',
  'Lizabeth',
  'Kristeen',
  'Annalee',
  'Jared',
  'Cortney',
  'Layla',
  'Gilbert',
  'Lilian',
  'Rosann',
]

module.exports.lastNames = [
  'Hayden',
  'Stone',
  'Villegas',
  'Mckay',
  'Galvan',
  'Todd',
  'Welch',
  'Nelson',
  'Rojas',
  'Galloway',
  'Logan',
  'Holmes',
  'Ayers',
  'Miller',
  'Sullivan',
  'Schmidt',
  'Francis',
  'Harrington',
  'Richard',
  'Dorsey',
  'Barton',
  'Friedman',
  'Hays',
  'Boyer',
  'Bowman',
  'Kaiser',
  'Estrada',
  'Turner',
  'Tyler',
  'Taylor',
  'Pearson',
  'Terrell',
  'Boone',
  'Hutchinson',
  'Tanner',
  'Bradley',
  'Marsh',
  'Larsen',
  'Everett',
  'Velez',
  'Silva',
  'Ramsey',
  'Lambert',
  'Crawford',
  'Rowland',
  'Warren',
  'Hester',
  'Daniel',
  'Mcpherson',
  'Cole',
]
