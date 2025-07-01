import { cookies } from "next/headers";
import PetList from "@/components/pets/pet-list";
import styles from "./page.module.css";

type YourPetPageProps = {
  params: Promise<{ slug?: string }>;
};

const YourPetPage = async ({ params }: YourPetPageProps) => {
  const { slug } = await params;
  const cookieHeader = (await cookies()).toString();
  let pets = [];
  try {
    const response = await fetch(
      `${process.env.NEXT_ROUTE_URL}/api/pets/user/${slug}`,
      {
        headers: {
          Cookie: cookieHeader,
        },
        cache: "no-store",
      }
    );
    if (!response.ok) {
      throw new Error(
        "Failed to fetch pets for some reason plese try again later"
      );
    }
    pets = await response.json();
  } catch (error) {
    console.log("Error:", error);
    throw new Error(
      "Cannot get the pet list for the given id. Please check the link and try again."
    );
  }

  return (
    <div>
      <h1 className={styles.pageTitle}>Your Pets</h1>
      <div className={styles.listContainer}>
        <PetList pets={pets.data} />
      </div>
    </div>
  );
};

export default YourPetPage;
