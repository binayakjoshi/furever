import React from "react";
import { cookies } from "next/headers";
import {
  FaCalendarAlt,
  FaHeart,
  FaClock,
  FaStethoscope,
  FaUsers,
} from "react-icons/fa";
import { Pet, PetOwner, Vet } from "@/lib/types";
import styles from "./page.module.css";
import DashboardAction from "@/components/pet-owner/dasboard-actions";
import PetList from "@/components/pets/pet-list";
import PetOwnerList from "@/components/pet-owner/pet-owner-list";

type UpcomingEvents = {
  id: string;
  type: "vaccination" | "appointment";
  eventName: string;
  petName: string;
  date: string;
};

export const Dashboard = async () => {
  const cookieHeader = (await cookies()).toString();
  let user: Vet | PetOwner;

  try {
    const res = await fetch(`${process.env.NEXT_ROUTE_URL}/api/auth/me`, {
      headers: { Cookie: cookieHeader },
    });
    const jsonData = await res.json();
    user = jsonData.data;
  } catch (error) {
    console.log(error);
    throw new Error("Error while fetching user data, please try again.");
  }

  if (user.role === "pet-owner") {
    let pets: Pet[];
    try {
      const url = `${process.env.NEXT_ROUTE_URL}/api/pets/pet-owner/${user.userId}`;
      const response = await fetch(url, {
        headers: {
          Cookie: cookieHeader,
        },
        cache: "no-store",
      });
      const resData = await response.json();
      pets = resData.data;
    } catch (error) {
      throw new Error("Error while fetching pet data, please try again.");
    }

    const now = new Date();
    const oneMonthLater = new Date();
    oneMonthLater.setMonth(now.getMonth() + 1);

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
            date: new Date(vaccination.nextVaccDate).toLocaleDateString(
              "en-US",
              {
                day: "numeric",
                month: "long",
                year: "numeric",
              }
            ),
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
            <p className={styles.subtitle}>
              Manage your furry friends with ease
            </p>
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
                  {
                    upcomingEvents.filter((e) => e.type === "appointment")
                      .length
                  }
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
                    <div className={styles.eventDate}>{evt.date}</div>
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
  } else if (user.role === "vet") {
    // Vet Dashboard
    let interestedUsers: Array<{
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
    }>;

    try {
      const url = `${process.env.NEXT_ROUTE_URL}/api/vets/${user.userId}/interested`;
      const response = await fetch(url, {
        headers: {
          Cookie: cookieHeader,
        },
        cache: "no-store",
      });
      const resData = await response.json();
      interestedUsers = resData.data || [];
    } catch (error) {
      console.log("Error fetching interested pet owners:", error);
      interestedUsers = [];
    }

    return (
      <div className={styles.dashboard}>
        <div className={styles.container}>
          <header className={styles.header}>
            <h1 className={styles.title}>Veterinary Dashboard</h1>
            <p className={styles.subtitle}>
              Manage your practice and connect with pet owners
            </p>
          </header>

          <section className={styles.summaryGrid}>
            <div className={styles.cardSummary}>
              <div>
                <h3>Interested Pet Owners</h3>
                <p>{interestedUsers.length}</p>
              </div>
              <FaUsers className={styles.icon} />
            </div>

            <div className={styles.cardSummary}>
              <div>
                <h3>Appointments</h3>
                <p>0</p>
              </div>
              <FaCalendarAlt className={styles.icon} />
            </div>

            <div className={styles.cardSummary}>
              <div>
                <h3>Active Patients</h3>
                <p>0</p>
              </div>
              <FaStethoscope className={styles.icon} />
            </div>
          </section>

          <section className={styles.cardMain}>
            <div className={styles.cardHeader}>
              <FaUsers />
              <h2>Interested Pet Owners</h2>
            </div>
            <PetOwnerList interestedUsers={interestedUsers} />
          </section>
        </div>
      </div>
    );
  }

  // Fallback for unknown roles
  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Welcome to your dashboard</p>
        </header>
        <p>Unknown user role. Please contact support.</p>
      </div>
    </div>
  );
};

export default Dashboard;
