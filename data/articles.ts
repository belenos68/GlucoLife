
import { Article } from '../types';

export const allArticles: { [key: string]: Article[] } = {
  Nutrition: [
    {
      id: 'nutri-1',
      title: "Les Super-pouvoirs des Légumineuses",
      summary: "Pois chiches, lentilles, haricots... Découvrez pourquoi ces aliments sont des champions pour stabiliser votre glycémie.",
      imageUrl: 'https://images.unsplash.com/photo-1594202256908-f3508e359557?q=80&w=2070&auto=format&fit=crop',
      category: 'Nutrition',
      content: `
        <p>Les <strong>légumineuses</strong> sont souvent sous-estimées, pourtant elles sont de véritables trésors nutritionnels, surtout pour la gestion de la glycémie.</p>
        <h4 class="font-bold mt-4 mb-2">Pourquoi sont-elles si efficaces ?</h4>
        <ul class="list-disc list-inside my-2 space-y-1">
          <li><strong>Riches en fibres solubles :</strong> Ces fibres forment un gel dans l'estomac, ce qui ralentit considérablement la digestion et l'absorption des glucides. Résultat : pas de pic de sucre brutal après le repas.</li>
          <li><strong>Source de protéines végétales :</strong> Les protéines augmentent la satiété et contribuent également à ralentir la vidange de l'estomac.</li>
          <li><strong>Indice Glycémique bas :</strong> La plupart des légumineuses ont un IG très bas, ce qui en fait un choix de premier ordre.</li>
        </ul>
        <h4 class="font-bold mt-4 mb-2">Comment les intégrer ?</h4>
        <p>Ajoutez des lentilles à vos soupes, des pois chiches à vos salades, ou remplacez une partie de votre viande par des haricots rouges dans un chili. C'est simple, économique et délicieux !</p>
      `
    },
    {
      id: 'nutri-2',
      title: "Manger Gras pour Mieux Gérer sa Glycémie ?",
      summary: "Toutes les graisses ne sont pas à bannir, bien au contraire. Apprenez à choisir les bonnes graisses pour en faire des alliées.",
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop',
      category: 'Nutrition',
      content: `
        <p>Le mot "gras" fait souvent peur, mais il est crucial de distinguer les bonnes des mauvaises graisses. Les <strong>bonnes graisses</strong> sont essentielles à notre santé et peuvent être très bénéfiques pour la glycémie.</p>
        <h4 class="font-bold mt-4 mb-2">Quelles sont les bonnes graisses ?</h4>
        <ul class="list-disc list-inside my-2 space-y-1">
          <li><strong>Graisses mono-insaturées :</strong> On les trouve dans l'huile d'olive, les avocats, les amandes et les noix de cajou.</li>
          <li><strong>Graisses poly-insaturées (Oméga-3 et 6) :</strong> Présentes dans les poissons gras (saumon, maquereau), les graines de lin, les graines de chia et les noix.</li>
        </ul>
        <h4 class="font-bold mt-4 mb-2">Leur rôle sur la glycémie</h4>
        <p>Consommer des bonnes graisses avec des glucides ralentit la digestion de ces derniers. Cela permet d'étaler la libération de sucre dans le sang sur une plus longue période, évitant ainsi les pics glycémiques. Un filet d'huile d'olive sur vos légumes ou une poignée d'amandes en collation peut faire une grande différence.</p>
      `
    },
    {
      id: 'nutri-3',
      title: "Les Fruits : Amis ou Ennemis de votre Glycémie ?",
      summary: "Les fruits contiennent du sucre, mais aussi beaucoup de bonnes choses. Apprenez à les consommer intelligemment.",
      imageUrl: 'https://images.unsplash.com/photo-1521997888043-aa9c82faa163?q=80&w=1935&auto=format&fit=crop',
      category: 'Nutrition',
      content: `
        <p>C'est une question fréquente : peut-on manger des fruits quand on surveille sa glycémie ? La réponse est <strong>oui</strong>, mais avec quelques astuces.</p>
        <h4 class="font-bold mt-4 mb-2">Les atouts des fruits</h4>
        <p>Les fruits sont riches en <strong>fibres</strong>, en vitamines et en antioxydants. Les fibres sont essentielles car elles ralentissent l'absorption du fructose, le sucre naturel des fruits.</p>
        <h4 class="font-bold mt-4 mb-2">Conseils pratiques :</h4>
        <ul class="list-disc list-inside my-2 space-y-1">
            <li><strong>Choisissez des fruits à IG bas :</strong> Privilégiez les baies (fraises, myrtilles), les pommes, les poires, les pêches.</li>
            <li><strong>Mangez le fruit entier :</strong> Un fruit entier est toujours mieux qu'un jus, car les fibres sont préservées.</li>
            <li><strong>Associez-les :</strong> Mangez votre fruit avec une source de protéines ou de bonnes graisses (une poignée d'amandes, un morceau de fromage, un yaourt grec) pour ralentir encore plus l'absorption du sucre.</li>
            <li><strong>Attention aux portions :</strong> Une portion de fruit correspond environ à la taille d'une balle de tennis.</li>
        </ul>
      `
    }
  ],
  Lifestyle: [
    {
      id: 'life-1',
      title: "Stress et Glycémie : Le Lien Caché",
      summary: "Le stress chronique peut faire des ravages sur votre taux de sucre. Découvrez des techniques simples pour le maîtriser.",
      imageUrl: 'https://images.unsplash.com/photo-1531353826977-0941b4779a1C?q=80&w=2070&auto=format&fit=crop',
      category: 'Lifestyle',
      content: `
        <p>Vous avez beau manger parfaitement, votre glycémie reste parfois élevée sans raison apparente ? Le coupable pourrait être le <strong>stress</strong>.</p>
        <h4 class="font-bold mt-4 mb-2">Comment le stress agit-il ?</h4>
        <p>En situation de stress, votre corps libère des hormones comme le <strong>cortisol</strong> et l'adrénaline. Ces hormones préparent votre corps à l'action en libérant du glucose stocké dans votre foie. Si vous ne dépensez pas cette énergie (par exemple en fuyant un danger), ce sucre reste dans votre sang, faisant monter votre glycémie.</p>
        <h4 class="font-bold mt-4 mb-2">Stratégies anti-stress :</h4>
        <ul class="list-disc list-inside my-2 space-y-1">
          <li><strong>Respiration profonde :</strong> Prenez 5 minutes pour inspirer lentement par le nez (4s), retenir (4s) et expirer par la bouche (6s).</li>
          <li><strong>Activité physique :</strong> Une marche, même courte, aide à "brûler" les hormones du stress et le sucre libéré.</li>
          <li><strong>Pleine conscience (Mindfulness) :</strong> Des applications comme Headspace ou Calm peuvent vous initier à la méditation en quelques minutes par jour.</li>
          <li><strong>Contact avec la nature :</strong> Une simple promenade dans un parc a des effets prouvés sur la réduction du cortisol.</li>
        </ul>
      `
    },
    {
      id: 'life-2',
      title: "Marcher 10 Minutes : Le Geste qui Change Tout Après un Repas",
      summary: "Cette simple habitude peut réduire votre pic de glycémie de manière spectaculaire. Découvrez pourquoi c'est si efficace.",
      imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2070&auto=format&fit=crop',
      category: 'Lifestyle',
      content: `
        <p>C'est l'une des stratégies les plus puissantes et les plus accessibles : une courte marche juste après avoir mangé.</p>
        <h4 class="font-bold mt-4 mb-2">Comment ça fonctionne ?</h4>
        <p>Lorsque vous marchez, vos muscles ont besoin d'énergie. Leur carburant ? Le glucose qui circule dans votre sang, celui qui vient du repas que vous venez de manger.</p>
        <ul class="list-disc list-inside my-2 space-y-1">
          <li><strong>Utilisation directe du glucose :</strong> Vos muscles agissent comme des "éponges à sucre". Ils captent le glucose sanguin pour fonctionner, réduisant ainsi la quantité qui reste dans la circulation.</li>
          <li><strong>Pas besoin d'insuline :</strong> Une partie de ce processus se fait même sans l'aide de l'insuline, ce qui est excellent pour reposer votre pancréas.</li>
        </ul>
        <h4 class="font-bold mt-4 mb-2">Le bon timing</h4>
        <p>L'idéal est de commencer à marcher <strong>entre 15 et 30 minutes après la fin de votre repas</strong>. Une durée de <strong>10 à 15 minutes</strong> suffit pour observer un effet bénéfique. Pas besoin de faire un marathon, un rythme de marche normal est parfait !</p>
      `
    },
    {
      id: 'life-3',
      title: "L'Importance Cruciale de l'Hydratation",
      summary: "Boire de l'eau est vital, mais saviez-vous que cela a un impact direct sur la concentration de sucre dans votre sang ?",
      imageUrl: 'https://images.unsplash.com/photo-1541591223592-b49a5b323b6c?q=80&w=1974&auto=format&fit=crop',
      category: 'Lifestyle',
      content: `
        <p>Une bonne hydratation est l'un des moyens les plus simples et les plus efficaces pour aider à gérer votre glycémie.</p>
        <h4 class="font-bold mt-4 mb-2">Comment ça fonctionne ?</h4>
        <p>Lorsque vous êtes déshydraté, le volume de votre sang diminue. Par conséquent, la concentration de glucose dans ce volume réduit devient plus élevée. Boire suffisamment d'eau aide à :</p>
        <ul class="list-disc list-inside my-2 space-y-1">
            <li><strong>Reconstituer le volume sanguin :</strong> Cela "dilate" le sucre dans votre sang, faisant baisser sa concentration.</li>
            <li><strong>Aider les reins :</strong> L'eau est essentielle pour que vos reins puissent filtrer et éliminer l'excès de sucre par l'urine.</li>
        </ul>
        <h4 class="font-bold mt-4 mb-2">Conseils pour rester hydraté :</h4>
        <p>Visez environ 1,5 à 2 litres d'eau par jour. Gardez une bouteille d'eau à portée de main. Si vous n'aimez pas l'eau pure, ajoutez-y des tranches de citron, de concombre ou quelques feuilles de menthe. Évitez les boissons sucrées qui auront l'effet inverse !</p>
      `
    }
  ],
  Recipes: [
    {
      id: 'recipe-1',
      title: "Poulet Yassa Sénégalais Revisité",
      summary: "Une version saine du classique sénégalais, pleine de saveurs et douce pour la glycémie. Un plat mariné au citron et aux oignons.",
      imageUrl: 'https://plus.unsplash.com/premium_photo-1695299494793-19a714781532?q=80&w=1974&auto=format&fit=crop',
      category: 'Recipes',
      content: `
        <p>Le Poulet Yassa est un plat emblématique du Sénégal. Cette version est adaptée pour être plus saine, sans sacrifier le goût.</p>
        <h4 class="font-bold mt-4 mb-2">Ingrédients (pour 2 personnes) :</h4>
        <ul class="list-disc list-inside my-2 space-y-1">
          <li>2 cuisses de poulet, sans la peau</li>
          <li>2 gros oignons, émincés</li>
          <li>Jus de 2 citrons verts</li>
          <li>1 cuillère à soupe de moutarde de Dijon</li>
          <li>2 gousses d'ail, hachées</li>
          <li>1 cuillère à soupe d'huile d'olive</li>
          <li>Olives vertes dénoyautées (optionnel)</li>
          <li>Sel, poivre, et une pincée de piment</li>
        </ul>
        <h4 class="font-bold mt-4 mb-2">Préparation :</h4>
        <ol class="list-decimal list-inside my-2 space-y-1">
          <li>Dans un plat, mélangez le jus de citron, la moutarde, l'ail, le sel, le poivre et le piment. Ajoutez le poulet et la moitié des oignons. Laissez mariner au moins 1 heure (ou toute la nuit).</li>
          <li>Dans une poêle, faites chauffer l'huile d'olive. Retirez le poulet de la marinade et faites-le dorer des deux côtés. Mettez de côté.</li>
          <li>Dans la même poêle, faites revenir le reste des oignons jusqu'à ce qu'ils soient tendres.</li>
          <li>Remettez le poulet dans la poêle, versez la marinade et les oignons marinés. Ajoutez les olives.</li>
          <li>Couvrez et laissez mijoter à feu doux pendant 30-40 minutes, jusqu'à ce que le poulet soit bien cuit.</li>
          <li>Servez avec une petite portion de quinoa ou une grande salade verte.</li>
        </ol>
      `
    },
    {
      id: 'recipe-2',
      title: "Curry de Lentilles Éthiopien (Misir Wot)",
      summary: "Un ragoût de lentilles corail épicé, riche en fibres et en protéines. Un plat réconfortant et excellent pour la glycémie.",
      imageUrl: 'https://images.unsplash.com/photo-1598214886806-2c96a589bfea?q=80&w=1974&auto=format&fit=crop',
      category: 'Recipes',
      content: `
        <p>Le Misir Wot est un plat de base de la cuisine éthiopienne. Il est naturellement végétalien, sans gluten et incroyablement savoureux.</p>
        <h4 class="font-bold mt-4 mb-2">Ingrédients :</h4>
        <ul class="list-disc list-inside my-2 space-y-1">
          <li>1 tasse de lentilles corail, rincées</li>
          <li>1 oignon rouge, haché</li>
          <li>3 gousses d'ail, hachées</li>
          <li>1 cuillère à soupe de gingembre frais, râpé</li>
          <li>2 cuillères à soupe de pâte de tomate</li>
          <li>2 cuillères à soupe d'huile de coco ou d'olive</li>
          <li>Épices : 1 c.à.s de paprika, 1 c.à.c de cumin, 1/2 c.à.c de curcuma, pincée de piment de Cayenne</li>
          <li>3 tasses de bouillon de légumes ou d'eau</li>
          <li>Sel et poivre</li>
        </ul>
        <h4 class="font-bold mt-4 mb-2">Préparation :</h4>
        <ol class="list-decimal list-inside my-2 space-y-1">
          <li>Faites chauffer l'huile dans une casserole. Faites revenir l'oignon jusqu'à ce qu'il soit translucide.</li>
          <li>Ajoutez l'ail et le gingembre et faites cuire 1 minute de plus.</li>
          <li>Incorporez la pâte de tomate et toutes les épices. Laissez cuire 2 minutes en remuant.</li>
          <li>Ajoutez les lentilles rincées et le bouillon. Portez à ébullition.</li>
          <li>Réduisez le feu, couvrez et laissez mijoter pendant 20-25 minutes, jusqu'à ce que les lentilles soient tendres et que le ragoût ait épaissi.</li>
          <li>Salez, poivrez et servez chaud, garni de coriandre fraîche si vous le souhaitez.</li>
        </ol>
      `
    },
    {
      id: 'recipe-3',
      title: "Tagine de Poisson aux Légumes",
      summary: "Un plat léger et parfumé d'Afrique du Nord. Le poisson et les légumes cuisent doucement dans un bouillon savoureux.",
      imageUrl: 'https://images.unsplash.com/photo-1625944228741-cf3b93a52192?q=80&w=1964&auto=format&fit=crop',
      category: 'Recipes',
      content: `
        <p>Ce tagine est une façon saine et délicieuse de cuisiner le poisson blanc. Il est faible en glucides et riche en nutriments.</p>
        <h4 class="font-bold mt-4 mb-2">Ingrédients :</h4>
        <ul class="list-disc list-inside my-2 space-y-1">
          <li>2 filets de poisson blanc ferme (cabillaud, colin)</li>
          <li>1 oignon, émincé</li>
          <li>1 poivron rouge, en lanières</li>
          <li>1 courgette, en rondelles</li>
          <li>1 boîte de tomates concassées</li>
          <li>2 gousses d'ail, hachées</li>
          <li>Épices : 1 c.à.c de cumin, 1 c.à.c de coriandre moulue, 1/2 c.à.c de curcuma</li>
          <li>Une poignée d'olives, coriandre fraîche, quartiers de citron pour servir</li>
        </ul>
        <h4 class="font-bold mt-4 mb-2">Préparation :</h4>
        <ol class="list-decimal list-inside my-2 space-y-1">
          <li>Dans une sauteuse ou un plat à tagine, faites revenir l'oignon dans un filet d'huile d'olive.</li>
          <li>Ajoutez l'ail, le poivron et les épices. Faites cuire 5 minutes.</li>
          <li>Ajoutez la courgette et les tomates concassées. Laissez mijoter 15 minutes.</li>
          <li>Salez et poivrez le poisson, puis déposez-le délicatement sur les légumes.</li>
          <li>Couvrez et laissez cuire 10-15 minutes, jusqu'à ce que le poisson soit opaque et se détache facilement.</li>
          <li>Garnissez d'olives et de coriandre fraîche. Servez avec des quartiers de citron.</li>
        </ol>
      `
    }
  ]
};
