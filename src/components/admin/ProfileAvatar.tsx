import Image from "next/image";

type Props = {
  name: string;
  avatarUrl: string | null;
  size?: "sm" | "lg";
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ProfileAvatar({ name, avatarUrl, size = "lg" }: Props) {
  const sizeClass = size === "lg" ? "h-20 w-20 text-2xl" : "h-9 w-9 text-xs";

  if (avatarUrl) {
    return (
      <div className={`relative overflow-hidden rounded-full bg-tarto-red ${sizeClass}`}>
        <Image src={avatarUrl} alt={`${name} profile photo`} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-tarto-red font-bold text-white ${sizeClass}`}
    >
      {initials(name) || "TC"}
    </div>
  );
}
