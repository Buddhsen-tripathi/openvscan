import Logo from "../Logo";
import { Input } from "../ui/Input";
import Link from "next/link";
import { FaGithub, FaGoogle } from "react-icons/fa";

const RegisterComponent = () => {
  return (
    <form
      action=""
      className="m-auto h-fit w-full max-w-sm overflow-hidden rounded-md border border-neutral-200 bg-white shadow-md shadow-zinc-950/5"
    >
      <div className="p-6">
        <div className="flex items-center justify-center gap-3">
          <Link href="/" aria-label="go home" className="block w-fit">
            <Logo width={60} height={40} />
          </Link>
          <h1 className="text-lg font-semibold text-neutral-900">
            Create your account
          </h1>
        </div>

        {/* Fields */}
        <div className="mt-2 space-y-6">
          <Input id="email" type="email" label="Email" name="email" required />

          <Input
            id="password"
            type="password"
            label="Password"
            name="password"
            required
          />

          <Input
            id="confirm-password"
            type="text"
            label="Confirm Password"
            name="confirm-password"
            required
          />

          <button className="w-full rounded-lg border border-neutral-300 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Sign Up
          </button>
        </div>

        {/* Divider */}
        <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <hr className="border-dashed border-neutral-300" />
          <span className="text-muted-foreground text-xs">Or sign up with</span>
          <hr className="border-dashed border-neutral-300" />
        </div>

        {/* Social buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100">
            <FaGoogle className="h-4 w-4" />
            <span>Google</span>
          </button>
          <button className="flex items-center justify-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100">
            <FaGithub className="h-4 w-4" />
            <span>GitHub</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-neutral-200 p-3">
        <p className="text-center text-sm text-neutral-700">
          Already have an account?
          <Link href="/login" className="ml-1 underline hover:text-primary">
            Sign in
          </Link>
        </p>
      </div>
    </form>
  );
};

export default RegisterComponent;
