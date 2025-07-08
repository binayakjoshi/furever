export type Vaccination = {
  id?: number;
  name: string;
  vaccDate: string;
  nextVaccDate: string;
};
export type Pet = {
  _id: string;
  image: { url: string };
  name: string;
  dob: string;
  petType?: string;
  breed: string;
  vaccinations: Vaccination[];
  description: string;
  user?: {
    _id: string;
  };
  diseases: string[];
};
export type AdoptionPet = {
  _id: string;
  name: string;
  description: string;
  breed: string;
  petType: string;
  image: {
    url: string;
  };
  creator: {
    _id: string;
  };
  location: string;
  contactInfo: string;
  requirements: string;
};
