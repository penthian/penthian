import Image from "next/image";
import Link from "next/link";
import { Button } from "./components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col gap-6 items-center justify-center p-6">
      <div className="flex">
        <Image
          src="/assets/logo.svg"
          alt="Logo"
          width={250}
          height={60}
          className="md:w-[200px] w-[150px]"
        />
      </div>
      <h2 className="font-semibold text-4xl text-gray-800">Page Not Found</h2>
      <p className="mt-2 text-lg text-gray-600">
        We couldn’t find the page you were looking for. It might have been moved or deleted.
      </p>
      <Link href="/" passHref>
        <Button>
          Back to Home
        </Button>
      </Link>
    </div>
  );
}
