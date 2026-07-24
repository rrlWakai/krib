import { images } from './images'
import type {
  VillaDetail,
  Experience,
  GalleryImage,
  Testimonial,
  NavLink,
  FAQCategory,
  NearbyAttraction,
  Amenity,
  VillaAvailability,
  AvailabilityStatus,
  CalendarDay,
} from '../types'

export const navLinks: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Villas', href: '/#villas' },
  { label: 'About', href: '/about' },
  { label: 'Gallery', href: '/gallery' },
]

export const villas: VillaDetail[] = [
  {
    id: 'krib-1',
    slug: 'krib-1',
    number: '01',
    name: 'KRiB 1',
    tagline: 'The Original Family Retreat',
    subtitle: 'Perfect for cozy weekends and intimate celebrations.',
    description:
      'A warm and inviting home designed for families who value quality time. KRiB 1 wraps you in comfort from the moment you step inside, with spaces that encourage connection, laughter, and slowing down.',
    story:
      'KRiB 1 was born from a simple idea — that the best weekends are spent with the people who matter most. Every corner of this home was designed to bring families closer, from the open living area where stories are shared to the private garden where memories take root.',
    image: images.krib1,
    images: [
      images.krib1Pool,
      images.krib1,
      images.krib1Living,
      images.krib1Balcony,
      images.krib1Dining,
      images.krib1MasterBed,
      images.krib1LivingAlt,
      images.krib1DiningAlt,
      images.krib1Kitchen,
      images.krib1Bed,
      images.krib1BedAlt,
      images.krib1Bed1,
      images.krib1Pool,
    ],
    capacity: 'Perfect for 8–10 guests',
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 20,
    highlights: [
      'Private swimming pool',
      'Fully equipped kitchen',
      'Cozy garden space',
      'Family-friendly layout',
      'Outdoor dining area',
    ],
    quickHighlights: [
      'Family Friendly',
      'Private Villa',
      'Perfect for Celebrations',
      'Golf Community',
    ],
    features: [
      { icon: 'pool', label: 'Private Pool' },
      { icon: 'bed', label: '3 Bedrooms' },
      { icon: 'shower', label: '2 Bathrooms' },
      { icon: 'restaurant', label: 'Full Kitchen' },
      { icon: 'outdoor_grill', label: 'BBQ Area' },
      { icon: 'local_parking', label: 'Parking for 3 Cars' },
    ],
    price: '₱25,000 / 21-hour stay',
    priceDetails: {
      perNight: '₱25,000',
      rateType: '21-hour stay',
    },
    mapLink: 'https://maps.app.goo.gl/1aYuBqXnG147AgWW6',
    amenities: [
      {
        category: 'Stay',
        items: [
          { icon: 'bed', label: 'Comfortable Beds' },
          { icon: 'ac_unit', label: 'Air-conditioned Bedrooms' },
          { icon: 'shower', label: 'Outdoor Shower' },
        ],
      },
      {
        category: 'Kitchen',
        items: [
          { icon: 'utensils', label: 'Cooking Allowed' },
          { icon: 'flame', label: 'Free LPG' },
          { icon: 'microwave', label: 'Kitchen Appliances' },
          { icon: 'cooking_pot', label: 'Complete Cookware' },
          { icon: 'droplets', label: 'Purified Drinking Water' },
        ],
      },
      {
        category: 'Entertainment',
        items: [
          { icon: 'tv', label: '60" Smart TV with Netflix' },
          { icon: 'music', label: 'Unlimited Videoke' },
          { icon: 'wifi', label: 'Unlimited WiFi' },
          { icon: 'gamepad', label: 'Board Games' },
        ],
      },
      {
        category: 'Outdoor',
        items: [
          { icon: 'pool', label: 'Private Swimming Pool' },
          { icon: 'outdoor_grill', label: 'BBQ Area' },
          { icon: 'local_parking', label: 'Parking' },
        ],
      },
    ],
    rates: [
      { label: '21-Hour Stay', amount: '₱20,000', description: 'Complete stay experience' },
      { label: 'Regular Rate', amount: '₱25,000', description: 'Standard pricing' },
      { label: 'Promotional Savings', amount: '₱5,000', description: 'You save' },
      { label: 'Capacity', amount: 'Up to 20 Guests', description: 'Includes all guests' },
    ],
    policies: [
      { icon: 'login', label: 'Check-in', value: '2:00 PM' },
      { icon: 'logout', label: 'Check-out', value: '11:00 AM' },
      { icon: 'people', label: 'Maximum Guests', value: 'Up to 20 guests' },
      { icon: 'smoke_free', label: 'Smoking', value: 'Outdoor areas only' },
      { icon: 'pets', label: 'Pets', value: 'Not allowed' },
      { icon: 'camera', label: 'CCTV', value: 'Active in common areas' },
      { icon: 'party', label: 'Party Policy', value: '₱5,000 party fee applies' },
      { icon: 'volume_up', label: 'Quiet Hours', value: 'After 10:00 PM' },
      { icon: 'pool', label: 'Pool Rules', value: 'No diving · Supervise children' },
    ],
  },
  {
    id: 'krib-2',
    slug: 'krib-2',
    number: '02',
    name: 'KRiB 2',
    tagline: 'The Signature Villa',
    subtitle: 'More space. More comfort. Created for unforgettable celebrations.',
    description:
      'A spacious haven where celebrations come to life. KRiB 2 offers room to gather, room to celebrate, and room to create traditions that last a lifetime. Designed for those who believe every special occasion deserves a beautiful setting.',
    story:
      'KRiB 2 was created for the moments that matter most — birthdays, reunions, and milestones that deserve to be celebrated in style. With expansive indoor and outdoor spaces, it was designed to host life\'s biggest celebrations while still offering quiet corners for intimate conversations.',
    image: images.krib2Exterior,
    images: [
      images.krib2Exterior,
      images.krib2Pool,
      images.krib2Living,
      images.krib2Dining,
      images.krib2Balcony,
      images.krib2Kitchen,
      images.krib2KitchenAlt,
      images.krib2Gal,
      images.krib2Gal2,
      images.krib2Gal3,
      images.krib2Gal4,
      images.krib2Bed1,
      images.krib2Bed2,
      images.krib2Bed3,
      images.krib2Bath,
      images.krib2Bath2,
      images.krib2Shower,
      images.krib2Toil,
      images.krib2Toil2,
      images.krib2Toil3,
      images.krib2Toil4,
      images.krib2Toil5,
    ],
    capacity: 'Sleeps up to 30 guests',
    bedrooms: 3,
    bathrooms: 3,
    maxGuests: 30,
    highlights: [
      'Large private pool',
      'Spacious living area',
      'Modern kitchen',
      'Entertainment room',
      'Expansive garden',
    ],
    quickHighlights: [
      'Family Friendly',
      'Private Villa',
      'Perfect for Celebrations',
      'Golf Community',
    ],
    features: [
      { icon: 'pool', label: 'Large Private Pool' },
      { icon: 'bed', label: '3 Bedrooms' },
      { icon: 'shower', label: '3 Bathrooms' },
      { icon: 'restaurant', label: 'Modern Kitchen' },
      { icon: 'outdoor_grill', label: 'BBQ Pavilion' },
      { icon: 'local_parking', label: 'Parking for 5 Cars' },
      { icon: 'wine_bar', label: 'Entertainment Room' },
      { icon: 'wifi', label: 'High-Speed WiFi' },
    ],
    price: '₱30,000 / 21-hour stay',
    priceDetails: {
      perNight: '₱30,000',
      rateType: '21-hour stay',
    },
    mapLink: 'https://www.google.com/maps/search/?api=1&query=KRiB%202+Beverley+Place+Yorkshire+San+Fernando+Pampanga',
    mapEmbed:
      'https://www.google.com/maps?q=3M8R+XWR+Beverley+Place+Yorkshire+San+Fernando+Pampanga&output=embed',
    amenities: [
      {
        category: 'Stay',
        items: [
          { icon: 'bed', label: 'Comfortable Beds' },
          { icon: 'ac_unit', label: 'Air-conditioned Bedrooms' },
          { icon: 'shower', label: 'Outdoor Shower' },
        ],
      },
      {
        category: 'Kitchen',
        items: [
          { icon: 'utensils', label: 'Cooking Allowed' },
          { icon: 'flame', label: 'Free LPG' },
          { icon: 'microwave', label: 'Kitchen Appliances' },
          { icon: 'cooking_pot', label: 'Complete Cookware' },
          { icon: 'droplets', label: 'Purified Drinking Water' },
        ],
      },
      {
        category: 'Entertainment',
        items: [
          { icon: 'tv', label: '60" Smart TV with Netflix' },
          { icon: 'music', label: 'Unlimited Videoke' },
          { icon: 'wifi', label: 'Unlimited WiFi' },
          { icon: 'gamepad', label: 'Board Games' },
        ],
      },
      {
        category: 'Outdoor',
        items: [
          { icon: 'pool', label: 'Private Swimming Pool' },
          { icon: 'outdoor_grill', label: 'BBQ Area' },
          { icon: 'local_parking', label: 'Parking' },
        ],
      },
    ],
    rates: [
      { label: '21-Hour Stay', amount: '₱25,000', description: 'Complete stay experience' },
      { label: 'Regular Rate', amount: '₱30,000', description: 'Standard pricing' },
      { label: 'Promotional Savings', amount: '₱5,000', description: 'You save' },
      { label: 'Capacity', amount: 'Up to 30 Guests', description: 'Includes all guests' },
    ],
    policies: [
      { icon: 'login', label: 'Check-in', value: '2:00 PM' },
      { icon: 'logout', label: 'Check-out', value: '11:00 AM' },
      { icon: 'people', label: 'Maximum Guests', value: 'Up to 30 guests' },
      { icon: 'smoke_free', label: 'Smoking', value: 'Outdoor areas only' },
      { icon: 'camera', label: 'CCTV', value: 'Active in common areas' },
      { icon: 'party', label: 'Party Policy', value: '₱5,000 party fee applies' },
      { icon: 'volume_up', label: 'Quiet Hours', value: 'After 10:00 PM' },
      { icon: 'pool', label: 'Pool Rules', value: 'No diving · Supervise children' },
    ],
  },
]

export const experiences: Experience[] = [
  {
    id: 'morning-pool',
    title: 'Morning coffee beside the pool',
    description:
      'Wake up to the sound of birds and the gentle light filtering through the trees. Your first cup of coffee tastes better when the day has nowhere to rush.',
    image: images.morningCoffee,
  },
  {
    id: 'birthday',
    title: 'Birthday celebrations',
    description:
      'There is something special about celebrating another year surrounded by the people who matter most. Every birthday deserves a beautiful backdrop.',
    image: images.familyBbq,
  },
  {
    id: 'weekend-bbq',
    title: 'Weekend barbecue with family',
    description:
      'The smell of grilled food, the sound of laughter, and the feeling of the sun on your skin. These are the weekends that become cherished memories.',
    image: images.sunsetGatherings,
  },
  {
    id: 'pool-days',
    title: 'Swimming under the afternoon sun',
    description:
      'Afternoons at KRiB are made for floating, laughing, and watching the kids splash while the adults unwind with cold drinks and good conversation.',
    image: images.morningCoffee,
  },
  {
    id: 'quiet-evenings',
    title: 'Quiet evenings with loved ones',
    description:
      'As the sun sets, the villa transforms. Gather around, share stories, and enjoy the simple pleasure of being together without distraction.',
    image: images.sunsetGatherings,
  },
]

export const amenities: Amenity[] = [
  {
    icon: 'pool',
    label: 'Swimming Pool',
    description: 'Private pool for your exclusive use',
  },
  {
    icon: 'restaurant',
    label: 'Full Kitchen',
    description: 'Modern appliances and cookware',
  },
  {
    icon: 'bed',
    label: 'Comfortable Bedrooms',
    description: 'Premium bedding and air conditioning',
  },
  {
    icon: 'shower',
    label: 'Modern Bathrooms',
    description: 'Hot and cold shower with toiletries',
  },
  {
    icon: 'outdoor_grill',
    label: 'BBQ Area',
    description: 'Outdoor grill and dining setup',
  },
  {
    icon: 'wifi',
    label: 'High-Speed WiFi',
    description: 'Stay connected during your stay',
  },
  {
    icon: 'local_parking',
    label: 'Secure Parking',
    description: 'Ample parking for multiple vehicles',
  },
  {
    icon: 'tv',
    label: 'Entertainment',
    description: 'Smart TV with streaming',
  },
]

export const galleryImages: GalleryImage[] = [
  {
    id: 'pool-aerial',
    src: images.krib2Pool,
    alt: 'Private pool at KRiB Beverly Place',
    colSpan: 'col-span-12 md:col-span-4',
    rowSpan: 'row-span-1',
    delay: 0,
  },
  {
    id: 'living-room',
    src: images.krib2Living,
    alt: 'Spacious living room with natural light at KRiB villa',
    colSpan: 'col-span-12 md:col-span-3',
    rowSpan: 'row-span-2',
    delay: 200,
  },
  {
    id: 'breakfast',
    src: images.krib2Dining,
    alt: 'Dining area at KRiB family villa',
    colSpan: 'col-span-12 md:col-span-5',
    rowSpan: 'row-span-1',
    delay: 300,
  },
  {
    id: 'bedroom',
    src: images.krib2Bed1,
    alt: 'Bedroom interior at KRiB Beverly Place',
    colSpan: 'col-span-12 md:col-span-4',
    rowSpan: 'row-span-1',
    delay: 400,
  },
  {
    id: 'garden',
    src: images.krib2Exterior,
    alt: 'Exterior view at KRiB Signature Villa',
    colSpan: 'col-span-12 md:col-span-5',
    rowSpan: 'row-span-1',
    delay: 500,
  },
]

export const testimonials: Testimonial[] = [
  {
    id: '1',
    quote:
      'We celebrated my mother\'s birthday at KRiB 1 and it was the most relaxing weekend we\'ve had as a family. The kids didn\'t want to leave the pool, and the adults loved the quiet evenings on the terrace.',
    author: 'Maria C.',
    location: 'Manila',
    rating: 5,
    date: 'March 2025',
  },
  {
    id: '2',
    quote:
      'KRiB 2 was perfect for our company team building. Enough space for everyone, beautiful surroundings, and the pool was a hit. We\'re already planning the next one.',
    author: 'Carlos R.',
    location: 'Angeles City',
    rating: 5,
    date: 'February 2025',
  },
  {
    id: '3',
    quote:
      'The best family vacation we\'ve had in years. The villa felt like home the moment we walked in. Every detail was thought of. We will definitely be coming back.',
    author: 'Ana S.',
    location: 'Quezon City',
    rating: 5,
    date: 'January 2025',
  },
]

export const faqCategories: FAQCategory[] = [
  {
    id: 'booking',
    category: 'Booking',
    items: [
      {
        id: 'reserve',
        question: 'How do I reserve a stay at KRiB Beverly Place?',
        answer:
          'Simply choose your preferred villa, select your dates, and send us a reservation inquiry. We will confirm availability and guide you through the booking process. You can also reach us directly on Facebook or Instagram for a faster response.',
      },
      {
        id: 'both-villas',
        question: 'Can I book both villas for one event?',
        answer:
          'Yes. If you are planning a larger celebration or family gathering, you can reserve both KRiB 1 and KRiB 2 together. Please coordinate with us in advance so we can ensure both properties are prepared for your group.',
      },
      {
        id: 'advance-booking',
        question: 'How far in advance should I book?',
        answer:
          'We recommend booking at least two weeks in advance, especially for weekend stays and holidays. For larger events and peak seasons, booking a month ahead gives you the best selection of available dates.',
      },
    ],
  },
  {
    id: 'stay',
    category: 'Stay',
    items: [
      {
        id: 'duration',
        question: 'How long is the stay?',
        answer:
          'Each reservation is a 21-hour stay, giving you a full day to enjoy the villa from check-in at 2:00 PM until check-out at 11:00 AM the following day. Extended stays can be arranged upon request.',
      },
      {
        id: 'check-in-out',
        question: 'What are the check-in and check-out times?',
        answer:
          'Check-in is at 2:00 PM and check-out is at 11:00 AM. Early check-in and late check-out may be arranged in advance, subject to availability on your booking date.',
      },
      {
        id: 'guest-capacity',
        question: 'How many guests can each villa accommodate?',
        answer:
          'KRiB 1 comfortably accommodates up to 20 guests with 3 bedrooms and 2 bathrooms. KRiB 2 can accommodate up to 30 guests with 3 bedrooms and 3 bathrooms. The maximum capacity applies to all guests, including visitors.',
      },
    ],
  },
  {
    id: 'amenities',
    category: 'Amenities',
    items: [
      {
        id: 'cooking',
        question: 'Is cooking allowed?',
        answer:
          'Absolutely. Both villas feature fully equipped kitchens with complete cookware, appliances, and dining essentials. You are welcome to bring your own food or have it delivered. Free LPG is provided for your cooking needs.',
      },
      {
        id: 'wifi',
        question: 'Is WiFi included?',
        answer:
          'Yes. Unlimited WiFi is available in both villas, so you can stay connected during your stay. Speeds are suitable for streaming, video calls, and remote work.',
      },
      {
        id: 'kitchen-appliances',
        question: 'Are kitchen appliances provided?',
        answer:
          'Both villas come with a refrigerator, microwave, stove, oven, rice cooker, and electric kettle. You will find everything you need to prepare meals for your group.',
      },
      {
        id: 'pool-private',
        question: 'Is the swimming pool private?',
        answer:
          'Yes. Each villa has its own private swimming pool exclusively for your group. The pool is maintained daily to ensure clean and inviting water throughout your stay.',
      },
      {
        id: 'netflix',
        question: 'Is Netflix available?',
        answer:
          'Yes. Both villas are equipped with a 60-inch Smart TV with Netflix access, so you can unwind with your favorite shows and movies during your downtime.',
      },
    ],
  },
  {
    id: 'celebrations',
    category: 'Celebrations',
    items: [
      {
        id: 'birthdays',
        question: 'Can we celebrate birthdays?',
        answer:
          'Yes, and we would love to host you. Both villas are perfect for birthday celebrations. Let us know what you have in mind so we can help make your day extra special.',
      },
      {
        id: 'reunions',
        question: 'Can we host family reunions?',
        answer:
          'Absolutely. KRiB 2 is especially well-suited for family reunions with its spacious living areas and expansive garden. The open layout encourages everyone to gather, share meals, and create lasting memories.',
      },
      {
        id: 'party-fee',
        question: 'Is there an additional party fee?',
        answer:
          'A party fee of ₱5,000 applies for events and celebrations. This covers the additional preparation and cleaning required for larger gatherings. Please let us know in advance if you are planning a celebration.',
      },
      {
        id: 'decorations',
        question: 'Can we decorate the villa?',
        answer:
          'Yes, you are welcome to decorate for your celebration. We only ask that decorations are removed before check-out and that no nails, adhesives, or permanent fixtures are used on the walls.',
      },
    ],
  },
  {
    id: 'house-rules',
    category: 'House Rules',
    items: [
      {
        id: 'pets',
        question: 'Are pets allowed?',
        answer:
          'Pets are not allowed in the villas to ensure the comfort and safety of all guests. We appreciate your understanding.',
      },
      {
        id: 'smoking',
        question: 'Is smoking permitted?',
        answer:
          'Smoking is allowed in outdoor areas only. Please use the designated smoking areas and dispose of cigarette butts properly. Smoking is strictly prohibited inside the villa.',
      },
      {
        id: 'children',
        question: 'Are children welcome?',
        answer:
          'Yes, children are absolutely welcome. Both villas are family-friendly. Please supervise children around the pool area at all times.',
      },
      {
        id: 'quiet-hours',
        question: 'Are there quiet hours?',
        answer:
          'We ask all guests to observe quiet hours after 10:00 PM to respect the peaceful residential community. Indoor conversations and low-volume music are perfectly fine.',
      },
    ],
  },
  {
    id: 'location',
    category: 'Location',
    items: [
      {
        id: 'where',
        question: 'Where is KRiB Beverly Place located?',
        answer:
          'KRiB Beverly Place is located in Beverly Place, a quiet residential community in Pampanga, approximately two hours north of Manila via NLEX. It is just 20 minutes from Clark International Airport.',
      },
      {
        id: 'parking',
        question: 'Is parking available?',
        answer:
          'Yes. KRiB 1 has parking for up to 3 cars, and KRiB 2 has parking for up to 5 cars. Both are secure and located within the property.',
      },
      {
        id: 'getting-there',
        question: 'How do we get there?',
        answer:
          'From Manila, take NLEX northbound to the Clark exit. Follow the signs to Angeles City, then take the road to Beverly Place. From Clark International Airport, it is a 20-minute drive via Clark-Tarlac Road. Detailed directions are available on our Location page.',
      },
    ],
  },
]

export const nearbyAttractions: NearbyAttraction[] = [
  {
    id: 'malls',
    name: 'SM Clark & Marquee Mall',
    description: 'Major shopping centers with retail, dining, and entertainment',
    travelTime: '15\x9620 min drive',
    icon: 'store',
  },
  {
    id: 'nlex',
    name: 'NLEX Access',
    description: 'Easy access to North Luzon Expressway, approximately 2 hours from Manila',
    travelTime: '2 hr from Manila',
    icon: 'directions_car',
  },
]

export const siteContent = {
  hero: {
    subtitle: 'BEVERLY PLACE, PAMPANGA',
    title: 'Weekends Were Made for This.',
    description:
      'Tucked away in the quiet beauty of Beverly Place, KRiB offers two private villas where families gather, celebrations come to life, and every moment feels like home.',
  },
  about: {
    label: 'OUR STORY',
    title: 'Created for the moments that matter.',
    paragraphs: [
      'KRiB Beverly Place began as a vision to create a space where families could escape the noise of daily life and reconnect with what matters most — each other.',
      'Tucked away in the peaceful hills of Pampanga, KRiB is not simply a place to sleep. It is a place to gather, to celebrate, to slow down, and to create traditions worth repeating.',
      'Every detail — from the layout of the living spaces to the placement of the pool — was designed with one thing in mind: bringing people together.',
    ],
  },
  aboutPage: {
    heroTitle: 'Our Story',
    heroDescription:
      'KRiB Beverly Place was born from a simple belief — that the best moments in life happen when we are together.',
    sections: [
      {
        title: 'The Beginning',
        paragraphs: [
          'It started with a drive through the quiet hills of Pampanga. The road curved through lush greenery, past rice fields and bamboo groves, until it opened up to a view that stopped us in our tracks. A valley cradled by mountains, where the air was cooler and the world felt miles away.',
          'That view became the foundation of KRiB Beverly Place — not just a destination, but a feeling. A place where families could gather without distraction, where celebrations could unfold naturally, and where the simple act of being together would feel extraordinary.',
        ],
      },
      {
        title: 'The Vision',
        paragraphs: [
          'We wanted to create something different from the sterile hotels and impersonal rentals that dominate the travel industry. A space that felt like a home — because that is what it is. A home we are sharing with you.',
          'Every villa was designed with intention. The layout encourages conversation. The kitchens invite shared meals. The pools are positioned to catch the afternoon sun. Nothing was placed without thought. Nothing was added without purpose.',
        ],
      },
      {
        title: 'The Experience',
        paragraphs: [
          'Today, KRiB Beverly Place welcomes families, friends, and groups who believe that the best memories are made together. Whether it is a birthday celebration, a family reunion, or simply a weekend away from the city, KRiB provides the setting for moments that last a lifetime.',
          'We are not a resort. We are not a hotel. We are a place where you can breathe, connect, and remember what matters most.',
        ],
      },
    ],
  },
  cta: {
    title: 'Your weekend is waiting.',
    description: 'Send us a message and let us help you plan the perfect stay.',
  },
  contact: {
    title: 'Let\'s plan your stay.',
    description: 'Send us a message and we will get back to you within 24 hours.',
    email: 'hello@kribbeverlyplace.com',
    phone: '+63 968-8700748',
    address: 'Beverly Place, Pampanga, Philippines',
    social: {
      facebook: 'https://www.facebook.com/KribBeverlyPlace',
      instagram: 'https://www.instagram.com/krib_at_beverlyplace?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==',
    },
  },
  location: {
    heroTitle: 'Find Us',
    heroDescription:
      'Tucked away in the quiet hills of Pampanga, KRiB Beverly Place is close enough for a spontaneous weekend escape, yet feels like a world away.',
    coordinates: '15.1\xb0 N, 120.6\xb0 E',
    address: 'Beverly Place, Pampanga, Philippines',
    directions: [
      {
        from: 'Manila',
        via: 'NLEX',
        travelTime: '~2 hours',
        description:
          'Take NLEX northbound to the Clark exit. Follow the signs to Angeles City, then take the road to Beverly Place.',
      },
      {
        from: 'Clark International Airport',
        via: 'Clark-Tarlac Road',
        travelTime: '~20 minutes',
        description:
          'From the airport, head north on Clark-Tarlac Road. Beverly Place is a short drive from the Clark Freeport Zone.',
      },
    ],
  },
  gallery: {
    heroTitle: 'A visual journey',
    heroDescription:
      'Every corner of KRiB tells a story. Browse through our gallery and start imagining your weekend here.',
    categories: [
      { id: 'all', label: 'All' },
      { id: 'villas', label: 'Villas' },
      { id: 'pool', label: 'Pool & Outdoors' },
      { id: 'interiors', label: 'Interiors' },
      { id: 'experiences', label: 'Experiences' },
    ],
  },
}

export function generateMockAvailability(villaId: string): VillaAvailability[] {
  const now = new Date()
  const months: VillaAvailability[] = []

  for (let m = 0; m < 4; m++) {
    const year = now.getFullYear()
    const month = now.getMonth() + m
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days: CalendarDay[] = []

    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const dayOfWeek = new Date(year, month, d).getDay()

      let status: AvailabilityStatus = 'available'
      const rand = Math.random()
      if (rand < 0.2) status = 'booked'
      else if (rand < 0.35) status = 'limited'

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        if (Math.random() < 0.4) status = 'booked'
      }

      days.push({ date, status })
    }

    months.push({ villaId, year, month: month + 1, days })
  }

  return months
}
