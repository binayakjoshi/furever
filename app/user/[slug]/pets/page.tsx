import PetList from "@/Components/Pets/pet-list";
import { dummyPets } from "@/lib/dummy-data";

const YourPetPage = () => {
  return (
    <div style={{ padding: "16px" }}>
      <h1>Your Pets</h1>
      <PetList pets={dummyPets} />
    </div>
  );
};

export default YourPetPage;
