const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, 'fr_to_translate_inverse_batch5.json');
const outputPath = path.join(__dirname, 'ht_translated_inverse_batch5.json');

const sourceData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

const translations = {
    "dq-evnt-023": {
        questionText: "Ki premye konsil Legliz la ki te deside ke moun ki pa Jwif yo pa t bezwen sikonsi?",
        categoryName: "Événements Bibliques",
        options: [
            { id: "a", text: "Konsil Antiyòch la" },
            { id: "b", text: "Konsil Jerizalèm nan" },
            { id: "c", text: "Konsil Nikeya a" },
            { id: "d", text: "Konsil Efèz la" }
        ],
        explanation: "Konsil Jerizalèm nan (Travay 15) te deside ke kwayan ki pa Jwif yo pa t oblije swiv lalwa sikonsizyon an ak Lalwa Moyiz la."
    },
    "dq-evnt-024": {
        questionText: "Ki evènman ki te make tonbe miray Jeriko yo pandan konkèt Kanaran an?",
        categoryName: "Événements Bibliques",
        options: [
            { id: "a", text: "Yon tranblemanntè" },
            { id: "b", text: "Yon atak sipriz lannwit" },
            { id: "c", text: "Mache Izrayelit yo pandan 7 jou ak son twonpèt yo" },
            { id: "d", text: "Yon inondasyon nan rivyè Jouden an" }
        ],
        explanation: "Izrayelit yo te mache pandan 7 jou toutotou Jeriko. Sou setyèm jou a, apre yo fin fè 7 tou epi sonnen twonpèt yo, miray yo te tonbe (Jozye 6:15-20)."
    },
    "dq-evnt-025": {
        questionText: "Ki evènman nan Travay 10 ki te make yon gwo chanjman nan misyon pou moun ki pa Jwif yo?",
        categoryName: "Événements Bibliques",
        options: [
            { id: "a", text: "Konvèsyon Sòl sou wout Damas la" },
            { id: "b", text: "Vizyon Pyè sou tèt kay la ak konvèsyon Kònèy" },
            { id: "c", text: "Premye vwayaj misyonè Pòl la" },
            { id: "d", text: "Pannkot Jerizalèm nan" }
        ],
        explanation: "Vizyon gwo dra a (Travay 10:9-16) ak konvèsyon ofisye Kònèy te make ouvèti ofisyèl Levanjil la pou moun ki pa Jwif yo."
    },
    "dq-evnt-026": {
        questionText: "Kisa sakrifis Izarak Abraram te fè a (Akeda) nan Jenèz 22 reprezante nan pwen de vi teyolojik?",
        categoryName: "Événements Bibliques",
        options: [
            { id: "a", text: "Siperyorite Abraram sou Noe" },
            { id: "b", text: "Yon senbòl sakrifis Papa a ki voye sèl Pitit li a" },
            { id: "c", text: "Lafen sakrifis moun nan relijyon ansyen yo" },
            { id: "d", text: "Kontra Bondye ak tribi Levi a" }
        ],
        explanation: "Ofrann Izarak la se yon imaj sakrifis Kris la: Abraram ofri sèl pitit li renmen anpil la; Bondye te bay yon belye pou ranplase l (Jenèz 22:13-14)."
    },
    "dq-evnt-027": {
        questionText: "Ki evènman ki te separe wayòm Izrayèl la an de pati apre lanmò Salomon?",
        categoryName: "Événements Bibliques",
        options: [
            { id: "a", text: "Lanmò Sayil nan Gilboa" },
            { id: "b", text: "Lè tribi nan nò yo te rejte Roboam nan Sichèm" },
            { id: "c", text: "Rebelion Absalon kont David" },
            { id: "d", text: "Defèt Izrayèl devan Filisten yo" }
        ],
        explanation: "Roboam te refize aleje chay Salomon te mete sou pèp la. 10 tribi nan nò yo te separe anba direksyon Jewoboram nan Sichèm (1 Wa 12:16-20)."
    },
    "dq-evnt-028": {
        questionText: "Ki evènman apokalips ki make lafen milenè a nan Revelasyon 20?",
        categoryName: "Événements Bibliques",
        options: [
            { id: "a", text: "Lagè Gòg ak Magòg" },
            { id: "b", text: "Parèt Nouvo Jerizalèm nan" },
            { id: "c", text: "Rezirèksyon tout moun mouri yo" },
            { id: "d", text: "Jijman gwo fotèy blan an" }
        ],
        explanation: "Nan lafen milenè a, Satan ap lage epi l ap rasanble nasyon yo (Gòg ak Magòg) pou batay final la, anvan Gwo Jijman an (Revelasyon 20:7-10)."
    },
    "dq-tema-017": {
        questionText: "Ki pi gwo kòmandman an selon Jezi nan Matye 22?",
        categoryName: "Thèmes Bibliques",
        options: [
            { id: "a", text: "Obeyi Lalwa Moyiz la" },
            { id: "b", text: "Renmen Bondye ak tout kè w epi renmen frè parèy ou tankou tèt pa w" },
            { id: "c", text: "Batize tout nasyon yo" },
            { id: "d", text: "Onore manman w ak papa w" }
        ],
        explanation: "« Se pou ou renmen Mèt la, Bondye ou... Se pou ou renmen frè parèy ou tankou ou menm. De kòmandman sa yo, se yo ki fondasyon tout lalwa Moyiz la » (Matye 22:37-40)."
    },
    "dq-tema-018": {
        questionText: "Selon Women 6:23, kisa peche peye?",
        categoryName: "Thèmes Bibliques",
        options: [
            { id: "a", text: "Maladi" },
            { id: "b", text: "Soufrans" },
            { id: "c", text: "Lanmò" },
            { id: "d", text: "Pòvte" }
        ],
        explanation: "« Paske peche peye ou ak lanmò. Men, kado Bondye ban nou gratis la, se lavi ki p'ap janm fini an nan Jezikri » (Women 6:23)."
    },
    "dq-tema-019": {
        questionText: "Kisa sanktifikasyon ye nan lavi yon kretyen?",
        categoryName: "Thèmes Bibliques",
        options: [
            { id: "a", text: "Lè yon moun batize" },
            { id: "b", text: "Pwosesis kwasans pou nou vin sanble ak Kris la plis chak jou" },
            { id: "c", text: "Lè yon moun priye chak jou" },
            { id: "d", text: "Lè yon moun li Bib la chak jou" }
        ],
        explanation: "Sanktifikasyon se pwosesis kontini kote Sentespri a ap transfòme kwayan an pou l vin sanble ak imaj Kris la (2 Korentyen 3:18)."
    },
    "dq-tema-020": {
        questionText: "Kisa konsèp biblik « kontra » a (berith nan lang ebre) vle di?",
        categoryName: "Thèmes Bibliques",
        options: [
            { id: "a", text: "Yon kontra legal ant de pati ki egal" },
            { id: "b", text: "Yon angajman solanèl Bondye pran ak pèp li a ak pwomès ak kondisyon" },
            { id: "c", text: "Yon lwa oral ki pase de jenerasyon an jenerasyon" },
            { id: "d", text: "Yon seremoni relijye ki fèt chak ane" }
        ],
        explanation: "Yon kontra biblik (berith) se yon angajman solanèl Bondye pran — Noe, Abraram, Moyiz, David, Nouvo Kontra — chak gen pwomès espesifik."
    },
    "dq-tema-021": {
        questionText: "Kisa « redansyon » vle di nan kontèks Bib la?",
        categoryName: "Thèmes Bibliques",
        options: [
            { id: "a", text: "Ganyen delivrans pa mwayen bon zèv" },
            { id: "b", text: "Lè Kris peye pri a pou delivre nou anba esklavaj peche" },
            { id: "c", text: "Resevwa gerizon fizik" },
            { id: "d", text: "Fè pati yon legliz ofisyèl" }
        ],
        explanation: "Redansyon (apolutrosis) vle di rachte. Kris te peye pri pou libere nou anba esklavaj peche ak san li (Efezyen 1:7)."
    },
    "dq-tema-022": {
        questionText: "Ki diferans ki genyen ant jistifikasyon ak rejenerasyon?",
        categoryName: "Thèmes Bibliques",
        options: [
            { id: "a", text: "Se de mo pou menm evènman an" },
            { id: "b", text: "Jistifikasyon se yon estati legal; rejenerasyon se yon transfòmasyon anndan" },
            { id: "c", text: "Jistifikasyon se pou Ansyen Testaman; rejenerasyon se pou Nouvo Testaman" },
            { id: "d", text: "Rejenerasyon toujou fèt anvan jistifikasyon" }
        ],
        explanation: "Jistifikasyon = Bondye deklare pechè a jis (manm legal). Rejenerasyon = nouvo nesans, transfòmasyon kè a pa Lespri a (Jan 3:3; Women 5:1)."
    },
    "dq-tema-023": {
        questionText: "Kisa tèm « koinonia » vle di nan Nouvo Testaman an ak ki jan li parèt?",
        categoryName: "Thèmes Bibliques",
        options: [
            { id: "a", text: "Lapriyè an silans chak moun pou kont yo" },
            { id: "b", text: "Kominon ak pataje fratènèl nan kominote kretyen an" },
            { id: "c", text: "Patisipasyon nan sakreman yo sèlman" },
            { id: "d", text: "Etid akademik sou Liv Sakre yo" }
        ],
        explanation: "Koinonia (kominon) vle di pataje fratènèl pwofon — pataje byen, lapriyè ansanm, repa Seyè a (Travay 2:42-44)."
    },
    "dq-tema-024": {
        questionText: "Kisa konsèp « Wayòm Bondye a » vle di nan anseyan Jezi yo?",
        categoryName: "Thèmes Bibliques",
        options: [
            { id: "a", text: "Sèlman syèl la apre lanmò" },
            { id: "b", text: "Gouvènman souveren Bondye a ki la deja epi k ap vini an" },
            { id: "c", text: "Izrayèl kòm yon nasyon teokratik" },
            { id: "d", text: "Legliz la kòm enstitisyon" }
        ],
        explanation: "Wayòm Bondye a se yon reyalite ki « la deja » (Lik 17:21) epi ki « poko » fin tabli nèt — yon reyalite jodi a ak yon espwa pou demen."
    },
    "dq-tema-025": {
        questionText: "Kisa doktrin « sibstitisyon penal » la vle di konsènan lanmò Kris la?",
        categoryName: "Thèmes Bibliques",
        options: [
            { id: "a", text: "Kris te mouri kòm yon egzanp sakrifis" },
            { id: "b", text: "Kris te pran plas nou pou l sibi chatiman nou te merite a" },
            { id: "c", text: "Kris te genyen lanmò kòm chanpyon limanite" },
            { id: "d", text: "Kris te peye yon ranson bay dyab la" }
        ],
        explanation: "Sibstitisyon penal: Kris te pran kòlè Bondye nou te merite a sou li — « Se pou peche nou yo yo te blese l konsa » (Ezayi 53:5; 2 Korentyen 5:21)."
    },
    "dq-tema-026": {
        questionText: "Kisa imago Dei (imaj Bondye) vle di nan Jenèz 1:26-27?",
        categoryName: "Thèmes Bibliques",
        options: [
            { id: "a", text: "Lòm sanble ak Bondye fizikman" },
            { id: "b", text: "Lòm reflete kalite Bondye yo: rezon, moralite, relasyon ak otorite sou kreyasyon an" },
            { id: "c", text: "Se prèt yo sèlman ki pote imaj Bondye a" },
            { id: "d", text: "Imaj Bondye a pèdi nèt apre peche a" }
        ],
        explanation: "Imago Dei: moun fèt pou reflete Bondye — rezon, moralite, kreyativite, kapasite pou gen relasyon. Peche sal imaj sa a men li pa detwi l nèt (Jenèz 9:6; Jak 3:9)."
    },
    "dq-tema-027": {
        questionText: "Ki siyifikasyon teyolojik rezirèksyon fizik Jezi a genyen selon 1 Korentyen 15?",
        categoryName: "Thèmes Bibliques",
        options: [
            { id: "a", text: "Li sèlman pwouve ke Jezi te Bondye" },
            { id: "b", text: "San li, lafwa nou pa vo anyen — li garanti pwòp rezirèksyon pa nou demen" },
            { id: "c", text: "Li se sèlman yon rezirèksyon espirityèl, pa fizik" },
            { id: "d", text: "Li enpòtan sèlman pou moun Jwif yo" }
        ],
        explanation: "Pòl deklare: « Si Kris la pa t' leve soti vivan nan lanmò, mesaj nou an pa t'ap vo anyen, konfyans nou an pa t'ap vo anyen non plis. » Rezirèksyon Kris la se premye garanti pou rezirèksyon kwayan yo (1 Korentyen 15:17,20)."
    },
    "dq-tema-028": {
        questionText: "Kisa doktrin « pèseverans sen yo » vle di?",
        categoryName: "Thèmes Bibliques",
        options: [
            { id: "a", text: "Vrè kwayan yo ka pèdi delivrans yo si yo peche" },
            { id: "b", text: "Moun Bondye chwazi yo ap kenbe fèm jouk nan bout pa pouvwa li" },
            { id: "c", text: "Delivrans lan depann nèt sou efò kwayan an fè" },
            { id: "d", text: "Tout moun ap sove finalman" }
        ],
        explanation: "Pèseverans sen yo: Bondye pwoteje moun li chwazi yo — « Bondye ki te konmanse bon travay sa a nan nou... l'ap kontinye l' jouk li fini l' » (Filipyen 1:6; Jan 10:28-29)."
    },
    "dq-gen-023": {
        questionText: "Konbyen jou Bondye te pran pou l kreye mond lan?",
        categoryName: "Genèse",
        options: [
            { id: "a", text: "3 jou" },
            { id: "b", text: "6 jou" },
            { id: "c", text: "7 jou" },
            { id: "d", text: "40 jou" }
        ],
        explanation: "Bondye te kreye tout bagay nan sis jou epi li te repoze nan setyèm jou a (Jenèz 1-2:3)."
    },
    "dq-gen-024": {
        questionText: "Ki premye moun ki te fè yon krim nan istwa Bib la epi ki moun li te touye?",
        categoryName: "Genèse",
        options: [
            { id: "a", text: "Abèl te touye Kayen" },
            { id: "b", text: "Kayen te touye Abèl" },
            { id: "c", text: "Lamek te touye yon moun" },
            { id: "d", text: "Ezaou te menase Jakòb" }
        ],
        explanation: "Kayen te jalou paske Bondye te asepte ofrann Abèl la, li touye frè li (Jenèz 4:8)."
    },
    "dq-gen-025": {
        questionText: "Konbyen pitit gason Jakòb te genyen, ki te vin zansèt 12 tribi Izrayèl yo?",
        categoryName: "Genèse",
        options: [
            { id: "a", text: "10" },
            { id: "b", text: "11" },
            { id: "c", text: "12" },
            { id: "d", text: "13" }
        ],
        explanation: "Jakòb te gen 12 pitit gason ki te vin papa 12 tribi Izrayèl yo (Jenèz 35:22-26)."
    },
    "dq-gen-026": {
        questionText: "Kisa lakansyèl Bondye te mete nan syèl la apre delij la te siyifi?",
        categoryName: "Genèse",
        options: [
            { id: "a", text: "Yon siy bèlte kreyasyon an" },
            { id: "b", text: "Kontra Bondye fè pou l pa janm detwi tè a ankò ak delij" },
            { id: "c", text: "Pwomès lapli pou rekòt yo" },
            { id: "d", text: "Chemen pou rive nan prezans Bondye" }
        ],
        explanation: "Lakansyèl la se siy kontra Bondye ak Noe ak tout bèt vivan: Bondye p'ap janm sèvi ak dlo ankò pou detwi latè (Jenèz 9:13-15)."
    },
    "dq-gen-027": {
        questionText: "Ki kontra Bondye te pase ak Abraram nan Jenèz 15 konsènan tè a?",
        categoryName: "Genèse",
        options: [
            { id: "a", text: "Abraram t ap resevwa Kanaran pandan l vivan" },
            { id: "b", text: "Pitit li yo t ap gen tout tè a depi nan peyi Lejip rive nan larivyè Lefrat" },
            { id: "c", text: "Abraram t ap rete nomad tout lavi li" },
            { id: "d", text: "Pitit li yo t ap resevwa tè a nan 400 an apre esklavaj" }
        ],
        explanation: "Bondye te fè yon kontra ak Abraram: « M'ap bay pitit pitit ou yo tout peyi sa a, depi larivyè Lejip rive jouk nan gwo larivyè Lefrat la » (Jenèz 15:18)."
    },
    "dq-gen-028": {
        questionText: "Kisa « benediksyon » Izarak te bay Jakòb pa erè a te ye?",
        categoryName: "Genèse",
        options: [
            { id: "a", text: "Pwojè tout bèt yo" },
            { id: "b", text: "Benediksyon premye pitit la ki gen ladan otorite ak pwosperite" },
            { id: "c", text: "Yon bag an lò" },
            { id: "d", text: "Yon nouvo non" }
        ],
        explanation: "Benediksyon an te bay Jakòb otorite sou frè l yo ak pwomès pwosperite, se te benediksyon ki te rezève pou premye pitit la (Jenèz 27:27-29)."
    },
    "dq-gen-029": {
        questionText: "Poukisa Jakòb te voye pitit gason l yo nan peyi Lejip la premye fwa?",
        categoryName: "Genèse",
        options: [
            { id: "a", text: "Pou yo t al vizite Jozèf" },
            { id: "b", text: "Paske te gen yon grangou nan peyi a e te gen manje an Lejip" },
            { id: "c", text: "Pou yo t al achte lò" },
            { id: "d", text: "Pou yo t al chèche yon nouvo tè pou yo rete" }
        ],
        explanation: "Te gen yon gwo grangou nan tout peyi a. Jakòb te aprann te gen ble an Lejip, li voye pitit li yo al achte pou yo pa mouri grangou (Jenèz 42:1-2)."
    },
    "dq-gen-030": {
        questionText: "Ki rèv Jozèf te genyen ki te fache frè l yo nan Jenèz 37?",
        categoryName: "Genèse",
        options: [
            { id: "a", text: "Yon rèv sou sèt vach gra" },
            { id: "b", text: "Bot pay frè l yo ki t ap bese devan bot pay pa l la" },
            { id: "c", text: "Yon rèv sou yon nechèl ki rive nan syèl la" },
            { id: "d", text: "Yon rèv sou yon ti mouton sakrifye" }
        ],
        explanation: "Jozèf te fè rèv kote bot pay frè l yo te bese devan pa l la, sa ki te montre l t ap gen otorite sou yo (Jenèz 37:5-8)."
    },
    "dq-gen-031": {
        questionText: "Kisa madanm Lòt te vin tounen lè l te gade dèyè pandan destriksyon Sodòm ak Gomò?",
        categoryName: "Genèse",
        options: [
            { id: "a", text: "Yon estati an lò" },
            { id: "b", text: "Yon poto sèl" },
            { id: "c", text: "Yon pye bwa" },
            { id: "d", text: "Pousyè" }
        ],
        explanation: "Madanm Lòt te gade dèyè kont lòd zanj yo, li tounen yon gwo poto sèl (Jenèz 19:26)."
    },
    "dq-gen-032": {
        questionText: "Konbyen tan Jozèf te pase anba esklavaj ak nan prizon an Lejip anvan li te vin premye minis?",
        categoryName: "Genèse",
        options: [
            { id: "a", text: "7 an" },
            { id: "b", text: "13 an" },
            { id: "c", text: "20 an" },
            { id: "d", text: "40 an" }
        ],
        explanation: "Jozèf te gen 17 an lè yo te vann li (Jenèz 37:2) epi 30 an lè li te parèt devan Farawon (Jenèz 41:46), sa fè 13 an an total."
    },
    "dq-exo-018": {
        questionText: "Ki jan Bondye te parèt devan Moyiz pou premye fwa sou mòn Orèb la?",
        categoryName: "Exode",
        options: [
            { id: "a", text: "Nan yon gwo loraj" },
            { id: "b", text: "Nan yon touf bwa ki t ap boule san l pa boule" },
            { id: "c", text: "Nan yon vizyon lannwit" },
            { id: "d", text: "Nan yon vwa ki soti nan syèl la" },
        ],
        explanation: "Bondye te parèt nan yon flanm dife nan mitan yon touf bwa ki t'ap boule san l' pa t' boule (Egzòd 3:2)."
    },
    "dq-exo-019": {
        questionText: "Ki sa Moyiz te jete nan dlo Mara a pou dlo a te ka vin dous?",
        categoryName: "Exode",
        options: [
            { id: "a", text: "Baton li a" },
            { id: "b", text: "Yon moso bwa Bondye te moutre li" },
            { id: "c", text: "Sèl" },
            { id: "d", text: "Laman" }
        ],
        explanation: "Moyiz rele Seyè a, Seyè a moutre l' yon moso bwa. Li jete moso bwa a nan dlo a, dlo a vin dous (Egzòd 15:25)."
    },
    "dq-exo-020": {
        questionText: "Kisa pèp la te manje pandan 40 an nan dezè a?",
        categoryName: "Exode",
        options: [
            { id: "a", text: "Pen ak vyann" },
            { id: "b", text: "Laman ak zòtolan" },
            { id: "c", text: "Fwi ak legim" },
            { id: "d", text: "Sèlman sa yo te jwenn nan dezè a" }
        ],
        explanation: "Bondye te voye laman chak maten ak zòtolan nan aswè pou pèp la te ka manje (Egzòd 16:13-15)."
    },
    "dq-exo-021": {
        questionText: "Konbyen kòmandman Bondye te bay Moyiz sou mòn Sinayi a?",
        categoryName: "Exode",
        options: [
            { id: "a", text: "5" },
            { id: "b", text: "7" },
            { id: "c", text: "10" },
            { id: "d", text: "12" }
        ],
        explanation: "Bondye te bay dis kòmandman yo ekri sou de ròch plat (Egzòd 20:1-17)."
    },
    "dq-exo-022": {
        questionText: "Ki bèt Arawon te fè ak lò pèp la te bay pandan Moyiz te sou mòn lan?",
        categoryName: "Exode",
        options: [
            { id: "a", text: "Yon ti mouton" },
            { id: "b", text: "Yon estati yon lyon" },
            { id: "c", text: "Yon ti bèf an lò" },
            { id: "d", text: "Yon sèpan" }
        ],
        explanation: "Pèp la te vin pèdi pasyans, Arawon pran bijou lò yo, li fonn yo, li fè yon estati yon ti bèf (Egzòd 32:4)."
    },
    "dq-exo-023": {
        questionText: "Kisa Moyiz te fè ak de ròch plat yo lè l te wè pèp la ap adore ti bèf an lò a?",
        categoryName: "Exode",
        options: [
            { id: "a", text: "Li mete yo nan Bwat Kontra a" },
            { id: "b", text: "Li jete yo atè, yo kraze nan pye mòn lan" },
            { id: "c", text: "Li kache yo nan yon twou wòch" },
            { id: "d", text: "Li tounen moute sou mòn lan ak yo" }
        ],
        explanation: "Moyiz te fache anpil, li jete de ròch plat yo atè, yo kraze nan pye mòn lan (Egzòd 32:19)."
    },
    "dq-exo-024": {
        questionText: "Ki premye gwo lènmi Izrayelit yo te goumen avèk yo apre yo fin travèse lanmè Wouj la?",
        categoryName: "Exode",
        options: [
            { id: "a", text: "Moun peyi Lejip yo" },
            { id: "b", text: "Moun peyi Amalèk yo" },
            { id: "c", text: "Moun peyi Filisti yo" },
            { id: "d", text: "Moun peyi Mowab yo" }
        ],
        explanation: "Moun Amalèk yo te vin atake moun Izrayèl yo nan Refidim (Egzòd 17:8)."
    },
    "dq-exo-025": {
        questionText: "Ki jan Moyiz te rive genyen batay la kont moun Amalèk yo?",
        categoryName: "Exode",
        options: [
            { id: "a", text: "Pa yon estrateji militè" },
            { id: "b", text: "Toutotan li te kenbe men l anlè" },
            { id: "c", text: "Avèk yon gwo tranblemanntè" },
            { id: "d", text: "Lè l te frape baton li a atè" }
        ],
        explanation: "Toutotan Moyiz te kenbe men l' anlè, moun Izrayèl yo te pi fò. Men, depi li bese men l', moun Amalèk yo te vin pi fò (Egzòd 17:11)."
    },
    "dq-exo-026": {
        questionText: "Kisa ki te kouvri Tant Randevou a kòm yon siy prezans Bondye?",
        categoryName: "Exode",
        options: [
            { id: "a", text: "Yon bèl rido ble" },
            { id: "b", text: "Yon nwaj lajounen ak yon flanm dife lannwit" },
            { id: "c", text: "Yon gwo van" },
            { id: "d", text: "Yon zetwal byen klere" }
        ],
        explanation: "Nwaj la te kouvri Tant Randevou a, epi limyè prezans Seyè a te plen Tant lan (Egzòd 40:34)."
    },
    "dq-exo-027": {
        questionText: "Ki rad espesyal granprèt la te dwe mete pou l antre nan kote ki sen an?",
        categoryName: "Exode",
        options: [
            { id: "a", text: "Yon senp rad blan" },
            { id: "b", text: "Efòd la ak plastwon an" },
            { id: "c", text: "Yon rad fèt ak po mouton" },
            { id: "d", text: "Yon kouwòn an lò sèlman" }
        ],
        explanation: "Bondye te bay lòd pou fè rad espesyal pou Arawon: efòd la, plastwon an, wòb la, elatriye (Egzòd 28:4)."
    },
    "dq-exo-028": {
        questionText: "Kisa ki te ekri sou plak an lò ki te sou tèt turban granprèt la?",
        categoryName: "Exode",
        options: [
            { id: "a", text: "Non tout tribi yo" },
            { id: "b", text: "Apa pou Seyè a" },
            { id: "c", text: "Mete konfyans nan Bondye" },
            { id: "d", text: "Lalwa se lavi" }
        ],
        explanation: "Yo te fè yon plak an lò ki di: « Apa pou Seyè a » (Egzòd 28:36)."
    },
    "dq-exo-029": {
        questionText: "Poukisa Moyiz te mete yon vwal sou figi l lè l te desann mòn Sinayi a?",
        categoryName: "Exode",
        options: [
            { id: "a", text: "Paske li te wont" },
            { id: "b", text: "Paske figi l t ap klere tèlman li te nan prezans Bondye" },
            { id: "c", text: "Paske pèp la pa t vle wè l" },
            { id: "d", text: "Pou l te ka kache dlo nan je l" }
        ],
        explanation: "Lè Moyiz t'ap desann mòn Sinayi a, li pa t' konnen figi l' t'ap klere tèlman li te pale ak Seyè a (Egzòd 34:29)."
    },
    "dq-exo-030": {
        questionText: "Ki moun Bondye te chwazi pou dirije travay konstriksyon Tant Randevou a paske li te ba li entèlijans ak konpetans?",
        categoryName: "Exode",
        options: [
            { id: "a", text: "Jozye" },
            { id: "b", text: "Bezaleèl ak Owoliyab" },
            { id: "c", text: "Kaleb" },
            { id: "d", text: "Lid" }
        ],
        explanation: "Seyè a te chwazi Bezaleèl, li te plen l' ak Lespri l', li ba li ladrès, entèlijans ak konesans pou l' fè tout kalite travay (Egzòd 31:2-6)."
    },
    "dq-lev-001": {
        questionText: "Kisa 'sakrifis pou peche' a te siyifi nan Levitik?",
        categoryName: "Lévitique",
        options: [
            { id: "a", text: "Yon fason pou di mèsi pou rekòt yo" },
            { id: "b", text: "Yon fason pou mande padon pou peche moun fè san yo pa konnen" },
            { id: "c", text: "Yon sakrifis pou dedye yon timoun bay Bondye" },
            { id: "d", text: "Yon ofrann pou mande lapli" }
        ],
        explanation: "Sakrifis sa a te fèt pou peche yon moun fè san l pa fè espre kont kòmandman Seyè a (Levitik 4:2)."
    },
    "dq-lev-002": {
        questionText: "Ki premye lwa konsènan bèt ki pwòp ak bèt ki pa pwòp pou moun Izrayèl yo te manje?",
        categoryName: "Lévitique",
        options: [
            { id: "a", text: "Yo te ka manje sèlman sa yo te kiltive" },
            { id: "b", text: "Yo te ka manje tout bèt ki gen zago fann de bò epi ki remoute manje" },
            { id: "c", text: "Tout bèt lanmè te pwòp" },
            { id: "d", text: "Yo pa t' gen dwa manje vyann ditou" }
        ],
        explanation: "N'a manje tout bèt ki gen zago fann de bò epi ki remoute manje (Levitik 11:3)."
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
