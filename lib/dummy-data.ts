import { type Pet } from "@/Components/Pets/pet-type";

export const dummyPets: Pet[] = [
  {
    id: "1",
    image: "https://loremflickr.com/320/200/cat", // updated
    name: "Whiskers",
    age: "2 years",
    petType: "Cat",
    breed: "Tabby",
    lastVaccination: "2025-01-15",
    upcomingVaccination: "2025-07-15",
    description: "Playful tabby kitten who loves to chase yarn.",
  },
  {
    id: "2",
    image: "https://placedog.net/300/200",
    name: "Buddy",
    age: "3 years",
    petType: "Dog",
    breed: "Beagle",
    lastVaccination: "2025-02-20",
    upcomingVaccination: "2025-08-20",
    description: "Friendly beagle who enjoys long walks.",
  },
  {
    id: "3",
    image: "https://loremflickr.com/322/201/cat", // updated
    name: "Luna",
    age: "1 year",
    petType: "Cat",
    breed: "Siamese",
    lastVaccination: "2025-03-10",
    upcomingVaccination: "2025-09-10",
    description: "Curious Siamese kitten, very vocal and affectionate.",
  },
  {
    id: "4",
    image: "https://placedog.net/301/201",
    name: "Max",
    age: "4 years",
    petType: "Dog",
    breed: "Labrador",
    lastVaccination: "2025-04-05",
    upcomingVaccination: "2025-10-05",
    description: "Energetic labrador who loves to fetch balls.",
  },
];
