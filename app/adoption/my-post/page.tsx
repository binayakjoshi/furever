import { cookies } from "next/headers";
import { AdoptionList } from "@/components/pets/adoption-list";
import { AdoptionPet } from "@/lib/types";
import styles from "./page.module.css";
const ViewAdoptionList = async () => {
  const cookieHeader = (await cookies()).toString();
  let pets: AdoptionPet[];
  try {
    const url = `${process.env.NEXT_ROUTE_URL}/api/adoption/my`;
    const response = await fetch(url, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });
    const resData = await response.json();
    pets = resData.data;
  } catch (error) {
    throw new Error("Error while fetching the adoption list");
  }

  return (
    <>
      <h2 className={styles.pageTitle}>My Posts</h2>
      <div className={styles.pageContent}>
        <AdoptionList adoptionPets={pets} />
      </div>
    </>
  );
};
export default ViewAdoptionList;
