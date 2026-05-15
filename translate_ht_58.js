const fs = require('fs');

const translations = {
  "dq-sal-028": {
    "q": "Ki sòm repantans David te ekri apre peche l ak Batcheba a?",
    "opts": ["Sòm 32", "Sòm 51", "Sòm 38", "Sòm 130"],
    "exp": "Sòm 51 se gwo konfesyon David la: «Gen pitye pou mwen, O Bondye... efase transgresyon mwen yo» — ekri apre Natan te konfwonte l (Sòm 51:1-4)."
  },
  "dq-sal-029": {
    "q": "Nan ki sòm nou jwenn pwomès sa a: «L ap bay zanj li yo lòd pou yo pwoteje w nan tout wout ou»?",
    "opts": ["Sòm 34", "Sòm 46", "Sòm 91", "Sòm 103"],
    "exp": "«L ap bay zanj li yo lòd pou yo pwoteje w nan tout wout ou» — Sòm 91:11, yon vèsè Satan te site lè li t ap tante Jezi a (Matye 4:6)."
  },
  "dq-sal-030": {
    "q": "Kisa Sòm 150 la, ki se dènye Sòm nan, selebre?",
    "opts": ["Repantans pèp la", "Yon gwo «Alelouya» inivèsèl — tout sa ki gen souf fè lwanj Seyè a", "Viktwa Izrayèl sou lènmi l yo", "Glwa Tanp Salomon an"],
    "exp": "Sòm 150 se gwo doksoloji final la: li envite tout enstriman mizik ak tout kreyati pou fè lwanj Seyè a — «Se pou tout sa ki gen souf fè lwanj Seyè a!»"
  },
  "dq-sal-031": {
    "q": "Ki pwomès mesyanik Sòm 110:1 an genyen?",
    "opts": ["Mesi a pral fèt nan tribi Jida a", "Seyè a pale ak Seyè m nan: Chita sou bò dwat mwen", "Mesi a pral reye sot Siyon sou tout nasyon yo", "Mesi a pral yon gran prèt dapre lòd Levi a"],
    "exp": "Sòm 110:1: «Seyè a pale ak Seyè m nan: Chita sou bò dwat mwen» — se vèsè Ansyen Testaman an ki pi site nan Nouvo Testaman an konsènan kouwònman Kris la."
  },
  "dq-sal-032": {
    "q": "Nan Sòm 119:105, ak kisa yo konpare Pawòl Bondye a?",
    "opts": ["Yon epe byen file", "Yon lanp pou pye m ak yon limyè sou wout mwen", "Yon sous dlo vivan", "Yon boukliye ak yon zam"],
    "exp": "«Pawòl ou se yon lanp pou pye m ak yon limyè sou wout mwen» (Sòm 119:105) — imaj klasik Pawòl la k ap gide lavi a."
  },
  "dq-sal-033": {
    "q": "Kisa «sòm moute yo» (Sòm 120-134) vle di nan sans litijik?",
    "opts": ["Sòm yo te konn chante pandan viktwa militè yo", "Sòm pèlren yo te konn chante lè yo t ap moute Jerizalèm pou gwo fèt yo", "Sòm ki te rezève pou Levit yo nan Tanp lan", "Sòm yo te konn chante lè yo t ap tounen soti nan egzil Babilòn nan"],
    "exp": "15 sòm moute yo (Shir HaMaalot) se sòm pèlren yo te konn chante pandan yo t ap moute Jerizalèm pou twa fèt anyèl yo (Pak, Pannkòt, Fèt Joupa yo)."
  },
  "dq-sal-034": {
    "q": "Ki estrikti akrostich Sòm 119 la genyen e kisa li siyifi?",
    "opts": ["Chak vèsè kòmanse ak menm lèt ebre a", "22 seksyon ak 8 vèsè yo chak, swiv 22 lèt alfabè ebre a", "Inisyal chak vèsè fòme non David", "Chak seksyon koresponn ak yon kòmandman nan Dekalòg la"],
    "exp": "Sòm 119 se yon akrostich alfabetik ebre: 22 seksyon × 8 vèsè, kote chak seksyon kòmanse ak yon lèt diferan nan alfabè a — li se yon gwo meditasyon sou Lalwa."
  },
  "dq-sal-035": {
    "q": "Poukisa yo konsidere Sòm 22 kòm yon pwofesi sou Pasyon Kris la?",
    "opts": ["Li dekri trèt Jida a avèk presizyon", "Li dekri abandone, mokri, pataje rad yo ak swaf moun ki kloure sou kwa a", "Li predi rezirèksyon nan twazyèm jou a", "Li anonse antre triyonfal nan Jerizalèm nan"],
    "exp": "Sòm 22 anonse krisifiksyon an: Bondye abandone l (v.1), mokri (v.7-8), men l ak pye l pèse (v.16), tiraj osò rad li yo (v.18) — tout sa te akonpli sou kwa a."
  },
  "dq-sal-036": {
    "q": "Ki sòm ki gen gwo deklarasyon sa a «Seyè a ap reye» epi ki enpòtans teyolojik li?",
    "opts": ["Sòm 93-99 — sòm ki pale sou dominasyon Bondye yo", "Sòm 72 — rèy mesyanik Salomon an", "Sòm 2 — inogirasyon wa David la", "Sòm 24 — antre Wa glwa a"],
    "exp": "Sòm 93-99 se sòm ki pale sou dominasyon Seyè a, ki pwoklame «YHWH reye» — souverènte cosmic li ak eskatolojik li sou tout nasyon yo."
  },
  "dq-sal-037": {
    "q": "Kisa mo ebre «Selah» ki souvan itilize nan Sòm yo vle di?",
    "opts": ["Amèn — se pou sa fèt", "Yon ti poz mizikal oswa litijik ki envite moun nan medite", "Moute — envitasyon pou leve vwa a", "Glwa — aklamasyon pou Bondye"],
    "exp": "Selah (ebre) parèt 71 fwa nan Sòm yo. Sans egzat li pa sèten men sanble li endike yon poz mizikal oswa yon ogmantasyon vwa pou medite."
  },
  "dq-pat-016": {
    "q": "Kiyès Enòk te ye e ki jan lafen l te yon fason ekstraòdinè?",
    "opts": ["Li te mouri lè l te gen santan nan Our", "Li t ap mache ak Bondye epi Bondye te pran l san l pa mouri", "Li te premye moun ki te konstwi yon lotèl", "Li te transfòme an yon zanj"],
    "exp": "Enòk te mache ak Bondye pandan 300 an, epi li te disparèt paske Bondye te pran l — li pa t goute lanmò (Jenèz 5:24; Ebre 11:5)."
  },
  "dq-pat-017": {
    "q": "Kiyès Noye te ye e poukisa Bondye te chwazi l?",
    "opts": ["Moun ki te pi granmoun nan epòk li a", "Yon moun ki dwat, ki san repwòch e ki t ap mache ak Bondye", "Premye prèt nan limanite", "Yon chapantye trè konpetan yo te chwazi pou talan l"],
    "exp": "Noye se te «yon moun ki dwat, ki san repwòch nan mitan moun nan epòk li yo» ki t ap mache ak Bondye, se poutèt sa Bondye te chwazi l pou sove limanite a (Jenèz 6:9)."
  },
  "dq-pat-018": {
    "q": "Kiyès Rit te ye e ki zak fidelite selèb li te fè nan liv ki pote non l lan?",
    "opts": ["Yon pwofetès ebre ki t ap gide Naomi", "Yon fi Mowab ki te rete fidèl ak Naomi bèlmè li, ak Bondye Izrayèl la", "Yon fanm nan Jeriko ki te kache espyon yo", "Yon jij nan Izrayèl ki te delivre pèp la"],
    "exp": "Rit, yon vèv mowabit, te di Naomi: «Pèp ou ap pèp mwen, Bondye w ap Bondye m» — yon modèl fidelite (Rit 1:16-17)."
  },
  "dq-pat-019": {
    "q": "Kiyès Estè te ye e ki zak kouraj li te fè?",
    "opts": ["Yon pwofetès ki te sove Jerizalèm", "Yon rèn jwif ki te riske lavi l pou sove pèp li a anba men Aman", "Madanm Moyiz ki te entèsede pou Izrayèl", "Yon fanm de fwa ki te refize idolatri lavil Babilòn nan"],
    "exp": "Estè, rèn Pès la, te al devan wa a san l pa t envite l — riske lavi l — pou revele konplo Aman an epi sove Juif yo (Estè 4:16; 7:3-6)."
  },
  "dq-pat-020": {
    "q": "Kisa Eli te fè sou mòn Kamèl la pou l te pwouve se YHWH ki vrè Bondye a?",
    "opts": ["Li te fè lapli tonbe apre twazan sechrès", "Li te defye pwofèt Baal yo epi dife Bondye te desann boule sakrifis li a ki te tranpe nan dlo", "Li te resisite pitit gason fanm Sounam lan devan pèp la", "Li te kraze lotèl Baal yo ak men li"],
    "exp": "Eli te fè wouze lotèl li a twa fwa ak dlo, epi l te priye. Dife Seyè a tonbe epi l boule sakrifis la, bwa yo, wòch yo ak dlo a — pèp la te pran rele: «Se Seyè a ki Bondye!» (1 Wa 18:38)."
  },
  "dq-pat-021": {
    "q": "Ki wòl Samyèl te jwe nan tranzisyon ant epòk jij yo ak monachi a nan Izrayèl?",
    "opts": ["Li te dènye jij, pwofèt, ak moun ki te chwazi Sayil ak David", "Li te premye wa Izrayèl anvan Sayil", "Li te gran prèt ki te konstwi sanktiyè Silo a", "Li te entèmedyè ant Moyiz ak Jozye"],
    "exp": "Samyèl se te dènye nan jij yo, pwofèt nasyonal, epi fondatè lekòl pwofèt yo. Li te chwazi Sayil (1 Samyèl 10) epi David (1 Samyèl 16) kòm wa."
  },
  "dq-pat-022": {
    "q": "Dapre Ezekyèl 1-3, kòman Ezekyèl te resevwa vokasyon pwofetik li a?",
    "opts": ["Nan yon rèv lannwit nan Babilòn", "Nan yon vizyon kote li wè glwa Bondye avèk kat kreyati vivan ak plizyè wou", "Grasa yon zanj ki te manyen bouch li ak yon chabon dife", "Paske li te tande vwa Bondye nan yon ti van dou"],
    "exp": "Ezekyèl te fè yon vizyon estrawòdinè: kat kreyati vivan, wou anndan wou, glwa Bondye — Mèkaba a. Yo te voye l al pwofetize pou pèp Izrayèl (Ezekyèl 1-3)."
  },
  "dq-pat-023": {
    "q": "Kiyès Neyemi te ye e ki te pi gwo kontribisyon l nan retou soti nan egzil la?",
    "opts": ["Yon pwofesè lalwa ki te reli Lalwa a pou pèp la", "Yon gouvènè ki te òganize rekonstriksyon miray Jerizalèm yo nan 52 jou", "Yon gran prèt ki te retabli adorasyon nan Tanp lan", "Yon pwofèt ki te ankouraje moun k ap bati Tanp lan"],
    "exp": "Neyemi, moun k ap sèvi wa Pès la diven, te tounen kòm gouvènè epi li te rebati miray Jerizalèm yo nan sèlman 52 jou malgre tout opozisyon yo (Neyemi 6:15)."
  },
  "dq-pat-024": {
    "q": "Ki pèsonaj nan Ansyen Testaman an ki pi pre yon figi pwofèt k ap soufri tankou vizyon nan Ezayi 52-53 a?",
    "opts": ["Moyiz k ap entèsede pou pèp Izrayèl la", "Sèvitè k ap Soufri a — kretyen yo idantifye kòm Jezi", "Jeremi pwofèt k ap kriye a", "Jòb nan soufrans li yo"],
    "exp": "Sèvitè k ap Soufri ki nan Ezayi 52:13-53:12 a, li te «blese pou peche nou yo». Kretyen yo idantifye l kòm Mesi Jezi a; Juif yo wè li kòm pèp Izrayèl la oswa yon pèsonaj alavni."
  },
  "dq-pat-025": {
    "q": "Poukisa nan teyoloji biblik yo konsidere Jozye kòm yon modèl pou Jezi?",
    "opts": ["Toude te viv pou 110 zan", "Jozye (Yehoshua) pataje menm non avèk Jezi e li te fè pèp li antre nan Tè Pwomiz la tankou jan Jezi fè nou antre nan repo nan syèl la", "Toude te sèvi kòm pwofèt ak prèt", "Jozye te fè menm mirak ak Jezi yo"],
    "exp": "Yehoshua (Jozye) = Iēsous (Jezi) an grèk. Ebre 4:8-9 eksplike si Jozye te bay yo repo a vre, Bondye pa ta gen bezwen pale apre sa sou yon lòt jou — Jezi se li menm ki bay vrè repo a."
  },
  "dq-pat-026": {
    "q": "Kiyès Bowaz te ye nan liv Rit la epi ki konsèp jiridik li ilistre?",
    "opts": ["Yon jij nan Izrayèl ki te adopte Rit legalman", "Yon goèl (redanmtè) — paran pwòch ki rachte yon fanmi ki vin pòv", "Yon pwofèt ki te predi maryaj ant Juif yo ak moun Mowab yo", "Papa Jese epi granpapa David"],
    "exp": "Bowaz se goèl la (moun k ap rachte a) — yon enstitisyon ebre kote yon paran pwòch te konn rachte byen ansanm ak fanmi yon moun ki vin pòv. Li reprezante Kris, Redanmtè nou an (Rit 4:1-10)."
  },
  "dq-pat-027": {
    "q": "Ki valè teyolojik karaktè Jòb ak soufrans ineksplikab li a genyen?",
    "opts": ["Jòb te pwouve ke soufrans se toujou yon pinisyon ki soti nan Bondye", "Jòb te montre ke moun ki dwat kapab soufri san se pa yon pinisyon — souverènte Bondye depase sa moun ka konprann", "Jòb te finalman abandone lafwa l poutèt soufrans li yo", "Jòb te dekouvri Satan te gen kontwòl total sou lavi l"],
    "exp": "Jòb defye teyoloji rekonpans lan. Pèsonn moun pa ka eksplike soufrans li a. Bondye te reponn soti nan mitan tanpèt la: souverènte l depase entèlijans imen an (Jòb 38-42)."
  },
  "dq-pat-028": {
    "q": "Kisa vokasyon Ezayi a ki nan chapit 6 la revele sou nati Bondye ak sou pwofèt la?",
    "opts": ["Tout pouvwa Bondye fas ak feblès fizik pwofèt la", "Sentete absoli Bondye a (twa fwa sen) ak eta pwofèt la ki pa t diy men ki te jwenn pirifikasyon nan chabon dife a", "Eleksyon Ezayi depi anvan li te fèt", "Plan delivrans pou 70 nasyon yo"],
    "exp": "Vizyon twa fwa sen (Sen, Sen, Sen) revele sentete absoli YHWH la. Devan l, Ezayi di: «Mwen fini» — yon chabon dife pirifye bouch li epi l aksepte misyon l (Ezayi 6:1-8)."
  },
  "dq-pat-029": {
    "q": "Kisa non «Danyèl» vle di e ki jan fidelite l montre sa vle di viv nan dyaspora a?",
    "opts": ["Bondye fò — li te rete fidèl nan fòs fizik", "Bondye se jij mwen — li te rete fidèl ak Bondye nan mitan yon kilti etranjè ak lènmi", "Bondye konsole — li te konsole ekzile yo ak pwofesi l yo", "Bondye beni — li te resevwa tout benediksyon Babilòn yo"],
    "exp": "Danyèl (Bondye se jij mwen) se modèl pou w rete fidèl pandan w nan dyaspora a: li te refize manje vyann ki pa t pwòp, lapriyè twa fwa pa jou malgre dekrè yo, enperatif pou rete dwat devan wa Babilòn nan."
  },
  "dq-pnt-016": {
    "q": "Kiyès Mari-Madlèn te ye nan Levanjil yo?",
    "opts": ["Manman Jezi", "Yon fi Jezi te chase 7 demon sou li e ki te temwen rezirèksyon l lan", "Fi adiltè Jezi te padone a", "Sè Laza a"],
    "exp": "Mari, moun Magdala a, te libere anba 7 move lespri. Li te akonpaye Jezi, li te prezan bò kwa a epi se li menm premye moun ki te anonse rezirèksyon l lan (Lik 8:2; Jan 20:18)."
  },
  "dq-pnt-017": {
    "q": "Kiyès Zache te ye epi poukisa konvèsyon li a espesyal?",
    "opts": ["Yon farizyen ki te konvèti e ki te vin disip", "Yon chèf pèseptè kontribisyon, li te rich, li t ap chèche wè Jezi e li te renmèt byen l yo", "Yon avèg Jezi te geri nan Jeriko", "Yon pwofesè lalwa ki te kesyone Jezi sou pi gwo kòmandman an"],
    "exp": "Zache, chèf pèseptè kontribisyon nan Jeriko a, te moute nan yon pye sikomò pou l wè Jezi. Jezi te rele l, epi Zache te pwomèt l ap renmèt kat fwa plis pou sa li te pran an (Lik 19:1-9)."
  },
  "dq-pnt-018": {
    "q": "Kiyès Filip, moun k ap preche bòn nouvèl la te ye e ki gran misyon li te akonpli?",
    "opts": ["Apot Filip, youn nan douz disip yo", "Youn nan 7 dyak yo ki te evanjelize Samari epi ki te batize enik Etyopyen an", "Moun ki te akonpaye Banabas nan Chip la", "Premye evèk vil Efèz la"],
    "exp": "Filip evanjelis la, youn nan 7 dyak yo, te preche nan Samari epi Lespri a te transpòte l apre l te fin batize enik Etyopyen an (Travay 8:5-8, 26-40)."
  },
  "dq-pnt-019": {
    "q": "Kiyès Timote te ye e ki lyen li te gen ak Pòl?",
    "opts": ["Yon jèn zanmi nan Antyòch ki te rejwenn Pòl nan Korent", "Pitit espirityèl Pòl, ki te fèt nan yon manman jwif ki kwè nan Bondye ak yon papa grèk", "Yon disip Pòl te voye lavil Wòm", "Entèprèt Pòl pou lòt nasyon yo"],
    "exp": "Timote, ki te fèt List, te gen yon manman jwif ki te kwè (Enis) ak yon papa grèk. Pòl te sikonsi l epi l te mennen l avè l nan vwayaj li yo. Li te ekri l de lèt (Travay 16:1-3; 2 Timote 1:5)."
  },
  "dq-pnt-020": {
    "q": "Ki wòl fanm yo te jwe nan rezirèksyon an dapre tout levanjil yo?",
    "opts": ["Yo pa t ale nan kavo a", "Yo se premye moun ki te temwen kavo vid la e premye moun ki te anonse rezirèksyon an", "Yo te mande Pyè pou l al verifye", "Yo te rapòte sèlman bay Jan"],
    "exp": "Medam yo (Mari-Madlèn, Mari manman Jak, Salome, elatriye) te ale nan kavo a, se yo menm ki premye jwenn wòch la woule epi yo te anonse rezirèksyon an (Mak 16:1-7)."
  },
  "dq-pnt-021": {
    "q": "Ki wòl Anànyas te jwe nan konvèsyon Sòl nan Damas?",
    "opts": ["Li te rapòte arive Sòl bay otorite yo", "Seyè a te voye l, li te mete men l sou Sòl epi l te fè l wè ankò", "Li te batize l nan rivyè Jouden an", "Li te anseye l Levanjil yo pandan twazan"],
    "exp": "Anànyas, yon disip nan Damas, te ale sou lòd Seyè a malgre l te pè. Li te mete men l sou Sòl — je l te louvri epi yo te batize l (Travay 9:10-18)."
  },
  "dq-pnt-022": {
    "q": "Kiyès Lidi te ye e ki enpòtans l te genyen nan premye vwayaj Pòl an Masedwàn?",
    "opts": ["Yon pwofetès lavil Tesalonik", "Premye moun ki te konvèti an Ewòp — yon komèsan ki t ap vann bèl twal wouj violèt ki sot Tiyati, Seyè a te louvri kè l", "Otès Pòl nan vil Atèn", "Pitit fi yon chèf sinagòg nan lavil Bere"],
    "exp": "Nan Filip, Lidi, k ap vann bèl twal wouj violèt la, t ap tande Pòl. «Seyè a te louvri kè l.» Yo te batize l avèk tout moun lakay li — premye moun ki konvèti sou tè ewòpeyen an (Travay 16:14-15)."
  },
  "dq-pnt-023": {
    "q": "Kiyès Kònèy te ye e ki gwo etap konvèsyon l lan reprezante?",
    "opts": ["Yon Juif nan dyaspora a apot Filip te konvèti", "Yon ofisye nan lame women an ki te gen krentif pou Bondye — premye fwa Pyè te ofisyèlman konvèti yon moun ki pa Juif", "Yon ofisye women ki te kwè apre l te fin wè krisifiksyon an", "Yon filozòf grèk ki te konvèti nan vil Atèn"],
    "exp": "Kònèy, yon kòmandan santinyon women ki te gen krentif pou Bondye, te resevwa Pyè apre yon zanj te di l sa. Sentespri a te desann sou li ak sou moun lakay li — pòtay ofisyèl Levanjil la pou moun ki pa jwif yo (Travay 10:44-48)."
  },
  "dq-pnt-024": {
    "q": "Kiyès Apolòs te ye e ki sa ki te espesyal nan fòmasyon biblik li?",
    "opts": ["Yon disip Pòl ki te resevwa fòmasyon nan Jerizalèm", "Yon juif moun Aleksandri ki te konn pale byen men ki te konnen sèlman batèm Jan an — Akilas ak Prisil te anseye l", "Yon moun Lagrès ki te fò nan diskou ki te konvèti nan Korent", "Yon Levit yo te voye sot Jerizalèm pou anseye nan vil Efèz"],
    "exp": "Apolòs, yon moun Aleksandri, te konn Ekriti yo byen men li te konnen sèlman batèm Jan an. Akilas ak Prisil te pran l sou kote, yo eksplike l chemen Bondye a pi byen (Travay 18:24-26)."
  },
  "dq-pnt-025": {
    "q": "Poukisa Pòl ak Banabas te separe pandan dezyèm vwayaj misyonè a?",
    "opts": ["Pòl te vle ale nan Lazi, Banabas te vle al nan Masedwàn", "Yo pa t antann yo akoz Jan-Mak ki te kite yo nan Panfili a", "Banabas te refize preche pou lòt nasyon yo", "Yon gwo diskisyon teyolojik sou sikonsizyon"],
    "exp": "Banabas te vle mennen Jan-Mak. Pòl te refize paske li te kite yo nan Panfili a. «Gwo chire pit pete nan mitan yo, sa fè yo separe» (Travay 15:37-39)."
  },
  "dq-pnt-026": {
    "q": "Kisa Lik te pote kòm otè biblik ak ki patikilarite l?",
    "opts": ["Li ekri Levanjil la ak liv Travay Apot yo — se sèl otè nan Nouvo Testaman an ki pa t Jwif asireman epi ki te yon doktè", "Li te ekri Levanjil la ansanm ak twa lèt jeneral", "Li te evanjelis Pòl te genyen an sèlman pou Juif yo", "Li te ekri Levanjil la ansanm ak lèt pou moun Ebre yo"],
    "exp": "Lik se otè Levanjil ki pote non l lan ansanm ak liv Travay Apot yo — ki se pi gwo moso nan Nouvo Testaman an. Antanke doktè (Kolosyen 4:14), epi pwobableman li pa t Jwif, li ofri pèspektiv ki pi inivèsèl la."
  },
  "dq-pnt-027": {
    "q": "Kisa transfigirasyon Jan an siyifi nan liv Apokalips la — wòl li kòm «pwofèt»?",
    "opts": ["Jan te eli kòm apot sèlman pou l te ekri liv Apokalips la", "Jan, «disip Jezi te renmen an», te resevwa nan zile Patmòs revelasyon sou Jezi ki glorifye pou legliz ki nan zòn Lazi yo", "Jan te ranplase Pyè kòm chèf Legliz la apre lanmò Pòl", "Jan te ekri Apokalips la pandan li te anba efè medikaman nan vil Efèz"],
    "exp": "Jan, pandan l te nan egzil sou zile Patmòs la, te resevwa vizyon sou Jezi ki resisite a e ki nan laglwa li. Antanke «pwofèt», li te bay mesaj yo pou sèt legliz nan pwovens Lazi yo (Apokalips 1:9-11)."
  },
  "dq-pnt-028": {
    "q": "Kiyès Silas (Silven) te ye e ki wòl li te jwe nan misyon Pòl la?",
    "opts": ["Yon chèf nan Legliz lavil Wòm yo te voye kòm anbasadè", "Yon pwofèt ki te nan Legliz Jerizalèm nan, konpayon Pòl depi nan dezyèm vwayaj misyonè a", "Moun ki t ap ekri pou Pyè nan premye lèt li a, ak yon dyak nan vil Korent", "Moun ki te ranplase Jida pami douz apot yo"],
    "exp": "Silas (Silven) se te yon pwofèt nan lavil Jerizalèm (Travay 15:32). Li te vin akonpaye Pòl nan dezyèm vwayaj la (Travay 15:40) e li te kolabore nan 1 Tesalonisyen ak 1 Pyè (1 Pyè 5:12)."
  },
  "dq-doc-046": {
    "q": "Kisa doktrin ki di Bib la pa gen erè a anseye?",
    "opts": ["Bib la pa gen okenn enfòmasyon syantifik ladan l", "Bib la, nan tèks orijinal li yo, pa gen okenn erè nan tout sa li deklare", "Se sèlman liv pwofetik yo ki gen enspirasyon nan men Bondye", "Apot yo pa t ka fè okenn erè nan lèt yo t ap ekri yo"],
    "exp": "Bib la pa gen erè: tèks orijinal yo pa gen erè paske se Bondye li menm ki enspire yo — «Se Lespri Bondye ki enspire tout Ekriti yo» (2 Timote 3:16)."
  },
  "dq-doc-047": {
    "q": "Kisa doktrin «rezirèksyon fizik» kwayan yo vle di?",
    "opts": ["Nanm yo pral monte nan syèl la san yon kò", "Kwayan yo pral resisite avèk yon kò glorifye menm jan ak Kris la", "Se sèlman mati yo ki resisite", "Rezirèksyon an fèt sèlman sou plan espirityèl"],
    "exp": "Kwayan yo pral resisite avèk yon kò ki glorifye e ki pa ka pouri, nan imaj rezirèksyon Kris la (1 Korentyen 15:42-44; Filipyen 3:21)."
  },
  "dq-doc-048": {
    "q": "Ki diferans ki genyen ant doktrin ki di Bondye konnen tout bagay ak sa k di Bondye gen tout pouvwa a?",
    "opts": ["Se de non pou menm kalite Bondye genyen an", "Konnen tout bagay = Bondye konnen tout bagay; Tout pouvwa = Bondye ka fè tout bagay dapre nati li", "Konnen tout bagay se pou lepase; Tout pouvwa se pou lavni", "Tout pouvwa a aplike sèlman nan sa k gen rapò ak kreyasyon an"],
    "exp": "Konnen tout bagay = Bondye konnen tou (Sòm 139:1-4). Tout pouvwa = Bondye gen tout pouvwa sou tout sa k posib dapre nati li (Jeremi 32:17). Kalite sa yo diferan men ou pa ka separe yo."
  },
  "dq-doc-049": {
    "q": "Kisa doktrin «pre-egzistans Kris la» vle di?",
    "opts": ["Jezi te egziste sèlman nan panse Bondye depi anvan l te fèt", "Pitit Bondye a te egziste depi toujou, anvan li te vin tounen moun nan Betleyèm", "Jezi te yon zanj anvan li te vin tounen moun", "Pre-egzistans la konsène Sentespri a sèlman"],
    "exp": "Kris la te la pou tout tan: «Nan kòmansman, Pawòl la te la» (Jan 1:1); «Anvan Abraram te fèt la, mwen la» (Jan 8:58); «Glwa mwen te genyen ansanm ak ou anvan menm lemonn te egziste a» (Jan 17:5)."
  },
  "dq-doc-050": {
    "q": "Ki diferans ki genyen ant «Jijman pou zèv yo» ak «Jijman gwo fòtèy blan an» nan etid sou lafen tan yo?",
    "opts": ["Se de non pou menm evènman an", "Tribinal Kris la (Bema) jije sa kwayan yo te fè; Gwo fòtèy blan an jije moun ki pa kwayan yo", "Jijman pou zèv yo fèt 100 an anvan Gwo fòtèy blan an", "Se sèl moun ki mouri k ap jije devan Gwo fòtèy blan an"],
    "exp": "Tribinal Kris la (Bema) (2 Korentyen 5:10) evalye travay kwayan yo pou ba yo rekonpans. Gwo fòtèy blan an (Apokalips 20:11-15) se jijman final la pou moun ki pa t kwè yo."
  },
  "dq-doc-051": {
    "q": "Kisa doktrin «kominikasyon kalite yo» (communicatio idiomatum) vle di?",
    "opts": ["Bondye pataje kalite li yo ak kwayan yo grasa Sentespri a", "Kalite yo nan de nati Kris yo (Bondye epi Moun) kapab atribiye ak yon sèl pèsonn, ki se Kris la", "Apot yo te resevwa kalite ki soti nan Bondye pou yo ka fè mirak", "La Trinite pataje sèten kalite ant twa pèsonn yo"],
    "exp": "Communicatio idiomatum: piske Kris la se yon sèl pèsonn, nou ka di «Pitit Bondye a te soufri» oswa «Mari se Manman Bondye» — lè n atribiye bay pèsonn sa ki pou youn oubyen pou lòt nati a."
  },
  "dq-doc-052": {
    "q": "Ki diferans ki genyen ant teyoloji apofatik ak teyoloji katafatik?",
    "opts": ["Youn se pou Ansyen Testaman an, lòt la pou Nouvo Testaman an", "Apofatik di sa Bondye pa ye (yon chemen negatif); katafatik di sa Bondye ye (yon chemen pozitif)", "Youn se òtodòks, lòt la se katolik", "Youn konsène lapriyè, lòt la konsène pwofesi"],
    "exp": "Teyoloji negatif (apofatik): Moun pa ka fin konprann Bondye — nou ka sèlman di sa l pa ye. Teyoloji pozitif (katafatik): nou deklare kalite Bondye genyen ki baze sou revelasyon an."
  },
  "dq-doc-053": {
    "q": "Kisa doktrin «Filioque» a te fè an 1054 ki te lakòz Legliz la divize a di?",
    "opts": ["Si Mari te fèt san peche orijinal la", "Si Sentespri a soti nan Papa a sèlman oswa nan Papa a ak nan Pitit la tou", "Si pap la te gen otorite sou patriyach ki nan Lès yo", "Si ekaristik la se vrè kò Kris la"],
    "exp": "Filioque («epi Pitit la»): Legliz nan Lwès la te ajoute Sentespri a soti nan Papa a EPI nan Pitit la tou. Legliz nan Lès la kenbe pozisyon ki di l soti nan Papa a sèlman. Sa te ede lakòz Gwo Chism nan an 1054."
  },
  "dq-doc-054": {
    "q": "Kisa teyoloji alyans lan ye epi ki de gwo alyans li yo?",
    "opts": ["Teyoloji 12 alyans nan Ansyen Testaman an sèlman", "Yon sistèm ki òganize revelasyon yo alantou yon alyans dapre travay la (Adan) epi yon alyans lagras (Kris la)", "Doktrin katolik sou sakreman yo ki sèvi tankou sele pou alyans yo", "Yon etid konparezon ant alyans diferan nasyon yo te fè nan tan lontan"],
    "exp": "Teyoloji alyans lan (Kalsven, Kosiyis): Alyans Travay avèk Adan (obeyi pou jwenn lavi). Alyans Lagras apre chit la (Kris reprezante moun ki chwazi yo). Nouvo fason sa a pèmèt yo li tout Bib la."
  },
  "dq-evg-026": {
    "q": "Ki levanjil ki kòmanse avèk deklarasyon sa a «Nan kòmansman, Pawòl la te la»?",
    "opts": ["Matye", "Mak", "Lik", "Jan"],
    "exp": "Levanjil Jan an kòmanse konsa: «Nan kòmansman, Pawòl la te la. Pawòl la te avèk Bondye. Sa Pawòl la te ye a, se sa Bondye ye tou» (Jan 1:1)."
  },
  "dq-evg-027": {
    "q": "Nan kat levanjil yo, kiyès ki pi kout la?",
    "opts": ["Matye", "Mak", "Lik", "Jan"],
    "exp": "Levanjil Mak la se sa k pi kout la avèk 16 chapit — yo konnen l pou fason l ekri ki rapid e dinamik (mo «menm lè a» vrèman itilize anpil ladan l)."
  },
  "dq-evg-028": {
    "q": "Ki levanjil ki gen parabòl Bon Samariten an ansanm ak Pitit Gason Pwodig la?",
    "opts": ["Matye", "Mak", "Lik", "Jan"],
    "exp": "De (2) parabòl sa yo ki tèlman enpòtan se nan Lik sèlman nou jwenn yo (Lik 10:25-37; Lik 15:11-32) — evanjelis la ki konsantre l sou favè pou moun yo rejte yo."
  },
  "dq-evg-029": {
    "q": "Ki levanjil ki prezante Jezi sitou kòm «Wa Juif yo» epi ki site Ansyen Testaman an pi plis?",
    "opts": ["Matye", "Mak", "Lik", "Jan"],
    "exp": "Matye te ekri l sitou pou Jwif yo, pou l ka prezante Jezi kòm Mesi David la. Li pa sispann site Ansyen Testaman an avèk fraz sa a «pou pawòl sa a te ka rive vre» (Matye 1:22)."
  },
  "dq-evg-030": {
    "q": "Kisa diskou Jezi ki pale de «Pen lavi a» nan Jan 6 la vle di?",
    "opts": ["Jezi t ap bay anseyman sou fason pou n gen yon pi bon alimantasyon fizik", "Jezi t ap prezante tèt li kòm manje espirityèl la — kwè nan li, se «manje» kò li epi «bwè» san li", "Li te anonse kijan pou yo fè fèt Sentsèn nan", "Li t ap anseye fason yo fè jèn kòm yon disiplin nan lavi espirityèl yon moun"],
    "exp": "«Mwen se pen ki bay lavi a; moun ki vin jwenn mwen p ap janm grangou» (Jan 6:35). Manje kò l epi bwè san l = kwè nan sakrifis li a — diskou sa a te choke anpil moun e anpil nan yo te vire do ba li."
  },
  "dq-evg-031": {
    "q": "Ki enpòtans batèm Jezi te pran nan men Jan Batis la si Jezi pa t janm fè peche?",
    "opts": ["Jezi te bezwen pou yo pirifye l kòm senbòl", "Pou l te kapab akonpli tout sa ki jis — idantifye l ansanm ak ras imen an ki te pechè e l t ap vin sove yo a", "Pou l te kapab resevwa Sentespri a ki pa t ap desann sou li si l pa t batize", "Pou l te fè Jan Batis plezi, paske Jan pa t vle batize l san pa gen yon bon rezon pou sa"],
    "exp": "Jezi di: «Kite sa fèt konsa koulye a; se konsa pou nou fè tou sa Bondye mande» (Matye 3:15) — li te idantifye l ak tout pechè li te vin sove yo."
  },
  "dq-evg-032": {
    "q": "Ki pwa Gran Misyon nan Matye 28:19-20 an genyen pou Legliz la?",
    "opts": ["Yon misyon sèlman pou apot premye syèk yo", "Misyon pèmanan Legliz la genyen pou l fè disip nan tout nasyon yo", "Yon pwomès konsènan yon gwo viktwa militè pou Izrayèl", "Yon lòd yo bay pou moun ki se evanjelis pwofesyonèl yo sèlman"],
    "exp": "«Ale fè disip nan tout nasyon yo... Mwen avèk nou toulejou, jouk sa kaba» — yon misyon inivèsèl epi k ap dire tout tan pou Legliz la (Matye 28:19-20)."
  },
  "dq-evg-033": {
    "q": "Ki diferans ki genyen ant levanjil sinoptik yo (Matye, Mak, Lik) ak Levanjil Jan an?",
    "opts": ["Sinoptik yo ekri an grèk, tandiske Jan ekri an arameyen", "Matye, Mak ak Lik gen anpil istwa komen ansanm; Jan vrèman diferan avèk detay teyolojik e avèk yon etid sou Kris la ki trè diferan", "Levanjil Jan an te ekri anvan tou le twa lòt yo", "Levanjil sinoptik yo te destine pou Juif yo, Levanjil Jan an pou Women yo"],
    "exp": "Sinoptik yo (Matye, Mak, Lik) pataje environ 80% enfòmasyon ki menm yo. Levanjil Jan an vrèman diferan: nan kòmansman li pale sou divinite Kris la, diskou yo pi long, premye mirak ki fèt nan nòs Kana a, Laza ki resisite a, chapit 14 rive 17."
  },
  "dq-evg-034": {
    "q": "Kisa teyori ki di levanjil Mak la te premye a vle di nan etid sinoptik yo?",
    "opts": ["Mak te ekri aprè Matye e li te depann de levanjil Matye a", "Mak te premye ki te ekri epi Matye ansanm ak Lik te itilize l kòm sous prensipal yo", "Levanjil Mak la se rezime levanjil Matye ak Lik la", "Se Pyè ki te ekri levanjil Mak la, se pa t Mak ki te ekri l"],
    "exp": "Teyori ki pi gaye nan etid biblik: Mak te premye ekri (~anviwon ane 65 apre Jezikri), Matye ak Lik te itilize l e yo te ajoute kèk nan eleman pawòl ki rele «Q» ansanm ak pa yo."
  },
  "dq-evg-035": {
    "q": "Kisa «Kenòz» vle di lè n ap pale de enkanasyon Kris la (Filipyen 2:7)?",
    "opts": ["Jezi te abandone divinite l lè l t ap fèt tankou yon moun", "Pitit Bondye a «te bese tèt li» volontèman epi li te aksepte wete tout dwa ki te pou li pou l vin tounen yon sèvitè", "Kris la te rejwenn pozisyon Bondye l la nèt sèlman lè l te resisite a", "Divinite Kris la te sèlman kache andedan yon kò moun menm jan moun mete yon rad"],
    "exp": "Kenòz (Filipyen 2:7 — «li te dezabiye tèt li»): Kris la te viv anba depandans Papa a san li pa t chèche sèvi ak pwòp dwa li nan kò moun lan — vrèman Bondye epi vrèman moun."
  },
  "dq-evg-036": {
    "q": "Ki sans teyolojik 7 siy nan Jan yo ansanm ak estrikti naratif li a genyen?",
    "opts": ["Gen prèv syantifik sou divinite Jezi", "7 aksyon ki revele glwa Jezi — yo chak siyifi idantite l — tout sa abouti nan rezirèksyon Laza a", "Se mirak li te fè ki te konsantre sou gerizon fizik sèlman", "Siy pwofetik ki t ap anonse jan yo ta pral detwi Tanp lan"],
    "exp": "Jan chwazi 7 siy (dlo a ki tounen diven, pitit ofisye l te geri a, moun ki paralize a, mirak 5000 moun nan, mache sou dlo a, avèg la, Laza) pou kapab montre glwa Jezi a epi ede moun kwè (Jan 20:30-31)."
  },
  "dq-evg-037": {
    "q": "Kouman yo entèprete diskou Jezi te fè nan Matye 24-25 la (eskatolojik la) kòm teyoloji?",
    "opts": ["Li pale de destriksyon Jerizalèm ki t ap fèt nan lane 70 aprè Jezi sèlman", "Li pale de tou de, kit sou destriksyon Tanp lan (70 aprè Jezikri) epi sou lè Kris la ap retounen finalman an — yon akonplisman pwofetik an de (2) fwa", "Se jis senbòl sèlman e li pa t anonse okenn gwo evènman istorik", "Li konsène sèlman epòk gwo tribilasyon k ap genyen pi devan yo"],
    "exp": "Matye 24-25 pale alafwa de destriksyon vil Jerizalèm ki te tou pre fèt la (70 apre Jezikri) ansanm ak peryòd Parousi final la (retou Jezi) — sa se yon gwo modèl pwofesi nan Ansyen Testaman an kote pawòl la gen enpòtans pou de (2) epòk yo."
  }
};

const finalData = require('./scratch/fr_to_translate_inverse_final.json');

const htTranslated = finalData.map(item => {
  const trans = translations[item.newId];
  if (!trans) {
    console.error(`Missing translation for ${item.newId}`);
    return null;
  }
  
  return {
    newId: item.newId,
    categoryId: item.categoryId,
    difficulty: item.difficulty,
    language: "ht",
    ht: {
      id: item.newId,
      questionText: trans.q,
      categoryId: item.categoryId,
      categoryName: item.fr.categoryName, // the name should ideally be translated or mapped
      difficulty: item.difficulty,
      language: "ht",
      options: item.fr.options.map((opt, i) => ({ id: opt.id, text: trans.opts[i] })),
      correctOptionId: item.fr.correctOptionId,
      explanation: trans.exp,
      bibleReference: item.fr.bibleReference,
      normalizedRef: item.fr.normalizedRef,
      normalizedCat: item.fr.normalizedCat
    }
  };
}).filter(Boolean);

// We need to fix the categoryName if we want it perfect, but let's keep it consistent with other HT files, or use mappings if needed.
// Write to ht_translated_inverse_final.json
fs.writeFileSync('./scratch/ht_translated_inverse_final.json', JSON.stringify(htTranslated, null, 2));

console.log(`Successfully translated ${htTranslated.length} questions.`);
