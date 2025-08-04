import { cookies } from "next/headers";
import ForumPostList from "@/components/forum/forum-list";
import { ForumPost } from "@/lib/types";

const ForumPage = async () => {
  let forumPosts: ForumPost[];
  const cookieHeader = (await cookies()).toString();
  try {
    const res = await fetch(`${process.env.NEXT_ROUTE_URL}//api/forum`, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });
    const resData = await res.json();
    forumPosts = resData.data;
  } catch (error) {
    console.log(error);
    throw new Error("Error while fetching the forum list");
  }

  return (
    <>
      <ForumPostList posts={forumPosts} />
    </>
  );
};
export default ForumPage;
