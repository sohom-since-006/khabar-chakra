import { IconName } from '@/components/ui/KhabarIcon';

export type WasteStream =
  | 'compost'
  | 'animal_feed'
  | 'dry_recyclables'
  | 'municipal_wet'
  | 'landfill';

export interface WasteCategoryGuide {
  stream: WasteStream;
  title: string;
  bengaliTitle: string;
  badgeColor: string;
  iconName: IconName;
  description: string;
  permittedItems: string[];
  prohibitedItems: string[];
  handlingInstruction: string;
}

export interface LocalDropOffPoint {
  id: string;
  name: string;
  address: string;
  city: string;
  acceptedStreams: WasteStream[];
  operatingHours: string;
  contactNotes: string;
}

export const WASTE_TAXONOMY: WasteCategoryGuide[] = [
  {
    stream: 'compost',
    title: '1. Home / Community Compost',
    bengaliTitle: 'গৃহস্থালি জৈব সার',
    badgeColor: 'var(--kc-basil)',
    iconName: 'recycle',
    description: 'Raw kitchen vegetable trimmings, peels, and fruit cores suitable for aerobic soil decomposition.',
    permittedItems: [
      'Raw vegetable peels & trimmings',
      'Fruit peels, seeds & cores',
      'Tea leaves & coffee grounds',
      'Eggshells (crushed)',
      'Dry leaves & sawdust',
    ],
    prohibitedItems: [
      'Cooked oily curries or gravies',
      'Dairy, milk or cheese scraps',
      'Plastic stickers & rubber bands',
      'Diseased garden plants',
    ],
    handlingInstruction: 'Maintain balanced green (nitrogen) and brown (carbon) materials. Turn pile weekly.',
  },
  {
    stream: 'animal_feed',
    title: '2. Clean Feed & Gaushala',
    bengaliTitle: 'পশু খাদ্য ও গোশালা',
    badgeColor: 'var(--kc-mango)',
    iconName: 'consume',
    description: 'Clean, unseasoned surplus grains, chapati, and safe vegetables for community cattle or gaushalas.',
    permittedItems: [
      'Unsalted boiled rice or plain dal',
      'Dry rotis and plain bread',
      'Clean cabbage, cauliflower & spinach leaves',
      'Fresh fruit peels (watermelon, banana)',
    ],
    prohibitedItems: [
      'Spicy, salty, or fried food',
      'Onions, garlic, or potato sprouts (toxic to cattle)',
      'Spoiled or mouldy grains',
      'Meat or fish scraps',
    ],
    handlingInstruction: 'Ensure food is completely free of mould, plastic packaging, and spicy gravies before delivery.',
  },
  {
    stream: 'dry_recyclables',
    title: '3. Clean Dry Recyclables',
    bengaliTitle: 'শুকনো পুনর্ব্যবহারযোগ্য আবর্জনা',
    badgeColor: 'var(--kc-blueberry)',
    iconName: 'reuse',
    description: 'Rinsed food packaging, paper bags, tin cans, glass jars, and rigid food containers.',
    permittedItems: [
      'Rinsed tin cans & aluminium foil (clean)',
      'Cardboard food cartons (oil-free)',
      'Clean glass jars & beverage bottles',
      'Rigid plastic tubs (PET/HDPE)',
    ],
    prohibitedItems: [
      'Greasy, unwashed pizza boxes',
      'Multi-layer plastic pouches (chips packets)',
      'Plastic carry bags under 120 microns',
      'Broken glass shards without wrapping',
    ],
    handlingInstruction: 'Rinse with leftover dishwater to prevent odour and dry before placing in the blue recycling bin.',
  },
  {
    stream: 'municipal_wet',
    title: '4. Municipal Organic Wet Waste',
    bengaliTitle: 'পৌরসভার পচনশীল বর্জ্য',
    badgeColor: 'var(--kc-moss)',
    iconName: 'dispose',
    description: 'Mixed cooked food leftovers, curries, and gravies that cannot be composted or fed to animals.',
    permittedItems: [
      'Cooked leftover curries & gravies',
      'Spoiled dairy products & paneer',
      'Used cooking oils (soaked in sawdust/paper)',
      'Plate scrapings',
    ],
    prohibitedItems: [
      'Plastic bags or wrappers',
      'Dry recyclable bottles',
      'Sanitary or hazardous waste',
    ],
    handlingInstruction: 'Drain excess liquids before handing over to municipal green garbage vans.',
  },
  {
    stream: 'landfill',
    title: '5. Non-Recyclable Landfill (Last Resort)',
    bengaliTitle: 'অ-পুনর্ব্যবহারযোগ্য বর্জ্য',
    badgeColor: 'var(--kc-charcoal)',
    iconName: 'locked',
    description: 'Contaminated multi-layer plastic packaging and laminated wrappers with zero recovery value.',
    permittedItems: [
      'Multi-layered metallised plastic snack wrappers',
      'Soiled cling wrap and plastic cellophane',
      'Contaminated wax paper and plastic cutlery',
    ],
    prohibitedItems: [
      'Organic food leftovers',
      'Clean recyclable paper or cardboard',
      'Electronic or chemical waste',
    ],
    handlingInstruction: 'Minimize this stream through mindful bulk shopping and reusable containers.',
  },
];

export const ASANSOL_DROP_OFF_HUBS: LocalDropOffPoint[] = [
  {
    id: 'hub-asansol-01',
    name: 'Asansol Municipal Green Waste Compost Yard',
    address: 'Near Old Station Road, Ward 24',
    city: 'Asansol',
    acceptedStreams: ['compost', 'municipal_wet'],
    operatingHours: '07:00 AM – 01:00 PM (Mon–Sat)',
    contactNotes: 'Municipal bio-methanation and decentralized aerobic windrow compost facility.',
  },
  {
    id: 'hub-asansol-02',
    name: 'Burnpur Gaushala & Animal Welfare Care',
    address: 'Riverside Road, Burnpur',
    city: 'Asansol',
    acceptedStreams: ['animal_feed'],
    operatingHours: '08:00 AM – 05:00 PM Daily',
    contactNotes: 'Accepts clean rotis, boiled rice, and fresh vegetable trimmings without onion/garlic/chilli.',
  },
  {
    id: 'hub-asansol-03',
    name: 'Kalyanpur Dry Resource Recovery Centre',
    address: 'Kalyanpur Housing Sector 1 Gate',
    city: 'Asansol',
    acceptedStreams: ['dry_recyclables'],
    operatingHours: '09:00 AM – 04:00 PM (Tue–Sun)',
    contactNotes: 'Managed in partnership with local informal waste pickers for segregated paper, plastics, and tin.',
  },
];

export function classifyWasteItem(query: string): WasteCategoryGuide {
  const q = query.toLowerCase().trim();

  if (
    q.includes('peel') ||
    q.includes('fruit') ||
    q.includes('vegetable') ||
    q.includes('tea') ||
    q.includes('coffee') ||
    q.includes('eggshell')
  ) {
    return WASTE_TAXONOMY[0]; // compost
  }

  if (
    q.includes('roti') ||
    q.includes('chapati') ||
    q.includes('bread') ||
    q.includes('rice') ||
    q.includes('cabbage')
  ) {
    return WASTE_TAXONOMY[1]; // animal_feed
  }

  if (
    q.includes('can') ||
    q.includes('tin') ||
    q.includes('box') ||
    q.includes('carton') ||
    q.includes('bottle') ||
    q.includes('glass') ||
    q.includes('jar')
  ) {
    return WASTE_TAXONOMY[2]; // dry_recyclables
  }

  if (
    q.includes('curry') ||
    q.includes('gravy') ||
    q.includes('dal') ||
    q.includes('cooked') ||
    q.includes('plate')
  ) {
    return WASTE_TAXONOMY[3]; // municipal_wet
  }

  return WASTE_TAXONOMY[4]; // landfill
}
