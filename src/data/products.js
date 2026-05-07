export const products = [
  {
    id: 'red-sea',
    name: 'Red Sea',
    category: 'Unisex',
    price: 1800, // 50ml
    price30ml: 1500,
    isBestSeller: true,
    image: '/red-sea.jpg',
    description: 'Red Sea is a bold and captivating fragrance that exudes charm and sophistication. The top notes of Apple, Lemon, Neroli, and Bergamot create a fresh and fruity opening, offering a vibrant and energizing start. The heart notes of Rose, Teak Wood, and Patchouli add a warm, woody floral complexity, giving the scent depth and richness. The base notes of Vanilla and Musk provide a creamy, smooth, and sensual finish, leaving a lasting impression of elegance and allure. Red Sea is the perfect fragrance for the modern, confident individual.',
    notes: {
      top: 'Apple, Lemon, Neroli, Bergamot',
      heart: 'Rose, Teak Wood, Patchouli',
      base: 'Vanilla, Musk'
    },
    specs: {
      concentration: '40% (Extrait De Parfum)',
      sillage: 'Strong',
      lasting: '10-12 hours'
    },
    ingredients: [
      { name: 'Apple Accord', percentage: '10%' },
      { name: 'Lemon Oil', percentage: '8%' },
      { name: 'Neroli Oil', percentage: '6%' },
      { name: 'Bergamot Oil', percentage: '7%' },
      { name: 'Rose Absolute', percentage: '8%' },
      { name: 'Teak Wood Accord', percentage: '7%' },
      { name: 'Patchouli Oil', percentage: '6%' },
      { name: 'Vanilla Extract', percentage: '7%' },
      { name: 'Musk Accord', percentage: '6%' }
    ]
  },
  {
    id: 'black-stone',
    name: 'Black Stone',
    category: 'Mens',
    price: 2200, // 50ml
    price30ml: 1800,
    isBestSeller: false,
    image: '/black-stone.jpg',
    description: 'Black Stone is a rich and luxurious fragrance that exudes sophistication and depth. The top notes of Woody and Agarwood provide an earthy and powerful opening, setting the tone for an unforgettable experience. The heart notes of Vanilla and Sweet create a warm and inviting core, adding a soft and creamy sweetness to the composition. The base notes of Sandalwood, Oud, and Powdery create a refined and opulent finish, with the deep richness of oud perfectly balanced by the smoothness of sandalwood. Black Stone is ideal for those who appreciate deep, exotic, and timeless scents.',
    notes: {
      top: 'Woody, Agarwood',
      heart: 'Vanilla, Sweet',
      base: 'Sandalwood, Oud, Powdery'
    },
    specs: {
      concentration: '40% (Extrait De Parfum)',
      sillage: 'Strong',
      lasting: '12-14 hours'
    },
    ingredients: [
      { name: 'Woody Accord', percentage: '12%' },
      { name: 'Agarwood (Oud) Accord', percentage: '10%' },
      { name: 'Vanilla Extract', percentage: '8%' },
      { name: 'Sweet Accord', percentage: '7%' },
      { name: 'Sandalwood Oil', percentage: '9%' },
      { name: 'Oud Accord', percentage: '7%' },
      { name: 'Powdery Accord', percentage: '7%' }
    ]
  },
  {
    id: 'white-stone',
    name: 'White Stone',
    category: 'Womens',
    price: 2000, // 50ml
    price30ml: 1700,
    isBestSeller: true,
    image: '/white-stone.jpg',
    description: 'White Stone is an exotic and luxurious fragrance that blends the freshness of citrus with the richness of oud. The top notes of Citrus, Tobacco, and Floral provide a vibrant and intriguing opening, offering a balance of freshness and depth. The middle notes of Sweet, Fruity, and Amber create a warm and inviting heart, evoking a sense of opulence. The base notes of Aromatic, Musky, and Patchouli bring a complex and grounding finish, leaving an unforgettable impression. White Stone is the ideal fragrance for those who desire sophistication and elegance with a hint of mystery.',
    notes: {
      top: 'Citrus, Tobacco, Floral',
      heart: 'Sweet, Fruity, Amber',
      base: 'Aromatic, Musky, Patchouli'
    },
    specs: {
      concentration: '40% (Extrait De Parfum)',
      sillage: 'Strong',
      lasting: '10-12 hours'
    },
    ingredients: [
      { name: 'Citrus Oil Natural', percentage: '10%' },
      { name: 'Tobacco Absolute', percentage: '8%' },
      { name: 'Floral Accord', percentage: '7%' },
      { name: 'Sweet Accord', percentage: '9%' },
      { name: 'Fruity Accord', percentage: '6%' },
      { name: 'Amber Accord', percentage: '6%' },
      { name: 'Aromatic Accord', percentage: '8%' },
      { name: 'Musk Accord', percentage: '7%' },
      { name: 'Patchouli Oil', percentage: '7%' }
    ]
  },
  {
    id: 'zephyr',
    name: 'Zephyr',
    category: 'Unisex',
    price: 2400, // 50ml
    price30ml: 2000,
    isBestSeller: false,
    image: '/zephyr.jpg',
    description: 'Zephyr is a luxurious and enchanting fragrance that captivates with its radiant complexity. The top notes of Woody, Amber, and Warm Spicy create a rich and alluring opening, exuding warmth and sophistication. The middle notes of Fresh Spicy and Metallic add a unique and contemporary twist, enhancing the fragrance\'s intriguing character. The base notes of White Floral and Animalic provide an opulent and sensual finish, leaving an unforgettable impression of elegance and allure. Zephyr is perfect for those who seek a bold yet refined signature scent.',
    notes: {
      top: 'Woody, Amber, Warm Spicy',
      heart: 'Fresh Spicy, Metallic',
      base: 'White Floral, Animalic'
    },
    specs: {
      concentration: '40% (Extrait De Parfum)',
      sillage: 'Strong',
      lasting: '12-14 hours'
    }
  },
  {
    id: 'infinity',
    name: 'Infinity',
    category: 'Womens',
    price: 1850, // 50ml
    price30ml: 1550,
    isBestSeller: true,
    image: '/infinity.jpg',
    description: 'Infinity is a charismatic and timeless fragrance that embodies elegance and modernity. The top notes of Fruity, Aromatic, and Sweet create a vibrant and captivating opening, setting a confident and alluring tone. The heart notes of Lavender, Fresh Spicy, and Woody add a sophisticated and balanced complexity, blending freshness with depth. The base notes of Vanilla, Citrus, and Fresh accords provide a smooth and invigorating finish, leaving a lasting impression of refined masculinity. Infinity is the perfect scent for those who exude understated charm and confidence.',
    notes: {
      top: 'Fruity, Aromatic, Sweet',
      heart: 'Lavender, Fresh Spicy, Woody',
      base: 'Vanilla, Citrus, Fresh'
    },
    specs: {
      concentration: '40% (Extrait De Parfum)',
      sillage: 'Moderate to Strong',
      lasting: '10-12 hours'
    }
  },
  {
    id: 'timeless',
    name: 'Timeless',
    category: 'Mens',
    price: 1850, // 50ml
    price30ml: 1550,
    isBestSeller: false,
    image: '/timeless.jpg',
    description: 'Timeless is a vibrant and daring fragrance for men. The top notes combine Citrus, Lavender, and Fresh Spicy for a refreshing and invigorating opening. The middle notes of Aromatic, Floral, and Herbal create an alluring heart with a sophisticated twist. The base notes of Woody, Earthy, Mossy, and a hint of Alcohol bring depth and character, leaving a strong and unforgettable trail. Timeless is the perfect scent for those who embrace their bold and charismatic nature.',
    notes: {
      top: 'Citrus, Lavender, Fresh Spicy',
      heart: 'Aromatic, Floral, Herbal',
      base: 'Woody, Earthy, Mossy, Alcohol'
    },
    specs: {
      concentration: '40% (Extrait De Parfum)',
      sillage: 'Strong',
      lasting: '8-10 hours'
    }
  },
  {
    id: 'forever',
    name: 'Forever',
    category: 'Unisex',
    price: 1850, // 50ml
    price30ml: 1550,
    isBestSeller: false,
    image: '/forever.jpg',
    description: 'Forever is a versatile and sophisticated fragrance designed for the modern professional. The top notes of Citrus and Fresh Spicy deliver a lively and invigorating opening, setting an energetic tone. The middle notes of Floral and Amber provide a refined, warm heart that enhances confidence and charm. The base notes of Woody, Musky, and Powdery create a smooth and elegant finish, making this scent perfect for everyday wear in any formal or casual setting. Forever is the ideal companion for those who value style and presence.',
    notes: {
      top: 'Citrus, Fresh Spicy',
      heart: 'Floral, Amber',
      base: 'Woody, Musky, Powdery'
    },
    specs: {
      concentration: '40% (Extrait De Parfum)',
      sillage: 'Moderate',
      lasting: '8-10 hours'
    }
  },
  {
    id: 'royal',
    name: 'Royal',
    category: 'Mens',
    price: 2500, // 50ml
    price30ml: 2200,
    isBestSeller: true,
    image: '/black-stone.jpg',
    description: 'Royal is a majestic and commanding fragrance that exudes power and grace. The top notes of Bergamot and Grapefruit provide a crisp and regal opening.',
    notes: {
      top: 'Bergamot, Grapefruit',
      heart: 'Cedar, Jasmine',
      base: 'Amber, Musk'
    },
    specs: {
      concentration: '40% (Extrait De Parfum)',
      sillage: 'Strong',
      lasting: '12-14 hours'
    }
  }
];
