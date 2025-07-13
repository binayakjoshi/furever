import React from "react";
import { cookies } from "next/headers";
import { FaCalendarAlt, FaHeart, FaClock, FaStethoscope } from "react-icons/fa";
import { Pet } from "@/lib/types";
import styles from "./page.module.css";
import DashboardAction from "@/components/user/dasboard-actions";
import PetList from "@/components/pets/pet-list";

type UpcomingEvents = {
  id: string;
  type: "vaccination" | "appointment";
  eventName: string;
  petName: string;
  date: string;
};

export const Dashboard = async () => {
  const cookieHeader = (await cookies()).toString();
  let pets: Pet[];
  let userId: string;

  try {
    const res = await fetch(`${process.env.NEXT_ROUTE_URL}/api/auth/me`, {
      headers: { Cookie: cookieHeader },
    });
    const jsonData = await res.json();
    userId = jsonData.data.userId;
  } catch (error) {
    console.log(error);
    throw new Error("Error while fetching pet data plese try again,");
  }

  try {
    const url = `${process.env.NEXT_ROUTE_URL}/api/pets/user/${userId}`;
    const response = await fetch(url, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });
    const resData = await response.json();
    pets = resData.data;
  } catch (error) {
    throw new Error("Error while fetching pet data plese try again,");
  }

  const now = new Date();
  const oneMonthLater = new Date();
  oneMonthLater.setMonth(now.getMonth() + 1);

  // Generate upcoming events from pets' vaccination data
  const upcomingEvents: UpcomingEvents[] = pets
    .flatMap((pet) =>
      pet.vaccinations
        .filter((vaccination) => {
          const vaccDate = new Date(vaccination.nextVaccDate);
          return vaccDate >= now && vaccDate <= oneMonthLater;
        })
        .map((vaccination, index) => ({
          id: `${pet._id}-${vaccination.id || index}`,
          type: "vaccination" as const,
          eventName: `${vaccination.name} vaccination`,
          petName: pet.name,
          date: new Date(vaccination.nextVaccDate).toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        }))
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const upcomingVaccinations = pets
    .flatMap((pet) => pet.vaccinations)
    .filter((vac) => {
      const d = new Date(vac.nextVaccDate);
      return d >= now && d <= oneMonthLater;
    });

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Pet Dashboard</h1>
          <p className={styles.subtitle}>Manage your furry friends with ease</p>
        </header>

        <section className={styles.summaryGrid}>
          <div className={styles.cardSummary}>
            <div>
              <h3>Total Pets</h3>
              <p>{pets.length}</p>
            </div>
            <FaHeart className={styles.icon} />
          </div>

          <div className={styles.cardSummary}>
            <div>
              <h3>Upcoming Vaccinations</h3>
              <p>{upcomingVaccinations.length}</p>
            </div>
            <FaStethoscope className={styles.icon} />
          </div>

          <div className={styles.cardSummary}>
            <div>
              <h3>Vet Appointments</h3>
              <p>
                {upcomingEvents.filter((e) => e.type === "appointment").length}
              </p>
            </div>
            <FaCalendarAlt className={styles.icon} />
          </div>
        </section>

        <DashboardAction />

        <section className={styles.cardMain}>
          <div className={styles.cardHeader}>
            <FaHeart />
            <h2>My Pets</h2>
          </div>
          <PetList pets={pets} />
        </section>

        <section className={styles.cardMain}>
          <div className={styles.cardHeader}>
            <FaClock />
            <h2>Upcoming Events</h2>
          </div>
          {upcomingEvents.length > 0 ? (
            <ul className={styles.list}>
              {upcomingEvents.map((evt) => (
                <li key={evt.id} className={styles.listItem}>
                  <div>
                    <strong>{evt.eventName}</strong> for {evt.petName}
                  </div>
                  <div>{evt.date}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.noEvents}>
              No upcoming events in the next month
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
