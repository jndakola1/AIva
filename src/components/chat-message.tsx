import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import Image from "next/image";

type ChatMessageProps = {
  role: "You" | "AI";
  content: string;
  isLoading?: boolean;
  imageUrl?: string;
  altText?: string;
  dataAiHint?: string;
};

export default function ChatMessage({ role, content, isLoading, imageUrl, altText, dataAiHint }: ChatMessageProps) {
  const isAi = role === "AI";
  return (
    <div className="flex items-start gap-4">
      <Avatar className="h-8 w-8 border border-border">
          <AvatarFallback className={cn(isAi ? "bg-card text-foreground" : "bg-primary text-primary-foreground")}>
              {isAi ? <Bot size={18} /> : <User size={18}/>}
          </AvatarFallback>
      </Avatar>
      <div className="flex-1 pt-0.5 space-y-2">
        <p className="font-semibold">{isAi ? "Aiva" : "You"}</p>
        <div className="text-foreground/90">
          {isLoading ? (
            <div className="flex items-center space-x-1 p-1">
                <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 rounded-full bg-current animate-bounce" />
            </div>
          ) : (
            <>
              {content && <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>}
              {imageUrl && (
                <div className="mt-2">
                  <Image
                    src={imageUrl}
                    alt={altText || "AI generated image"}
                    width={600}
                    height={400}
                    className="rounded-lg border border-border"
                    data-ai-hint={dataAiHint}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
