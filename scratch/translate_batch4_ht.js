const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'ht_to_translate_batch4.json');
const outputPath = path.join(__dirname, 'fr_translated_batch4.json');

const questions = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

const translations = {
    "dq-lug-008": {
        questionText: "Dans quel pays Joseph (fils de Jacob) a-t-il servi comme gouverneur ?",
        options: ["Canaan", "Égypte", "Babylone", "Syrie"],
        explanation: "Joseph fut vendu comme esclave en Égypte, et grâce à l'interprétation des rêves de Pharaon, il devint gouverneur d'Égypte (Genèse 41:40-41).",
        bibleReference: "Genèse 41:40-41"
    },
    "dq-lug-009": {
        questionText: "Quelle était la ville d'origine d'Abraham avant son départ pour Canaan ?",
        options: ["Babylone", "Ninive", "Ur en Chaldée", "Damas"],
        explanation: "« Térach prit Abram, son fils... ils sortirent d'Ur en Chaldée pour aller au pays de Canaan » (Genèse 11:31). Dieu appela Abraham depuis Ur.",
        bibleReference: "Genèse 11:31"
    },
    "dq-lug-010": {
        questionText: "Dans quelle mer l'armée de Pharaon s'est-elle noyée en poursuivant Israël ?",
        options: ["Mer Méditerranée", "Mer Morte", "Mer de Galilée", "Mer Rouge"],
        explanation: "Dieu fendit la Mer Rouge pour qu'Israël traverse, puis les eaux revinrent couvrir l'armée de Pharaon (Exode 14:26-28).",
        bibleReference: "Exode 14:26-28"
    },
    "dq-lug-011": {
        questionText: "Dans quelle ville Jésus a-t-il été crucifié ?",
        options: ["Capernaüm", "Bethléem", "Nazareth", "Jérusalem"],
        explanation: "Jésus fut crucifié hors des portes de Jérusalem, en un lieu appelé Golgotha ou « le Crâne » (Jean 19:17-20).",
        bibleReference: "Jean 19:17-20"
    },
    "dq-lug-012": {
        questionText: "Au bord de quelle mer Pierre, André, Jacques et Jean pêchaient-ils ?",
        options: ["Mer Méditerranée", "Mer Morte", "Mer de Galilée", "Mer Rouge"],
        explanation: "Jésus appela ses premiers disciples alors qu'ils pêchaient dans la mer de Galilée (aussi appelée lac de Génésareth ou lac de Tibériade) (Matthieu 4:18).",
        bibleReference: "Matthieu 4:18"
    },
    "dq-lug-013": {
        questionText: "Sur quelle montagne Moïse a-t-il reçu les Dix Commandements de la part de Dieu ?",
        options: ["Mont Nébo", "Mont Carmel", "Mont Sinaï", "Mont Hermon"],
        explanation: "Dieu appela Moïse sur le mont Sinaï (aussi appelé Horeb) où il lui donna la loi sur des tables de pierre (Exode 19:20 ; 31:18).",
        bibleReference: "Exode 19:20"
    },
    "dq-lug-014": {
        questionText: "Sur quelle montagne Salomon a-t-il bâti le temple de Dieu ?",
        options: ["Mont Sinaï", "Mont des Oliviers", "Mont Morija / Sion", "Mont Carmel"],
        explanation: "Salomon bâtit le temple sur le mont Morija, à Jérusalem, là même où Abraham avait failli sacrifier Isaac (2 Chroniques 3:1).",
        bibleReference: "2 Chroniques 3:1"
    },
    "dq-lug-015": {
        questionText: "Sur quelle montagne Dieu a-t-il commandé à Abraham de sacrifier son fils Isaac ?",
        options: ["Mont Sinaï", "Mont Morija", "Mont Hermon", "Mont Nébo"],
        explanation: "« Va au pays de Morija, et là offre-le en holocauste » (Genèse 22:2). Ce mont est identifié au lieu où Salomon bâtit le temple (2 Chroniques 3:1).",
        bibleReference: "Genèse 22:2"
    },
    "dq-lug-016": {
        questionText: "Où la première communauté chrétienne s'est-elle établie selon le livre des Actes ?",
        options: ["Antioche", "Rome", "Éphèse", "Jérusalem"],
        explanation: "La première église naquit à Jérusalem le jour de la Pentecôte, quand le Saint-Esprit descendit et qu'environ 3 000 personnes se convertirent (Actes 2:1-47).",
        bibleReference: "Actes 2:47"
    },
    "dq-lug-017": {
        questionText: "Quelle ville, dans le livre de l'Apocalypse, représente symboliquement le pouvoir oppresseur de Rome ?",
        options: ["Sodome", "Babylone", "Ninive", "Tyr"],
        explanation: "Dans l'Apocalypse 17-18, « Babylone la Grande » est présentée comme le symbole de la ville oppressante (interprétée comme Rome) qui persécutait les saints.",
        bibleReference: "Apocalypse 17:5"
    },
    "dq-lug-018": {
        questionText: "Dans quel désert le peuple d'Israël a-t-il séjourné pendant 40 ans avant d'entrer en Canaan ?",
        options: ["Désert de Judée", "Déserts de Sinaï et de Paran", "Désert d'Arabie", "Désert du Néguev"],
        explanation: "Israël erra dans le désert du Sinaï et les plaines de Paran pendant 40 ans. Ils traversèrent aussi les déserts de Tsin et de Kadès-Barnéa (Nombres 33).",
        bibleReference: "Nombres 33:1-49"
    },
    "dq-evnt-006": {
        questionText: "Pendant combien de jours et de nuits la pluie est-elle tombée durant le déluge de Noé ?",
        options: ["7", "20", "40", "100"],
        explanation: "La pluie du déluge tomba pendant quarante jours et quarante nuits (Genèse 7:12). Les eaux dominèrent la terre pendant 150 jours.",
        bibleReference: "Genèse 7:12"
    },
    "dq-evnt-007": {
        questionText: "Quand Jésus est-il ressuscité après sa mort ?",
        options: ["Le premier jour", "Le deuxième jour", "Le troisième jour", "Une semaine après"],
        explanation: "Jésus ressuscita le troisième jour, comme il l'avait annoncé et selon les Écritures (1 Corinthiens 15:4).",
        bibleReference: "1 Corinthiens 15:4"
    },
    "dq-evnt-008": {
        questionText: "Que s'est-il passé au ciel et sur la terre quand Jésus fut baptisé dans le Jourdain ?",
        options: ["Un tremblement de terre secoua la région", "L'Esprit descendit comme une colombe et le Père parla du ciel", "Des anges apparurent sur la rivière", "L'eau du Jourdain se divisa"],
        explanation: "« Les cieux s'ouvrirent, et il vit l'Esprit de Dieu descendre comme une colombe et venir sur lui. Et voici, une voix fit entendre des cieux ces paroles : Celui-ci est mon Fils bien-aimé » (Matthieu 3:16-17).",
        bibleReference: "Matthieu 3:16-17"
    },
    "dq-evnt-009": {
        questionText: "Combien de jours après sa résurrection Jésus est-il monté au ciel ?",
        options: ["3 jours", "7 jours", "40 jours", "50 jours"],
        explanation: "« Après qu'il eut souffert, il leur apparut vivant, et leur en donna plusieurs preuves, se montrant à eux pendant quarante jours » (Actes 1:3).",
        bibleReference: "Actes 1:3"
    },
    "dq-evnt-010": {
        questionText: "Quel événement a divisé le royaume unifié d'Israël en deux royaumes séparés ?",
        options: ["La mort du roi David", "La défaite contre les Philistins", "La mort de Salomon et la rébellion des 10 tribus sous Roboam", "L'invasion babylonienne"],
        explanation: "Après la mort de Salomon, Roboam augmenta les taxes. Les 10 tribus du nord se révoltèrent et suivirent Jéroboam, divisant le royaume en Israël (nord) et Juda (sud) (1 Rois 12).",
        bibleReference: "1 Rois 12:16-19"
    },
    "dq-evnt-011": {
        questionText: "Quel événement a eu lieu 50 jours après la résurrection de Jésus (la Pâque) ?",
        options: ["L'Ascension de Jésus", "La conversion de Paul", "La Pentecôte : la descente du Saint-Esprit", "La première mission de Paul"],
        explanation: "La Pentecôte (Shavuot) eut lieu 50 jours après la Pâque. Ce jour-là, le Saint-Esprit fut répandu sur l'église naissante (Actes 2:1-4).",
        bibleReference: "Actes 2:1-4"
    },
    "dq-evnt-012": {
        questionText: "Quels signes surnaturels ont accompagné la mort de Jésus sur la croix ?",
        options: ["Seulement des ténèbres pendant 3 heures", "Ténèbres, tremblement de terre, voile du temple déchiré et résurrection de saints", "Pluie de feu et tonnerre", "Le soleil brilla avec une intensité inhabituelle"],
        explanation: "À la mort de Jésus : le voile du temple se déchira du haut en bas, la terre trembla, les rochers se fendirent et des sépulcres s'ouvrirent (Matthieu 27:50-53).",
        bibleReference: "Matthieu 27:50-53"
    },
    "dq-evnt-013": {
        questionText: "En quelle année environ Jérusalem est-elle tombée aux mains de Babylone sous Nebucadnetsar ?",
        options: ["722 av. J.-C.", "612 av. J.-C.", "586 av. J.-C.", "550 av. J.-C."],
        explanation: "En 586 av. J.-C., Nebucadnetsar détruisit le temple de Salomon, brûla Jérusalem et emmena le peuple captif à Babylone (2 Rois 25:8-11).",
        bibleReference: "2 Rois 25:8-11"
    },
    "dq-evnt-014": {
        questionText: "En quelle année le royaume du nord d'Israël est-il tombé sous l'invasion assyrienne ?",
        options: ["850 av. J.-C.", "722 av. J.-C.", "612 av. J.-C.", "586 av. J.-C."],
        explanation: "En 722 av. J.-C., le roi d'Assyrie Salmanasar V (puis Sargon II) conquit Samarie, capitale du royaume du nord, et déporta les 10 tribus (2 Rois 17:6).",
        bibleReference: "2 Rois 17:6"
    },
    "dq-evnt-015": {
        questionText: "Combien d'années après la mort de Jésus le temple d'Hérode à Jérusalem fut-il détruit par les Romains ?",
        options: ["10 ans (an 40)", "~40 ans (an 70)", "100 ans (an 130)", "200 ans (an 230)"],
        explanation: "Le temple fut détruit par le général romain Titus en l'an 70 apr. J.-C., environ 40 ans après la crucifixion de Jésus (~an 30), réalisant la prophétie de Jésus (Matthieu 24:2).",
        bibleReference: "Matthieu 24:2"
    },
    "dq-tema-003": {
        questionText: "Combien de fois Pierre devait-il pardonner à son frère selon Jésus ?",
        options: ["7 fois", "77 fois", "70 fois sept fois", "100 fois"],
        explanation: "« Je ne te dis pas jusqu'à sept fois, mais jusqu'à soixante-dix fois sept fois » (Matthieu 18:22). Jésus enseignait un pardon sans limite.",
        bibleReference: "Matthieu 18:22"
    },
    "dq-tema-004": {
        questionText: "Que dit Hébreux 11:1 au sujet de la foi ?",
        options: ["C'est le résultat d'une obéissance parfaite", "C'est l'assurance des choses qu'on espère, la démonstration de celles qu'on ne voit pas", "C'est croire sans preuves", "C'est le plus grand don de l'Esprit"],
        explanation: "« Or la foi est une ferme assurance des choses qu'on espère, une démonstration de celles qu'on ne voit pas » (Hébreux 11:1).",
        bibleReference: "Hébreux 11:1"
    },
    "dq-tema-005": {
        questionText: "Que promet Dieu selon 1 Jean 1:9 si nous confessons nos péchés ?",
        options: ["Il nous donnera plus d'épreuves", "Que nous ne pécherons plus jamais", "Il est fidèle et juste pour nous les pardonner et nous purifier de toute iniquité", "Que nous serons parfaits"],
        explanation: "« Si nous confessons nos péchés, il est fidèle et juste pour nous les pardonner, et pour nous purifier de toute iniquité » (1 Jean 1:9).",
        bibleReference: "1 Jean 1:9"
    },
    "dq-tema-006": {
        questionText: "Quelles sont les trois vertus éternelles qui demeurent selon 1 Corinthiens 13:13 ?",
        options: ["Prière, jeûne et service", "Courage, sagesse et puissance", "La foi, l'espérance et l'amour", "Obéissance, certitude et paix"],
        explanation: "« Maintenant donc ces trois choses demeurent : la foi, l'espérance, l'amour ; mais la plus grande de ces choses, c'est l'amour » (1 Corinthiens 13:13).",
        bibleReference: "1 Corinthiens 13:13"
    },
    "dq-tema-007": {
        questionText: "Dans quel chapitre de 1 Corinthiens Paul décrit-il l'amour comme la « voie par excellence » ?",
        options: ["Chapitre 1", "Chapitre 10", "Chapitre 13", "Chapitre 15"],
        explanation: "L'« Hymne à l'amour » se trouve en 1 Corinthiens 13, où Paul décrit l'amour comme supérieur aux dons spirituels.",
        bibleReference: "1 Corinthiens 13:1-13"
    },
    "dq-tema-008": {
        questionText: "Quel commandement Jésus appelle-t-il « le premier et le plus grand » de tous ?",
        options: ["Tu ne tueras point", "Honore ton père et ta mère", "Tu aimeras le Seigneur ton Dieu de tout ton cœur, et ton prochain comme toi-même", "Tu ne prendras point le nom de Dieu en vain"],
        explanation: "« Tu aimeras le Seigneur, ton Dieu, de tout ton cœur... C'est là le premier et le plus grand commandement. Et voici le second, qui lui est semblable : Tu aimeras ton prochain comme toi-même » (Matthieu 22:37-39).",
        bibleReference: "Matthieu 22:37-39"
    },
    "dq-tema-009": {
        questionText: "Quelle parabole de Jésus illustre le mieux l'amour et la miséricorde du Père pour le pécheur repentant ?",
        options: ["Parabole des dix vierges", "Parabole du bon Samaritain", "Parabole du fils prodigue", "Parabole du semeur"],
        explanation: "La parabole du fils prodigue (Luc 15:11-32) montre le père courant embrasser son fils à son retour repentant, symbole de l'amour de Dieu pour le pécheur.",
        bibleReference: "Luc 15:20-24"
    },
    "dq-tema-010": {
        questionText: "Quelle fonction la loi de Dieu a-t-elle par rapport au péché selon Romains 3:20 ?",
        options: ["Elle sauve ceux qui lui obéissent", "Elle condamne le pécheur sans possibilité de pardon", "C'est par la loi que vient la connaissance du péché", "Elle n'est pas nécessaire pour le croyant"],
        explanation: "« Car nul ne sera justifié devant lui par les œuvres de la loi, puisque c'est par la loi que vient la connaissance du péché » (Romains 3:20).",
        bibleReference: "Romains 3:20"
    },
    "dq-tema-011": {
        questionText: "Quel est le seul péché que Jésus déclare impardonnable ?",
        options: ["Le meurtre", "L'adultère", "L'apostasie", "Le blasphème contre le Saint-Esprit"],
        explanation: "« Tout péché et tout blasphème sera pardonné aux hommes, mais le blasphème contre l'Esprit ne sera point pardonné » (Matthieu 12:31). Cela se réfère au fait d'attribuer les œuvres de l'Esprit au diable.",
        bibleReference: "Matthieu 12:31"
    },
    "dq-tema-012": {
        questionText: "Quelle est la différence théologique entre la « grâce » et la « miséricorde » dans la Bible ?",
        options: ["Elles sont parfaitement synonymes", "Grâce : recevoir ce qu'on ne mérite pas ; Miséricorde : ne pas recevoir le châtiment qu'on mérite", "La grâce est pour l'AT et la miséricorde pour le NT", "La miséricorde est pour Israël ; la grâce pour les païens"],
        explanation: "La GRÂCE (charis) est la faveur que Dieu nous accorde sans que nous la méritions (recevoir le salut, la vie). La MISÉRICORDE (eleos) consiste à ne pas recevoir le jugement que nous méritons pour nos péchés.",
        bibleReference: "Éphésiens 2:4-5"
    },
    "dq-tema-013": {
        questionText: "Quelle parabole de Jésus illustre que notre refus de pardonner peut affecter le pardon que nous recevons ?",
        options: ["Parabole des talents", "Parabole du serviteur impitoyable", "Parabole du semeur", "Parabole des brebis et des boucs"],
        explanation: "Matthieu 18:23-35 : le roi pardonna une immense dette à son serviteur, mais celui-ci ne pardonna pas à son compagnon. Le roi le livra aux bourreaux. « C'est ainsi que mon Père céleste vous traitera, si chacun de vous ne pardonne à son frère... » (v.35).",
        bibleReference: "Matthieu 18:23-35"
    },
    "dq-tema-014": {
        questionText: "Que dit Romains 5:8 sur l'amour de Dieu pour les pécheurs ?",
        options: ["Que Dieu aime les justes plus que les pécheurs", "Que Dieu prouve son amour envers nous, en ce que, lorsque nous étions encore des pécheurs, Christ est mort pour nous", "Que l'amour de Dieu dépend de notre obéissance", "Que Dieu aime tout le monde de la même manière sans distinction"],
        explanation: "« Mais Dieu prouve son amour envers nous, en ce que, lorsque nous étions encore des pécheurs, Christ est mort pour nous » (Romains 5:8). L'amour de Dieu n'a pas attendu que nous soyons parfaits.",
        bibleReference: "Romains 5:8"
    },
    "dq-tema-015": {
        questionText: "Quelles sont les trois dimensions de l'amour chrétien soulignées dans la première lettre de Jean ?",
        options: ["Aimer Dieu, son prochain et soi-même", "Aimer Dieu, les frères dans la foi, et le démontrer par des actes concrets", "La foi, l'espérance et l'amour pour le prochain", "L'amour familial, l'amour pour l'étranger et l'amour pour l'ennemi"],
        explanation: "1 Jean souligne : aimer Dieu (4:8), aimer son frère (4:21), et cet amour doit se démontrer en actes (3:18). « N'aimons pas en paroles et avec la langue, mais en actions et avec vérité » (3:18).",
        bibleReference: "1 Jean 3:18 ; 4:21"
    },
    "dq-gen-005": {
        questionText: "En combien de jours Dieu a-t-il créé le monde avant de se reposer ?",
        options: ["5 jours", "6 jours, puis il se reposa le septième jour", "7 jours, puis il se reposa le huitième", "3 jours"],
        explanation: "Dieu créa toutes choses en six jours et le septième jour il se reposa.",
        bibleReference: "Genèse 2:2"
    },
    "dq-gen-006": {
        questionText: "Quel fut le premier homme créé par Dieu ?",
        options: ["Abraham", "Noé", "Adam", "Moïse"],
        explanation: "Adam fut le premier homme, formé de la poussière de la terre.",
        bibleReference: "Genèse 2:7"
    },
    "dq-gen-007": {
        questionText: "Qui a été sauvé du déluge avec sa famille dans une arche ?",
        options: ["Lot", "Hénoc", "Noé", "Mathusalem"],
        explanation: "Noé trouva grâce et bâtit l'arche pour sauver sa famille.",
        bibleReference: "Genèse 6-8"
    },
    "dq-gen-008": {
        questionText: "Quel est le symbole de l'alliance de Dieu avec Noé pour ne plus détruire la terre par les eaux ?",
        options: ["Une colombe", "Un autel", "Un arc-en-ciel", "Une étoile"],
        explanation: "L'arc-en-ciel fut placé dans les nues comme signe de l'alliance.",
        bibleReference: "Genèse 9:13"
    },
    "dq-gen-009": {
        questionText: "Quelle épreuve Dieu a-t-il demandée à Abraham pour prouver sa foi ?",
        options: ["Sacrifier son fils Isaac", "Quitter ses richesses", "Jeûner 40 jours", "Bâtir un temple"],
        explanation: "Dieu demanda à Abraham d'offrir son fils unique Isaac, mais il l'en empêcha au dernier moment.",
        bibleReference: "Genèse 22"
    },
    "dq-gen-010": {
        questionText: "Qu'a rêvé Jacob alors qu'il dormait sur une pierre ?",
        options: ["Sept vaches maigres", "Une échelle s'élevant vers le ciel", "Des étoiles se prosternant", "Un buisson ardent"],
        explanation: "Jacob rêva d'une échelle posée sur la terre et dont le sommet touchait au ciel, avec des anges montant et descendant.",
        bibleReference: "Genèse 28:12"
    },
    "dq-gen-011": {
        questionText: "Pour combien de pièces d'argent les frères de Joseph l'ont-ils vendu ?",
        options: ["20", "30", "40", "50"],
        explanation: "Les frères de Joseph le vendirent aux Ismaélites pour vingt pièces d'argent.",
        bibleReference: "Genèse 37:28"
    },
    "dq-gen-012": {
        questionText: "Quelle femme Jacob aimait-il le plus et pour laquelle il a travaillé 14 ans ?",
        options: ["Léa", "Rébecca", "Rachel", "Sara"],
        explanation: "Jacob aimait Rachel et il servit sept ans pour elle, puis encore sept autres années.",
        bibleReference: "Genèse 29"
    },
    "dq-gen-013": {
        questionText: "Que signifie le rêve de Pharaon selon l'interprétation de Joseph ?",
        options: ["Sept années de guerre et sept années de paix", "Sept années d'abondance et sept années de famine", "Sept malédictions sur l'Égypte", "Sept rois différents"],
        explanation: "Le rêve prédisait sept années de grande abondance suivies de sept années de famine extrême.",
        bibleReference: "Genèse 41:29-30"
    },
    "dq-gen-014": {
        questionText: "Combien d'années Mathusalem a-t-il vécu ?",
        options: ["365", "930", "969", "777"],
        explanation: "Mathusalem vécut neuf cent soixante-neuf ans, l'homme ayant vécu le plus longtemps dans la Bible.",
        bibleReference: "Genèse 5:27"
    },
    "dq-gen-015": {
        questionText: "Quel est le nom du serviteur d'Abraham qui est allé chercher une femme pour Isaac ?",
        options: ["Éliézer", "Lot", "Ismaélite", "Abimélec"],
        explanation: "La tradition l'identifie comme Éliézer, le serviteur d'Abraham, qui partit pour la Mésopotamie afin de trouver Rébecca (Genèse 24).",
        bibleReference: "Genèse 24:2"
    },
    "dq-gen-016": {
        questionText: "Vers quel pays Jacob et ses fils sont-ils partis vivre durant la famine ?",
        options: ["Canaan", "Moab", "Égypte", "Babylone"],
        explanation: "Jacob et toute sa famille (70 personnes) descendirent en Égypte où Joseph était gouverneur, afin d'échapper à la famine.",
        bibleReference: "Genèse 46:6-7"
    },
    "dq-gen-017": {
        questionText: "Qu'a dit Dieu au serpent comme punition pour avoir trompé Ève ?",
        options: ["Il n'aurait plus de pieds et marcherait sur son ventre", "Il brûlerait dans un feu éternel", "Il resterait muet", "Il perdrait sa langue"],
        explanation: "« Puisque tu as fait cela, tu seras maudit entre tout le bétail... tu marcheras sur ton ventre, et tu mangeras de la poussière » (Genèse 3:14).",
        bibleReference: "Genèse 3:14"
    },
    "dq-exo-003": {
        questionText: "Sous quelle forme Dieu est-il apparu à Moïse sur le mont Horeb ?",
        options: ["Un nuage", "Un buisson ardent qui ne se consumait pas", "Un ange avec une épée", "Un escalier de lumière"],
        explanation: "L'ange de l'Éternel apparut à Moïse dans une flamme de feu, au milieu d'un buisson — le buisson brûlait mais ne se consumait point (Exode 3:2).",
        bibleReference: "Exode 3:2"
    },
    "dq-exo-004": {
        questionText: "Quel fut le 10ème et dernier fléau qui a poussé Pharaon à laisser partir Israël ?",
        options: ["Les sauterelles", "Les ténèbres", "La mort des premiers-nés", "L'eau changée en sang"],
        explanation: "La mort de tous les premiers-nés d'Égypte mit fin à la résistance de Pharaon et il laissa partir le peuple d'Israël (Exode 12:29-31).",
        bibleReference: "Exode 12:29-31"
    },
    "dq-exo-005": {
        questionText: "Quel miracle Dieu a-t-il accompli pour qu'Israël traverse à sec alors que Pharaon les poursuivait ?",
        options: ["Il envoya la foudre", "Il fendit la Mer Rouge", "Il envoya un grand vent", "Il endormit l'armée"],
        explanation: "Dieu fendit la Mer Rouge et Israël passa sur la terre ferme. L'armée égyptienne se noya (Exode 14:21-28).",
        bibleReference: "Exode 14:21-28"
    }
};

const result = questions.map(q => {
    const trans = translations[q.newId];
    if (trans) {
        q.fr = {
            id: q.newId,
            questionText: trans.questionText,
            categoryId: q.ht.categoryId,
            categoryName: q.ht.categoryName.replace("Kote Biblik Yo", "Lieux Bibliques").replace("Evènman Enpòtan", "Événements Importants").replace("Tèm Biblik", "Thèmes Bibliques").replace("Jenèz", "Genèse").replace("Egzòd", "Exode"), // Minimal replacement, usually handled by mapping
            difficulty: q.ht.difficulty,
            language: "fr",
            options: q.ht.options.map((opt, i) => ({
                id: opt.id,
                text: trans.options[i]
            })),
            correctOptionId: q.ht.correctOptionId,
            explanation: trans.explanation,
            bibleReference: trans.bibleReference,
            normalizedRef: q.ht.normalizedRef,
            normalizedCat: q.ht.normalizedCat
        };
        // Fix category name for FR if needed, though integrate script might handle it.
        // Let's use standard category names for FR.
        const catMap = {
            "lugares": "Lieux Bibliques",
            "eventos": "Événements Importants",
            "temas": "Thèmes Bibliques",
            "genesis": "Genèse",
            "exodo": "Exode"
        };
        if (catMap[q.ht.categoryId]) {
            q.fr.categoryName = catMap[q.ht.categoryId];
        }
    }
    return q;
});

fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
console.log('Batch 4 HT to FR translated.');
