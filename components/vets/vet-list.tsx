import { Vet } from "@/lib/types";
import VetItem from "./vet-item";
import styles from "./vet-list.module.css";

type VetListProps = {
  vets: Vet[];
};

export const VetList = ({ vets }: VetListProps) => {
  if (!vets || vets.length === 0) {
    return (
      <div className={styles.emptyList}>
        <h2>No Vets were found....</h2>
      </div>
    );
  }

  return (
    <ul className={styles.vetList}>
      {vets.map((vet) => (
        <VetItem key={vet.userId} vet={vet} />
      ))}
    </ul>
  );
};
