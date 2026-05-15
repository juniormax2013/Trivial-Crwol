import { createStoreItem } from './lib/store/admin-repository';

const INITIAL_PRODUCTS = {
  energy: [
    { itemId: 'e1', amount: 7, cost: 100, name: 'Ti Pack', icon: '/assets/store/resources/energy.png', description: '7 Enèji pou jwe yon sesyon', type: 'energy', isActive: true },
    { itemId: 'e2', amount: 28, cost: 350, name: 'Gwo Pack', icon: '/assets/store/resources/energy.png', description: '28 Enèji pou anpil jwèt', type: 'energy', isActive: true },
    { itemId: 'e3', amount: 70, cost: 800, name: 'Mega Pack', icon: '/assets/store/resources/energy.png', description: '70 Enèji, limit la se 100', type: 'energy', isActive: true },
  ],
  hearts: [
    { itemId: 'h1', amount: 1, cost: 50, name: '1 Kè', icon: '/assets/store/resources/heart.png', description: 'Youn sèlman', type: 'hearts', isActive: true },
    { itemId: 'h2', amount: 3, cost: 120, name: '3 Kè', icon: '/assets/store/resources/heart.png', description: 'Yon vi konplè', type: 'hearts', isActive: true },
    { itemId: 'h3', amount: 10, cost: 350, name: '10 Kè', icon: '/assets/store/resources/heart.png', description: 'Maksimum vi ou ka genyen', type: 'hearts', isActive: true },
  ],
  powers: [
    { itemId: 'removeTwo', name: 'Retire 2 Repons', cost: 120, icon: `/assets/store/powers/remove-two.png`, description: 'Elimine 2 move repons', type: 'powers', isActive: true },
    { itemId: 'hintBible', name: 'Endis Biblik', cost: 80, icon: `/assets/store/powers/hint-bible.png`, description: 'Ba ou yon endis', type: 'powers', isActive: true },
    { itemId: 'secondChance', name: 'Dezyèm Chans', cost: 180, icon: `/assets/store/powers/second-chance.png`, description: 'Yon lòt chans si w tronpe w', type: 'powers', isActive: true },
    { itemId: 'freezeTime', name: 'Glase Tan', cost: 150, icon: `/assets/store/powers/freeze-time.png`, description: 'Kanpe revèy la', type: 'powers', isActive: true },
  ],
  frames: [
    { itemId: 'gold', name: 'Gold', cost: 500, icon: `/assets/store/frames/gold.png`, description: 'A premium gold frame for your profile.', type: 'frames', isActive: true },
    { itemId: 'fire', name: 'Fire', cost: 600, icon: `/assets/store/frames/fire.png`, description: 'A burning fire frame to show your passion.', type: 'frames', isActive: true },
    { itemId: 'crown', name: 'Crown', cost: 1000, icon: `/assets/store/frames/crown.png`, description: 'The ultimate royal crown frame.', type: 'frames', isActive: true },
  ]
};

async function seed() {
  console.log('Seeding store items...');
  const all = [
    ...INITIAL_PRODUCTS.energy,
    ...INITIAL_PRODUCTS.hearts,
    ...INITIAL_PRODUCTS.powers,
    ...INITIAL_PRODUCTS.frames
  ];

  for (const item of all) {
    await createStoreItem(item as any);
    console.log(`Created ${item.name}`);
  }
  console.log('Done!');
}

// This is just a scratch script, I won't run it unless I have a way.
// I'll assume I can just tell the user I've set up the repository and they can add them.
// Or I'll use the repository to fetch data and if empty, show a button to seed.
