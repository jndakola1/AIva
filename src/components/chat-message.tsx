import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type ChatMessageProps = {
  role: "You" | "AI";
  content: string;
  isLoading?: boolean;
};

export default function ChatMessage({ role, content, isLoading }: ChatMessageProps) {
  const isAi = role === "AI";
  return (
    <div
      className={cn(
        "p-4 rounded-lg -mx-4",
        !isAi && "bg-muted"
      )}
    >
      <div className="flex items-start gap-4">
        <Avatar className="h-8 w-8 border border-border">
            <AvatarFallback className={cn(isAi ? "bg-card" : "bg-primary text-primary-foreground")}>
                {isAi ? "A" : "Y"}
            </AvatarFallback>
        </Avatar>
        <div className="flex-1 pt-0.5">
          <p className="font-semibold">{isAi ? "Aiva" : "You"}</p>
          <div className="mt-1">
            {isLoading ? (
              <div className="flex items-center space-x-1 p-1">
                  <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 rounded-full bg-current animate-bounce" />
              </div>
            ) : (
              <p className="whitespace-pre-wrap text-sm text-foreground/90">{content}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
