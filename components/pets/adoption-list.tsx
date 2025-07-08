import { type AdoptionPet } from "./pet-type";
import Button from "../custom-elements/button";
import AdoptionItem from "./adoption-item";
import styles from "./adoption-list.module.css";

type AdoptionListProps = {
  adoptionPets: AdoptionPet[];
};

export const AdoptionList = ({ adoptionPets }: AdoptionListProps) => {
  if (!adoptionPets || adoptionPets.length === 0) {
    return (
      <div className={styles.emptyList}>
        <h2>No one has posted for adoption.</h2>
        <Button href="/pets/addpet">Post</Button>
      </div>
    );
  }

  return (
    <ul className={styles.adoptionList}>
      {adoptionPets.map((pet) => (
        <AdoptionItem key={pet._id} pet={pet} />
      ))}
    </ul>
  );
};
