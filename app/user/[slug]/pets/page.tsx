import { cookies } from "next/headers";
import PetList from "@/Components/Pets/pet-list";

type YourPetPageProps = {
  params: Promise<{ slug?: string }>;
};

const YourPetPage = async ({ params }: YourPetPageProps) => {
  const { slug } = await params;
  const cookieHeader = (await cookies()).toString();
  let pets = [];
  try {
    const response = await fetch(
      `http://localhost:3000/api/pets/user/${slug}`,
      {
        headers: {
          Cookie: cookieHeader,
        },
        cache: "no-store",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch pets");
    }
    pets = await response.json();
  } catch (error) {
    console.log("Error:", error);
    throw new Error("Cannot get the pet list");
  }

  return (
    <div style={{ padding: "16px" }}>
      <h1>Your Pets</h1>
      <PetList pets={pets.data} />
    </div>
  );
};

export default YourPetPage;
