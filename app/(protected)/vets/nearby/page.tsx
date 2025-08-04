"use client";

import dynamic from "next/dynamic";

const VetsHospitalList = dynamic(
  () => import("@/components/vets/vet-hospital-list"),
  {
    ssr: false,
  }
);

export default function NearbyVetsPage() {
  return <VetsHospitalList />;
}
