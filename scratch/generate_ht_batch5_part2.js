const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, 'fr_to_translate_inverse_batch5.json');
const outputPath = path.join(__dirname, 'ht_translated_inverse_batch5_part2.json');

const sourceData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

const translations = {
    "dq-gen-033": {
        questionText: "Ki jan istwa Jozèf nan peyi Lejip montre pwovidans Bondye malgre peche lèzòm?",
        categoryName: "Jenèz",
        options: [
            { id: "a", text: "Bondye te pini frè Jozèf yo touswit" },
            { id: "b", text: "Jozèf di frè li yo: sa nou te vle fè m ki mal la, Bondye te vle l pou byen" },
            { id: "c", text: "Bondye efase peche frè yo san okenn konsekans" },
            { id: "d", text: "Jozèf te refize padone yo jouk papa l mouri" }
        ],
        explanation: "Jozèf te devwale pwovidans Bondye: « Nou te fè lide fè m' mal. Men Bondye fè sa tounen yon byen » (Jenèz 50:20)."
    },
    "dq-exo-016": {
        questionText: "Ki jan Moyiz te fè konnen li te dwe delivre pèp Izrayèl la?",
        categoryName: "Egzòd",
        options: [
            { id: "a", text: "Nan yon rèv nan dezè a" },
            { id: "b", text: "Pa mwayen yon touf bwa ki t ap boule ak vwa Bondye" },
            { id: "c", text: "Se granprèt Arawon ki te di l sa" },
            { id: "d", text: "Nan yon vizyon nan syèl la" }
        ],
        explanation: "Bondye te parèt devan Moyiz nan yon touf bwa ki t ap boule epi li te ba li misyon pou l libere Izrayèl (Egzòd 3:2-10)."
    },
    "dq-exo-017": {
        questionText: "Ki dènye flewo Bondye te voye sou peyi Lejip?",
        categoryName: "Egzòd",
        options: [
            { id: "a", text: "Fènwa" },
            { id: "b", text: "Krikèt yo (sotmèl)" },
            { id: "c", text: "Lanmò tout premye pitit yo" },
            { id: "d", text: "Lagrèl dife" }
        ],
        explanation: "Dizyèm ak dènye flewo a se te lanmò tout premye pitit nan peyi Lejip, sa ki te fòse Farawon kite Izrayèl ale (Egzòd 12:29-33)."
    },
    "dq-rey-016": {
        questionText: "Ki moun David te fè touye apre li te fin voye l nan front lagè pou l kache adiltè li te fè ak Batcheba?",
        categoryName: "Rwa nan Bib la",
        options: [
            { id: "a", text: "Abnè" },
            { id: "b", text: "Ouri, moun peyi It la" },
            { id: "c", text: "Amnon" },
            { id: "d", text: "Joab" }
        ],
        explanation: "David te bay lòd pou mete Ouri, mari Batcheba a, kote batay la pi cho pou yo te ka touye l (2 Samyèl 11:14-17)."
    },
    "dq-rey-017": {
        questionText: "Ki wa nan peyi Izrayèl ki te fè bati de ti bèf an lò nan Betèl ak nan Dann apre separasyon wayòm nan?",
        categoryName: "Rwa nan Bib la",
        options: [
            { id: "a", text: "Akab" },
            { id: "b", text: "Jeou" },
            { id: "c", text: "Jewoboram" },
            { id: "d", text: "Baacha" }
        ],
        explanation: "Jewoboram I te fè de ti bèf an lò pou anpeche pèp la al fè sakrifis Jerizalèm (1 Wa 12:28-29)."
    },
    "dq-rey-018": {
        questionText: "Ki wa peyi Jida ki te jwenn Liv Lalwa a epi ki te fè yon gwo refòm relijye?",
        categoryName: "Rwa nan Bib la",
        options: [
            { id: "a", text: "Ezekyas" },
            { id: "b", text: "Jozyas" },
            { id: "c", text: "Manase" },
            { id: "d", text: "Asa" }
        ],
        explanation: "Wa Jozyas te fè yon gwo refòm apre yo te fin jwenn Liv Lalwa a nan Tanp lan (2 Wa 22-23)."
    },
    "dq-rey-019": {
        questionText: "Ki jan larenn Jezabèl te mouri?",
        categoryName: "Rwa nan Bib la",
        options: [
            { id: "a", text: "Li te boule nan yon dife ki soti nan syèl la" },
            { id: "b", text: "Pwòp sèvitè li yo te jete l nan yon fenèt" },
            { id: "c", text: "Li te mouri ak maladi" },
            { id: "d", text: "Pwofèt Eli te touye l" }
        ],
        explanation: "Jezabèl te jete nan yon fenèt sou lòd Jeou. Chwal yo te pilonnen l epi chen te manje kò l (2 Wa 9:33-36)."
    },
    "dq-rey-020": {
        questionText: "Ki wa nan peyi Izrayèl yo konnen ki te gen plis madanm ak fanm deyò (konkibin)?",
        categoryName: "Rwa nan Bib la",
        options: [
            { id: "a", text: "David" },
            { id: "b", text: "Salomon" },
            { id: "c", text: "Akab" },
            { id: "d", text: "Roboam" }
        ],
        explanation: "Salomon te gen 700 madanm ak 300 fanm deyò — yo te fè l vire do bay Bondye pou l al sèvi lòt bondye (1 Wa 11:3)."
    },
    "dq-rey-021": {
        questionText: "Kisa Salomon te mande Bondye lè Bondye te di l chwazi sa l vle a?",
        categoryName: "Rwa nan Bib la",
        options: [
            { id: "a", text: "Richès ak onè" },
            { id: "b", text: "Yon lavi ki long" },
            { id: "c", text: "Yon kè ki gen bon konprann pou l dirije pèp la" },
            { id: "d", text: "Viktwa sou lènmi l yo" }
        ],
        explanation: "Salomon te mande yon kè ki gen bon konprann pou l dirije pèp la epi pou l konnen sa ki byen ak sa ki mal (1 Wa 3:9-13)."
    },
    "dq-rey-022": {
        questionText: "Ki wa peyi Lasiri ki te detwi wayòm Izrayèl nan nò a epi ki te depòte moun yo?",
        categoryName: "Rwa nan Bib la",
        options: [
            { id: "a", text: "Nabikodonozò" },
            { id: "b", text: "Salmanaza V / Sargon II" },
            { id: "c", text: "Senakerib" },
            { id: "d", text: "Dariyis" }
        ],
        explanation: "Salmanaza V te sènen Samari; Sargon II te pran l nan ane 722 avan Jezikri (2 Wa 17:5-6)."
    },
    "dq-rey-023": {
        questionText: "Poukisa Bondye pa t pèmèt David bati Tanp lan limenm?",
        categoryName: "Rwa nan Bib la",
        options: [
            { id: "a", text: "Li te twò granmoun" },
            { id: "b", text: "Se te yon moun ki te fè anpil lagè epi ki te koule anpil san" },
            { id: "c", text: "Li pa t gen kont lajan pou sa" },
            { id: "d", text: "Bondye te chwazi Jerizalèm sèlman apre lanmò l" }
        ],
        explanation: "Bondye te di David: « Ou koule anpil san... ou p'ap ka bati yon kay pou mwen. » Se te Salomon, pitit gason l lan, ki t ap yon moun lapè, ki t ap fè sa (1 Istwa 22:8)."
    },
    "dq-rey-024": {
        questionText: "Ki jan Ezekyas te fè reziste kont envazyon moun Lasiri yo san li pa t bezwen goumen?",
        categoryName: "Rwa nan Bib la",
        options: [
            { id: "a", text: "Li te peye yon gwo taks" },
            { id: "b", text: "Li te priye epi zanj Seyè a te touye 185 000 sòlda asiryen" },
            { id: "c", text: "Li te fè alyans ak peyi Lejip" },
            { id: "d", text: "Li te kache pèp la nan twou wòch" }
        ],
        explanation: "Ezekyas te priye epi Ezayi te bay yon pwofesi. Zanj Seyè a te touye 185 000 sòlda asiryen nan yon sèl nwit (2 Wa 19:35-37)."
    },
    "dq-rey-025": {
        questionText: "Ki gwo erè Roboam te fè ki te lakòz wayòm nan separe?",
        categoryName: "Rwa nan Bib la",
        options: [
            { id: "a", text: "Li te mete zidòl nan Tanp lan" },
            { id: "b", text: "Li te refize koute konsèy granmoun yo pou l te ka rann lavi pèp la pi fasil" },
            { id: "c", text: "Li te mete ansyen konsèye yo deyò" },
            { id: "d", text: "Li te fè moun nan nò yo peye de fwa plis taks" }
        ],
        explanation: "Roboam te rejte konsèy granmoun yo epi li te swiv sa jèn yo te di l — li te pwomèt l ap rann lavi pèp la pi rèd (1 Wa 12:13-14)."
    },
    "dq-rey-026": {
        questionText: "Kisa ki te rive wa Manase nan fen lavi li selon 2 Kwonik 33?",
        categoryName: "Rwa nan Bib la",
        options: [
            { id: "a", text: "Li te wa ki pi jis apre David" },
            { id: "b", text: "Li te wa ki pi mechan, men li te repanti lè l te nan prizon epi Bondye te retabli l" },
            { id: "c", text: "Li te mouri nan peche san li pa t janm repanti" },
            { id: "d", text: "Bondye te fè l gras poutèt priyè pwofèt Ezayi" }
        ],
        explanation: "Manase te yon move wa. Men, pandan l te prizonye lavil Babilòn, li te imilye tèt li. Bondye te tande priyè l epi li te mennen l tounen Jerizalèm (2 Kwonik 33:12-13)."
    },
    "dq-rey-027": {
        questionText: "Ki wa nan peyi Izrayèl (nò) ki te sèl wa ki te montre yon ti kras fidelite anvè Bondye nan detwi kilt Baal la?",
        categoryName: "Rwa nan Bib la",
        options: [
            { id: "a", text: "Jewoboram II" },
            { id: "b", text: "Jeou" },
            { id: "c", text: "Omri" },
            { id: "d", text: "Pekak" }
        ],
        explanation: "Jeou te detwi fanmi Akab la epi li te disparèt kilt Baal la nan peyi Izrayèl. Men, li pa t vire do bay peche Jewoboram yo (2 Wa 10:28-31)."
    },
    "dq-sal-023": {
        questionText: "Kilès yo konsidere kòm moun ki ekri pifò nan Sòm yo?",
        categoryName: "Sòm yo",
        options: [
            { id: "a", text: "Moyiz" },
            { id: "b", text: "Salomon" },
            { id: "c", text: "David" },
            { id: "d", text: "Azaf" }
        ],
        explanation: "David se moun ki ekri pifò nan sòm yo. Men gen lòt moun tou tankou Moyiz, Salomon ak Azaf."
    },
    "dq-sal-024": {
        questionText: "Ki sòm ki kòmanse ak pawòl sa yo: « Seyè a se bèjè mwen »?",
        categoryName: "Sòm yo",
        options: [
            { id: "a", text: "Sòm 1" },
            { id: "b", text: "Sòm 22" },
            { id: "c", text: "Sòm 23" },
            { id: "d", text: "Sòm 91" }
        ],
        explanation: "Sòm 23 David la se youn nan sòm moun pi renmen: « Seyè a se bèjè mwen, mwen p'ap manke anyen. »"
    },
    "dq-sal-025": {
        questionText: "Ki sòm ki kòmanse ak pawòl sa yo: « Bondye mwen, Bondye mwen, poukisa ou lage m' konsa? »?",
        categoryName: "Sòm yo",
        options: [
            { id: "a", text: "Sòm 18" },
            { id: "b", text: "Sòm 22" },
            { id: "c", text: "Sòm 31" },
            { id: "d", text: "Sòm 51" }
        ],
        explanation: "Sòm 22 se yon sòm sou Mesi a — Jezi te repete premye pawòl sa yo sou kwa a (Matye 27:46)."
    },
    "dq-sal-026": {
        questionText: "Ki sòm ki pi long nan Bib la?",
        categoryName: "Sòm yo",
        options: [
            { id: "a", text: "Sòm 18" },
            { id: "b", text: "Sòm 91" },
            { id: "c", text: "Sòm 119" },
            { id: "d", text: "Sòm 150" }
        ],
        explanation: "Sòm 119 se sòm ki pi long la, li gen 176 vèsè."
    },
    "dq-sal-027": {
        questionText: "Ak ki pawòl Sòm 1 kòmanse pou l dekri moun ki gen benediksyon Bondye a?",
        categoryName: "Sòm yo",
        options: [
            { id: "a", text: "Ala bon sa bon pou moun ki renmen Lalwa Seyè a" },
            { id: "b", text: "Ala bon sa bon pou moun ki pa koute konsèy mechan yo" },
            { id: "c", text: "Ala bon sa bon pou moun ki mete konfyans yo nan Seyè a" },
            { id: "d", text: "Ala bon sa bon pou pèp ki gen Seyè a pou Bondye yo" }
        ],
        explanation: "Sòm 1 kòmanse konsa: « Ala bon sa bon pou moun ki pa koute konsèy mechan yo... men ki pran tout plezi l' nan lalwa Seyè a » (Sòm 1:1-2)."
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
