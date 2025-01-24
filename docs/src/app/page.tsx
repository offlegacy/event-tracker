import { Image } from "nextra/components";

export const metadata = {};

export default function Page() {
  return (
    <div>
      <Image src="/logo.jpg" alt="logo" width={300} height={300} />
    </div>
  );
}
