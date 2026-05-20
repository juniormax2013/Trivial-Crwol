// ---------------------------------------------------------------
// BIBLE AI MODULE — KNOWLEDGE BASE (RAG)
// ---------------------------------------------------------------
// Static biblical knowledge base for context injection.
// Sources: Public domain content, general biblical scholarship.
// Bible text references: Reina-Valera 1909 (public domain in Spanish).
// ---------------------------------------------------------------

export interface BibleBookInfo {
  id: string;
  name: string;
  nameEn: string;
  testament: 'AT' | 'NT';
  chapters: number;
  summary: string;
  themes: string[];
  keyFigures: string[];
}

export interface BiblicalCharacter {
  id: string;
  name: string;
  aliases: string[];
  description: string;
  keyVerses: string[];
  era: string;
}

export interface BiblicalTopic {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  keyVerses: string[];
  relatedTopics: string[];
}

// ── 66 Books of the Bible ─────────────────────────────────────

export const BIBLE_BOOKS_KB: BibleBookInfo[] = [
  { id: 'genesis', name: 'Génesis', nameEn: 'Genesis', testament: 'AT', chapters: 50, summary: 'El origen del universo, la humanidad y la promesa de redención. Historia de los patriarcas: Adán, Noé, Abraham, Isaac, Jacob y José.', themes: ['creación', 'pecado', 'alianza', 'redención', 'patriarcas'], keyFigures: ['Adán', 'Eva', 'Noé', 'Abraham', 'Sara', 'Isaac', 'Rebeca', 'Jacob', 'José'] },
  { id: 'exodo', name: 'Éxodo', nameEn: 'Exodus', testament: 'AT', chapters: 40, summary: 'La liberación de Israel de Egipto, los diez mandamientos y la construcción del tabernáculo.', themes: ['liberación', 'Ley', 'tabernáculo', 'plaga', 'mar rojo'], keyFigures: ['Moisés', 'Aarón', 'Faraón', 'Miriam'] },
  { id: 'levitico', name: 'Levítico', nameEn: 'Leviticus', testament: 'AT', chapters: 27, summary: 'Las leyes de santidad, sacrificios y rituales para el pueblo de Israel.', themes: ['santidad', 'sacrificio', 'pureza', 'sacerdocio'], keyFigures: ['Moisés', 'Aarón'] },
  { id: 'numeros', name: 'Números', nameEn: 'Numbers', testament: 'AT', chapters: 36, summary: 'El viaje de Israel por el desierto durante 40 años.', themes: ['desierto', 'censo', 'murmuración', 'peregrinación'], keyFigures: ['Moisés', 'Caleb', 'Josué', 'Balaam'] },
  { id: 'deuteronomio', name: 'Deuteronomio', nameEn: 'Deuteronomy', testament: 'AT', chapters: 34, summary: 'El segundo sermón de la Ley por Moisés antes de entrar a Canaán.', themes: ['Ley', 'fidelidad', 'obediencia', 'promesa'], keyFigures: ['Moisés', 'Josué'] },
  { id: 'josue', name: 'Josué', nameEn: 'Joshua', testament: 'AT', chapters: 24, summary: 'La conquista de la Tierra Prometida bajo el liderazgo de Josué.', themes: ['conquista', 'promesa', 'fidelidad', 'Canaán'], keyFigures: ['Josué', 'Rahab', 'Caleb'] },
  { id: 'jueces', name: 'Jueces', nameEn: 'Judges', testament: 'AT', chapters: 21, summary: 'El ciclo de pecado, opresión, clamor y liberación en Israel.', themes: ['apostasía', 'liberación', 'liderazgo', 'ciclo'], keyFigures: ['Débora', 'Gedeón', 'Sansón', 'Jefté'] },
  { id: 'rut', name: 'Rut', nameEn: 'Ruth', testament: 'AT', chapters: 4, summary: 'Historia de fidelidad, lealtad y redención de una mujer moabita.', themes: ['lealtad', 'redención', 'fidelidad', 'amor'], keyFigures: ['Rut', 'Noemí', 'Boaz'] },
  { id: '1samuel', name: '1 Samuel', nameEn: '1 Samuel', testament: 'AT', chapters: 31, summary: 'El establecimiento de la monarquía en Israel con Saúl y David.', themes: ['monarquía', 'obediencia', 'unción', 'liderazgo'], keyFigures: ['Samuel', 'Saúl', 'David'] },
  { id: '2samuel', name: '2 Samuel', nameEn: '2 Samuel', testament: 'AT', chapters: 24, summary: 'El reinado de David, sus victorias y sus pecados.', themes: ['reinado', 'pecado', 'arrepentimiento', 'pacto'], keyFigures: ['David', 'Natán', 'Absalón', 'Betsabé'] },
  { id: '1reyes', name: '1 Reyes', nameEn: '1 Kings', testament: 'AT', chapters: 22, summary: 'Salomón y la división del reino de Israel.', themes: ['sabiduría', 'templo', 'idolatría', 'división'], keyFigures: ['Salomón', 'Elías', 'Jeroboam', 'Acab'] },
  { id: '2reyes', name: '2 Reyes', nameEn: '2 Kings', testament: 'AT', chapters: 25, summary: 'La caída de Israel y Judá al exilio.', themes: ['apostasía', 'exilio', 'profecía', 'juicio'], keyFigures: ['Eliseo', 'Ezequías', 'Josías'] },
  { id: '1cronicas', name: '1 Crónicas', nameEn: '1 Chronicles', testament: 'AT', chapters: 29, summary: 'Genealogías y el reinado de David enfocado en el templo.', themes: ['genealogía', 'templo', 'adoración', 'David'], keyFigures: ['David', 'Salomón'] },
  { id: '2cronicas', name: '2 Crónicas', nameEn: '2 Chronicles', testament: 'AT', chapters: 36, summary: 'Historia de Judá desde Salomón hasta el exilio.', themes: ['templo', 'adoración', 'reforma', 'exilio'], keyFigures: ['Salomón', 'Ezequías', 'Josías'] },
  { id: 'esdras', name: 'Esdras', nameEn: 'Ezra', testament: 'AT', chapters: 10, summary: 'El regreso de los exiliados y la restauración del culto.', themes: ['restauración', 'regreso', 'Ley', 'adoración'], keyFigures: ['Esdras', 'Ciro'] },
  { id: 'nehemias', name: 'Nehemías', nameEn: 'Nehemiah', testament: 'AT', chapters: 13, summary: 'Reconstrucción de los muros de Jerusalén.', themes: ['reconstrucción', 'liderazgo', 'oración', 'reforma'], keyFigures: ['Nehemías', 'Esdras'] },
  { id: 'ester', name: 'Ester', nameEn: 'Esther', testament: 'AT', chapters: 10, summary: 'Una reina judía salva a su pueblo de la extinción.', themes: ['providencia', 'valentía', 'salvación', 'identidad'], keyFigures: ['Ester', 'Mardoqueo', 'Amán', 'Asuero'] },
  { id: 'job', name: 'Job', nameEn: 'Job', testament: 'AT', chapters: 42, summary: 'El sufrimiento, la fidelidad y la soberanía de Dios.', themes: ['sufrimiento', 'soberanía', 'fidelidad', 'sabiduría'], keyFigures: ['Job', 'Eliú', 'Elifaz'] },
  { id: 'salmos', name: 'Salmos', nameEn: 'Psalms', testament: 'AT', chapters: 150, summary: 'Colección de himnos, oraciones y poemas hebreos.', themes: ['adoración', 'oración', 'alabanza', 'lamento', 'confianza'], keyFigures: ['David', 'Asaf', 'Moisés', 'Salomón'] },
  { id: 'proverbios', name: 'Proverbios', nameEn: 'Proverbs', testament: 'AT', chapters: 31, summary: 'Sabiduría práctica para la vida diaria.', themes: ['sabiduría', 'prudencia', 'familia', 'trabajo', 'humildad'], keyFigures: ['Salomón', 'Agur', 'Lemuel'] },
  { id: 'eclesiastes', name: 'Eclesiastés', nameEn: 'Ecclesiastes', testament: 'AT', chapters: 12, summary: 'La búsqueda del significado de la vida.', themes: ['vanidad', 'significado', 'sabiduría', 'tiempo', 'Dios'], keyFigures: ['Qohélet (Predicador)'] },
  { id: 'cantares', name: 'Cantares', nameEn: 'Song of Songs', testament: 'AT', chapters: 8, summary: 'Poema de amor entre el esposo y la amada, símbolo del amor de Dios.', themes: ['amor', 'matrimonio', 'belleza', 'relación'], keyFigures: ['Salomón'] },
  { id: 'isaias', name: 'Isaías', nameEn: 'Isaiah', testament: 'AT', chapters: 66, summary: 'Profecías de juicio y restauración, incluyendo el Siervo Sufriente.', themes: ['profecía', 'juicio', 'restauración', 'mesías', 'esperanza'], keyFigures: ['Isaías', 'Ezequías', 'Ciro'] },
  { id: 'jeremias', name: 'Jeremías', nameEn: 'Jeremiah', testament: 'AT', chapters: 52, summary: 'El profeta que lloró por Jerusalén antes de su destrucción.', themes: ['juicio', 'llanto', 'nuevo pacto', 'arrepentimiento'], keyFigures: ['Jeremías', 'Baruc'] },
  { id: 'lamentaciones', name: 'Lamentaciones', nameEn: 'Lamentations', testament: 'AT', chapters: 5, summary: 'Lamento poético por la destrucción de Jerusalén.', themes: ['lamento', 'destrucción', 'esperanza', 'misericordia'], keyFigures: ['Jeremías'] },
  { id: 'ezequiel', name: 'Ezequiel', nameEn: 'Ezekiel', testament: 'AT', chapters: 48, summary: 'Visiones proféticas del juicio y la restauración de Israel.', themes: ['visión', 'gloria', 'restauración', 'juicio', 'templo'], keyFigures: ['Ezequiel'] },
  { id: 'daniel', name: 'Daniel', nameEn: 'Daniel', testament: 'AT', chapters: 12, summary: 'Fidelidad en el exilio y visiones apocalípticas.', themes: ['fidelidad', 'visión', 'apocalipsis', 'reino de Dios'], keyFigures: ['Daniel', 'Sadrac', 'Mesac', 'Abed-nego', 'Nabucodonosor'] },
  { id: 'oseas', name: 'Oseas', nameEn: 'Hosea', testament: 'AT', chapters: 14, summary: 'El amor fiel de Dios por un pueblo infiel, representado en el matrimonio de Oseas.', themes: ['amor', 'infidelidad', 'restauración', 'pacto'], keyFigures: ['Oseas', 'Gomer'] },
  { id: 'joel', name: 'Joel', nameEn: 'Joel', testament: 'AT', chapters: 3, summary: 'Llamado al arrepentimiento y promesa del Espíritu Santo.', themes: ['arrepentimiento', 'Espíritu Santo', 'día del Señor'], keyFigures: ['Joel'] },
  { id: 'amos', name: 'Amós', nameEn: 'Amos', testament: 'AT', chapters: 9, summary: 'Profeta de la justicia social contra la opresión de los pobres.', themes: ['justicia', 'juicio', 'pobres', 'adoración verdadera'], keyFigures: ['Amós'] },
  { id: 'abdias', name: 'Abdías', nameEn: 'Obadiah', testament: 'AT', chapters: 1, summary: 'Juicio contra Edom por su orgullo y traición a Israel.', themes: ['juicio', 'orgullo', 'Edom'], keyFigures: ['Abdías'] },
  { id: 'jonas', name: 'Jonás', nameEn: 'Jonah', testament: 'AT', chapters: 4, summary: 'La misericordia de Dios hacia Nínive y la desobediencia de Jonás.', themes: ['misericordia', 'obediencia', 'arrepentimiento', 'gracia'], keyFigures: ['Jonás'] },
  { id: 'miqueas', name: 'Miqueas', nameEn: 'Micah', testament: 'AT', chapters: 7, summary: 'Justicia, humildad y profecía del nacimiento en Belén.', themes: ['justicia', 'humildad', 'profecía mesiánica', 'Belén'], keyFigures: ['Miqueas'] },
  { id: 'nahum', name: 'Nahúm', nameEn: 'Nahum', testament: 'AT', chapters: 3, summary: 'Profecía de la destrucción de Nínive.', themes: ['juicio', 'Nínive', 'poder de Dios'], keyFigures: ['Nahúm'] },
  { id: 'habacuc', name: 'Habacuc', nameEn: 'Habakkuk', testament: 'AT', chapters: 3, summary: 'El justo vivirá por su fe: diálogo con Dios sobre el sufrimiento.', themes: ['fe', 'sufrimiento', 'justicia', 'confianza'], keyFigures: ['Habacuc'] },
  { id: 'sofonias', name: 'Sofonías', nameEn: 'Zephaniah', testament: 'AT', chapters: 3, summary: 'El día del Señor y la promesa de restauración.', themes: ['juicio', 'día del Señor', 'restauración'], keyFigures: ['Sofonías'] },
  { id: 'hageo', name: 'Hageo', nameEn: 'Haggai', testament: 'AT', chapters: 2, summary: 'Llamado a reconstruir el templo después del exilio.', themes: ['templo', 'reconstrucción', 'prioridades'], keyFigures: ['Hageo', 'Zorobabel'] },
  { id: 'zacarias', name: 'Zacarías', nameEn: 'Zechariah', testament: 'AT', chapters: 14, summary: 'Visiones mesiánicas y esperanza escatológica.', themes: ['visión', 'mesías', 'restauración', 'escatología'], keyFigures: ['Zacarías', 'Josué el Sumo Sacerdote'] },
  { id: 'malaquias', name: 'Malaquías', nameEn: 'Malachi', testament: 'AT', chapters: 4, summary: 'El último profeta del AT, anunciando al precursor del Mesías.', themes: ['diezmo', 'fidelidad', 'Elías', 'juicio'], keyFigures: ['Malaquías'] },
  // New Testament
  { id: 'mateo', name: 'Mateo', nameEn: 'Matthew', testament: 'NT', chapters: 28, summary: 'El Evangelio escrito para judíos: Jesús como el Mesías prometido.', themes: ['reino de Dios', 'Sermón del Monte', 'cumplimiento profético', 'discipulado'], keyFigures: ['Jesús', 'Mateo', 'Pedro', 'Juan el Bautista'] },
  { id: 'marcos', name: 'Marcos', nameEn: 'Mark', testament: 'NT', chapters: 16, summary: 'El Evangelio más breve y dinámico de Jesús el Siervo.', themes: ['acción', 'milagros', 'servicio', 'sufrimiento'], keyFigures: ['Jesús', 'Marcos', 'Pedro'] },
  { id: 'lucas', name: 'Lucas', nameEn: 'Luke', testament: 'NT', chapters: 24, summary: 'El Evangelio universal: Jesús como Salvador de toda la humanidad.', themes: ['oración', 'pobres', 'mujeres', 'Espíritu Santo', 'alegría'], keyFigures: ['Jesús', 'Lucas', 'María', 'Zacarías', 'Isabel'] },
  { id: 'juan', name: 'Juan', nameEn: 'John', testament: 'NT', chapters: 21, summary: 'El Evangelio teológico: Jesús como el Verbo de Dios encarnado.', themes: ['vida eterna', 'luz', 'amor', 'fe', 'milagros', 'yo soy'], keyFigures: ['Jesús', 'Juan', 'Nicodemo', 'María Magdalena', 'Lázaro'] },
  { id: 'hechos', name: 'Hechos', nameEn: 'Acts', testament: 'NT', chapters: 28, summary: 'La expansión de la iglesia primitiva por el Espíritu Santo.', themes: ['Espíritu Santo', 'misión', 'iglesia primitiva', 'Pentecostés'], keyFigures: ['Pedro', 'Pablo', 'Esteban', 'Bernabé', 'Felipe'] },
  { id: 'romanos', name: 'Romanos', nameEn: 'Romans', testament: 'NT', chapters: 16, summary: 'La doctrina central de la salvación por gracia mediante la fe.', themes: ['justificación', 'gracia', 'pecado', 'fe', 'santificación'], keyFigures: ['Pablo'] },
  { id: '1corintios', name: '1 Corintios', nameEn: '1 Corinthians', testament: 'NT', chapters: 16, summary: 'Correcciones a la iglesia en Corinto y enseñanzas sobre amor y dones.', themes: ['unidad', 'amor', 'dones espirituales', 'resurrección', 'cuerpo'], keyFigures: ['Pablo', 'Apolos'] },
  { id: '2corintios', name: '2 Corintios', nameEn: '2 Corinthians', testament: 'NT', chapters: 13, summary: 'Defensa del ministerio apostólico y el don de la gracia en debilidad.', themes: ['sufrimiento', 'gracia', 'generosidad', 'reconciliación'], keyFigures: ['Pablo'] },
  { id: 'galatas', name: 'Gálatas', nameEn: 'Galatians', testament: 'NT', chapters: 6, summary: 'Libertad del legalismo: salvación por gracia mediante la fe, no por obras.', themes: ['libertad', 'gracia', 'fe', 'Ley', 'fruto del Espíritu'], keyFigures: ['Pablo', 'Pedro'] },
  { id: 'efesios', name: 'Efesios', nameEn: 'Ephesians', testament: 'NT', chapters: 6, summary: 'La iglesia como cuerpo de Cristo y la armadura espiritual.', themes: ['iglesia', 'unidad', 'gracia', 'armadura', 'familia'], keyFigures: ['Pablo'] },
  { id: 'filipenses', name: 'Filipenses', nameEn: 'Philippians', testament: 'NT', chapters: 4, summary: 'La carta de la alegría: gozo en Cristo en toda circunstancia.', themes: ['gozo', 'humildad', 'paz', 'contentamiento', 'Cristo'], keyFigures: ['Pablo', 'Timoteo', 'Epafrodito'] },
  { id: 'colosenses', name: 'Colosenses', nameEn: 'Colossians', testament: 'NT', chapters: 4, summary: 'La supremacía de Cristo sobre toda filosofía y tradición.', themes: ['supremacía de Cristo', 'plenitud', 'sabiduría', 'nueva vida'], keyFigures: ['Pablo'] },
  { id: '1tesalonicenses', name: '1 Tesalonicenses', nameEn: '1 Thessalonians', testament: 'NT', chapters: 5, summary: 'Ánimo sobre la segunda venida de Cristo.', themes: ['segunda venida', 'esperanza', 'santidad', 'fe'], keyFigures: ['Pablo'] },
  { id: '2tesalonicenses', name: '2 Tesalonicenses', nameEn: '2 Thessalonians', testament: 'NT', chapters: 3, summary: 'Corrección sobre la segunda venida y el hombre de iniquidad.', themes: ['segunda venida', 'perseverancia', 'apostasía'], keyFigures: ['Pablo'] },
  { id: '1timoteo', name: '1 Timoteo', nameEn: '1 Timothy', testament: 'NT', chapters: 6, summary: 'Instrucciones pastorales para la iglesia y el liderazgo.', themes: ['liderazgo', 'doctrina', 'oración', 'iglesia', 'contentamiento'], keyFigures: ['Pablo', 'Timoteo'] },
  { id: '2timoteo', name: '2 Timoteo', nameEn: '2 Timothy', testament: 'NT', chapters: 4, summary: 'La última carta de Pablo: fidelidad hasta el fin.', themes: ['perseverancia', 'Escritura', 'fidelidad', 'sufrimiento'], keyFigures: ['Pablo', 'Timoteo'] },
  { id: 'tito', name: 'Tito', nameEn: 'Titus', testament: 'NT', chapters: 3, summary: 'Organización de la iglesia en Creta y buenas obras.', themes: ['liderazgo', 'gracia', 'buenas obras', 'doctrina sana'], keyFigures: ['Pablo', 'Tito'] },
  { id: 'filemon', name: 'Filemón', nameEn: 'Philemon', testament: 'NT', chapters: 1, summary: 'Carta personal sobre la reconciliación y el perdón.', themes: ['perdón', 'reconciliación', 'libertad', 'amor'], keyFigures: ['Pablo', 'Filemón', 'Onésimo'] },
  { id: 'hebreos', name: 'Hebreos', nameEn: 'Hebrews', testament: 'NT', chapters: 13, summary: 'Jesús como sumo sacerdote superior al sistema levítico.', themes: ['sacerdocio', 'fe', 'perseverancia', 'Jesús superior', 'alianza nueva'], keyFigures: ['Jesús', 'Abraham', 'Moisés'] },
  { id: 'santiago', name: 'Santiago', nameEn: 'James', testament: 'NT', chapters: 5, summary: 'Fe que se demuestra con obras y sabiduría práctica.', themes: ['fe y obras', 'sabiduría', 'lengua', 'oración', 'paciencia'], keyFigures: ['Santiago'] },
  { id: '1pedro', name: '1 Pedro', nameEn: '1 Peter', testament: 'NT', chapters: 5, summary: 'Esperanza en el sufrimiento para creyentes en diáspora.', themes: ['sufrimiento', 'esperanza', 'santidad', 'gracia'], keyFigures: ['Pedro'] },
  { id: '2pedro', name: '2 Pedro', nameEn: '2 Peter', testament: 'NT', chapters: 3, summary: 'Advertencia contra los falsos maestros y la segunda venida.', themes: ['falsos maestros', 'segunda venida', 'crecimiento', 'Escritura'], keyFigures: ['Pedro'] },
  { id: '1juan', name: '1 Juan', nameEn: '1 John', testament: 'NT', chapters: 5, summary: 'El amor de Dios, la comunión y la victoria sobre el mundo.', themes: ['amor', 'comunión', 'luz', 'fe', 'Espíritu'], keyFigures: ['Juan'] },
  { id: '2juan', name: '2 Juan', nameEn: '2 John', testament: 'NT', chapters: 1, summary: 'Guardar la doctrina verdadera y el amor cristiano.', themes: ['verdad', 'amor', 'falsos maestros'], keyFigures: ['Juan'] },
  { id: '3juan', name: '3 Juan', nameEn: '3 John', testament: 'NT', chapters: 1, summary: 'Hospitalidad y apoyo a los maestros del evangelio.', themes: ['hospitalidad', 'fidelidad', 'liderazgo'], keyFigures: ['Juan', 'Gayo', 'Diótrefes'] },
  { id: 'judas', name: 'Judas', nameEn: 'Jude', testament: 'NT', chapters: 1, summary: 'Contender por la fe contra los que la pervierten.', themes: ['apostasía', 'fe', 'juicio', 'gracia'], keyFigures: ['Judas'] },
  { id: 'apocalipsis', name: 'Apocalipsis', nameEn: 'Revelation', testament: 'NT', chapters: 22, summary: 'La visión de Juan sobre los eventos del fin y la victoria final de Cristo.', themes: ['victoria', 'adoración', 'juicio', 'nueva creación', 'esperanza'], keyFigures: ['Juan', 'Jesús', 'los Cuatro Vivientes'] },
];

// ── Key Biblical Characters ─────────────────────────────────

export const BIBLICAL_CHARACTERS_KB: BiblicalCharacter[] = [
  { id: 'jesus', name: 'Jesús', aliases: ['Cristo', 'Mesías', 'Hijo de Dios', 'Señor', 'Emmanuel', 'Jesucristo'], description: 'El Hijo de Dios encarnado, Salvador del mundo. Nació en Belén, ministró en Galilea y Judea, fue crucificado y resucitó al tercer día. Es el centro del Nuevo Testamento y el cumplimiento de las profecías del Antiguo Testamento.', keyVerses: ['Juan 3:16', 'Juan 14:6', 'Isaías 53:5', 'Marcos 16:6'], era: 'Período del Nuevo Testamento (~4 a.C. - 33 d.C.)' },
  { id: 'moises', name: 'Moisés', aliases: ['Moses'], description: 'Líder y legislador de Israel. Libertó a los israelitas de la esclavitud en Egipto, recibió la Ley de Dios en el Monte Sinaí y los guió 40 años por el desierto. Escribió los primeros cinco libros de la Biblia.', keyVerses: ['Éxodo 3:1-6', 'Éxodo 20', 'Deuteronomio 34:10'], era: 'Período del Éxodo (~1526-1406 a.C.)' },
  { id: 'david', name: 'David', aliases: [], description: 'El rey más grande de Israel, autor de muchos Salmos. Mató al gigante Goliat de joven y reinó en Israel por 40 años. A pesar de sus pecados (adulterio con Betsabé, muerte de Urías), fue llamado "varón conforme al corazón de Dios".', keyVerses: ['1 Samuel 17:45-47', 'Salmo 23', '2 Samuel 11', 'Hechos 13:22'], era: 'Período de la Monarquía (~1040-970 a.C.)' },
  { id: 'abraham', name: 'Abraham', aliases: ['Abram'], description: 'Padre de la fe. Llamado por Dios de Ur de los Caldeos para ser el padre de una gran nación. Obedeció a Dios incluso cuando se le pidió sacrificar a su hijo Isaac. Es el padre espiritual de judíos, cristianos y musulmanes.', keyVerses: ['Génesis 12:1-3', 'Génesis 22:1-18', 'Romanos 4:3'], era: 'Período de los Patriarcas (~2166-1991 a.C.)' },
  { id: 'pablo', name: 'Pablo', aliases: ['Saulo', 'Saul', 'Apóstol Pablo'], description: 'Apóstol a los gentiles. Antes llamado Saulo, perseguía a los cristianos hasta su encuentro con Cristo en el camino a Damasco. Escribió 13 cartas del Nuevo Testamento y realizó tres viajes misioneros.', keyVerses: ['Hechos 9:1-19', 'Filipenses 4:13', 'Romanos 8:28', 'Gálatas 2:20'], era: 'Iglesia Primitiva (~5-67 d.C.)' },
  { id: 'pedro', name: 'Pedro', aliases: ['Simón Pedro', 'Cefas'], description: 'Líder de los doce apóstoles. Pescador de profesión, fue llamado por Jesús a ser "pescador de hombres". Negó a Jesús tres veces pero fue restaurado. Predicó en Pentecostés y fue el primer apóstol de los judíos.', keyVerses: ['Mateo 16:18', 'Juan 21:15-17', 'Hechos 2:14-41'], era: 'Iglesia Primitiva (~1-68 d.C.)' },
  { id: 'jose', name: 'José', aliases: ['José hijo de Jacob'], description: 'Hijo de Jacob, vendido por sus hermanos como esclavo a Egipto. Interpretó sueños del faraón y se convirtió en segundo al mando en Egipto, salvando a su familia durante el hambre. Símbolo del perdón y la providencia de Dios.', keyVerses: ['Génesis 37:28', 'Génesis 50:20', 'Génesis 41:37-44'], era: 'Período de los Patriarcas (~1914-1805 a.C.)' },
  { id: 'maria', name: 'María', aliases: ['Virgen María', 'Madre de Jesús'], description: 'Madre de Jesús. Joven virgen de Nazaret que aceptó ser la madre del Mesías por obra del Espíritu Santo. Estuvo presente en la crucifixión y la resurrección de Jesús.', keyVerses: ['Lucas 1:26-38', 'Juan 19:25-27', 'Lucas 2:7'], era: 'Período del Nuevo Testamento (~20 a.C. - 50 d.C.)' },
  { id: 'salomon', name: 'Salomón', aliases: [], description: 'Hijo de David, el rey más sabio de Israel. Construyó el Templo de Jerusalén, escribió Proverbios, Eclesiastés y Cantares. Su reino fue el de mayor esplendor, pero al final se alejó de Dios por sus muchas esposas paganas.', keyVerses: ['1 Reyes 3:5-14', 'Proverbios 1:7', '1 Reyes 10:23'], era: 'Período de la Monarquía (~970-930 a.C.)' },
  { id: 'juan_bautista', name: 'Juan el Bautista', aliases: ['Juan Bautista'], description: 'El precursor de Jesús, hijo de Zacarías e Isabel. Predicó en el desierto llamando al arrepentimiento y bautizó a Jesús en el río Jordán. Fue decapitado por orden de Herodes.', keyVerses: ['Marcos 1:1-8', 'Juan 1:29', 'Lucas 1:13-17'], era: 'Período del Nuevo Testamento (~6 a.C. - 30 d.C.)' },
  { id: 'noe', name: 'Noé', aliases: [], description: 'El único hombre justo en su generación. Dios le ordenó construir el arca para salvar a su familia y a los animales del diluvio universal. Después del diluvio, Dios estableció un pacto con él representado por el arco iris.', keyVerses: ['Génesis 6:9', 'Génesis 9:11-13', 'Hebreos 11:7'], era: 'Período Primordial (~2348 a.C. aprox.)' },
  { id: 'ruth', name: 'Rut', aliases: [], description: 'Mujer moabita que por su lealtad a su suegra Noemí abrazó al Dios de Israel. Casó con Boaz y se convirtió en bisabuela del rey David. Ejemplo de fidelidad y conversión.', keyVerses: ['Rut 1:16-17', 'Rut 4:13-17'], era: 'Período de los Jueces (~1100 a.C. aprox.)' },
  { id: 'ester', name: 'Ester', aliases: ['Hadassah'], description: 'Reina judía en Persia que salvó a su pueblo de la exterminación planeada por Amán. Su historia se celebra en la fiesta de Purim.', keyVerses: ['Ester 4:14', 'Ester 7:3-4'], era: 'Período Persa (~479 a.C. aprox.)' },
  { id: 'daniel', name: 'Daniel', aliases: [], description: 'Profeta hebreo llevado al exilio en Babilonia. Mantuvo su fe en el horno de fuego (Sadrac, Mesac y Abed-nego) y en el foso de los leones. Recibió visiones proféticas del fin de los tiempos.', keyVerses: ['Daniel 1:8', 'Daniel 3:17', 'Daniel 6:22', 'Daniel 7'], era: 'Período del Exilio (~620-530 a.C.)' },
];

// ── Biblical Topics ─────────────────────────────────────────

export const BIBLICAL_TOPICS_KB: BiblicalTopic[] = [
  { id: 'salvation', title: 'Salvación', titleEn: 'Salvation', description: 'La salvación es el acto de Dios de librar al ser humano del pecado y sus consecuencias mediante la fe en Jesucristo. No se obtiene por obras sino por gracia.', keyVerses: ['Juan 3:16', 'Efesios 2:8-9', 'Romanos 10:9-10', 'Hechos 4:12'], relatedTopics: ['gracia', 'fe', 'pecado', 'redención'] },
  { id: 'grace', title: 'Gracia', titleEn: 'Grace', description: 'La gracia es el favor inmerecido de Dios hacia los seres humanos. Por gracia somos salvos, no por nuestros méritos.', keyVerses: ['Efesios 2:8', 'Romanos 5:2', 'Juan 1:17', 'Tito 2:11'], relatedTopics: ['salvación', 'fe', 'misericordia'] },
  { id: 'faith', title: 'Fe', titleEn: 'Faith', description: 'La fe es la certeza de lo que se espera y la convicción de lo que no se ve. Es el medio por el cual el creyente recibe la salvación y vive la vida cristiana.', keyVerses: ['Hebreos 11:1', 'Romanos 1:17', 'Santiago 2:17', 'Marcos 9:23'], relatedTopics: ['salvación', 'obras', 'esperanza'] },
  { id: 'love', title: 'Amor', titleEn: 'Love', description: 'El amor es el atributo central de Dios y el mandamiento supremo de Jesús: amar a Dios y al prójimo. El amor cristiano (ágape) es incondicional y sacrificial.', keyVerses: ['1 Corintios 13:4-8', 'Juan 3:16', 'Mateo 22:37-39', '1 Juan 4:8'], relatedTopics: ['gracia', 'misericordia', 'perdón'] },
  { id: 'forgiveness', title: 'Perdón', titleEn: 'Forgiveness', description: 'Dios perdona los pecados de quienes se arrepienten y confían en Cristo. Los creyentes también son llamados a perdonar a otros.', keyVerses: ['1 Juan 1:9', 'Mateo 6:14-15', 'Colosenses 1:14', 'Salmo 103:12'], relatedTopics: ['arrepentimiento', 'gracia', 'reconciliación'] },
  { id: 'prayer', title: 'Oración', titleEn: 'Prayer', description: 'La oración es la comunicación con Dios. Jesús enseñó a sus discípulos cómo orar (Padre Nuestro) y prometió que el Padre escucha las oraciones de los creyentes.', keyVerses: ['Mateo 6:9-13', 'Filipenses 4:6-7', 'Santiago 5:16', '1 Tesalonicenses 5:17'], relatedTopics: ['fe', 'ayuno', 'adoración'] },
  { id: 'holy_spirit', title: 'Espíritu Santo', titleEn: 'Holy Spirit', description: 'La tercera persona de la Trinidad. Habita en los creyentes, los guía, da dones espirituales y produce el fruto del Espíritu.', keyVerses: ['Juan 14:16-17', 'Hechos 2:1-4', 'Gálatas 5:22-23', '1 Corintios 12:7-11'], relatedTopics: ['Trinidad', 'dones', 'fruto', 'Pentecostés'] },
  { id: 'sin', title: 'Pecado', titleEn: 'Sin', description: 'El pecado es la transgresión de la ley de Dios. Entró al mundo por Adán y Eva y separó a la humanidad de Dios. Cristo murió para redimir al ser humano del pecado.', keyVerses: ['Romanos 3:23', 'Génesis 3', 'Isaías 59:2', 'Romanos 6:23'], relatedTopics: ['redención', 'arrepentimiento', 'muerte', 'gracia'] },
  { id: 'resurrection', title: 'Resurrección', titleEn: 'Resurrection', description: 'La resurrección de Jesús al tercer día es el fundamento del cristianismo. Garantiza la resurrección de todos los creyentes al final de los tiempos.', keyVerses: ['1 Corintios 15:17', 'Juan 11:25', 'Marcos 16:6', 'Lucas 24:6-7'], relatedTopics: ['muerte', 'esperanza', 'vida eterna', 'victoria'] },
  { id: 'eternal_life', title: 'Vida Eterna', titleEn: 'Eternal Life', description: 'La promesa de vivir para siempre con Dios, comenzando desde el momento de la fe en Cristo y culminando en la resurrección del cuerpo.', keyVerses: ['Juan 3:16', 'Juan 17:3', 'Romanos 6:23', '1 Juan 5:12'], relatedTopics: ['salvación', 'resurrección', 'cielo'] },
  { id: 'second_coming', title: 'Segunda Venida', titleEn: 'Second Coming', description: 'El regreso visible y glorioso de Jesucristo al final de los tiempos para juzgar a vivos y muertos y establecer su reino eterno.', keyVerses: ['Mateo 24:30', 'Hechos 1:11', '1 Tesalonicenses 4:16-17', 'Apocalipsis 1:7'], relatedTopics: ['juicio', 'esperanza', 'eternidad'] },
  { id: 'baptism', title: 'Bautismo', titleEn: 'Baptism', description: 'El bautismo es el acto de fe que simboliza la muerte al pecado y la nueva vida en Cristo. Jesús fue bautizado por Juan el Bautista.', keyVerses: ['Mateo 28:19', 'Romanos 6:4', 'Hechos 2:38', 'Marcos 1:9-11'], relatedTopics: ['salvación', 'Espíritu Santo', 'nueva vida'] },
  { id: 'ten_commandments', title: 'Diez Mandamientos', titleEn: 'Ten Commandments', description: 'La Ley moral dada por Dios a Moisés en el Monte Sinaí. Resumen: amar a Dios sobre todas las cosas y amar al prójimo como a uno mismo.', keyVerses: ['Éxodo 20:1-17', 'Deuteronomio 5:1-21', 'Mateo 22:37-40'], relatedTopics: ['Ley', 'obediencia', 'amor'] },
  { id: 'trinity', title: 'Trinidad', titleEn: 'Trinity', description: 'Dios es uno en esencia pero tres en personas: Padre, Hijo y Espíritu Santo. Esta doctrina es el fundamento de la fe cristiana.', keyVerses: ['Mateo 28:19', 'Juan 1:1', '2 Corintios 13:14', 'Génesis 1:26'], relatedTopics: ['Dios Padre', 'Jesucristo', 'Espíritu Santo'] },
  { id: 'heaven', title: 'Cielo', titleEn: 'Heaven', description: 'El morada eterna de Dios y la promesa para los creyentes. El Apocalipsis describe la Nueva Jerusalén como el hogar eterno de los redimidos.', keyVerses: ['Juan 14:2-3', 'Apocalipsis 21:1-4', 'Filipenses 3:20', '2 Corintios 5:1'], relatedTopics: ['vida eterna', 'resurrección', 'esperanza'] },
  { id: 'wisdom', title: 'Sabiduría', titleEn: 'Wisdom', description: 'El principio de la sabiduría es el temor del Señor. La Biblia enseña que la sabiduría verdadera viene de Dios y se aplica en la vida diaria.', keyVerses: ['Proverbios 1:7', 'Santiago 1:5', 'Proverbios 9:10', 'Job 28:28'], relatedTopics: ['conocimiento', 'humildad', 'obediencia'] },
];

// ── Search Function (RAG) ──────────────────────────────────────

/**
 * Searches the biblical knowledge base for relevant context
 * based on the user's question.
 */
export function searchBibleContext(query: string): string {
  const q = query.toLowerCase();
  const results: string[] = [];

  // Search books
  const matchedBooks = BIBLE_BOOKS_KB.filter(book =>
    q.includes(book.name.toLowerCase()) ||
    q.includes(book.nameEn.toLowerCase()) ||
    book.themes.some(t => q.includes(t)) ||
    book.keyFigures.some(f => q.toLowerCase().includes(f.toLowerCase()))
  ).slice(0, 3);

  matchedBooks.forEach(book => {
    results.push(
      `📖 ${book.name} (${book.nameEn}): ${book.summary} Temas: ${book.themes.join(', ')}. Personajes: ${book.keyFigures.join(', ')}.`
    );
  });

  // Search characters
  const matchedChars = BIBLICAL_CHARACTERS_KB.filter(char =>
    q.includes(char.name.toLowerCase()) ||
    char.aliases.some(a => q.includes(a.toLowerCase()))
  ).slice(0, 2);

  matchedChars.forEach(char => {
    results.push(
      `👤 ${char.name}: ${char.description} Referencias clave: ${char.keyVerses.join(', ')}.`
    );
  });

  // Search topics
  const matchedTopics = BIBLICAL_TOPICS_KB.filter(topic =>
    q.includes(topic.title.toLowerCase()) ||
    q.includes(topic.titleEn.toLowerCase()) ||
    topic.relatedTopics.some(r => q.includes(r))
  ).slice(0, 2);

  matchedTopics.forEach(topic => {
    results.push(
      `📌 ${topic.title}: ${topic.description} Versículos clave: ${topic.keyVerses.join(', ')}.`
    );
  });

  // Check for verse patterns like "Juan 3:16" or "Juan 3"
  const versePattern = /([a-záéíóúñü\s]+)\s+(\d+)(?::(\d+))?/gi;
  const matches = query.matchAll(versePattern);
  for (const match of matches) {
    const bookName = match[1].trim();
    const book = BIBLE_BOOKS_KB.find(b =>
      b.name.toLowerCase().includes(bookName.toLowerCase()) ||
      b.nameEn.toLowerCase().includes(bookName.toLowerCase())
    );
    if (book) {
      results.push(`📖 Referencia detectada: ${book.name} ${match[2]}${match[3] ? ':' + match[3] : ''}. Libro ${book.testament === 'AT' ? 'del Antiguo Testamento' : 'del Nuevo Testamento'}. ${book.summary}`);
    }
  }

  if (results.length === 0) {
    // Generic biblical context
    results.push(
      'La Biblia contiene 66 libros: 39 del Antiguo Testamento y 27 del Nuevo Testamento. Fue escrita por aproximadamente 40 autores durante un período de 1500 años.'
    );
  }

  return results.join('\n\n');
}

/**
 * Returns a list of all bible book names for reference.
 */
export function getAllBookNames(): string[] {
  return BIBLE_BOOKS_KB.map(b => `${b.name} (${b.nameEn})`);
}
