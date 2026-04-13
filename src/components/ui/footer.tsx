import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FooterComponent() {
  return (
    <>
      <footer className="border-t py-6 md:px-7">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">© 2025 MoodFlix. All rights reserved.</p>
          <div className="flex gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/privacy">Privacy</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/terms">Terms</Link>
            </Button>
          </div>
        </div>
      </footer>
    </>
  );
}
