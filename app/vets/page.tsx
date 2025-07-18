import { Vet } from "@/lib/types";
import { cookies } from "next/headers";
import { VetList } from "@/components/vets/vet-list";
import styles from "./page.module.css";

const VetListPage = async () => {
  let vets: Vet[];
  const cookieHeader = (await cookies()).toString();
  try {
    const res = await fetch(`${process.env.NEXT_ROUTE_URL}/api/vets`, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });
    vets = await res.json();
  } catch (error) {
    console.log(error);
    throw new Error(
      "Error occured while fetching vet List, Please try again later"
    );
  }
  return (
    <>
      <h2 className={styles.pageTitle}>Vet List</h2>
      <div className={styles.pageContent}>
        <VetList vets={vets} />
      </div>
    </>
  );
};
export default VetListPage;
