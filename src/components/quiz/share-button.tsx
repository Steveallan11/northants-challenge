"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function ShareButton({
  title,
  text,
  url,
  className,
}: {
  title: string;
  text: string;
  url: string;
  className?: string;
}) {
  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      toast.error("Share cancelled");
    }
  }

  return (
    <Button type="button" variant="secondary" className={className} onClick={handleShare}>
      <Share2 className="mr-2 h-4 w-4" />
      Share
    </Button>
  );
}
