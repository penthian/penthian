import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default function Home() {
  const headersList = headers();
  const url = new URL(headersList.get("x-url") || "", "http://localhost:3000"); // fallback base URL for local dev
  console.log("🚀 ~ Home ~ url:", url)

  const query = url.search; // e.g., ?ref=abc
  const target = `/dashboard/primary-marketplace${query}`;

  redirect(target);
}


// import { redirect } from "next/navigation";

// export default function Home() {
//   redirect("/dashboard/primary-marketplace");
// }