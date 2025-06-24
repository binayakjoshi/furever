import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const Home = async () => {
  const token = (await cookies()).get("token")?.value;

  const res = await fetch("http://localhost:3000/api/auth/me", {
    headers: {
      Cookie: `token=${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) redirect("/login");

  const json = await res.json();
  const user = json.data;

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <p>Your role: {user.role}</p>
    </div>
  );
};
export default Home;
