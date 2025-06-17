import { type Pet } from "./pet-type";
import Button from "../CustomElements/button";
import PetItem from "./pet-item";
import styles from "./pet-list.module.css";

type PetListProps = {
  pets: Pet[];
};

const PetList = ({ pets }: PetListProps) => {
  if (pets.length === 0) {
    return (
      <div className={styles.empty}>
        <h2>No pets found. Maybe add one?</h2>
        <Button href="/">Add</Button>
      </div>
    );
  }

  return (
    <ul className={styles.list}>
      {pets.map((pet) => {
        return (
          <PetItem
            key={pet.id}
            id={pet.id}
            image={pet.image}
            name={pet.name}
            age={pet.age}
            petType={pet.petType}
            breed={pet.breed}
            lastVaccination={pet.lastVaccination}
            upcomingVaccination={pet.upcomingVaccination}
            description={pet.description}
          />
        );
      })}
    </ul>
  );
};

export default PetList;
