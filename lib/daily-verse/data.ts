import { Language } from '../i18n/types';

export interface Verse {
  text: string;
  reference: string;
  explanation: string;
  relatedVerses: { ref: string; text: string }[];
}

export const DAILY_VERSES: Record<Language, Verse[]> = {
  ht: [
    {
      text: "Paske Bondye sitèlman renmen lemonn, li bay sèl Pitit li a pou li, pou tout moun ki mete konfyans yo nan li pa pèdi lavi yo, men pou yo gen lavi ki p'ap janm fini an.",
      reference: "Jan 3:16",
      explanation: "Vèsè sa a se kè mesaj levanjil la. Li montre nou ke lanmou Bondye pa gen limit e li ofri tout moun posiblite pou yo jwenn lavi etènèl atravè lafwa nan Jezi. Se yon envitasyon pou nou fè Bondye konfyans e pou nou resevwa kado delivrans lan ke li ofri nou an gratis.",
      relatedVerses: [
        { ref: "Women 5:8", text: "Bondye montre jan li renmen nou: lè nou te peche toujou, Kris la mouri pou nou." },
        { ref: "1 Jan 4:9", text: "Bondye voye sèl Pitit li a sou latè pou nou ka gen lavi gras ak li." }
      ]
    },
    {
      text: "Seyè a se gadò mwen, mwen p'ap janm manke anyen. Li fè m' poze kò m' nan bèl savann ki gen anpil zèb vèt. Li mennen m' bò dlo ki kalm.",
      reference: "Sòm 23:1-2",
      explanation: "Sòm sa a ban nou asirans sou jan Bondye ap pran swen nou tankou yon gadò mouton. Li pwoteje nou, li gide nou, e li ban nou tout sa nou bezwen. Menm nan moman ki pi difisil yo, nou pa bezwen pè paske li la avèk nou.",
      relatedVerses: [
        { ref: "Jan 10:11", text: "Mwen se bon gadò a. Bon gadò a bay lavi l pou mouton l yo." },
        { ref: "Ezayi 40:11", text: "Li pral pran swen bann mouton l yo tankou yon gadò." }
      ]
    },
    {
      text: "Mwen kapab fè tout bagay grasa Kris la ki ban mwen fòs la.",
      reference: "Filipyen 4:13",
      explanation: "Vèsè sa a ankouraje nou pou nou pa janm dekouraje. Fòs nou pa soti nan tèt nou, men li soti nan Bondye. Kèlkeswa sitiyasyon nou jwenn nou, nou ka fè fas ak li paske Kris la ap sipòte nou.",
      relatedVerses: [
        { ref: "Izayi 40:31", text: "Moun ki mete konfyans yo nan Seyè a ap jwenn fòs ankò." },
        { ref: "2 Korent 12:9", text: "Gras mwen sifi pou ou, paske pouvwa mwen pi fò lè ou fèb." }
      ]
    },
    {
      text: "Mete tout konfyans ou nan Seyè a, pa gade sou sa ou konnen. Nan tou sa w'ap fè, toujou chonje Seyè a. Li menm l'a moutre ou chemen pou ou pran.",
      reference: "Pwovèb 3:5-6",
      explanation: "Sa a se yon apèl pou nou depann de Bondye nèt ale. Souvan nou panle nou konnen pi byen, men sajès Bondye pi gran. Si nou konsilte li nan tout sa n'ap fè, li va gide nou nan bon direksyon an.",
      relatedVerses: [
        { ref: "Sòm 37:5", text: "Lage lavi ou nan men Seyè a, mete konfyans ou in li." },
        { ref: "Jak 1:5", text: "Si yon moun nan nou manke sajès, se pou li mande Bondye." }
      ]
    },
    {
      text: "Vin jwenn mwen, nou tout ki bouke, nou tout ki anba chay, m'a ban nou repo.",
      reference: "Matye 11:28",
      explanation: "Jezi ap rele nou pou nou depoze tout chay nou yo nan pye li. Lavi a ka difisil e nou ka santi nou fatige, men nan li nou ka jwenn yon vrè repo pou nanm nou.",
      relatedVerses: [
        { ref: "Sòm 55:22", text: "Lage chay ou sou Seyè a, l'a soutni ou." },
        { ref: "1 Pyè 5:7", text: "Lage tout tèt chaje nou yo sou li, paske li pran swen nou." }
      ]
    },
    {
      text: "Mwen pa t' ba ou lòd sa a: Pran kouray, pa dekouraje, pa pè anyen? Paske Seyè a, Bondye ou la, la avèk ou kote ou pase.",
      reference: "Jozye 1:9",
      explanation: "Lè nou gen yon gwo responsablite oswa nou devan yon gwo chanjman, Bondye ban nou asirans ke li la avèk nou. Nou pa bezwen pè paske prezans li ban nou kouray nou bezwen an.",
      relatedVerses: [
        { ref: "Izayi 41:10", text: "Ou pa bezwen pè, paske mwen la avèk ou." },
        { ref: "Sòm 27:1", text: "Seyè a se limyè mwen, li se delivrans mwen. Ki moun mwen ta ka pè?" }
      ]
    },
    {
      text: "Lanmou Bondye pou nou pa gen limit, li renouvle chak maten. Fidelite li se yon bagay ki gran.",
      reference: "Lamantasyon 3:22-23",
      explanation: "Chak jou se yon nouvo chans Bondye ban nou. Menm si nou te fè erè ayè, gras li la pou nou jodi a. Sa ban nou espwa pou nou kontinye vanse chak maten.",
      relatedVerses: [
        { ref: "Sòm 30:5", text: "Kriye ka dire yon nwit, men kè kontan vini nan maten." },
        { ref: "Efezyen 2:4-5", text: "Bondye rich nan klemans, li renmen nou anpil." }
      ]
    }
  ],
  es: [
    {
      text: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.",
      reference: "Juan 3:16",
      explanation: "Este versículo es el corazón del mensaje del evangelio. Nos muestra que el amor de Dios no tiene límites y ofrece a todos la posibilidad de encontrar la vida eterna a través de la fe en Jesús. Es una invitación a confiar en Dios y recibir el regalo de la salvación que Él nos ofrece gratuitamente.",
      relatedVerses: [
        { ref: "Romanos 5:8", text: "Pero Dios muestra su amor para con nosotros, en que siendo aún pecadores, Cristo murió por nosotros." },
        { ref: "1 Juan 4:9", text: "En esto se mostró el amor de Dios para con nosotros, en que Dios envió a su Hijo unigénito al mundo, para que vivamos por él." }
      ]
    },
    {
      text: "Jehová es mi pastor; nada me faltará. En lugares de delicados pastos me hará descansar; Junto a aguas de reposo me pastoreará.",
      reference: "Salmo 23:1-2",
      explanation: "Este salmo nos da seguridad sobre cómo Dios cuida de nosotros como un pastor. Él nos protege, nos guía y nos da todo lo que necesitamos. Incluso en los momentos más difíciles, no debemos temer porque Él está con nosotros.",
      relatedVerses: [
        { ref: "Juan 10:11", text: "Yo soy el buen pastor; el buen pastor su vida da por las ovejas." },
        { ref: "Isaías 40:11", text: "Como pastor apacentará su rebaño; en su brazo llevará los corderos." }
      ]
    },
    {
      text: "Todo lo puedo en Cristo que me fortalece.",
      reference: "Filipenses 4:13",
      explanation: "Este versículo nos anima a no desanimarnos nunca. Nuestra fuerza no proviene de nosotros mismos, sino que proviene de Dios. Sea cual sea la situación en la que nos encontremos, podemos enfrentarla porque Cristo nos apoya.",
      relatedVerses: [
        { ref: "Isaías 40:31", text: "Pero los que esperan a Jehová tendrán nuevas fuerzas." },
        { ref: "2 Corintios 12:9", text: "Bástate mi gracia; porque mi poder se perfecciona en la debilidad." }
      ]
    },
    {
      text: "Fíate de Jehová de todo tu corazón, Y no te apoyes en tu propia prudencia. Reconócelo en todos tus caminos, Y él enderezará tus veredas.",
      reference: "Proverbios 3:5-6",
      explanation: "Este es un llamado a depender totalmente de Dios. A menudo pensamos que sabemos lo que es mejor, pero la sabiduría de Dios es mayor. Si lo consultamos en todo lo que hacemos, Él nos guiará en la dirección correcta.",
      relatedVerses: [
        { ref: "Salmo 37:5", text: "Encomienda a Jehová tu camino, Y confía en él; y él hará." },
        { ref: "Santiago 1:5", text: "Y si alguno de vosotros tiene falta de sabiduría, pídala a Dios." }
      ]
    },
    {
      text: "Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.",
      reference: "Mateo 11:28",
      explanation: "Jesús nos llama a depositar todas nuestras cargas a sus pies. La vida puede ser difícil y podemos sentirnos cansados, pero en Él podemos encontrar un verdadero descanso para nuestras almas.",
      relatedVerses: [
        { ref: "Salmo 55:22", text: "Echa sobre Jehová tu carga, y él te sustentará." },
        { ref: "1 Pedro 5:7", text: "Echando toda vuestra ansiedad sobre él, porque él tiene cuidado de vosotros." }
      ]
    },
    {
      text: "Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo en dondequiera que vayas.",
      reference: "Josué 1:9",
      explanation: "Cuando tenemos una gran responsabilidad o estamos ante un gran cambio, Dios nos da la seguridad de que Él está con nosotros. No debemos temer porque su presencia nos da el valor que necesitamos.",
      relatedVerses: [
        { ref: "Isaías 41:10", text: "No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios." },
        { ref: "Salmo 27:1", text: "Jehová es mi luz y mi salvación; ¿de quién temeré?" }
      ]
    },
    {
      text: "Por la misericordia de Jehová no hemos sido consumidos, porque nunca decayeron sus misericordias. Nuevas son cada mañana; grande es tu fidelidad.",
      reference: "Lamentaciones 3:22-23",
      explanation: "Cada día es una nueva oportunidad que Dios nos da. Aunque hayamos cometido errores ayer, su gracia está para nosotros hoy. Esto nos da esperanza para seguir adelante cada mañana.",
      relatedVerses: [
        { ref: "Salmo 30:5", text: "Por la noche durará el lloro, Y a la mañana vendrá la alegría." },
        { ref: "Efesios 2:4-5", text: "Pero Dios, que es rico en misericordia, por su gran amor con que nos amó." }
      ]
    }
  ],
  fr: [
    {
      text: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu'il ait la vie éternelle.",
      reference: "Jean 3:16",
      explanation: "Ce verset est au cœur du message de l'Évangile. Il nous montre que l'amour de Dieu n'a pas de limites et offre à tous la possibilité de trouver la vie éternelle à travers la foi en Jésus. C'est une invitation à faire confiance à Dieu et à recevoir le cadeau du salut qu'Il nous offre gratuitement.",
      relatedVerses: [
        { ref: "Romains 5:8", text: "Mais Dieu prouve son amour envers nous, en ce que, lorsque nous étions encore des pécheurs, Christ est mort pour nous." },
        { ref: "1 Jean 4:9", text: "L'amour de Dieu a été manifesté envers nous en ce que Dieu a envoyé son Fils unique dans le monde, afin que nous vivions par lui." }
      ]
    },
    {
      text: "L'Éternel est mon berger: je ne manquerai de rien. Il me fait reposer dans de verts pâturages, Il me dirige près des eaux paisibles.",
      reference: "Psaume 23:1-2",
      explanation: "Ce psaume nous donne l'assurance que Dieu prend soin de nous comme un berger. Il nous protège, nous guide et nous donne tout ce dont nous avons besoin. Même dans les moments les plus difficiles, nous ne devons pas craindre car Il est avec nous.",
      relatedVerses: [
        { ref: "Jean 10:11", text: "Je suis le bon berger. Le bon berger donne sa vie pour ses brebis." },
        { ref: "Ésaïe 40:11", text: "Comme un berger, il paîtra son troupeau, il prendra les agneaux dans ses bras." }
      ]
    },
    {
      text: "Je puis tout par celui qui me fortifie.",
      reference: "Philippiens 4:13",
      explanation: "Ce verset nous encourage à ne jamais nous décourager. Notre force ne vient pas de nous-mêmes, mais elle vient de Dieu. Quelle que soit la situation dans laquelle nous nous trouvons, nous pouvons y faire face car le Christ nous soutient.",
      relatedVerses: [
        { ref: "Ésaïe 40:31", text: "Mais ceux qui se confient en l'Éternel renouvellent leur force." },
        { ref: "2 Corinthiens 12:9", text: "Ma grâce te suffit, car ma puissance s'accomplit dans la faiblesse." }
      ]
    },
    {
      text: "Confie-toi en l'Éternel de tout ton cœur, et ne t'appuie pas sur ta sagesse; Reconnais-le dans toutes tes voies, et il aplanira tes sentiers.",
      reference: "Proverbes 3:5-6",
      explanation: "C'est un appel à dépendre totalement de Dieu. Souvent nous pensons savoir mieux, mais la sagesse de Dieu est plus grande. Si nous le consultons dans tout ce que nous faisons, il nous guidera dans la bonne direction.",
      relatedVerses: [
        { ref: "Psaume 37:5", text: "Recommande ton sort à l'Éternel, mets en lui ta confiance, et il agira." },
        { ref: "Jacques 1:5", text: "Si quelqu'un d'entre vous manque de sagesse, qu'il la demande à Dieu." }
      ]
    },
    {
      text: "Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos.",
      reference: "Matthieu 11:28",
      explanation: "Jésus nous appelle à déposer tous nos fardeaux à ses pieds. La vie peut être difficile et nous pouvons nous sentir fatigués, mais en lui nous pouvons trouver un vrai repos pour nos âmes.",
      relatedVerses: [
        { ref: "Psaume 55:22", text: "Remets ton sort à l'Éternel, et il te soutiendra." },
        { ref: "1 Pierre 5:7", text: "Et déchargez-vous sur lui de tous vos soucis, car lui-même prend soin de vous." }
      ]
    },
    {
      text: "Ne t'ai-je pas donné cet ordre: Fortifie-toi et prends courage? Ne t'effraie point et ne t'épouvante point, car l'Éternel, ton Dieu, est avec toi dans tout ce que tu entreprendras.",
      reference: "Josué 1:9",
      explanation: "Lorsque nous avons une grande responsabilité ou que nous sommes devant un grand changement, Dieu nous donne l'assurance qu'il est avec nous. Nous ne devons pas craindre car sa présence nous donne le courage dont nous avons besoin.",
      relatedVerses: [
        { ref: "Ésaïe 41:10", text: "Ne crains rien, car je suis avec toi; ne promène pas des regards inquiets, car je suis ton Dieu." },
        { ref: "Psaume 27:1", text: "L'Éternel est ma lumière et mon salut: de qui aurais-je crainte?" }
      ]
    },
    {
      text: "Les bontés de l'Éternel ne sont pas épuisées, ses compassions ne sont pas à leur terme; Elles se renouvellent chaque matin. Oh! que ta fidélité est grande!",
      reference: "Lamentations 3:22-23",
      explanation: "Chaque jour est une nouvelle chance que Dieu nous donne. Même si nous avons fait des erreurs hier, sa grâce est là pour nous aujourd'hui. Cela nous donne l'espoir de continuer à avancer chaque matin.",
      relatedVerses: [
        { ref: "Psaume 30:5", text: "Le soir arrivent les pleurs, et le matin l'allégresse." },
        { ref: "Éphésiens 2:4-5", text: "Mais Dieu, qui est riche en miséricorde, à cause du grand amour dont il nous a aimés." }
      ]
    }
  ]
};
