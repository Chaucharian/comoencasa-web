export const band = {
  name: "CISNE ELOCUENTE",
  tagline: "Jazz rock porteño desde Almagro.",
  location: "Buenos Aires",
  email: "cisneelocuente@gmail.com",
  storeUrl: "https://cisneelocuente.bandcamp.com",
  spotifyUrl: "https://open.spotify.com/artist/5n0hPi3RdVSRC5DZNKkaAi",
  linktreeUrl: "https://linktr.ee/cisne.elocuente",
  socials: [
    { label: "Linktree", href: "https://linktr.ee/cisne.elocuente" },
    { label: "Bandcamp", href: "https://cisneelocuente.bandcamp.com" },
    { label: "Spotify", href: "https://open.spotify.com/artist/5n0hPi3RdVSRC5DZNKkaAi" },
    { label: "YouTube", href: "https://youtube.com/channel/UCp6K7csCa6yAbqoqHgELqhQ" },
  ],
} as const;

export const nav = [
  { href: "/about", label: "La banda" },
  { href: "/discography", label: "Discos" },
  { href: "/store", label: "Tienda" },
  { href: "/tour", label: "Giras" },
  { href: "/prensa", label: "Prensa" },
] as const;

export const members = [
  { name: "Julio César Lucero", role: "Guitarra y voz" },
  { name: "Lucas Manzo", role: "Bajo" },
  { name: "Federico Volpi", role: "Batería" },
  { name: "Lucas Llull", role: "Teclado" },
] as const;

export const photos = {
  hero: "/images/band-campo.jpg",
  band: "/images/band-perfiles.jpg",
  circle: "/images/band-circulo.jpg",
  bandMirror: "/images/band-espejo.jpg",
  circleLaugh: "/images/band-circulo-risa.jpg",
  park: "/images/band-parque.jpg",
} as const;

export const gallery = [
  { src: "/images/band-campo.jpg", alt: "Cisne Elocuente entre los pastos" },
  { src: "/images/band-perfiles.jpg", alt: "Los cuatro, de perfil" },
  { src: "/images/band-espejo.jpg", alt: "Band espejo" },
  { src: "/images/band-circulo.jpg", alt: "La formación, vista desde arriba" },
  { src: "/images/band-circulo-risa.jpg", alt: "La banda, riendo" },
  { src: "/images/band-parque.jpg", alt: "En el pasto, con el perro" },
  { src: "/images/vivo-lucero-lentes.jpg", alt: "En el escenario, lentes negros" },
  { src: "/images/vivo-lucero-escenario.jpg", alt: "Cigarrillo y micrófono" },
  { src: "/images/vivo-lucero-humo.jpg", alt: "Humo azul en el escenario" },
  { src: "/images/vivo-lucero-perfil.jpg", alt: "Perfil bajo la luz" },
  { src: "/images/vivo-manzo-bajo.jpg", alt: "Lucas Manzo en el bajo" },
  { src: "/images/vivo-manzo-sonrisa.jpg", alt: "Manzo, después del tema" },
  { src: "/images/vivo-manzo-lentes.jpg", alt: "Bajo y lentes" },
  { src: "/images/vivo-publico.jpg", alt: "El público, adentro" },
] as const;

export const stats = [
  { value: "2,5 M", label: "Plano verde paisaje" },
  { value: "80 mil", label: "Oyentes en Spotify" },
  { value: "500", label: "Santiago de Chile, 2025" },
  { value: "2014", label: "Almagro, Buenos Aires" },
] as const;

export type Album = {
  slug: string;
  chapter: string;
  title: string;
  year: string;
  duration: string;
  songs: number;
  recorded: string;
  label: string;
  color: string;
  image: string;
  statement: string;
  story: string;
  href: string;
  tracks: { n: string; title: string; time: string }[];
};

export function albumSpecs(album: Album) {
  return [
    { label: "Año", value: album.year },
    { label: "Duración", value: album.duration },
    { label: "Temas", value: String(album.songs) },
    { label: "Sello", value: album.label },
    { label: "Grabado", value: album.recorded },
  ] as const;
}

export const albums: Album[] = [
  {
    slug: "letargico",
    chapter: "I",
    title: "Letárgico",
    year: "2015",
    duration: "57:00",
    songs: 14,
    recorded: "Almagro, Quilmes, Chapadmalal",
    label: "Kenobi",
    color: "#050505",
    image: "/images/discs/letargico.jpg",
    statement: "El sueño hipnagógico. Una ventana de Almagro.",
    story:
      "Primer disco de Julio César Lucero. Letras, melodías y armonías suyas; Andrés Vidal en bajos y Fernando Bernstein en baterías grabadas entre Chapadmalal y Quilmes. El resto nació en Almagro. Ahí está Plano verde paisaje — más de dos millones y medio de escuchas — y Mi ventana de Almagro, con bandoneón de Fernando Samalea. Dedicado a quienes duermen en ese estado de sueño eterno.",
    href: "https://cisneelocuente.bandcamp.com/album/let-rgico-2",
    tracks: [
      { n: "01", title: "Letargo — Ana y la Capital", time: "9:36" },
      { n: "02", title: "Plano verde paisaje", time: "2:06" },
      { n: "03", title: "Flor del mar", time: "3:24" },
      { n: "04", title: "Manantial", time: "4:38" },
      { n: "05", title: "Hardware", time: "2:48" },
      { n: "06", title: "Frutal", time: "3:20" },
      { n: "07", title: "Simón", time: "3:31" },
      { n: "08", title: "Mi ventana de Almagro", time: "5:03" },
      { n: "09", title: "Umbral", time: "5:41" },
      { n: "10", title: "Retorno epistemológico", time: "2:00" },
      { n: "11", title: "Enjundia", time: "2:24" },
      { n: "12", title: "Paralelas", time: "1:49" },
      { n: "13", title: "Vuélvete a mí", time: "4:28" },
      { n: "14", title: "Habla disléxica", time: "6:46" },
    ],
  },
  {
    slug: "leda",
    chapter: "II",
    title: "Leda",
    year: "2017",
    duration: "76:11",
    songs: 11,
    recorded: "Casa Cisne, Boedo",
    label: "Casa Cisne",
    color: "#111111",
    image: "/images/discs/Leda.jpg",
    statement: "Jazz rock porteño de los ochenta, mirado de frente.",
    story:
      "Grabado en Casa Cisne, Boedo, entre 2016 y 2017. Lucero, Vidal y Bernstein. Mezcla y master en Estudio del Nuevo Mundo, por invitación de Litto Nebbia. Temas largos, ninfas, gemas, Parque Chas, la tierra de nardos. Una nave que fluye por el cosmos y sigue sonando a Buenos Aires.",
    href: "https://cisneelocuente.bandcamp.com/album/leda",
    tracks: [
      { n: "01", title: "Cid", time: "10:00" },
      { n: "02", title: "Ninfas", time: "0:44" },
      { n: "03", title: "Gema", time: "8:45" },
      { n: "04", title: "Cae hasta mí", time: "6:13" },
      { n: "05", title: "Sola", time: "4:41" },
      { n: "06", title: "Iluminado", time: "4:28" },
      { n: "07", title: "49 días", time: "5:31" },
      { n: "08", title: "Cantos de Rapsodas", time: "1:11" },
      { n: "09", title: "Tierra de nardos", time: "12:40" },
      { n: "10", title: "Equidae", time: "4:58" },
      { n: "11", title: "Las enseñanzas", time: "17:00" },
    ],
  },
  {
    slug: "limpida",
    chapter: "III",
    title: "Límpida",
    year: "2022",
    duration: "44:18",
    songs: 8,
    recorded: "Buenos Aires",
    label: "Ala Púrpura",
    color: "#0a0a0a",
    image: "/images/discs/limpida.png",
    statement: "El regreso. La obra que esperó media década.",
    story:
      "La banda se disolvió en 2019. En 2022 Lucero retomó el proyecto con otros músicos y estrenó Límpida: un disco pendiente de la formación anterior, producido por él, que se presentó en vivo en Mar del Plata y Chapadmalal. Ocho piezas. El agua se aclara, pero no olvida el barro.",
    href: "https://open.spotify.com/artist/5n0hPi3RdVSRC5DZNKkaAi",
    tracks: [{ n: "08", title: "Medalla Milagrosa", time: "5:29" }],
  },
  {
    slug: "luz-cegadora",
    chapter: "IV",
    title: "Luz cegadora",
    year: "2026",
    duration: "28:39",
    songs: 8,
    recorded: "Buenos Aires",
    label: "Ala Púrpura",
    color: "#d1121a",
    image: "/images/discs/luz-cegadora.jpg",
    statement: "Ocho canciones. Madurez sonora. La puerta de una etapa nueva.",
    story:
      "Dos años de trabajo. La formación estable desde 2024 — Lucero, Manzo, Volpi, Llull — cierra un ciclo y abre otro. Ganapán es el primer videoclip: un cortometraje urbano en un pasaje de Congreso. Eufórica, existencialista, con tintes de rock y tango. Identidad de rock nacional, distinta a las obras anteriores, misma alma porteña.",
    href: "https://open.spotify.com/artist/5n0hPi3RdVSRC5DZNKkaAi",
    tracks: [
      { n: "01", title: "Luz Cegadora", time: "3:02" },
      { n: "02", title: "Ganapán", time: "2:03" },
      { n: "03", title: "Abismo de amor", time: "3:29" },
      { n: "04", title: "Joven", time: "4:21" },
      { n: "05", title: "Justo en la mitad", time: "3:52" },
      { n: "06", title: "Otra luz", time: "2:37" },
      { n: "07", title: "Vicosurf", time: "3:39" },
      { n: "08", title: "Pilar", time: "5:36" },
    ],
  },
];

export type Product = {
  slug: string;
  title: string;
  category: "vinyl" | "wear" | "archive";
  price: string;
  edition: string;
  image: string;
  blurb: string;
  href: string;
};

export const products: Product[] = [
  {
    slug: "letargico-digital",
    title: "Letárgico — digital / Bandcamp",
    category: "vinyl",
    price: "desde $7",
    edition: "2015 · Kenobi",
    image: "/images/discs/letargico.jpg",
    blurb: "El debut. Incluye Plano verde paisaje y Mi ventana de Almagro.",
    href: "https://cisneelocuente.bandcamp.com/album/let-rgico-2",
  },
  {
    slug: "leda-digital",
    title: "Leda — digital / Bandcamp",
    category: "vinyl",
    price: "desde $7",
    edition: "2017 · Casa Cisne",
    image: "/images/discs/Leda.jpg",
    blurb: "Mezclado en Estudio del Nuevo Mundo. La nave larga.",
    href: "https://cisneelocuente.bandcamp.com/album/leda",
  },
  {
    slug: "limpida-stream",
    title: "Límpida — streaming",
    category: "vinyl",
    price: "escuchar",
    edition: "2022 · Ala Púrpura",
    image: "/images/discs/limpida.png",
    blurb: "El disco del regreso. Ocho piezas, 44 minutos.",
    href: "https://open.spotify.com/artist/5n0hPi3RdVSRC5DZNKkaAi",
  },
  {
    slug: "luz-cegadora-stream",
    title: "Luz cegadora — 2026",
    category: "vinyl",
    price: "escuchar",
    edition: "24 abr 2026 · Ala Púrpura",
    image: "/images/discs/luz-cegadora.jpg",
    blurb: "El cuarto álbum. Arranca con Ganapán.",
    href: "https://open.spotify.com/artist/5n0hPi3RdVSRC5DZNKkaAi",
  },
  {
    slug: "ganapan-tee",
    title: "Remera Ganapán",
    category: "wear",
    price: "$48",
    edition: "Hueso / tinta · unisex",
    image: "/images/band-campo.jpg",
    blurb: "El pasaje de Congreso sobre algodón pesado. Nada en el pecho.",
    href: "https://cisneelocuente.bandcamp.com",
  },
  {
    slug: "almagro-hoodie",
    title: "Buzo Ventana de Almagro",
    category: "wear",
    price: "$96",
    edition: "Tinta · oversized",
    image: "/images/band-parque.jpg",
    blurb: "Teñido a prenda. El barrio adentro de la capucha.",
    href: "https://cisneelocuente.bandcamp.com",
  },
  {
    slug: "folio-letras",
    title: "Folio de letras",
    category: "archive",
    price: "$28",
    edition: "64 páginas · cosido",
    image: "/images/band-circulo.jpg",
    blurb: "Letras de Lucero: del letargo a la luz cegadora.",
    href: "https://cisneelocuente.bandcamp.com",
  },
  {
    slug: "tour-poster",
    title: "Afiche gira 2026",
    category: "archive",
    price: "$24",
    edition: "A2 · letterpress",
    image: "/images/vivo-lucero-escenario.jpg",
    blurb: "Cobre sobre negro. Las ciudades del mapa rioplatense.",
    href: "https://cisneelocuente.bandcamp.com",
  },
];

export type Show = {
  date: string;
  city: string;
  country: string;
  venue: string;
  status: "on sale" | "sold out" | "soon";
  href: string;
};

export const streaming = [
  { label: "Spotify", href: "https://open.spotify.com/artist/5n0hPi3RdVSRC5DZNKkaAi" },
  { label: "Apple Music", href: "https://music.apple.com/us/artist/cisne-elocuente/1129299574" },
  { label: "Bandcamp", href: "https://cisneelocuente.bandcamp.com" },
  { label: "YouTube", href: "https://youtube.com" },
] as const;

export const showStatusLabel = {
  "on sale": "a la venta",
  "sold out": "agotado",
  soon: "pronto",
} as const;

export function getAlbum(slug: string) {
  return albums.find((album) => album.slug === slug);
}

export const pressBio =
  "Cisne Elocuente es el proyecto de Julio César Lucero. Jazz rock porteño nacido en Almagro en 2014. Cuatro discos — Letárgico, Leda, Límpida y Luz cegadora — y una banda que recorre Argentina, Uruguay, Brasil y Chile. Formación estable desde 2024: Lucero, Lucas Manzo, Federico Volpi y Lucas Llull.";

export const pressAssets = [
  { label: "Logo", href: "/brand/cisne-elocuente.png" },
  { label: "Banda — campo", href: "/images/band-campo.jpg" },
  { label: "Banda — perfiles", href: "/images/band-perfiles.jpg" },
  { label: "Banda — círculo", href: "/images/band-circulo.jpg" },
  { label: "En vivo", href: "/images/vivo-lucero-escenario.jpg" },
] as const;

export const riderInputs = [
  { n: "01", name: "Voz 1", spec: "XLR · cañón · con soporte" },
  { n: "02", name: "Voz 2", spec: "XLR · cañón · con soporte" },
  { n: "03–04", name: "Teclado", spec: "2 plug · estéreo" },
  { n: "05", name: "Bajo", spec: "XLR · línea directa" },
  { n: "06–07", name: "Guitarra", spec: "2 SM57" },
  { n: "08–09", name: "Pistas / PC", spec: "2 plug · estéreo" },
] as const;

export const riderDrums = [
  { n: "10", name: "Kick" },
  { n: "11–12", name: "Snare", spec: "Arriba / abajo" },
  { n: "13", name: "Hi-hat" },
  { n: "14", name: "Tom 1" },
  { n: "15", name: "Tom 2" },
  { n: "16", name: "Tom 3" },
  { n: "17", name: "Overhead crash" },
  { n: "18", name: "Overhead ride" },
] as const;

export const riderBackline = [
  { item: "Amplificador de guitarra", spec: "Roland Jazz Chorus 120" },
  { item: "Amplificador de bajo", spec: "Gallien-Krueger 100" },
  { item: "Teclado", spec: "Nord Stage" },
  { item: "Batería", spec: "Bombo, snare, 3 toms, crash, ride, hi-hat" },
] as const;

export const riderMonitors = [
  {
    who: "Voz / guitarra",
    count: "3 monitores",
    mix: "Guitarra y voz, teclado, bajo, pistas",
  },
  {
    who: "Bajo",
    count: "1 monitor",
    mix: "Bajo, kick, snare, teclado, guitarra y voz, pistas",
  },
  {
    who: "Teclado",
    count: "1 monitor",
    mix: "Teclado, bajo, guitarra y voz, pistas",
  },
  {
    who: "Batería",
    count: "1 monitor",
    mix: "Bajo, teclado, guitarra y voz",
  },
] as const;
