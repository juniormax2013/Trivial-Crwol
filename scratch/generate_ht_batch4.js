const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, 'fr_to_translate_inverse_batch4.json');
const outputPath = path.join(__dirname, 'ht_translated_inverse_batch4.json');

const sourceData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

const translations = {
    "dq-pmen-041": {
        questionText: "Nan Joèl 2, ki gwo pwomès Bondye te fè pou dènye jou yo konsènan Lespri l?",
        categoryName: "Ti Pwofèt",
        options: [
            { id: "a", text: "Li pral vide Lespri l sou tout moun" },
            { id: "b", text: "Li pral bay granmoun yo sajès" },
            { id: "c", text: "Li pral voye pwofèt nan Izrayèl" },
            { id: "d", text: "Li pral plen Tanp lan ak glwa li" }
        ],
        explanation: "« M'ap vide Lespri mwen sou tout moun » (Joèl 2:28) — sa te akonpli nan jou Pannkot la dapre Travay 2:17."
    },
    "dq-pmen-042": {
        questionText: "Zakarie 9:9 pwofetize wa a pral vini nan Jerizalèm sou kisa li monte?",
        categoryName: "Ti Pwofèt",
        options: [
            { id: "a", text: "Yon chwal blan" },
            { id: "b", text: "Yon chamo" },
            { id: "c", text: "Yon ti bourik" },
            { id: "d", text: "Yon cha dife" }
        ],
        explanation: "« Li gen imilite, li moute sou yon bourik, sou yon jenn ti bourik » — sa te akonpli lè Jezi t'ap antre nan Jerizalèm (Matye 21:5)."
    },
    "dq-cpab-046": {
        questionText: "Nan ki vil Pòl te ekri yon lèt sou jistifikasyon pa lafwa?",
        categoryName: "Lèt Pòl yo",
        options: [
            { id: "a", text: "Efèz" },
            { id: "b", text: "Korent" },
            { id: "c", text: "Wòm" },
            { id: "d", text: "Filipi" }
        ],
        explanation: "Lèt pou moun Wòm yo devlope doktrin santral jistifikasyon pa lafwa sèlman (Women 1:17)."
    },
    "dq-cpab-047": {
        questionText: "Konbyen lèt Pòl te ekri pou moun Korent yo?",
        categoryName: "Lèt Pòl yo",
        options: [
            { id: "a", text: "1" },
            { id: "b", text: "2" },
            { id: "c", text: "3" },
            { id: "d", text: "4" }
        ],
        explanation: "Kanon Nouvo Testaman an gen de lèt Pòl pou moun Korent yo: 1 Korentyen ak 2 Korentyen."
    },
    "dq-cpab-048": {
        questionText: "Ki lèt Pòl yo rele souvan « Magna Carta » libète kretyen an?",
        categoryName: "Lèt Pòl yo",
        options: [
            { id: "a", text: "Women" },
            { id: "b", text: "Galat" },
            { id: "c", text: "Efezyen" },
            { id: "d", text: "Kolosyen" }
        ],
        explanation: "Lèt Galat la defann libète kont Lalwa Moyiz la pa mwayen gras la: « Se pou nou te ka lib kifè Kris la delivre nou » (Galat 5:1)."
    },
    "dq-cpab-049": {
        questionText: "Ki chapit yo rele « chapit lanmou » nan lèt Pòl yo?",
        categoryName: "Lèt Pòl yo",
        options: [
            { id: "a", text: "Women 8" },
            { id: "b", text: "Efezyen 6" },
            { id: "c", text: "1 Korentyen 13" },
            { id: "d", text: "Filipyen 4" }
        ],
        explanation: "1 Korentyen 13 se bèl « im lanmou » Pòl la: « Si m pa gen lanmou, mwen pa anyen. »"
    },
    "dq-cpab-050": {
        questionText: "Nan Efezyen 6, Pòl dekri zam espirityèl kretyen an. Ki sèl zam ofansif li site?",
        categoryName: "Lèt Pòl yo",
        options: [
            { id: "a", text: "Bwakliye lafwa a" },
            { id: "b", text: "Nepe Lespri a — ki se Pawòl Bondye a" },
            { id: "c", text: "Plastwon jistis la" },
            { id: "d", text: "Kas delivrans lan" }
        ],
        explanation: "« Nepe Lespri a, ki se pawòl Bondye a » se sèl zam ofansif nan tout zam yo (Efezyen 6:17)."
    },
    "dq-cpab-051": {
        questionText: "Nan 1 Korentyen 15, Pòl bay lis kote moun te wè Jezi apre l fin resisite. Konbyen moun ki te wè l ansanm yon sèl fwa?",
        categoryName: "Lèt Pòl yo",
        options: [
            { id: "a", text: "12" },
            { id: "b", text: "120" },
            { id: "c", text: "500" },
            { id: "d", text: "3000" }
        ],
        explanation: "« Apre sa, li te parèt devan plis pase senksan (500) frè ansanm » (1 Korentyen 15:6)."
    },
    "dq-cpab-052": {
        questionText: "Ki tèm santral lèt pou Kolosyen yo konsènan Kris?",
        categoryName: "Lèt Pòl yo",
        options: [
            { id: "a", text: "Rezirèksyon k ap vini an" },
            { id: "b", text: "Siperyorite ak plenitid Kris la" },
            { id: "c", text: "Jistifikasyon pa lafwa" },
            { id: "d", text: "Don espirityèl yo" }
        ],
        explanation: "Kolosyen 1:15-20 prezante Kris kòm premye pitit nan tout kreyasyon an, e se nan li tout plenitid Bondye a rete."
    },
    "dq-cpab-053": {
        questionText: "Nan ki sans Pòl sèvi ak mo « kenoz » (kenosis) pou dekri Kris nan Filipyen 2?",
        categoryName: "Lèt Pòl yo",
        options: [
            { id: "a", text: "Kris te raba tèt li lè l te pran fòm yon sèvitè" },
            { id: "b", text: "Kris te abandone divinite li" },
            { id: "c", text: "Kris te sispann egziste pandan twa jou" },
            { id: "d", text: "Kris te chwazi inyorans total" }
        ],
        explanation: "« Li te raba tèt li (ekenosen), li te pran fòm yon domestik » (Filipyen 2:7). Kris te kenbe divinite li pandan l te vin moun nan."
    },
    "dq-cpab-054": {
        questionText: "Kisa doktrin Pòl la sou « jistifikasyon pa lafwa » vle di nan Women 5:1?",
        categoryName: "Lèt Pòl yo",
        options: [
            { id: "a", text: "Travay nou fè rann nou jis devan Bondye" },
            { id: "b", text: "Bondye deklare nou jis gras ak lafwa nan Kris la" },
            { id: "c", text: "Lafwa ak travay ansanm sove nou" },
            { id: "d", text: "Se batèm sèlman ki jistifye nou" }
        ],
        explanation: "« Koulye a, paske nou gen lafwa, Bondye fè nou gras, nou gen lapè ak Bondye gremesi Seyè nou an, Jezikri » (Women 5:1)."
    },
    "dq-cpab-055": {
        questionText: "Nan Galat 5, ki « fwi Lespri a » ki kòmanse lis Pòl la?",
        categoryName: "Lèt Pòl yo",
        options: [
            { id: "a", text: "Lafwa, espwa, charite" },
            { id: "b", text: "Lanmou, kè kontan, lapè" },
            { id: "c", text: "Sajès, konesans, lafwa" },
            { id: "d", text: "Imilite, pasyans, dousè" }
        ],
        explanation: "Galat 5:22 bay lis sa a: lanmou, kè kontan, lapè, pasyans, jantiyès, bon kè, lafwa, dousè, kontwòl tèt nou."
    },
    "dq-cpab-056": {
        questionText: "Nan 2 Korentyen 12, ki « pikan nan kò » Pòl mansyone?",
        categoryName: "Lèt Pòl yo",
        options: [
            { id: "a", text: "Yon peche k ap repete" },
            { id: "b", text: "Yon soufrans oswa feblès fizik pou l pa t gonfle ak lògèy" },
            { id: "c", text: "Yon lènmi ki t ap pèsekite l" },
            { id: "d", text: "Yon move doktrin nan legliz li a" }
        ],
        explanation: "Pòl pale de yon « pikan » (yon feblès li pa t presize) Bondye te refize wete — « fòs mwen parèt pi byen lè ou fèb » (2 Ko 12:9)."
    },
    "dq-cgen-021": {
        questionText: "Dapre 1 Jan 4:8, ki nati fondamantal Bondye?",
        categoryName: "Lèt Jeneral yo",
        options: [
            { id: "a", text: "Bondye se limyè" },
            { id: "b", text: "Bondye se lanmou" },
            { id: "c", text: "Bondye se dife" },
            { id: "d", text: "Bondye se lespri" }
        ],
        explanation: "« Bondye se lanmou » (1 Jan 4:8) — yon deklarasyon fondamantal sobre idantite Bondye."
    },
    "dq-cgen-022": {
        questionText: "Jak 2:17 anseye ke lafwa san travay se kisa?",
        categoryName: "Lèt Jeneral yo",
        options: [
            { id: "a", text: "Li pa sifi" },
            { id: "b", text: "Li mouri" },
            { id: "c", text: "Li fèb" },
            { id: "d", text: "Li pa konplè" }
        ],
        explanation: "« Se menm jan an tou pou lafwa: si li pa mache ansanm ak gwo travay, li mouri nan fon kè li » (Jak 2:17)."
    },
    "dq-cgen-023": {
        questionText: "Konbyen lèt Pyè ki genyen nan Nouvo Testaman an?",
        categoryName: "Lèt Jeneral yo",
        options: [
            { id: "a", text: "1" },
            { id: "b", text: "2" },
            { id: "c", text: "3" },
            { id: "d", text: "4" }
        ],
        explanation: "Nouvo Testaman an gen 1 Pyè ak 2 Pyè, de lèt apot Simon Pyè te ekri."
    },
    "dq-cgen-024": {
        questionText: "Jid ankouraje kwayan yo pou yo goumen pou ki kòz?",
        categoryName: "Lèt Jeneral yo",
        options: [
            { id: "a", text: "Lapè nan Legliz la" },
            { id: "b", text: "Lafwa Bondye te bay pèp li a yon fwa pou tout" },
            { id: "c", text: "Inite kretyen yo" },
            { id: "d", text: "Obejisans ak lidè yo" }
        ],
        explanation: "« Goumen pou defann lafwa Bondye te bay moun pa l yo, yon fwa pou tout » (Jid 1:3)."
    },
    "dq-cgen-025": {
        questionText: "Nan 1 Pyè 5:8, ak kisa yo konpare Satan?",
        categoryName: "Lèt Jeneral yo",
        options: [
            { id: "a", text: "Yon sèpan k ap rale" },
            { id: "b", text: "Yon lyon k ap gwonde" },
            { id: "c", text: "Yon lou k ap devore" },
            { id: "d", text: "Yon malfini k ap plonje sou bèt li" }
        ],
        explanation: "« Dyab la, lènmi nou an, ap pwonmennen tankou yon lyon k'ap gwonde, l'ap chache moun pou l' devore » (1 Pyè 5:8)."
    },
    "dq-cgen-026": {
        questionText: "Dapre 2 Pyè 3:8, yon sèl jou se tankou kisa pou Seyè a?",
        categoryName: "Lèt Jeneral yo",
        options: [
            { id: "a", text: "Yon èdtan" },
            { id: "b", text: "Yon ane" },
            { id: "c", text: "Mil (1000) ane" },
            { id: "d", text: "Yon letènite" }
        ],
        explanation: "« Pou Seyè a, yon sèl jou se tankou mil (1000) ane, mil ane se tankou yon sèl jou » (2 Pyè 3:8)."
    },
    "dq-cgen-027": {
        questionText: "1 Jan 1:9 pwomèt ke si nou konfese peche nou yo, Bondye fidèl pou l fè kisa?",
        categoryName: "Lèt Jeneral yo",
        options: [
            { id: "a", text: "Beni nou" },
            { id: "b", text: "Padone nou epi netwaye nou" },
            { id: "c", text: "Ban nou lapè" },
            { id: "d", text: "Ban nou lavi etènèl" }
        ],
        explanation: "« Men, si nou rekonèt peche nou yo devan Bondye, li va padone nou peche nou yo, la netwaye nou anba tout sa ki mal » (1 Jan 1:9)."
    },
    "dq-cgen-028": {
        questionText: "Ki doktrin nan 2 Pyè 1:20 ki fondamantal pou konprann Bib la?",
        categoryName: "Lèt Jeneral yo",
        options: [
            { id: "a", text: "Tout pwofesi se senbòl" },
            { id: "b", text: "Pèsonn pa ka bay pwofesi ki nan Liv la pwòp entèpretasyon pa li" },
            { id: "c", text: "Se apot yo sèlman ki konprann pwofesi yo" },
            { id: "d", text: "Pwofesi yo akonpli nan Izrayèl sèlman" }
        ],
        explanation: "« Pèsonn pa ka bay pwofesi ki nan Liv la pwòp entèpretasyon pa li » (2 Pyè 1:20) — sa vle di pwofesi soti nan Bondye."
    },
    "dq-cgen-029": {
        questionText: "Nan Jid 9, ki akanj ki t ap diskite ak Satan konsènan kò Moyiz?",
        categoryName: "Lèt Jeneral yo",
        options: [
            { id: "a", text: "Gabriyèl" },
            { id: "b", text: "Rafayèl" },
            { id: "c", text: "Michèl" },
            { id: "d", text: "Iriyèl" }
        ],
        explanation: "Jid 9 mansyone lè akanj Michèl t'ap diskite ak dyab la pou kò Moyiz."
    },
    "dq-cgen-030": {
        questionText: "Jak 1:2-4 anseye ke eprèv yo pwodui kisa nan kwayan an?",
        categoryName: "Lèt Jeneral yo",
        options: [
            { id: "a", text: "Richès espirityèl" },
            { id: "b", text: "Pasyans ki mennen nan pèfeksyon" },
            { id: "c", text: "Geri moun mirakilezman" },
            { id: "d", text: "Sajès pwofetik" }
        ],
        explanation: "« Lè lafwa nou pase anba eprèv, sa ban nou pasyans... kite pasyans lan travay nèt nan nou » (Jak 1:3-4)."
    },
    "dq-cgen-031": {
        questionText: "Hébreux 4:12 dekri Pawòl Bondye a tankou kisa?",
        categoryName: "Lèt Jeneral yo",
        options: [
            { id: "a", text: "Yon medikaman pou nanm lan" },
            { id: "b", text: "Li vivan, li gen pouvwa, li pi file pase yon nepe de bò" },
            { id: "c", text: "Yon gid pou lavi a" },
            { id: "d", text: "Yon lèt lanmou" }
        ],
        explanation: "« Pawòl Bondye a vivan, li gen pouvwa, li pi file pase yon nepe de bò » (Ebre 4:12)."
    },
    "dq-cgen-032": {
        questionText: "Dapre Hébreux 11:1, kisa lafwa ye?",
        categoryName: "Lèt Jeneral yo",
        options: [
            { id: "a", text: "Yon santiman espwa" },
            { id: "b", text: "Asirans nou genyen sou sa n'ap tann lan, prèv sou sa nou pa wè" },
            { id: "c", text: "Yon kwayans nan sa ki enposib" },
            { id: "d", text: "Yon obeyisans avèg" }
        ],
        explanation: "« Gen lafwa, se sèten nou gen asirans sa n'ap tann lan gen pou rive, se sèten nou konnen sa nou pa wè a egziste tout bon vre » (Ebre 11:1)."
    },
    "dq-cgen-033": {
        questionText: "Nan Hébreux, Jezi prezante kòm yon granprèt dapre lòd ki moun?",
        categoryName: "Lèt Jeneral yo",
        options: [
            { id: "a", text: "Arawon" },
            { id: "b", text: "Mèlkisedèk" },
            { id: "c", text: "Moyiz" },
            { id: "d", text: "Levit yo" }
        ],
        explanation: "Hébreux 5:6 — « Ou se prèt pou tout tan menm jan ak Mèlkisedèk. »"
    },
    "dq-cgen-034": {
        questionText: "Dapre 1 Jan 1:5, Bondye se kisa?",
        categoryName: "Lèt Jeneral yo",
        options: [
            { id: "a", text: "Lanmou" },
            { id: "b", text: "Limyè" },
            { id: "c", text: "Lavi" },
            { id: "d", text: "Lafwa" }
        ],
        explanation: "« Bondye se limyè. Pa gen okenn fènwa nan li » (1 Jan 1:5)."
    },
    "dq-cgen-035": {
        questionText: "Jak 5:16 anseye ke lapriyè yon moun ki jis gen kisa?",
        categoryName: "Lèt Jeneral yo",
        options: [
            { id: "a", text: "Yon repons rapid" },
            { id: "b", text: "Gwo pouvwa ak anpil efikasite" },
            { id: "c", text: "Yon bèl mizik pou Bondye" },
            { id: "d", text: "Limit devan peche" }
        ],
        explanation: "« Lè yon moun ki jis ap lapriyè, lapriyè sa a gen gwo pouvwa » (Jak 5:16)."
    },
    "dq-cgen-036": {
        questionText: "Nan 1 Pyè 2:9, ki jan yo rele pèp Bondye a?",
        categoryName: "Lèt Jeneral yo",
        options: [
            { id: "a", text: "Yon pèp ki pèdi" },
            { id: "b", text: "Yon ras yo chwazi, yon pèp prèt k'ap sèvi wa a" },
            { id: "c", text: "Moun ki soti nan fènwa" },
            { id: "d", text: "Pitit gason Abraram yo" }
        ],
        explanation: "« Nou menm, nou se yon ras Bondye chwazi, yon bann prèt k'ap sèvi Wa a, yon nasyon k'ap viv apa pou Bondye » (1 Pyè 2:9)."
    },
    "dq-cgen-037": {
        questionText: "Dapre Hébreux 12:2, sou ki moun nou dwe fikse je nou?",
        categoryName: "Lèt Jeneral yo",
        options: [
            { id: "a", text: "Moyiz" },
            { id: "b", text: "Jezi, ki mèt lafwa nou e ki fè l' pafè" },
            { id: "c", text: "Apot yo" },
            { id: "d", text: "Lwa Moyiz la" }
        ],
        explanation: "« Ann fikse je nou sou Jezi. Se li menm ki mèt lafwa nou, se li menm ki kenbe lafwa nou jouk sa kaba » (Ebre 12:2)."
    },
    "dq-cgen-038": {
        questionText: "1 Jan 3:1 mande pou nou gade ki gwo lanmou Papa a gen pou nou. Ki jan yo rele nou?",
        categoryName: "Lèt Jeneral yo",
        options: [
            { id: "a", text: "Sèvitè Bondye" },
            { id: "b", text: "Pitit Bondye" },
            { id: "c", text: "Zanmi Kris" },
            { id: "d", text: "Eritye monn lan" }
        ],
        explanation: "« Gade sa Papa a renmen nou non! Li sitèlman renmen nou, li rele nou pitit li » (1 Jan 3:1)."
    },
    "dq-cgen-039": {
        questionText: "Dapre Jak 4:7, kisa nou dwe fè pou dyab la kouri pou nou?",
        categoryName: "Lèt Jeneral yo",
        options: [
            { id: "a", text: "Kouri pou li" },
            { id: "b", text: "Soumèt devan Bondye epi kenbe tèt ak dyab la" },
            { id: "c", text: "Kriye byen fò" },
            { id: "d", text: "Fè jèn sèlman" }
        ],
        explanation: "« Soumèt nou devan Bondye. Kenbe tèt ak dyab la, la kouri pou nou » (Jak 4:7)."
    },
    "dq-cgen-040": {
        questionText: "Nan 2 Jan, kisa apot la di sou moun ki pa mache nan verite a?",
        categoryName: "Lèt Jeneral yo",
        options: [
            { id: "a", text: "Resevwa yo lakay nou" },
            { id: "b", text: "Pa resevwa yo lakay nou ni di yo bonjou" },
            { id: "c", text: "Preche yo chak jou" },
            { id: "d", text: "Inyore yo nèt" }
        ],
        explanation: "« Si yon moun vin bò kote nou san l' pa pote menm doktrin sa a, pa resevwa l' lakay nou. Pa menm di l' bonjou » (2 Jan 1:10)."
    },
    "dq-pent-031": {
        questionText: "Konbyen jou ak nwit Moyiz te pase sou mòn Sinayi a pou l resevwa lwa yo?",
        categoryName: "Pentatek",
        options: [
            { id: "a", text: "7" },
            { id: "b", text: "12" },
            { id: "c", text: "40" },
            { id: "d", text: "100" }
        ],
        explanation: "Egzòd 24:18 — « Moyiz moute sou mòn lan... li pase karant (40) jou ak karant nwit sou mòn lan. »"
    },
    "dq-pent-032": {
        questionText: "Ki dezyèm liv nan Bib la ki rakonte jan Izrayelit yo te soti nan peyi Lejip?",
        categoryName: "Pentatek",
        options: [
            { id: "a", text: "Jenèz" },
            { id: "b", text: "Egzòd" },
            { id: "c", text: "Levitik" },
            { id: "d", text: "Nonb" }
        ],
        explanation: "Liv Egzòd la rakonte jan Bondye te delivre pèp Izrayèl la anba esklavaj nan peyi Lejip."
    },
    "dq-pent-033": {
        questionText: "Ki pwofèt ki te gen yon bourik ki te pale avè l?",
        categoryName: "Pentatek",
        options: [
            { id: "a", text: "Balaram" },
            { id: "b", text: "Moyiz" },
            { id: "c", text: "Arawon" },
            { id: "d", text: "Jozue" }
        ],
        explanation: "Nonb 22:28 — « Seyè a louvri bouch bourik la, bourik la di Balaram... »"
    },
    "dq-pent-034": {
        questionText: "Kisa non liv « Levitik » vle di prensipalman?",
        categoryName: "Pentatek",
        options: [
            { id: "a", text: "Liv soti a" },
            { id: "b", text: "Liv ki konsène Levit yo (prèt yo)" },
            { id: "c", text: "Liv kòmansman an" },
            { id: "d", text: "Liv vwayaj yo" }
        ],
        explanation: "Levitik konsantre sou lwa pou sèvis nan Tanp lan ak devwa prèt yo ki soti nan tribi Levi a."
    },
    "dq-pent-035": {
        questionText: "Ki non dezyèm pitit gason Adan ak Èv ki te mouri anba men frè li?",
        categoryName: "Pentatek",
        options: [
            { id: "a", text: "Kayen" },
            { id: "b", text: "Abèl" },
            { id: "c", text: "Sèt" },
            { id: "d", text: "Enòk" }
        ],
        explanation: "Jenèz 4:8 — « Kayen leve sou Abèl, frè li a, li touye l. »"
    },
    "dq-pent-036": {
        questionText: "Ki kote gwo fò won moun te vle bati pou rive nan syèl la te ye?",
        categoryName: "Pentatek",
        options: [
            { id: "a", text: "Wòm" },
            { id: "b", text: "Babèl" },
            { id: "c", text: "Sodòm" },
            { id: "d", text: "Inif" }
        ],
        explanation: "Jenèz 11:4,9 — « Ann bati yon gwo lavil ak yon gwo fò won ki rive jouk nan syèl la... Se poutèt sa yo rele lavil la Babèl. »"
    },
    "dq-pent-037": {
        questionText: "Ki moun ki te bati lach la pou sove fanmi li anba delij la?",
        categoryName: "Pentatek",
        options: [
            { id: "a", text: "Abraram" },
            { id: "b", text: "Noe" },
            { id: "c", text: "Moyiz" },
            { id: "d", text: "Lòt" }
        ],
        explanation: "Jenèz 6:13-14 — Bondye di Noe: « Fè yon gwo batiman pou ou ak bwa sèd. »"
    },
    "dq-pent-038": {
        questionText: "Konbyen tribi ki te gen nan pèp Izrayèl la?",
        categoryName: "Pentatek",
        options: [
            { id: "a", text: "7" },
            { id: "b", text: "10" },
            { id: "c", text: "12" },
            { id: "d", text: "40" }
        ],
        explanation: "Izrayèl te gen 12 tribi ki te soti nan 12 pitit gason Jakòb yo."
    },
    "dq-pent-039": {
        questionText: "Ki jan yo rele dènye liv nan Pentatek la (senk premye liv Moyiz yo)?",
        categoryName: "Pentatek",
        options: [
            { id: "a", text: "Nonb" },
            { id: "b", text: "Deteronòm" },
            { id: "c", text: "Jozue" },
            { id: "d", text: "Levitik" }
        ],
        explanation: "Deteronòm se senkyèm ak dènye liv nan Pentatek la."
    },
    "dq-pent-040": {
        questionText: "Ki non mòn kote Bondye te bay Moyiz dis kòmandman yo?",
        categoryName: "Pentatek",
        options: [
            { id: "a", text: "Mòn Oliv" },
            { id: "b", text: "Mòn Sinayi" },
            { id: "c", text: "Mòn Nèbo" },
            { id: "d", text: "Mòn Kamèl" }
        ],
        explanation: "Egzòd 19 ak 20 dekri jan Bondye te desann sou mòn Sinayi pou l bay lalwa a."
    },
    "dq-doc-021": {
        questionText: "Kisa doktrin « Enkanasyon » an vle di?",
        categoryName: "Doktrin Kretyen",
        options: [
            { id: "a", text: "Lè yon moun mouri e li tounen yon lòt moun" },
            { id: "b", text: "Pitit Bondye a ki te vin moun tout bon nan lachè" },
            { id: "c", text: "Resisite pami mò yo" },
            { id: "d", text: "Yon vizyon espirityèl sèlman" }
        ],
        explanation: "Jan 1:14 — « Pawòl la te tounen moun... li te rete nan mitan nou. » Se Bondye ki vin moun nan Jezi Kris."
    },
    "dq-doc-022": {
        questionText: "Ki sa doktrin « Sent Trinite » a anseye?",
        categoryName: "Doktrin Kretyen",
        options: [
            { id: "a", text: "Gen twa Bondye diferan" },
            { id: "b", text: "Gen yon sèl Bondye ki egziste nan twa moun: Papa, Pitit ak Lespri Sen" },
            { id: "c", text: "Bondye chanje fòm tanzantan" },
            { id: "d", text: "Se sèl Papa a ki Bondye tout bon" }
        ],
        explanation: "Bib la anseye gen yon sèl Bondye (Deteronòm 6:4), men Papa a se Bondye, Pitit la se Bondye, e Lespri a se Bondye."
    },
    "dq-doc-023": {
        questionText: "Kisa « Jistifikasyon » vle di nan teoloji kretyen?",
        categoryName: "Doktrin Kretyen",
        options: [
            { id: "a", text: "Eseye rann tèt nou bon devan Bondye" },
            { id: "b", text: "Lè Bondye deklare yon moun jis pa mwayen lafwa nan Kris" },
            { id: "c", text: "Yon padon sèlman pou ti peche" },
            { id: "d", text: "Yon pwosesis ki pran tout lavi nou" }
        ],
        explanation: "Women 5:1 — « Paske nou gen lafwa, Bondye fè nou gras (jistifye nou). » Se yon deklarasyon legal kote nou pa koupab ankò."
    },
    "dq-doc-024": {
        questionText: "Kisa « Sanktifikasyon » vle di?",
        categoryName: "Doktrin Kretyen",
        options: [
            { id: "a", text: "Lè nou vin sove pou premye fwa" },
            { id: "b", text: "Pwosesis kote kwayan an vin ap viv apa pou Bondye e l'ap vin pi sen chak jou" },
            { id: "c", text: "Lè nou mouri e n'al nan syèl" },
            { id: "d", text: "Resevwa yon diplòm nan teoloji" }
        ],
        explanation: "1 Tesalonisyen 4:3 — « Sa Bondye vle pou nou, se pou nou viv apa pou li (sanktifikasyon). »"
    },
    "dq-doc-025": {
        questionText: "Kisa doktrin « Depravasyon Total » anseye sou moun?",
        categoryName: "Doktrin Kretyen",
        options: [
            { id: "a", text: "Tout moun se move moun nèt san okenn bon santiman" },
            { id: "b", text: "Peche te touche tout pati nan nati moun nan, sa fè l pa ka sove tèt li" },
            { id: "c", text: "Moun yo bon nan fon kè yo" },
            { id: "d", text: "Sèlman kèk moun ki gen peche" }
        ],
        explanation: "Women 3:10-12, 23 — « Tout moun fè peche. » Peche a gaye nan lespri, nanm ak kò moun."
    },
    "dq-doc-026": {
        questionText: "Kisa « Redanmsyon » vle di nan kontèks biblik la?",
        categoryName: "Doktrin Kretyen",
        options: [
            { id: "a", text: "Bliye tout sa ki pase" },
            { id: "b", text: "Rachte oswa delivre yon moun anba esklavaj peche ak yon pri" },
            { id: "c", text: "Fè yon lòt moun peye pou nou" },
            { id: "d", text: "Resevwa yon kado gratis san sakrifis" }
        ],
        explanation: "Efezyen 1:7 — « Nan li nou gen redansyon pa mwayen san li. » Kris te peye pri a sou kwa a."
    },
    "dq-doc-027": {
        questionText: "Kisa « Medyasyon » Kris la vle di?",
        categoryName: "Doktrin Kretyen",
        options: [
            { id: "a", text: "Kris ap pale ak nou nan vizyon" },
            { id: "b", text: "Kris sèvi kòm entèmedyè ant Bondye ak lèzòm" },
            { id: "c", text: "Kris ap jije nou kounye a" },
            { id: "d", text: "Kris se yon pwofèt sèlman" }
        ],
        explanation: "1 Timote 2:5 — « Gen yon sèl Bondye, epi gen yon sèl entèmedyè ant Bondye ak lèzòm: se Jezikri ki te moun tou. »"
    },
    "dq-doc-028": {
        questionText: "Kisa doktrin « Omnisyans » Bondye a vle di?",
        categoryName: "Doktrin Kretyen",
        options: [
            { id: "a", text: "Bondye gen tout pouvwa" },
            { id: "b", text: "Bondye konnen tout bagay (pase, prezans ak lavni)" },
            { id: "c", text: "Bondye toupatou an menm tan" },
            { id: "d", text: "Bondye pa janm chanje" }
        ],
        explanation: "Sòm 139:1-4 — « Seyè, ou konnen tout sa m'ap fè... ou konnen tou sa m' pral di. »"
    },
    "dq-doc-029": {
        questionText: "Kisa « Souvrenete » Bondye vle di?",
        categoryName: "Doktrin Kretyen",
        options: [
            { id: "a", text: "Bondye se yon wa ki byen lwen nou" },
            { id: "b", text: "Bondye gen kontwòl total sou tout kreyasyon an ak evènman yo" },
            { id: "c", text: "Bondye ap gade nou sèlman" },
            { id: "d", text: "Bondye limite pa volonte moun" }
        ],
        explanation: "Sòm 115:3 — « Bondye nou an nan syèl la. Li fè tou sa li vle. »"
    },
    "dq-doc-030": {
        questionText: "Kisa doktrin « Enspirasyon » Bib la vle di?",
        categoryName: "Doktrin Kretyen",
        options: [
            { id: "a", text: "Bib la se yon bèl liv literati" },
            { id: "b", text: "Se sou souf Bondye tout liv la te ekri pa mwayen moun" },
            { id: "c", text: "Moun yo te gen bon ide sèlman" },
            { id: "d", text: "Se yon liv istwa sèlman" }
        ],
        explanation: "2 Timote 3:16 — « Tou sa ki ekri nan Liv la, se anba souf Bondye yo ekri li. »"
    },
    // Missing questions from batch 4
    "dq-apoc-026": {
        questionText: "Nan konbyen Legliz liv Revelasyon an te voye nan kòmansman an?",
        categoryName: "Apocalypse",
        options: [
            { id: "a", text: "3" },
            { id: "b", text: "5" },
            { id: "c", text: "7" },
            { id: "d", text: "12" }
        ],
        explanation: "Yo te voye sèt lèt yo bay Legliz ki te nan vil sa yo: Efèz, Smid, Pègam, Tyati, Sad, Filadèlfi ak Lawodise (Rev 1:11)."
    },
    "dq-apoc-027": {
        questionText: "Ki bèt ki reprezante Jezi nan Revelasyon chapit 5?",
        categoryName: "Apocalypse",
        options: [
            { id: "a", text: "Yon lyon" },
            { id: "b", text: "Yon ti mouton" },
            { id: "c", text: "Yon malfini" },
            { id: "d", text: "Yon towo bèf" }
        ],
        explanation: "Jezi se « Ti Mouton yo te touye a » — se li menm sèl ki gen dwa louvri woulo liv la (Revelasyon 5:6,12)."
    },
    "dq-apoc-028": {
        questionText: "Kisa Nouvo Jerizalèm nan ye nan Revelasyon 21?",
        categoryName: "Apocalypse",
        options: [
            { id: "a", text: "Peyi Izrayèl yo refè sou tè a" },
            { id: "b", text: "Vil sen an k'ap desann soti nan syèl la — kote Bondye ap rete ak moun" },
            { id: "c", text: "Paradi nan syèl la kote nanm moun ale apre yo mouri" },
            { id: "d", text: "Tanp Salomon an yo rebati" }
        ],
        explanation: "Nouvo Jerizalèm nan desann soti nan syèl la — Bondye pral rete ak moun, l'ap siye tout dlo nan je yo (Revelasyon 21:2-3)."
    },
    "dq-apoc-029": {
        questionText: "Nan Revelasyon 20, konbyen ane rèy yo mansyone anvan jijman final la dire?",
        categoryName: "Apocalypse",
        options: [
            { id: "a", text: "100 ane" },
            { id: "b", text: "500 ane" },
            { id: "c", text: "1000 ane" },
            { id: "d", text: "7 ane" }
        ],
        explanation: "Bib la pale de yon rèy « mil (1000) ane » (milenyòm) nan Revelasyon 20:1-6."
    },
    "dq-apoc-030": {
        questionText: "Ki pwomès Bondye te fè Legliz Filadèlfi a nan Revelasyon 3?",
        categoryName: "Apocalypse",
        options: [
            { id: "a", text: "Richès ak glwa" },
            { id: "b", text: "Yon pòt louvri pèsonn pa ka fèmen" },
            { id: "c", text: "Viktwa sou tout nasyon yo" },
            { id: "d", text: "Rezirèksyon touswit" }
        ],
        explanation: "« Mwen mete yon pòt louvri devan ou, pèsonn pa ka fèmen l' » — se pwomès pou Filadèlfi (Revelasyon 3:8)."
    },
    "dq-apoc-031": {
        questionText: "Ak ki gwo envitasyon Lespri a ak Lamarye a liv Revelasyon an fini?",
        categoryName: "Apocalypse",
        options: [
            { id: "a", text: "Adore Bondye sèlman" },
            { id: "b", text: "Vini non, Seyè Jezi" },
            { id: "c", text: "Se pou gras li la ak nou tout" },
            { id: "d", text: "Vini resevwa lavi etènèl" }
        ],
        explanation: "« Lespri a ak lamarye a di: Vini non! » epi Jan fini: « Vini non, Seyè Jezi » (Revelasyon 22:17,20)."
    },
    "dq-apoc-032": {
        questionText: "Ki non zanj gwo twou san fon an an ebre nan Revelasyon 9:11?",
        categoryName: "Apocalypse",
        options: [
            { id: "a", text: "Apoliyon / Abadon" },
            { id: "b", text: "Michèl" },
            { id: "c", text: "Lisifè" },
            { id: "d", text: "Bèlzeboul" }
        ],
        explanation: "Zanj gwo twou san fon an rele Abadon an ebre ak Apoliyon an grèk — tou de non sa yo vle di « moun k'ap detwi a » (Revelasyon 9:11)."
    },
    "dq-apoc-033": {
        questionText: "Nan Revelasyon 12, kisa madanm ki te vlope ak solèy la reprezante nòmalman?",
        categoryName: "Apocalypse",
        options: [
            { id: "a", text: "Mari, manman Jezi" },
            { id: "b", text: "Legliz la oswa Izrayèl k'ap pote Mesi a" },
            { id: "c", text: "Gwo Babilòn nan" },
            { id: "d", text: "Madanm Ti Mouton an" }
        ],
        explanation: "Madanm nan ki gen yon kouwòn ak 12 zetwal (Izrayèl/Legliz la) fè pitit ki se Mesi a pandan dragon an ap kouri dèyè l' (Rev 12:1-5)."
    },
    "dq-apoc-034": {
        questionText: "Kisa ki genyen nan « liv lavi Ti Mouton an » yo mansyone nan Revelasyon 21:27?",
        categoryName: "Apocalypse",
        options: [
            { id: "a", text: "Non moun ki pral antre nan Nouvo Jerizalèm nan" },
            { id: "b", text: "Peche tout limanite" },
            { id: "c", text: "Pwofesi ki reyalize yo" },
            { id: "d", text: "Non zanj gadyen yo" }
        ],
        explanation: "Se sèlman moun ki gen non yo ekri nan liv lavi Ti Mouton an k'ap ka antre nan Nouvo Jerizalèm nan (Rev 21:27)."
    },
    "dq-apoc-035": {
        questionText: "Revelasyon dekri yon « letan dife » kòm « dezyèm lanmò » — kilès yo jete ladan l an premye?",
        categoryName: "Apocalypse",
        options: [
            { id: "a", text: "Nasyon k'ap fè rebèl yo" },
            { id: "b", text: "Lanmò ak kote mò yo ye a (Adès)" },
            { id: "c", text: "Gwo fanm movèz vi a" },
            { id: "d", text: "Fo pwofèt yo sèlman" }
        ],
        explanation: "« Yo jete lanmò ak kote mò yo ye a nan letan dife a. Se letan dife sa a ki dezyèm lanmò a » (Revelasyon 20:14)."
    },
    "dq-pers-030": {
        questionText: "Ki moun ki te tounen yon poto sèl paske li te gade dèyè?",
        categoryName: "Personnages Bibliques",
        options: [
            { id: "a", text: "Sara" },
            { id: "b", text: "Madanm Lòt" },
            { id: "c", text: "Rachèl" },
            { id: "d", text: "Rebeka" }
        ],
        explanation: "Madanm Lòt pa t' koute sa zanj yo te di a, li te gade dèyè, epi li te tounen yon poto sèl (Jenèz 19:26)."
    },
    "dq-pers-031": {
        questionText: "Ki disip Jezi ki te trayi l pou trant pyès lajan?",
        categoryName: "Personnages Bibliques",
        options: [
            { id: "a", text: "Pyè" },
            { id: "b", text: "Tomas" },
            { id: "c", text: "Jid Iskariòt" },
            { id: "d", text: "Batèlmi" }
        ],
        explanation: "Jid Iskariòt te vann Jezi bay chèf prèt yo pou trant pyès lajan (Matye 26:15)."
    },
    "dq-pers-032": {
        questionText: "Ki moun ki te esplike rèv Farawon an epi ki te vin dezyèm chèf nan peyi Ejip?",
        categoryName: "Personnages Bibliques",
        options: [
            { id: "a", text: "Moyiz" },
            { id: "b", text: "Jozèf" },
            { id: "c", text: "Arawon" },
            { id: "d", text: "Abraram" }
        ],
        explanation: "Apre Jozèf fin esplike rèv sèt vach gra ak sèt vachèg yo, li te vin dezyèm chèf nan peyi Ejip (Jenèz 41:40-41)."
    },
    "dq-pers-033": {
        questionText: "Ki madanm ki te kache espyon Izrayèl yo epi ki te sove gras ak yon kòdon wouj?",
        categoryName: "Personnages Bibliques",
        options: [
            { id: "a", text: "Debora" },
            { id: "b", text: "Raab" },
            { id: "c", text: "Rit" },
            { id: "d", text: "Abigayèl" }
        ],
        explanation: "Raab ki t'ap viv nan vil Jeriko te kache espyon Jozye yo, epi li te sove paske li te mare yon kòdon wouj nan fenèt li (Jozye 2:18-21)."
    },
    "dq-pers-034": {
        questionText: "Ki moun ki te prepare chemen pou Jezi e ki t'ap batize moun nan larivyè Jouden an?",
        categoryName: "Personnages Bibliques",
        options: [
            { id: "a", text: "Eli" },
            { id: "b", text: "Elize" },
            { id: "c", text: "Jan Batis" },
            { id: "d", text: "Zakarie" }
        ],
        explanation: "Jan Batis t'ap preche pou moun chanje lavi yo epi li te prepare chemen pou Jezi (Mak 1:4)."
    },
    "dq-pers-035": {
        questionText: "Ki larenn etranje ki te vizite Salomon pou wè jan li te gen sajès?",
        categoryName: "Personnages Bibliques",
        options: [
            { id: "a", text: "Larenn Lasiri" },
            { id: "b", text: "Larenn Saba" },
            { id: "c", text: "Jezabèl" },
            { id: "d", text: "Atali" }
        ],
        explanation: "Larenn Saba te vin ak anpil richès pou l' te poze Salomon anpil keksyon difisil pou l' wè konesans li (1 Wa 10:1-3)."
    },
    "dq-pers-036": {
        questionText: "Ki farizyen ki te vin jwenn Jezi lannwit epi ki te aprann li fòk li fèt yon dezyèm fwa?",
        categoryName: "Personnages Bibliques",
        options: [
            { id: "a", text: "Gamalyèl" },
            { id: "b", text: "Nikodèm" },
            { id: "c", text: "Sòl ki soti Tas" },
            { id: "d", text: "Jozèf ki soti Arimatye" }
        ],
        explanation: "Nikodèm, yon chèf nan jwif yo, te vin jwenn Jezi lannwit. Jezi di l': « Si yon moun pa fèt yon dezyèm fwa, li pa kapab wè Peyi kote Bondye Wa a » (Jan 3:3-4)."
    },
    "dq-pers-037": {
        questionText: "Ki madanm ki te jij nan Izrayèl epi ki te konn bay pwofesi anba yon pye palmis ant Rama ak Betèl?",
        categoryName: "Personnages Bibliques",
        options: [
            { id: "a", text: "Miryam" },
            { id: "b", text: "Olda" },
            { id: "c", text: "Debora" },
            { id: "d", text: "Noadya" }
        ],
        explanation: "Debora te pwofèt epi li te jij nan Izrayèl. Li te konn rann jistis anba pye palmis Debora a (Jij 4:4-5)."
    },
    "dq-pers-038": {
        questionText: "Ki moun Banabas te ye nan kòmansman Legliz la e ki ti non yo te ba li?",
        categoryName: "Personnages Bibliques",
        options: [
            { id: "a", text: "Disip Pòl, yo te rele l « pitit loraj »" },
            { id: "b", text: "Yon Levit ki soti Chip yo te rele « moun ki konn bay ankourajman »" },
            { id: "c", text: "Premye dyak nan Legliz Jerizalèm nan" },
            { id: "d", text: "Zanmi Jan lè l' te nan prizon" }
        ],
        explanation: "Jozèf, yon Levit ki soti Chip, apot yo te ba l ti non Banabas (ki vle di: moun ki konn bay ankourajman). Li te vwayaje anpil ak Pòl (Travay 4:36)."
    },
    "dq-pers-039": {
        questionText: "Ki moun Akila ak Prisil te ye nan Legliz Nouvo Testaman an?",
        categoryName: "Personnages Bibliques",
        options: [
            { id: "a", text: "Yon koup ki te konn fè tant ki te travay ak Pòl epi ki te montre Apolòs verite a" },
            { id: "b", text: "De pwofèt ki t'ap vwayaje pou Legliz Antyòch la" },
            { id: "c", text: "Paran Timote yo" },
            { id: "d", text: "Dyak nan Legliz Wòm nan" }
        ],
        explanation: "Akila ak Prisil, ki te konn fè tant, te resevwa Pòl lakay yo nan Korent epi yo te esplike Apolòs chemen Bondye a pi byen toujou (Travay 18:2-3,26)."
    },
    "dq-pers-040": {
        questionText: "Ki moun Apolòs te ye e ki jan Akila ak Prisil te fin montre l chemen Bondye a pi byen toujou?",
        categoryName: "Personnages Bibliques",
        options: [
            { id: "a", text: "Yon jwif ki soti Aleksandri ki te konn pale byen men ki te konnen batèm Jan sèlman" },
            { id: "b", text: "Yon grèk ki te konvèti Pòl te fòme" },
            { id: "c", text: "Yon pwofèt Legliz Antyòch la te voye Korent" },
            { id: "d", text: "Yonn nan 70 disip Jezi te voye yo" }
        ],
        explanation: "Apolòs te soti Aleksandri, li te konn Bib la byen epi li te konn pale byen. Men li te konnen batèm Jan sèlman. Akila ak Prisil te esplike l' chemen Bondye a pi byen toujou (Travay 18:24-26)."
    },
    "dq-lug-041": {
        questionText: "Nan ki vil Jezi te fèt?",
        categoryName: "Lieux Bibliques",
        options: [
            { id: "a", text: "Nazarèt" },
            { id: "b", text: "Jerizalèm" },
            { id: "c", text: "Betleyèm" },
            { id: "d", text: "Jeriko" }
        ],
        explanation: "Jezi te fèt Betleyèm nan peyi Jide, jan pwofèt Miche te di sa (Lik 2:4-7)."
    },
    "dq-lug-042": {
        questionText: "Sou ki mòn Moyiz te resevwa Dis Kòmandman yo?",
        categoryName: "Lieux Bibliques",
        options: [
            { id: "a", text: "Mòn Kamèl" },
            { id: "b", text: "Mòn Nebo" },
            { id: "c", text: "Mòn Sinayi" },
            { id: "d", text: "Mòn Siyon" }
        ],
        explanation: "Bondye te bay Moyiz Dis Kòmandman yo sou mòn Sinayi (Egzòd 20:1-17)."
    },
    "dq-lug-043": {
        questionText: "Nan ki jaden Jezi te priye ak anpil kè sere anvan yo te arete l?",
        categoryName: "Lieux Bibliques",
        options: [
            { id: "a", text: "Jaden Edèn" },
            { id: "b", text: "Jaden Jesemane" },
            { id: "c", text: "Jaden Tonbo a" },
            { id: "d", text: "Jaden Tanp lan" }
        ],
        explanation: "Jezi te priye ak anpil kè sere nan jaden Jesemane a, nan pye mòn Oliv la (Lik 22:39-44)."
    },
    "dq-lug-044": {
        questionText: "Ki vil nan Dekapòl la kote Jezi te geri yon nonm ki te gen move lespri sou li?",
        categoryName: "Lieux Bibliques",
        options: [
            { id: "a", text: "Gadara / Geraza" },
            { id: "b", text: "Kapènawòm" },
            { id: "c", text: "Bètsayda" },
            { id: "d", text: "Magdala" }
        ],
        explanation: "Jezi te geri nonm ki te gen move lespri a nan peyi Gadarenyen yo (oswa Gerazenyen yo), bò solèy leve lanmè Galile a (Mak 5:1)."
    },
    "dq-lug-045": {
        questionText: "Nan ki vil premye reyinyon (konsil) apot yo te fèt nan kòmansman Legliz la?",
        categoryName: "Lieux Bibliques",
        options: [
            { id: "a", text: "Antyòch" },
            { id: "b", text: "Wòm" },
            { id: "c", text: "Efèz" },
            { id: "d", text: "Jerizalèm" }
        ],
        explanation: "Konsil Jerizalèm nan (Travay 15) te regle keksyon sikonsizyon pou moun ki pa jwif yo — se te premye gwo reyinyon Legliz la."
    },
    "dq-lug-046": {
        questionText: "Sou ki ti mòn yo te kloure Jezi sou kwa a?",
        categoryName: "Lieux Bibliques",
        options: [
            { id: "a", text: "Mòn Siyon" },
            { id: "b", text: "Mòn Oliv" },
            { id: "c", text: "Golgota" },
            { id: "d", text: "Mòn Kamèl" }
        ],
        explanation: "Yo te kloure Jezi sou kwa a sou ti mòn Golgota a (ki vle di « kote zo tèt ») ki te andeyò miray lavil Jerizalèm (Jan 19:17)."
    },
    "dq-lug-047": {
        questionText: "Ki vil nan Bib la ki makonnen ak premye mirak Jezi te fè nan yon nòs?",
        categoryName: "Lieux Bibliques",
        options: [
            { id: "a", text: "Kapènawòm" },
            { id: "b", text: "Kana nan Galile" },
            { id: "c", text: "Nazarèt" },
            { id: "d", text: "Betani" }
        ],
        explanation: "Jezi te chanje dlo tounen diven nan yon nòs nan vil Kana — se te premye mirak li te fè (Jan 2:1-11)."
    },
    "dq-lug-048": {
        questionText: "Kisa non « Betleyèm » nan vle di an ebre?",
        categoryName: "Lieux Bibliques",
        options: [
            { id: "a", text: "Kay pen" },
            { id: "b", text: "Lavil David" },
            { id: "c", text: "Kote pwomès la" },
            { id: "d", text: "Fò won pouvwa a" }
        ],
        explanation: "Betleyèm (Beit Lehem) vle di « kay pen » an ebre — se la David ak Jezi te fèt."
    },
    "dq-lug-049": {
        questionText: "Ki lanmè ki te nan mitan travay Jezi t'ap fè nan Galile?",
        categoryName: "Lieux Bibliques",
        options: [
            { id: "a", text: "Lanmè Mouri" },
            { id: "b", text: "Lanmè Galile (lak Tiberid)" },
            { id: "c", text: "Lanmè Mediterane" },
            { id: "d", text: "Gòlf Akaba" }
        ],
        explanation: "Lanmè Galile a (yo rele l lak Tiberid oswa lak Jenezarèt tou) se la Jezi te pase plis tan nan travay li epi se la li te rele premye disip li yo (Mak 1:16)."
    },
    "dq-evnt-018": {
        questionText: "Ki evènman ki te pèmèt Izrayèl travèse Jouden an pou yo antre Kanaran?",
        categoryName: "Événements Bibliques",
        options: [
            { id: "a", text: "Yon pont mirak parèt" },
            { id: "b", text: "Dlo Jouden an te sispann koule" },
            { id: "c", text: "Yo te travèse nan bato" },
            { id: "d", text: "Bondye te fè yon van soufle pou seche dlo a" }
        ],
        explanation: "Bondye te fè dlo Jouden an sispann koule pou tout moun Izrayèl yo te ka pase sou tè sèch, menm jan sa te fèt nan Lanmè Wouj la (Jozye 3:15-17)."
    },
    "dq-evnt-019": {
        questionText: "Ki evènman ki te lakòz moun Izrayèl yo te pati kòm prizonye nan Babilòn?",
        categoryName: "Événements Bibliques",
        options: [
            { id: "a", text: "Lè moun Lasiri yo te bat yo" },
            { id: "b", text: "Lè Nabikodonosò te detwi Tanp lan" },
            { id: "c", text: "Lè wa Jozyas te mouri" },
            { id: "d", text: "Lè Samson te trayi pèp la" }
        ],
        explanation: "Nabikodonosò te detwi Tanp Salomon te bati a epi li te depòte moun peyi Jida yo nan Babilòn nan lanne 586 anvan Jezi (2 Wa 25:8-12)."
    },
    "dq-evnt-020": {
        questionText: "Kisa ki te pase lè figi Jezi te chanje (transfigirasyon)?",
        categoryName: "Événements Bibliques",
        options: [
            { id: "a", text: "Jezi te mache sou dlo" },
            { id: "b", text: "Figi l' te klere epi Moyiz ak Eli te parèt bò kote l'" },
            { id: "c", text: "Li te bay 5000 moun manje ak kèk pen" },
            { id: "d", text: "Li te fè Laza leve soti vivan nan lanmò" }
        ],
        explanation: "Lè Jezi te sou mòn lan, figi l' te chanje, li te klere tankou solèy la, Moyiz ak Eli te parèt, epi Papa a te pale soti nan syèl la (Matye 17:1-5)."
    },
    "dq-evnt-021": {
        questionText: "Ki evènman ki te kòmanse refòm relijye anba wa Jozyas?",
        categoryName: "Événements Bibliques",
        options: [
            { id: "a", text: "Vizyon Ezayi te gen nan Tanp lan" },
            { id: "b", text: "Lè yo te jwenn Liv Lalwa a nan Tanp lan" },
            { id: "c", text: "Prèch Jeremi te fè devan pòt Tanp lan" },
            { id: "d", text: "Lè moun yo te tounen soti nan prizon Babilòn" }
        ],
        explanation: "Granprèt Ilkija te jwenn Liv Lalwa a nan Tanp lan. Lè sa a, wa Jozyas te kòmanse yon gwo refòm pou pèp la tounen vin jwenn Bondye (2 Wa 22:8-11)."
    },
    "dq-evnt-022": {
        questionText: "Kisa vwal Tanp lan ki te chire a te vle di lè Jezi te mouri?",
        categoryName: "Événements Bibliques",
        options: [
            { id: "a", text: "Sakrifis bèt yo fini" },
            { id: "b", text: "Tout kwayan ka antre devan Bondye san entèmedyè" },
            { id: "c", text: "Tanp lan pral detwi talè konsa" },
            { id: "d", text: "Jou Saba a kòmanse" }
        ],
        explanation: "Vwal ki te separe kote ki sen anpil la te chire de bout an bout — sa vle di tout moun ka pwoche bò kote Bondye gras ak Jezi (Matye 27:51; Ebre 10:19-20)."
    }
};

const htData = sourceData.map(item => {
    const trans = translations[item.newId];
    if (trans) {
        return {
            newId: item.newId,
            categoryId: item.fr.categoryId,
            difficulty: item.fr.difficulty,
            language: "ht",
            ht: {
                id: item.newId,
                questionText: trans.questionText,
                categoryId: item.fr.categoryId,
                categoryName: trans.categoryName,
                difficulty: item.fr.difficulty,
                language: "ht",
                options: trans.options,
                correctOptionId: item.fr.correctOptionId,
                explanation: trans.explanation,
                bibleReference: item.fr.bibleReference
            }
        };
    }
    return null;
}).filter(x => x !== null);

fs.writeFileSync(outputPath, JSON.stringify(htData, null, 2));
console.log(`Successfully generated ${outputPath} with ${htData.length} questions.`);
