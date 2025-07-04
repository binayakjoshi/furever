export type vaccination = {
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
  vaccinations: vaccination[];
  description: string;
  user?: {
    _id: string;
  };
  diseases: string[];
};
