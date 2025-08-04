import { type LostPet } from "@/lib/types";
import Button from "../custom-elements/button";
import LostPetItem from "./lost-pet-item";
import styles from "./lost-pet-list.module.css";

type LostPetListProps = {
  lostPets: LostPet[];
};

export const LostPetList = ({ lostPets }: LostPetListProps) => {
  if (!lostPets || lostPets.length === 0) {
    return (
      <div className={styles.emptyList}>
        <h2>No one has posted for any lost pet.</h2>
        <Button href="/lost-found/add">Post</Button>
      </div>
    );
  }

  return (
    <ul className={styles.adoptionList}>
      {lostPets.map((pet) => (
        <LostPetItem key={pet._id} pet={pet} />
      ))}
    </ul>
  );
};
