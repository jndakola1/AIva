import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

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
        "flex items-start gap-3",
        !isAi && "flex-row-reverse"
      )}
    >
      <Avatar className="h-9 w-9 border shadow-sm">
        <AvatarFallback className={cn(isAi ? "bg-secondary" : "bg-primary text-primary-foreground")}>
          {isAi ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "rounded-lg p-3 max-w-[85%] sm:max-w-[70%] shadow-sm",
          isAi
            ? "bg-card text-card-foreground"
            : "bg-primary text-primary-foreground"
        )}
      >
        {isLoading ? (
          <div className="flex items-center space-x-1 p-1">
            <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 rounded-full bg-current animate-bounce" />
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm">{content}</p>
        )}
      </div>
    </div>
  );
}
