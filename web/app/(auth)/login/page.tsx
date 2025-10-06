import LoginComponent from "@/components/auth/Login";

export default function LoginPage() {
  return (
    <section className="flex min-h-screen bg-zinc-50">
      {/* 
      <div className="hidden md:flex flex-1 items-center justify-center p-6 border-r border-neutral-200 bg-white">
        <Image
          src="/images/product-preview.png"
          alt="Product preview"
          width={700}
          height={700}
          className="rounded-lg shadow-lg object-contain max-h-[80vh]"
          priority
        />
      </div> */}

      <div className="w-full px-4 flex items-center justify-center">
        <LoginComponent />
      </div>
    </section>
  );
}
