import { type Pet } from "@/lib/types";
import PetItem from "./pet-item";
import styles from "./pet-list.module.css";

type PetListProps = {
  pets: Pet[];
};

const PetList = ({ pets }: PetListProps) => {
  if (!pets || pets.length === 0) {
    return (
      <div className={styles.empty}>
        <h2>No pets found. Maybe add one?</h2>
      </div>
    );
  }

  return (
    <ul className={styles.list}>
      {pets.map((pet) => {
        return (
          <PetItem
            key={pet._id}
            _id={pet._id}
            image={pet.image}
            dob={pet.dob}
            name={pet.name}
            petType={pet.petType}
            breed={pet.breed}
            description={pet.description}
            vaccinations={pet.vaccinations}
            diseases={pet.diseases}
          />
        );
      })}
    </ul>
  );
};

export default PetList;
