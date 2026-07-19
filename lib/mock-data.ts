export type NearbyTraveler = {
  id: string;
  firstName: string;
  nationality: string;
  flag: string;
  area: string;
  sharedInterests: string[];
  age?: number;
  bio: string;
  photo: string;
};

export type Place = {
  id: string;
  name: string;
  category: string;
  description: string;
  photo: string;
};

export const NEARBY_TRAVELERS: NearbyTraveler[] = [
  {
    id: "1",
    firstName: "Sophie",
    nationality: "France",
    flag: "🇫🇷",
    area: "Near Gothic Quarter",
    sharedInterests: ["Coffee", "Museums", "Photography"],
    age: 27,
    bio: "In Barcelona for two weeks. Always looking for the best cortado and a quiet gallery.",
    photo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop",
  },
  {
    id: "2",
    firstName: "Marco",
    nationality: "Italy",
    flag: "🇮🇹",
    area: "Near El Born",
    sharedInterests: ["Food", "Nightlife", "Culture"],
    age: 31,
    bio: "Local food guide energy. Happy to share hidden tapas spots.",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
  },
  {
    id: "3",
    firstName: "Aya",
    nationality: "Japan",
    flag: "🇯🇵",
    area: "Near Gràcia",
    sharedInterests: ["Hiking", "Wellness", "Photography"],
    age: 24,
    bio: "Digital nomad. Sunrise hikes and calm cafés preferred.",
    photo:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop",
  },
  {
    id: "4",
    firstName: "Leo",
    nationality: "Brazil",
    flag: "🇧🇷",
    area: "Near Barceloneta",
    sharedInterests: ["Beaches", "Sports", "Music"],
    age: 29,
    bio: "Beach volleyball in the morning, live music at night.",
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop",
  },
];

export const PLACES: Place[] = [
  {
    id: "p1",
    name: "El Nacional",
    category: "Restaurants",
    description: "Great place to meet digital nomads.",
    photo:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
  },
  {
    id: "p2",
    name: "Satan's Coffee Corner",
    category: "Coffee Shops",
    description: "Serious coffee, small space, perfect for a quick chat.",
    photo:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop",
  },
  {
    id: "p3",
    name: "Bunkers del Carmel",
    category: "Viewpoints",
    description: "Beautiful sunset viewpoint.",
    photo:
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&h=400&fit=crop",
  },
  {
    id: "p4",
    name: "Parc de la Ciutadella",
    category: "Parks",
    description: "Local favorite for afternoon walks and picnics.",
    photo:
      "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&h=400&fit=crop",
  },
];

export const SAFETY_TIP = {
  title: "Stay safe tonight",
  body: "Avoid Las Ramblas after midnight. Keep bags zipped in crowded areas. Emergency: 112.",
};
