import { createFileRoute, useRouter } from "@tanstack/react-router";
import { CheckCircle2, KeyRound, Loader2, User } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "@/components/AppImage";
import { AuthError, AuthSuccess } from "@/components/auth/AuthShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/Input";
import {
  useChangePasswordMutation,
  useProfileQuery,
  useUpdateProfileMutation,
} from "@/lib/api";

export const Route = createFileRoute("/dashboard/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { data: profile, isLoading } = useProfileQuery();

  return (
    <>
      <PageHeader
        title="Profile"
        description="Manage your account details and password."
      />

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-6">
          {isLoading || !profile ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 size={20} className="animate-spin" />
            </div>
          ) : (
            <>
              <ProfileCard profile={profile} />
              {profile.hasPassword ? (
                <PasswordCard />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <KeyRound size={18} className="text-muted-foreground" />
                      Password
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Your account signs in with GitHub, so there's no password
                      to manage here.
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}

function ProfileCard({
  profile,
}: {
  profile: {
    name: string;
    email: string;
    image: string | null;
    emailVerified: boolean;
    createdAt: string | Date;
  };
}) {
  const router = useRouter();
  const update = useUpdateProfileMutation();
  const [name, setName] = useState(profile.name);
  const [image, setImage] = useState(profile.image ?? "");
  const [saved, setSaved] = useState(false);

  // Keep local fields in sync if the query refetches.
  useEffect(() => {
    setName(profile.name);
    setImage(profile.image ?? "");
  }, [profile.name, profile.image]);

  const dirty =
    name.trim() !== profile.name || image.trim() !== (profile.image ?? "");
  const memberSince = new Date(profile.createdAt).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <User size={18} className="text-muted-foreground" />
          Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            setSaved(false);
            update.mutate(
              { name: name.trim(), image: image.trim() || null },
              {
                onSuccess: () => {
                  setSaved(true);
                  // Refresh the dashboard layout so the sidebar reflects changes.
                  router.invalidate();
                },
              },
            );
          }}
        >
          {update.isError && (
            <AuthError
              message={
                update.error instanceof Error
                  ? update.error.message
                  : "Could not update profile"
              }
            />
          )}
          {saved && !dirty && <AuthSuccess message="Profile updated." />}

          <div className="flex items-center gap-4">
            {image.trim() ? (
              <Image
                src={image.trim()}
                alt={name}
                width={56}
                height={56}
                className="size-14 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-14 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                {name.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
            <div className="text-sm text-muted-foreground">
              Member since {memberSince}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="image">Avatar URL</Label>
            <Input
              id="image"
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://…/avatar.png"
            />
            <p className="text-xs text-muted-foreground">
              Link to an image. Leave blank to use your initial.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="flex items-center gap-2">
              <Input id="email" value={profile.email} disabled />
              {profile.emailVerified && (
                <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-status-completed">
                  <CheckCircle2 size={14} />
                  Verified
                </span>
              )}
            </div>
          </div>

          <Button type="submit" disabled={!dirty || update.isPending}>
            {update.isPending ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordCard() {
  const change = useChangePasswordMutation();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <KeyRound size={18} className="text-muted-foreground" />
          Password
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            setDone(false);
            if (next.length < 8) {
              setError("New password must be at least 8 characters.");
              return;
            }
            if (next !== confirm) {
              setError("New passwords don't match.");
              return;
            }
            change.mutate(
              { currentPassword: current, newPassword: next },
              {
                onSuccess: () => {
                  setDone(true);
                  setCurrent("");
                  setNext("");
                  setConfirm("");
                },
                onError: (err) =>
                  setError(
                    err instanceof Error
                      ? err.message
                      : "Could not change password",
                  ),
              },
            );
          }}
        >
          {error && <AuthError message={error} />}
          {done && <AuthSuccess message="Password changed." />}

          <div className="space-y-1.5">
            <Label htmlFor="current-password">Current password</Label>
            <Input
              id="current-password"
              type="password"
              required
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              required
              value={next}
              onChange={(e) => setNext(e.target.value)}
              placeholder="At least 8 characters"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input
              id="confirm-password"
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={change.isPending}>
            {change.isPending ? "Changing…" : "Change password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
