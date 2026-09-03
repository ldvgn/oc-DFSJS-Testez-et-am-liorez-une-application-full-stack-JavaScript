import type { Session } from "../types";
import { DescriptionItem } from "./DescriptionItem";

type SessionMetaProps = {
  session: Session;
  /** Shows the date in long format (e.g. "Monday, January 5, 2026") instead of the short format. */
  longDate?: boolean;
  className?: string;
};

export function SessionMeta({
  session,
  longDate = false,
  className,
}: SessionMetaProps) {
  const date = new Date(session.date).toLocaleDateString(
    "en-US",
    longDate
      ? { weekday: "long", year: "numeric", month: "long", day: "numeric" }
      : undefined,
  );

  return (
    <dl
      className={["text-gray-600 space-y-2", className]
        .filter(Boolean)
        .join(" ")}
    >
      <DescriptionItem label="Date" layout="inline">
        {date}
      </DescriptionItem>
      <DescriptionItem label="Teacher" layout="inline">
        {session.teacher.firstName} {session.teacher.lastName}
      </DescriptionItem>
      <DescriptionItem label="Participants" layout="inline">
        {session.users.length}
      </DescriptionItem>
    </dl>
  );
}
