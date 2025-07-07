
'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import ChatInterface from "@/components/chat-interface";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, List, MessageSquare, PlusSquare, Sun, Waves } from "lucide-react";
import Link from "next/link";


export default function DashboardPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 bg-primary text-primary-foreground">
                <AvatarFallback>
                  <Bot />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-lg">Aiva AI</span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
               <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Chat" isActive={true}>
                  <Link href="/dashboard">
                    <MessageSquare />
                    <span>Chat</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Categories">
                  <Link href="/categories">
                    <List />
                    <span>Categories</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="New Prompt">
                  <Link href="/new-prompt">
                    <PlusSquare />
                    <span>New Prompt</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Weather Assistant">
                  <Link href="/weather">
                    <Sun />
                    <span>Weather</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Audio Input">
                  <Link href="/audio">
                    <Waves />
                    <span>Audio</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="p-4 border-b flex items-center gap-4 sticky top-0 bg-background z-10">
              <SidebarTrigger className="md:hidden"/>
              <h1 className="text-lg font-semibold">Chat</h1>
          </header>
          <div className="h-[calc(100vh-57px)]">
            <ChatInterface />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
