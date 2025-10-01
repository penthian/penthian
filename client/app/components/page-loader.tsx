import Image from "next/image"

const PageLoader = () => {
  return (
    <div className="z-50 flex min-h-screen w-full items-center justify-center bg-cream">
      <Image
        src="/assets/logo.svg"
        alt="Logo"
        width={250}
        height={60}
        className="md:w-[200px] w-[150px] animate-pulse"
      />
    </div>
  )
}

export default PageLoader