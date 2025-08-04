import { cookies } from "next/headers";
import { LostPetList } from "@/components/lost-found/lost-pet-list";
import { LostPet } from "@/lib/types";
import styles from "./page.module.css";

const ViewLostPetList = async () => {
  const cookieHeader = (await cookies()).toString();
  let pets: LostPet[];
  try {
    const url = `${process.env.NEXT_ROUTE_URL}/api/lost-found`;
    const response = await fetch(url, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });
    const resData = await response.json();
    pets = resData.data;
  } catch (error) {
    console.log(error);
    throw new Error("Error while fetching the adoption list");
  }
  return (
    <>
      <h2 className={styles.pageTitle}>Adoptions Posts</h2>
      <div className={styles.pageContent}>
        <LostPetList lostPets={pets} />
      </div>
    </>
  );
};
export default ViewLostPetList;
