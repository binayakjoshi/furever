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
  creator: string;
  location: string;
  contactInfo: string;
  requirements: string;
};
export type PetOwner = {
  userId: string;
  email: string;
  name: string;
  role: string;
  phone: string;
  address: string;
  dob: string;
  createdAt: string;
  profileImage: {
    url: string;
    publicId: string;
  };
};
export type Author = {
  _id: string;
  name: string;
  role: string;
  profileImage: {
    url: string;
    publicId: string;
  };
};

export type ForumPost = {
  _id: string;
  title: string;
  content: string;
  author: Author;
  category: string;
  replies: ForumReply[];
  status: string;
  createdAt: string;
  updatedAt: string;
};
export type ForumReply = {
  _id: string;
  content: string;
  author: Author;
  post: string;
  createdAt: string;
};
