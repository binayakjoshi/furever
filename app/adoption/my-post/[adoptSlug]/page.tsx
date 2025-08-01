import { cookies } from "next/headers";
import PetOwnerList from "@/components/pet-owner/pet-owner-list";
import styles from "./page.module.css";
type InterestedUser = {
  user: {
    profileImage?: {
      url: string;
      publicId: string;
    };
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  dateExpressed: string;
};

type InterestedUserPageProps = {
  params: Promise<{ adoptSlug: string }>;
};

const InterestedUser = async ({ params }: InterestedUserPageProps) => {
  const cookieHeader = (await cookies()).toString();
  const { adoptSlug } = await params;
  let interestedUsers: InterestedUser[] = [];
  let petName = "";

  try {
    const url = `${process.env.NEXT_ROUTE_URL}/api/adoption/my/${adoptSlug}`;
    const res = await fetch(url, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      //
      console.log(res);
    }

    const data = await res.json();

    if (data.success && data.data) {
      petName = data.data.petName || "";
      interestedUsers = data.data.interestedUsers || [];
    }
  } catch (error) {
    console.error("Error fetching interested users:", error);
    throw new Error(
      "Could not get the user list for some reason. Please try again later"
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Interested Users for <span className={styles.petName}>{petName}</span>
        </h1>
      </div>
      <div className={styles.content}>
        <PetOwnerList interestedUsers={interestedUsers} />
      </div>
    </div>
  );
};

export default InterestedUser;
