import { DuelQuestion } from './models';

// ═══════════════════════════════════════════════════════════════
// 📜 PENTATEUCO
// ═══════════════════════════════════════════════════════════════
export const QUESTIONS_PENTATEUCO_ES: DuelQuestion[] = [
  // FÁCIL
  { id:'dq-pent-es-001', questionText:'Según el Génesis, ¿en cuántos días creó Dios el mundo?', categoryId:'pentateuco', categoryName:'Pentateuco', difficulty:'easy', language:'es',
    options:[{id:'a',text:'3 días'},{id:'b',text:'6 días'},{id:'c',text:'7 días'},{id:'d',text:'40 días'}], correctOptionId:'b',
    explanation:'Dios creó todas las cosas en seis días y descansó el séptimo día (Génesis 1:1–2:3).', bibleReference:'Génesis 1:1-2:3' },
  { id:'dq-pent-es-002', questionText:'¿Cuál es el nombre de la primera mujer creada por Dios?', categoryId:'pentateuco', categoryName:'Pentateuco', difficulty:'easy', language:'es',
    options:[{id:'a',text:'Sara'},{id:'b',text:'María'},{id:'c',text:'Eva'},{id:'d',text:'Rebeca'}], correctOptionId:'c',
    explanation:'Adán llamó a su mujer Eva, por cuanto ella era madre de todos los vivientes (Génesis 3:20).', bibleReference:'Génesis 3:20' },
  { id:'dq-pent-es-003', questionText:'¿Qué construyó Noé para escapar del diluvio?', categoryId:'pentateuco', categoryName:'Pentateuco', difficulty:'easy', language:'es',
    options:[{id:'a',text:'Una torre'},{id:'b',text:'Un arca'},{id:'c',text:'Un refugio'},{id:'d',text:'Una fortaleza'}], correctOptionId:'b',
    explanation:'Dios ordenó a Noé construir un arca de madera para salvar a su familia y a los animales (Génesis 6:14).', bibleReference:'Génesis 6:14' },
  { id:'dq-pent-es-004', questionText:'¿Cuántas plagas envió Dios sobre Egipto para liberar a Israel?', categoryId:'pentateuco', categoryName:'Pentateuco', difficulty:'easy', language:'es',
    options:[{id:'a',text:'3'},{id:'b',text:'7'},{id:'c',text:'10'},{id:'d',text:'12'}], correctOptionId:'c',
    explanation:'Dios envió 10 plagas sobre Egipto; la última fue la muerte de los primogénitos (Éxodo 7-12).', bibleReference:'Éxodo 7-12' },
  { id:'dq-pent-es-005', questionText:'¿Dónde recibió Moisés los Diez Mandamientos?', categoryId:'pentateuco', categoryName:'Pentateuco', difficulty:'easy', language:'es',
    options:[{id:'a',text:'Monte Carmelo'},{id:'b',text:'Monte Sinaí'},{id:'c',text:'Monte de los Olivos'},{id:'d',text:'Monte Nebo'}], correctOptionId:'b',
    explanation:'Dios dio a Moisés los Diez Mandamientos en el Monte Sinaí (Éxodo 20).', bibleReference:'Éxodo 20:1-17' },
  // MEDIO
  { id:'dq-pent-es-006', questionText:'¿Durante cuántos días y noches llovió durante el diluvio?', categoryId:'pentateuco', categoryName:'Pentateuco', difficulty:'medium', language:'es',
    options:[{id:'a',text:'7'},{id:'b',text:'20'},{id:'c',text:'40'},{id:'d',text:'100'}], correctOptionId:'c',
    explanation:'La lluvia cayó sobre la tierra durante cuarenta días y cuarenta noches (Génesis 7:12).', bibleReference:'Génesis 7:12' },
  { id:'dq-pent-es-007', questionText:'¿Quién interpretó los sueños de Faraón sobre las vacas gordas y flacas?', categoryId:'pentateuco', categoryName:'Pentateuco', difficulty:'medium', language:'es',
    options:[{id:'a',text:'Moisés'},{id:'b',text:'Abraham'},{id:'c',text:'José'},{id:'d',text:'Aarón'}], correctOptionId:'c',
    explanation:'José interpretó los sueños de Faraón: 7 años de abundancia seguidos de 7 años de hambre (Génesis 41).', bibleReference:'Génesis 41:25-32' },
  { id:'dq-pent-es-008', questionText:'¿Qué mar cruzó Moisés con el pueblo para escapar del ejército de Faraón?', categoryId:'pentateuco', categoryName:'Pentateuco', difficulty:'medium', language:'es',
    options:[{id:'a',text:'Jordán'},{id:'b',text:'Mar Mediterráneo'},{id:'c',text:'Mar Rojo'},{id:'d',text:'Nilo'}], correctOptionId:'c',
    explanation:'Dios dividió el Mar Rojo para que Israel pudiera pasar por seco (Éxodo 14:21-28).', bibleReference:'Éxodo 14:21-28' },
  { id:'dq-pent-es-009', questionText:'¿Durante cuántos años vagó el pueblo de Israel por el desierto?', categoryId:'pentateuco', categoryName:'Pentateuco', difficulty:'medium', language:'es',
    options:[{id:'a',text:'10 años'},{id:'b',text:'20 años'},{id:'c',text:'40 años'},{id:'d',text:'70 años'}], correctOptionId:'c',
    explanation:'Israel pasó 40 años en el desierto debido a la incredulidad del pueblo (Números 14:33-34).', bibleReference:'Números 14:33-34' },
  { id:'dq-pent-es-010', questionText:'¿Qué comida caída del cielo comió el pueblo de Israel en el desierto?', categoryId:'pentateuco', categoryName:'Pentateuco', difficulty:'medium', language:'es',
    options:[{id:'a',text:'Maná'},{id:'b',text:'Miel'},{id:'c',text:'Pan de cebada'},{id:'d',text:'Granadas'}], correctOptionId:'a',
    explanation:'Dios envió maná del cielo cada mañana para alimentar a Israel (Éxodo 16:14-15).', bibleReference:'Éxodo 16:14-15' },
  // DIFÍCIL
  { id:'dq-pent-es-011', questionText:'¿Cuál es el significado de la palabra griega "Génesis"?', categoryId:'pentateuco', categoryName:'Pentateuco', difficulty:'hard', language:'es',
    options:[{id:'a',text:'Ley de Dios'},{id:'b',text:'Principio u origen'},{id:'c',text:'Creación gloriosa'},{id:'d',text:'Pacto eterno'}], correctOptionId:'b',
    explanation:'La palabra griega "genesis" significa "principio", "origen" o "comienzo".', bibleReference:'Génesis 1:1' },
  { id:'dq-pent-es-012', questionText:'¿Cuántos espías envió Moisés a explorar Canaán?', categoryId:'pentateuco', categoryName:'Pentateuco', difficulty:'hard', language:'es',
    options:[{id:'a',text:'7'},{id:'b',text:'10'},{id:'c',text:'12'},{id:'d',text:'70'}], correctOptionId:'c',
    explanation:'Moisés envió 12 hombres, uno de cada tribu. Solo Caleb y Josué trajeron un buen reporte (Números 13).', bibleReference:'Números 13:1-16' },
  { id:'dq-pent-es-013', questionText:'¿En qué montaña murió Moisés sin entrar en la Tierra Prometida?', categoryId:'pentateuco', categoryName:'Pentateuco', difficulty:'hard', language:'es',
    options:[{id:'a',text:'Monte Hermón'},{id:'b',text:'Monte Nebo'},{id:'c',text:'Monte Sinaí'},{id:'d',text:'Monte Pisga'}], correctOptionId:'b',
    explanation:'Moisés subió al monte Nebo, vio la tierra prometida y murió allí a los 120 años (Deuteronomio 34:1-5).', bibleReference:'Deuteronomio 34:1-5' },
  { id:'dq-pent-es-014', questionText:'¿Cuántos hijos tuvo Jacob, origen de las 12 tribus de Israel?', categoryId:'pentateuco', categoryName:'Pentateuco', difficulty:'hard', language:'es',
    options:[{id:'a',text:'10'},{id:'b',text:'11'},{id:'c',text:'12'},{id:'d',text:'13'}], correctOptionId:'c',
    explanation:'Jacob tuvo 12 hijos: Rubén, Simeón, Leví, Judá, Dan, Neftalí, Gad, Aser, Isacar, Zabulón, José y Benjamín (Génesis 49).', bibleReference:'Génesis 49:1-28' },
  { id:'dq-pent-es-015', questionText:'¿Qué significa la palabra "Deuteronomio"?', categoryId:'pentateuco', categoryName:'Pentateuco', difficulty:'hard', language:'es',
    options:[{id:'a',text:'Último libro de la ley'},{id:'b',text:'Segunda ley'},{id:'c',text:'Ley del desierto'},{id:'d',text:'Mandamientos de Moisés'}], correctOptionId:'b',
    explanation:'"Deuteronomio" viene del griego: deutero (segundo) y nomos (ley). Representa la segunda exposición de la ley.', bibleReference:'Deuteronomio 1:1' },
];

// ═══════════════════════════════════════════════════════════════
// 🏛️ HISTORIA DE ISRAEL
// ═══════════════════════════════════════════════════════════════
export const QUESTIONS_HISTORIA_ES: DuelQuestion[] = [
  // FÁCIL
  { id:'dq-hist-es-001', questionText:'¿Quién hizo caer los muros de Jericó?', categoryId:'historia', categoryName:'Historia de Israel', difficulty:'easy', language:'es',
    options:[{id:'a',text:'Moisés'},{id:'b',text:'Josué'},{id:'c',text:'David'},{id:'d',text:'Sansón'}], correctOptionId:'b',
    explanation:'Josué y el pueblo marcharon alrededor de Jericó durante siete días y los muros cayeron (Josué 6).', bibleReference:'Josué 6:1-20' },
  { id:'dq-hist-es-002', questionText:'¿Quién mató al gigante Goliat?', categoryId:'historia', categoryName:'Historia de Israel', difficulty:'easy', language:'es',
    options:[{id:'a',text:'Saúl'},{id:'b',text:'Jonatán'},{id:'c',text:'David'},{id:'d',text:'Sansón'}], correctOptionId:'c',
    explanation:'David, siendo joven, derrotó al filisteo Goliat con una honda y una piedra (1 Samuel 17).', bibleReference:'1 Samuel 17:49-50' },
  { id:'dq-hist-es-003', questionText:'¿Quién fue el primer rey de Israel?', categoryId:'historia', categoryName:'Historia de Israel', difficulty:'easy', language:'es',
    options:[{id:'a',text:'David'},{id:'b',text:'Salomón'},{id:'c',text:'Saúl'},{id:'d',text:'Samuel'}], correctOptionId:'c',
    explanation:'Saúl fue el primer rey de Israel, elegido por el pueblo y confirmado por Samuel (1 Samuel 10).', bibleReference:'1 Samuel 10:1' },
  { id:'dq-hist-es-004', questionText:'¿Con qué arma derrotó David al gigante Goliat?', categoryId:'historia', categoryName:'Historia de Israel', difficulty:'easy', language:'es',
    options:[{id:'a',text:'Una espada'},{id:'b',text:'Una lanza'},{id:'c',text:'Una honda y una piedra'},{id:'d',text:'Arco y flecha'}], correctOptionId:'c',
    explanation:'David usó una honda y una piedra lisa del arroyo; hirió a Goliat en la frente (1 Samuel 17:49).', bibleReference:'1 Samuel 17:49' },
  { id:'dq-hist-es-005', questionText:'¿Quién construyó el primer templo para Dios en Jerusalén?', categoryId:'historia', categoryName:'Historia de Israel', difficulty:'easy', language:'es',
    options:[{id:'a',text:'David'},{id:'b',text:'Salomón'},{id:'c',text:'Moisés'},{id:'d',text:'Josué'}], correctOptionId:'b',
    explanation:'Salomón edificó el templo en el Monte Moriah, según el plan que David recibió de Dios (1 Reyes 6).', bibleReference:'1 Reyes 6:1-38' },
  // MEDIO
  { id:'dq-hist-es-006', questionText:'¿Cuántos años reinó Salomón sobre Israel?', categoryId:'historia', categoryName:'Historia de Israel', difficulty:'medium', language:'es',
    options:[{id:'a',text:'20 años'},{id:'b',text:'40 años'},{id:'c',text:'60 años'},{id:'d',text:'70 años'}], correctOptionId:'b',
    explanation:'Salomón reinó cuarenta años en Jerusalén sobre todo Israel (1 Reyes 11:42).', bibleReference:'1 Reyes 11:42' },
  { id:'dq-hist-es-007', questionText:'¿Qué profetisa sirvió como juez en Israel antes de los reyes?', categoryId:'historia', categoryName:'Historia de Israel', difficulty:'medium', language:'es',
    options:[{id:'a',text:'Ana'},{id:'b',text:'Rut'},{id:'c',text:'Débora'},{id:'d',text:'Ester'}], correctOptionId:'c',
    explanation:'Débora era profetisa y juez; dirigió a Israel junto a Barac contra Sísara (Jueces 4-5).', bibleReference:'Jueces 4:4-5' },
  { id:'dq-hist-es-008', questionText:'¿Cómo se llamaba la suegra de Rut, a quien ella se negó a dejar?', categoryId:'historia', categoryName:'Historia de Israel', difficulty:'medium', language:'es',
    options:[{id:'a',text:'Ana'},{id:'b',text:'Noemí'},{id:'c',text:'Ester'},{id:'d',text:'Débora'}], correctOptionId:'b',
    explanation:'Rut dijo a Noemí: "Tu pueblo será mi pueblo, y tu Dios mi Dios" (Rut 1:16).', bibleReference:'Rut 1:16' },
  { id:'dq-hist-es-009', questionText:'¿Con qué objeto mató Sansón a mil filisteos?', categoryId:'historia', categoryName:'Historia de Israel', difficulty:'medium', language:'es',
    options:[{id:'a',text:'Una espada'},{id:'b',text:'Una quijada de asno'},{id:'c',text:'Una lanza'},{id:'d',text:'Sus propias manos'}], correctOptionId:'b',
    explanation:'Sansón halló una quijada de asno fresca y con ella mató a mil hombres (Jueces 15:15).', bibleReference:'Jueces 15:15' },
  { id:'dq-hist-es-010', questionText:'¿Qué rey de Babilonia destruyó el templo de Salomón?', categoryId:'historia', categoryName:'Historia de Israel', difficulty:'medium', language:'es',
    options:[{id:'a',text:'Ciro'},{id:'b',text:'Darío'},{id:'c',text:'Nabucodonosor'},{id:'d',text:'Jerjes'}], correctOptionId:'c',
    explanation:'Nabucodonosor II destruyó Jerusalén y el templo en 586 a.C. y llevó al pueblo cautivo (2 Reyes 25).', bibleReference:'2 Reyes 25:8-9' },
  // DIFÍCIL
  { id:'dq-hist-es-011', questionText:'¿Cuántos años duró el exilio del pueblo de Judá en Babilonia?', categoryId:'historia', categoryName:'Historia de Israel', difficulty:'hard', language:'es',
    options:[{id:'a',text:'40 años'},{id:'b',text:'70 años'},{id:'c',text:'100 años'},{id:'d',text:'400 años'}], correctOptionId:'b',
    explanation:'Jeremías profetizó 70 años de cautiverio (Jeremías 29:10), lo cual se cumplió con el decreto de Ciro.', bibleReference:'Jeremías 29:10' },
  { id:'dq-hist-es-012', questionText:'¿Qué profeta confrontó al rey Acab y desafió a los profetas de Baal en el Monte Carmelo?', categoryId:'historia', categoryName:'Historia de Israel', difficulty:'hard', language:'es',
    options:[{id:'a',text:'Isaías'},{id:'b',text:'Elías'},{id:'c',text:'Elimelec'},{id:'d',text:'Jeremías'}], correctOptionId:'b',
    explanation:'Elías desafió a 450 profetas de Baal; Dios envió fuego del cielo sobre su sacrificio (1 Reyes 18:38).', bibleReference:'1 Reyes 18:38' },
  { id:'dq-hist-es-013', questionText:'¿Cuántas tribus formaron el Reino del Norte (Israel) tras la división?', categoryId:'historia', categoryName:'Historia de Israel', difficulty:'hard', language:'es',
    options:[{id:'a',text:'2'},{id:'b',text:'5'},{id:'c',text:'10'},{id:'d',text:'12'}], correctOptionId:'c',
    explanation:'Tras la muerte de Salomón, 10 tribus siguieron a Jeroboam y solo Judá y Benjamín quedaron con Roboam.', bibleReference:'1 Reyes 12:20' },
  { id:'dq-hist-es-014', questionText:'¿Quién fue el último rey de Judá antes de la conquista babilónica?', categoryId:'historia', categoryName:'Historia de Israel', difficulty:'hard', language:'es',
    options:[{id:'a',text:'Ezequías'},{id:'b',text:'Josías'},{id:'c',text:'Sedequías'},{id:'d',text:'Joacim'}], correctOptionId:'c',
    explanation:'Sedequías fue el último rey; Nabucodonosor lo capturó y destruyó Jerusalén (2 Reyes 25:7).', bibleReference:'2 Reyes 25:2-7' },
  { id:'dq-hist-es-015', questionText:'¿En qué libro bíblico se relata la reconstrucción de los muros de Jerusalén?', categoryId:'historia', categoryName:'Historia de Israel', difficulty:'hard', language:'es',
    options:[{id:'a',text:'Esdras'},{id:'b',text:'Nehemías'},{id:'c',text:'Ageo'},{id:'d',text:'Zacarías'}], correctOptionId:'b',
    explanation:'Nehemías dirigió la reconstrucción de los muros en 52 días (Nehemías 2-6).', bibleReference:'Nehemías 6:15' },
];

// ═══════════════════════════════════════════════════════════════
// ✨ MILAGROS DE JESÚS
// ═══════════════════════════════════════════════════════════════
export const QUESTIONS_MILAGROS_ES: DuelQuestion[] = [
  { id:'dq-mil-es-001', questionText:'¿Cuál fue el primer milagro de Jesús según el Evangelio de Juan?', categoryId:'milagros', categoryName:'Milagros de Jesús', difficulty:'easy', language:'es',
    options:[{id:'a',text:'Sanar a un ciego'},{id:'b',text:'Convertir el agua en vino en Caná'},{id:'c',text:'Caminar sobre el agua'},{id:'d',text:'Resucitar a Lázaro'}], correctOptionId:'b',
    explanation:'En una boda en Caná de Galilea, Jesús convirtió el agua en vino, manifestando su gloria (Juan 2:1-11).', bibleReference:'Juan 2:1-11' },
  { id:'dq-mil-es-002', questionText:'¿A cuántas personas alimentó Jesús con cinco panes y dos peces?', categoryId:'milagros', categoryName:'Milagros de Jesús', difficulty:'easy', language:'es',
    options:[{id:'a',text:'500'},{id:'b',text:'1000'},{id:'c',text:'3000'},{id:'d',text:'5000 hombres, sin contar mujeres y niños'}], correctOptionId:'d',
    explanation:'Sobraron 12 cestas llenas después de que todos comieron. Aparece en los cuatro evangelios (Mateo 14:17-21).', bibleReference:'Mateo 14:17-21' },
  { id:'dq-mil-es-003', questionText:'¿A quién resucitó Jesús en Betania después de cuatro días en la tumba?', categoryId:'milagros', categoryName:'Milagros de Jesús', difficulty:'easy', language:'es',
    options:[{id:'a',text:'Tabita'},{id:'b',text:'La hija de Jairo'},{id:'c',text:'Lázaro'},{id:'d',text:'El hijo de la viuda de Naín'}], correctOptionId:'c',
    explanation:'Lázaro, hermano de María y Marta, llevaba cuatro días muerto cuando Jesús lo llamó fuera de la tumba (Juan 11:43-44).', bibleReference:'Juan 11:43-44' },
  { id:'dq-mil-es-004', questionText:'¿Cómo sanó Jesús a un ciego en Juan 9?', categoryId:'milagros', categoryName:'Milagros de Jesús', difficulty:'easy', language:'es',
    options:[{id:'a',text:'Le dijo que fuera a Siloé'},{id:'b',text:'Tocó sus ojos'},{id:'c',text:'Hizo lodo con saliva, lo puso en sus ojos y le mandó lavarse en Siloé'},{id:'d',text:'Solo oró'}], correctOptionId:'c',
    explanation:'Jesús hizo lodo, lo untó en los ojos del ciego y le dijo: "Ve a lavarte en el estanque de Siloé" (Juan 9:6-7).', bibleReference:'Juan 9:6-7' },
  { id:'dq-mil-es-005', questionText:'¿Qué enfermedad sanó Jesús en diez hombres cerca de Jerusalén?', categoryId:'milagros', categoryName:'Milagros de Jesús', difficulty:'easy', language:'es',
    options:[{id:'a',text:'Peste'},{id:'b',text:'Lepra'},{id:'c',text:'Ceguera'},{id:'d',text:'Parálisis'}], correctOptionId:'b',
    explanation:'Diez leprosos clamaron a Jesús. Él les dijo que se mostraran a los sacerdotes y fueron limpiados (Lucas 17:12-14).', bibleReference:'Lucas 17:12-14' },
];

// ═══════════════════════════════════════════════════════════════
// 📖 PARÁBOLAS DE JESÚS
// ═══════════════════════════════════════════════════════════════
export const QUESTIONS_PARABOLAS_ES: DuelQuestion[] = [
  { id:'dq-par-es-001', questionText:'En la parábola del hijo pródigo, ¿quién perdonó y recibió al hijo con alegría?', categoryId:'parabolas', categoryName:'Parábolas de Jesús', difficulty:'easy', language:'es',
    options:[{id:'a',text:'Su hermano mayor'},{id:'b',text:'El rey'},{id:'c',text:'Su padre'},{id:'d',text:'Un sacerdote'}], correctOptionId:'c',
    explanation:'Su padre corrió, se echó sobre su cuello y le besó, y ordenó una gran fiesta (Lucas 15:20-22).', bibleReference:'Lucas 15:20-22' },
  { id:'dq-par-es-002', questionText:'En la parábola del grano de mostaza, ¿en qué se convierte esta pequeña semilla?', categoryId:'parabolas', categoryName:'Parábolas de Jesús', difficulty:'easy', language:'es',
    options:[{id:'a',text:'Un bambú'},{id:'b',text:'La mayor de las hortalizas, casi un árbol'},{id:'c',text:'Maleza'},{id:'d',text:'Un arbusto invisible'}], correctOptionId:'b',
    explanation:'La mostaza es la más pequeña de las semillas, pero se hace un árbol donde las aves anidan (Mateo 13:31-32).', bibleReference:'Mateo 13:31-32' },
];

// ═══════════════════════════════════════════════════════════════
// 👩 MUJERES DE LA BIBLIA
// ═══════════════════════════════════════════════════════════════
export const QUESTIONS_MUJERES_ES: DuelQuestion[] = [
  { id:'dq-muj-es-001', questionText:'¿Qué mujer dijo a su suegra: "Dondequiera que tú fueres, iré yo; tu pueblo será mi pueblo"?', categoryId:'mujeres', categoryName:'Mujeres de la Biblia', difficulty:'easy', language:'es',
    options:[{id:'a',text:'Ester'},{id:'b',text:'Rut'},{id:'c',text:'Débora'},{id:'d',text:'Ana'}], correctOptionId:'b',
    explanation:'Rut le dijo esto a Noemí, mostrando una fidelidad ejemplar (Rut 1:16).', bibleReference:'Rut 1:16' },
  { id:'dq-muj-es-002', questionText:'¿Qué mujer salvó al pueblo judío de un complot de exterminio en Persia?', categoryId:'mujeres', categoryName:'Mujeres de la Biblia', difficulty:'easy', language:'es',
    options:[{id:'a',text:'Débora'},{id:'b',text:'Rut'},{id:'c',text:'Ester'},{id:'d',text:'Ana'}], correctOptionId:'c',
    explanation:'La reina Ester arriesgó su vida presentándose ante el rey Asuero para interceder por su pueblo (Ester 4:14).', bibleReference:'Ester 4:14' },
];

// ═══════════════════════════════════════════════════════════════
// 📜 EPÍSTOLAS DE PABLO
// ═══════════════════════════════════════════════════════════════
export const QUESTIONS_EPISTOLAS_ES: DuelQuestion[] = [
  { id:'dq-epi-es-001', questionText:'¿En qué carta dice Pablo "Todo lo puedo en Cristo que me fortalece"?', categoryId:'cartas-pablo', categoryName:'Epístolas de Pablo', difficulty:'easy', language:'es',
    options:[{id:'a',text:'Romanos'},{id:'b',text:'Efesios'},{id:'c',text:'Filipenses'},{id:'d',text:'Colosenses'}], correctOptionId:'c',
    explanation:'Filipenses 4:13: "Todo lo puedo en Cristo que me fortalece". Pablo lo escribió desde la prisión.', bibleReference:'Filipenses 4:13' },
  { id:'dq-epi-es-002', questionText:'¿Cuántas cartas se atribuyen a Pablo en el Nuevo Testamento?', categoryId:'cartas-pablo', categoryName:'Epístolas de Pablo', difficulty:'easy', language:'es',
    options:[{id:'a',text:'7'},{id:'b',text:'10'},{id:'c',text:'13'},{id:'d',text:'15'}], correctOptionId:'c',
    explanation:'Pablo escribió 13 cartas: Romanos, 1-2 Corintios, Gálatas, Efesios, Filipenses, Colosenses, 1-2 Tesalonicenses, 1-2 Timoteo, Tito y Filemón.', bibleReference:'Romanos 1:1' },
];

// Combine all Spanish questions
export const ALL_QUESTIONS_ES: DuelQuestion[] = [
  ...QUESTIONS_PENTATEUCO_ES,
  ...QUESTIONS_HISTORIA_ES,
  ...QUESTIONS_MILAGROS_ES,
  ...QUESTIONS_PARABOLAS_ES,
  ...QUESTIONS_MUJERES_ES,
  ...QUESTIONS_EPISTOLAS_ES,
];
