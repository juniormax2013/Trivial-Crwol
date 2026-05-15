const fs = require('fs');

const frData = JSON.parse(fs.readFileSync('c:\\Users\\junio\\Desktop\\200\\Juego\\Trivial App\\scratch\\fr_to_translate_inverse_batch3.json', 'utf8'));

const translations = {
  "dq-ora-006": {
    "questionText": "Ki pwomès yo bay nan Matye 7:7-8 konsènan lapriyè?",
    "categoryName": "Lapriyè",
    "options": [
      "Bondye reponn tout lapriyè imedyatman",
      "Mande e y'a ban nou; chache e n'a jwenn; frape e y'a louvri pou nou",
      "Se sèlman moun ki jis k'ap jwenn repons pou lapriyè yo",
      "Lapriyè ak lafwa sifi pou jwenn tout sa w vle"
    ],
    "explanation": "« Mande, epi y'a ban nou; chache, epi n'a jwenn; frape, epi y'a louvri pou nou » (Matye 7:7) — yon envitasyon diven pou yon lapriyè ki pèsistan."
  },
  "dq-ora-007": {
    "questionText": "Kijan Sentespri a ede kwayan an nan lapriyè selon Women 8:26?",
    "categoryName": "Lapriyè",
    "options": [
      "Li chwazi mo lapriyè yo pou nou",
      "Li lapriyè pou nou ak soupir moun pa ka eksprime lè nou pa konn sa pou nou mande",
      "Li tradui lapriyè nou yo an ebre pou Bondye",
      "Li dirije emosyon nou pandan lapriyè a"
    ],
    "explanation": "« Lespri a li menm ap lapriyè pou nou ak soupir moun pa ka eksprime » (Women 8:26) — Sentespri a se avoka nou nan lapriyè."
  },
  "dq-ora-008": {
    "questionText": "Ki modèl lapriyè Ana bay nan 1 Samyèl 1?",
    "categoryName": "Lapriyè",
    "options": [
      "Yon lapriyè kout ak fòmèl nan tanp lan",
      "Yon lapriyè ak tout kè li ak dlo nan je, yon pwomès bay Bondye ak yon tann ak konfyans pou repons li",
      "Yon lapriyè kolektif ak prèt yo nan tanp lan",
      "Yon lapriyè karent krizokal pandan karant jou"
    ],
    "explanation": "Ana t'ap priye nan detrès ak dlo nan je, li te fè yon ve bay Bondye, epi li te pati ak kè poze — modèl lapriyè sensè, presi ak konfyans (1 Samyèl 1:10-18)."
  },
  "dq-ora-009": {
    "questionText": "Kijan Jezi te priye nan jaden Jetsemane a e kisa lapriyè sa a anseye nou?",
    "categoryName": "Lapriyè",
    "options": [
      "Li te mande pou l pa soufri — lapriyè a pa t gen repons",
      "Li te priye ak soumisyon total : « Se pou volonte w fèt » — modèl lapriyè nan moman anwas",
      "Li te priye an silans san l pa di yon mo",
      "Li te mande disip li yo pou yo priye nan plas li"
    ],
    "explanation": "Jetsemane : Jezi te priye ak yon gwo anwas men li te soumèt volonte l bay Papa a — « Se pa volonte pa m, men se volonte pa w ki pou fèt » (Lik 22:42). Modèl lapriyè nan soufrans."
  },
  "dq-ora-010": {
    "questionText": "Ki kondisyon Jak 5:16 bay pou yon lapriyè efikas?",
    "categoryName": "Lapriyè",
    "options": [
      "Gen ase lafwa pou deplase yon mòn",
      "Lapriyè ak lafwa yon moun ki dwat gen gwo pouvwa — konfese peche nou youn bay lòt",
      "Priye ak lòt kwayan tout tan",
      "Se pou ansyen yo pase lwil sou ou"
    ],
    "explanation": "« Se pou nou konfese peche nou yo youn bay lòt... Lapriyè ak lafwa yon moun ki dwat gen gwo pouvwa » (Jak 5:16) — lapriyè ki baze sou jistis ak kominote."
  },
  "dq-ora-011": {
    "questionText": "Kijan sòm 22 a se yon lapriyè nan detrès ak yon prediksyon mesyanik an menm tan?",
    "categoryName": "Lapriyè",
    "options": [
      "Se sèlman yon plent istorik David te fè",
      "Li kòmanse ak santiman abandon David te genyen an men li anonse egzakteman pasyon Kris la (Matye 27:46)",
      "Se yon pwofesi dirèk san okenn dimansyon pèsonèl",
      "Jezi te site sòm sa a pa erè"
    ],
    "explanation": "Sòm 22 kòmanse ak « Bondye mwen, Bondye mwen, poukisa ou lage m konsa ? » — rèl David ak dènye pawòl Jezi sou kwa a (Matye 27:46). Pwofesi tipolojik sou pasyon an."
  },
  "dq-igl-016": {
    "questionText": "Ki diferans ki genyen ant Legliz vizib ak Legliz envizib nan teyoloji refòme a?",
    "categoryName": "Legliz",
    "options": [
      "Legliz vizib la se katolik; Legliz envizib la se pwotestan",
      "Legliz vizib = tout moun ki deklare lafwa yo; Legliz envizib = moun ki vrèman chanje Bondye sèlman konnen",
      "Legliz vizib la se sa nou wè nan televizyon; envizib la se sa ki anba tè",
      "Legliz envizib la se legliz moun ki mouri yo"
    ],
    "explanation": "Calvin : Legliz vizib la (tout moun ki deklare lafwa, ki resevwa sakreman yo) gen ladan l Legliz envizib la (vrè eli yo Bondye sèlman konnen) — yon distenksyon pastoral enpòtan."
  },
  "dq-igl-017": {
    "questionText": "Kisa « kle Wayòm nan » yo te bay Pyè nan Matye 16:19 la vle di?",
    "categoryName": "Legliz",
    "options": [
      "Pyè gen yon pouvwa absoli sou Legliz katolik la",
      "Otorite pou anonse Levanjil la — sa ki ouvri oswa fèmen aksè nan Wayòm nan atravè mesaj y'ap bay la",
      "Pyè t'ap veye pòt syèl la literalman",
      "Yon pouvwa yo pase bay pap yo kòm siksèsè Pyè"
    ],
    "explanation": "Kle yo senbolize otorite pou anonse Levanjil la : predikasyon sou lanmò ak rezirèksyon Kris la ouvri Wayòm nan pou moun ki kwè oswa fèmen l pou moun ki refize (Matye 16:19)."
  },
  "dq-igl-018": {
    "questionText": "Kijan 1 Pyè 2:9 dekri idantite Legliz la?",
    "categoryName": "Legliz",
    "options": [
      "Yon enstitisyon yerachik ak prèt ki òdone",
      "Yon ras chwazi, yon klas prèt k'ap sèvi wa a, yon nasyon ki apa pou Bondye, yon pèp Bondye chwazi",
      "Yon gwoup kwayan k'ap mache nan direksyon pèfeksyon",
      "Moun k'ap resevwa pwomès yo te fè Izrayèl sèlman"
    ],
    "explanation": "« Nou se yon ras Bondye chwazi, yon klas prèt k'ap sèvi wa a, yon nasyon ki apa pou Bondye, yon pèp li te achte... pou nou ka anonse bèl mèvèy moun ki te rele nou soti nan fènwa a » (1 Pyè 2:9)."
  },
  "dq-igl-019": {
    "questionText": "Ki diferans ki genyen ant don direksyon yo (evèk/ansyen) ak dyak yo nan Nouvo Testaman an?",
    "categoryName": "Legliz",
    "options": [
      "Evèk yo pi wo pase dyak yo nan yon yerachi fiks",
      "Ansyen/evèk yo anseye e yo dirije; dyak yo sèvi nan bezwen pratik yo",
      "Dyak yo ka anseye; ansyen yo ka sèlman priye",
      "Wòl sa yo pa t egziste nan Legliz premye tan an"
    ],
    "explanation": "Nouvo Testaman an fè diferans ant ansyen/evèk yo (direksyon, ansèyman — 1 Timote 3:1-7) ak dyak yo (sèvis pratik — Akt 6:1-6; 1 Timote 3:8-13)."
  },
  "dq-igl-020": {
    "questionText": "Kisa doktrin « kominyon sen yo » vle di nan Kredo Apòt yo?",
    "categoryName": "Legliz",
    "options": [
      "Lapriyè bay sen ki mouri pou yo ka pale pou nou",
      "Inite tout kwayan yo — sa ki vivan ak sa ki mouri — nan Kò Kris la atravè tout laj",
      "Sentete moral obligatwa pou antre nan Legliz la",
      "Selebre mès pou moun ki mouri yo"
    ],
    "explanation": "Kominyon sen yo (sanctorum communio) vle di solidarite tout kwayan yo nan Kò Kris la — yon Legliz ki ini kwayan tout tan."
  },
  "dq-igl-021": {
    "questionText": "Ki kritè refòmatè yo te idantifye pou rekonèt yon vrè Legliz?",
    "categoryName": "Legliz",
    "options": [
      "Siksèsyon apostolik ak akò ak lavil Wòm",
      "Predikasyon fidèl Pawòl la ak administrasyon kòrèk sakreman yo",
      "Gwosè kongregasyon an ak mirak yo",
      "Respè pou litiji istorik la"
    ],
    "explanation": "De mak vrè Legliz la selon Refòmatè yo (Luther, Calvin) : (1) Pawòl Bondye a ki preche ak fidelite, (2) sakreman yo ki administre kòrèkteman (kèk lòt ajoute disiplin legliz la)."
  },
  "dq-igl-022": {
    "questionText": "Kijan Revelasyon 2-3 (lèt pou 7 Legliz yo) enpòtan pou Legliz jodi a?",
    "categoryName": "Legliz",
    "options": [
      "Lèt sa yo aplikab sèlman pou Legliz istorik nan premye syèk la",
      "Yo bay yon pòtrè pwofetik sou fòs ak feblès espirityèl ki gen nan tout Legliz nan tout epòk",
      "Yo anonse sèt peryòd nan istwa Legliz la",
      "Yo se senbòl sèlman san okenn aplikasyon pratik"
    ],
    "explanation": "7 lèt yo (Revelasyon 2-3) pale sou dinamik inivèsèl : pèdi premye renmen an (Efèz), konpwomi ak move doktrin (Pègam), tyèd (Layodise) — glas pou tout Legliz nan tout epòk."
  },
  "dq-esc-009": {
    "questionText": "Kisa mo grèk « parousia » a vle di nan teyoloji Nouvo Testaman an?",
    "categoryName": "Eskatoloji",
    "options": [
      "Lanmò Jezi sou kwa a",
      "Dezyèm vini oswa retou glorye Kris la",
      "Pannkot ak don Lespri a",
      "Rezirèksyon Jezi"
    ],
    "explanation": "Parousia (παρουσία) = « prezans » oswa « vini » — tèm teknik nan NT pou dezyèm retou Kris la nan glwa (1 Tesalonisyen 4:15; Matye 24:27)."
  },
  "dq-esc-010": {
    "questionText": "Ki imaj Pòl sèvi ak pou dekri rezirèksyon an nan 1 Korentyen 15?",
    "categoryName": "Eskatoloji",
    "options": [
      "Yon zwazo k'ap vole moute nan syèl la",
      "Yon grenn yo plante ki mouri epi ki pouse kòm yon nouvo kò glorye",
      "Yon flanm dife ki tounen limyè",
      "Yon rivyè k'ap jwenn lanmè a"
    ],
    "explanation": "Pòl sèvi ak imaj grenn yo plante a : « Sa ou plante a pa ka pran lavi si li pa mouri... sa ki plante pou pouri a ap resisite pou pa janm pouri » (1 Korentyen 15:36-42)."
  },
  "dq-esc-011": {
    "questionText": "Dapre Jan 5:28-29, kiyès ki pral resisite nan lafen tan yo?",
    "categoryName": "Eskatoloji",
    "options": [
      "Sèlman kwayan ki fidèl yo",
      "Tout moun ki nan tonm yo — sa ki fè byen pou lavi, sa ki fè mal pou jijman",
      "Sèlman moun ki te resevwa sakreman yo",
      "Marti kretyen yo sèlman"
    ],
    "explanation": "Jezi : « Tout moun ki nan tonm yo pral tande vwa li... sa ki fè byen yo pral resisite pou lavi; sa ki fè mal yo pral resisite pou jijman » (Jan 5:28-29)."
  },
  "dq-esc-012": {
    "questionText": "Kisa « Gran Tribilasyon » an ye selon Matye 24:21?",
    "categoryName": "Eskatoloji",
    "options": [
      "Pèsekisyon women nan premye syèk la sèlman",
      "Yon tan soufrans ki pa janm gen parèy anvan retou Kris la",
      "Soufrans pèsonèl chak kwayan",
      "Destriksyon Babilòn nan liv Revelasyon an"
    ],
    "explanation": "Jezi anonse yon « gwo tribilasyon, depi kòmansman lemonn jouk jòdi a pa janm gen parèy li, e p'ap janm genyen l ankò » (Matye 24:21)."
  },
  "dq-esc-013": {
    "questionText": "Kisa « syèl nouvo a ak tè nouvo a » vle di nan Revelasyon 21:1?",
    "categoryName": "Eskatoloji",
    "options": [
      "Bondye pral detwi tout linivè a nèt pou l kreye yon lòt",
      "Kreyasyon aktyèl la pral renouvle e pirifye — yon restorasyon kote Bondye pral rete ak pèp li a",
      "Paradi a pral nan yon lòt linivè paralèl",
      "Kwayan yo pral viv nan yon eta espirityèl sèlman"
    ],
    "explanation": "Syèl Nouvo a ak Tè Nouvo a : yon kreyasyon renouvle (2 Pyè 3:10-13) kote « Bondye ap rete ansanm ak moun yo » — pwojè Edèn nan ki akonpli e ki depase (Revelasyon 21:3)."
  },
  "dq-esc-014": {
    "questionText": "Kisa Matye 24:36 di sou dat retou Kris la?",
    "categoryName": "Eskatoloji",
    "options": [
      "Apre sèt ane tribilasyon",
      "Pèsonn pa konn ni jou a, ni lè a — ni zanj nan syèl la, ni Pitit la",
      "Nan milyèm anivèsè Legliz la",
      "Nan lafen kalandriye ebre a"
    ],
    "explanation": "« Kanta pou jou a ak lè a, pèsonn pa konnen yo, ni zanj nan syèl la, ni Pitit la, men se Papa a sèl ki konnen » (Matye 24:36)."
  },
  "dq-esp-016": {
    "questionText": "Ki wòl Sentespri a te genyen nan Ansyen Testaman an parapò ak Nouvo Testaman an?",
    "categoryName": "Sentespri",
    "options": [
      "Lespri a pa t egziste nan Ansyen Testaman an",
      "Nan Ansyen Testaman an, Lespri a te vini sou kèk moun pou misyon presi; nan Nouvo Testaman an, li rete nan tout kwayan yo nèt",
      "Lespri a te aji menm jan nan tou de Testaman yo",
      "Lespri a nan Ansyen Testaman an te yon fòs san pèsonalite"
    ],
    "explanation": "Nan Ansyen Testaman an : Lespri a te vini sou kèk moun pou misyon (Samson, David, Eli). Nan Nouvo Testaman an, Jewova pwomèt e li fè sa : « M'ap mete Lespri m nan nou » (Ezekyèl 36:27 → Jan 14:17; Akt 2)."
  },
  "dq-esp-017": {
    "questionText": "Kijan Sentespri a ede kwayan an konprann Ekriti yo (iluminasyon)?",
    "categoryName": "Sentespri",
    "options": [
      "Lespri a bay yon inspirasyon dirèk ki ranplase lekti a",
      "Lespri a klere lespri kwayan an pou l konprann e aplike Ekriti li te enspire yo",
      "Lespri a pa entèvni nan etid la — entelijans sèlman sifi",
      "Lespri a enspire pastè ak teyològ yo sèlman"
    ],
    "explanation": "Iluminasyon : menm Lespri ki te enspire Ekriti yo klere kè moun k'ap li a — « Moun ki pa gen Lespri a pa resevwa bagay ki soti nan Lespri Bondye a » (1 Korentyen 2:14). Nesesite lapriyè nan etid la."
  },
  "dq-esp-018": {
    "questionText": "Nan kisa doktrin « pwosesyon » Sentespri a konsiste nan teyoloji trinitè a?",
    "categoryName": "Sentespri",
    "options": [
      "Se Papa a ki te kreye Lespri a anvan tout bagay",
      "Lespri a soti nan Papa a (ak nan Pitit la selon Loksidan — Filioque) pou tout tan san kòmansman",
      "Lespri a soti nan Pitit la sèlman selon tout teyològ yo",
      "Pwosesyon vle di Lespri a pi ba pase Papa a"
    ],
    "explanation": "Pwosesyon Lespri a : relasyon etènèl nan Trinite a. Nise-Konstantinòp 381 : « ki soti nan Papa a ». Loksidan te ajoute Filioque (ak nan Pitit la) — pwen divizyon ant Wòm ak Konstantinòp an 1054."
  },
  "dq-mis-006": {
    "questionText": "Kisa « missio Dei » (misyon Bondye) ye nan teyoloji misyonè jodi a?",
    "categoryName": "Misyon",
    "options": [
      "Misyon nou bay Bondye nan lapriyè nou",
      "Misyon an se pou Bondye li menm — Legliz la patisipe nan aksyon misyonè Bondye nan mond lan",
      "Misyon an se pou misyonè pwofesyonèl yo sèlman",
      "Pwogram evanjelizasyon Legliz la òganize"
    ],
    "explanation": "Missio Dei (Hartenstein, 1952) : misyon an se pa premye pwogram Legliz la — li se pou Trinite a. Yo voye Legliz la kòm enstriman misyon diven an (Jan 20:21)."
  },
  "dq-mis-007": {
    "questionText": "Dapre Women 10:13-15, kisa ki nesesè pou moun yo kwè?",
    "categoryName": "Misyon",
    "options": [
      "Mirak pou pwouve mesaj la",
      "Predikatè yo voye — lafwa vini lè yo tande e yo tande Pawòl Bondye a",
      "Distribisyon Bib san esplikasyon",
      "Gras la sèlman san mwayen imen"
    ],
    "explanation": "« Kijan y'a fè kwè nan moun yo pa tande pale de li ?... Kijan y'a fè preche si yo pa voye yo ?... lafwa vini nan sa yo tande » (Women 10:14-17)."
  },
  "dq-mis-008": {
    "questionText": "Ki pèsonaj biblik yo konsidere kòm premye « misyonè » trans-kiltirèl sou yon gwo echèl?",
    "categoryName": "Misyon",
    "options": [
      "Abraham",
      "Pyè",
      "Pòl",
      "Barnabas"
    ],
    "explanation": "Pòl se premye moun ki te kòmanse yon misyon sistematik bò kote janti yo nan diferan kilti — « apòt nasyon yo » (Women 11:13)."
  },
  "dq-mis-009": {
    "questionText": "Kisa tèm « pèp ki pa atenn » (Unreached People Groups) vle di nan misyoloji?",
    "categoryName": "Misyon",
    "options": [
      "Moun ki pa janm tande Levanjil la pèsonèlman",
      "Gwoup kote pa gen ase kwayan nan mitan yo pou evanjelize pwòp gwoup yo san èd deyò",
      "Nasyon antye san Bib",
      "Rejyon jeyografik san Legliz"
    ],
    "explanation": "Pèp ki pa atenn (UPG) = gwoup kote pwopòsyon kretyen yo pi ba pase 2% e ki pa gen yon kominote evanjelik ki kapab evanjelize tèt li."
  },
  "dq-mis-010": {
    "questionText": "Kijan Revelasyon 7:9 motive misyon mondyal la?",
    "categoryName": "Misyon",
    "options": [
      "Li montre se Izrayèl sèlman k'ap sove nan lafen an",
      "Li revele vizyon final la : yon gwo foul moun tout nasyon, tout tribi, tout pèp ak tout lang — objektif final misyon an",
      "Li pwouve misyon inivèsèl la deja fini",
      "Li dekri Jerizalèm selès la kòm objektif jeyografik"
    ],
    "explanation": "Revelasyon 7:9 revele objektif misyon an : « yon gwo foul moun pèsonn pa t ka konte, ki soti nan tout nasyon, tout tribi, tout pèp, ak tout lang. » Motivasyon eskatolojik misyon an."
  },
  "dq-mis-011": {
    "questionText": "Ki kontribisyon Gustavo Gutiérrez ak teyoloji liberasyon an te pote nan deba misyolojik la?",
    "categoryName": "Misyon",
    "options": [
      "Yo te pwouve sosyalis se fòm Levanjil ki pi fidèl la",
      "Yo te mete an avant chwa pou pòv yo ak dimansyon sosyal Levanjil la — sa te fòse Legliz la repanse jistis sosyal",
      "Yo te refize Ansyen Testaman an kòm yon bagay ki pa enpòtan",
      "Yo te di misyon an sèlman nan pale Levanjil la"
    ],
    "explanation": "Gutiérrez (Teyoloji liberasyon, 1971) : « chwa pou pòv yo » — mouvman sa a te fòse yon deba sou misyon holistik (Lausanne 1974)."
  },
  "dq-nt-016": {
    "questionText": "Konbe liv ki genyen nan Nouvo Testaman an?",
    "categoryName": "Nouvo Testaman",
    "options": [
      "24",
      "27",
      "29",
      "39"
    ],
    "explanation": "Nouvo Testaman an gen 27 liv : 4 Levanjil, Akt, 21 Lèt ak Revelasyon."
  },
  "dq-nt-017": {
    "questionText": "Ki vèsè ki pi kout nan Nouvo Testaman an?",
    "categoryName": "Nouvo Testaman",
    "options": [
      "Filipyen 4:4",
      "1 Tesalonisyen 5:17",
      "Jan 11:35",
      "Akt 2:1"
    ],
    "explanation": "« Jezi te kriye » (Jan 11:35) — vèsè ki pi kout nan Nouvo Testaman an."
  },
  "dq-nt-018": {
    "questionText": "Poukisa Levanjil Jan an tèlman diferan de twa Levanjil sinoptik yo?",
    "categoryName": "Nouvo Testaman",
    "options": [
      "Jan pa t konn Jezi pèsonèlman",
      "Jan prezante divinite Kris la ak yon pwofondè teyolojik inik — 90% kontni l pa nan lòt yo",
      "Jan pale ak janti yo sèlman",
      "Jan te ekri apre Revelasyon"
    ],
    "explanation": "Jan kòmanse ak Pawòl la (Jan 1:1), li gen diskou nan dènye soupe a (Jan 13-17), 7 siy yo, ak 7 « Mwen se ». Apeprè 90% kontni l se pou li sèl — konsantre sou divinite Kris la."
  },
  "dq-nt-019": {
    "questionText": "Ki estrikti literè liv Revelasyon an e kijan yo dwe entèprete li?",
    "categoryName": "Nouvo Testaman",
    "options": [
      "Yon istwa lineyè sou evènman k'ap vini yo nan lòd kwonolojik",
      "Yon jan apokalips senbolik — vizyon pwofetik ki montre viktwa Bondye sou sa ki mal ak imaj senbolik",
      "Yon kòd sekrè pou moun ki inisye sèlman",
      "Yon liv istorik sou lavil Wòm nan premye syèk la sèlman"
    ],
    "explanation": "Revelasyon se yon jan apokalips (tankou Danyèl) — senbolis rich, chif senbolik (7, 12, 1000). Kat fason pou entèprete l: preteris, ideyalis, istorisis, futiris."
  },
  "dq-cgen-016": {
    "questionText": "Ki tès 1 Jan 4:2 bay pou rekonèt Lespri Bondye a?",
    "categoryName": "Lèt Jeneral yo",
    "options": [
      "Pale nan lang",
      "Konfese ke Jezikri te vini kòm moun tout bon",
      "Fè mirak",
      "Site Ekriti yo byen"
    ],
    "explanation": "« Men ki jan n'a rekonèt Lespri Bondye a : tout lespri ki rekonèt Jezikri te vini kòm moun tout bon, se Lespri ki soti nan Bondye li ye » (1 Jan 4:2)."
  },
  "dq-cgen-017": {
    "questionText": "Kont ki move ansèyman Jan te ekri prensipalman nan 1 Jan?",
    "categoryName": "Lèt Jeneral yo",
    "options": [
      "Moun k'ap ensiste sou Lalwa",
      "Gnostisis ki te kòmanse e ki te di Kris la pa t vini kòm moun tout bon",
      "Politeyis grèk ki t'ap menase Legliz yo",
      "Legalism farizyen nan Legliz yo"
    ],
    "explanation": "1 Jan konbat proto-gnostisis la : moun ki te di Kris la pa t vini kòm moun tout bon (dosetism) — yo te di matyè a move e Jezi te gen yon kò aparan sèlman."
  },
  "dq-cgen-018": {
    "questionText": "Ki objektif yo deklare pou premye lèt Jan an selon 1 Jan 5:13?",
    "categoryName": "Lèt Jeneral yo",
    "options": [
      "Anseye doktrin sou Trinite a",
      "Pou kwayan yo konnen yo gen lavi etènèl la",
      "Konbat fo pwofèt nan Legliz yo",
      "Ankouraje kominote a pou yo renmen youn lòt"
    ],
    "explanation": "« Mwen ekri nou sa pou nou ka konnen nou gen lavi etènèl, nou menm ki kwè nan Pitit Bondye a » (1 Jan 5:13) — objektif : asirans salitasyon an."
  },
  "dq-cgen-019": {
    "questionText": "Kisa 2 Jan 10-11 di konsènan fo doktè ki refize doktrin Kris la?",
    "categoryName": "Lèt Jeneral yo",
    "options": [
      "Fòk nou resevwa yo epi korije yo ak dousè",
      "Pa resevwa yo lakay nou, ni pa di yo bonjou — pou nou pa patisipe nan move travay yo",
      "Konfwonte yo an piblik nan Legliz la",
      "Siyale yo bay otorite legliz yo"
    ],
    "explanation": "Jan di : « Si yon moun vin jwenn nou san li pa pote ansèyman sa a, pa resevwa l lakay nou, pa di l bonjou ! » (2 Jan 10) — separasyon doktrinal solid."
  },
  "dq-cgen-020": {
    "questionText": "Kisa 3 Jan di sou Diotrèf e ki leson nou aprann pou Legliz la?",
    "categoryName": "Lèt Jeneral yo",
    "options": [
      "Diotrèf te yon bon lidè Jan t'ap fè lwanj pou li",
      "Diotrèf te renmen pou l premye — li te refize otorite apòt yo e li te mete kwayan fidèl yo deyò",
      "Diotrèf te yon fo pwofèt k'ap fè mirak",
      "Diotrèf te yon moun rich ki te refize ede pòv yo"
    ],
    "explanation": "Diotrèf (3 Jan 9-10) : kont-egzanp lidèchip — renmen parèt, refize otorite apòt yo. Modèl negatif kont otoritaris pastoral."
  },
  "dq-pent-016": {
    "questionText": "Ki divizyon an twa pati kanon ebre a (Tanakh)?",
    "categoryName": "Lwa / Pentatèk",
    "options": [
      "Lwa (Torah), Pwofèt (Nevi'im), Ekri yo (Ketuvim)",
      "Liv istorik, powetik ak pwofetik",
      "Pentatèk, Sòm ak Sajès",
      "Lwa, Sajès ak Apokalips"
    ],
    "explanation": "Tanakh = Torah (Pentatèk) + Nevi'im (Pwofèt) + Ketuvim (Ekri yo) — 24 liv nan sistèm ebre a."
  },
  "dq-pent-017": {
    "questionText": "Ki siyifikasyon Alyans Bondye ak Noe a (Jenèz 9) ak kisa ki siy li?",
    "categoryName": "Lwa / Pentatèk",
    "options": [
      "Alyans ak kondisyon : Noe te dwe swiv lwa Moyiz yo",
      "Alyans san kondisyon : Bondye pwomèt li p'ap janm detwi tè a ak dlo ankò — siy : lakansyèl",
      "Alyans sèlman ak Noe ak fanmi l sèlman",
      "Pwomès pou beni Noe nan lajan si li obeyi"
    ],
    "explanation": "Alyans ak Noe (Jenèz 9:8-17) se pou tout kreyasyon an e li san kondisyon. Siy : lakansyèl, kòm memwa pèmanan favè Bondye."
  },
  "dq-evnt-016": {
    "questionText": "Kisa sèpan an kwiv Moyiz la (Nonb 21) anonse nan fòm tipoloji?",
    "categoryName": "Evènman Biblik yo",
    "options": [
      "Gerizon ak remèd fèy",
      "Kwa Kris la — Jan 3:14 : « Menm jan Moyiz te leve sèpan an nan dezè a, se konsa tou yo gen pou yo leve Pitit moun nan »",
      "Peche orijinal la k'ap kontinye mòde moun",
      "Kilt idòl Izrayèl t'ap fè nan dezè a"
    ],
    "explanation": "Sèpan an kwiv yo te leve a (Nonb 21:8-9) se yon imaj Jezi sèvi ak pou montre jan yo t'ap gen pou yo leve l sou kwa a — gade = kwè pou sove (Jan 3:14-15)."
  },
  "dq-evnt-017": {
    "questionText": "Ki siyifikasyon fèt Pak la (Pesak) ak akonplisman li nan Kris la?",
    "categoryName": "Evènman Biblik yo",
    "options": [
      "Komemorasyon travèse larivyè Jouden an",
      "Mémorial liberasyon soti nan peyi Ejip — ti mouton Pak la se imaj Kris la, Ti Mouton Bondye a",
      "Selebre Lalwa nan mòn Sinayi",
      "Fèt rekòt yo"
    ],
    "explanation": "Pesak komemore Egzòd la — san ti mouton an sou pòt yo (Egzòd 12) se imaj san Kris la. Pòl di : « Kris la, Pak nou an, te ofri tèt li pou nou » (1 Korentyen 5:7)."
  },
  "dq-pmay-035": {
    "questionText": "Ki distenksyon ki genyen ant « pwofesi dirèk » ak « tip pwofetik » nan Ansyen Testaman an?",
    "categoryName": "Gwo Pwofèt yo",
    "options": [
      "Pwofesi dirèk la se vre; tip la se envansyon moun",
      "Pwofesi dirèk anonse evènman klè; tip la se yon pèsonaj oswa evènman ki montre yon reyalite ki pral fèt nan Kris la",
      "Pa gen tip nan Ansyen Testaman an — sèlman pwofesi nan pawòl",
      "Tip la toujou akonpli nan Ansyen Testaman an menm"
    ],
    "explanation": "Pwofesi dirèk : Ezayi 53 anonse Sèvitè k'ap soufri a. Tip : Adan se yon tip Kris la (Women 5:14), tabènak la montre travay Kris la (Hébreux 8-10)."
  },
  "dq-gen-022": {
    "questionText": "Ki siyifikasyon non ebre « Yahweh » (YHWH) a e kijan li te revele bay Moyiz?",
    "categoryName": "Jenèz",
    "options": [
      "« Sa ki gen tout pouvwa a » — revele nan kreyasyon an",
      "« Mwen se sa m ye a » (Ehyeh asher ehyeh) — revele nan touf bwa ki t'ap boule a",
      "« Bondye Alyans lan » — revele bay Abraram",
      "« Seyè tout lame yo » — revele nan batay Izrayèl yo"
    ],
    "explanation": "Egzòd 3:14 : « Mwen se sa m ye a » (YHWH ki soti nan vèb ebre 'être') — Bondye revele tèt li kòm sa ki la depi tout tan e ki fidèl ak pwomès li."
  },
  "dq-tema-016": {
    "questionText": "Ki Ebreyis ki dèyè mo « shalom » nan e poukisa li depase senp lapè?",
    "categoryName": "Tèm Biblik yo",
    "options": [
      "Shalom vle di sèlman pa gen lagè",
      "Shalom = entegrite/konplè nan tout dimansyon lavi a (relasyon, kò, sosyal, espirityèl) — yon eta plitid diven",
      "Shalom se yon fason pou di bonjou san sans pwofon",
      "Shalom vle di sèlman rekonsilyasyon ant Bondye ak moun"
    ],
    "explanation": "Shalom (שָׁלוֹם) : plis pase pa gen lagè — se byennèt, konplè nan tout bagay. Jezi se Shalom nou (Efezyen 2:14)."
  },
  "dq-doc-038": {
    "questionText": "Kisa doktrin « pèseverans sen yo » (oswa « sekirite etènèl ») ye?",
    "categoryName": "Doktrin",
    "options": [
      "Nenpòt moun ki fè lapriyè pechè a sove nèt pou tout tan",
      "Moun Bondye vrèman chanje yo ap pèsevere jouk sa kaba — sekirite a baze sou gras Bondye, pa sou travay moun",
      "Kwayan an ka pèdi salitasyon l e li ka jwenn li ankò selon sa l fè",
      "Se sèlman moun ki mouri pou lafwa ki asire salitasyon etènèl"
    ],
    "explanation": "Pèseverans sen yo : moun Bondye chwazi yo pèsevere nan lafwa non pa pa pwòp fòs yo, men pa gras Bondye k'ap kenbe yo (Jan 10:28-29; Filipyen 1:6)."
  },
  "dq-doc-039": {
    "questionText": "Kisa doktrin « pre-egzistans Kris la » ye e kijan li fonde nan Nouvo Testaman an?",
    "categoryName": "Doktrin",
    "options": [
      "Jezi te egziste an lespri anvan li te fèt men yo te kreye li",
      "Pitit la egziste pou tout tan anvan li te vin moun — Jan 1:1, 8:58, Filipyen 2:6-7, Kolosyen 1:17",
      "Pre-egzistans se yon doktrin katolik sèlman",
      "Jezi te egziste kòm yon zanj anvan li te vin moun"
    ],
    "explanation": "Pre-egzistans etènèl Pitit la : « Nan konmansman te gen Pawòl la » (Jan 1:1), « Anvan Abraram te fèt, mwen la » (Jan 8:58)."
  },
  "dq-doc-040": {
    "questionText": "Kisa doktrin « Inpasibilite divin » nan afime e èske li ka defann sou plan biblik?",
    "categoryName": "Doktrin",
    "options": [
      "Bondye pa santi anyen — doktrin san deba",
      "Bondye pa soufri tankou kreyati yo men Bib la pale de kòlè, renmen ak tristès Bondye",
      "Bondye soufri menm jan ak moun nan tout emosyon l",
      "Inpasibilite montre Bondye pa okipe soufrans moun"
    ],
    "explanation": "Inpasibilite (Augustin, Aquinas) : Bondye pa sibi emosyon tankou kreyati yo. Men Ekriti yo pale de « renmen Bondye », « kòlè Bondye » — tansyon ant Bondye ki depase nou ak Bondye ki toupre nou."
  },
  "dq-doc-041": {
    "questionText": "Ki siyifikasyon Asansyon Kris la (Akt 1:9-11) nan teyoloji kretyen an?",
    "categoryName": "Doktrin",
    "options": [
      "Jezi kite tè a pou l pa janm aji sou li ankò",
      "Asansyon an se lè Jezi monte chita sou fòtèy li bò dwat Papa a — li rènye, li lapriyè pou nou e li voye Lespri a",
      "Jezi tounen nan eta li te ye anvan an kòm lespri sèlman",
      "Asansyon an pwouve rezirèksyon an te espirityèl sèlman"
    ],
    "explanation": "Asansyon : Kris la monte bò dwat Papa a (Efezyen 1:20-21), li vin chèf (Filipyen 2:9-11), Gran Prèt k'ap lapriyè pou nou (Ebre 7:25)."
  },
  "dq-doc-042": {
    "questionText": "Kisa teyoloji Alyans lan (teyoloji federal) di sou estrikti istwa salitasyon an?",
    "categoryName": "Doktrin",
    "options": [
      "Chak epòk nan Bib la diferan nèt — pa gen okenn lyen",
      "Istwa a baze sou alyans diven (Kreyasyon, Gras) k'ap akonpli tikras pa tikras nan Kris la",
      "Alyans nan Ansyen Testaman yo se pou pèp sèlman e yo pa gen enpòtans pou kretyen",
      "Teyoloji federal di Kris la pa t bezwen mouri"
    ],
    "explanation": "Teyoloji federal : de alyans fondamantal — Alyans Travay (Adan) ak Alyans Gras (Kris la dezyèm Adan). Tout alyans yo ini nan Alyans Gras ki akonpli nan Kris la."
  },
  "dq-doc-043": {
    "questionText": "Kisa doktrin « rezirèksyon kòporèl » la ye e poukisa li esansyèl pou Levanjil la?",
    "categoryName": "Doktrin",
    "options": [
      "Kwayan yo ap resisite ak yon kò espirityèl sèlman san chè",
      "Kwayan yo ap resisite ak yon kò fizik glorye — menm jan ak Kris ki te gen mak kloure yo",
      "Rezirèksyon an se yon imaj pou lavi espirityèl kounye a",
      "Sèlman nanm nan k'ap viv apre lanmò"
    ],
    "explanation": "1 Korentyen 15 : rezirèksyon kòporèl tout bon — kò glorye. Kris resisite te manje, yo te manyen l (Lik 24:39-43) — modèl rezirèksyon pa nou."
  },
  "dq-doc-044": {
    "questionText": "Kisa konsèp ebre « berith » (alyans) vle di parapò ak yon kontra modèn?",
    "categoryName": "Doktrin",
    "options": [
      "Yon kontra kote de bò yo gen menm obligasyon",
      "Yon lyen pèsonèl solid ki fèt ak sèman e pafwa ak san — li plis pase yon kontra : li angaje moun nan yon relasyon fidelite",
      "Yon akò komèsyal ant de pèp",
      "Yon pwomès ak kondisyon Bondye ka retire"
    ],
    "explanation": "Berith (בְּרִית) : alyans — pa yon kontra biznis men yon angajman pèsonèl, pafwa sele ak san (Jenèz 15). Kreye yon relasyon fidelite (hesed) ki pèmanan."
  },
  "dq-doc-045": {
    "questionText": "Kisa doktrin « inyon ak Kris la » (unio mystica) ye ak ki dimansyon li genyen?",
    "categoryName": "Doktrin",
    "options": [
      "Yon melanj kote kwayan an vin Bondye tou",
      "Relasyon lavi ant kwayan an ak Kris la : reprezantasyon (nan Adan/nan Kris), espirityèl (Lespri a rete nan nou), reyèl",
      "Yon inyon sèlman nan Sen Sèn nan",
      "Yon eksperyans mistik pou moun espesyal sèlman"
    ],
    "explanation": "Inyon ak Kris : reprezantasyon (Women 5 — tout kwayan « nan Kris »), lavi (Jan 15:1-8 — pye rezen an), espirityèl (1 Korentyen 6:17). Se pa panteyis."
  },
  "dq-pmen-033": {
    "questionText": "Nan ki vil yo te voye Jonas al preche?",
    "categoryName": "Ti Pwofèt yo",
    "options": [
      "Babilòn",
      "Sodòm",
      "Niniv",
      "Tir"
    ],
    "explanation": "Bondye te voye Jonas al preche nan Niniv, gwo kapital peyi Lasiri a (Jonas 1:2)."
  },
  "dq-pmen-034": {
    "questionText": "Ki travay Amòs te konn fè anvan li te vin pwofèt?",
    "categoryName": "Ti Pwofèt yo",
    "options": [
      "Pèchè pwason",
      "Charpantye",
      "Gadò mouton e kiltivatè sikomò",
      "Prèt"
    ],
    "explanation": "Amòs te di : « Mwen te gadò mouton e mwen t'ap travay pye sikomò » (Amòs 7:14)."
  },
  "dq-pmen-035": {
    "questionText": "Ki dènye liv nan Ansyen Testaman an?",
    "categoryName": "Ti Pwofèt yo",
    "options": [
      "Zakari",
      "Joèl",
      "Malachi",
      "Abdyas"
    ],
    "explanation": "Malachi se dènye nan douz ti pwofèt yo e se dènye liv nan Ansyen Testaman an."
  },
  "dq-pmen-036": {
    "questionText": "Nan ki liv nou jwenn pwofesi sa a: « Nan ou menm, Betleyèm... pral soti moun ki pral chèf nan Izrayèl la »?",
    "categoryName": "Ti Pwofèt yo",
    "options": [
      "Amòs 5",
      "Miche 5",
      "Zakari 9",
      "Malachi 3"
    ],
    "explanation": "Miche 5:1 pwofetize nesans Mesi a nan Betleyèm, lavil David la."
  },
  "dq-pmen-037": {
    "questionText": "Ki vil Nawoum te pwofetize ki pral detwi?",
    "categoryName": "Ti Pwofèt yo",
    "options": [
      "Babilòn",
      "Samari",
      "Niniv",
      "Damas"
    ],
    "explanation": "Nawoum anonse destriksyon total Niniv, kapital peyi Lasiri a (Nawoum 1:1)."
  },
  "dq-pmen-038": {
    "questionText": "Ki pwofèt ki te voye yon mesaj pou rebati Tanp lan apre retou soti Babilòn?",
    "categoryName": "Ti Pwofèt yo",
    "options": [
      "Sofoni",
      "Abdyas",
      "Aje",
      "Joèl"
    ],
    "explanation": "Aje te ankouraje Zorobabèl ak pèp la pou yo rekòmanse bati Tanp lan (Aje 1:2-8)."
  },
  "dq-pmen-039": {
    "questionText": "Konbe vizyon lannwit Zakari te resevwa nan premye chapit liv li a?",
    "categoryName": "Ti Pwofèt yo",
    "options": [
      "4",
      "6",
      "8",
      "12"
    ],
    "explanation": "Zakari te resevwa 8 vizyon lannwit (Zakari 1-6) konsènan Jerizalèm ak lavni mesyanik li."
  },
  "dq-pmen-040": {
    "questionText": "Kont ki nasyon liv Abdyas la pwononse yon jijman total?",
    "categoryName": "Ti Pwofèt yo",
    "options": [
      "Moab",
      "Edòm",
      "Amon",
      "Filisti"
    ],
    "explanation": "Abdyas kondane Edòm (desandan Ezayi yo) pou jan yo te ògeye e jan yo te trayi Izrayèl (Abdyas 1:3)."
  }
};

const result = frData.map(item => {
  const trans = translations[item.newId];
  if (!trans) return null;
  
  return {
    newId: item.newId,
    ht: {
      id: item.newId,
      questionText: trans.questionText,
      categoryId: item.fr.categoryId,
      categoryName: trans.categoryName,
      difficulty: item.fr.difficulty,
      language: "ht",
      options: item.fr.options.map((opt, idx) => ({
        id: opt.id,
        text: trans.options[idx]
      })),
      correctOptionId: item.fr.correctOptionId,
      explanation: trans.explanation,
      bibleReference: item.fr.bibleReference,
      normalizedRef: item.fr.normalizedRef,
      normalizedCat: item.fr.normalizedCat
    }
  };
}).filter(Boolean);

fs.writeFileSync('c:\\Users\\junio\\Desktop\\200\\Juego\\Trivial App\\scratch\\ht_translated_inverse_batch3.json', JSON.stringify(result, null, 2), 'utf8');
console.log('Successfully generated ht_translated_inverse_batch3.json with ' + result.length + ' questions.');
