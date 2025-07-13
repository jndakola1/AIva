import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Bot, User, BadgeCheck, BrainCircuit, Volume2, Loader2 } from "lucide-react";
import Image from "next/image";
import type { SelfReviewOutput } from "@/ai/flows/self-review";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";


type ChatMessageProps = {
  id: string;
  role: "You" | "AI";
  content: string;
  isLoading?: boolean;
  imageUrl?: string;
  altText?: string;
  dataAiHint?: string;
  review?: SelfReviewOutput;
  onPlayAudio?: (messageId: string, text: string) => void;
  isSpeaking?: boolean;
};

const ReviewPopover = ({ review }: { review: SelfReviewOutput }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Badge variant="outline" className="cursor-pointer ml-2 border-green-500/40 bg-green-500/10 text-green-700 hover:bg-green-500/20">
        <BadgeCheck className="h-3 w-3 mr-1" />
        Reviewed
      </Badge>
    </PopoverTrigger>
    <PopoverContent className="w-80 text-sm">
      <div className="grid gap-4">
        <div className="space-y-2">
          <h4 className="font-medium leading-none flex items-center">
            <BrainCircuit className="h-4 w-4 mr-2" />
            AI Self-Review
          </h4>
          <p className="text-xs text-muted-foreground">
            Aiva reviews its own responses for quality and accuracy.
          </p>
        </div>
        <div className="space-y-2">
           <p><span className="font-semibold">Evaluation:</span> {review.summaryEvaluation}</p>
           {review.issuesFound && <p><span className="font-semibold">Issues:</span> {review.issuesFound}</p>}
           {review.suggestedFixes && <p><span className="font-semibold">Fixes:</span> {review.suggestedFixes}</p>}
           <p><span className="font-semibold">Verdict:</span> {review.finalVerdict}</p>
        </div>
      </div>
    </PopoverContent>
  </Popover>
);


export default function ChatMessage({ id, role, content, isLoading, imageUrl, altText, dataAiHint, review, onPlayAudio, isSpeaking }: ChatMessageProps) {
  const isAi = role === "AI";
  return (
    <div className="flex items-start gap-4 group">
      <Avatar className="h-8 w-8 border border-border">
          <AvatarFallback className={cn(isAi ? "bg-card text-foreground" : "bg-primary text-primary-foreground")}>
              {isAi ? <Bot size={18} /> : <User size={18}/>}
          </AvatarFallback>
      </Avatar>
      <div className="flex-1 pt-0.5 space-y-2">
        <div className="font-semibold flex items-center">
          {isAi ? "Aiva" : "You"}
          {isAi && review && <ReviewPopover review={review} />}
        </div>
        <div className="text-foreground/90 relative pr-10">
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
               {isAi && content && onPlayAudio && (
                <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground"
                    onClick={() => onPlayAudio(id, content)}
                    disabled={isSpeaking && !isSpeaking}
                  >
                    {isSpeaking ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
