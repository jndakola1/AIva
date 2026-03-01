import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Bot, User, BadgeCheck, BrainCircuit, Volume2, Loader2, Film } from "lucide-react";
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
      <Badge variant="outline" className="cursor-pointer ml-2 border-green-500/40 bg-green-500/10 text-green-700 hover:bg-green-500/20 shadow-sm transition-all">
        <BadgeCheck className="h-3 w-3 mr-1" />
        Reviewed
      </Badge>
    </PopoverTrigger>
    <PopoverContent className="w-80 text-sm">
      <div className="grid gap-4">
        <div className="space-y-2">
          <h4 className="font-medium leading-none flex items-center">
            <BrainCircuit className="h-4 w-4 mr-2 text-primary" />
            AI Self-Review
          </h4>
          <p className="text-xs text-muted-foreground">
            Aiva reviews its own responses for quality and accuracy.
          </p>
        </div>
        <div className="space-y-2 bg-muted/40 p-3 rounded-lg text-xs leading-relaxed">
           <p><span className="font-semibold text-primary">Evaluation:</span> {review.summaryEvaluation}</p>
           {review.issuesFound && <p><span className="font-semibold text-primary">Issues:</span> {review.issuesFound}</p>}
           {review.suggestedFixes && <p><span className="font-semibold text-primary">Fixes:</span> {review.suggestedFixes}</p>}
           <p><span className="font-semibold text-primary">Verdict:</span> {review.finalVerdict}</p>
        </div>
      </div>
    </PopoverContent>
  </Popover>
);


export default function ChatMessage({ id, role, content, isLoading, imageUrl, altText, dataAiHint, review, onPlayAudio, isSpeaking }: ChatMessageProps) {
  const isAi = role === "AI";
  const isVideo = imageUrl?.startsWith('data:video/mp4');

  return (
    <div className="flex items-start gap-4 group animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Avatar className="h-9 w-9 border border-border shadow-sm">
          <AvatarFallback className={cn(isAi ? "bg-card text-foreground" : "bg-primary text-primary-foreground shadow-inner")}>
              {isAi ? <Bot size={20} /> : <User size={20}/>}
          </AvatarFallback>
      </Avatar>
      <div className="flex-1 pt-0.5 space-y-2">
        <div className="font-semibold flex items-center text-sm md:text-base">
          {isAi ? "Aiva" : "You"}
          {isAi && review && <ReviewPopover review={review} />}
        </div>
        <div className="text-foreground/90 relative pr-10">
          {isLoading ? (
            <div className="flex items-center space-x-1.5 p-2 bg-muted/30 rounded-full w-fit">
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
            </div>
          ) : (
            <>
              {content && <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">{content}</p>}
              {imageUrl && (
                <div className="mt-3 relative group/media overflow-hidden rounded-xl border border-border shadow-md">
                  {isVideo ? (
                    <video 
                      src={imageUrl} 
                      controls 
                      className="w-full h-auto aspect-video bg-black"
                      poster="/video-placeholder.png"
                    />
                  ) : (
                    <Image
                      src={imageUrl}
                      alt={altText || "AI generated media"}
                      width={600}
                      height={400}
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover/media:scale-105"
                      data-ai-hint={dataAiHint}
                    />
                  )}
                  {isVideo && (
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md rounded-full p-2 text-white shadow-lg">
                      <Film className="h-4 w-4" />
                    </div>
                  )}
                </div>
              )}
               {isAi && content && onPlayAudio && (
                <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-full", isSpeaking && "text-primary animate-pulse")}
                    onClick={() => onPlayAudio(id, content)}
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
