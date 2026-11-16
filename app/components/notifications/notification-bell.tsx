"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconBell } from "@tabler/icons-react";

import { NOTIFICATION_TYPE } from "@/app/lib/receipts/receipt-lifecycle";
import type { NotificationView } from "@/app/lib/notifications/notification-api";
import { Dictionary } from "@/app/types/dictionary";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";

const POLL_INTERVAL_MS = 12_000;

type ListResponse = {
  notifications: NotificationView[];
  unreadCount: number;
};

export function NotificationBell({ dictionary }: { dictionary: Dictionary }) {
  const router = useRouter();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number | null>(null);
  const [items, setItems] = useState<NotificationView[] | null>(null);
  const [listStatus, setListStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const openRef = useRef(false);

  async function loadList(options?: { silent?: boolean }) {
    if (!options?.silent) {
      setListStatus("loading");
    }

    try {
      const response = await fetch("/api/notifications");
      if (!response.ok) {
        throw new Error("notifications");
      }
      const data = (await response.json()) as ListResponse;
      setItems(data.notifications);
      setUnreadCount(data.unreadCount);
      setListStatus("ready");
    } catch {
      setListStatus("error");
    }
  }

  useEffect(() => {
    let stopped = false;

    async function loadCount() {
      if (document.visibilityState !== "visible" || !isTriggerVisible(triggerRef.current)) {
        return;
      }

      try {
        const response = await fetch("/api/notifications/unread-count");
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as { unreadCount: number };
        if (stopped) {
          return;
        }
        setUnreadCount(data.unreadCount);
        if (openRef.current) {
          await loadList({ silent: true });
        }
      } catch {
        // The badge keeps the last count. The dropdown shows its own error.
      }
    }

    void loadCount();
    const timer = setInterval(() => {
      void loadCount();
    }, POLL_INTERVAL_MS);

    function onVisibility() {
      if (document.visibilityState === "visible") {
        void loadCount();
      }
    }

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stopped = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  function handleOpenChange(nextOpen: boolean) {
    openRef.current = nextOpen;
    setOpen(nextOpen);
    if (nextOpen) {
      void loadList();
    }
  }

  async function markRead(id: string) {
    const response = await fetch(`/api/notifications/${id}/read`, { method: "POST" });
    if (!response.ok) {
      throw new Error("read");
    }
  }

  async function markAllRead() {
    const response = await fetch("/api/notifications/read-all", { method: "POST" });
    if (!response.ok) {
      setListStatus("error");
      return;
    }
    setItems((current) =>
      current?.map((item) => ({
        ...item,
        readAt: item.readAt ?? new Date().toISOString(),
      })) ?? current,
    );
    setUnreadCount(0);
  }

  async function openNotification(item: NotificationView) {
    try {
      if (!item.readAt) {
        await markRead(item.id);
        setUnreadCount((current) => Math.max(0, (current ?? 1) - 1));
        setItems((current) =>
          current?.map((entry) =>
            entry.id === item.id
              ? { ...entry, readAt: entry.readAt ?? new Date().toISOString() }
              : entry,
          ) ?? current,
        );
      }
    } catch {
      setListStatus("error");
      return;
    }

    if (item.href) {
      setOpen(false);
      openRef.current = false;
      router.push(item.href);
    }
  }

  const badge = unreadCount && unreadCount > 0 ? (unreadCount > 9 ? "9+" : String(unreadCount)) : null;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          type="button"
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={dictionary.notifications.open}
        >
          <IconBell />
          {badge ? (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
              {badge}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <PopoverHeader className="border-b px-3 py-3">
          <div className="flex items-center justify-between gap-3">
            <PopoverTitle>{dictionary.notifications.title}</PopoverTitle>
            {unreadCount && unreadCount > 0 ? (
              <Button type="button" variant="ghost" size="xs" onClick={() => void markAllRead()}>
                {dictionary.notifications.markAllRead}
              </Button>
            ) : null}
          </div>
          <PopoverDescription className="sr-only">
            {dictionary.notifications.title}
          </PopoverDescription>
        </PopoverHeader>

        <div className="max-h-80 overflow-y-auto">
          {listStatus === "loading" && !items ? (
            <div className="flex items-center gap-2 px-3 py-6 text-sm text-muted-foreground">
              <Spinner />
              {dictionary.notifications.loading}
            </div>
          ) : null}

          {listStatus === "error" ? (
            <div className="space-y-3 px-3 py-6">
              <p className="text-sm text-muted-foreground">{dictionary.notifications.error}</p>
              <Button type="button" variant="outline" size="sm" onClick={() => void loadList()}>
                {dictionary.notifications.retry}
              </Button>
            </div>
          ) : null}

          {listStatus !== "error" && items && items.length === 0 ? (
            <p className="px-3 py-6 text-sm text-muted-foreground">{dictionary.notifications.empty}</p>
          ) : null}

          {listStatus !== "error" && items && items.length > 0 ? (
            <ul>
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={
                      item.readAt
                        ? "flex w-full flex-col gap-1 px-3 py-3 text-left text-sm hover:bg-accent"
                        : "flex w-full flex-col gap-1 bg-accent/40 px-3 py-3 text-left text-sm hover:bg-accent"
                    }
                    onClick={() => void openNotification(item)}
                  >
                    <span className="font-medium">{notificationLabel(item, dictionary)}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function isTriggerVisible(trigger: HTMLButtonElement | null) {
  return trigger !== null && trigger.getClientRects().length > 0;
}

function notificationLabel(item: NotificationView, dictionary: Dictionary) {
  if (item.type === NOTIFICATION_TYPE.EXTRACTION_SUCCEEDED) {
    return dictionary.notifications.extractionSucceeded;
  }
  if (item.type === NOTIFICATION_TYPE.EXTRACTION_FAILED) {
    return dictionary.notifications.extractionFailed;
  }
  return item.messageKey;
}
